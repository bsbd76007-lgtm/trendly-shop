import type { FaqContent, Localized } from "./types.ts";

export const faq: Localized<FaqContent> = {
  hy: {
    title: "Հաճախ տրվող հարցեր",
    items: [
      { q: "Ինչպե՞ս պատվիրել", a: "Ավելացրեք ապրանքը զամբյուղ, ընտրեք չափսը, լրացրեք անունը, հեռախոսը և հասցեն և ուղարկեք պատվերը WhatsApp-ով, Telegram-ով կամ Instagram-ով։ Կարող եք նաև պարզապես գրել մեզ Instagram-ում՝ {instagram}։" },
      { q: "Առաքո՞ւմ եք Երևանից դուրս", a: "Այո, առաքում ենք ՀՀ ողջ տարածքում։" },
      { q: "Որքա՞ն արժե առաքումը", a: "Առաքման արժեքը կախված է հասցեից։ Այն կասենք, երբ կհաստատենք պատվերը։" },
      { q: "Ի՞նչ անել, եթե չափսը չհամապատասխանեց", a: "Գրեք մեզ, և կփոխենք ապրանքը այլ չափսով կամ կվերադարձնենք այն։" },
      { q: "Ինչպե՞ս ընտրել չափսը", a: "Հագուստը՝ S–XXL, կոշիկը՝ 40–45։ Եթե վստահ չեք, գրեք մեզ, և կասենք կոնկրետ ապրանքի չափերը։" },
      { q: "Ի՞նչ է նշանակում «Գինը՝ հարցմամբ»", a: "Այդ ապրանքի գինը դեռ կայքում չէ։ Գրեք մեզ Instagram-ում, և կասենք գինը։" },
      { q: "Ինչպե՞ս ստանալ 15% զեղչը", a: "Գրանցվեք կայքում, և զեղչը կկիրառվի ձեր առաջին պատվերին։" },
      { q: "Կարո՞ղ եմ փոխել կամ չեղարկել պատվերը", a: "Այո, գրեք մեզ որքան հնարավոր է շուտ, մինչև առաքումը։" },
      { q: "Ինչպե՞ս թողնել կարծիք", a: "Գլխավոր էջի ներքևում կա կարծիքի ձև։ Կարծիքը հայտնվում է կայքում ստուգումից հետո։" }
    ]
  },
  ru: {
    title: "Частые вопросы",
    items: [
      { q: "Как заказать?", a: "Добавьте товар в корзину, выберите размер, укажите имя, телефон и адрес и отправьте заказ через WhatsApp, Telegram или Instagram. Можно и просто написать нам в Instagram — {instagram}." },
      { q: "Доставляете за пределы Еревана?", a: "Да, доставляем по всей Армении." },
      { q: "Сколько стоит доставка?", a: "Стоимость зависит от адреса. Мы назовём её, когда будем подтверждать заказ." },
      { q: "Что делать, если не подошёл размер?", a: "Напишите нам — обменяем на другой размер или вернём." },
      { q: "Как выбрать размер?", a: "Одежда — S–XXL, обувь — 40–45. Если сомневаетесь, напишите нам, и мы пришлём замеры конкретной вещи." },
      { q: "Что значит «Цена по запросу»?", a: "Цены на эту вещь пока нет на сайте. Напишите нам в Instagram, и мы скажем цену." },
      { q: "Как получить скидку 15%?", a: "Зарегистрируйтесь на сайте, и скидка применится к вашему первому заказу." },
      { q: "Можно изменить или отменить заказ?", a: "Да, напишите нам как можно раньше, до доставки." },
      { q: "Как оставить отзыв?", a: "Внизу главной страницы есть форма отзыва. Отзыв появляется на сайте после проверки." }
    ]
  },
  en: {
    title: "FAQ",
    items: [
      { q: "How do I order?", a: "Add an item to the cart, choose the size, enter your name, phone and address, and send the order through WhatsApp, Telegram or Instagram. You can also just message us on Instagram: {instagram}." },
      { q: "Do you deliver outside Yerevan?", a: "Yes, we deliver across Armenia." },
      { q: "How much is delivery?", a: "It depends on the address. We'll tell you the cost when we confirm your order." },
      { q: "What if the size doesn't fit?", a: "Message us and we'll exchange it for another size or take it back." },
      { q: "How do I choose my size?", a: "Clothes come in S–XXL, shoes in 40–45. If you're not sure, message us and we'll send the measurements of that item." },
      { q: "What does \"Price on request\" mean?", a: "The price of that item isn't on the website yet. Message us on Instagram and we'll tell you." },
      { q: "How do I get the 15% discount?", a: "Sign up on the website and the discount applies to your first order." },
      { q: "Can I change or cancel my order?", a: "Yes, message us as early as you can, before delivery." },
      { q: "How do I leave a review?", a: "There's a review form at the bottom of the home page. Reviews appear on the site after we check them." }
    ]
  }
};
