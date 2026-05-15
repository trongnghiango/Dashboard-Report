import React, { useState, useEffect } from "react";
import { usePeriodStore, type ViewMode } from "@/stores/usePeriodStore";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

const viewModeLabels: Record<ViewMode, string> = {
  day: "Ngày",
  week: "Tuần",
  month: "Tháng",
  quarter: "Quý",
  year: "Năm",
};

const formatShortDate = (str: string) => {
  if (!str) return "";
  const parts = str.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  return str;
};

const getPeriodLabel = (mode: ViewMode, from: string) => {
  if (!from) return "";
  const d = new Date(from);
  const y = d.getFullYear();
  if (mode === "day") {
    return `Ngày ${d.getDate()}/${d.getMonth() + 1}/${y}`;
  }
  if (mode === "week") {
    return `Tuần từ ${d.getDate()}/${d.getMonth() + 1}/${y}`;
  }
  if (mode === "month") {
    return `Tháng ${d.getMonth() + 1}, ${y}`;
  }
  if (mode === "quarter") {
    const q = Math.floor(d.getMonth() / 3) + 1;
    return `Quý ${q}, ${y}`;
  }
  if (mode === "year") {
    return `Năm ${y}`;
  }
  return from;
};

export function PeriodToolbar() {
  const { viewMode, dateFrom, dateTo, setViewMode, setDateRange, shiftPeriod } = usePeriodStore();
  const [customFrom, setCustomFrom] = useState(dateFrom);
  const [customTo, setCustomTo] = useState(dateTo);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCustomFrom(dateFrom);
    setCustomTo(dateTo);
  }, [dateFrom, dateTo]);

  const handleApplyCustom = () => {
    if (customFrom && customTo && customFrom <= customTo) {
      setDateRange(customFrom, customTo);
      setIsOpen(false);
    }
  };

  return (
    <div className="sticky top-14 sm:top-3 z-40 my-2 rounded-xl border bg-background/80 backdrop-blur-md p-2 shadow-sm transition-all">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Segmented Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          {(["day", "week", "month", "quarter", "year"] as ViewMode[]).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode(mode)}
              className="rounded-lg transition-all font-semibold"
            >
              {viewModeLabels[mode]}
            </Button>
          ))}
        </div>

        {/* Middle: Dynamic Label & Date Range Popover */}
        <div className="flex items-center justify-center">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex w-full sm:w-auto items-center gap-2 font-medium justify-center border-primary/20 hover:border-primary/50"
              >
                <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-foreground font-semibold">
                  {getPeriodLabel(viewMode, dateFrom)}
                </span>
                <span className="text-xs text-muted-foreground hidden md:inline">
                  ({formatShortDate(dateFrom)} - {formatShortDate(dateTo)})
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="center">
              <div className="grid gap-4">
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm leading-none">Tùy chỉnh dải ngày</h4>
                  <p className="text-xs text-muted-foreground">
                    Ghi đè khoảng thời gian tra cứu dữ liệu.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="date-from" className="text-xs">Từ ngày</Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="date-to" className="text-xs">Đến ngày</Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full font-semibold"
                  onClick={handleApplyCustom}
                  disabled={!customFrom || !customTo || customFrom > customTo}
                >
                  Áp dụng dải ngày
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Right: Step Navigation */}
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => shiftPeriod("prev")}
            title="Chu kỳ trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => shiftPeriod("next")}
            title="Chu kỳ tiếp theo"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
