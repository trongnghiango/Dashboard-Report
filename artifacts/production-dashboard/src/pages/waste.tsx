import React, { useState } from "react";
import { useGetWasteBreakdown, useListProduction, getGetWasteBreakdownQueryKey, getListProductionQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Waste() {
  const { data: waste, isLoading: loadingWaste } = useGetWasteBreakdown({}, { query: { queryKey: getGetWasteBreakdownQueryKey({}) } });
  const { data: production, isLoading: loadingProduction } = useListProduction({ limit: 10 }, { query: { queryKey: getListProductionQueryKey({ limit: 10 }) } });

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  const wasteData = waste ? [
    { name: 'Kéo Máy', value: waste.phekeoMay },
    { name: 'Chạy Máy', value: waste.pheChayMay },
    { name: 'Chuyển Đổi', value: waste.pheChuyenDoi },
    { name: 'Sự Cố', value: waste.pheSuCo },
    { name: 'Dừng Máy', value: waste.pheDungMay },
    { name: 'Xử Lý', value: waste.pheXuLy },
  ].filter(item => item.value > 0) : [];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cơ Cấu Phế Liệu Tổng Hợp</CardTitle>
            <CardDescription>Tỷ trọng các loại phế liệu</CardDescription>
          </CardHeader>
          <CardContent>
             {loadingWaste ? <Skeleton className="h-[300px] w-full" /> : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={wasteData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  >
                    {wasteData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
             )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Bản Ghi Có Lượng Phế Cao</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Ngày SX</TableHead>
                    <TableHead>Đơn Hàng</TableHead>
                    <TableHead>Mã Sợi</TableHead>
                    <TableHead className="text-right">Tổng SL</TableHead>
                    <TableHead className="text-right text-destructive">Tổng Phế</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingProduction ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : production?.data ? (
                    [...production.data].sort((a, b) => (b.tongPheNgay || 0) - (a.tongPheNgay || 0)).slice(0, 10).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{new Date(row.ngaySanXuat).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>{row.donHang}</TableCell>
                        <TableCell>{row.maSoi}</TableCell>
                        <TableCell className="text-right font-medium">{row.tongSLNgay?.toLocaleString() || '-'}</TableCell>
                        <TableCell className="text-right font-bold text-destructive">{row.tongPheNgay?.toLocaleString() || '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Không có dữ liệu.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
