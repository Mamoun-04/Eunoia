import { moodOptions } from "@shared/schema";
import { cn } from "@/lib/utils";

const moodEmojis = {
  very_sad: "😢",
  sad: "😕",
  neutral: "😐",
  happy: "🙂",
  very_happy: "😁"
};

const moodLabels = {
  very_sad: "Sad",
  sad: "Down",
  neutral: "Neutral",
  happy: "Good",
  very_happy: "Great"
};

// Pastel colors for each mood
const moodColors = {
  very_sad: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-500",
  sad: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-500",
  neutral: "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-500",
  happy: "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-500",
  very_happy: "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-500",
};

// Selected mood styles with glow effect
const selectedMoodStyles = {
  very_sad: "bg-blue-100 border-blue-300 ring-2 ring-blue-200 ring-opacity-50 shadow-sm",
  sad: "bg-indigo-100 border-indigo-300 ring-2 ring-indigo-200 ring-opacity-50 shadow-sm",
  neutral: "bg-gray-100 border-gray-300 ring-2 ring-gray-200 ring-opacity-50 shadow-sm",
  happy: "bg-amber-100 border-amber-300 ring-2 ring-amber-200 ring-opacity-50 shadow-sm",
  very_happy: "bg-rose-100 border-rose-300 ring-2 ring-rose-200 ring-opacity-50 shadow-sm",
};

type Props = {
  value: string;
  onChange?: (value: string) => void;
  readonly?: boolean;
};

export function MoodSelector({ value, onChange, readonly }: Props) {
  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="flex justify-between gap-3 w-full">
        {moodOptions.map((mood) => (
          <div key={mood} className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => !readonly && onChange?.(mood)}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-200 border",
                moodColors[mood as keyof typeof moodColors],
                value === mood
                  ? cn(
                      selectedMoodStyles[mood as keyof typeof selectedMoodStyles],
                      "scale-110 transform -translate-y-1"
                    )
                  : "hover:scale-105 hover:-translate-y-0.5",
                readonly && "cursor-default opacity-90 transform-none"
              )}
              disabled={readonly}
              title={moodLabels[mood as keyof typeof moodLabels]}
            >
              {moodEmojis[mood as keyof typeof moodEmojis]}
            </button>
            <span className="text-xs mt-1 text-gray-500 font-medium">
              {moodLabels[mood as keyof typeof moodLabels]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
