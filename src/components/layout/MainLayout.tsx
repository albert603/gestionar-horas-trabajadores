
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Building2,
  ClipboardList,
  Clock,
  Users,
  Briefcase,
  Shield,
  Home,
  History,
  LogOut,
  User,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

interface MainLayoutProps {
  children: React.ReactNode;
}

const NavItem = ({ to, icon, label, end }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100 group",
          isActive && "bg-gray-100 text-company-blue"
        )
      }
    >
      {icon}
      <span className="ml-3">{label}</span>
    </NavLink>
  );
};

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  const isAdmin = currentUser?.role === "Administrador";
  
  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const renderNavItems = () => (
    <ul className="space-y-2">
      <li>
        <NavItem 
          to="/" 
          icon={<Home className="w-5 h-5" />} 
          label={isAdmin ? "Dashboard" : "Mis Horas"} 
          end 
        />
      </li>
      {isAdmin && (
        <li>
          <NavItem
            to="/employees"
            icon={<Users className="w-5 h-5" />}
            label="Empleados"
          />
        </li>
      )}
      <li>
        <NavItem
          to="/hours"
          icon={<Clock className="w-5 h-5" />}
          label="Registro de Horas"
        />
      </li>
      {isAdmin && (
        <>
          <li>
            <NavItem
              to="/schools"
              icon={<Building2 className="w-5 h-5" />}
              label="Colegios"
            />
          </li>
          <li>
            <NavItem
              to="/positions"
              icon={<Briefcase className="w-5 h-5" />}
              label="Cargos"
            />
          </li>
          <li>
            <NavItem
              to="/roles"
              icon={<Shield className="w-5 h-5" />}
              label="Privilegios"
            />
          </li>
          <li>
            <NavItem
              to="/school-report"
              icon={<ClipboardList className="w-5 h-5" />}
              label="Informe Mensual"
            />
          </li>
          <li>
            <NavItem
              to="/history"
              icon={<History className="w-5 h-5" />}
              label="Historial"
            />
          </li>
        </>
      )}
    </ul>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar - only shown on large screens */}
      {!isMobile && (
        <aside className="w-64 h-screen shadow-md bg-white hidden md:block">
          <div className="h-20 flex items-center justify-center border-b">
            <h1 className="text-2xl font-bold text-company-blue">
              GestHoras
            </h1>
          </div>
          <div className="px-3 py-4 overflow-y-auto">
            {renderNavItems()}
          </div>
        </aside>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4 px-6">
            {isMobile && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[300px] p-0">
                  <div className="h-20 flex items-center justify-center border-b">
                    <h1 className="text-xl font-bold text-company-blue">
                      GestHoras
                    </h1>
                  </div>
                  <div className="px-3 py-4 overflow-y-auto">
                    {renderNavItems()}
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <h2 className={cn("text-xl font-semibold text-gray-800", isMobile && "ml-2")}>
              {isMobile ? "" : "Sistema de Gestión de Horas"}
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className={cn(isMobile ? "sr-only" : "")}>
                    {currentUser?.name || "Usuario"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-gray-600">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};
