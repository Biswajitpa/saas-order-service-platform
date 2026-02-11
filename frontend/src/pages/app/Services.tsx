import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "../../lib/http";
import { Card, CardBody, CardHeader } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useAuth } from "../../state/auth";

export default function Services() {
  const qc = useQueryClient();
  const { user } = useAuth();

  const q = useQuery({
    queryKey: ["services"],
    queryFn: async () => (await http.get("/services")).data.services as any[],
  });

  const [form, setForm] = React.useState({ name: "", description: "", base_price: 0 });

  const create = async () => {
    await http.post("/services", { ...form, base_price: Number(form.base_price) });
    setForm({ name: "", description: "", base_price: 0 });
    qc.invalidateQueries({ queryKey: ["services"] });
  };

  const canCreate = user?.role === "admin" || user?.role === "manager";

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader title="Services" subtitle="Maintain service catalog (admin/manager)" />
        <CardBody>
          {canCreate && (
            <div className="grid md:grid-cols-4 gap-3 items-end">
              <div>
                <div className="text-xs text-white/60 mb-1">Name</div>
                <Input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Base Price</div>
                <Input type="number" value={form.base_price} onChange={(e) => setForm((s) => ({ ...s, base_price: Number(e.target.value) }))} />
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-white/60 mb-1">Description</div>
                <Input value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
              </div>
              <div className="md:col-span-4">
                <Button disabled={form.name.trim().length < 2} onClick={create}>Add Service</Button>
              </div>
            </div>
          )}

          <div className="mt-5 grid md:grid-cols-2 gap-3">
            {(q.data ?? []).map((s) => (
              <div key={s.id} className="rounded-2xl border border-white/12 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-sm text-white/65 mt-1">{s.description || "—"}</div>
                  </div>
                  <div className="text-sm font-semibold">₹{Number(s.base_price).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>

          {q.isLoading && <div className="text-sm text-white/55 mt-3">Loading services…</div>}
        </CardBody>
      </Card>
    </div>
  );
}
