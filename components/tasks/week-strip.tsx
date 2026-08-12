"use client";

import { addDays, format, startOfWeek } from "date-fns";
import { WandSparkles } from "lucide-react";

export function WeekStrip() {
  const today = new Date();

  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const todayLabel = format(today, "yyyy-MM-dd");

  return (
    <section
      aria-label="This week"
      className="flex items-center gap-2 overflow-x-auto pb-1"
    >
      {days.map((day) => {
        const isToday = format(day, "yyyy-MM-dd") === todayLabel;
        return (
          <div
            className={`grid min-w-15 place-items-center rounded-2xl px-3 py-2.5 text-center transition-colors ${isToday ? "bg-[#5545d6] text-white shadow-[0_5px_0_#3e32a4]" : "border-border text-muted-foreground border bg-white"}`}
            key={day.toISOString()}
          >
            <span
              className={`text-[10px] font-bold tracking-[0.12em] uppercase ${isToday ? "text-[#dcd8ff]" : ""}`}
            >
              {format(day, "EEE")}
            </span>
            <span className="mt-0.5 text-lg font-extrabold tracking-[-0.04em]">
              {format(day, "d")}
            </span>
          </div>
        );
      })}
      <div className="ml-auto hidden items-center gap-2 rounded-2xl bg-[#e6e1ff] px-4 py-3 text-sm font-semibold text-[#5545b8] sm:flex">
        <WandSparkles aria-hidden="true" className="size-4" /> Flexible day
      </div>
    </section>
  );
}
