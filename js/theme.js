document.addEventListener("touchstart", () => {}, { passive: true });

const scrollLocks = new Set();

function setScrollLock(name, isLocked) {
  if (isLocked) scrollLocks.add(name);
  else scrollLocks.delete(name);
  document.documentElement.classList.toggle("scroll_locked", scrollLocks.size > 0);
}

document.addEventListener(
  "touchmove",
  (event) => {
    if (scrollLocks.size && !event.target.closest(".request, .header_nav")) event.preventDefault();
  },
  { passive: false },
);


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

function isLightTheme() {
  return document.documentElement.classList.contains("light_theme");
}

function applyThemePhotos() {
  const isLight = isLightTheme();
  document.querySelectorAll("img[data-src-light]").forEach((img) => {
    if (!img.dataset.srcDark) img.dataset.srcDark = img.getAttribute("src");
    const wanted = isLight ? img.dataset.srcLight : img.dataset.srcDark;
    if (img.getAttribute("src") !== wanted) img.setAttribute("src", wanted);
  });
}

applyThemePhotos();
themeToggle.addEventListener("click", applyThemePhotos);
