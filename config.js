/* PrepWise — API configuration.
   Change API_BASE to your deployed backend URL when going live
   (e.g. "https://api.prepwise.ng"). Leave as-is for local development
   when running the API on http://localhost:4000. */
window.PREPWISE_API = window.PREPWISE_API || (
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "http://localhost:4000"
    : "https://api.prepwise.ng"
);
