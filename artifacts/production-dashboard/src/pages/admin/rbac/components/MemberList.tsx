import React from "react";
import { 
  useRoleMembers, 
  useUpdateRoleMembersMutation, 
  useAdminUsers 
} from "../../../../hooks/api/useAdmin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, X, UserMinus, Shield, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MemberListProps {
  roleId: number;
}

export const MemberList = ({ roleId }: MemberListProps) => {
  const { data: members, isLoading: membersLoading } = useRoleMembers(roleId);
  const { data: allUsers } = useAdminUsers();
  const updateMembers = useUpdateRoleMembersMutation(roleId);
  const { toast } = useToast();
  
  const [open, setOpen] = React.useState(false);

  const handleAddMember = (userId: string) => {
    if (members?.some(m => m.userId === userId)) {
      toast({ variant: "destructive", title: "User đã thuộc vai trò này" });
      return;
    }

    const newUserIds = [...(members?.map(m => m.userId) || []), userId];
    updateMembers.mutate({ userIds: newUserIds }, {
      onSuccess: () => {
        toast({ title: "Đã thêm thành viên" });
        setOpen(false);
      }
    });
  };

  const handleRemoveMember = (userId: string) => {
    const newUserIds = (members?.map(m => m.userId) || []).filter(id => id !== userId);
    updateMembers.mutate({ userIds: newUserIds }, {
      onSuccess: () => {
        toast({ title: "Đã xóa thành viên" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Thành viên ({members?.length || 0})</h3>
          <p className="text-sm text-muted-foreground">
            Danh sách những người dùng được gán vai trò này.
          </p>
        </div>
        
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Thêm thành viên
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="end">
            <Command>
              <CommandInput placeholder="Tìm tên hoặc username..." />
              <CommandList>
                <CommandEmpty>Không tìm thấy người dùng.</CommandEmpty>
                <CommandGroup>
                  {allUsers?.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.username}
                      onSelect={() => handleAddMember(user.id)}
                      className="flex items-center gap-2"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{user.fullName?.[0] || user.username[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.fullName || user.username}</span>
                        <span className="text-xs text-muted-foreground">@{user.username}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {membersLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted" />
                  <div className="h-3 w-16 bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : members?.length === 0 ? (
          <Card className="col-span-full border-dashed">
            <CardContent className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
              <Users className="h-8 w-8 mb-2 opacity-20" />
              Chưa có thành viên nào mang vai trò này.
            </CardContent>
          </Card>
        ) : (
          members?.map((member) => (
            <Card key={member.userId} className="group hover:border-primary/30 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{member.fullName?.[0] || member.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold truncate">
                      {member.fullName || member.username}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono truncate">
                      @{member.username}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveMember(member.userId)}
                  disabled={updateMembers.isPending}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
