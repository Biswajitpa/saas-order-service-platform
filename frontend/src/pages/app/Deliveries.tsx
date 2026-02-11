import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "../../lib/http";
import { Card, CardBody, CardHeader } from "../../components/Card";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useAuth } from "../../state/auth";
import { MapModal } from "../../components/MapModal";

type Delivery = any;

function useGeoSender(deliveryId: number) {
  const watchRef = React.useRef<number | null>(null);

  const start = async () => {
    if (!("geolocation" in navigator)) throw new Error("Geolocation not supported");
    if (watchRef.current) return;

    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          await http.post(`/deliveries/${deliveryId}/location`, { lat, lng });
        } catch {}
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  };

  const stop = () => {
    if (watchRef.current) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
  };

  return { start, stop };
}

export default function Deliveries() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [mapOpen, setMapOpen] = React.useState(false);
  const [mapCurrent, setMapCurrent] = React.useState<{ lat: number; lng: number } | null>(null);
  const [mapDest, setMapDest] = React.useState<{ lat: number; lng: number } | null>(null);

  const q = useQuery({
    queryKey: ["deliveries"],
    queryFn: async () => (await http.get("/deliveries")).data.deliveries as Delivery[],
    refetchInterval: 4000, // keep it live for admin + delivery
  });

  const setStatus = async (id: number, status: string) => {
    await http.post(`/deliveries/${id}/status`, { status });
    qc.invalidateQueries({ queryKey: ["deliveries"] });
  };

  const openMap = (d: any) => {
    const cur = (d.last_lat && d.last_lng) ? { lat: Number(d.last_lat), lng: Number(d.last_lng) } : null;
    const dst = (d.dest_lat && d.dest_lng) ? { lat: Number(d.dest_lat), lng: Number(d.dest_lng) } : null;
    setMapCurrent(cur);
    setMapDest(dst);
    setMapOpen(true);
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader
          title="Deliveries"
          subtitle={user?.role === "delivery" ? "Your assigned deliveries + live GPS updates" : "Manage delivery assignments + live map"}
        />
        <CardBody>
          <div className="grid gap-3">
            {(q.data ?? []).map((d) => (
              <DeliveryCard
                key={d.id}
                d={d}
                role={user!.role}
                onStatus={setStatus}
                onOpenMap={() => openMap(d)}
                onSaved={() => qc.invalidateQueries({ queryKey: ["deliveries"] })}
              />
            ))}
            {q.isLoading && <div className="text-sm text-white/55">Loading deliveries…</div>}
          </div>
        </CardBody>
      </Card>

      <MapModal open={mapOpen} onClose={() => setMapOpen(false)} current={mapCurrent} destination={mapDest} />
    </div>
  );
}

function DeliveryCard({
  d,
  role,
  onStatus,
  onOpenMap,
  onSaved,
}: {
  d: Delivery;
  role: string;
  onStatus: (id: number, status: string) => Promise<void>;
  onOpenMap: () => void;
  onSaved: () => void;
}) {
  const geo = useGeoSender(d.id);
  const [gpsOn, setGpsOn] = React.useState(false);

  const canUpdate = role === "delivery" || role === "admin" || role === "manager";
  const statuses = ["assigned","picked_up","out_for_delivery","delivered","cancelled"];

  const canSetDestination = role === "admin" || role === "manager";
  const [destLat, setDestLat] = React.useState<string>(d.dest_lat ? String(d.dest_lat) : "");
  const [destLng, setDestLng] = React.useState<string>(d.dest_lng ? String(d.dest_lng) : "");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => () => { try { geo.stop(); } catch {} }, []);

  const toggleGps = async () => {
    try {
      if (!gpsOn) {
        await geo.start();
        setGpsOn(true);
      } else {
        geo.stop();
        setGpsOn(false);
      }
    } catch (e: any) {
      alert(e?.message || "GPS error");
    }
  };

  const saveDestination = async () => {
    const lat = Number(destLat);
    const lng = Number(destLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return alert("Enter valid destination lat/lng");
    setSaving(true);
    try {
      await http.post(`/deliveries/${d.id}/destination`, { lat, lng });
      onSaved();
      alert("Destination saved");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/12 bg-white/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{d.order_title}</div>
          <div className="text-xs text-white/55 mt-1">
            Delivery: <b>{d.delivery_name}</b> • Status: <b>{d.status}</b>
          </div>
          {(d.last_lat && d.last_lng) && (
            <div className="text-xs text-white/55 mt-1">
              Live GPS: <b>{Number(d.last_lat).toFixed(5)}</b>, <b>{Number(d.last_lng).toFixed(5)}</b>
            </div>
          )}
          {(d.dest_lat && d.dest_lng) && (
            <div className="text-xs text-white/55 mt-1">
              Destination: <b>{Number(d.dest_lat).toFixed(5)}</b>, <b>{Number(d.dest_lng).toFixed(5)}</b>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onOpenMap}>View Map</Button>
          {role === "delivery" && (
            <Button variant="ghost" onClick={toggleGps}>
              {gpsOn ? "Stop Live GPS" : "Start Live GPS"}
            </Button>
          )}
        </div>
      </div>

      {canSetDestination && (
        <div className="mt-3 grid md:grid-cols-3 gap-3 items-end">
          <div>
            <div className="text-xs text-white/60 mb-1">Destination Lat</div>
            <Input value={destLat} onChange={(e) => setDestLat(e.target.value)} placeholder="e.g. 20.2961" />
          </div>
          <div>
            <div className="text-xs text-white/60 mb-1">Destination Lng</div>
            <Input value={destLng} onChange={(e) => setDestLng(e.target.value)} placeholder="e.g. 85.8245" />
          </div>
          <div className="flex gap-2">
            <Button disabled={saving} onClick={saveDestination}>Save Destination</Button>
          </div>
        </div>
      )}

      {canUpdate && (
        <div className="mt-3 flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => onStatus(d.id, s)}
              className={`text-xs px-3 py-2 rounded-xl border transition ${
                d.status === s ? "border-white/24 bg-white/12" : "border-white/12 hover:bg-white/8"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}