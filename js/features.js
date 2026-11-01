const featureRows = document.querySelectorAll(".features_start");
const desktopQuery = window.matchMedia("(min-width: 901px)");

function alignFeatureRow(row) {
  row.style.marginLeft = "";
  if (row.dataset.align === "desktop" && !desktopQuery.matches) return;

  const firstFeature = row.querySelector(".feature");
  const iconBox = firstFeature.querySelector(".feature_icon").getBoundingClientRect();

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

document.fonts.ready.then(alignFeatureRows);
window.addEventListener("resize", () => requestAnimationFrame(alignFeatureRows));
