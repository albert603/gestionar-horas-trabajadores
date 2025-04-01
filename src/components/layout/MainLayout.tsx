
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  School
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const { employees } = useApp();
  
  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Empleados",
      href: "/employees",
      icon: <Users className="h-5 w-5" />,
      count: employees.length,
    },
    {
      name: "Registro de Horas",
      href: "/hours",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Colegios",
      href: "/schools",
      icon: <School className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:block">
        <div className="h-16 border-b border-gray-200 flex items-center px-6">
          <h1 className="text-xl font-bold text-company-blue">
            Sistema de Gestión
          </h1>
        </div>
        <div className="px-3 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
                  location.pathname === item.href
                    ? "bg-company-blue text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {item.icon}
                <span className="ml-3 flex-1">{item.name}</span>
                {item.count ? (
                  <span
                    className={cn(
                      "ml-auto inline-block py-0.5 px-2 text-xs rounded-full",
                      location.pathname === item.href
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    )}
                  >
                    {item.count}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
        <div className="flex justify-between items-center px-4 h-16">
          <h1 className="text-lg font-bold text-company-blue">Sistema de Gestión</h1>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-10">
        <div className="grid grid-cols-4 h-16">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center",
                location.pathname === item.href
                  ? "text-company-blue"
                  : "text-gray-600"
              )}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 md:p-8 md:pt-6 mt-16 md:mt-0 pb-20 md:pb-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
