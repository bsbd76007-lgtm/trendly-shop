(() => {
  const CFG = window.SHOP_CONFIG;
  const PRODUCTS = window.PRODUCTS;
  const IG = window.IG_POSTS || [];
  const T = window.I18N;
  const CATS = ["all", "outerwear", "tops", "bottoms", "shoes", "accessories"];
  const BOARD_IDS = ["moncler-jacket", "burberry-jacket", "polo-puffer", "polo-tracksuit",
                     "nike-p6000", "new-balance", "chrome-hearts-jacket", "polo-cap-bear"];

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // ── storage (safe) ───────────────────────────
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  let lang = store.get("trendly_lang", CFG.defaultLang);
  if (!T[lang]) lang = "hy";
  let cart = store.get("trendly_cart", []);
  let activeCat = "all";

  const t = (k) => (T[lang] && T[lang][k]) || T.hy[k] || k;
  const amd = (n) => n.toLocaleString("ru-RU").replace(/ /g, " ") + " ֏";
  const byId = (id) => PRODUCTS.find((p) => p.id === id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ── i18n ─────────────────────────────────────
  function applyLang() {
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    $$("[data-i18n-label]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nLabel)));
    $$("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.lang === lang));
    renderBoard(); renderChips(); renderGrid(); renderCart(); renderSend();
  }

  // ── hero price board ─────────────────────────
  function renderBoard() {
    $("#board").innerHTML = BOARD_IDS.map(byId).filter(Boolean).map((p) => `
      <li><a href="#p-${p.id}">
        <span class="board__name">${esc(p.name[lang])}</span>
        <span class="board__dots" aria-hidden="true"></span>
        <span class="board__price">${p.price.toLocaleString("ru-RU").replace(/ /g, " ")}</span>
      </a></li>`).join("");
  }

  // ── catalog ─────────────────────────────────
  function renderChips() {
    $("#chips").innerHTML = CATS.map((c) => {
      const n = c === "all" ? PRODUCTS.length : PRODUCTS.filter((p) => p.cat === c).length;
      return `<button type="button" role="tab" class="chip" data-cat="${c}" aria-selected="${c === activeCat}">
        ${esc(t("cat_" + c))}<span>${n}</span></button>`;
    }).join("");
  }

  function sizeControl(p) {
    const sizes = CFG.sizes[p.sizes] || [];
    if (!sizes.length) return `<p class="card__one">${esc(t("one_size"))}</p>`;
    return `<fieldset class="sizes"><legend class="sr">${esc(t("size"))}</legend>
      ${sizes.map((s, i) => `<label><input type="radio" name="size-${p.id}" value="${s}" ${i === 1 ? "checked" : ""}><span>${s}</span></label>`).join("")}
    </fieldset>`;
  }

  function renderGrid() {
    const list = activeCat === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.cat === activeCat);
    $("#grid").innerHTML = list.map((p) => `
      <article class="card" id="p-${p.id}">
        <div class="card__media" data-brand="${esc(p.brand)}">
          <img src="${p.img}" alt="${esc(p.name[lang])}" loading="lazy" onerror="this.parentNode.classList.add('is-empty');this.remove()">
          <span class="card__ph" aria-hidden="true"><b>${esc(p.brand)}</b><small>${esc(t("photo_soon"))}</small></span>
        </div>
        <div class="card__body">
          <h3 class="card__name">${esc(p.name[lang])}</h3>
          <p class="card__price">${amd(p.price)}</p>
          ${sizeControl(p)}
          <button class="btn btn--ink btn--block" type="button" data-add="${p.id}">${esc(t("add"))}</button>
        </div>
      </article>`).join("");
  }

  // ── instagram strip ──────────────────────────
  function renderIG() {
    const url = `https://www.instagram.com/${CFG.instagram}/`;
    $("#igFollow").href = url; $("#heroIg").href = `https://ig.me/m/${CFG.instagram}`;
    $(".ig__handle").textContent = "@" + CFG.instagram;
    $("#igGrid").innerHTML = IG.map((g) => `
      <a class="ig__tile" href="${g.url}" target="_blank" rel="noopener">
        <img src="${g.img}" alt="Instagram post" loading="lazy" onerror="this.parentNode.remove()">
      </a>`).join("");
  }

  // ── cart ────────────────────────────────────
  const save = () => store.set("trendly_cart", cart);
  const count = () => cart.reduce((s, l) => s + l.qty, 0);
  const subtotal = () => cart.reduce((s, l) => s + (byId(l.id)?.price || 0) * l.qty, 0);

  function add(id, size) {
    const line = cart.find((l) => l.id === id && l.size === size);
    line ? line.qty++ : cart.push({ id, size, qty: 1 });
    save(); renderCart();
    const btn = $("#cartOpen"); btn.classList.remove("bump"); void btn.offsetWidth; btn.classList.add("bump");
    toast(`${t("added")}: ${byId(id).name[lang]}${size ? " · " + size : ""}`);
  }

  function renderCart() {
    cart = cart.filter((l) => byId(l.id));
    $("#cartCount").textContent = count();
    $("#cartCount").hidden = count() === 0;
    $("#empty").hidden = cart.length > 0;
    $("#drawerFoot").hidden = cart.length === 0;
    $("#lines").innerHTML = cart.map((l, i) => {
      const p = byId(l.id);
      return `<li class="line">
        <div class="line__img" data-brand="${esc(p.brand)}"><img src="${p.img}" alt="" onerror="this.remove()"></div>
        <div class="line__info">
          <p class="line__name">${esc(p.name[lang])}</p>
          <p class="line__meta">${l.size ? esc(t("size")) + ": " + esc(l.size) : esc(t("one_size"))}</p>
          <div class="qty">
            <button type="button" data-dec="${i}" aria-label="−">−</button>
            <span>${l.qty}</span>
            <button type="button" data-inc="${i}" aria-label="+">+</button>
          </div>
        </div>
        <div class="line__end">
          <p>${amd(p.price * l.qty)}</p>
          <button type="button" class="link-btn" data-rm="${i}">${esc(t("remove"))}</button>
        </div>
      </li>`;
    }).join("");
    const fee = typeof CFG.deliveryFee === "number" ? CFG.deliveryFee : null;
    $("#subtotal").textContent = amd(subtotal());
    $("#deliveryFee").textContent = fee === null ? t("delivery_confirm") : (fee === 0 ? "0 ֏" : amd(fee));
    $("#total").textContent = amd(subtotal() + (fee || 0));
  }

  // ── drawer ──────────────────────────────────
  let lastFocus = null;
  function openCart() {
    lastFocus = document.activeElement;
    showView("cart");
    $("#scrim").hidden = false; $("#drawer").hidden = false;
    requestAnimationFrame(() => { $("#drawer").classList.add("open"); $("#scrim").classList.add("open"); });
    document.body.style.overflow = "hidden";
    $("#cartClose").focus();
  }
  function closeCart() {
    $("#drawer").classList.remove("open"); $("#scrim").classList.remove("open");
    setTimeout(() => { $("#drawer").hidden = true; $("#scrim").hidden = true; }, 250);
    document.body.style.overflow = "";
    lastFocus && lastFocus.focus();
  }
  function showView(v) {
    $("#cartView").hidden = v !== "cart";
    $("#checkoutView").hidden = v !== "checkout";
    $("#toCheckout").hidden = v !== "cart";
    $("#formMsg").textContent = "";
  }

  // ── checkout → message ──────────────────────
  function renderSend() {
    const b = [];
    if (CFG.whatsapp) b.push(`<button class="btn btn--gold btn--block" type="submit" data-send="wa">${esc(t("send_wa"))}</button>`);
    if (CFG.telegram) b.push(`<button class="btn btn--ink btn--block" type="submit" data-send="tg">${esc(t("send_tg"))}</button>`);
    b.push(`<button class="btn ${b.length ? "btn--ghost-ink" : "btn--gold"} btn--block" type="submit" data-send="ig">${esc(t("send_ig"))}</button>`);
    $("#sendButtons").innerHTML = b.join("");
  }

  function orderText(f) {
    const rows = cart.map((l, i) => {
      const p = byId(l.id);
      return `${i + 1}. ${p.name[lang]}${l.size ? " (" + l.size + ")" : ""} × ${l.qty} — ${amd(p.price * l.qty)}`;
    });
    return [
      `${t("order_title")} — ${CFG.name}`, "", ...rows, "",
      `${t("total")}: ${amd(subtotal() + (CFG.deliveryFee || 0))}`,
      `${t("f_name")}: ${f.name}`, `${t("f_phone")}: ${f.phone}`, `${t("f_address")}: ${f.address}`,
      f.note ? `${t("f_note")}: ${f.note}` : ""
    ].filter((x, i, a) => x !== "" || a[i - 1] !== "").join("\n").trim();
  }

  async function send(channel) {
    const form = $("#checkoutView");
    const f = Object.fromEntries(new FormData(form).entries());
    if (!f.name.trim() || !f.phone.trim() || !f.address.trim()) {
      $("#formMsg").textContent = t("fill_required");
      form.querySelector(":invalid, input[value='']")?.focus();
      return;
    }
    const text = orderText(f);
    if (channel === "wa") window.open(`https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
    else {
      // Telegram and Instagram can't prefill a chat: copy the order, then open the chat
      try { await navigator.clipboard.writeText(text); } catch {}
      $("#formMsg").textContent = t("copied");
      window.open(channel === "tg" ? `https://t.me/${CFG.telegram}` : `https://ig.me/m/${CFG.instagram}`, "_blank");
    }
  }

  // ── toast ───────────────────────────────────
  let toastTimer;
  function toast(msg) {
    const el = $("#toast"); el.textContent = msg; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  // ── footer ──────────────────────────────────
  function renderFoot() {
    const links = [`<li><a href="https://www.instagram.com/${CFG.instagram}/" target="_blank" rel="noopener">Instagram · @${esc(CFG.instagram)}</a></li>`];
    if (CFG.telegram) links.push(`<li><a href="https://t.me/${esc(CFG.telegram)}" target="_blank" rel="noopener">Telegram</a></li>`);
    if (CFG.whatsapp) links.push(`<li><a href="https://wa.me/${esc(CFG.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a></li>`);
    if (CFG.phone) links.push(`<li><a href="tel:${esc(CFG.phone.replace(/\s/g, ""))}">${esc(CFG.phone)}</a></li>`);
    $("#footLinks").innerHTML = links.join("");
  }

  // ── events ──────────────────────────────────
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-lang],[data-cat],[data-add],[data-inc],[data-dec],[data-rm]");
    if (!el) return;
    const d = el.dataset;
    if (d.lang) { lang = d.lang; store.set("trendly_lang", lang); applyLang(); }
    else if (d.cat) { activeCat = d.cat; renderChips(); renderGrid(); }
    else if (d.add) {
      const sel = $(`input[name="size-${d.add}"]:checked`);
      add(d.add, sel ? sel.value : "");
    }
    else if (d.inc) { cart[+d.inc].qty++; save(); renderCart(); }
    else if (d.dec) { const l = cart[+d.dec]; l.qty > 1 ? l.qty-- : cart.splice(+d.dec, 1); save(); renderCart(); }
    else if (d.rm) { cart.splice(+d.rm, 1); save(); renderCart(); }
  });

  $("#cartOpen").addEventListener("click", openCart);
  $("#cartClose").addEventListener("click", closeCart);
  $("#scrim").addEventListener("click", closeCart);
  $("#toCheckout").addEventListener("click", () => { showView("checkout"); $("#checkoutView input").focus(); });
  $("#backToCart").addEventListener("click", () => showView("cart"));
  $("#checkoutView").addEventListener("submit", (e) => { e.preventDefault(); send(e.submitter?.dataset.send || "ig"); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#drawer").hidden) closeCart(); });

  renderIG(); renderFoot(); applyLang();
})();
