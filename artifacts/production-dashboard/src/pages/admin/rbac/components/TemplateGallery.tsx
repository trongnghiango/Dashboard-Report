import React from "react";
import { RoleTemplate, PermissionGroup } from "@workspace/api-zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Sparkles, ArrowRight } from "lucide-react";
import { useRbacGroups } from "../../../../hooks/api/useAdmin";

interface TemplateGalleryProps {
  templates: RoleTemplate[];
  onApply: (permissions: Record<string, string[]>) => void;
}

export const TemplateGallery = ({ templates, onApply }: TemplateGalleryProps) => {
  const { data: groups } = useRbacGroups();

  const applyTemplate = (template: RoleTemplate) => {
    const newPermissions: Record<string, string[]> = {};

    // 1. Apply groups
    if (groups) {
      for (const groupId of template.groupIds) {
        const group = groups.find(g => g.id === groupId);
        if (group) {
          for (const item of group.items) {
            if (!newPermissions[item.resourceCode]) {
              newPermissions[item.resourceCode] = [];
            }
            if (!newPermissions[item.resourceCode].includes(item.action)) {
              newPermissions[item.resourceCode].push(item.action);
            }
          }
        }
      }
    }

    // 2. Apply individual extra permissions
    for (const item of template.extraPermissions) {
      if (!newPermissions[item.resourceCode]) {
        newPermissions[item.resourceCode] = [];
      }
      if (!newPermissions[item.resourceCode].includes(item.action)) {
        newPermissions[item.resourceCode].push(item.action);
      }
    }

    onApply(newPermissions);
  };

  if (templates.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Sparkles className="h-4 w-4 text-amber-500" />
        Sử dụng mẫu vai trò có sẵn (Presets)
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id} 
            className="group cursor-pointer border-dashed transition-all hover:border-primary/50 hover:bg-accent/10"
            onClick={() => applyTemplate(template)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="font-semibold text-sm group-hover:text-primary transition-colors">
                    {template.name}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {template.description || "Gợi ý cấu hình phù hợp."}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
