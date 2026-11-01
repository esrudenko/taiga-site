document.addEventListener("touchstart", () => {}, { passive: true });

const themeToggle = document.querySelector(".theme_toggle");

function updateThemeLabel() {
  const isLight = document.documentElement.classList.contains("light_theme");
  themeToggle.setAttribute(
    "aria-label",
    isLight ? "Включить тёмную тему" : "Включить светлую тему",
  );
}

themeToggle.addEventListener("click", () => {
  const isLight = document.documentElement.classList.toggle("light_theme");
  localStorage.setItem("theme", isLight ? "light" : "dark");
  updateThemeLabel();
});

updateThemeLabel();
