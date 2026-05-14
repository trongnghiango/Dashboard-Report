import React, { useState } from "react";
import type { OrderRiskForecast } from "@workspace/api-client-react";
import { AlertTriangle, CheckCircle2, ShieldAlert, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

interface OrderRiskBannerProps {
  ordersAtRisk?: OrderRiskForecast[];
  isLoading?: boolean;
  isError?: boolean;
}

export function OrderRiskBanner({ ordersAtRisk, isLoading, isError }: OrderRiskBannerProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="my-3 rounded-xl border bg-background/60 p-4 backdrop-blur-md animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full bg-primary/20" />
          <div className="h-4 w-48 rounded bg-primary/20" />
        </div>
      </div>
    );
  }

  if (isError) {
    return null;
  }

  const riskyOrders = ordersAtRisk?.filter((o) => o.riskLevel !== "SAFE") || [];

  if (riskyOrders.length === 0) {
    return (
      <div className="my-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-emerald-600 dark:text-emerald-400">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Hệ thống an toàn: Tất cả lệnh sản xuất đang chạy đúng tiến độ và định mức phế liệu.</span>
        </div>
      </div>
    );
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="my-3 rounded-xl border bg-card/40 p-3 shadow-xs backdrop-blur-md transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-1">
          <ShieldAlert className="h-4 w-4 text-destructive animate-pulse shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground leading-none pt-0.5">
            Cảnh báo sớm rủi ro Lệnh sản xuất ({riskyOrders.length})
          </h3>
        </div>
        
        <CollapsibleTrigger asChild>
          <button
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground py-1 px-2.5 rounded-md hover:bg-secondary/80 transition-all cursor-pointer leading-none"
          >
            <span>{isOpen ? "Thu gọn" : "Mở rộng"}</span>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform duration-300", isOpen ? "rotate-180" : "rotate-0")}
            />
          </button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="pt-3 transition-all">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {riskyOrders.map((order) => {
            const isCritical = order.riskLevel === "CRITICAL";
            return (
              <div
                key={order.donHang}
                className={cn(
                  "relative overflow-hidden rounded-xl border p-3.5 transition-all duration-300 hover:shadow-md bg-background/50",
                  isCritical
                    ? "border-destructive/40 hover:border-destructive/60"
                    : "border-amber-500/40 hover:border-amber-500/60"
                )}
              >
                {/* Premium Top Accent Strip */}
                <div
                  className={cn(
                    "absolute top-0 left-0 right-0 h-1",
                    isCritical ? "bg-destructive" : "bg-amber-500"
                  )}
                />

                <div className="flex items-start justify-between gap-2 mt-1">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-foreground">
                        {order.donHang}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wide",
                          isCritical
                            ? "bg-destructive/10 text-destructive dark:text-red-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        )}
                      >
                        {isCritical ? "Nguy cơ cao" : "Cần chú ý"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      {order.tenSoi || order.maSoi || "Sợi quy cách"}
                    </p>
                  </div>

                  <AlertTriangle
                    className={cn(
                      "h-4 w-4 shrink-0 mt-0.5",
                      isCritical ? "text-destructive" : "text-amber-500"
                    )}
                  />
                </div>

                {/* Progress and Metrics Row */}
                <div className="mt-3 grid grid-cols-2 gap-2 bg-card/60 rounded-lg p-2 border border-foreground/5">
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
                      Tiến độ
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {order.tyLeHoanThanh}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
                      Phế liệu
                    </span>
                    <span
                      className={cn(
                        "text-xs font-bold",
                        order.tyLePheLieu > 5.0
                          ? "text-destructive"
                          : order.tyLePheLieu > 3.5
                          ? "text-amber-500"
                          : "text-foreground"
                      )}
                    >
                      {order.tyLePheLieu}%
                    </span>
                  </div>
                </div>

                {/* Actionable Insight Footer */}
                <div className="mt-2.5 pt-2 border-t border-border/40">
                  <p className="text-[11px] font-semibold text-foreground/90 leading-snug">
                    💡 <span className="underline decoration-dotted decoration-primary underline-offset-2">{order.suggestedAction}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
