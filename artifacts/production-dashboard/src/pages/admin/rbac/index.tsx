import React from "react";
import {
  useAdminRoles,
  useAdminResources,
  useRbacMatrix,
  useUpdateMatrixMutation,
  useRbacGroups,
  useRbacTemplates,
  useRbacTemplateDetail,
} from "../../../hooks/api/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, Save, LayoutGrid, Search, ChevronRight, Plus } from "lucide-react";
import { RoleSidebar } from "./components/RoleSidebar";
import { PermissionMatrix } from "./components/PermissionMatrix";
import { MemberList } from "./components/MemberList";
import { TemplateGallery } from "./components/TemplateGallery";
import { Skeleton } from "@/components/ui/skeleton";

const AdvancedRbacPage = () => {
  const [selectedRoleId, setSelectedRoleId] = React.useState<number | null>(null);
  const { data: roles, isLoading: rolesLoading } = useAdminRoles();
  const { data: matrix, isLoading: matrixLoading, refetch: refetchMatrix } = useRbacMatrix(selectedRoleId);
  const { data: groups } = useRbacGroups();
  const { data: templates } = useRbacTemplates();
  const updateMatrix = useUpdateMatrixMutation(selectedRoleId);
  const { toast } = useToast();

  const [localPermissions, setLocalPermissions] = React.useState<Record<string, string[]>>({});
  const [activeTab, setActiveTab] = React.useState("permissions");

  // Sync with matrix data from server
  React.useEffect(() => {
    if (matrix) {
      setLocalPermissions(matrix.permissions);
    }
  }, [matrix]);

  const handleApplyTemplate = (templatePermissions: Record<string, string[]>) => {
    // "Tick thêm hoặc bỏ bớt" - merge or replace? 
    // Usually, applying a template means setting the matrix to match the template exactly, 
    // then allowing manual tweaks.
    setLocalPermissions(templatePermissions);
    toast({ title: "Đã áp dụng mẫu quyền" });
  };

  const handleSave = () => {
    if (!selectedRoleId) return;
    updateMatrix.mutate(
      { permissions: localPermissions },
      {
        onSuccess: () => {
          toast({ title: "Cập nhật quyền thành công" });
          refetchMatrix();
        },
      }
    );
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
      {/* Sidebar - Role List */}
      <RoleSidebar 
        roles={roles || []} 
        selectedId={selectedRoleId} 
        onSelect={setSelectedRoleId} 
        isLoading={rolesLoading}
      />

      {/* Main Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {!selectedRoleId ? (
          <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
            <div className="rounded-full bg-primary/10 p-6">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <div className="max-w-[400px] space-y-2">
              <h3 className="text-xl font-semibold">Quản lý Phân quyền (RBAC)</h3>
              <p className="text-muted-foreground">
                Chọn một vai trò từ danh sách bên trái để bắt đầu thiết lập quyền hạn và quản lý thành viên.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {roles?.find(r => r.id === selectedRoleId)?.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Mã định danh: <code className="rounded bg-muted px-1">{roles?.find(r => r.id === selectedRoleId)?.code}</code>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => refetchMatrix()}>
                    Hoàn tác
                  </Button>
                  <Button size="sm" className="gap-2" onClick={handleSave} disabled={updateMatrix.isPending}>
                    <Save className="h-4 w-4" />
                    {updateMatrix.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col overflow-hidden">
              <div className="px-6 pt-2">
                <TabsList className="grid w-[400px] grid-cols-2">
                  <TabsTrigger value="permissions" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Quyền hạn
                  </TabsTrigger>
                  <TabsTrigger value="members" className="gap-2">
                    <Users className="h-4 w-4" />
                    Thành viên
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto p-6 pt-2">
                <TabsContent value="permissions" className="mt-0 space-y-6">
                  {/* Template Gallery */}
                  <TemplateGallery 
                    templates={templates || []} 
                    onApply={handleApplyTemplate} 
                  />

                  {/* Matrix */}
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    {matrixLoading ? (
                      <div className="space-y-4 p-6">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-[300px] w-full" />
                      </div>
                    ) : (
                      <PermissionMatrix 
                        groups={groups || []}
                        permissions={localPermissions}
                        onChange={setLocalPermissions}
                      />
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="members" className="mt-0">
                  <MemberList roleId={selectedRoleId} />
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default AdvancedRbacPage;
