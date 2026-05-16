import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Activity,
  BarChart3,
  Factory,
  FileText,
  ListTodo,
  Menu,
  Recycle,
  Search,
  Settings,
  Users,
  Shield,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { useAuthStore } from "../stores/auth";
import { useLogoutMutation } from "../hooks/api/useAuth";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  console.log("[Layout] Rendering");
  const [location, setLocation] = useLocation();
  const can = useAuthStore((state) => state.can);
  const logoutMutation = useLogoutMutation();

  const navItems = [
    { href: "/", label: "Tổng Quan", icon: Activity, resource: "dashboard" },
    { href: "/san-xuat", label: "Báo Cáo Sản Xuất", icon: Factory, resource: "production" },
    { href: "/don-hang", label: "Đơn Hàng", icon: ListTodo, resource: "orders" },
    { href: "/phe-lieu", label: "Phế Liệu", icon: Recycle, resource: "waste" },
    { href: "/hieu-suat", label: "Hiệu Suất", icon: BarChart3, resource: "performance" },
    { href: "/admin/users", label: "Người dùng", icon: Users, resource: "users" },
    { href: "/admin/rbac", label: "Phân quyền", icon: Shield, resource: "rbac" },
    { href: "/admin/settings", label: "Cài đặt", icon: Settings, resource: "settings" },
  ].filter(item => {
    // Luôn cho phép Dashboard, các trang khác check quyền READ
    const allowed = item.resource === "dashboard" || can(item.resource, "READ");
    return allowed;
  });

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                <Factory className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">MES Dashboard</span>
              </Link>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-4 px-2.5 ${
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex-1 sm:flex-initial">
            <h1 className="text-xl font-bold tracking-tight text-primary hidden sm:block uppercase">MES SỢI</h1>
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
              href="/"
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
              <Factory className="h-4 w-4 transition-all group-hover:scale-110" />
              <span className="sr-only">MES Dashboard</span>
            </Link>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
            <Button
              variant="ghost"
              size="icon"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Đăng xuất</span>
            </Button>
          </nav>
        </aside>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
