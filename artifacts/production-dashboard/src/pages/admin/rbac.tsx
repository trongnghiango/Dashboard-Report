import React from "react";
import {
  useAdminRoles,
  useAdminResources,
  useRbacMatrix,
  useUpdateMatrixMutation,
} from "../../hooks/api/useAdmin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Checkbox } from "../../components/ui/checkbox";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Shield, Save, RefreshCcw } from "lucide-react";

const ACTIONS = ["READ", "CREATE", "UPDATE", "DELETE"];

const RbacMatrixPage = () => {
  const [selectedRoleId, setSelectedRoleId] = React.useState<string | null>(null);
  const { data: roles } = useAdminRoles();
  const { data: resources } = useAdminResources();
  const { data: matrix, isLoading, refetch } = useRbacMatrix(selectedRoleId ? parseInt(selectedRoleId, 10) : null);
  const updateMatrix = useUpdateMatrixMutation(selectedRoleId ? parseInt(selectedRoleId, 10) : null);
  const { toast } = useToast();

  // State local để lưu các thay đổi tạm thời trên ma trận
  const [localPermissions, setLocalPermissions] = React.useState<Record<string, string[]>>({});

  // Cập nhật state local khi matrix data từ API thay đổi
  React.useEffect(() => {
    if (matrix) {
      setLocalPermissions(matrix.permissions);
    }
  }, [matrix]);

  const handleCheckboxChange = (resourceCode: string, action: string, checked: boolean) => {
    setLocalPermissions((prev) => {
      const currentActions = prev[resourceCode] || [];
      const newActions = checked
        ? [...currentActions, action]
        : currentActions.filter((a) => a !== action);
      
      return { ...prev, [resourceCode]: newActions };
    });
  };

  const handleSave = () => {
    updateMatrix.mutate(
      { permissions: localPermissions },
      {
        onSuccess: () => {
          toast({ title: "Cập nhật quyền thành công" });
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: err.message || "Không thể cập nhật quyền",
          });
        },
      }
    );
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Phân quyền hệ thống (RBAC)</h2>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Ma trận quyền hạn</CardTitle>
              <CardDescription>
                Chọn vai trò để chỉnh sửa quyền truy cập cho từng tài nguyên.
              </CardDescription>
            </div>
            <div className="w-[250px]">
              <Select onValueChange={setSelectedRoleId} value={selectedRoleId || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò (Role)" />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name} ({role.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedRoleId ? (
            <div className="flex h-[300px] flex-col items-center justify-center space-y-4 rounded-md border border-dashed">
              <Shield className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">Vui lòng chọn một vai trò để bắt đầu thiết lập quyền.</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[300px]">Tài nguyên (Resource)</TableHead>
                      {ACTIONS.map((action) => (
                        <TableHead key={action} className="text-center">
                          {action}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resources?.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{resource.name}</span>
                            <span className="text-xs text-muted-foreground">{resource.code}</span>
                          </div>
                        </TableCell>
                        {ACTIONS.map((action) => (
                          <TableCell key={action} className="text-center">
                            <Checkbox
                              checked={localPermissions[resource.code]?.includes(action)}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(resource.code, action, !!checked)
                              }
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => refetch()}
                  disabled={updateMatrix.isPending}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Hoàn tác
                </Button>
                <Button className="gap-2" onClick={handleSave} disabled={updateMatrix.isPending}>
                  <Save className="h-4 w-4" />
                  {updateMatrix.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RbacMatrixPage;
