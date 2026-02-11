import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, Environment } from "@react-three/drei";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";

function Orb() {
  return (
    <Float speed={2} rotationIntensity={1.2} floatIntensity={1.2}>
      <mesh>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial metalness={0.7} roughness={0.15} />
      </mesh>
    </Float>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] bg-grid [background-size:22px_22px]" />

      <div className="mx-auto max-w-6xl px-4 pt-16 pb-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-2 gap-10 items-center"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1 text-xs text-white/70">
              <span className="h-2 w-2 rounded-full bg-white/60" />
              Industry-level SaaS • Orders • Services • Analytics
            </div>

            <h1 className="mt-5 text-4xl lg:text-5xl font-semibold leading-tight">
              Manage services & orders with <span className="text-white/70">real workflows</span>.
            </h1>

            <p className="mt-4 text-white/65 text-base leading-relaxed">
              A modern dashboard with role-based access (Admin/Manager/Staff/Client), live status updates,
              and clean UI transitions — built with React, Node, and MySQL.
            </p>

            <div className="mt-7 flex items-center gap-3">
              <Link to="/login"><Button>Open Dashboard</Button></Link>
              <a href="https://github.com" target="_blank" rel="noreferrer">
                <Button variant="ghost">View Architecture</Button>
              </a>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 text-xs text-white/60">
              <div className="rounded-2xl border border-white/12 bg-white/6 p-3">
                <div className="text-white/85 font-medium">Secure Auth</div>
                <div className="mt-1">JWT + refresh tokens</div>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/6 p-3">
                <div className="text-white/85 font-medium">Workflow</div>
                <div className="mt-1">created → completed</div>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/6 p-3">
                <div className="text-white/85 font-medium">Analytics</div>
                <div className="mt-1">Status & trends</div>
              </div>
            </div>
          </div>

          <div className="h-[420px] rounded-3xl border border-white/12 bg-white/6 shadow-glow overflow-hidden">
            <Canvas camera={{ position: [2.5, 1.5, 3.2], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 5, 5]} intensity={1.1} />
              <Orb />
              <Environment preset="city" />
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.2} />
            </Canvas>
          </div>
        </motion.div>

        <div className="mt-10 text-xs text-white/45">
          Tip: Login with <b>admin@demo.com</b> / <b>Admin@123</b> (seed data).
        </div>
      </div>
    </div>
  );
}
