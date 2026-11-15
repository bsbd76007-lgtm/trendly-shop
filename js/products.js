// ─────────────────────────────────────────────
//  Catalog — prices from the "ծախում ենք" price list (AMD)
//
//  img:   path to the photo. Put files in assets/img/products/ (or instagram/).
//         If the file is missing, the card shows a styled placeholder.
//  sizes: "clothes" | "shoes" | "one"  (see config.js)
//  cat:   outerwear | tops | bottoms | shoes | accessories
// ─────────────────────────────────────────────
window.PRODUCTS = [
  { id: "marlboro-polo-jacket", cat: "tops", brand: "Marlboro", price: 12000, sizes: "clothes",
    img: "assets/img/products/marlboro-polo-jacket.jpg",
    name: { hy: "Marlboro պոլո բաճկոն", ru: "Кофта-поло Marlboro", en: "Marlboro polo jacket" } },

  { id: "polo-cap-bear", cat: "accessories", brand: "Polo", price: 6000, sizes: "one",
    img: "assets/img/products/polo-cap-bear.jpg",
    name: { hy: "Polo գլխարկ արջուկով", ru: "Кепка Polo с мишкой", en: "Polo bear cap" } },

  { id: "moncler-jacket", cat: "outerwear", brand: "Moncler", price: 23000, sizes: "clothes",
    img: "assets/img/products/moncler-jacket.jpg",
    name: { hy: "Moncler կուրտկա", ru: "Куртка Moncler", en: "Moncler jacket" } },

  { id: "polo-cap", cat: "accessories", brand: "Polo", price: 6000, sizes: "one",
    img: "assets/img/products/polo-cap.jpg",
    name: { hy: "Polo գլխարկ", ru: "Кепка Polo", en: "Polo cap" } },

  { id: "nike-sneakers-grey", cat: "shoes", brand: "Nike", price: 12000, sizes: "shoes",
    img: "assets/img/products/nike-sneakers-grey.jpg",
    name: { hy: "Nike բոթաս, մոխրագույն", ru: "Кроссовки Nike, серые", en: "Nike sneakers, grey" } },

  { id: "polo-jacket", cat: "tops", brand: "Polo", price: 13000, sizes: "clothes",
    img: "assets/img/products/polo-jacket.jpg",
    name: { hy: "Polo բաճկոն", ru: "Кофта Polo", en: "Polo jacket" } },

  { id: "new-balance", cat: "shoes", brand: "New Balance", price: 15000, sizes: "shoes",
    img: "assets/img/products/new-balance.jpg",
    name: { hy: "New Balance բոթաս", ru: "Кроссовки New Balance", en: "New Balance sneakers" } },

  { id: "polo-puffer", cat: "outerwear", brand: "Polo", price: 25000, sizes: "clothes",
    img: "assets/img/products/polo-puffer.jpg",
    name: { hy: "Polo կուրտկա", ru: "Куртка Polo", en: "Polo puffer jacket" } },

  { id: "nike-p6000", cat: "shoes", brand: "Nike", price: 16000, sizes: "shoes",
    img: "assets/img/products/nike-p6000.jpg",
    name: { hy: "Nike P-6000", ru: "Nike P-6000", en: "Nike P-6000" } },

  { id: "tommy-bag", cat: "accessories", brand: "Tommy", price: 6000, sizes: "one",
    img: "assets/img/products/tommy-bag.jpg",
    name: { hy: "Tommy բարսետկա", ru: "Барсетка Tommy", en: "Tommy crossbody bag" } },

  { id: "polo-half-zip", cat: "tops", brand: "Polo", price: 10000, sizes: "clothes",
    img: "assets/img/products/polo-half-zip.jpg",
    name: { hy: "Polo կիսաշղթա", ru: "Полузамок Polo", en: "Polo half-zip" } },

  // NOTE: price list said 112000 — looks like a typo, set to 12000. Check!
  { id: "nike-blue-white", cat: "tops", brand: "Nike", price: 12000, sizes: "clothes",
    img: "assets/img/products/nike-blue-white.jpg",
    name: { hy: "Nike, կապույտ-սպիտակ", ru: "Nike, сине-белый", en: "Nike, blue & white" } },

  // Photo guess: grey Nike zip hoodie from Instagram (ig-03). Replace if wrong.
  { id: "nike-grey-black", cat: "tops", brand: "Nike", price: 12000, sizes: "clothes",
    img: "assets/img/instagram/ig-03.jpg",
    name: { hy: "Nike, մոխրագույն-սև", ru: "Nike, серо-чёрный", en: "Nike, grey & black" } },

  { id: "chrome-hearts-jacket", cat: "tops", brand: "Chrome Hearts", price: 16000, sizes: "clothes",
    img: "assets/img/products/chrome-hearts-jacket.jpg",
    name: { hy: "Chrome Hearts բաճկոն", ru: "Кофта Chrome Hearts", en: "Chrome Hearts jacket" } },

  // Photo guess: hoodie with check lining from Instagram (ig-07). Replace if wrong.
  { id: "burberry-jacket", cat: "outerwear", brand: "Burberry", price: 27000, sizes: "clothes",
    img: "assets/img/instagram/ig-07.jpg",
    name: { hy: "Burberry կուրտկա", ru: "Куртка Burberry", en: "Burberry jacket" } },

  { id: "floral-pants", cat: "bottoms", brand: "Trendly", price: 10000, sizes: "clothes",
    img: "assets/img/products/floral-pants.jpg",
    name: { hy: "Ծաղիկներով շալվար", ru: "Штаны с цветами", en: "Floral pants" } },

  { id: "letter-hoodie", cat: "tops", brand: "Hoodie", price: 13000, sizes: "clothes",
    img: "assets/img/products/letter-hoodie.jpg",
    name: { hy: "Հուդի տառերով, մոխրագույն-սև", ru: "Худи с буквами, серо-чёрное", en: "Letter hoodie, grey & black" } },

  { id: "polo-tracksuit", cat: "bottoms", brand: "Polo", price: 20000, sizes: "clothes",
    img: "assets/img/products/polo-tracksuit.jpg",
    name: { hy: "Polo կոմպլեկտ (վերև + ներքև)", ru: "Костюм Polo (верх + низ)", en: "Polo tracksuit (top + bottom)" } },

  { id: "polo-tracksuit-bottom", cat: "bottoms", brand: "Polo", price: 8000, sizes: "clothes",
    img: "assets/img/products/polo-tracksuit-bottom.jpg",
    name: { hy: "Polo կոմպլեկտի ներքև", ru: "Низ от костюма Polo", en: "Polo tracksuit bottom" } },

  { id: "polo-tracksuit-top", cat: "tops", brand: "Polo", price: 12000, sizes: "clothes",
    img: "assets/img/products/polo-tracksuit-top.jpg",
    name: { hy: "Polo կոմպլեկտի վերև", ru: "Верх от костюма Polo", en: "Polo tracksuit top" } }
];

// Latest Instagram posts (photos saved as assets/img/instagram/ig-01.jpg … ig-12.jpg)
window.IG_POSTS = [
  { img: "assets/img/instagram/ig-01.jpg", url: "https://www.instagram.com/p/DfcXIyOsTVS/" },
  { img: "assets/img/instagram/ig-02.jpg", url: "https://www.instagram.com/p/DfcXAaysF4p/" },
  { img: "assets/img/instagram/ig-03.jpg", url: "https://www.instagram.com/p/DfcW2rhslaU/" },
  { img: "assets/img/instagram/ig-04.jpg", url: "https://www.instagram.com/p/DfcWw0TsfgY/" },
  { img: "assets/img/instagram/ig-05.jpg", url: "https://www.instagram.com/p/DfcWUEdMDwq/" },
  { img: "assets/img/instagram/ig-06.jpg", url: "https://www.instagram.com/p/DfcWL5Cs7O7/" },
  { img: "assets/img/instagram/ig-07.jpg", url: "https://www.instagram.com/p/DfcVc-fMEm0/" },
  { img: "assets/img/instagram/ig-08.jpg", url: "https://www.instagram.com/p/DfFkkKoMPVu/" },
  { img: "assets/img/instagram/ig-09.jpg", url: "https://www.instagram.com/p/DfFj_2nMXDr/" },
  { img: "assets/img/instagram/ig-10.jpg", url: "https://www.instagram.com/p/DfFjS2-swl2/" },
  { img: "assets/img/instagram/ig-11.jpg", url: "https://www.instagram.com/p/DfFjCdqsD0N/" },
  { img: "assets/img/instagram/ig-12.jpg", url: "https://www.instagram.com/p/DfFie_1Mraw/" }
];
