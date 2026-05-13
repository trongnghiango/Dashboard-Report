import React from "react";
import { useGetSummary, useGetOutputTrend, useGetShiftPerformance, useGetWasteBreakdown, useGetOrderCompletion, getGetSummaryQueryKey, getGetOutputTrendQueryKey, getGetShiftPerformanceQueryKey, getGetWasteBreakdownQueryKey, getGetOrderCompletionQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Activity, Factory, FileText, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetSummary({}, { query: { queryKey: getGetSummaryQueryKey({}) } });
  const { data: outputTrend, isLoading: loadingTrend } = useGetOutputTrend({}, { query: { queryKey: getGetOutputTrendQueryKey({}) } });
  const { data: shiftPerf, isLoading: loadingShift } = useGetShiftPerformance({}, { query: { queryKey: getGetShiftPerformanceQueryKey({}) } });
  const { data: waste, isLoading: loadingWaste } = useGetWasteBreakdown({}, { query: { queryKey: getGetWasteBreakdownQueryKey({}) } });
  const { data: orderCompletion, isLoading: loadingOrder } = useGetOrderCompletion({}, { query: { queryKey: getGetOrderCompletionQueryKey({}) } });

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  const wasteData = waste ? [
    { name: 'Kéo Máy', value: waste.phekeoMay },
    { name: 'Chạy Máy', value: waste.pheChayMay },
    { name: 'Chuyển Đổi', value: waste.pheChuyenDoi },
    { name: 'Sự Cố', value: waste.pheSuCo },
    { name: 'Dừng Máy', value: waste.pheDungMay },
    { name: 'Xử Lý', value: waste.pheXuLy },
  ].filter(item => item.value > 0) : [];

  const shiftData = shiftPerf ? [
    { name: 'Ca 1', value: shiftPerf.ca1 },
    { name: 'Ca 2', value: shiftPerf.ca2 },
    { name: 'Ca 3', value: shiftPerf.ca3 },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sản Lượng Hôm Nay</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? <Skeleton className="h-8 w-[100px]" /> : (
              <>
                <div className="text-2xl font-bold">{summary?.tongSLNgayHienTai.toLocaleString()} kg</div>
                <p className="text-xs text-muted-foreground mt-1">Lũy kế tháng: {summary?.tongSLThang.toLocaleString()} kg</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lệnh Đang Sản Xuất</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? <Skeleton className="h-8 w-[100px]" /> : (
              <div className="text-2xl font-bold">{summary?.soLenhDangSX}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ Lệ Hoàn Thành TB</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? <Skeleton className="h-8 w-[100px]" /> : (
              <div className="text-2xl font-bold">{summary?.tyLeHoanThanhTB.toFixed(1)}%</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Phế Hôm Nay</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? <Skeleton className="h-8 w-[100px]" /> : (
              <>
                <div className="text-2xl font-bold">{summary?.tongPheNgay.toLocaleString()} kg</div>
                <p className="text-xs text-muted-foreground mt-1">Lũy kế tháng: {summary?.tongPheThang.toLocaleString()} kg</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Biểu Đồ Sản Lượng 7 Ngày</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {loadingTrend ? <Skeleton className="h-[300px] w-full" /> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={outputTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}kg`} />
                  <RechartsTooltip cursor={{fill: '#222'}} contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                  <Legend />
                  <Bar dataKey="tongSL" name="Sản Lượng" fill="#f97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tongPhe" name="Phế Liệu" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Sản Lượng Theo Ca</CardTitle>
            <CardDescription>Hiệu suất các ca làm việc</CardDescription>
          </CardHeader>
          <CardContent>
             {loadingShift ? <Skeleton className="h-[300px] w-full" /> : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={shiftData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {shiftData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
             )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tiến Độ Đơn Hàng</CardTitle>
          </CardHeader>
          <CardContent>
             {loadingOrder ? <Skeleton className="h-[300px] w-full" /> : (
              <div className="space-y-6">
                {orderCompletion?.slice(0, 5).map((order) => (
                  <div key={order.donHang} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="font-medium">{order.donHang} <span className="text-muted-foreground">({order.maSoi})</span></div>
                      <div className="font-bold">{order.tyLeHoanThanh?.toFixed(1) || 0}%</div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${Math.min(100, order.tyLeHoanThanh || 0)}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>Đã SX: {order.slDonHangDaSX?.toLocaleString() || 0} kg</span>
                      <span>Còn lại: {order.canSXTiep?.toLocaleString() || 0} kg</span>
                    </div>
                  </div>
                ))}
              </div>
             )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Cơ Cấu Phế Liệu</CardTitle>
          </CardHeader>
          <CardContent>
             {loadingWaste ? <Skeleton className="h-[300px] w-full" /> : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={wasteData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {wasteData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                </PieChart>
              </ResponsiveContainer>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
