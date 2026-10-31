# Taiga site

RS School project: a website for **TAIGA** — handmade «бурки» (fur boots) from reindeer hide. Site text is in Russian. The owner communicates in Russian; reply in Russian.

- Repo: `git@github.com:esrudenko/taiga-site.git` (branch `main`, no commits yet)
- There is no Figma mockup: the design is built from screenshots/mockups the owner sends in chat, one section at a time.
- Chosen style: variant A «Тёплая мастерская» — dark main theme, Prata headings, caramel accent, photos that dissolve into the page.

## Status (2026-11-01)

Home page `index.html` is done: header, hero, «О бренде», «Индивидуальный пошив», «Доставка», footer, request form (modal), light/dark theme, burger menu, scroll reveal, touch `:active` states.

Still empty / to do:
- **Next task: a separate catalog page** (`catalog.html`). Images go to `img/catalog/`.
- `index.html` still has an empty `<section class="catalog" id="catalog">`, and the header/footer nav «Каталог» and the hero button «Смотреть коллекцию» point to `#catalog`. With a separate page these links should go to `catalog.html` (and the empty section removed or turned into a short teaser — ask the owner).
- Privacy policy link in the footer is `href="#"` (no page yet).
- The request form has no backend: submit only shows the success screen (options: Formspree-like service or a Telegram bot with a small server).

### Notes for the catalog page (multi-page)

- Header and footer are plain HTML, so they must be copied into `catalog.html`. On that page nav links to home sections must be `index.html#about`, `index.html#sewing`, etc.; the logo link must go to `index.html` (on the home page it is `href="#"` and `script.js` scrolls to the top).
- Also copy the inline theme script from `<head>` (applies the saved theme before paint, adds `.js`) and the request `<dialog>` if the page has «Оставить заявку» buttons.
- `script.js` currently assumes all home-page elements exist (`.theme_toggle`, `.burger_btn`, `#request_dialog`, `.logo_link`, `.features_start`…). Before reusing it on another page, guard each block (`if (element) {…}`) so missing elements don't throw.
- Reuse existing classes and variables (section headings, `.btn*`, `.field*`, theme variables, `--section-space`, `.reveal`) instead of new one-off styles.

## Stack

- Plain HTML, CSS and vanilla JS. No frameworks, no build step, no package manager.
- Open `index.html` directly in a browser, or use VS Code Live Server (`127.0.0.1:5500/taiga-site/`).

## Files

- `index.html`: header → `<main>` (`#hero`, `#about`, `#catalog` (empty), `#sewing`, `#delivery`) → `<footer id="contacts">` → request `<dialog>`.
- `style.css` order: variables → reset → general → typography/section headings → buttons → header → hero → features → about → split layout (sewing, delivery) → footer → request form → scroll reveal → hover (`@media (hover: hover)`) → touch active (`@media (hover: none)`) → responsive `@media` blocks → reduced motion.
- `script.js`: touchstart (iOS :active), theme toggle, burger menu, scroll reveal, request form, logo scroll-to-top, feature rows alignment.
- `img/general/`: favicon, `logo.png` (original, has a broken tagline line under TAIGA), `logo-header.png` (crop without it — used in header and footer), `taiga-logo.svg` (single-color, not used).
- `img/home-page/`: section photos in dark/light pairs (`hero-bg(-light)`, `about-deer-dark/light`, `sewing-dark/light`, `delivery-dark/light`), `footer-mountains.jpg`, feature icons `icon-*.svg` (stroke `#C99A70`).

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
- Features: `.features > .feature > .feature_icon + .feature_text`, `--feature-count` columns, no dividers. `.features_start` = equal blocks as wide as the widest caption, row starts at the text edge; `alignFeatureRows()` in `script.js` shifts the row so the first block's content starts exactly at the text edge (`data-align="desktop"` = only >900px). Captions are broken into 2 lines with `<br />` where needed.
- About: photo left, text right; ≤900px photo on top, centered text.
- Split layout (sewing, delivery): `.container.split` with `.split_content` (left) and `.split_image` (right, `--split-image`). Photo is first in HTML so ≤900px it's on top, text centered.
- Footer: logo + accent tagline `.footer_tagline`, vertical line, contacts in order Instagram, WhatsApp, Telegram, email (real links: `instagram.com/taiga_burki`, `wa.me/77053397249`, `t.me/dinarakurmanalieva`, `mailto:dinarakurmanalieva@bk.ru`), mountains photo, nav row between lines, `.footer_bottom` (copyright © 2026 + privacy link).
- Request form: native `<dialog id="request_dialog">`; `data-open-request` opens, `data-close-request` closes (also Escape, backdrop click). Fields: name, contact method chips (phone/Telegram/WhatsApp/email change the contact field — see `contactMethods`), optional message. Custom validation (`.field.has_error`, `.field_error`). Fits the screen without scrolling; bottom sheet ≤450px. Focus goes to the name field via JS (not `autofocus`, Chrome blocks it with a `#hash` in the URL). Field classes `.field*` are reusable.
- Scroll reveal: class `reveal` + optional `style="--reveal-delay: 0.1s"`; IntersectionObserver adds `.is_visible` once; content hidden only under `.js`.

## Checking changes

The owner reviews visually, so check layouts before reporting: render with headless Chrome (`/Applications/Google Chrome.app`) — screenshots at 1440/1280/1024/768/390px in both themes (add `class="light_theme"` to `<html>` in a scratch copy), and for behavior/measurements drive Chrome through the DevTools protocol with a small Node script (Node 22 has `fetch` and `WebSocket`). Keep scratch files outside the project.
