from build import icon

def content():
    return f"""
<section class="hero">
  <div class="container hero-grid">
    <div>
      <span class="eyebrow gold">{icon('sparkle')} AI-Powered &middot; Curriculum-Aligned &middot; Made for Nigeria</span>
      <h1>Learn smarter. Prepare better. Succeed with confidence.</h1>
      <p class="lead">PrepWise pairs a personal AI tutor with a full WAEC, NECO, JAMB and Common Entrance question bank &mdash; so every Nigerian student, from Primary&nbsp;1 to final year, walks into the exam hall ready.</p>
      <div class="hero-cta">
        <a href="register.html" class="btn btn-primary">Get Started Free {icon('arrow')}</a>
        <a href="ai-assistant.html" class="btn btn-outline-light">Try the AI Tutor</a>
        <a href="cbt-exam.html" class="btn btn-outline-light">Practice a CBT Exam</a>
      </div>
      <div class="hero-stats">
        <div><strong data-count="120000" data-suffix="+">0</strong><span>Students learning on PrepWise</span></div>
        <div><strong data-count="45000" data-suffix="+">0</strong><span>Past questions with AI explanations</span></div>
        <div><strong data-count="860" data-suffix="+">0</strong><span>Partner schools nationwide</span></div>
      </div>
    </div>
    <div class="exam-ticket">
      <div class="exam-ticket-head">
        <div>
          <span class="code">CANDIDATE SESSION / WAEC-MATH-2026</span>
          <h3 style="margin-top:6px;">Live AI Tutor Session</h3>
        </div>
        <span class="badge-live">In session</span>
      </div>
      <div class="exam-ticket-body">
        <div class="exam-ticket-row"><span>Subject</span><span>Mathematics</span></div>
        <div class="exam-ticket-row"><span>Topic</span><span>Simultaneous Equations</span></div>
        <div class="exam-ticket-row"><span>AI confidence in you</span><span style="color:var(--emerald);">82%</span></div>
        <div class="exam-ticket-row"><span>Countdown to WAEC 2026</span><span data-countdown="2026-05-04T08:00:00" class="mono">--</span></div>
        <div class="exam-ticket-row"><span>Next revision</span><span>Today, 6:00 PM</span></div>
      </div>
    </div>
  </div>
</section>

<section class="stats-band section-tight">
  <div class="container">
    <div class="grid">
      <div><strong data-count="98" data-suffix="%">0</strong><span>Students who felt exam-ready</span></div>
      <div><strong data-count="30" data-suffix="+">0</strong><span>Nigerian exams &amp; certifications supported</span></div>
      <div><strong data-count="24" data-suffix="/7">0</strong><span>AI tutor availability</span></div>
      <div><strong data-count="18" data-suffix=" languages">0</strong><span>Including Yoruba, Hausa &amp; Igbo voice tutoring</span></div>
    </div>
  </div>
</section>

<section class="section" id="audience">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow blue">Built for every stage</span>
      <h2>One platform, every stage of the Nigerian classroom</h2>
      <p>From a Primary 1 reading drill to a final-year semester exam, PrepWise adapts its AI tutoring, question banks and dashboards to exactly where each learner is.</p>
    </div>
    <div class="tabs" data-tabs role="tablist">
      <button class="tab-btn active" data-target="primary">Primary School</button>
      <button class="tab-btn" data-target="secondary">Secondary School</button>
      <button class="tab-btn" data-target="tertiary">Tertiary</button>
      <button class="tab-btn" data-target="parents">Parents</button>
      <button class="tab-btn" data-target="teachers">Teachers</button>
      <button class="tab-btn" data-target="schools">Schools</button>
    </div>

    <div class="tab-panel active" data-panel="primary" id="primary">
      <div class="two-col">
        <div>
          <span class="eyebrow">Primary 1 &ndash; 6</span>
          <h2>Friendly AI tutoring that makes homework feel like play</h2>
          <p>Young learners get a patient AI Homework Helper, guided reading practice, and playful drills in Mathematics, English and Basic Science &mdash; with parents watching progress in real time.</p>
          <ul class="list-check">
            <li>{icon('check')} AI Homework Helper for every subject</li>
            <li>{icon('check')} Reading practice with pronunciation feedback</li>
            <li>{icon('check')} Mathematics, English &amp; Science tutors</li>
            <li>{icon('check')} Interactive learning games</li>
            <li>{icon('check')} Parent monitoring dashboard</li>
          </ul>
          <a href="register.html" class="btn btn-primary">Start Primary Plan</a>
        </div>
        <div class="grid grid-2">
          <div class="card"><div class="icon-tile">{icon('book')}</div><h3>Homework Helper</h3><p>Snap a photo of any assignment and get a step-by-step explanation in seconds.</p></div>
          <div class="card"><div class="icon-tile emerald">{icon('mic')}</div><h3>Reading Practice</h3><p>AI listens as your child reads aloud and gently corrects pronunciation.</p></div>
          <div class="card"><div class="icon-tile gold">{icon('trophy')}</div><h3>Learning Games</h3><p>Points, badges and streaks that make early learning genuinely fun.</p></div>
          <div class="card"><div class="icon-tile">{icon('users')}</div><h3>Parent Monitoring</h3><p>Weekly reports so you always know how your child is progressing.</p></div>
        </div>
      </div>
    </div>

    <div class="tab-panel" data-panel="secondary" id="secondary">
      <div class="two-col">
        <div>
          <span class="eyebrow">JSS1 &ndash; SS3</span>
          <h2>Purpose-built for BECE, WAEC, NECO, NABTEB and JAMB</h2>
          <p>A full past-questions bank with AI explanations, timed CBT mocks, and an AI Exam Predictor that tells students exactly which topics need more attention before the real exam.</p>
          <ul class="list-check">
            <li>{icon('check')} Common Entrance, BECE, WAEC, NECO &amp; NABTEB coverage</li>
            <li>{icon('check')} JAMB UTME &amp; Post-UTME practice</li>
            <li>{icon('check')} AI Exam Predictor with likely-score estimates</li>
            <li>{icon('check')} Timed CBT mock exams with instant grading</li>
            <li>{icon('check')} Personalised revision timetables</li>
          </ul>
          <a href="register.html" class="btn btn-primary">Start Secondary Plan</a>
        </div>
        <div class="grid grid-2">
          <div class="card"><div class="icon-tile">{icon('flag')}</div><h3>Exam Predictor</h3><p>See your projected WAEC and JAMB score, updated after every practice session.</p></div>
          <div class="card"><div class="icon-tile emerald">{icon('clock')}</div><h3>Timed CBT Mocks</h3><p>Sit realistic, timed exams that mirror the real JAMB and WAEC CBT interface.</p></div>
          <div class="card"><div class="icon-tile gold">{icon('target')}</div><h3>Weak-Area Tracker</h3><p>The AI flags exactly which topics are costing you marks.</p></div>
          <div class="card"><div class="icon-tile">{icon('chart')}</div><h3>Daily Revision Plan</h3><p>An adaptive countdown planner built around your exam date.</p></div>
        </div>
      </div>
    </div>

    <div class="tab-panel" data-panel="tertiary" id="tertiary">
      <div class="two-col">
        <div>
          <span class="eyebrow">Universities &middot; Polytechnics &middot; Colleges of Education</span>
          <h2>An AI research partner for degree-level work</h2>
          <p>Summarise long textbook chapters, generate citations, build flashcards from lecture notes, and get an AI Tutor that explains coursework the way a great teaching assistant would.</p>
          <ul class="list-check">
            <li>{icon('check')} Assignment &amp; research assistant</li>
            <li>{icon('check')} Automatic citation generator</li>
            <li>{icon('check')} Note summariser &amp; flashcard builder</li>
            <li>{icon('check')} Semester revision planner</li>
            <li>{icon('check')} Support for nursing, professional &amp; GST courses</li>
          </ul>
          <a href="register.html" class="btn btn-primary">Start Tertiary Plan</a>
        </div>
        <div class="grid grid-2">
          <div class="card"><div class="icon-tile">{icon('doc')}</div><h3>Research Assistant</h3><p>Upload a PDF textbook and ask questions directly against its content.</p></div>
          <div class="card"><div class="icon-tile emerald">{icon('layers')}</div><h3>Flashcard Builder</h3><p>Turn any set of notes into spaced-repetition flashcards in one click.</p></div>
          <div class="card"><div class="icon-tile gold">{icon('chat')}</div><h3>Citation Generator</h3><p>APA, MLA and Harvard references generated automatically.</p></div>
          <div class="card"><div class="icon-tile">{icon('clock')}</div><h3>Semester Planner</h3><p>A revision calendar built around your exact exam timetable.</p></div>
        </div>
      </div>
    </div>

    <div class="tab-panel" data-panel="parents" id="parents-tab">
      <div class="two-col">
        <div>
          <span class="eyebrow">For Parents</span>
          <h2>Total visibility into your child's learning</h2>
          <p>Track study hours, attendance, performance trends and get AI recommendations for how to support your child at home &mdash; all from one dashboard.</p>
          <a href="parents.html" class="btn btn-primary">Explore Parent Dashboard</a>
        </div>
        <div class="card"><div class="icon-tile">{icon('chart')}</div><h3>Progress Reports</h3><p>Monthly performance reports delivered straight to your phone via WhatsApp or email.</p></div>
      </div>
    </div>

    <div class="tab-panel" data-panel="teachers" id="teachers-tab">
      <div class="two-col">
        <div>
          <span class="eyebrow">For Teachers</span>
          <h2>Cut lesson prep time in half</h2>
          <p>Generate lesson plans, question papers and CBT tests in minutes, then track every student's performance from one analytics dashboard.</p>
          <a href="teachers.html" class="btn btn-primary">Explore Teacher Tools</a>
        </div>
        <div class="card"><div class="icon-tile emerald">{icon('doc')}</div><h3>AI Lesson Planner</h3><p>Curriculum-aligned lesson plans and question papers, generated on demand.</p></div>
      </div>
    </div>

    <div class="tab-panel" data-panel="schools" id="schools-tab">
      <div class="two-col">
        <div>
          <span class="eyebrow">For Schools</span>
          <h2>Run your whole institution on one platform</h2>
          <p>Manage students, teachers, subjects, CBT exams and results with school-wide AI insights into performance trends.</p>
          <a href="schools.html" class="btn btn-primary">Explore School Plan</a>
        </div>
        <div class="card"><div class="icon-tile gold">{icon('layers')}</div><h3>Institution Dashboard</h3><p>One control centre for every student, teacher and subject in your school.</p></div>
      </div>
    </div>
  </div>
</section>

<section class="section" style="background:var(--panel);">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Why PrepWise</span>
      <h2>Everything a Nigerian student needs to walk in ready</h2>
    </div>
    <div class="grid grid-3">
      <div class="card"><span class="paper-code">AI/TUTOR/01</span><div class="icon-tile">{icon('brain')}</div><h3>AI Study Assistant</h3><p>Ask any question, in any subject, and get a step-by-step explanation &mdash; day or night.</p></div>
      <div class="card"><span class="paper-code">CBT/ENGINE/02</span><div class="icon-tile emerald">{icon('clock')}</div><h3>Realistic CBT Exams</h3><p>Timed, auto-graded practice exams that feel exactly like the real WAEC and JAMB CBT hall.</p></div>
      <div class="card"><span class="paper-code">BANK/QSTN/03</span><div class="icon-tile gold">{icon('book')}</div><h3>Verified Question Bank</h3><p>Thousands of past questions across every subject, fully categorised by exam, year and topic.</p></div>
      <div class="card"><span class="paper-code">PLAN/STUDY/04</span><div class="icon-tile">{icon('chart')}</div><h3>Personalised Study Plans</h3><p>An AI-generated timetable that adapts daily to your strengths, weaknesses and exam date.</p></div>
      <div class="card"><span class="paper-code">FAM/WATCH/05</span><div class="icon-tile emerald">{icon('users')}</div><h3>Parent &amp; Teacher Tools</h3><p>Dashboards that keep parents and teachers close to every student's progress.</p></div>
      <div class="card"><span class="paper-code">SEC/DATA/06</span><div class="icon-tile gold">{icon('shield')}</div><h3>Bank-Grade Security</h3><p>Encrypted data, two-factor authentication and NDPA-aware handling of every student record.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow blue">Examinations we cover</span>
      <h2>Every major Nigerian examination, in one place</h2>
    </div>
    <div class="chip-row" style="justify-content:center;">
      <span class="chip">Common Entrance</span><span class="chip">BECE</span><span class="chip">WAEC</span><span class="chip">NECO</span>
      <span class="chip">NABTEB</span><span class="chip">JAMB UTME</span><span class="chip">Post-UTME</span><span class="chip">GST Courses</span>
      <span class="chip">Semester Exams</span><span class="chip">IELTS</span><span class="chip">TOEFL</span><span class="chip">GRE</span>
      <span class="chip">GMAT</span><span class="chip">ICAN</span><span class="chip">ACCA</span><span class="chip">PMP</span><span class="chip">CIPM</span><span class="chip">NIM</span>
    </div>
    <p style="text-align:center;margin-top:24px;"><a href="examinations.html" class="btn btn-secondary">See all examination modules {icon('arrow')}</a></p>
  </div>
</section>

<section class="section" style="background:var(--panel);">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Success stories</span>
      <h2>Real students, real results</h2>
    </div>
    <div class="grid grid-3">
      <div class="testimonial">
        <div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
        <p>"I used the AI Tutor every evening for three months before WAEC. I moved from a C6 to an A1 in Mathematics."</p>
        <div class="who"><div class="avatar">CO</div><div><strong>Chiamaka O.</strong><span>SS3, Lagos &middot; WAEC 2025</span></div></div>
      </div>
      <div class="testimonial">
        <div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
        <p>"The CBT mock exams felt exactly like the real JAMB hall. Nothing on exam day surprised me."</p>
        <div class="who"><div class="avatar">TA</div><div><strong>Tunde A.</strong><span>JAMB Candidate &middot; Ibadan</span></div></div>
      </div>
      <div class="testimonial">
        <div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
        <p>"As a mum with two children in different classes, the parent dashboard saves me hours every week."</p>
        <div class="who"><div class="avatar">FB</div><div><strong>Funmi B.</strong><span>Parent &middot; Abuja</span></div></div>
      </div>
    </div>
  </div>
</section>

<section class="section-tight">
  <div class="container">
    <p style="text-align:center;color:var(--ink-soft);font-family:var(--font-mono);font-size:.8rem;letter-spacing:.06em;text-transform:uppercase;margin-bottom:22px;">Trusted by schools across Nigeria</p>
    <div class="badge-strip" style="justify-content:center;">
      <span>Greenfield College, Lagos</span><span>Kings Comprehensive, Abuja</span><span>St. Augustine's, Enugu</span>
      <span>Federal Science College, Ibadan</span><span>Unity Model School, Kano</span><span>Providence Academy, PH</span>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow gold">Pricing</span>
      <h2>Plans for every household and every school</h2>
    </div>
    <div class="grid grid-4">
      <div class="price-card">
        <h3>Free</h3><p>Get a feel for AI-powered learning.</p>
        <div class="amount">&#8358;0<small>/month</small></div>
        <ul><li>{icon('check')} 10 AI tutor questions / day</li><li>{icon('check')} Limited question bank</li><li>{icon('check')} 1 CBT mock exam / week</li></ul>
        <a href="register.html" class="btn btn-secondary btn-block">Start Free</a>
      </div>
      <div class="price-card featured">
        <span class="tag">Most Popular</span>
        <h3>Premium</h3><p>Full AI tutoring for exam candidates.</p>
        <div class="amount">&#8358;4,500<small>/month</small></div>
        <ul><li>{icon('check')} Unlimited AI tutor access</li><li>{icon('check')} Full question bank, all exams</li><li>{icon('check')} Unlimited CBT mocks</li><li>{icon('check')} AI Exam Predictor</li></ul>
        <a href="register.html" class="btn btn-primary btn-block">Start Premium</a>
      </div>
      <div class="price-card">
        <h3>Basic</h3><p>For steady, guided revision.</p>
        <div class="amount">&#8358;2,000<small>/month</small></div>
        <ul><li>{icon('check')} 60 AI tutor questions / day</li><li>{icon('check')} Full past questions bank</li><li>{icon('check')} 5 CBT mocks / week</li></ul>
        <a href="register.html" class="btn btn-secondary btn-block">Start Basic</a>
      </div>
      <div class="price-card">
        <h3>School</h3><p>For schools &amp; tutorial centres.</p>
        <div class="amount">Custom</div>
        <ul><li>{icon('check')} Institution dashboard</li><li>{icon('check')} Teacher &amp; CBT tools</li><li>{icon('check')} Bulk student licences</li></ul>
        <a href="contact.html" class="btn btn-secondary btn-block">Talk to Sales</a>
      </div>
    </div>
    <p style="text-align:center;margin-top:20px;"><a href="pricing.html">Compare all plans in detail {icon('arrow')}</a></p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="cta-band">
      <h2>Ready to learn smarter?</h2>
      <p>Join over 120,000 Nigerian students already preparing with PrepWise.</p>
      <div class="hero-cta" style="justify-content:center;">
        <a href="register.html" class="btn btn-primary">Create Free Account</a>
        <a href="ai-assistant.html" class="btn btn-outline-light">Try the AI Tutor</a>
      </div>
    </div>
  </div>
</section>
"""
