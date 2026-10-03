(() => {
  "use strict";
  // New visitors start light; storage may be unavailable in private or file:// sessions.
  let theme = "light";
  try {
    if (localStorage.getItem("jair-portfolio-theme") === "dark") theme = "dark";
  } catch { /* The default remains usable without storage. */ }
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === "dark" ? "#08090d" : "#f7f3e9";
})();
