# Taiga site

RS School project: a website for **TAIGA** — handmade «бурки» (fur boots) from reindeer hide. Site text is in Russian. The owner communicates in Russian; reply in Russian.

- Repo: `git@github.com:esrudenko/taiga-site.git` (branch `main`, no commits yet)
- There is no Figma mockup: the design is built from screenshots/mockups the owner sends in chat, one section at a time.
- Chosen style: variant A «Тёплая мастерская» — dark main theme, Prata headings, caramel accent, photos that dissolve into the page.

## Status (2026-11-01)

- Home `index.html` and catalog `catalog.html` are done. **Live at https://taiga-burki.kz** (hosting.kz, Plesk, server 185.98.5.148 in Astana; Let's Encrypt SSL for the domain and www, grade A; HTTP→HTTPS 301; www → apex). Deploy: Plesk Git pulls the public repo branch `gh-pages` into `/httpdocs` automatically via a GitHub webhook (~20 s–few min after a push). Release = merge `main` into `gh-pages` locally and push (`gh` CLI is not installed). The old GitHub Pages copy (esrudenko.github.io/taiga-site) still builds from `gh-pages` but its form can't work (no PHP). Canonical/OG URLs point to https://taiga-burki.kz/. From the dev machine HTTPS/panel of this server time out (likely rate-limited) — check the site through SSL Labs / the owner's browser, or HTTP with `curl -H 'Host: taiga-burki.kz' http://185.98.5.148/…`.
- **Waiting for the owner:**
  - Request form backend: `server/send.php` (PHP 8, cURL) is written but **not tested yet** (no PHP on the dev machine) — test it on the hosting with the first real request. Planned hosting: Kazakh shared hosting with PHP (PS.kz / Hoster.kz — owner chooses; requirements: servers in KZ, PHP 8+ with cURL, outbound HTTPS to api.telegram.org allowed, free SSL, own domain). Cloudflare and Yandex Cloud were rejected (Cloudflare is throttled in RU; Telegram is throttled in RU since early 2026, so the server must be outside RU). `REQUEST_ENDPOINT = "./server/send.php"` in `js/request-form.js`; on GitHub Pages the POST fails and the form shows `#request_error` (WhatsApp fallback). Response is JSON `{ ok: true }`. Payload: name, method, contact, message, consent (must be true), website (honeypot — must be empty), elapsed (ms since the form opened; < 3000 = bot), page. Bots get a fake `{ok:true}` and nothing is sent. Rate limit 5 per 10 min per IP (hashed with `salt`, temp file). Delivery: Telegram is the success signal (`{ok:true}` only if the Telegram API answered ok); the `mail()` copy is best-effort and does not count, because `mail()` returns true even when the mail is later dropped. On failure the reason (curl error or API description, no personal data) is written to `sys_get_temp_dir()/taiga_last_error.txt`. Diagnostics page `server/check.php` was removed after setup (its key leaked into chat); if needed again, recreate it from git history (commit 3716064) with a NEW salt in config.php. It showed PHP/curl/mail availability, token and chat id format, a Telegram `getMe` test and the last send error (404 without the right key). First real test (2026-11-02): server answered ok but nothing arrived — that was the old logic counting `mail()`.
  - Secrets: `server/config.php` (from `config.example.php`) holds telegram_token, telegram_chat_id, email_to, email_from, salt, allowed_origins. It is in `.gitignore` and blocked by `server/.htaccess`. The bot is already created by the owner and the chat id is known (owner keeps it; it is not in the repo); test message from the bot reached the owner.
  - Still needed from the owner: hosting choice + access, domain.
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
index.html, catalog.html, privacy.html   pages (header/footer/request dialog are copied in both)
css/
  variables.css   :root (dark) and :root.light_theme colors, fonts, sizes, theme photo variables
  base.css        reset, body, .container, section headings/text, .btn*, .reveal, .visually_hidden, reduced motion
  header.css      header, nav (+ shared link underline hover), theme toggle, .icon_btn, burger and mobile menu
  hero.css        home hero
  features.css    icon rows (.features, .features_start)
  about.css       «О бренде»
  collection.css  «Коллекция TAIGA» on the home page (3 cards → catalog.html#women/#kids/#men, on mouse devices only (`@media (hover: hover)`) the accent state (softer accent border + light glow, 0.7s ease-out + `scale: 1.02`, no size change) is on the kids card by default and moves to the hovered/focused card; on touch screens all three cards look the same (`.collection_list:has(:hover)`); use the `scale` property, not `transform` — `.reveal` owns transform; no badge; photos 6:7 aligned to the bottom (only the empty top of the shot is cropped); all cards have the same «Подробнее» primary button; fur background `--collection-fur`, dark/light)
  split.css       split layout + sewing, delivery
  fonts.css       self-hosted @font-face (files in `fonts/`, woff2: Manrope variable 400–700, Prata, Cormorant Garamond regular/600/italic; latin, latin-ext, cyrillic, cyrillic-ext — latin-ext is needed for ₸ and ₽). No Google Fonts requests (privacy + RU reliability). Link it first, before variables.css; manrope/prata cyrillic are preloaded.
  policy.css      privacy page
  catalog.css     catalog banner (.page_hero; darker text in the light theme: #6E4424 title/eyebrow, #3F2A1E subtitle) and products
  lightbox.css    photo viewer dialog
  footer.css      footer
  request.css     request form dialog and form fields
js/
  theme.js        touchstart (iOS :active), scroll lock (setScrollLock), theme toggle, theme photos (`img[data-src-light]`, both pages) — defines themeToggle, isLightTheme, applyThemePhotos
  menu.js         burger menu + logo link                   — defines setMenuOpen
  reveal.js       scroll reveal
  request-form.js request form (uses setMenuOpen)
  features.js     feature rows alignment (index only)
  catalog.js      theme photos, thumbnails, swipe, gallery, currency switch (catalog only; uses themeToggle)
img/general/      favicon, logos
img/home-page/    home photos (dark/light pairs), footer mountains, icon-*.svg
img/catalog/      <model>-1…4.webp and <model>-1…4-light.webp
server/           send.php (request form → Telegram + email), config.example.php, .htaccess
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
- Scroll lock: `setScrollLock(name, on)` in `js/theme.js` (menu, request form, gallery). On lock it saves `scrollY`, sets `body.style.top = -scrollY` (+ padding-right for the scrollbar width) and adds `html.scroll_locked` (html overflow hidden, body `position: fixed`) — the only approach iOS Safari reliably respects; on unlock it restores the scroll position instantly. While locked `touchmove` outside `.request`/`.header_nav` is cancelled. The mobile menu keeps the header visible because the header is `position: fixed` while the menu is open. Use it for any new modal.
- Mobile menu: while open, the header is `position: fixed` and body gets `padding-top: var(--header-height)` (`body:has(.header_nav.active_menu)`), so the logo and the × stay visible at any scroll position. `.menu_extra` (small italic note + `btn_primary` «Оставить заявку») is vertically centered in the free space (`margin-block: auto`).
- Request form consent: required checkbox `#request_consent` (custom `.consent_box`) with a link to `privacy.html`; without it the form shows «Нужно согласие на обработку данных». Hidden honeypot `.field_trap` `#request_website`: if a bot fills it, the form shows success but sends nothing. On screens ≤800px tall the form is compact (no subtitle/eyebrow, smaller textarea and gaps) so it fits without scrolling even with errors.
- Request form opening: dialog `scrollTop = 0`; the name field gets focus only on mouse devices (`(hover: hover) and (pointer: fine)`), so phones don't open the keyboard and the form starts from the top.
- Footer contact texts (not the nav row) are `--footer-contact: #E2C9B1` (between the light text and the accent) with a hairline underline drawn as `::before` (same color, 1px scaled to 0.5, `bottom: -4px`) — exactly where the hover line `::after` is, so on hover the hairline fades out and the accent line grows in the same spot. Don't use `text-decoration` there (its position can't be matched).
- Catalog ≤600px: `.product_content` is `display: contents` and items are re-ordered with `order`: main photo → thumbs → eyebrow/title/price/text → «Заказать».
- Icons: SVG in `img/home-page/icon-*.svg` (24×24 viewBox, stroke `#C99A70` 1.4). Sewing icons `icon-fit` (boot side view with laces, dashed insole and up arrows — line version of the owner's raster picture), `icon-tape` (tape measure), `icon-scissors` follow the owner's mockup; `icon-snowflake` is generated symmetric (6 arms, one V-branch each).
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
- Footer: logo + accent tagline `.footer_tagline`, vertical line, contacts in order Instagram, WhatsApp, Telegram, email (real links: `instagram.com/taiga_burki`, `wa.me/77053397249`, `t.me/dinarakurmanalieva`, `mailto:dinarakurmanalieva@bk.ru`), mountains photo, nav row between lines, `.footer_bottom` (copyright © 2026 + link «Политика конфиденциальности» → privacy.html; it was removed earlier and returned when the form got the consent checkbox).
- Request form: native `<dialog id="request_dialog">`; `data-open-request` opens, `data-close-request` closes (also Escape, backdrop click). Fields: name, contact method chips (phone/Telegram/WhatsApp/email change the contact field — see `contactMethods`), optional message. Custom validation (`.field.has_error`, `.field_error`). Fits the screen without scrolling; bottom sheet ≤450px. Focus goes to the name field via JS (not `autofocus`, Chrome blocks it with a `#hash` in the URL). Field classes `.field*` are reusable.
- Form field spacing: every `.field_label` (including the `<legend>` of the contact-method fieldset — flex `gap` doesn't apply to a legend) has `margin-bottom: 0.625rem` and `.field` has `gap: 0`, so label → control is exactly 10px for every field on every screen. Errors sit 0.25rem below the control.
- Products (catalog): `.product` grid — `.product_zoom` button with the big `.product_photo` (6:7, `object-position: center bottom` — like the home collection: only the empty top is cropped, the sole is always visible; sized by screen height) + `.product_content`: eyebrow, `.section_title`, `.product_price_row` (`.product_price` with `data-price-kzt/rub/usd` + `.currency` radio switch ₸/₽/$; default ₸, choice synced across products and saved in `localStorage.currency`; the price has a fixed `min-width: 6.4em` + `tabular-nums` so the switch doesn't jump — widest price is «от 250 000 ₸» ≈ 6.02em, raise the min-width if longer prices appear), `.product_price_note`, text, `.product_thumbs` with 4 square (`object-position: center 80%`) `<button class="product_thumb" aria-pressed data-photo data-photo-light>` (all photos incl. the main one; a click selects the big photo), «Заказать» button (`data-open-request` + `data-request-message`). Touch swipe on the big photo switches photos; a tap opens the full-screen gallery `#photo_dialog` at the current photo (swipe / ← → / buttons, Escape closes). Even products have the photo on the right; ≤600px one column, centered.
- Per-photo crop: an `<img>` can carry `data-position-dark` / `data-position-light` (object-position per theme, applied by `applyThemePhotos()`); a `.product_thumb` passes its `data-position` / `data-position-light` to the main photo when selected. Used for `kids-1` (main photo 30%, its thumbnail `data-position-dark/light` 45%); kids thumbs 2–4 have `data-position-light="center 48%"` (their light shots are portrait with empty floor; the dark ones are landscape and need nothing) so all soles line up (its file is also pre-cropped 1.2× to 711×1067 so the kids boots look as big as the others; originals not kept in the repo).
- How to measure (`#measure` on catalog): two `.measure_card`s (diagram in a 180px left column, 200px tall; title + numbered steps on the right). Foot: inline SVG traced 1:1 from the owner's reference picture (viewBox in the picture's own coordinates `300 95 980 860`: straight leg lines, heel, sole with a small arch, toe, ankle bone, rounded big toe with a nail arc, a short pencil (24°) with its tip at the front of the big toe, floor line, arrow, «длина стопы» as `.measure_label.measure_label_big`). Mask versions of her glowing picture were rejected as blurry. Calf: the owner's own clean drawing turned into an alpha mask `img/catalog/measure-calf.png` and painted with the theme color via CSS `mask` (`.measure_pic.measure_pic_calf`). Both use `color` from `.measure_svg` (brighter caramel in dark, accent in light). CSS masks need same-origin: they show over http(s) (Live Server, hosting), not when opened as file://. A «Отправить мерки» button pre-fills the form message.
- Global `img { height: auto }`: width/height attributes reserve space, CSS keeps proportions (needed for `aspect-ratio`).
- Scroll reveal: class `reveal` + optional `style="--reveal-delay: 0.1s"`; IntersectionObserver adds `.is_visible` once; content hidden only under `.js`.

## SEO and accessibility

- Each page has its own `<title>`, `meta description`, `canonical`, Open Graph/Twitter tags (absolute URLs to the GitHub Pages site).
- Skip link `.skip_link` «Перейти к содержанию» → `<main id="main" tabindex="-1">`. Icon buttons have `aria-label`, thumbs use `aria-pressed`, currency is a `fieldset` of radios, dialogs are native `<dialog>` (Escape closes).
- Checked: no horizontal scroll at 320/375/768/1024px on both pages; the request form fits the screen.

## Checking changes

The owner reviews visually, so check layouts before reporting: render with headless Chrome (`/Applications/Google Chrome.app`) — screenshots at 1440/1280/1024/768/390px in both themes (add `class="light_theme"` to `<html>` in a scratch copy), and for behavior/measurements drive Chrome through the DevTools protocol with a small Node script (Node 22 has `fetch` and `WebSocket`). Keep scratch files outside the project.
