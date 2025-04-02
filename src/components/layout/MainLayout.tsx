
import React, { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Users, Home, CalendarClock, School, Briefcase, Shield, History } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { path: "/employees", label: "Empleados", icon: <Users className="w-5 h-5" /> },
    { path: "/hours", label: "Registros de Horas de Trabajadores", icon: <CalendarClock className="w-5 h-5" /> },
    { path: "/schools", label: "Colegios", icon: <School className="w-5 h-5" /> },
    { path: "/positions", label: "Cargos", icon: <Briefcase className="w-5 h-5" /> },
    { path: "/roles", label: "Privilegios", icon: <Shield className="w-5 h-5" /> },
    { path: "/history", label: "Historial", icon: <History className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="fixed left-0 top-0 h-screen w-16 lg:w-64 border-r border-gray-200 bg-white z-10">
        <div className="px-4 py-6">
          <h2 className="text-xl font-bold text-company-blue hidden lg:block">Registro Horas</h2>
          <h2 className="text-xl font-bold text-company-blue block lg:hidden text-center">RH</h2>
        </div>
        <nav className="px-2 pt-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 rounded-lg mb-1 transition-colors",
                isActive(item.path)
                  ? "bg-company-blue text-white"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <div className="flex justify-center lg:justify-start items-center w-full lg:w-auto">
                {item.icon}
                <span className="ml-3 hidden lg:block">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>
      </div>
      <div className="ml-16 lg:ml-64 flex-1 p-6">
        <main className="max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
};
