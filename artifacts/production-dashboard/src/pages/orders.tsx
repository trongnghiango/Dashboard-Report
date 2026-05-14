import React from "react";
import { useListOrders, getListOrdersQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

export default function Orders() {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(50);
  const [search, setSearch] = React.useState("");
  const [expandedOrders, setExpandedOrders] = React.useState<Set<string>>(new Set());

  const toggleOrder = (donHang: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(donHang)) {
        next.delete(donHang);
      } else {
        next.add(donHang);
      }
      return next;
    });
  };

  const { data, isLoading } = useListOrders(
    { page, limit, search }, 
    { query: { queryKey: getListOrdersQueryKey({ page, limit, search }) } }
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Quản Lý Đơn Hàng</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm lệnh XK, mã sợi..."
                className="w-[200px] lg:w-[300px] pl-8 bg-background"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>ORDER ID</TableHead>
                  <TableHead>Lệnh XK</TableHead>
                  <TableHead>Mã Sợi</TableHead>
                  <TableHead>Tên Sợi</TableHead>
                  <TableHead className="text-right">SL Đơn Hàng</TableHead>
                  <TableHead>ĐVT</TableHead>
                  <TableHead>Ngày Ban Hành</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.data && data.data.length > 0 ? (
                  (() => {
                    const grouped: Record<string, typeof data.data> = {};
                    data.data.forEach(row => {
                      const key = row.donHang || 'N/A';
                      if (!grouped[key]) grouped[key] = [];
                      grouped[key].push(row);
                    });

                    return Object.entries(grouped).map(([donHang, rows]) => {
                      const isExpanded = expandedOrders.has(donHang);
                      const totalQty = rows.reduce((acc, r) => acc + (Number(r.slDonHang) || 0), 0);
                      const firstRow = rows[0];

                      return (
                        <React.Fragment key={donHang}>
                          <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleOrder(donHang)}>
                            <TableCell className="font-medium">
                              {isExpanded ? '▼' : '▶'} {donHang}
                            </TableCell>
                            <TableCell colSpan={3}>
                              {rows.length} sản phẩm
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {totalQty.toLocaleString()}
                            </TableCell>
                            <TableCell>{firstRow?.dvt}</TableCell>
                            <TableCell>{firstRow?.ngayBanHanhLXK ? new Date(firstRow.ngayBanHanhLXK).toLocaleDateString('vi-VN') : '-'}</TableCell>
                          </TableRow>
                          {isExpanded && rows.map((row) => (
                            <TableRow key={row.id} className="bg-muted/20">
                              <TableCell className="pl-6 text-muted-foreground">{row.id}</TableCell>
                              <TableCell className="text-muted-foreground">-</TableCell>
                              <TableCell>{row.maSoi}</TableCell>
                              <TableCell>{row.tenSoi}</TableCell>
                              <TableCell className="text-right">{row.slDonHang?.toLocaleString() || '-'}</TableCell>
                              <TableCell>{row.dvt}</TableCell>
                              <TableCell>{row.ngayBanHanhLXK ? new Date(row.ngayBanHanhLXK).toLocaleDateString('vi-VN') : '-'}</TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      );
                    });
                  })()
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      Không có dữ liệu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {data?.data?.length || 0} / {data?.total || 0} dòng
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Trước
                </Button>
                <div className="text-sm font-medium">
                  Trang {page} / {Math.ceil((data?.total || 0) / limit) || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil((data?.total || 0) / limit)}
                >
                  Sau
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
