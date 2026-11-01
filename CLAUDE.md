# Taiga site

RS School project: a website for **TAIGA** — handmade «бурки» (fur boots) from reindeer hide. Site text is in Russian. The owner communicates in Russian; reply in Russian.

- Repo: `git@github.com:esrudenko/taiga-site.git` (branch `main`, no commits yet)
- There is no Figma mockup: the design is built from screenshots/mockups the owner sends in chat, one section at a time.
- Chosen style: variant A «Тёплая мастерская» — dark main theme, Prata headings, caramel accent, photos that dissolve into the page.

## Status (2026-11-01)

- Home `index.html` and catalog `catalog.html` are done. Deployed from the `gh-pages` branch: https://esrudenko.github.io/taiga-site/ (owner merges PRs `main` → `gh-pages` in the GitHub UI; `gh` CLI is not installed).
- **Waiting for the owner:**
  - Request form endpoint: `REQUEST_ENDPOINT` in `js/request-form.js` is empty until the owner deploys `server/telegram-worker.js` (Cloudflare Worker, steps in README.md). With no endpoint or a failed request the form shows `#request_error` (WhatsApp fallback) — success is shown only after the server answers `{ ok: true }`.
- Delivery timelines (`.delivery_terms` in `#delivery`, from the owner): production 14 days, delivery from 10 days; note «Сроки ориентировочные и зависят от выбранной модели и транспортной компании».
- Prices (from the owner, in tenge; ₽/$ converted at NB RK rate 31.10.2026: 1 $ = 453.87 ₸, 1 ₽ = 5.65 ₸, rounded down): women 150 000 ₸ / 26 500 ₽ / $330, men 250 000 ₸ / 44 200 ₽ / $550, kids 70 000 ₸ / 12 300 ₽ / $150.

### Two pages: how they share code

- Header, footer, request `<dialog>` and the inline theme script in `<head>` are copied in both HTML files; change them in both. `catalog.html` was generated from `index.html`, so the blocks are identical except links.
- On `catalog.html`: logo → `./index.html`, nav links → `./index.html#about` etc., «Каталог» has `aria-current="page"` (accent color + visible underline), «Контакты» → `#contacts` (this page's footer). On `index.html` «Каталог» and the hero button go to `./catalog.html`.
- JS: both pages load theme/menu/reveal/request-form; `features.js` only on index, `catalog.js` only on catalog. The logo scrolls to top only when its href is `#`.

## Stack

- Plain HTML, CSS and vanilla JS. No frameworks, no build step, no package manager.
- Open `index.html` directly in a browser, or use VS Code Live Server (`127.0.0.1:5500/taiga-site/`).

## Files

```
index.html, catalog.html      pages (header/footer/request dialog are copied in both)
css/
  variables.css   :root (dark) and :root.light_theme colors, fonts, sizes, theme photo variables
  base.css        reset, body, .container, section headings/text, .btn*, .reveal, .visually_hidden, reduced motion
  header.css      header, nav (+ shared link underline hover), theme toggle, .icon_btn, burger and mobile menu
  hero.css        home hero
  features.css    icon rows (.features, .features_start)
  about.css       «О бренде»
  collection.css  «Коллекция TAIGA» on the home page (3 cards → catalog.html#women/#kids/#men, kids card featured with a badge; fur background `--collection-fur`, dark/light)
  split.css       split layout + sewing, delivery
  catalog.css     catalog banner (.page_hero; darker text in the light theme: #6E4424 title/eyebrow, #3F2A1E subtitle) and products
  lightbox.css    photo viewer dialog
  footer.css      footer
  request.css     request form dialog and form fields
js/
  theme.js        touchstart (iOS :active), theme toggle, theme photos (`img[data-src-light]`, both pages) — defines themeToggle, isLightTheme, applyThemePhotos
  menu.js         burger menu + logo link                   — defines setMenuOpen
  reveal.js       scroll reveal
  request-form.js request form (uses setMenuOpen)
  features.js     feature rows alignment (index only)
  catalog.js      theme photos, thumbnails, swipe, gallery, currency switch (catalog only; uses themeToggle)
img/general/      favicon, logos
img/home-page/    home photos (dark/light pairs), footer mountains, icon-*.svg
img/catalog/      <model>-1…4.webp and <model>-1…4-light.webp
server/           telegram-worker.js (Cloudflare Worker for the request form)
README.md         project description for GitHub + Telegram setup
```

- Each component file holds its own `@media` (breakpoints, `hover: hover`, `hover: none`) blocks at the end.
- index.html links: variables, base, header, hero, features, about, collection, split, footer, request. catalog.html: variables, base, header, catalog, lightbox, footer, request. Keep this order (variables → base → components).
- Scripts are classic `defer` scripts sharing the global scope, loaded in order theme → menu → reveal → request-form → features/catalog. Top-level names must stay unique across files. Not ES modules, so the site still opens via `file://`.
- Image paths inside CSS are relative to the CSS file: `url("../img/...")`.
- No explanatory comments in code (owner's request); HTML keeps only short section markers like `<!-- HERO -->`. Explanations live in this file.
- Images: WebP (encoded with headless Chrome canvas, quality 0.72–0.82; `sips` can't write WebP), ≤1280px, at most ~2× display size. Below-the-fold `<img>` get `loading="lazy" decoding="async"`. `img/general/og-image.jpg` (1200×630) is the Open Graph preview; favicon stays PNG.

## Conventions

### Naming and code
- Class names: lowercase snake_case prefixed with the block name (`header_link`, `feature_text`). No BEM `__`/`--`, no camelCase.
- Indentation: 2 spaces. Keep changes small and in the existing style. Don't add libraries or tooling without asking. Commit only when asked.
- Russian typography: glue short prepositions/conjunctions (в, и, с, к, о, на, по, от…) to the next word with `&nbsp;`.
- Accessibility: icon buttons get `aria-label`, decorative SVGs/images get `aria-hidden="true"` / `alt=""`, real `<button>`/`<a>`. `.visually_hidden` for screen-reader-only text.

### Colors and theme
- Only CSS variables, never hardcoded hex in component styles. Every section must switch with the theme.
- Dark theme is the default in `:root`; light theme is `:root.light_theme` (accent `#8A5A32`, hover `#74481F` for contrast on cream; logo darkened with a CSS `filter`).
- One `.theme_toggle` button toggles `light_theme` on `<html>` and saves it to `localStorage` (`theme`). Sun icon in dark theme, moon in light.
- Photos come in dark/light pairs through variables (`--hero-image`, `--about-image`, `--sewing-image`, `--delivery-image`). `--hero-overlay` is an RGB triplet of the page color for gradients.
- Button borders: `--color-button-border` (accent in dark, soft `rgba(138, 90, 50, 0.4)` in light).
- Footer is always dark: `.footer` redefines the theme variables inside itself.

### Typography
- Fonts: Manrope (body), Prata (headings, accent words, footer links/contacts), Cormorant Garamond (only `.menu_note`).
- Section headings: `.section_eyebrow` (uppercase accent label with short lines on both sides), `.section_title` (h2, same size everywhere: `clamp(2rem, 3.8vw, 3.25rem)`), `.section_text` (17px, 16px ≤768px). No per-section font sizes; only the hero `<h1>` is bigger.
- Accent word in a title: `<span class="text_accent">`, same font, only color.

### Layout and spacing
- `.container`: max 1440px, side padding `--container-padding` (2.5rem / 1.5rem ≤768px / 1rem ≤450px).
- On desktop everything aligns to the container's inner edges; nothing sticks out on wide screens. Full-bleed photos only ≤900px.
- Vertical rhythm: every section uses `padding: var(--section-space) 0` (`clamp(2.5rem, 5vw, 4rem)`). Exception: `.about` is pulled up into the hero fade (`margin-top: -2.25rem`, `-1rem` ≤1024px, `0` ≤900px).
- No hard edges between sections: photos dissolve into the page with `mask-image`/gradients.
- Cursor: one rule in base.css gives `cursor: pointer` to `a[href]`, enabled buttons, labels wrapping radios/checkboxes, `select`, `summary`. Don't set other cursors on clickable things (the gallery photo is `pointer` too, not `zoom-in`); the only exception is the disabled submit button while sending (`progress`).
- Rounding: buttons, fields, chips, icon buttons — `border-radius: 0.75em`. No pill shapes.
- Breakpoints: 1200, 1024 (burger menu, footer nav hidden), 900 (sections go one column), 768, 600, 450px; `max-height: 740px` (compact form), `max-height: 560px` (hero `height: auto`).

### Components
- Header: sticky, `--header-height: 92px`. Logo `logo-header.png` (link to top). Nav hover: accent color + 1px underline growing from the center (`::after` scaleX). Same hover is used for footer links and contacts.
- Burger (≤1024px): one `.burger_btn` with `aria-expanded`/`aria-controls="header_menu"`, two `.burger_line` spans morph into a cross. The whole `nav#header_menu` becomes a full-screen panel (`.active_menu`), items centered, `.menu_extra` with a CTA at the bottom. Closes on link click, Escape, resize above 1024px.
- Buttons: `.btn` (accent outline), `.btn_primary` (filled), `.btn_ghost` (quiet secondary), `.btn_arrow` (arrow slides right on hover). `.icon_btn` — 44×44 square (theme toggle, burger, form close).
- Hover only inside `@media (hover: hover)`; each hover has a matching `:active` in `@media (hover: none)` with `transition-duration: 0s` on the pressed state.
- Hero: header + hero = exactly one screen (`height: calc(100svh - var(--header-height))`), `vh`-based `clamp()` spacing; CSS load animation (no `.reveal` inside the hero).
- Features: `.features > .feature > .feature_icon + .feature_text`, `--feature-count` columns, no dividers. `.features_start` = equal blocks as wide as the widest caption, row starts at the text edge; `alignFeatureRows()` in `js/` shifts the row so the first block's content starts exactly at the text edge (`data-align="desktop"` = only >900px). Captions are broken into 2 lines with `<br />` where needed.
- About: photo left, text right; ≤900px photo on top, centered text.
- Split layout (sewing, delivery): `.container.split` with `.split_content` (left) and `.split_image` (right, `--split-image`). Photo is first in HTML so ≤900px it's on top, text centered.
- Footer: logo + accent tagline `.footer_tagline`, vertical line, contacts in order Instagram, WhatsApp, Telegram, email (real links: `instagram.com/taiga_burki`, `wa.me/77053397249`, `t.me/dinarakurmanalieva`, `mailto:dinarakurmanalieva@bk.ru`), mountains photo, nav row between lines, `.footer_bottom` (copyright © 2026 only; no privacy policy — owner's request).
- Request form: native `<dialog id="request_dialog">`; `data-open-request` opens, `data-close-request` closes (also Escape, backdrop click). Fields: name, contact method chips (phone/Telegram/WhatsApp/email change the contact field — see `contactMethods`), optional message. Custom validation (`.field.has_error`, `.field_error`). Fits the screen without scrolling; bottom sheet ≤450px. Focus goes to the name field via JS (not `autofocus`, Chrome blocks it with a `#hash` in the URL). Field classes `.field*` are reusable.
- Products (catalog): `.product` grid — `.product_zoom` button with the big `.product_photo` (always 4:5, never cropped; sized by screen height) + `.product_content`: eyebrow, `.section_title`, `.product_price_row` (`.product_price` with `data-price-kzt/rub/usd` + `.currency` radio switch ₸/₽/$; default ₸, choice synced across products and saved in `localStorage.currency`; the price has a fixed `min-width: 6.4em` + `tabular-nums` so the switch doesn't jump — widest price is «от 250 000 ₸» ≈ 6.02em, raise the min-width if longer prices appear), `.product_price_note`, text, `.product_thumbs` with 4 `<button class="product_thumb" aria-pressed data-photo data-photo-light>` (all photos incl. the main one; a click selects the big photo), «Заказать» button (`data-open-request` + `data-request-message`). Touch swipe on the big photo switches photos; a tap opens the full-screen gallery `#photo_dialog` at the current photo (swipe / ← → / buttons, Escape closes). Even products have the photo on the right; ≤600px one column, centered.
- How to measure (`#measure` on catalog): two `.measure_card`s with inline SVG diagrams (foot length, calf girth; colors from theme variables via classes `.measure_shape/.measure_line/.measure_guide`) and a «Отправить мерки» button that pre-fills the form message.
- Global `img { height: auto }`: width/height attributes reserve space, CSS keeps proportions (needed for `aspect-ratio`).
- Scroll reveal: class `reveal` + optional `style="--reveal-delay: 0.1s"`; IntersectionObserver adds `.is_visible` once; content hidden only under `.js`.

## SEO and accessibility

- Each page has its own `<title>`, `meta description`, `canonical`, Open Graph/Twitter tags (absolute URLs to the GitHub Pages site).
- Skip link `.skip_link` «Перейти к содержанию» → `<main id="main" tabindex="-1">`. Icon buttons have `aria-label`, thumbs use `aria-pressed`, currency is a `fieldset` of radios, dialogs are native `<dialog>` (Escape closes).
- Checked: no horizontal scroll at 320/375/768/1024px on both pages; the request form fits the screen.

## Checking changes

The owner reviews visually, so check layouts before reporting: render with headless Chrome (`/Applications/Google Chrome.app`) — screenshots at 1440/1280/1024/768/390px in both themes (add `class="light_theme"` to `<html>` in a scratch copy), and for behavior/measurements drive Chrome through the DevTools protocol with a small Node script (Node 22 has `fetch` and `WebSocket`). Keep scratch files outside the project.
