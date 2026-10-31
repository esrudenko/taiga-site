// TOUCH: iOS Safari applies :active styles only if the page listens to touchstart
document.addEventListener("touchstart", () => {}, { passive: true });

// THEME TOGGLE
// Dark is the main theme; the light one is the .light_theme class on <html>
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

// BURGER MENU
const burgerBtn = document.querySelector(".burger_btn");
const headerMenu = document.getElementById("header_menu");
const mobileQuery = window.matchMedia("(max-width: 1024px)");

function setMenuOpen(isOpen) {
  burgerBtn.setAttribute("aria-expanded", String(isOpen));
  burgerBtn.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
  headerMenu.classList.toggle("active_menu", isOpen);
  document.body.classList.toggle("menu_open", isOpen);
}

burgerBtn.addEventListener("click", () => {
  const isOpen = burgerBtn.getAttribute("aria-expanded") === "true";
  setMenuOpen(!isOpen);
});

// Close the menu after choosing a link
headerMenu.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    setMenuOpen(false);
  }
});

// Close on Escape and return focus to the burger
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && headerMenu.classList.contains("active_menu")) {
    setMenuOpen(false);
    burgerBtn.focus();
  }
});

// Close if the screen becomes wider than the mobile breakpoint
mobileQuery.addEventListener("change", (event) => {
  if (!event.matches) {
    setMenuOpen(false);
  }
});

// SCROLL REVEAL
// Adds .is_visible to every .reveal element once it scrolls into view
const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is_visible");
          observer.unobserve(entry.target); // animate only once
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is_visible"));
}

// REQUEST FORM (modal)
const requestDialog = document.getElementById("request_dialog");
const requestForm = document.getElementById("request_form");
const requestSuccess = document.getElementById("request_success");
const nameInput = document.getElementById("request_name");
const contactInput = document.getElementById("request_contact");
const contactLabel = document.getElementById("request_contact_label");

// How the contact field looks and is checked for each contact method
const contactMethods = {
  phone: {
    label: "Телефон",
    placeholder: "+7 900 000-00-00",
    type: "tel",
    autocomplete: "tel",
    error: "Введите номер телефона, минимум 10 цифр",
    isValid: (value) => value.replace(/\D/g, "").length >= 10,
  },
  whatsapp: {
    label: "Номер WhatsApp",
    placeholder: "+7 900 000-00-00",
    type: "tel",
    autocomplete: "tel",
    error: "Введите номер WhatsApp, минимум 10 цифр",
    isValid: (value) => value.replace(/\D/g, "").length >= 10,
  },
  telegram: {
    label: "Telegram",
    placeholder: "@username или номер телефона",
    type: "text",
    autocomplete: "off",
    error: "Введите @username или номер телефона",
    isValid: (value) =>
      /^@?[a-zA-Z0-9_]{5,32}$/.test(value) || value.replace(/\D/g, "").length >= 10,
  },
  email: {
    label: "Email",
    placeholder: "name@example.com",
    type: "email",
    autocomplete: "email",
    error: "Введите email в формате name@example.com",
    isValid: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  },
};

function getMethod() {
  return contactMethods[requestForm.elements.method.value];
}

function updateContactField() {
  const method = getMethod();
  contactLabel.textContent = method.label;
  contactInput.placeholder = method.placeholder;
  contactInput.type = method.type;
  contactInput.autocomplete = method.autocomplete;
  contactInput.inputMode = method.type === "tel" ? "tel" : method.type === "email" ? "email" : "text";
  clearError(contactInput);
}

function showError(input, message) {
  input.closest(".field").classList.add("has_error");
  input.setAttribute("aria-invalid", "true");
  document.getElementById(`${input.id}_error`).textContent = message;
}

function clearError(input) {
  input.closest(".field").classList.remove("has_error");
  input.removeAttribute("aria-invalid");
  document.getElementById(`${input.id}_error`).textContent = "";
}

function validateForm() {
  let isValid = true;
  const name = nameInput.value.trim();
  const contact = contactInput.value.trim();

  if (name.length < 2) {
    showError(nameInput, "Напишите, как к вам обращаться");
    isValid = false;
  }

  if (!getMethod().isValid(contact)) {
    showError(contactInput, getMethod().error);
    isValid = false;
  }

  return isValid;
}

function openRequest() {
  setMenuOpen(false);
  requestForm.hidden = false;
  requestSuccess.hidden = true;
  requestDialog.showModal();
  nameInput.focus(); // instead of the autofocus attribute, which Chrome blocks when the URL has #hash
  document.body.classList.add("dialog_open");
}

function closeRequest() {
  requestDialog.close();
}

document.querySelectorAll("[data-open-request]").forEach((button) => {
  button.addEventListener("click", openRequest);
});

document.querySelectorAll("[data-close-request]").forEach((button) => {
  button.addEventListener("click", closeRequest);
});

// Click on the dark backdrop (outside the window) closes the form.
// The dialog's own padding is also "the dialog", so compare click coordinates with its box.
requestDialog.addEventListener("click", (event) => {
  const box = requestDialog.getBoundingClientRect();
  const isOutside =
    event.clientX < box.left ||
    event.clientX > box.right ||
    event.clientY < box.top ||
    event.clientY > box.bottom;

  // event.target check: keyboard "clicks" on inner buttons come with 0,0 coordinates
  if (event.target === requestDialog && isOutside) {
    closeRequest();
  }
});

// Fires on any close, including Escape
requestDialog.addEventListener("close", () => {
  document.body.classList.remove("dialog_open");
});

requestForm.addEventListener("change", (event) => {
  if (event.target.name === "method") {
    updateContactField();
  }
});

// Remove the error as soon as the user starts fixing the field
[nameInput, contactInput].forEach((input) => {
  input.addEventListener("input", () => clearError(input));
});

requestForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateForm()) {
    requestForm.querySelector("[aria-invalid='true']").focus();
    return;
  }

  // The site has no server yet, so the data is not sent anywhere.
  // Later: send new FormData(requestForm) with fetch() to a backend or form service.
  const name = nameInput.value.trim();
  document.getElementById("request_success_title").textContent = `Спасибо, ${name}!`;

  requestForm.reset();
  updateContactField();
  requestForm.hidden = true;
  requestSuccess.hidden = false;
  requestSuccess.querySelector(".request_done").focus();
});

// LOGO: smooth scroll to the top of the page
document.querySelector(".logo_link").addEventListener("click", (event) => {
  event.preventDefault();
  setMenuOpen(false);
  window.scrollTo({ top: 0 }); // smoothness comes from scroll-behavior in CSS
  history.replaceState(null, "", location.pathname); // don't leave "#" in the address bar
});

// FEATURE ROWS (.features_start): equal blocks with centered content leave empty space
// on the left of the first block. Pull the whole row left by that space, so its content
// starts exactly at the text edge. data-align="desktop" = only on screens wider than 900px.
const featureRows = document.querySelectorAll(".features_start");
const desktopQuery = window.matchMedia("(min-width: 901px)");

function alignFeatureRow(row) {
  row.style.marginLeft = "";
  if (row.dataset.align === "desktop" && !desktopQuery.matches) return;

  const firstFeature = row.querySelector(".feature");
  const iconBox = firstFeature.querySelector(".feature_icon").getBoundingClientRect();

  // Real width of the caption lines (not of the whole block)
  const captionRange = document.createRange();
  captionRange.selectNodeContents(firstFeature.querySelector(".feature_text"));
  const captionBox = captionRange.getBoundingClientRect();

  const contentLeft = Math.min(iconBox.left, captionBox.left);
  const emptySpace = contentLeft - row.getBoundingClientRect().left;
  row.style.marginLeft = `${-emptySpace}px`;
}

function alignFeatureRows() {
  featureRows.forEach(alignFeatureRow);
}

// Fonts change the caption width, so measure after they load and on every resize
document.fonts.ready.then(alignFeatureRows);
window.addEventListener("resize", () => requestAnimationFrame(alignFeatureRows));
