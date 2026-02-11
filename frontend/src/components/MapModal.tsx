import React from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./Button";

/* ================= MARKER FIX ================= */
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/* ================= TYPES ================= */
type LatLng = { lat: number; lng: number };

/* ================= ROUTE API ================= */
async function fetchRoute(from: LatLng, to: LatLng): Promise<[number, number][]> {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Route fetch failed");
  const data = await r.json();
  const coords: [number, number][] = data?.routes?.[0]?.geometry?.coordinates ?? [];
  return coords.map((c) => [c[1], c[0]]); // [lat,lng]
}

/* ================= MAP HELPERS ================= */
function FixResize({ open }: { open: boolean }) {
  const map = useMap();
  React.useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => map.invalidateSize(), 250);
    return () => window.clearTimeout(t);
  }, [open, map]);
  return null;
}

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

/* ================= COMPONENT ================= */
export function MapModal({
  open,
  onClose,
  current,
  destination,
}: {
  open: boolean;
  onClose: () => void;
  current?: LatLng | null;      // ✅ added (your Deliveries page passes this)
  destination?: LatLng | null;  // ✅ keep
}) {
  const [gpsCurrent, setGpsCurrent] = React.useState<LatLng | null>(null);
  const [route, setRoute] = React.useState<[number, number][]>([]);
  const [err, setErr] = React.useState<string | null>(null);

  // ✅ use parent current if provided, else use browser GPS
  const activeCurrent = current ?? gpsCurrent;

  /* ===== LIVE CURRENT LOCATION (only if parent not sending current) ===== */
  React.useEffect(() => {
    if (!open) return;
    if (current) return; // parent already provides current

    if (!("geolocation" in navigator)) {
      setErr("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsCurrent({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setErr("Location permission denied"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [open, current]);

  /* ===== ROUTE UPDATE ===== */
  React.useEffect(() => {
    let alive = true;

    setRoute([]);
    setErr(null);

    (async () => {
      if (!open) return;
      if (!activeCurrent || !destination) return;

      try {
        const pts = await fetchRoute(activeCurrent, destination);
        if (alive) setRoute(pts);
      } catch (e: any) {
        if (alive) setErr(e?.message || "Route error");
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, activeCurrent?.lat, activeCurrent?.lng, destination?.lat, destination?.lng]);

  const center: [number, number] = activeCurrent
    ? [activeCurrent.lat, activeCurrent.lng]
    : destination
    ? [destination.lat, destination.lng]
    : [20.5937, 78.9629];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-x-3 top-10 bottom-10 md:inset-x-10 rounded-3xl border border-white/12 bg-[#070a16] overflow-hidden"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30">
              <div>
                <div className="text-sm font-semibold">Live Delivery Map</div>
                <div className="text-xs text-white/55">Current location → Destination</div>
              </div>
              <Button variant="ghost" onClick={onClose}>
                <X size={16} /> Close
              </Button>
            </div>

            {/* MAP */}
            <div className="h-[calc(100%-56px)]">
              <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }}>
                <FixResize open={open} />
                <Recenter center={center} />

                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="© OpenStreetMap contributors"
                />

                {activeCurrent && <Marker position={[activeCurrent.lat, activeCurrent.lng]} />}
                {destination && <Marker position={[destination.lat, destination.lng]} />}

                {route.length > 0 && <Polyline positions={route} pathOptions={{ color: "#7b7cff", weight: 5 }} />}
              </MapContainer>
            </div>

            {!destination && (
              <div className="absolute left-4 bottom-4 right-4 rounded-xl border border-white/12 bg-black/50 p-3 text-xs text-white/70">
                Waiting for destination point…
              </div>
            )}
            {!activeCurrent && (
              <div className="absolute left-4 bottom-16 right-4 rounded-xl border border-white/12 bg-black/50 p-3 text-xs text-white/70">
                Waiting for current location…
              </div>
            )}
            {err && (
              <div className="absolute left-4 bottom-4 right-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
                {err}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
