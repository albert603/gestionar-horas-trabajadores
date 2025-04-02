
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import Index from "./pages/Index";
import Employees from "./pages/Employees";
import Hours from "./pages/Hours";
import Schools from "./pages/Schools";
import Positions from "./pages/Positions";
import Roles from "./pages/Roles";
import History from "./pages/History"; // Nueva página de historial
import SchoolMonthlyReport from "./pages/SchoolMonthlyReport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/hours" element={<Hours />} />
            <Route path="/schools" element={<Schools />} />
            <Route path="/positions" element={<Positions />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/history" element={<History />} /> {/* Nueva ruta */}
            <Route path="/school-report" element={<SchoolMonthlyReport />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
