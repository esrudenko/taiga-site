const themePhotos = document.querySelectorAll("img[data-src-light]");

function applyThemePhotos() {
  const isLight = document.documentElement.classList.contains("light_theme");
  themePhotos.forEach((img) => {
    if (!img.dataset.srcDark) img.dataset.srcDark = img.getAttribute("src");
    const wanted = isLight ? img.dataset.srcLight : img.dataset.srcDark;
    if (img.getAttribute("src") !== wanted) img.setAttribute("src", wanted);
  });
}

applyThemePhotos();
themeToggle.addEventListener("click", applyThemePhotos);

document.querySelectorAll(".product").forEach((product) => {
  const mainPhoto = product.querySelector(".product_photo");

  product.querySelectorAll(".product_thumb").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const thumbPhoto = thumb.querySelector("img");
      ["srcDark", "srcLight"].forEach((key) => {
        [mainPhoto.dataset[key], thumbPhoto.dataset[key]] = [thumbPhoto.dataset[key], mainPhoto.dataset[key]];
      });
      [mainPhoto.alt, thumbPhoto.alt] = [thumbPhoto.alt, mainPhoto.alt];
      applyThemePhotos();

      mainPhoto.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 350, easing: "ease-out" });
    });
  });
});

const lightbox = document.getElementById("photo_dialog");

if (lightbox) {
  const lightboxImg = lightbox.querySelector(".lightbox_img");
  const lightboxCounter = lightbox.querySelector(".lightbox_counter");
  let photos = [];
  let current = 0;

  function showPhoto(index) {
    current = (index + photos.length) % photos.length;
    lightboxImg.src = photos[current].src;
    lightboxImg.alt = photos[current].alt;
    lightboxCounter.textContent = `${current + 1} / ${photos.length}`;
  }

  function step(direction) {
    showPhoto(current + direction);
    lightboxImg.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 250, easing: "ease-out" });
  }

  document.querySelectorAll(".product_zoom").forEach((zoomBtn) => {
    zoomBtn.addEventListener("click", () => {
      const product = zoomBtn.closest(".product");
      photos = [...product.querySelectorAll(".product_photo, .product_thumb img")].map((img) => ({
        src: img.src,
        alt: img.alt,
      }));
      showPhoto(0);
      lightbox.showModal();
      document.body.classList.add("dialog_open");
    });
  });

  lightbox.querySelector(".lightbox_prev").addEventListener("click", () => step(-1));
  lightbox.querySelector(".lightbox_next").addEventListener("click", () => step(1));
  lightbox.querySelector("[data-close-lightbox]").addEventListener("click", () => lightbox.close());

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
  });

  lightbox.addEventListener("close", () => {
    document.body.classList.remove("dialog_open");
  });
}
