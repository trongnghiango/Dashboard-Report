import React from "react";
import { PermissionGroup } from "@workspace/api-zod";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, Box, Settings, Layers } from "lucide-react";

interface PermissionMatrixProps {
  groups: PermissionGroup[];
  permissions: Record<string, string[]>;
  onChange: (permissions: Record<string, string[]>) => void;
}

const ACTIONS = ["READ", "CREATE", "UPDATE", "DELETE"];

export const PermissionMatrix = ({ groups, permissions, onChange }: PermissionMatrixProps) => {
  const handleToggle = (resourceCode: string, action: string, checked: boolean) => {
    const currentActions = permissions[resourceCode] || [];
    const newActions = checked
      ? [...currentActions, action]
      : currentActions.filter((a) => a !== action);
    
    onChange({ ...permissions, [resourceCode]: newActions });
  };

  const handleToggleGroup = (group: PermissionGroup, checked: boolean) => {
    const newPermissions = { ...permissions };
    for (const item of group.items) {
      const currentActions = newPermissions[item.resourceCode] || [];
      if (checked) {
        if (!currentActions.includes(item.action)) {
          newPermissions[item.resourceCode] = [...currentActions, item.action];
        }
      } else {
        newPermissions[item.resourceCode] = currentActions.filter(a => a !== item.action);
      }
    }
    onChange(newPermissions);
  };

  const isGroupFullyChecked = (group: PermissionGroup) => {
    return group.items.every(item => 
      permissions[item.resourceCode]?.includes(item.action)
    );
  };

  const isGroupPartiallyChecked = (group: PermissionGroup) => {
    const checkedCount = group.items.filter(item => 
      permissions[item.resourceCode]?.includes(item.action)
    ).length;
    return checkedCount > 0 && checkedCount < group.items.length;
  };

  return (
    <Accordion type="multiple" defaultValue={groups.map(g => `group-${g.id}`)} className="w-full">
      {groups.map((group) => (
        <AccordionItem key={group.id} value={`group-${group.id}`} className="border-b last:border-0 px-6">
          <div className="flex items-center gap-4 py-2">
            <Checkbox 
              id={`check-group-${group.id}`}
              checked={isGroupFullyChecked(group)}
              onCheckedChange={(checked) => handleToggleGroup(group, !!checked)}
              className={isGroupPartiallyChecked(group) ? "opacity-50" : ""}
            />
            <AccordionTrigger className="flex-1 hover:no-underline">
              <div className="flex flex-col items-start gap-1">
                <span className="font-semibold text-base">{group.name}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {group.description || "Gói quyền mặc định"}
                </span>
              </div>
            </AccordionTrigger>
          </div>
          <AccordionContent className="pb-6">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[300px]">Tài nguyên</TableHead>
                    {ACTIONS.map((action) => (
                      <TableHead key={action} className="text-center">{action}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Group items often span multiple resources. We show them logically. */}
                  {Array.from(new Set(group.items.map(i => i.resourceCode))).map(resCode => (
                    <TableRow key={resCode}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Box className="h-4 w-4 text-muted-foreground" />
                          <span>{resCode}</span>
                        </div>
                      </TableCell>
                      {ACTIONS.map((action) => {
                        const isInGroup = group.items.some(i => i.resourceCode === resCode && i.action === action);
                        return (
                          <TableCell key={action} className="text-center">
                            <Checkbox 
                              checked={permissions[resCode]?.includes(action)}
                              onCheckedChange={(checked) => handleToggle(resCode, action, !!checked)}
                              className={isInGroup ? "border-primary" : ""}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
