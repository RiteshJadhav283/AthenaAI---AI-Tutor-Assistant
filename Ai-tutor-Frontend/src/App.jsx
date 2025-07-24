import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";

import { Sidebar } from "@/components/Sidebar.jsx";
import Dashboard from "@/pages/Dashboard.jsx";
import Doubts from "@/pages/Doubts.jsx";
import Courses from "@/pages/Courses.jsx";
import Tests from "@/pages/Tests.jsx";
import Activity from "@/pages/Activity.jsx";
import Store from "@/pages/Store.jsx";
import NotFound from "@/pages/NotFound.jsx";
import Achievements from "@/pages/Achievements.jsx";

import { AuthProvider, useAuth } from "@/context/AuthContext.jsx";
import AuthPage from "@/components/auth/AuthPage.jsx";

const queryClient = new QueryClient();

// Layout wraps the protected app chrome (sidebar + outlet)
const Layout = () => (
  <div className="flex min-h-screen">
    <Sidebar />
    <div className="flex-1">
      <Outlet />
    </div>
  </div>
);

// Protects all nested routes; redirects to /auth if no user
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute: user, loading:', user, loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public auth page (login / signup) */}
              <Route path="/auth" element={<AuthPage />} />

              {/* All other routes protected */}
              <Route element={<ProtectedRoute />}>
                {/* Wrap your chrome (sidebar) */}
                <Route element={<Layout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/doubts" element={<Doubts />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/tests" element={<Tests />} />
                  <Route path="/activity" element={<Activity />} />
                  <Route path="/store" element={<Store />} />
                  <Route path="/achievements" element={<Achievements />} />
                </Route>
              </Route>

              {/* Fallback 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
