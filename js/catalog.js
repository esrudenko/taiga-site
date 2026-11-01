function onSwipe(element, callback) {
  let startX = 0;
  let startY = 0;

  element.addEventListener(
    "touchstart",
    (event) => {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    },
    { passive: true },
  );

  element.addEventListener(
    "touchend",
    (event) => {
      const dx = event.changedTouches[0].clientX - startX;
      const dy = event.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        callback(dx < 0 ? 1 : -1);
        element.dataset.swiped = "true";
        setTimeout(() => delete element.dataset.swiped, 400);
      }
    },
    { passive: true },
  );
}

function fadeIn(img) {
  img.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 300, easing: "ease-out" });
}

const lightbox = document.getElementById("photo_dialog");
const lightboxImg = lightbox.querySelector(".lightbox_img");
const lightboxCounter = lightbox.querySelector(".lightbox_counter");
let lightboxPhotos = [];
let lightboxIndex = 0;

function showLightboxPhoto(index) {
  lightboxIndex = (index + lightboxPhotos.length) % lightboxPhotos.length;
  const photo = lightboxPhotos[lightboxIndex];
  lightboxImg.src = isLightTheme() ? photo.light : photo.dark;
  lightboxImg.alt = photo.alt;
  lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxPhotos.length}`;
}

function stepLightbox(direction) {
  showLightboxPhoto(lightboxIndex + direction);
  fadeIn(lightboxImg);
}

document.querySelectorAll(".product").forEach((product) => {
  const zoomBtn = product.querySelector(".product_zoom");
  const mainPhoto = product.querySelector(".product_photo");
  const thumbs = [...product.querySelectorAll(".product_thumb")];
  let active = 0;

  function selectPhoto(index) {
    active = (index + thumbs.length) % thumbs.length;
    const thumb = thumbs[active];
    mainPhoto.dataset.srcDark = thumb.dataset.photo;
    mainPhoto.dataset.srcLight = thumb.dataset.photoLight;
    mainPhoto.alt = thumb.querySelector("img").alt;
    thumbs.forEach((item, i) => item.setAttribute("aria-pressed", String(i === active)));
    applyThemePhotos();
    fadeIn(mainPhoto);
  }

  thumbs.forEach((thumb, i) => thumb.addEventListener("click", () => selectPhoto(i)));
  onSwipe(zoomBtn, (direction) => selectPhoto(active + direction));

  zoomBtn.addEventListener("click", () => {
    if (zoomBtn.dataset.swiped) return;
    lightboxPhotos = thumbs.map((thumb) => ({
      dark: thumb.dataset.photo,
      light: thumb.dataset.photoLight,
      alt: thumb.querySelector("img").alt,
    }));
    showLightboxPhoto(active);
    lightbox.showModal();
    setScrollLock("gallery", true);
  });
});

lightbox.querySelector(".lightbox_prev").addEventListener("click", () => stepLightbox(-1));
lightbox.querySelector(".lightbox_next").addEventListener("click", () => stepLightbox(1));
lightbox.querySelector("[data-close-lightbox]").addEventListener("click", () => lightbox.close());
onSwipe(lightbox, stepLightbox);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox && !lightbox.dataset.swiped) lightbox.close();
});

lightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") stepLightbox(-1);
  if (event.key === "ArrowRight") stepLightbox(1);
});

lightbox.addEventListener("close", () => {
  setScrollLock("gallery", false);
});

const currencySymbols = { kzt: "₸", rub: "₽", usd: "$" };

function formatPrice(value, currency) {
  const number = Number(value).toLocaleString("ru-RU").replace(/\s/g, " ");
  return currency === "usd" ? `от $${number}` : `от ${number} ${currencySymbols[currency]}`;
}

function setCurrency(currency) {
  document.querySelectorAll(".product_price").forEach((price) => {
    price.textContent = formatPrice(price.dataset[`price${currency[0].toUpperCase()}${currency.slice(1)}`], currency);
  });
  document.querySelectorAll(`.currency input[value="${currency}"]`).forEach((input) => {
    input.checked = true;
  });
  localStorage.setItem("currency", currency);
}

document.querySelectorAll(".currency input").forEach((input) => {
  input.addEventListener("change", () => setCurrency(input.value));
});

setCurrency(localStorage.getItem("currency") || "kzt");
