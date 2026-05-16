import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginRequestSchema, LoginRequest } from "@workspace/api-zod";
import { useLoginMutation } from "../hooks/api/useAuth";
import { useAuthStore } from "../stores/auth";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

import { loginRoute } from "../router";

const LoginPage = () => {
  console.log("[LoginPage] Rendering");
  const navigate = useNavigate();
  const search = loginRoute.useSearch();
  const { toast } = useToast();
  const loginMutation = useLoginMutation();
  const { isAuthenticated } = useAuthStore();

  const redirectPath = search.redirect || "/";

  React.useEffect(() => {
    if (isAuthenticated) {
      console.log("[LoginPage] Already authenticated, redirecting to", redirectPath);
      navigate({ to: redirectPath as any });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        toast({ title: "Đăng nhập thành công" });
        navigate({ to: redirectPath as any });
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Đăng nhập thất bại",
          description: err.message,
        });
      },
    });
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Dashboard Report</CardTitle>
          <CardDescription className="text-center">
            Vui lòng đăng nhập để truy cập hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đăng nhập</FormLabel>
                    <FormControl>
                      <Input placeholder="admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Đang xử lý..." : "Đăng nhập"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
