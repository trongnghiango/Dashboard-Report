import { 
  createRootRouteWithContext, 
  createRoute, 
  createRouter, 
  redirect,
  Outlet
} from '@tanstack/react-router';
import { z } from 'zod';
import Dashboard from '@/pages/dashboard';
import Production from '@/pages/production';
import Orders from '@/pages/orders';
import Waste from '@/pages/waste';
import Performance from '@/pages/performance';
import LoginPage from '@/pages/login';
import UsersPage from '@/pages/admin/users';
import RbacMatrixPage from '@/pages/admin/rbac/index';
import SettingsPage from '@/pages/admin/settings';
import NotFound from '@/pages/not-found';
import { Layout } from '@/components/layout';
import { useAuthStore } from './stores/auth';

// 1. Define Router Context
interface MyRouterContext {
  auth: ReturnType<typeof useAuthStore.getState>;
}

// 2. Define Search Param Schemas
const productionSearchSchema = z.object({
  page: z.number().catch(1),
  pageSize: z.number().catch(10),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  machineId: z.string().optional(),
});

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

// 3. Create Root Route (Main Layout Wrapper)
export const rootRoute = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
    </>
  ),
  notFoundComponent: NotFound,
});

// 3. Define Public Routes
export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: (search) => loginSearchSchema.parse(search),
  component: LoginPage,
});

// 4. Define Authenticated Route Group (Parent for all protected pages)
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: () => <Layout />,
});

// 5. Define Protected Child Routes
const indexRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/',
  component: Dashboard,
});

const productionRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/san-xuat',
  validateSearch: (search) => productionSearchSchema.parse(search),
  component: Production,
});

const ordersRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/don-hang',
  component: Orders,
});

const wasteRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/phe-lieu',
  component: Waste,
});

const performanceRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/hieu-suat',
  component: Performance,
});

// Admin Routes
const adminUsersRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/admin/users',
  component: UsersPage,
});

const adminRbacRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/admin/rbac',
  component: RbacMatrixPage,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/admin/settings',
  component: SettingsPage,
});

// 6. Create the Route Tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  authRoute.addChildren([
    indexRoute,
    productionRoute,
    ordersRoute,
    wasteRoute,
    performanceRoute,
    adminUsersRoute,
    adminRbacRoute,
    adminSettingsRoute,
  ]),
]);

// 7. Create the Router instance
export const router = createRouter({ 
  routeTree,
  context: {
    auth: undefined! // Will be injected at runtime
  }
});

// 8. Register for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
