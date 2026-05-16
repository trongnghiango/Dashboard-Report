import React from "react";
import { useAdminUsers, useUpdateUserMutation } from "../../hooks/api/useAdmin";
import { CreateUserModal } from "../../components/admin/Users/CreateUserModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const UsersPage = () => {
  const { data: users, isLoading } = useAdminUsers();
  const updateUser = useUpdateUserMutation();
  const { toast } = useToast();

  const handleToggleActive = (id: string, currentStatus: number) => {
    updateUser.mutate(
      { id, data: { isActive: currentStatus === 1 ? 0 : 1 } },
      {
        onSuccess: () => {
          toast({ title: "Cập nhật trạng thái thành công" });
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: err.message || "Không thể cập nhật trạng thái",
          });
        },
      }
    );
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h2>
        <div className="flex items-center space-x-2">
          <CreateUserModal />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài khoản</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên đăng nhập</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Kích hoạt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.fullName || "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.roles.map((role) => (
                            <Badge key={role.id} variant="secondary">
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.isActive === 1 ? (
                          <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white border-0">
                            Hoạt động
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Bị khóa</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch
                          checked={user.isActive === 1}
                          onCheckedChange={() => handleToggleActive(user.id, user.isActive)}
                          disabled={updateUser.isPending}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;
