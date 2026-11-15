import { useState } from "react";
import type { Review } from "@shared/types.ts";
import { useAdmin } from "../AdminContext.tsx";
import { AdminButton, Badge, ErrorState, FilterTabs, Loading, PageHeader, Panel, Stars, TextArea, Toolbar } from "../components/ui.tsx";
import { adminApi } from "../lib/adminApi.ts";
import { formatDateTime } from "../lib/labels.ts";
import { useResource } from "../lib/useResource.ts";

type Tab = "pending" | "approved" | "all";

const TABS: Record<Tab, { label: string; test: (review: Review) => boolean }> = {
  pending: { label: "To check", test: (review) => !review.approved },
  approved: { label: "Published", test: (review) => review.approved },
  all: { label: "All", test: () => true }
};

function ReviewCard({ review, onChange, onDelete }: { review: Review; onChange: (patch: { approved?: boolean; reply?: string }, message: string) => void; onDelete: () => void }) {
  const [reply, setReply] = useState(review.reply ?? "");

  return (
    <article className="flex flex-col gap-2.5 border border-line bg-white p-4">
      <div className="flex items-center justify-between gap-2.5">
        <div><Stars value={review.rating} /> <b className="ml-1.5">{review.name}</b></div>
        {review.approved ? <Badge className="bg-green-50 text-green-800">Published</Badge> : <Badge className="bg-blue-50 text-blue-700">To check</Badge>}
      </div>
      <p className="whitespace-pre-wrap text-ink">{review.text}</p>
      <p className="text-xs text-muted">{formatDateTime(review.date)}</p>
      <TextArea label="Your public reply (optional)" rows={2} maxLength={1000} value={reply} onChange={(event) => setReply(event.target.value)} />
      <div className="flex flex-wrap gap-1.5">
        {review.approved ? (
          <AdminButton small onClick={() => onChange({ approved: false }, "Removed from the site")}>Unpublish</AdminButton>
        ) : (
          <AdminButton small tone="primary" onClick={() => onChange({ approved: true }, "Published on the site")}>Approve</AdminButton>
        )}
        <AdminButton small onClick={() => onChange({ reply }, "Reply saved")}>Save reply</AdminButton>
        <AdminButton small tone="danger" className="ml-auto" onClick={onDelete}>Delete</AdminButton>
      </div>
    </article>
  );
}

export function ReviewsPage() {
  const { refreshCounts, notify, fail } = useAdmin();
  const { data: reviews, setData, error, loading } = useResource(adminApi.reviews);
  const [chosenTab, setTab] = useState<Tab | null>(null);

  if (loading) return <Loading />;
  if (!reviews) return <ErrorState message={error} />;

  const change = async (review: Review, patch: { approved?: boolean; reply?: string }, message: string) => {
    try {
      const updated = await adminApi.updateReview(review.id, patch);
      setData((list) => list?.map((item) => (item.id === updated.id ? updated : item)));
      notify(message);
      void refreshCounts();
    } catch (failure) {
      fail(failure);
    }
  };

  const remove = async (review: Review) => {
    if (!confirm("Delete this review?")) return;
    try {
      await adminApi.deleteReview(review.id);
      setData((list) => list?.filter((item) => item.id !== review.id));
      notify("Review deleted");
      void refreshCounts();
    } catch (failure) {
      fail(failure);
    }
  };

  const tab: Tab = chosenTab ?? (reviews.some(TABS.pending.test) ? "pending" : "approved");
  const visible = reviews.filter(TABS[tab].test);
  const tabs = (Object.keys(TABS) as Tab[]).map((key) => ({ value: key, label: TABS[key].label, count: reviews.filter(TABS[key].test).length }));

  return (
    <>
      <PageHeader title="Reviews" />
      <Panel>
        <Toolbar><FilterTabs value={tab} options={tabs} onChange={setTab} /></Toolbar>
        {visible.length ? (
          <div className="grid gap-3 p-3.5 min-[821px]:grid-cols-2">
            {visible.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onChange={(patch, message) => void change(review, patch, message)}
                onDelete={() => void remove(review)}
              />
            ))}
          </div>
        ) : (
          <p className="p-10 text-center text-muted">{tab === "pending" ? "Nothing to check." : "No reviews here."}</p>
        )}
      </Panel>
    </>
  );
}
