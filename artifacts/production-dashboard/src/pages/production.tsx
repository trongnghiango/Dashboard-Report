import React from "react";
import { useListProduction, getListProductionQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

export default function Production() {
  const { data, isLoading } = useListProduction({ limit: 50 }, { query: { queryKey: getListProductionQueryKey({ limit: 50 }) } });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Báo Cáo Sản Xuất Sợi</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm mã sợi, đơn hàng..."
              className="w-[200px] lg:w-[300px] pl-8 bg-background"
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Thêm Báo Cáo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[80px]">Ngày SX</TableHead>
                <TableHead>Lệnh XK</TableHead>
                <TableHead>Đơn Hàng</TableHead>
                <TableHead>Mã Sợi</TableHead>
                <TableHead className="text-right">Ca 1</TableHead>
                <TableHead className="text-right">Ca 2</TableHead>
                <TableHead className="text-right">Ca 3</TableHead>
                <TableHead className="text-right">Tổng Ngày</TableHead>
                <TableHead className="text-right">Tổng Phế</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{new Date(row.ngaySanXuat).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{row.lenhXK}</TableCell>
                    <TableCell>{row.donHang}</TableCell>
                    <TableCell>{row.maSoi}</TableCell>
                    <TableCell className="text-right">{row.sanLuongCa1?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="text-right">{row.sanLuongCa2?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="text-right">{row.sanLuongCa3?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{row.tongSLNgay?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="text-right text-destructive">{row.tongPheNgay?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                    Không có dữ liệu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
