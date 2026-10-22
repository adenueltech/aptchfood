const root = document.documentElement;
const toggle = document.getElementById("theme-toggle");

function applyTheme(theme, save = false) {
  const isDark = theme === "dark";
  root.dataset.theme = isDark ? "dark" : "light";
  toggle.setAttribute("aria-pressed", String(isDark));
  toggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
  toggle.querySelector(".theme-toggle-icon").textContent = isDark ? "☀" : "☾";
  toggle.querySelector(".theme-toggle-label").textContent = isDark ? "Light mode" : "Dark mode";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", isDark ? "#171411" : "#fffaf4");
  if (save) {
    try { localStorage.setItem("theme", isDark ? "dark" : "light"); } catch (error) {}
  }
}

let savedTheme = null;
try { savedTheme = localStorage.getItem("theme"); } catch (error) {}
applyTheme(savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
toggle.addEventListener("click", () => {
  applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
});
