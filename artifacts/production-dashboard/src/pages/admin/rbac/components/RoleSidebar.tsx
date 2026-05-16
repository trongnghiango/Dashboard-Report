import React from "react";
import { RoleResponse } from "@workspace/api-zod";
import { Search, ChevronRight, Plus, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface RoleSidebarProps {
  roles: RoleResponse[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  isLoading: boolean;
}

export const RoleSidebar = ({ roles, selectedId, onSelect, isLoading }: RoleSidebarProps) => {
  const [search, setSearch] = React.useState("");

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex w-[300px] flex-col border-r bg-muted/30">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Vai trò (Roles)</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm vai trò..."
            className="pl-8 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          ) : filteredRoles.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Không tìm thấy vai trò nào.
            </div>
          ) : (
            filteredRoles.map((role) => (
              <button
                key={role.id}
                onClick={() => onSelect(role.id)}
                className={cn(
                  "flex w-full flex-col items-start gap-1 rounded-lg px-3 py-3 text-left transition-all hover:bg-accent",
                  selectedId === role.id ? "bg-accent shadow-sm" : "transparent"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-medium text-sm">{role.name}</span>
                  {selectedId === role.id && <ChevronRight className="h-4 w-4 text-primary" />}
                </div>
                <span className="text-xs text-muted-foreground font-mono">{role.code}</span>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
