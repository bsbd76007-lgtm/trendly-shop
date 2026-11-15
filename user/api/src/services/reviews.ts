import type { NewReviewRequest, PublicReview, Review } from "../../../shared/types.ts";
import { missing } from "../lib/errors.ts";
import { load, update } from "../lib/store.ts";
import { clean, makeId } from "../lib/text.ts";

const newestFirst = (a: Review, b: Review) => (a.date < b.date ? 1 : -1);

export async function listReviews(): Promise<Review[]> {
  return (await load<Review[]>("reviews", [])).sort(newestFirst);
}

export async function listPublicReviews(): Promise<PublicReview[]> {
  return (await listReviews())
    .filter((review) => review.approved)
    .map(({ id, name, rating, text, date, reply }) => ({ id, name, rating, text, date, reply: reply ?? "" }));
}

export async function submitReview(input: NewReviewRequest): Promise<void> {
  await update<Review[], void>("reviews", [], (list) => {
    list.push({ id: makeId("R"), ...input, date: new Date().toISOString(), approved: false });
  });
  console.log(`New review from ${input.name} (${input.rating}★), waiting for approval`);
}

export function updateReview(id: string, patch: { approved?: unknown; reply?: unknown }): Promise<Review> {
  return update<Review[], Review>("reviews", [], (list) => {
    const review = list.find((item) => item.id === id) ?? missing("Review not found");
    if (patch.approved !== undefined) review.approved = Boolean(patch.approved);
    if (patch.reply !== undefined) review.reply = clean(patch.reply, 1000);
    return review;
  });
}

export function deleteReview(id: string): Promise<void> {
  return update<Review[], void>("reviews", [], (list) => {
    const index = list.findIndex((item) => item.id === id);
    if (index < 0) missing("Review not found");
    list.splice(index, 1);
  });
}
