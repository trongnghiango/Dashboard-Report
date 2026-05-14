import React from "react";
import { useGetSummary, useGetOutputTrend, useGetShiftPerformance, useGetWasteBreakdown, useGetOrderCompletion, getGetSummaryQueryKey, getGetOutputTrendQueryKey, getGetShiftPerformanceQueryKey, getGetWasteBreakdownQueryKey, getGetOrderCompletionQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Activity, Factory, FileText, AlertTriangle, Gauge } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  
  const defaultDateTo = today.toISOString().split('T')[0];
  const defaultDateFrom = sevenDaysAgo.toISOString().split('T')[0];

  const [dateFrom, setDateFrom] = React.useState<string>(defaultDateFrom);
  const [dateTo, setDateTo] = React.useState<string>(defaultDateTo);
  const [may, setMay] = React.useState<string>("");

  const [selectedYear, setSelectedYear] = React.useState<string>("");
  const [selectedQuarter, setSelectedQuarter] = React.useState<string>("");
  const [selectedMonth, setSelectedMonth] = React.useState<string>("");

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    setSelectedQuarter("");
    setSelectedMonth("");
    setDateFrom(`${year}-01-01`);
    setDateTo(`${year}-12-31`);
  };

  const handleQuarterSelect = (quarter: string) => {
    const year = selectedYear || "2026";
    setSelectedQuarter(quarter);
    setSelectedMonth("");
    if (quarter === "1") { setDateFrom(`${year}-01-01`); setDateTo(`${year}-03-31`); }
    if (quarter === "2") { setDateFrom(`${year}-04-01`); setDateTo(`${year}-06-30`); }
    if (quarter === "3") { setDateFrom(`${year}-07-01`); setDateTo(`${year}-09-30`); }
    if (quarter === "4") { setDateFrom(`${year}-10-01`); setDateTo(`${year}-12-31`); }
  };

  const handleMonthSelect = (month: string) => {
    const year = selectedYear || "2026";
    setSelectedMonth(month);
    const m = month.padStart(2, '0');
    setDateFrom(`${year}-${m}-01`);
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    setDateTo(`${year}-${m}-${lastDay}`);
  };

  const params = { 
    dateFrom: dateFrom || undefined, 
    dateTo: dateTo || undefined, 
    may: may || undefined 
  };

  const { data: summary, isLoading: loadingSummary } = useGetSummary(params, { query: { queryKey: getGetSummaryQueryKey(params) } });
  const { data: outputTrend, isLoading: loadingTrend } = useGetOutputTrend(params, { query: { queryKey: getGetOutputTrendQueryKey(params) } });
  const { data: shiftPerf, isLoading: loadingShift } = useGetShiftPerformance(params, { query: { queryKey: getGetShiftPerformanceQueryKey(params) } });
  const { data: waste, isLoading: loadingWaste } = useGetWasteBreakdown(params, { query: { queryKey: getGetWasteBreakdownQueryKey(params) } });
  const { data: orderCompletion, isLoading: loadingOrder } = useGetOrderCompletion(params, { query: { queryKey: getGetOrderCompletionQueryKey(params) } });

  const { data: oeeData, isLoading: loadingOee } = useQuery({
    queryKey: ['oee', dateFrom, dateTo],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/oee?dateFrom=${dateFrom}&dateTo=${dateTo}`);
      if (!res.ok) throw new Error("Failed to fetch OEE data");
      return res.json() as Promise<Array<{ oee: number }>>;
    }
  });

  const avgOee = oeeData && oeeData.length > 0 
    ? oeeData.reduce((acc, curr) => acc + curr.oee, 0) / oeeData.length 
    : 0;

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Thiết Bị</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1">
            {["", "Máy 1", "Máy 2", "Máy 3"].map((m) => (
              <button
                key={m}
                onClick={() => setMay(m)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  may === m
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {m === "" ? "Tất cả" : m}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Năm</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1">
            {["2024", "2025", "2026"].map((y) => (
              <button
                key={y}
                onClick={() => handleYearSelect(y)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  selectedYear === y
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {y}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quý</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1">
            {["1", "2", "3", "4"].map((q) => (
              <button
                key={q}
                onClick={() => handleQuarterSelect(q)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  selectedQuarter === q
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Q{q}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tháng</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-1">
            {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((m) => (
              <button
                key={m}
                onClick={() => handleMonthSelect(m)}
                className={`px-1 py-1 text-xs rounded-md transition-colors ${
                  selectedMonth === m
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                T{m}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Khoảng Ngày</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setSelectedYear("");
                setSelectedQuarter("");
                setSelectedMonth("");
              }}
              className="bg-background border rounded-md px-2 py-1 text-xs"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setSelectedYear("");
                setSelectedQuarter("");
                setSelectedMonth("");
              }}
              className="bg-background border rounded-md px-2 py-1 text-xs"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sản Lượng Hôm Nay</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? <Skeleton className="h-8 w-[100px]" /> : (
              <>
                <div className="text-2xl font-bold">{summary?.tongSLNgayHienTai?.toLocaleString() ?? 0} kg</div>
                <p className="text-xs text-muted-foreground mt-1">Lũy kế tháng: {summary?.tongSLThang?.toLocaleString() ?? 0} kg</p>
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
              <div className="text-2xl font-bold">{summary?.tyLeHoanThanhTB?.toFixed(1) ?? 0}%</div>
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
                <div className="text-2xl font-bold">{summary?.tongPheNgay?.toLocaleString() ?? 0} kg</div>
                <p className="text-xs text-muted-foreground mt-1">Lũy kế tháng: {summary?.tongPheThang?.toLocaleString() ?? 0} kg</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OEE Trung Bình</CardTitle>
            <Gauge className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {loadingOee ? <Skeleton className="h-8 w-[100px]" /> : (
              <>
                <div className="text-2xl font-bold text-purple-600">{avgOee.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Sức khỏe sản xuất</p>
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
                <BarChart data={Array.isArray(outputTrend) ? outputTrend : []}>
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
                {(Array.isArray(orderCompletion) ? orderCompletion : []).slice(0, 5).map((order) => (
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
