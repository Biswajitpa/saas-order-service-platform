import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "../../lib/http";
import { Card, CardBody, CardHeader } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useAuth } from "../../state/auth";
import { motion } from "framer-motion";

type Order = any;

const orderStatuses = ["created","approved","assigned","in_progress","completed","archived"] as const;

export default function Orders() {
  const qc = useQueryClient();
  const { user } = useAuth();

  const q = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await http.get("/orders")).data.orders as Order[],
  });

  const servicesQ = useQuery({
    queryKey: ["services"],
    queryFn: async () => (await http.get("/services")).data.services as any[],
  });

  const usersQ = useQuery({
    queryKey: ["users-lite"],
    queryFn: async () => (await http.get("/users")).data.users as any[],
    enabled: user?.role === "admin" || user?.role === "manager",
  });

  const [newOrder, setNewOrder] = React.useState({
    service_id: 0,
    title: "",
    details: "",
    priority: "medium" as const,
    due_date: "",
  });

  const create = async () => {
    await http.post("/orders", {
      service_id: Number(newOrder.service_id),
      title: newOrder.title,
      details: newOrder.details,
      priority: newOrder.priority,
      due_date: newOrder.due_date || undefined,
    });
    setNewOrder({ service_id: 0, title: "", details: "", priority: "medium", due_date: "" });
    qc.invalidateQueries({ queryKey: ["orders"] });
  };

  const setStatus = async (id: number, status: string, assigned_to?: number, message?: string) => {
    await http.post(`/orders/${id}/status`, { status, assigned_to, message });
    qc.invalidateQueries({ queryKey: ["orders"] });
  };

  const assignDelivery = async (order_id: number, delivery_user_id: number) => {
    await http.post("/deliveries", { order_id, delivery_user_id });
    qc.invalidateQueries({ queryKey: ["orders"] });
  };

  const staffUsers = (usersQ.data ?? []).filter((u) => u.role === "staff" && u.is_active);
  const deliveryUsers = (usersQ.data ?? []).filter((u) => u.role === "delivery" && u.is_active);

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader title="Orders" subtitle="Workflow-driven order management + attachments + delivery" />
        <CardBody>
          {(user?.role === "client" || user?.role === "admin" || user?.role === "manager") && (
            <div className="grid md:grid-cols-4 gap-3 items-end">
              <div className="md:col-span-1">
                <div className="text-xs text-white/60 mb-1">Service</div>
                <select
                  className="w-full rounded-xl bg-white/6 border border-white/12 px-3 py-2.5 text-sm outline-none focus:border-white/25"
                  value={newOrder.service_id}
                  onChange={(e) => setNewOrder((s) => ({ ...s, service_id: Number(e.target.value) }))}
                >
                  <option value={0}>Select…</option>
                  {(servicesQ.data ?? []).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1">
                <div className="text-xs text-white/60 mb-1">Title</div>
                <Input value={newOrder.title} onChange={(e) => setNewOrder((s) => ({ ...s, title: e.target.value }))} placeholder="Order title" />
              </div>
              <div className="md:col-span-1">
                <div className="text-xs text-white/60 mb-1">Due Date</div>
                <Input type="date" value={newOrder.due_date} onChange={(e) => setNewOrder((s) => ({ ...s, due_date: e.target.value }))} />
              </div>
              <div className="md:col-span-1 flex gap-2">
                <Button disabled={!newOrder.service_id || newOrder.title.length < 3} onClick={create} className="w-full">Create</Button>
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-3">
            {(q.data ?? []).map((o) => (
              <OrderCard
                key={o.id}
                o={o}
                role={user?.role}
                staffUsers={staffUsers}
                deliveryUsers={deliveryUsers}
                onSetStatus={setStatus}
                onAssignDelivery={assignDelivery}
                onRefresh={() => qc.invalidateQueries({ queryKey: ["orders"] })}
              />
            ))}
            {q.isLoading && <div className="text-sm text-white/55">Loading orders…</div>}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function OrderCard({
  o,
  role,
  staffUsers,
  deliveryUsers,
  onSetStatus,
  onAssignDelivery,
  onRefresh,
}: {
  o: any;
  role?: string;
  staffUsers: any[];
  deliveryUsers: any[];
  onSetStatus: (id: number, status: string, assigned_to?: number, message?: string) => Promise<void>;
  onAssignDelivery: (order_id: number, delivery_user_id: number) => Promise<void>;
  onRefresh: () => void;
}) {
  const [staffId, setStaffId] = React.useState<number>(o.assigned_to ?? 0);
  const [deliveryId, setDeliveryId] = React.useState<number>(0);
  const [busy, setBusy] = React.useState(false);

  const canManage = role === "admin" || role === "manager";

  const attachmentsQ = useQuery({
    queryKey: ["attachments", o.id],
    queryFn: async () => (await http.get(`/orders/${o.id}/attachments`)).data.attachments as any[],
  });

  const upload = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    await http.post(`/orders/${o.id}/attachments`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    attachmentsQ.refetch();
    onRefresh();
  };

  const doAssignStaff = async () => {
    setBusy(true);
    try {
      await onSetStatus(o.id, "assigned", staffId, "Assigned from UI");
    } finally {
      setBusy(false);
    }
  };

  const doAssignDelivery = async () => {
    setBusy(true);
    try {
      await onAssignDelivery(o.id, deliveryId);
      onRefresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/12 bg-white/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{o.title}</div>
          <div className="text-xs text-white/55 mt-1">
            Service: <b>{o.service_name}</b> • Client: <b>{o.client_name}</b> • Assignee: <b>{o.assignee_name ?? "—"}</b>
          </div>
          <div className="text-xs text-white/55 mt-1">
            Delivery: <b>{o.delivery_name ?? "—"}</b> • Delivery Status: <b>{o.delivery_status ?? "—"}</b>
          </div>
        </div>
        <div className="text-xs text-white/55">
          <div>Status</div>
          <div className="font-semibold text-white/85">{o.status}</div>
        </div>
      </div>

      {/* Status buttons */}
      <div className="mt-3 flex flex-wrap gap-2">
        {orderStatuses.map((s) => {
          const can =
            canManage ||
            (role === "staff" && (s === "in_progress" || s === "completed"));

          const active = o.status === s;
          return (
            <button
              key={s}
              disabled={!can}
              onClick={() => onSetStatus(o.id, s)}
              className={`text-xs px-3 py-2 rounded-xl border transition ${
                active ? "border-white/24 bg-white/12" : "border-white/12 hover:bg-white/8"
              } ${!can ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Assign staff (Admin/Manager) */}
      {canManage && (
        <div className="mt-4 grid md:grid-cols-3 gap-3 items-end">
          <div>
            <div className="text-xs text-white/60 mb-1">Assign Staff</div>
            <select
              className="w-full rounded-xl bg-white/6 border border-white/12 px-3 py-2.5 text-sm outline-none focus:border-white/25"
              value={staffId}
              onChange={(e) => setStaffId(Number(e.target.value))}
            >
              <option value={0}>Select staff…</option>
              {staffUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button disabled={busy || !staffId} onClick={doAssignStaff}>Assign & set status=assigned</Button>
          </div>
        </div>
      )}

      {/* Assign delivery (Admin/Manager) */}
      {canManage && (
        <div className="mt-3 grid md:grid-cols-3 gap-3 items-end">
          <div>
            <div className="text-xs text-white/60 mb-1">Assign Delivery</div>
            <select
              className="w-full rounded-xl bg-white/6 border border-white/12 px-3 py-2.5 text-sm outline-none focus:border-white/25"
              value={deliveryId}
              onChange={(e) => setDeliveryId(Number(e.target.value))}
            >
              <option value={0}>Select delivery…</option>
              {deliveryUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button disabled={busy || !deliveryId} onClick={doAssignDelivery}>Assign Delivery Task</Button>
          </div>
        </div>
      )}

      {/* Attachments */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/4 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">Attachments</div>
            <div className="text-xs text-white/55">Upload PDF/Image (max 15MB)</div>
          </div>
          <label className="text-xs px-3 py-2 rounded-xl border border-white/12 hover:bg-white/8 cursor-pointer">
            Upload
            <input
              type="file"
              accept="application/pdf,image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.currentTarget.value = "";
              }}
            />
          </label>
        </div>

        <div className="mt-3 grid sm:grid-cols-2 gap-2">
          {(attachmentsQ.data ?? []).map((a) => (
            <a key={a.id} href={`http://localhost:4000${a.file_url}`} target="_blank" rel="noreferrer"
               className="rounded-xl border border-white/12 bg-white/5 p-3 hover:bg-white/8 transition">
              <div className="text-xs text-white/60">by {a.uploader_name ?? "—"}</div>
              <div className="text-sm font-medium mt-1 line-clamp-1">{a.original_name}</div>
              <div className="text-xs text-white/55 mt-1">{a.mime_type}</div>
            </a>
          ))}
        </div>

        {attachmentsQ.isLoading && <div className="text-xs text-white/55 mt-2">Loading attachments…</div>}
      </div>

      {o.details && <div className="mt-3 text-sm text-white/70">{o.details}</div>}
    </motion.div>
  );
}
