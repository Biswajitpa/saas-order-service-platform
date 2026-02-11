import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "../../lib/http";
import { Card, CardBody, CardHeader } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useAuth } from "../../state/auth";

export default function Users() {
  const qc = useQueryClient();
  const { user } = useAuth();

  const canSee = user?.role === "admin" || user?.role === "manager";
  const canCreate = user?.role === "admin";

  const q = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await http.get("/users")).data.users as any[],
    enabled: canSee,
  });

  const [form, setForm] = React.useState({ name: "", email: "", role: "client", password: "" });

  const create = async () => {
    await http.post("/users", form);
    setForm({ name: "", email: "", role: "client", password: "" });
    qc.invalidateQueries({ queryKey: ["users"] });
  };

  const toggle = async (id: number) => {
    await http.post(`/users/${id}/toggle`);
    qc.invalidateQueries({ queryKey: ["users"] });
  };

  if (!canSee) {
    return (
      <Card>
        <CardHeader title="Users" subtitle="Forbidden" />
        <CardBody>
          <div className="text-white/65 text-sm">Only Admin/Manager can access user list.</div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader title="Users" subtitle="Manage accounts (admin creates, manager views)" />
        <CardBody>
          {canCreate && (
            <div className="grid md:grid-cols-4 gap-3 items-end">
              <div>
                <div className="text-xs text-white/60 mb-1">Name</div>
                <Input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Email</div>
                <Input value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Role</div>
                <select
                  className="w-full rounded-xl bg-white/6 border border-white/12 px-3 py-2.5 text-sm outline-none focus:border-white/25"
                  value={form.role}
                  onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
                >
                  <option value="client">client</option>
                  <option value="delivery">delivery</option>
                  <option value="staff">staff</option>
                  <option value="manager">manager</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Password</div>
                <Input type="password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} />
              </div>
              <div className="md:col-span-4">
                <Button disabled={form.password.length < 6 || form.name.trim().length < 2} onClick={create}>Create User</Button>
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-2">
            {(q.data ?? []).map((u) => (
              <div key={u.id} className="rounded-2xl border border-white/12 bg-white/5 p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{u.name} <span className="text-xs text-white/55">({u.role})</span></div>
                  <div className="text-xs text-white/55">{u.email}</div>
                </div>
                {user?.role === "admin" && (
                  <Button variant="ghost" onClick={() => toggle(u.id)}>
                    {u.is_active ? "Disable" : "Enable"}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {q.isLoading && <div className="text-sm text-white/55 mt-3">Loading users…</div>}
        </CardBody>
      </Card>
    </div>
  );
}
