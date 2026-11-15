# Trendly Shop — website

Static site (HTML + CSS + JS, no build step). Open `index.html` in a browser,
or in VS Code install **Live Server** → right-click `index.html` → *Open with Live Server*.

## Files
- `js/config.js` — Instagram, WhatsApp, Telegram, phone, delivery fee, sizes. **Edit first.**
- `js/products.js` — catalog (names in hy/ru/en, prices in AMD, photo paths, sizes) + Instagram posts.
- `js/i18n.js` — all interface text in Armenian / Russian / English.
- `js/app.js` — catalog, filters, cart, checkout.
- `css/style.css` — design (colors at the top in `:root`).

## Photos
- Instagram photos: put `ig-01.jpg … ig-12.jpg` in `assets/img/instagram/`.
- Logo: `assets/img/logo.jpg`.
- Product photos: save to `assets/img/products/<product-id>.jpg`
  (e.g. `moncler-jacket.jpg`). The id is in `products.js`.
  A product with no photo shows a navy placeholder with the brand name.

## Orders
No backend: the customer fills name/phone/address and the order is sent as a
message — WhatsApp (prefilled), or copied and opened in Telegram / Instagram DM.
Set `whatsapp` in `config.js` to turn on the WhatsApp button.
