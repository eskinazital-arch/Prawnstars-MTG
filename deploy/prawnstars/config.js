// Prawnstars MTG runtime config, copied over dist/config.js by
// start-prawnstars.ps1. The relay sits on the same link as the app (Caddy
// forwards /relay), so its address comes from the page itself: the same file
// works on a temporary tunnel link and on the custom domain. No relay key is
// published here, so every player enters the group password once.
(function () {
  var scheme = window.location.protocol === "https:" ? "wss://" : "ws://";
  window.__MANABREW_RUNTIME__ = {
    relay: { host: scheme + window.location.host + "/relay", port: 443 },
  };
})();
