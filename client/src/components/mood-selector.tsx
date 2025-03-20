import { moodOptions } from "@shared/schema";
import { cn } from "@/lib/utils";

const moodEmojis = {
  very_sad: "😢",
  sad: "😕",
  neutral: "😐",
  happy: "😊",
  very_happy: "😄"
};

type Props = {
  value: string;
  onChange?: (value: string) => void;
  readonly?: boolean;
};

export function MoodSelector({ value, onChange, readonly }: Props) {
  return (
    <div className="flex gap-2">
      {moodOptions.map((mood) => (
        <button
          key={mood}
          type="button"
          onClick={() => !readonly && onChange?.(mood)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-xl transition-transform",
            value === mood
              ? "bg-primary/10 scale-110"
              : "hover:bg-primary/5",
            readonly && "cursor-default"
          )}
          disabled={readonly}
        >
          {moodEmojis[mood as keyof typeof moodEmojis]}
        </button>
      ))}
    </div>
  );
}
