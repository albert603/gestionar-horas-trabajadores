
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import Index from "./pages/Index";
import Employees from "./pages/Employees";
import Hours from "./pages/Hours";
import Schools from "./pages/Schools";
import Positions from "./pages/Positions";
import Roles from "./pages/Roles";
import History from "./pages/History";
import SchoolMonthlyReport from "./pages/SchoolMonthlyReport";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route component
const ProtectedRoute = ({ element, allowedRoles }: { element: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, currentUser } = useApp();
  
  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has required role
  if (allowedRoles && currentUser?.role && !allowedRoles.includes(currentUser.role)) {
    console.log('Access denied. User role:', currentUser.role, 'Allowed roles:', allowedRoles);
    return <Navigate to="/" replace />;
  }
  
  return <>{element}</>;
};

// Routes configuration with role-based access
const AppRoutes = () => {
  // Ensure the initial route is checked for authentication
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute element={<Index />} />} />
      <Route path="/employees" element={<ProtectedRoute element={<Employees />} allowedRoles={["Administrador"]} />} />
      <Route path="/hours" element={<ProtectedRoute element={<Hours />} />} />
      <Route path="/schools" element={<ProtectedRoute element={<Schools />} allowedRoles={["Administrador"]} />} />
      <Route path="/positions" element={<ProtectedRoute element={<Positions />} allowedRoles={["Administrador"]} />} />
      <Route path="/roles" element={<ProtectedRoute element={<Roles />} allowedRoles={["Administrador"]} />} />
      <Route path="/history" element={<ProtectedRoute element={<History />} allowedRoles={["Administrador"]} />} />
      <Route path="/school-report" element={<ProtectedRoute element={<SchoolMonthlyReport />} allowedRoles={["Administrador"]} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
