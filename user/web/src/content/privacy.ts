import type { InfoContent, Localized } from "./types.ts";

export const PRIVACY_UPDATED = "2026-11-10";

export const privacy: Localized<InfoContent> = {
  hy: {
    title: "Գաղտնիության քաղաքականություն",
    blocks: [
      { kind: "meta", text: "Վերջին թարմացում՝ {updated}" },
      { kind: "p", text: "Այս էջը բացատրում է, թե ինչ տվյալներ է հավաքում Trendly Shop-ը (Երևան), ինչու և ինչպես կարող եք մեզ հետ կապվել դրանց վերաբերյալ։" },
      { kind: "h2", text: "Ինչ տվյալներ ենք հավաքում" },
      {
        kind: "list",
        items: [
          { label: "Պատվերներ.", text: "անուն, հեռախոս, առաքման հասցե, մեկնաբանություն և պատվիրված ապրանքները։ Դրանք պահվում են մեր սերվերում և ուղարկվում են ձեր ընտրած մեսենջերով։" },
          { label: "Կարծիքներ.", text: "անուն, գնահատական և տեքստ։ Հաստատումից հետո դրանք հրապարակվում են կայքում՝ ամսաթվով։" },
          { label: "Հաշիվ.", text: "երբ գրանցումը հասանելի լինի՝ անուն և էլ. փոստ (կամ Google հաշվի տվյալներ, եթե մուտք գործեք Google-ով)։" },
          { label: "Ձեր սարքում.", text: "զամբյուղը և ընտրված լեզուն պահվում են ձեր բրաուզերում (localStorage) և մեզ չեն ուղարկվում։" }
        ]
      },
      { kind: "h2", text: "Ինչի համար" },
      {
        kind: "list",
        items: [
          "Պատվերը հաստատելու, առաքելու և ձեզ հետ կապվելու համար։",
          "Փոխանակման և վերադարձի համար։",
          "Կարծիքները կայքում ցույց տալու համար։"
        ]
      },
      { kind: "p", text: "Մենք չենք վաճառում ձեր տվյալները և չենք օգտագործում դրանք գովազդի համար։" },
      { kind: "h2", text: "Երրորդ կողմեր" },
      {
        kind: "list",
        items: [
          { label: "WhatsApp, Telegram, Instagram.", text: "երբ պատվերը ուղարկում եք մեսենջերով, գործում են նաև այդ ծառայության կանոնները։" },
          { label: "Google Fonts.", text: "կայքի տառատեսակները բեռնվում են Google-ի սերվերներից, ուստի Google-ը տեսնում է ձեր IP հասցեն։" },
          { label: "Google.", text: "եթե մուտք գործեք Google-ով՝ գրանցումը միացնելուց հետո։" }
        ]
      },
      { kind: "h2", text: "Որքան ժամանակ ենք պահում" },
      { kind: "p", text: "Պատվերի տվյալները պահում ենք այնքան, որքան անհրաժեշտ է պատվերը կատարելու, փոխանակման կամ վերադարձի համար։ Կարծիքը կհեռացնենք ձեր խնդրանքով։" },
      { kind: "h2", text: "Ձեր իրավունքները" },
      { kind: "p", text: "Կարող եք խնդրել ցույց տալ, ուղղել կամ ջնջել ձեր տվյալները։ Գրեք մեզ." },
      { kind: "contacts" },
      { kind: "h2", text: "Փոփոխություններ" },
      { kind: "p", text: "Եթե փոխենք այս քաղաքականությունը, կթարմացնենք այս էջը և ամսաթիվը վերևում։" }
    ]
  },
  ru: {
    title: "Политика конфиденциальности",
    blocks: [
      { kind: "meta", text: "Последнее обновление: {updated}" },
      { kind: "p", text: "На этой странице написано, какие данные собирает Trendly Shop (Ереван), зачем, и как связаться с нами по поводу ваших данных." },
      { kind: "h2", text: "Какие данные мы собираем" },
      {
        kind: "list",
        items: [
          { label: "Заказы:", text: "имя, телефон, адрес доставки, комментарий и заказанные товары. Они хранятся на нашем сервере и отправляются через выбранный вами мессенджер." },
          { label: "Отзывы:", text: "имя, оценка и текст. После проверки они публикуются на сайте с датой." },
          { label: "Аккаунт:", text: "когда регистрация заработает — имя и эл. почта (или данные Google-аккаунта, если войдёте через Google)." },
          { label: "На вашем устройстве:", text: "корзина и выбранный язык хранятся в вашем браузере (localStorage) и нам не отправляются." }
        ]
      },
      { kind: "h2", text: "Зачем" },
      {
        kind: "list",
        items: [
          "Чтобы подтвердить и доставить заказ и связаться с вами.",
          "Для обмена и возврата.",
          "Чтобы показывать отзывы на сайте."
        ]
      },
      { kind: "p", text: "Мы не продаём ваши данные и не используем их для рекламы." },
      { kind: "h2", text: "Третьи стороны" },
      {
        kind: "list",
        items: [
          { label: "WhatsApp, Telegram, Instagram:", text: "когда вы отправляете заказ через мессенджер, действуют и правила этого сервиса." },
          { label: "Google Fonts:", text: "шрифты сайта загружаются с серверов Google, поэтому Google видит ваш IP-адрес." },
          { label: "Google:", text: "если войдёте через Google — после того как вход заработает." }
        ]
      },
      { kind: "h2", text: "Сколько храним" },
      { kind: "p", text: "Данные заказа храним столько, сколько нужно, чтобы выполнить заказ, обмен или возврат. Отзыв удалим по вашей просьбе." },
      { kind: "h2", text: "Ваши права" },
      { kind: "p", text: "Вы можете попросить показать, исправить или удалить ваши данные. Напишите нам:" },
      { kind: "contacts" },
      { kind: "h2", text: "Изменения" },
      { kind: "p", text: "Если мы изменим эту политику, мы обновим эту страницу и дату вверху." }
    ]
  },
  en: {
    title: "Privacy policy",
    blocks: [
      { kind: "meta", text: "Last updated: {updated}" },
      { kind: "p", text: "This page explains what data Trendly Shop (Yerevan) collects, why, and how to contact us about it." },
      { kind: "h2", text: "What we collect" },
      {
        kind: "list",
        items: [
          { label: "Orders:", text: "name, phone, delivery address, note and the items ordered. They are stored on our server and sent through the messenger you choose." },
          { label: "Reviews:", text: "name, rating and text. Once approved they are shown on the site with the date." },
          { label: "Account:", text: "once sign-up is available, your name and email (or your Google account details if you sign in with Google)." },
          { label: "On your device:", text: "your cart and chosen language are kept in your browser (localStorage) and are not sent to us." }
        ]
      },
      { kind: "h2", text: "Why" },
      {
        kind: "list",
        items: [
          "To confirm and deliver your order and to contact you.",
          "To handle exchanges and returns.",
          "To show reviews on the site."
        ]
      },
      { kind: "p", text: "We don't sell your data or use it for advertising." },
      { kind: "h2", text: "Third parties" },
      {
        kind: "list",
        items: [
          { label: "WhatsApp, Telegram, Instagram:", text: "when you send an order through a messenger, that service's own rules also apply." },
          { label: "Google Fonts:", text: "the site's fonts load from Google's servers, so Google sees your IP address." },
          { label: "Google:", text: "if you sign in with Google, once sign-in is available." }
        ]
      },
      { kind: "h2", text: "How long we keep it" },
      { kind: "p", text: "We keep order data as long as we need it to fulfil the order and handle an exchange or return. We'll remove your review if you ask." },
      { kind: "h2", text: "Your rights" },
      { kind: "p", text: "You can ask us to show, correct or delete your data. Message us:" },
      { kind: "contacts" },
      { kind: "h2", text: "Changes" },
      { kind: "p", text: "If we change this policy, we'll update this page and the date at the top." }
    ]
  }
};
