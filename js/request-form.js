const requestDialog = document.getElementById("request_dialog");
const requestForm = document.getElementById("request_form");
const requestSuccess = document.getElementById("request_success");
const nameInput = document.getElementById("request_name");
const messageInput = document.getElementById("request_message");
const contactInput = document.getElementById("request_contact");
const contactLabel = document.getElementById("request_contact_label");

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

function openRequest(message) {
  setMenuOpen(false);
  if (message) {
    messageInput.value = message;
  }
  requestForm.hidden = false;
  requestSuccess.hidden = true;
  requestError.hidden = true;
  requestDialog.showModal();
  nameInput.focus();
  setScrollLock("request", true);
}

function closeRequest() {
  requestDialog.close();
}

document.querySelectorAll("[data-open-request]").forEach((button) => {
  button.addEventListener("click", () => openRequest(button.dataset.requestMessage));
});

document.querySelectorAll("[data-close-request]").forEach((button) => {
  button.addEventListener("click", closeRequest);
});

requestDialog.addEventListener("click", (event) => {
  const box = requestDialog.getBoundingClientRect();
  const isOutside =
    event.clientX < box.left ||
    event.clientX > box.right ||
    event.clientY < box.top ||
    event.clientY > box.bottom;

  if (event.target === requestDialog && isOutside) {
    closeRequest();
  }
});

requestDialog.addEventListener("close", () => {
  setScrollLock("request", false);
});

requestForm.addEventListener("change", (event) => {
  if (event.target.name === "method") {
    updateContactField();
  }
});

[nameInput, contactInput].forEach((input) => {
  input.addEventListener("input", () => clearError(input));
});

const REQUEST_ENDPOINT = "";

const requestError = document.getElementById("request_error");
const submitButton = requestForm.querySelector(".request_submit");
const submitLabel = submitButton.firstChild;

function setSending(isSending) {
  submitButton.disabled = isSending;
  submitLabel.textContent = isSending ? "Отправляем… " : "Отправить заявку ";
}

async function sendRequest(data) {
  if (!REQUEST_ENDPOINT) throw new Error("No request endpoint");

  const response = await fetch(REQUEST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) throw new Error("Request failed");
}

requestForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  requestError.hidden = true;

  if (!validateForm()) {
    requestForm.querySelector("[aria-invalid='true']").focus();
    return;
  }

  const data = {
    name: nameInput.value.trim(),
    method: requestForm.elements.method.value,
    contact: contactInput.value.trim(),
    message: messageInput.value.trim(),
    page: document.title,
  };

  setSending(true);
  try {
    await sendRequest(data);
  } catch {
    requestError.hidden = false;
    setSending(false);
    return;
  }
  setSending(false);

  document.getElementById("request_success_title").textContent = `Спасибо, ${data.name}!`;
  requestForm.reset();
  updateContactField();
  requestForm.hidden = true;
  requestSuccess.hidden = false;
  requestSuccess.querySelector(".request_done").focus();
});
