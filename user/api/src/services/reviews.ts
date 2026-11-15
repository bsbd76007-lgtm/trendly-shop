import type { NewReviewRequest, PublicReview, Review } from "../../../shared/types.ts";
import { db } from "../db/client.ts";
import { toReview } from "../db/mappers.ts";
import { missing } from "../lib/errors.ts";
import { clean, makeId } from "../lib/text.ts";

export async function listReviews(): Promise<Review[]> {
  return (await db.review.findMany({ orderBy: { createdAt: "desc" } })).map(toReview);
}

export async function listPublicReviews(): Promise<PublicReview[]> {
  const rows = await db.review.findMany({ where: { approved: true }, orderBy: { createdAt: "desc" } });
  return rows.map((row) => ({ id: row.id, name: row.name, rating: row.rating, text: row.text, date: row.createdAt.toISOString(), reply: row.reply }));
}

export async function submitReview(input: NewReviewRequest): Promise<void> {
  await db.review.create({ data: { id: makeId("R"), ...input } });
  console.log(`New review from ${input.name} (${input.rating}★), waiting for approval`);
}

export async function updateReview(id: string, patch: { approved?: unknown; reply?: unknown }): Promise<Review> {
  const data: { approved?: boolean; reply?: string } = {};
  if (patch.approved !== undefined) data.approved = Boolean(patch.approved);
  if (patch.reply !== undefined) data.reply = clean(patch.reply, 1000);
  const result = await db.review.updateMany({ where: { id }, data });
  if (!result.count) missing("Review not found");
  return toReview((await db.review.findUnique({ where: { id } }))!);
}

export async function deleteReview(id: string): Promise<void> {
  const result = await db.review.deleteMany({ where: { id } });
  if (!result.count) missing("Review not found");
}
