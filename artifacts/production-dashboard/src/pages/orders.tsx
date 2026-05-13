import React, { useState } from "react";
import { useGetOrderCompletion, getGetOrderCompletionQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Orders() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useGetOrderCompletion({}, { query: { queryKey: getGetOrderCompletionQueryKey({}) } });

  const filteredOrders = data?.filter(order => 
    order.donHang.toLowerCase().includes(search.toLowerCase()) || 
    order.maSoi.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Tiến Độ Đơn Hàng</CardTitle>
            <CardDescription>Theo dõi tiến độ hoàn thành các đơn hàng</CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm mã sợi, đơn hàng..."
              className="w-[250px] pl-8 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="space-y-3 rounded-lg border p-4">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-2 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              ))
            ) : filteredOrders?.length ? (
              filteredOrders.map(order => (
                <div key={order.donHang} className="space-y-3 rounded-lg border p-4 bg-card">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{order.donHang}</h3>
                      <p className="text-sm text-muted-foreground">{order.tenSoi} ({order.maSoi})</p>
                    </div>
                    <span className="font-bold text-primary">{order.tyLeHoanThanh?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={Math.min(100, order.tyLeHoanThanh || 0)} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground pt-2">
                    <div>
                      <span className="block">Đã SX</span>
                      <span className="font-medium text-foreground">{order.slDonHangDaSX?.toLocaleString() || 0} kg</span>
                    </div>
                    <div className="text-right">
                      <span className="block">Còn lại</span>
                      <span className="font-medium text-foreground">{order.canSXTiep?.toLocaleString() || 0} kg</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                Không tìm thấy đơn hàng nào.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
