import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewMode = "day" | "week" | "month" | "quarter" | "year";

export interface PeriodState {
  viewMode: ViewMode;
  dateFrom: string;
  dateTo: string;
  may?: string; // Tùy chọn bộ lọc máy
  setViewMode: (mode: ViewMode) => void;
  setDateRange: (from: string, to: string) => void;
  setMachine: (machine?: string) => void;
  shiftPeriod: (direction: "prev" | "next") => void;
}

const toISODate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getRangeForMode = (mode: ViewMode, baseDate: Date = new Date()) => {
  const now = new Date(baseDate.getTime());
  if (mode === "day") {
    return { from: toISODate(now), to: toISODate(now) };
  }
  if (mode === "week") {
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diffToMonday));
    const sunday = new Date(monday.getTime());
    sunday.setDate(monday.getDate() + 6);
    return { from: toISODate(monday), to: toISODate(sunday) };
  }
  if (mode === "month") {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: toISODate(firstDay), to: toISODate(lastDay) };
  }
  if (mode === "quarter") {
    const quarter = Math.floor(now.getMonth() / 3);
    const firstDay = new Date(now.getFullYear(), quarter * 3, 1);
    const lastDay = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
    return { from: toISODate(firstDay), to: toISODate(lastDay) };
  }
  if (mode === "year") {
    const firstDay = new Date(now.getFullYear(), 0, 1);
    const lastDay = new Date(now.getFullYear(), 11, 31);
    return { from: toISODate(firstDay), to: toISODate(lastDay) };
  }
  return { from: toISODate(now), to: toISODate(now) };
};

const shiftDate = (currentFrom: string, mode: ViewMode, direction: "prev" | "next") => {
  const base = new Date(currentFrom || new Date());
  const sign = direction === "next" ? 1 : -1;
  if (mode === "day") {
    base.setDate(base.getDate() + sign);
  } else if (mode === "week") {
    base.setDate(base.getDate() + sign * 7);
  } else if (mode === "month") {
    base.setMonth(base.getMonth() + sign);
  } else if (mode === "quarter") {
    base.setMonth(base.getMonth() + sign * 3);
  } else if (mode === "year") {
    base.setFullYear(base.getFullYear() + sign);
  }
  return getRangeForMode(mode, base);
};

const initialRange = getRangeForMode("month");

export const usePeriodStore = create<PeriodState>()(
  persist(
    (set, get) => ({
      viewMode: "month",
      dateFrom: initialRange.from,
      dateTo: initialRange.to,
      may: undefined,

      setViewMode: (mode) => {
        const range = getRangeForMode(mode);
        set({ viewMode: mode, dateFrom: range.from, dateTo: range.to });
      },

      setDateRange: (from, to) => {
        set({ dateFrom: from, dateTo: to });
      },

      setMachine: (machine) => {
        set({ may: machine || undefined });
      },

      shiftPeriod: (direction) => {
        const { dateFrom, viewMode } = get();
        const nextRange = shiftDate(dateFrom, viewMode, direction);
        set({ dateFrom: nextRange.from, dateTo: nextRange.to });
      },
    }),
    {
      name: "stax-dashboard-period-store",
    }
  )
);
