import type { InfoContent, Localized } from "./types.ts";

export const about: Localized<InfoContent> = {
  hy: {
    title: "Մեր մասին",
    blocks: [
      { kind: "lead", text: "Trendly Shop-ը հագուստի և կոշիկի խանութ է Երևանում։" },
      { kind: "p", text: "Վաճառում ենք կուրտկաներ, հուդիներ, շալվարներ, բոթասներ և աքսեսուարներ։ Նոր ապրանքները նախ հայտնվում են մեր Instagram-ում՝ {instagram}։" },
      { kind: "h2", text: "Ինչպես ենք աշխատում" },
      {
        kind: "list",
        items: [
          "Պատվերը կարող եք ձևակերպել կայքում կամ գրել մեզ Instagram-ում։",
          "Մենք կապվում ենք ձեզ հետ, հաստատում ենք պատվերը, չափսը և առաքման արժեքը։",
          "Առաքում ենք Երևանում և ՀՀ ողջ տարածքում։",
          "Եթե չափսը չհամապատասխանեց, կփոխենք կամ կվերադարձնենք։"
        ]
      },
      { kind: "h2", text: "Կապ" },
      { kind: "contacts" }
    ]
  },
  ru: {
    title: "О нас",
    blocks: [
      { kind: "lead", text: "Trendly Shop — магазин одежды и обуви в Ереване." },
      { kind: "p", text: "Продаём куртки, худи, штаны, кроссовки и аксессуары. Новые вещи сначала появляются в нашем Instagram — {instagram}." },
      { kind: "h2", text: "Как мы работаем" },
      {
        kind: "list",
        items: [
          "Заказ можно оформить на сайте или написать нам в Instagram.",
          "Мы связываемся с вами и подтверждаем заказ, размер и стоимость доставки.",
          "Доставляем по Еревану и всей Армении.",
          "Если размер не подошёл — обменяем или вернём."
        ]
      },
      { kind: "h2", text: "Контакты" },
      { kind: "contacts" }
    ]
  },
  en: {
    title: "About us",
    blocks: [
      { kind: "lead", text: "Trendly Shop is a clothing and shoe shop in Yerevan." },
      { kind: "p", text: "We sell jackets, hoodies, pants, sneakers and accessories. New items show up on our Instagram first: {instagram}." },
      { kind: "h2", text: "How we work" },
      {
        kind: "list",
        items: [
          "Order on the website or message us on Instagram.",
          "We get in touch to confirm the order, the size and the delivery cost.",
          "We deliver in Yerevan and across Armenia.",
          "If the size doesn't fit, we'll exchange it or take it back."
        ]
      },
      { kind: "h2", text: "Contact" },
      { kind: "contacts" }
    ]
  }
};
