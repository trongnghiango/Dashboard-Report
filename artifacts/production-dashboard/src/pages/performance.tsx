import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Gauge, Zap, Clock, ShieldCheck } from "lucide-react";

export default function Performance() {
  const [dateFrom, setDateFrom] = React.useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [dateTo, setDateTo] = React.useState(
    new Date().toISOString().split('T')[0]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['oee', dateFrom, dateTo],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/oee?dateFrom=${dateFrom}&dateTo=${dateTo}`);
      if (!res.ok) throw new Error("Failed to fetch OEE data");
      return res.json() as Promise<Array<{
        label: string;
        availability: number;
        performance: number;
        quality: number;
        oee: number;
      }>>;
    }
  });

  // Tính OEE trung bình
  const avgOee = data && data.length > 0 
    ? data.reduce((acc, curr) => acc + curr.oee, 0) / data.length 
    : 0;
  const avgAvail = data && data.length > 0 
    ? data.reduce((acc, curr) => acc + curr.availability, 0) / data.length 
    : 0;
  const avgPerf = data && data.length > 0 
    ? data.reduce((acc, curr) => acc + curr.performance, 0) / data.length 
    : 0;
  const avgQual = data && data.length > 0 
    ? data.reduce((acc, curr) => acc + curr.quality, 0) / data.length 
    : 0;

  const radarData = [
    { subject: 'Khả dụng (A)', value: Number(avgAvail.toFixed(1)), fullMark: 100 },
    { subject: 'Hiệu suất (P)', value: Number(avgPerf.toFixed(1)), fullMark: 100 },
    { subject: 'Chất lượng (Q)', value: Number(avgQual.toFixed(1)), fullMark: 100 },
    { subject: 'OEE Tổng', value: Number(avgOee.toFixed(1)), fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Báo Cáo Hiệu Suất (OEE)</h2>
          <p className="text-muted-foreground">Phân tích hiệu suất thiết bị tổng thể theo ca sản xuất</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <span className="text-muted-foreground">đến</span>
          <input
            type="date"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OEE Trung Bình</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{avgOee.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Mục tiêu: 85.0%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Độ Khả Dụng (A)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{avgAvail.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Tỷ lệ thời gian chạy máy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hiệu Suất (P)</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{avgPerf.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">So với sản lượng Max</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chất Lượng (Q)</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{avgQual.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Tỷ lệ sản phẩm đạt chuẩn</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Biểu Đồ Thành Phần OEE Theo Ca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                    <Bar dataKey="availability" name="Khả dụng (A)" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="performance" name="Hiệu suất (P)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="quality" name="Chất lượng (Q)" fill="#ca8a04" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="oee" name="OEE Tổng thể" fill="#9333ea" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Không có dữ liệu trong khoảng thời gian này.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Mức Độ Cân Bằng OEE (Radar)</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center">
            <div className="h-[340px] w-full">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                    <Radar name="Chỉ số trung bình" dataKey="value" stroke="#9333ea" fill="#9333ea" fillOpacity={0.4} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: 8 }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                  Không đủ dữ liệu vẽ đồ thị.
                </div>
              )}
            </div>
            <div className="mt-2 text-center text-xs text-muted-foreground italic">
              Trực quan hóa mức độ toàn diện của các trục hiệu suất trung bình.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
