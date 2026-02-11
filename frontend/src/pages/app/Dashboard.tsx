import { useQuery } from "@tanstack/react-query";
import { http } from "../../lib/http";
import { Card, CardBody, CardHeader } from "../../components/Card";
import { useAuth } from "../../state/auth";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Overview = {
  overview: { users: number; orders: number; open: number; completed: number };
  byStatus: { status: string; count: number }[];
};

export default function Dashboard() {
  const { user } = useAuth();

  const q = useQuery({
    queryKey: ["overview"],
    queryFn: async () => (await http.get("/stats/overview")).data as { ok: true } & Overview,
    enabled: user?.role === "admin" || user?.role === "manager",
  });

  return (
    <div className="grid gap-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Welcome" subtitle="Your operational overview" />
          <CardBody>
            <div className="text-white/70 text-sm leading-relaxed">
              This dashboard is built with industry patterns: <b>RBAC</b>, clean APIs, MySQL relations, and smooth UI transitions.
              Use <b>Orders</b> to manage workflow and <b>Services</b> to maintain catalog.
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Your Role" subtitle="Access level & responsibilities" />
          <CardBody>
            <div className="text-sm">
              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Name</span>
                <span className="font-medium">{user?.name}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Role</span>
                <span className="font-medium">{user?.role}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-white/60">Email</span>
                <span className="font-medium">{user?.email}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {(user?.role === "admin" || user?.role === "manager") && (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-1">
            <CardHeader title="KPIs" subtitle="Key metrics (demo)" />
            <CardBody>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/12 bg-white/6 p-4">
                  <div className="text-xs text-white/55">Users</div>
                  <div className="text-2xl font-semibold mt-1">{q.data?.overview.users ?? "—"}</div>
                </div>
                <div className="rounded-2xl border border-white/12 bg-white/6 p-4">
                  <div className="text-xs text-white/55">Orders</div>
                  <div className="text-2xl font-semibold mt-1">{q.data?.overview.orders ?? "—"}</div>
                </div>
                <div className="rounded-2xl border border-white/12 bg-white/6 p-4">
                  <div className="text-xs text-white/55">Open</div>
                  <div className="text-2xl font-semibold mt-1">{q.data?.overview.open ?? "—"}</div>
                </div>
                <div className="rounded-2xl border border-white/12 bg-white/6 p-4">
                  <div className="text-xs text-white/55">Completed</div>
                  <div className="text-2xl font-semibold mt-1">{q.data?.overview.completed ?? "—"}</div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader title="Orders by Status" subtitle="Operational distribution" />
            <CardBody className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={q.data?.byStatus ?? []}>
                  <XAxis dataKey="status" stroke="rgba(255,255,255,.45)" />
                  <YAxis stroke="rgba(255,255,255,.45)" />
                  <Tooltip contentStyle={{ background: "rgba(10,12,20,.9)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12 }} />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
              {q.isLoading && <div className="text-white/55 text-sm mt-3">Loading metrics…</div>}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
