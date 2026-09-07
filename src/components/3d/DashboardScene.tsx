"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { SceneLighting } from "./SceneLighting";
import { FloatingObject } from "./FloatingObject";
import { AmbientParticles } from "./AmbientParticles";

function FallbackOrbitalPlaceholder() {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden">
      {/* Outer ambient glow */}
      <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-cyan-500/15 via-sky-500/10 to-transparent blur-2xl animate-pulse" />

      {/* Outer rotating dashed ring */}
      <div className="absolute w-36 h-36 rounded-full border border-cyan-400/30 border-dashed animate-[spin_24s_linear_infinite]" />

      {/* Middle tilted elliptical ring */}
      <div className="absolute w-44 h-24 rounded-[100%] border border-cyan-400/30 rotate-[-25deg] animate-[pulse_4s_ease-in-out_infinite]" />

      {/* Inner glowing core */}
      <div className="relative w-16 h-16 rounded-2xl rotate-45 bg-gradient-to-br from-cyan-600 to-sky-600 shadow-[0_0_25px_rgba(34,211,238,0.35)] flex items-center justify-center border border-white/20">
        <div className="w-6 h-6 rounded-lg bg-white/20 backdrop-blur-sm" />
      </div>

      {/* Satellite dot */}
      <div className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-ping" />
    </div>
  );
}

export function DashboardScene({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    setMounted(true);
    // WebGL availability check
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setHasWebGL(false);
      }
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!mounted) {
    return (
      <div className={`relative w-full h-[220px] sm:h-[260px] ${className}`}>
        <FallbackOrbitalPlaceholder />
      </div>
    );
  }

  if (!hasWebGL) {
    return (
      <div className={`relative w-full h-[220px] sm:h-[260px] ${className}`}>
        <FallbackOrbitalPlaceholder />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-[220px] sm:h-[260px] cursor-grab active:cursor-grabbing ${className}`}
      aria-label="Interactive 3D Orbit Node"
    >
      <Suspense fallback={<FallbackOrbitalPlaceholder />}>
        <Canvas
          camera={{ position: [0, 0, 4.2], fov: 45 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
          dpr={[1, 1.5]}
        >
          <SceneLighting />
          <AmbientParticles count={80} />
          <FloatingObject />
        </Canvas>
      </Suspense>
    </div>
  );
}
