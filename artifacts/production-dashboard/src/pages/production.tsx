import React from "react";
import { 
  useListProduction, 
  getListProductionQueryKey, 
  useImportProduction, 
  useGetProgressParents, 
  useGetProgressItems, 
  getGetProgressParentsQueryKey 
} from "@workspace/api-client-react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Search, 
  Edit, 
  Trash2, 
  Upload, 
  ChevronRight, 
  ChevronDown, 
  ArrowUp, 
  ArrowDown, 
  Layers, 
  ListFilter, 
  SlidersHorizontal 
} from "lucide-react";
import * as XLSX from "xlsx";

// Component hiển thị chi tiết các mã sợi con khi mở rộng Lệnh XK cha
function LazyProgressChildRows({ lenhXK }: { lenhXK: string }) {
  const { data: items, isLoading, isError, refetch } = useGetProgressItems({ lenhXK });

  if (isLoading) {
    return (
      <TableRow className="bg-background/40">
        <TableCell></TableCell>
        <TableCell colSpan={5} className="text-center py-4">
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full animate-pulse" />
            <Skeleton className="h-3 w-48" />
          </div>
        </TableCell>
        <TableCell></TableCell>
      </TableRow>
    );
  }

  if (isError) {
    return (
      <TableRow className="bg-background/40">
        <TableCell></TableCell>
        <TableCell colSpan={5} className="text-center py-2 text-xs text-destructive font-medium">
          Tải chi tiết mã sợi thất bại. <Button variant="link" size="sm" onClick={() => refetch()} className="px-1.5 h-auto">Thử lại</Button>
        </TableCell>
        <TableCell></TableCell>
      </TableRow>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <>
      {items.map((item) => (
        <TableRow key={`${item.orderId}-${item.maSoi}`} className="bg-background/60 hover:bg-muted/10 transition-colors border-b border-border/40">
          <TableCell></TableCell>
          <TableCell className="pl-6 text-muted-foreground font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
              <span>{item.orderId}</span>
            </div>
          </TableCell>
          <TableCell>
            <div className="font-semibold text-xs text-foreground/90">{item.maSoi}</div>
            {item.tenSoi && item.tenSoi !== item.maSoi && (
              <div className="text-[11px] text-muted-foreground line-clamp-1 italic">{item.tenSoi}</div>
            )}
          </TableCell>
          <TableCell className="text-right text-xs font-semibold font-mono">{item.slDonHang?.toLocaleString()}</TableCell>
          <TableCell>
            <div className="flex items-center gap-2 justify-center max-w-[180px] mx-auto">
              <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary/80 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(item.tienDo, 100)}%` }}
                ></div>
              </div>
              <span className="text-xs text-muted-foreground font-mono w-9 text-right">{Math.round(item.tienDo)}%</span>
            </div>
          </TableCell>
          <TableCell className="text-right text-xs font-bold text-primary/90 font-mono">{item.daSanXuat?.toLocaleString()}</TableCell>
          <TableCell></TableCell>
        </TableRow>
      ))}
    </>
  );
}

// ============================================================================
// TAB 1 VIEW: TỔNG QUAN LỆNH XK (MASTER-DETAIL)
// Tách biệt hoàn toàn thành Component độc lập để đảm bảo unmount/mount sạch sẽ
// ============================================================================
function TabParentsView({
  parentsData,
  isParentsLoading,
  statusFilter,
  sortBy,
  sortOrder,
  page,
  limit,
  updateSearchParams
}: {
  parentsData: any;
  isParentsLoading: boolean;
  statusFilter: string;
  sortBy: string;
  sortOrder: string;
  page: number;
  limit: number;
  updateSearchParams: (updates: Record<string, string | number | null>) => void;
}) {
  const [expandedRows, setExpandedRows] = React.useState<string[]>([]);

  const filteredParents = React.useMemo(() => {
    if (!parentsData?.data) return [];
    let list = [...parentsData.data];
    
    if (statusFilter === "COMPLETED") {
      list = list.filter(p => p.status === "COMPLETED" || p.tienDo >= 100);
    } else if (statusFilter === "IN_PROGRESS") {
      list = list.filter(p => p.status !== "COMPLETED" && p.tienDo < 100);
    }

    list.sort((a, b) => {
      let aVal: any = a.lenhXK;
      let bVal: any = b.lenhXK;
      if (sortBy === "tienDo") {
        aVal = a.tienDo ?? 0;
        bVal = b.tienDo ?? 0;
      } else if (sortBy === "tongSlDonHang") {
        aVal = a.tongSlDonHang ?? 0;
        bVal = b.tongSlDonHang ?? 0;
      } else if (sortBy === "tongDaSanXuat") {
        aVal = a.tongDaSanXuat ?? 0;
        bVal = b.tongDaSanXuat ?? 0;
      }

      if (typeof aVal === "string") {
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    return list;
  }, [parentsData?.data, statusFilter, sortBy, sortOrder]);

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto scrollbar-thin">
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[45px]"></TableHead>
                <TableHead className="font-semibold text-xs text-foreground/80">Lệnh XK / Đơn Hàng</TableHead>
                <TableHead className="font-semibold text-xs text-foreground/80">Mô Tả Nhanh</TableHead>
                <TableHead className="text-right font-semibold text-xs text-foreground/80">SL Kế Hoạch</TableHead>
                <TableHead className="text-center font-semibold text-xs text-foreground/80 w-[200px]">Tiến Độ Phân Bổ</TableHead>
                <TableHead className="text-right font-semibold text-xs text-foreground/80">Đã Sản Xuất</TableHead>
                <TableHead className="text-right font-semibold text-xs text-foreground/80 w-[100px]">Trạng Thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isParentsLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-3 w-3 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-3.5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-3 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-3.5 w-20 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-2.5 w-32 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-3.5 w-20 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredParents.length > 0 ? (
                filteredParents.map((lenh) => (
                  <React.Fragment key={lenh.lenhXK}>
                    <TableRow className="group font-medium hover:bg-muted/30 transition-all border-b border-border/40">
                      <TableCell className="py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-md hover:bg-background shadow-none"
                          onClick={() => {
                            setExpandedRows(prev =>
                              prev.includes(lenh.lenhXK)
                                ? prev.filter(id => id !== lenh.lenhXK)
                                : [...prev, lenh.lenhXK]
                            );
                          }}
                        >
                          {expandedRows.includes(lenh.lenhXK) ? (
                            <ChevronDown className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-bold text-xs text-foreground font-mono">{lenh.lenhXK}</TableCell>
                      <TableCell className="text-xs text-muted-foreground italic">
                        {expandedRows.includes(lenh.lenhXK) ? "Đang mở chi tiết..." : "Nhấn để tra cứu sợi"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold">{lenh.tongSlDonHang?.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-center max-w-[180px] mx-auto">
                          <div className="w-full bg-muted/80 rounded-full h-2 overflow-hidden border border-border/40">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                lenh.tienDo >= 100 
                                  ? "bg-gradient-to-r from-emerald-500 to-green-500" 
                                  : lenh.tienDo >= 50 
                                    ? "bg-gradient-to-r from-amber-500 to-orange-500" 
                                    : "bg-gradient-to-r from-sky-500 to-blue-500"
                              }`}
                              style={{ width: `${Math.min(lenh.tienDo, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold font-mono w-10 text-right">{Math.round(lenh.tienDo)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-extrabold text-xs text-primary font-mono">{lenh.tongDaSanXuat?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          lenh.status === "COMPLETED" || lenh.tienDo >= 100
                            ? "bg-[hsl(142,70%,90%)] text-[hsl(142,76%,25%)] dark:bg-[hsl(142,70%,15%)] dark:text-[hsl(142,70%,75%)]" 
                            : "bg-[hsl(38,92%,90%)] text-[hsl(38,92%,30%)] dark:bg-[hsl(38,92%,15%)] dark:text-[hsl(38,92%,70%)]"
                        }`}>
                          {lenh.status === "COMPLETED" || lenh.tienDo >= 100 ? "Xong" : "Đang chạy"}
                        </span>
                      </TableCell>
                    </TableRow>
                    {expandedRows.includes(lenh.lenhXK) && (
                      <LazyProgressChildRows lenhXK={lenh.lenhXK} />
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    Không tìm thấy Lệnh sản xuất nào phù hợp với bộ lọc.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-muted/20 border-t border-border/40 text-xs">
          <div className="text-muted-foreground">
            Hiển thị <span className="font-semibold text-foreground">{filteredParents.length}</span> /{" "}
            <span className="font-bold text-foreground">
              {statusFilter !== "all" ? filteredParents.length : (parentsData?.total || 0)}
            </span> bản ghi
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs border-border/60"
              onClick={() => updateSearchParams({ page: Math.max(1, page - 1) })}
              disabled={page === 1}
            >
              Trước
            </Button>
            <div className="font-medium text-muted-foreground px-1">
              Trang <span className="font-semibold text-foreground">{page}</span> /{" "}
              <span className="font-semibold text-foreground">
                {Math.ceil((parentsData?.total || 0) / limit) || 1}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs border-border/60"
              onClick={() => updateSearchParams({ page: page + 1 })}
              disabled={page >= Math.ceil((parentsData?.total || 0) / limit)}
            >
              Sau
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// TAB 2 VIEW: NHẬT KÝ CA / NGÀY SX (FLAT LOGS)
// Tách biệt hoàn toàn thành Component độc lập để triệt tiêu lỗi tái sử dụng Fiber
// ============================================================================
function TabLogsView({
  logsData,
  isLogsLoading,
  sortBy,
  sortOrder,
  page,
  limit,
  updateSearchParams
}: {
  logsData: any;
  isLogsLoading: boolean;
  sortBy: string;
  sortOrder: string;
  page: number;
  limit: number;
  updateSearchParams: (updates: Record<string, string | number | null>) => void;
}) {
  const filteredLogs = React.useMemo(() => {
    if (!logsData?.data) return [];
    let list = [...logsData.data];

    list.sort((a, b) => {
      let aVal: any = new Date(a.ngaySanXuat).getTime();
      let bVal: any = new Date(b.ngaySanXuat).getTime();
      if (sortBy === "tongSLNgay") {
        aVal = a.tongSLNgay ?? 0;
        bVal = b.tongSLNgay ?? 0;
      } else if (sortBy === "tongPheNgay") {
        aVal = a.tongPheNgay ?? 0;
        bVal = b.tongPheNgay ?? 0;
      }

      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    return list;
  }, [logsData?.data, sortBy, sortOrder]);

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto scrollbar-thin">
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-xs text-foreground/80 w-[100px]">Ngày SX</TableHead>
                <TableHead className="font-semibold text-xs text-foreground/80">Lệnh XK</TableHead>
                <TableHead className="font-semibold text-xs text-foreground/80">Đơn Hàng</TableHead>
                <TableHead className="font-semibold text-xs text-foreground/80">Mã Sợi</TableHead>
                <TableHead className="text-right font-semibold text-xs text-foreground/80">Ca 1</TableHead>
                <TableHead className="text-right font-semibold text-xs text-foreground/80">Ca 2</TableHead>
                <TableHead className="text-right font-semibold text-xs text-foreground/80">Ca 3</TableHead>
                <TableHead className="text-right font-semibold text-xs text-foreground/80">Tổng Ngày</TableHead>
                <TableHead className="text-right font-semibold text-xs text-foreground/80">Tổng Phế</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLogsLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-3.5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-3.5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-3.5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-3.5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-3.5 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-3.5 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-3.5 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-3.5 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-3.5 w-16 ml-auto" /></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/30 transition-colors text-xs border-b border-border/40">
                    <TableCell className="font-medium text-muted-foreground font-mono">
                      {new Date(row.ngaySanXuat).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="font-bold font-mono">{row.lenhXK || '-'}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{row.donHang || '-'}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground/90">{row.maSoi}</div>
                      {row.tenSoi && row.tenSoi !== row.maSoi && (
                        <div className="text-[11px] text-muted-foreground line-clamp-1 italic">{row.tenSoi}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">{row.sanLuongCa1?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">{row.sanLuongCa2?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">{row.sanLuongCa3?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="text-right font-bold text-primary font-mono bg-primary/5">{row.tongSLNgay?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="text-right font-semibold text-destructive font-mono">{row.tongPheNgay?.toLocaleString() || '-'}</TableCell>
                    <TableCell className="text-right py-1">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center text-xs text-muted-foreground">
                    Không có dữ liệu nhật ký sản xuất.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-muted/20 border-t border-border/40 text-xs">
          <div className="text-muted-foreground">
            Hiển thị <span className="font-semibold text-foreground">{filteredLogs.length}</span> /{" "}
            <span className="font-bold text-foreground">{logsData?.total || 0}</span> bản ghi
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs border-border/60"
              onClick={() => updateSearchParams({ page: Math.max(1, page - 1) })}
              disabled={page === 1}
            >
              Trước
            </Button>
            <div className="font-medium text-muted-foreground px-1">
              Trang <span className="font-semibold text-foreground">{page}</span> /{" "}
              <span className="font-semibold text-foreground">
                {Math.ceil((logsData?.total || 0) / limit) || 1}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs border-border/60"
              onClick={() => updateSearchParams({ page: page + 1 })}
              disabled={page >= Math.ceil((logsData?.total || 0) / limit)}
            >
              Sau
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function Production() {
  const searchParams = useSearch({ strict: false }) as any;
  const navigate = useNavigate();

  const tab = searchParams.tab || "parents";
  const sortBy = searchParams.sortBy || (tab === "parents" ? "lenhXK" : "ngaySanXuat");
  const sortOrder = searchParams.sortOrder || "desc";
  const statusFilter = searchParams.statusFilter || "all";
  const search = searchParams.search || "";
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 50;

  const updateSearchParams = (updates: Record<string, string | number | null>) => {
    navigate({
      to: '/san-xuat',
      search: (prev: any) => ({
        ...prev,
        ...updates,
      }),
    });
  };

  const { data: parentsData, isLoading: isParentsLoading, refetch: refetchParents } = useGetProgressParents(
    { page, limit, search },
    { query: { enabled: tab === "parents", queryKey: getGetProgressParentsQueryKey({ page, limit, search }) } }
  );

  const { data: logsData, isLoading: isLogsLoading, refetch: refetchLogs } = useListProduction(
    { page, limit, search }, 
    { query: { enabled: tab === "logs", queryKey: getListProductionQueryKey({ page, limit, search }) } }
  );

  const { mutate: importProduction, isPending } = useImportProduction();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      
      const sheetNames = wb.SheetNames;
      const productionSheetName = sheetNames.find(n => n.includes('Bao_Cao_Tao_Soi') || n === 'Bao_Cao_Tao_Soi') || sheetNames[0];
      const ordersSheetName = sheetNames.find(n => n.includes('TH Đơn hàng và SL') || n === 'TH Đơn hàng và SL');

      const productionWs = wb.Sheets[productionSheetName];
      const ordersWs = ordersSheetName ? wb.Sheets[ordersSheetName] : null;

      const productionJson = XLSX.utils.sheet_to_json(productionWs, { header: 1 });
      const ordersJson = ordersWs ? XLSX.utils.sheet_to_json(ordersWs, { header: 1 }) : [];

      let ordersData: any[] = [];
      if (ordersJson.length > 0) {
        const ordersHeaders = ordersJson[0] as string[];
        const ordersRows = ordersJson.slice(1) as any[][];
        
        const ordersMapping: Record<string, string> = {
          "ORDER ID": "id",
          "LỆNH XK": "donHang",
          "MÃ SỢI": "maSoi",
          "TÊN SỢI": "tenSoi",
          "SL ĐƠN HÀNG": "slDonHang",
          "Tỷ lệ nhựa": "tyLeNhua",
          "ĐVT": "dvt",
          "Ngày Ban hành LXK": "ngayBanHanhLXK",
        };

        ordersData = ordersRows.map((row) => {
          const obj: any = {};
          ordersHeaders.forEach((header, index) => {
            const key = ordersMapping[header];
            if (key) {
              let val = row[index];
              if (key === "id" && val) val = String(val);
              if (key === "ngayBanHanhLXK" && typeof val === "number") {
                const date = new Date((val - 25569) * 86400 * 1000);
                val = date.toISOString().split("T")[0];
              }
              if ((key === "slDonHang" || key === "tyLeNhua") && typeof val === "string") {
                val = Number(val) || null;
              }
              obj[key] = val;
            }
          });
          return obj;
        }).filter(o => o.id);
      }

      const productionHeaders = productionJson[0] as string[];
      const productionRows = productionJson.slice(1) as any[][];

      const productionMapping: Record<string, string> = {
        "STT": "stt",
        "Ngày nhập": "ngayNhap",
        "Ngày Sản xuất": "ngaySanXuat",
        "LỆNH XK": "lenhXK",
        "Ngày Ban hành LXK": "ngayBanHanhLXK",
        "MÃ SỢI": "maSoi",
        "TÊN SỢI": "tenSoi",
        "TÊN SỢI MỚI": "tenSoiMoi",
        "ĐƠN HÀNG": "donHang",
        "Tỷ lệ nhựa %": "tyLeNhua",
        "NGÀY SẢN XUẤT GẦN NHẤT": "ngaySanXuatGanNhat",
        "MÁY TS Ca 1": "mayTSCa1",
        "Thời Gian TS Ca1": "thoiGianTSCa1",
        "Sản lượng Ca 1": "sanLuongCa1",
        "MÁY TS Ca 2": "mayTSCa2",
        "Thời Gian TS Ca2": "thoiGianTSCa2",
        "Sản lượng Ca 2": "sanLuongCa2",
        "MÁY TS Ca 3": "mayTSCa3",
        "Thời Gian TS Ca3": "thoiGianTSCa3",
        "Sản lượng Ca 3": "sanLuongCa3",
        "TỔNG SL NGÀY": "tongSLNgay",
        "SL ĐƠN HÀNG ĐÃ SX": "slDonHangDaSX",
        "SL LŨY KẾ TUẦN": "slLuyKeTuan",
        "LŨY KẾ THÁNG": "luyKeTHang",
        "CẦN SX \n TIẾP": "canSXTiep",
        "ĐVT": "dvt",
        "PHẾ KÉO MÁY (kg)": "phekeoMay",
        "PHẾ CHẠY MÁY (kg)": "pheChayMay",
        "PHẾ CHUYỂN ĐỔI": "pheChuyenDoi",
        "PHẾ SỰ CỐ ( MÁY MÓC, THIẾT BỊ )": "pheSuCo",
        "PHẾ DỪNG MÁY": "pheDungMay",
        "Phế xử lý sợ or phế hv or Phế công nghệ": "pheXuLy",
        "TỔNG PHẾ NGÀY": "tongPheNgay",
        "PHẾ ĐƠN HÀNG": "pheDonHang",
        "PHẾ LŨY KẾ TUẦN": "pheLuyKeTuan",
        "PHẾ LŨY KẾ THÁNG": "pheLuyKeTHang",
        "TỶ LỆ HOÀN THÀNH ĐƠN HÀNG": "tyLeHoanThanh",
        "GHI CHÚ": "ghiChu",
      };

      const dateFields = new Set(["ngayNhap", "ngaySanXuat", "ngayBanHanhLXK", "ngaySanXuatGanNhat"]);
      const stringFields = new Set([
        "maSoi", "tenSoi", "donHang", "lenhXK", "dvt", "ghiChu", "tenSoiMoi"
      ]);
      const numberFields = new Set([
        "stt", "thoiGianTSCa1", "sanLuongCa1", "thoiGianTSCa2", "sanLuongCa2", "thoiGianTSCa3", "sanLuongCa3",
        "tongSLNgay", "slDonHangDaSX", "slLuyKeTuan", "luyKeTHang", "canSXTiep",
        "phekeoMay", "pheChayMay", "pheChuyenDoi", "pheSuCo", "pheDungMay", "pheXuLy", "tongPheNgay",
        "pheDonHang", "pheLuyKeTuan", "pheLuyKeTHang", "tyLeHoanThanh", "tyLeNhua"
      ]);

      const formattedProduction = productionRows.map((row) => {
        const obj: any = {};
        productionHeaders.forEach((header, index) => {
          const key = productionMapping[header];
          if (key) {
            let val = row[index];
            if (dateFields.has(key) && typeof val === "number") {
              const date = new Date((val - 25569) * 86400 * 1000);
              val = date.toISOString().split("T")[0];
            } else if (stringFields.has(key) && typeof val === "number") {
              val = String(val);
            } else if (numberFields.has(key)) {
              if (typeof val === "string") {
                const trimmed = val.trim();
                if (trimmed === "" || trimmed === "N/A" || trimmed === "-") {
                  val = null;
                } else {
                  const num = Number(trimmed.replace(/,/g, ''));
                  val = isNaN(num) ? null : num;
                }
              } else if (typeof val !== "number") {
                val = null;
              }
            }
            obj[key] = val;
          }
        });
        return obj;
      });

      const linkedProduction = formattedProduction.map((p) => {
        const matchedOrder = ordersData.find(o => o.donHang === p.donHang);
        if (matchedOrder) {
          p.orderId = matchedOrder.id;
        }
        return p;
      });

      const validProduction = linkedProduction.filter(row => row.ngayNhap && row.ngaySanXuat && row.maSoi && row.tenSoi && row.donHang);

      if (validProduction.length === 0 && ordersData.length === 0) {
        alert("Không tìm thấy dữ liệu hợp lệ trong file!");
        return;
      }

      importProduction({ data: { orders: ordersData, production: validProduction } }, {
        onSuccess: () => {
          alert(`Đã import thành công ${ordersData.length} đơn hàng và ${validProduction.length} dòng sản xuất!`);
          if (tab === "parents") refetchParents();
          if (tab === "logs") refetchLogs();
        },
        onError: (err) => {
          alert(`Import thất bại: ${err.message}`);
        }
      });
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Premium Header Container */}
      <Card className="border-border/60 shadow-sm overflow-hidden bg-gradient-to-r from-background via-background/95 to-muted/20">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Báo Cáo Sản Xuất Sợi
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Quản lý tổng quan tiến độ đơn hàng và truy vết dữ liệu sản xuất chi tiết
              </p>
            </div>

            {/* Premium Segmented Control Toolbar */}
            <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/40 w-fit">
              <button
                onClick={() => updateSearchParams({ tab: "parents", sortBy: "lenhXK", page: 1 })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 ${
                  tab === "parents" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tổng quan Lệnh XK</span>
              </button>
              <button
                onClick={() => updateSearchParams({ tab: "logs", sortBy: "ngaySanXuat", page: 1 })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 ${
                  tab === "logs" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Nhật ký Ca / Ngày SX</span>
              </button>
            </div>
          </div>

          {/* Premium Contextual Toolbar Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/40 mt-4">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/80" />
              <Input
                type="search"
                placeholder={tab === "parents" ? "Tìm mã lệnh, đơn hàng..." : "Tìm mã sợi, lệnh..."}
                className="pl-9 bg-background/80 border-border/60 text-xs h-9 focus-visible:ring-primary/40 rounded-md"
                value={search}
                onChange={(e) => updateSearchParams({ search: e.target.value, page: 1 })}
              />
            </div>

            {/* Sort & Filter Group */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-background/60 border border-border/60 rounded-md px-2 py-0.5">
                <span className="text-[11px] text-muted-foreground font-medium">Sắp xếp:</span>
                <Select value={sortBy} onValueChange={(val) => updateSearchParams({ sortBy: val })}>
                  <SelectTrigger className="w-[130px] h-7 border-0 shadow-none px-1 text-xs font-semibold bg-transparent focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tab === "parents" ? (
                      <>
                        <SelectItem value="lenhXK">Mã Lệnh XK</SelectItem>
                        <SelectItem value="tienDo">Tiến Độ (%)</SelectItem>
                        <SelectItem value="tongSlDonHang">SL Kế Hoạch</SelectItem>
                        <SelectItem value="tongDaSanXuat">SL Thực Tế</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="ngaySanXuat">Ngày Sản Xuất</SelectItem>
                        <SelectItem value="tongSLNgay">Sản Lượng Ngày</SelectItem>
                        <SelectItem value="tongPheNgay">Tổng Phế Ngày</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded hover:bg-muted"
                  onClick={() => updateSearchParams({ sortOrder: sortOrder === "asc" ? "desc" : "asc" })}
                  title={sortOrder === "asc" ? "Tăng dần" : "Giảm dần"}
                >
                  {sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                </Button>
              </div>

              {/* Status Filter */}
              {tab === "parents" && (
                <div className="flex items-center gap-1.5 bg-background/60 border border-border/60 rounded-md px-2 py-0.5">
                  <ListFilter className="w-3 h-3 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={(val) => updateSearchParams({ statusFilter: val, page: 1 })}>
                    <SelectTrigger className="w-[125px] h-7 border-0 shadow-none px-1 text-xs font-semibold bg-transparent focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="COMPLETED">Đã Hoàn Thành</SelectItem>
                      <SelectItem value="IN_PROGRESS">Đang Sản Xuất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Import Trigger */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
              />
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isPending}
                size="sm"
                className="h-8 text-xs font-semibold gap-1.5 px-3"
              >
                {isPending ? (
                  <span className="h-3 w-3 animate-spin">⏳</span>
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                <span>Import Excel</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Render Component View con độc lập hoàn toàn */}
      {tab === "parents" ? (
        <TabParentsView
          parentsData={parentsData}
          isParentsLoading={isParentsLoading}
          statusFilter={statusFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          page={page}
          limit={limit}
          updateSearchParams={updateSearchParams}
        />
      ) : (
        <TabLogsView
          logsData={logsData}
          isLogsLoading={isLogsLoading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          page={page}
          limit={limit}
          updateSearchParams={updateSearchParams}
        />
      )}
    </div>
  );
}
