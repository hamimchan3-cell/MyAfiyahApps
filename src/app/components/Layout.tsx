import { Outlet, useNavigate, useLocation } from "react-router";
import { Home, Book, Stethoscope, MapPin, Shield } from "lucide-react";
import { useMemo } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useAppLanguage } from "../lib/language";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [language] = useAppLanguage();

  const navItems = useMemo(() => {
    const labels = language === "ms"
      ? {
          home: "Utama",
          tools: "Alatan",
          guides: "Panduan",
          hospitals: "Hospital",
          admin: "Admin",
        }
      : {
          home: "Home",
          tools: "Tools",
          guides: "Guides",
          hospitals: "Hospitals",
          admin: "Admin",
        };

    const base = [
      { path: "/app", label: labels.home, icon: Home },
      { path: "/app/first-aid-tools", label: labels.tools, icon: Stethoscope },
      { path: "/app/treatment-guides", label: labels.guides, icon: Book },
      { path: "/app/nearby-hospitals", label: labels.hospitals, icon: MapPin },
    ];

    if (isAdmin) {
      return [...base, { path: "/app/admin", label: labels.admin, icon: Shield }];
    }

    return base;
  }, [isAdmin, language]);

  const isActive = (path: string) => {
    if (path === "/app") {
      return location.pathname === "/app";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 shadow-lg">
        <nav className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex-1 flex flex-col items-center py-3 px-2 transition-colors ${
                  active
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${active ? "fill-blue-100" : ""}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
