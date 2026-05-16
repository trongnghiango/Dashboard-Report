import React from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Production from "@/pages/production";
import Orders from "@/pages/orders";
import Waste from "@/pages/waste";
import Performance from "@/pages/performance";

import LoginPage from "@/pages/login";
import UsersPage from "@/pages/admin/users";
import RbacMatrixPage from "@/pages/admin/rbac";
import SettingsPage from "@/pages/admin/settings";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function Router() {
  console.log("[Router] Current Location:", window.location.pathname);
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route>
        <ProtectedRoute>
          <Layout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/san-xuat" component={Production} />
              <Route path="/don-hang" component={Orders} />
              <Route path="/phe-lieu" component={Waste} />
              <Route path="/hieu-suat" component={Performance} />
              
              {/* Admin Routes */}
              <Route path="/admin/users" component={UsersPage} />
              <Route path="/admin/rbac" component={RbacMatrixPage} />
              <Route path="/admin/settings" component={SettingsPage} />
              
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
