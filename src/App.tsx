
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
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

// Protected route component - moved inside AppRoutes to ensure context is available
const AppRoutes = () => {
  const { isAuthenticated, currentUser } = useAuth();
  
  console.log("Estado de autenticación en AppRoutes:", isAuthenticated);
  console.log("Usuario actual:", currentUser?.name);
  
  // Protected route component
  const ProtectedRoute = ({ element, allowedRoles }: { element: React.ReactNode, allowedRoles?: string[] }) => {
    // Redirect to login if user is not authenticated
    if (!isAuthenticated) {
      console.log("Usuario no autenticado, redirigiendo a login");
      return <Navigate to="/login" replace />;
    }
    
    // Check if user has required role
    if (allowedRoles && currentUser?.role && !allowedRoles.includes(currentUser.role)) {
      console.log('Acceso denegado. Rol de usuario:', currentUser.role, 'Roles permitidos:', allowedRoles);
      return <Navigate to="/" replace />;
    }
    
    return <>{element}</>;
  };
  
  // Ensure the initial route is checked for authentication
  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login />
      } />
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
