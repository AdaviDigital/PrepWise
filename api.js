/* PrepWise — shared API client.
   Loaded on every page (after config.js, before script.js). Exposes a
   single `PW` object used by page-specific scripts to talk to the backend. */
(function () {
  "use strict";

  const TOKEN_KEY = "pw_access_token";
  const REFRESH_KEY = "pw_refresh_token";
  const USER_KEY = "pw_user";

  function getAccessToken() { return localStorage.getItem(TOKEN_KEY); }
  function getRefreshToken() { return localStorage.getItem(REFRESH_KEY); }
  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); }
    catch { return null; }
  }
  function setSession(user, accessToken, refreshToken) {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  }
  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  }
  function isLoggedIn() { return Boolean(getAccessToken() && getUser()); }

  /**
   * Core fetch wrapper. Automatically:
   *  - prefixes API_BASE + /api
   *  - sends the stored access token as a Bearer header
   *  - retries once through /api/auth/refresh on a 401
   *  - throws an Error with .status and .details on failure
   */
  async function api(path, { method = "GET", body, isRetry = false, rawBody } = {}) {
    const headers = { };
    let payload = rawBody;
    if (body !== undefined && rawBody === undefined) {
      headers["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    let res;
    try {
      res = await fetch(`${window.PREPWISE_API}/api${path}`, {
        method,
        headers,
        body: payload,
        credentials: "include",
      });
    } catch (networkErr) {
      const err = new Error("Could not reach the PrepWise server. Please check your connection and try again.");
      err.status = 0;
      throw err;
    }

    if (res.status === 401 && !isRetry && getRefreshToken()) {
      const refreshed = await tryRefresh();
      if (refreshed) return api(path, { method, body, isRetry: true, rawBody });
    }

    let json = null;
    try { json = await res.json(); } catch { /* no body */ }

    if (!res.ok || !json || json.success === false) {
      const message = json?.error?.message || `Request failed (${res.status}).`;
      const err = new Error(message);
      err.status = res.status;
      err.details = json?.error?.details;
      throw err;
    }

    return json.data;
  }

  async function tryRefresh() {
    try {
      const res = await fetch(`${window.PREPWISE_API}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ refreshToken: getRefreshToken() }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        localStorage.setItem(TOKEN_KEY, json.data.accessToken);
        if (json.data.refreshToken) localStorage.setItem(REFRESH_KEY, json.data.refreshToken);
        return true;
      }
    } catch { /* fall through */ }
    clearSession();
    return false;
  }

  async function logout() {
    try { await api("/auth/logout", { method: "POST" }); } catch { /* ignore */ }
    clearSession();
    window.location.href = "index.html";
  }

  /** Redirects to login.html with a `next` param if no session is present. Returns true if allowed to proceed. */
  function requireAuth() {
    if (isLoggedIn()) return true;
    const next = encodeURIComponent(location.pathname.split("/").pop());
    window.location.href = `login.html?next=${next}`;
    return false;
  }

  /* ---------- Lightweight toast notifications ---------- */
  function ensureToastHost() {
    let host = document.getElementById("pw-toast-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "pw-toast-host";
      host.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:999;display:flex;flex-direction:column;gap:10px;align-items:center;";
      document.body.appendChild(host);
    }
    return host;
  }
  function toast(message, type = "info") {
    const host = ensureToastHost();
    const el = document.createElement("div");
    const colors = { success: "#16A987", error: "#D64550", info: "#0B1E42" };
    el.textContent = message;
    el.style.cssText = `background:${colors[type] || colors.info};color:#fff;padding:12px 20px;border-radius:999px;font-family:'Inter',sans-serif;font-size:.88rem;font-weight:600;box-shadow:0 10px 30px rgba(11,30,66,0.25);max-width:90vw;text-align:center;`;
    host.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .3s ease"; }, 3200);
    setTimeout(() => el.remove(), 3600);
  }

  /* ---------- Nav auth state: swap Log In/Get Started for the user's name ---------- */
  const ROLE_DASHBOARD = {
    STUDENT: "dashboard-student.html",
    PARENT: "dashboard-parent.html",
    TEACHER: "dashboard-teacher.html",
    SCHOOL_ADMIN: "dashboard-school.html",
    ADMIN: "dashboard-school.html",
  };

  function paintNavForAuth() {
    const user = getUser();
    const actionsDesktop = document.querySelector(".nav-actions");
    if (!actionsDesktop) return;
    if (!user) return; // default logged-out markup (Log In / Get Started) already in the HTML

    const loginBtn = actionsDesktop.querySelector('a[href="login.html"]');
    const registerBtn = actionsDesktop.querySelector('a[href="register.html"]');
    const dashboardHref = ROLE_DASHBOARD[user.role] || "dashboard-student.html";

    if (loginBtn) {
      loginBtn.textContent = `Hi, ${user.firstName}`;
      loginBtn.setAttribute("href", dashboardHref);
      loginBtn.classList.remove("btn-secondary");
      loginBtn.classList.add("btn-secondary");
    }
    if (registerBtn) {
      registerBtn.textContent = "Log Out";
      registerBtn.setAttribute("href", "#");
      registerBtn.addEventListener("click", function (e) {
        e.preventDefault();
        logout();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", paintNavForAuth);

  window.PW = {
    api,
    getUser,
    getAccessToken,
    setSession,
    clearSession,
    isLoggedIn,
    logout,
    requireAuth,
    toast,
  };
})();
