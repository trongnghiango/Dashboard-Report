import React, { useState } from "react";
import { Link, useRouterState, Outlet } from "@tanstack/react-router";
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
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { useAuthStore } from "../stores/auth";
import { useLogoutMutation } from "../hooks/api/useAuth";

export function Layout() {
  console.log("[Layout] Rendering");
  const routerState = useRouterState();
  const location = routerState.location.pathname;
  const { user, can } = useAuthStore();
  const logoutMutation = useLogoutMutation();

  const businessNav = [
    { href: "/", label: "Tổng Quan", icon: Activity, resource: "dashboard" },
    { href: "/san-xuat", label: "Báo Cáo Sản Xuất", icon: Factory, resource: "production" },
    { href: "/don-hang", label: "Đơn Hàng", icon: ListTodo, resource: "orders" },
    { href: "/phe-lieu", label: "Phế Liệu", icon: Recycle, resource: "waste" },
    { href: "/hieu-suat", label: "Hiệu Suất", icon: BarChart3, resource: "performance" },
  ].filter(item => item.resource === "dashboard" || can(item.resource, "READ"));

  const systemNav = [
    { href: "/admin/users", label: "Người dùng", icon: Users, resource: "users" },
    { href: "/admin/rbac", label: "Phân quyền", icon: Shield, resource: "rbac" },
    { href: "/admin/settings", label: "Cài đặt", icon: Settings, resource: "settings" },
  ].filter(item => can(item.resource, "READ"));

  const userInitials = user?.username?.substring(0, 2).toUpperCase() || "US";

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
                to="/"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                <Factory className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">MES Dashboard</span>
              </Link>
              {businessNav.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href as any}
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

              {systemNav.length > 0 && (
                <>
                  <div className="h-px bg-border my-2" />
                  {systemNav.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href as any}
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
                </>
              )}
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
              to="/"
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
              <Factory className="h-4 w-4 transition-all group-hover:scale-110" />
              <span className="sr-only">MES Dashboard</span>
            </Link>
            {businessNav.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href as any}
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
            {systemNav.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href as any}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full mt-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user?.username || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" side="right" sideOffset={10}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.username}</p>
                    <p className="text-xs leading-none text-muted-foreground uppercase">
                      MES User
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/admin/settings" className="cursor-pointer flex w-full items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Cấu hình</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </aside>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
