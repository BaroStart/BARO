import { FeedbackCard, type FeedbackItem } from "./FeedbackCard";

type Props = {
  feedbacks: FeedbackItem[];
};

export function FeedbackList({ feedbacks }: Props) {
  return (
    <div className="mt-4 space-y-4">
      {feedbacks.map((item) => (
        <FeedbackCard key={item.id} item={item} />
      ))}
    </div>
  );
}