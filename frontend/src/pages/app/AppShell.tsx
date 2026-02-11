import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Topbar } from "../../components/Topbar";

export default function AppShell() {
  return (
    <div className="min-h-screen">
      <Topbar />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-6xl px-4 py-6"
      >
        <Outlet />
      </motion.div>
    </div>
  );
}
