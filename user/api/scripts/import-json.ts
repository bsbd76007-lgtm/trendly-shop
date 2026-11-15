import { readFile } from "node:fs/promises";
import { DEFAULT_SETTINGS } from "../../shared/constants.ts";
import type { InstagramPost, Order, Product, Review, Settings, SupportChat, User } from "../../shared/types.ts";
import { DATA_DIR } from "../src/config/env.ts";
import { db } from "../src/db/client.ts";
import { fromProduct } from "../src/db/mappers.ts";

async function read<T>(name: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(`${DATA_DIR}${name}.json`, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

const date = (value: string | undefined) => (value ? new Date(value) : new Date());

async function main() {
  const [products, posts, settings, reviews, orders, chats, users] = await Promise.all([
    read<Product[]>("products", []),
    read<InstagramPost[]>("instagram", []),
    read<Partial<Settings>>("settings", {}),
    read<Review[]>("reviews", []),
    read<Order[]>("orders", []),
    read<SupportChat[]>("support", []),
    read<User[]>("users", [])
  ]);
  const { cards = [], ...fields } = { ...DEFAULT_SETTINGS, ...settings };

  await db.$transaction(async (tx) => {
    for (const [position, product] of products.entries()) {
      const data = { position, ...fromProduct(product) };
      await tx.product.upsert({ where: { id: product.id }, create: { id: product.id, ...data }, update: data });
    }

    await tx.instagramPost.deleteMany();
    await tx.instagramPost.createMany({ data: posts.map((post, position) => ({ img: post.img, url: post.url ?? "", position })) });

    await tx.settings.upsert({ where: { id: 1 }, create: { id: 1, ...fields }, update: fields });
    await tx.paymentCard.deleteMany();
    await tx.paymentCard.createMany({ data: cards.map((card, position) => ({ ...card, position })) });

    for (const review of reviews) {
      const data = { name: review.name, rating: review.rating, text: review.text, reply: review.reply ?? "", approved: review.approved, createdAt: date(review.date) };
      await tx.review.upsert({ where: { id: review.id }, create: { id: review.id, ...data }, update: data });
    }

    for (const user of users) {
      const data = { email: user.email.toLowerCase(), name: user.name, passwordHash: user.passwordHash ?? null, googleId: user.googleId ?? null, createdAt: date(user.createdAt) };
      await tx.user.upsert({ where: { id: user.id }, create: { id: user.id, ...data }, update: data });
    }

    for (const order of orders) {
      const data = {
        createdAt: date(order.createdAt),
        status: order.status ?? "new",
        adminNote: order.adminNote ?? "",
        channel: order.channel ?? "",
        lang: order.lang ?? "",
        customerName: order.customer.name,
        customerPhone: order.customer.phone,
        customerAddress: order.customer.address,
        customerNote: order.customer.note ?? "",
        customerEmail: order.customer.email ?? null,
        customerUpdate: order.customerUpdate ?? "",
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        paymentStatus: order.payment?.status ?? "awaiting",
        paymentToken: order.payment?.token ?? crypto.randomUUID().replace(/-/g, ""),
        receipt: order.payment?.receipt ?? null,
        paymentSubmittedAt: order.payment?.submittedAt ? new Date(order.payment.submittedAt) : null,
        paymentDecidedAt: order.payment?.decidedAt ? new Date(order.payment.decidedAt) : null,
        userId: order.userId && users.some((user) => user.id === order.userId) ? order.userId : null
      };
      await tx.orderItem.deleteMany({ where: { orderId: order.id } });
      await tx.orderStatusChange.deleteMany({ where: { orderId: order.id } });
      await tx.order.upsert({
        where: { id: order.id },
        create: { id: order.id, ...data },
        update: data
      });
      await tx.orderItem.createMany({
        data: order.items.map((item, position) => ({ orderId: order.id, position, productId: item.id, name: item.name, size: item.size ?? "", qty: item.qty, price: item.price, sum: item.sum }))
      });
      await tx.orderStatusChange.createMany({ data: (order.history ?? []).map((change) => ({ orderId: order.id, status: change.status, at: date(change.at) })) });
    }

    for (const chat of chats) {
      const data = { token: chat.token, name: chat.name ?? "", unread: chat.unread ?? 0, createdAt: date(chat.createdAt), updatedAt: date(chat.updatedAt) };
      await tx.supportMessage.deleteMany({ where: { chatId: chat.id } });
      await tx.supportChat.upsert({ where: { id: chat.id }, create: { id: chat.id, ...data }, update: data });
      await tx.supportMessage.createMany({ data: chat.messages.map((message) => ({ chatId: chat.id, from: message.from, text: message.text, at: date(message.at) })) });
    }
  }, { timeout: 60_000 });

  console.log(`Imported: ${products.length} products, ${posts.length} Instagram posts, ${cards.length} cards, ${reviews.length} reviews, ${users.length} users, ${orders.length} orders, ${chats.length} chats.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
