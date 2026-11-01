document.addEventListener("touchstart", () => {}, { passive: true });

const scrollLocks = new Set();

let lockedScrollY = 0;

function setScrollLock(name, isLocked) {
  const wasLocked = scrollLocks.size > 0;
  if (isLocked) scrollLocks.add(name);
  else scrollLocks.delete(name);
  const locked = scrollLocks.size > 0;
  if (locked === wasLocked) return;

  const root = document.documentElement;
  const body = document.body;

  if (locked) {
    lockedScrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    body.style.top = `-${lockedScrollY}px`;
    body.style.paddingRight = scrollbarWidth ? `${scrollbarWidth}px` : "";
    root.classList.add("scroll_locked");
  } else {
    root.classList.remove("scroll_locked");
    body.style.top = "";
    body.style.paddingRight = "";
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, lockedScrollY);
    root.style.scrollBehavior = "";
  }
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
    img.style.objectPosition = (isLight ? img.dataset.positionLight : img.dataset.positionDark) || "";
  });
}

applyThemePhotos();
themeToggle.addEventListener("click", applyThemePhotos);
