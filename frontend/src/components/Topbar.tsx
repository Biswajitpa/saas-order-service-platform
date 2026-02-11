import { motion } from "framer-motion";
import { LogOut, LayoutDashboard, Boxes, ClipboardList, Users, Truck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../state/auth";
import { Button } from "./Button";

const items = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/orders", label: "Orders", icon: ClipboardList },
  { to: "/app/services", label: "Services", icon: Boxes },
  { to: "/app/deliveries", label: "Deliveries", icon: Truck },
  { to: "/app/users", label: "Users", icon: Users },
];

export function Topbar() {
  const loc = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="sticky top-0 z-20 border-b border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        <Link to="/app/dashboard" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/15 grid place-items-center">
            <span className="font-bold">S</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">SaaS Platform</div>
            <div className="text-xs text-white/55">Orders • Services • Analytics</div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-2 ml-6">
          {items.map((it) => {
            if (it.to === "/app/users" && !(user?.role === "admin" || user?.role === "manager")) return null;
            if (it.to === "/app/deliveries" && !(user?.role === "admin" || user?.role === "manager" || user?.role === "delivery")) return null;
            const active = loc.pathname.startsWith(it.to);
            const Icon = it.icon;
            return (
              <Link key={it.to} to={it.to} className="relative">
                <div className={`px-3 py-2 rounded-xl border ${active ? "border-white/22 bg-white/10" : "border-white/12 hover:bg-white/8"} flex items-center gap-2 text-sm`}>
                  <Icon size={16} className="opacity-80" />
                  {it.label}
                </div>
                {active && (
                  <motion.div layoutId="nav" className="absolute inset-0 rounded-xl border border-white/20" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-medium">{user?.name}</div>
            <div className="text-xs text-white/55">{user?.role}</div>
          </div>
          <Button variant="ghost" onClick={logout} title="Logout" className="flex items-center gap-2">
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
