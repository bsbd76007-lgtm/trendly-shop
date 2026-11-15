import type {
  Category,
  InstagramPost,
  Lang,
  Order,
  OrderStatus,
  PaymentCard,
  PaymentStatus,
  Product,
  Review,
  Settings,
  SizeSet,
  SupportAuthor,
  SupportChat,
  SupportMessage,
  User
} from "../../../shared/types.ts";
import type * as Row from "../generated/prisma/client.ts";

export const orderInclude = {
  items: { orderBy: { position: "asc" } },
  history: { orderBy: { at: "asc" } }
} as const;

export type OrderRow = Row.Order & { items: Row.OrderItem[]; history: Row.OrderStatusChange[] };
export type ChatRow = Row.SupportChat & { messages: Row.SupportMessage[] };

export const toProduct = (row: Row.Product): Product => ({
  id: row.id,
  cat: row.cat as Category,
  brand: row.brand,
  price: row.price,
  sizes: row.sizes as SizeSet,
  img: row.img,
  name: { hy: row.nameHy, ru: row.nameRu, en: row.nameEn },
  hidden: row.hidden
});

export const fromProduct = (product: Product) => ({
  cat: product.cat,
  brand: product.brand,
  price: product.price,
  sizes: product.sizes,
  img: product.img,
  nameHy: product.name.hy,
  nameRu: product.name.ru,
  nameEn: product.name.en,
  hidden: product.hidden
});

export const toInstagram = (row: Row.InstagramPost): InstagramPost => ({ img: row.img, url: row.url });

export const toCard = (row: Row.PaymentCard): PaymentCard => ({ bank: row.bank, number: row.number, holder: row.holder });

export const toSettings = (row: Row.Settings, cards: Row.PaymentCard[]): Settings => ({
  name: row.name,
  city: row.city,
  instagram: row.instagram,
  whatsapp: row.whatsapp,
  telegram: row.telegram,
  phone: row.phone,
  deliveryFee: row.deliveryFee,
  defaultLang: row.defaultLang as Lang,
  sizes: row.sizes as Settings["sizes"],
  cards: cards.map(toCard)
});

export const toReview = (row: Row.Review): Review => ({
  id: row.id,
  name: row.name,
  rating: row.rating,
  text: row.text,
  date: row.createdAt.toISOString(),
  approved: row.approved,
  ...(row.reply ? { reply: row.reply } : {})
});

export const toUser = (row: Row.User): User => ({
  id: row.id,
  email: row.email,
  name: row.name,
  createdAt: row.createdAt.toISOString(),
  ...(row.passwordHash ? { passwordHash: row.passwordHash } : {}),
  ...(row.googleId ? { googleId: row.googleId } : {})
});

export const toOrder = (row: OrderRow): Order => ({
  id: row.id,
  createdAt: row.createdAt.toISOString(),
  status: row.status as OrderStatus,
  adminNote: row.adminNote,
  channel: row.channel,
  lang: row.lang,
  customer: {
    name: row.customerName,
    phone: row.customerPhone,
    address: row.customerAddress,
    note: row.customerNote,
    ...(row.customerEmail ? { email: row.customerEmail } : {})
  },
  items: row.items.map((item) => ({ id: item.productId, name: item.name, size: item.size, qty: item.qty, price: item.price, sum: item.sum })),
  subtotal: row.subtotal,
  deliveryFee: row.deliveryFee,
  total: row.total,
  history: row.history.map((change) => ({ status: change.status as OrderStatus, at: change.at.toISOString() })),
  payment: {
    status: row.paymentStatus as PaymentStatus,
    token: row.paymentToken,
    ...(row.receipt ? { receipt: row.receipt } : {}),
    ...(row.paymentSubmittedAt ? { submittedAt: row.paymentSubmittedAt.toISOString() } : {}),
    ...(row.paymentDecidedAt ? { decidedAt: row.paymentDecidedAt.toISOString() } : {})
  },
  customerUpdate: row.customerUpdate,
  ...(row.userId ? { userId: row.userId } : {})
});

export const toMessage = (row: Row.SupportMessage): SupportMessage => ({ from: row.from as SupportAuthor, text: row.text, at: row.at.toISOString() });

export const toChat = (row: ChatRow): SupportChat => ({
  id: row.id,
  token: row.token,
  name: row.name,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
  unread: row.unread,
  messages: row.messages.map(toMessage)
});
