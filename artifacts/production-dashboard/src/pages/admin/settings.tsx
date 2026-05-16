import React from "react";
import { useAdminSettings, useUpdateSettingsMutation } from "../../hooks/api/useAdmin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save, User, Settings as SettingsIcon, ShieldCheck } from "lucide-react";
import { SettingItem } from "@workspace/api-zod";

const SettingsPage = () => {
  const { data: settings, isLoading } = useAdminSettings();
  const updateSettings = useUpdateSettingsMutation();
  const { toast } = useToast();

  // State local để quản lý form
  const [localSettings, setLocalSettings] = React.useState<SettingItem[]>([]);

  React.useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setLocalSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  const handleSave = (category: string) => {
    const settingsToUpdate = localSettings.filter((s) => s.category === category);
    updateSettings.mutate(
      { settings: settingsToUpdate },
      {
        onSuccess: () => {
          toast({ title: "Đã lưu thay đổi", description: `Cập nhật cấu hình ${category} thành công.` });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const renderSettingRow = (key: string, label: string, type: string = "text") => {
    const item = localSettings.find((s) => s.key === key);
    if (!item) return null;

    return (
      <div className="grid gap-2" key={key}>
        <Label htmlFor={key}>{label}</Label>
        <Input
          id={key}
          type={type}
          value={item.value}
          onChange={(e) => handleChange(key, e.target.value)}
        />
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Cấu hình hệ thống</h2>
      </div>

      <Tabs defaultValue="system" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            Hệ thống
          </TabsTrigger>
          <TabsTrigger value="technical" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Kỹ thuật (SMTP/DB)
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Thông tin cá nhân
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chung</CardTitle>
              <CardDescription>Cấu hình tên hiển thị và thông tin thương hiệu.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderSettingRow("system.name", "Tên hệ thống")}
              {renderSettingRow("system.logo_url", "URL Logo")}
              {renderSettingRow("system.footer_text", "Thông tin Footer")}
              <div className="pt-4">
                <Button onClick={() => handleSave("system")} disabled={updateSettings.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu cấu hình hệ thống
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình máy chủ</CardTitle>
              <CardDescription>Các thông số kết nối dịch vụ backend (SMTP, Database).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {renderSettingRow("smtp.host", "SMTP Host")}
                {renderSettingRow("smtp.port", "SMTP Port")}
                {renderSettingRow("smtp.user", "SMTP User")}
                {renderSettingRow("smtp.pass", "SMTP Password", "password")}
              </div>
              <div className="pt-4">
                <Button onClick={() => handleSave("technical")} disabled={updateSettings.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu cấu hình kỹ thuật
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hồ sơ cá nhân</CardTitle>
              <CardDescription>Thông tin hiển thị của bạn trên hệ thống.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderSettingRow("profile.full_name", "Họ và tên")}
              {renderSettingRow("profile.email", "Email liên hệ")}
              <div className="pt-4">
                <Button onClick={() => handleSave("profile")} disabled={updateSettings.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Cập nhật hồ sơ
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
