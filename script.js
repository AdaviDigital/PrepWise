/* PrepWise — shared front-end behaviour (no external dependencies) */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initDropdowns();
    initAccordions();
    initTabs();
    initThemeToggle();
    initBackToTop();
    initCountUp();
    initCountdown();
    initForms();
    initExamSim();
    markActiveNav();
  });

  /* Mobile nav toggle */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    var actions = document.querySelector('.nav-actions');
    if (!toggle || !links) return;
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      if (actions) actions.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* Mobile dropdown expand */
  function initDropdowns() {
    document.querySelectorAll('.has-dropdown > a').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (window.innerWidth <= 960) {
          e.preventDefault();
          link.parentElement.classList.toggle('open');
        }
      });
    });
  }

  /* FAQ accordions */
  function initAccordions() {
    document.querySelectorAll('.accordion-item').forEach(function (item) {
      var btn = item.querySelector('button');
      var body = item.querySelector('.accordion-body');
      if (!btn || !body) return;
      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');
        item.parentElement.querySelectorAll('.accordion-item').forEach(function (other) {
          other.classList.remove('open');
          other.querySelector('.accordion-body').style.maxHeight = null;
        });
        if (!isOpen) {
          item.classList.add('open');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    });
  }

  /* Generic tab groups: [data-tabs] wraps [data-tab-btn] + [data-tab-panel] */
  function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach(function (group) {
      var btns = group.querySelectorAll('.tab-btn');
      var panels = group.querySelectorAll('.tab-panel');
      btns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var target = btn.getAttribute('data-target');
          btns.forEach(function (b) { b.classList.remove('active'); });
          panels.forEach(function (p) { p.classList.remove('active'); });
          btn.classList.add('active');
          var panel = group.querySelector('.tab-panel[data-panel="' + target + '"]');
          if (panel) panel.classList.add('active');
        });
      });
    });
  }

  /* Dark / light theme toggle, persisted for the session */
  function initThemeToggle() {
    var toggle = document.querySelector('.theme-toggle');
    var saved = sessionStorage.getItem('prepwise-theme');
    if (saved === 'dark') document.body.classList.add('dark');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('dark');
      sessionStorage.setItem('prepwise-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });
  }

  /* Back to top button */
  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      btn.classList.toggle('show', window.scrollY > 500);
    });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* Animated stat counters: <strong data-count="12000">0</strong> */
  function initCountUp() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = 1400;
        var start = null;
        function step(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var value = Math.floor(progress * target);
          el.textContent = value.toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target.toLocaleString() + suffix;
        }
        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { observer.observe(c); });
  }

  /* Exam countdown ticker: <span data-countdown="2026-08-15T00:00:00"> */
  function initCountdown() {
    document.querySelectorAll('[data-countdown]').forEach(function (el) {
      var target = new Date(el.getAttribute('data-countdown')).getTime();
      function tick() {
        var now = Date.now();
        var diff = Math.max(target - now, 0);
        var days = Math.floor(diff / 86400000);
        var hours = Math.floor((diff % 86400000) / 3600000);
        var mins = Math.floor((diff % 3600000) / 60000);
        el.textContent = days + 'd ' + hours + 'h ' + mins + 'm';
      }
      tick();
      setInterval(tick, 60000);
    });
  }

  /* Client-side form validation + friendly "submitted" state (no backend attached) */
  function initForms() {
    document.querySelectorAll('form[data-validate]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var valid = true;
        form.querySelectorAll('[required]').forEach(function (field) {
          if (!field.value || (field.type === 'checkbox' && !field.checked)) {
            valid = false;
            field.style.borderColor = '#D64550';
          } else {
            field.style.borderColor = '';
          }
        });
        var note = form.querySelector('.form-status');
        if (!note) {
          note = document.createElement('p');
          note.className = 'form-status form-hint';
          form.appendChild(note);
        }
        if (valid) {
          note.style.color = '#16A987';
          note.textContent = 'Thank you — this demo form is not yet connected to a live server. Your details were validated successfully.';
          form.reset();
        } else {
          note.style.color = '#D64550';
          note.textContent = 'Please fill in all required fields before submitting.';
        }
      });
    });
  }

  /* Simple demo CBT question flow used on cbt-exam.html */
  function initExamSim() {
    var wrap = document.querySelector('[data-exam-sim]');
    if (!wrap) return;
    var questions = JSON.parse(wrap.getAttribute('data-questions'));
    var qIndex = 0;
    var score = 0;
    var qBody = wrap.querySelector('.exam-q-body');
    var qCounter = wrap.querySelector('.exam-q-counter');
    var qProgress = wrap.querySelector('.progress-bar span');
    var nextBtn = wrap.querySelector('.exam-next');
    var resultBox = wrap.querySelector('.exam-result');

    function render() {
      var q = questions[qIndex];
      qCounter.textContent = 'Question ' + (qIndex + 1) + ' of ' + questions.length;
      qProgress.style.width = (((qIndex) / questions.length) * 100) + '%';
      var html = '<h3>' + q.q + '</h3><div class="grid" style="gap:12px;margin-top:18px;">';
      q.options.forEach(function (opt, i) {
        html += '<label style="display:flex;gap:12px;align-items:center;border:1.5px solid var(--line);border-radius:10px;padding:14px;cursor:pointer;">' +
          '<input type="radio" name="exam-opt" value="' + i + '" style="width:auto;">' + opt + '</label>';
      });
      html += '</div>';
      qBody.innerHTML = html;
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        var checked = wrap.querySelector('input[name="exam-opt"]:checked');
        if (checked && parseInt(checked.value, 10) === questions[qIndex].correct) score++;
        qIndex++;
        if (qIndex < questions.length) {
          render();
        } else {
          qProgress.style.width = '100%';
          qBody.innerHTML = '';
          qCounter.textContent = 'Exam complete';
          resultBox.style.display = 'block';
          resultBox.querySelector('.score-value').textContent = score + ' / ' + questions.length;
          nextBtn.style.display = 'none';
        }
      });
      render();
    }
  }

  /* Highlight the current page in the nav */
  function markActiveNav() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === path) a.classList.add('active');
    });
  }
})();
