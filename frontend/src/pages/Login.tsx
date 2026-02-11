import React from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardBody, CardHeader } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useAuth } from "../state/auth";

export default function Login() {
  const nav = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = React.useState("admin@demo.com");
  const [password, setPassword] = React.useState("Admin@123");
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => { if (user) nav("/app/dashboard"); }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      nav("/app/dashboard");
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
            <CardHeader title="Welcome back" subtitle="Secure login to your dashboard" />
          </div>

          <CardBody>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <div className="text-xs text-white/60 mb-1">Email</div>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Password</div>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>

              {err && <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{err}</div>}

              <Button disabled={loading} className="w-full">
                {loading ? "Signing in…" : "Sign in"}
              </Button>

              <div className="text-xs text-white/55">
                Back to <Link className="underline" to="/">landing</Link>.
              </div>

              <div className="mt-4 text-xs text-white/45">
                Demo: admin@demo.com / Admin@123 • manager@demo.com / Manager@123 • staff@demo.com / Staff@123 • delivery@demo.com / Delivery@123 • client@demo.com / Client@123
              </div>
            </form>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
