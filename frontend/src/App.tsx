import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./state/auth";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AppShell from "./pages/app/AppShell";
import Dashboard from "./pages/app/Dashboard";
import Orders from "./pages/app/Orders";
import Services from "./pages/app/Services";
import Users from "./pages/app/Users";
import Deliveries from "./pages/app/Deliveries";

function Protected({ children }: { children: React.ReactNode }) {
  const { user, hydrate } = useAuth();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    (async () => { await hydrate(); setReady(true); })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return <div className="min-h-screen grid place-items-center text-white/60">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const location = useLocation();
  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          <Route path="/app" element={<Protected><AppShell /></Protected>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="services" element={<Services />} />
            <Route path="deliveries" element={<Deliveries />} />
            <Route path="users" element={<Users />} />
            <Route index element={<Navigate to="/app/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </AuthProvider>
  );
}
