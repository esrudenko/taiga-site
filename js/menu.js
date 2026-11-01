const burgerBtn = document.querySelector(".burger_btn");
const headerMenu = document.getElementById("header_menu");
const mobileQuery = window.matchMedia("(max-width: 1024px)");

function setMenuOpen(isOpen) {
  burgerBtn.setAttribute("aria-expanded", String(isOpen));
  burgerBtn.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
  headerMenu.classList.toggle("active_menu", isOpen);
  setScrollLock("menu", isOpen);
}

burgerBtn.addEventListener("click", () => {
  const isOpen = burgerBtn.getAttribute("aria-expanded") === "true";
  setMenuOpen(!isOpen);
});

headerMenu.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    setMenuOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && headerMenu.classList.contains("active_menu")) {
    setMenuOpen(false);
    burgerBtn.focus();
  }
});

mobileQuery.addEventListener("change", (event) => {
  if (!event.matches) {
    setMenuOpen(false);
  }
});

const logoLink = document.querySelector(".logo_link");

logoLink.addEventListener("click", (event) => {
  if (logoLink.getAttribute("href") !== "#") return;
  event.preventDefault();
  setMenuOpen(false);
  window.scrollTo({ top: 0 });
  history.replaceState(null, "", location.pathname);
});
