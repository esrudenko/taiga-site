# Taiga site

RS School project: a website for **TAIGA** — handmade «бурки» (fur boots) from reindeer hide. Site text is in Russian. The owner communicates in Russian; reply in Russian.

- Repo: `git@github.com:esrudenko/taiga-site.git` (branch `main`, no commits yet)
- There is no Figma mockup: the design is built from screenshots/mockups the owner sends in chat, one section at a time.
- Chosen style: variant A «Тёплая мастерская» — dark main theme, Prata headings, caramel accent, photos that dissolve into the page.

## Status (2026-11-01)

- Home page `index.html` is done: header, hero, «О бренде», «Индивидуальный пошив», «Доставка», footer, request form (modal), light/dark theme, burger menu, scroll reveal, touch `:active` states.
- Catalog page `catalog.html` is done (3 products: women, men, kids) with the owner's photos and prices: all three products are done: **women** (`women-1…4.jpg`, от 150 000 ₸), **men** (`men-1…4.jpg`, от 250 000 ₸), **kids** (`kids-1…4.jpg`, от 70 000 ₸). Owner gives prices in tenge; convert to ₽ and $ at the National Bank of Kazakhstan rate (used: 31.10.2026, 1 $ = 453.87 ₸, 1 ₽ = 5.65 ₸) and round to a neat number (₽ to hundreds, $ to tens). The banner uses `delivery-dark/light.jpg` until there is a dedicated photo (`--catalog-hero-image`).
- The request form has no backend: submit only shows the success screen (options: Formspree-like service or a Telegram bot with a small server).

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
  split.css       split layout + sewing, delivery
  catalog.css     catalog banner (.page_hero; darker text in the light theme: #6E4424 title/eyebrow, #3F2A1E subtitle) and products
  lightbox.css    photo viewer dialog
  footer.css      footer
  request.css     request form dialog and form fields
js/
  theme.js        touchstart (iOS :active) + theme toggle  — defines themeToggle
  menu.js         burger menu + logo link                   — defines setMenuOpen
  reveal.js       scroll reveal
  request-form.js request form (uses setMenuOpen)
  features.js     feature rows alignment (index only)
  catalog.js      theme photos, gallery, photo viewer (catalog only; uses themeToggle)
img/general/      favicon, logos
img/home-page/    home photos (dark/light pairs), footer mountains, icon-*.svg
img/catalog/      <model>-1…4.jpg and <model>-1…4-light.jpg
```

- Each component file holds its own `@media` (breakpoints, `hover: hover`, `hover: none`) blocks at the end.
- index.html links: variables, base, header, hero, features, about, split, footer, request. catalog.html: variables, base, header, catalog, lightbox, footer, request. Keep this order (variables → base → components).
- Scripts are classic `defer` scripts sharing the global scope, loaded in order theme → menu → reveal → request-form → features/catalog. Top-level names must stay unique across files. Not ES modules, so the site still opens via `file://`.
- Image paths inside CSS are relative to the CSS file: `url("../img/...")`.
- No explanatory comments in code (owner's request); HTML keeps only short section markers like `<!-- HERO -->`. Explanations live in this file.
- Image weight: export images at most ~2× their largest displayed size (favicon 64px, `logo-header.png` 600px wide). Photos are ≤1280px JPG.

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
- Footer: logo + accent tagline `.footer_tagline`, vertical line, contacts in order Instagram, WhatsApp, Telegram, email (real links: `instagram.com/taiga_burki`, `wa.me/77053397249`, `t.me/dinarakurmanalieva`, `mailto:dinarakurmanalieva@bk.ru`), mountains photo, nav row between lines, `.footer_bottom` (copyright © 2026 + «Политика конфиденциальности» as plain text, no link or hover — by the owner's request).
- Request form: native `<dialog id="request_dialog">`; `data-open-request` opens, `data-close-request` closes (also Escape, backdrop click). Fields: name, contact method chips (phone/Telegram/WhatsApp/email change the contact field — see `contactMethods`), optional message. Custom validation (`.field.has_error`, `.field_error`). Fits the screen without scrolling; bottom sheet ≤450px. Focus goes to the name field via JS (not `autofocus`, Chrome blocks it with a `#hash` in the URL). Field classes `.field*` are reusable.
- Products (catalog): `.product` grid — `.product_photo` (big `<img>`, 4:5 so upright pair photos fit; wide photos are cropped by `object-fit: cover`) + `.product_content` (eyebrow «Коллекция TAIGA» with a line only after it, `.section_title`, `.product_price` «от … ₽ / от … ₸ / от $…» with `.product_price_note` «Итоговая цена зависит от размера, модели и индивидуальных предпочтений» under it, `.section_text`, `.product_thumbs` with 3 square `<button class="product_thumb">`, button «Подробнее»). Every even product has the photo on the right. Each product fits one screen under the header without cropping the main photo: `.product_photo` is always 4:5 and its width is `min(half the container, (100svh − header − 3rem) × 0.8)`, so on low screens it gets narrower instead of being cropped (grid columns `auto minmax(0, 1fr)`, mirrored for even products). Two columns are kept down to 601px; ≤600px one column, centered, the `.product_zoom` button gets width `min(100%, 45svh × 0.8)` and is centered (the img inside is `width: 100%`) (a whole product can't fit a phone screen). Clicking a thumb swaps its `src`/`alt` with the big photo. The big photo is wrapped in `<button class="product_zoom">` (it is the grid item); a click opens the photo viewer `<dialog id="photo_dialog" class="lightbox">` (only in `catalog.html`): whole photo with `object-fit: contain`, counter «1 / 4», prev/next buttons and ← → keys go through the product's 4 photos (big one first, then thumbs in their current order), closes on ×, Escape or a click on the dark area. Follows the theme: colors from theme variables; the `::backdrop` color is set separately for `.light_theme` (variables don't reliably reach `::backdrop`). «Подробнее» has `data-open-request data-request-message="Интересуют … бурки"` — opens the request form with the message pre-filled. Prices: write «от» before each, glue with `&nbsp;` (`от&nbsp;24&nbsp;900&nbsp;₽`). Photo files go to `img/catalog/` as `<model>-1…4.jpg` (1 = main, dark background) plus `<model>-1…4-light.jpg` (same shot on a light background) for the light theme. Each product `<img>` has `src` = dark photo and `data-src-light` = light one; `applyThemePhotos()` in `js/` switches them on load and on theme toggle, and the gallery swaps both versions (`data-src-dark`/`data-src-light`) when a thumb is clicked, ≤1600px; give each `<img>` a descriptive `alt` and its real width/height.
- Global `img { height: auto }`: width/height attributes reserve space, CSS keeps proportions (needed for `aspect-ratio`).
- Scroll reveal: class `reveal` + optional `style="--reveal-delay: 0.1s"`; IntersectionObserver adds `.is_visible` once; content hidden only under `.js`.

## Checking changes

The owner reviews visually, so check layouts before reporting: render with headless Chrome (`/Applications/Google Chrome.app`) — screenshots at 1440/1280/1024/768/390px in both themes (add `class="light_theme"` to `<html>` in a scratch copy), and for behavior/measurements drive Chrome through the DevTools protocol with a small Node script (Node 22 has `fetch` and `WebSocket`). Keep scratch files outside the project.
