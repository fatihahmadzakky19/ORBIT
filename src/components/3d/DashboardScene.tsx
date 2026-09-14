"use client";

import React, { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { SceneLighting } from "./SceneLighting";
import { AmbientParticles } from "./AmbientParticles";
import { JourneyManager, JourneyManagerHandle, JourneyPhase } from "./JourneyManager";

function FallbackCosmicPlaceholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center select-none overflow-hidden">
      {/* Volumetric glow — warm tint */}
      <div className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-amber-500/6 via-orange-400/3 to-transparent blur-3xl animate-pulse" style={{ right: '20%' }} />

      {/* Accretion disk rings — warm colors */}
      <div className="absolute w-48 h-20 rounded-[100%] border border-amber-400/12 rotate-[-18deg] animate-[pulse_3s_ease-in-out_infinite]" style={{ right: '18%' }} />
      <div className="absolute w-56 h-24 rounded-[100%] border border-orange-300/8 rotate-[-18deg] animate-[pulse_4s_ease-in-out_infinite]" style={{ right: '16%' }} />

      {/* Event horizon */}
      <div
        className="relative w-16 h-16 rounded-full bg-black shadow-[0_0_40px_rgba(255,210,122,0.12),0_0_80px_rgba(217,138,74,0.06)] border border-white/5"
        style={{ marginLeft: '30%' }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-amber-300/5" />
      </div>

      {/* Star dots */}
      <div className="absolute top-[15%] right-[10%] w-1 h-1 rounded-full bg-white/30 animate-pulse" />
      <div className="absolute top-[40%] left-[15%] w-0.5 h-0.5 rounded-full bg-amber-200/40 animate-pulse" style={{ animationDelay: "0.5s" }} />
      <div className="absolute bottom-[25%] right-[35%] w-0.5 h-0.5 rounded-full bg-white/25 animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-[65%] left-[30%] w-0.5 h-0.5 rounded-full bg-amber-200/20 animate-pulse" style={{ animationDelay: "1.5s" }} />
    </div>
  );
}

export interface DashboardSceneProps {
  className?: string;
  onPhaseChange?: (phase: JourneyPhase) => void;
  onHoverChange?: (hovered: boolean) => void;
  journeyRef?: React.RefObject<JourneyManagerHandle | null>;
}

export function DashboardScene({
  className = "",
  onPhaseChange,
  onHoverChange,
  journeyRef,
}: DashboardSceneProps) {
  const [mounted, setMounted] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<JourneyPhase>("IDLE");
  const internalJourneyRef = useRef<JourneyManagerHandle>(null);
  const effectiveRef = journeyRef || internalJourneyRef;

  useEffect(() => {
    setMounted(true);
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  const handlePhaseChange = useCallback(
    (phase: JourneyPhase) => {
      setCurrentPhase(phase);
      onPhaseChange?.(phase);
    },
    [onPhaseChange]
  );

  if (!mounted || !hasWebGL) {
    return (
      <div className={`absolute inset-0 ${className}`}>
        <FallbackCosmicPlaceholder />
      </div>
    );
  }

  // Calibrated, smooth bloom — never overexposed to preserve rocket silhouette
  const bloomIntensity =
    currentPhase === "ENTER_EVENT_HORIZON"
      ? 1.4
      : currentPhase === "WORMHOLE"
      ? 1.3
      : currentPhase === "EARTH_ORBIT"
      ? 0.75
      : 1.0;

  const showChromaticAberration =
    currentPhase === "ENTER_EVENT_HORIZON" || currentPhase === "WORMHOLE";

  return (
    <div
      className={`absolute inset-0 ${className}`}
      aria-label="Interactive 3D Black Hole"
    >
      <Suspense fallback={<FallbackCosmicPlaceholder />}>
        <Canvas
          camera={{ position: [0, 0.6, 4.0], fov: 48 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
          dpr={[1, 1.5]}
          style={{ position: "absolute", inset: 0 }}
        >
          <SceneLighting />
          <AmbientParticles count={120} />

          <JourneyManager
            ref={effectiveRef}
            onPhaseChange={handlePhaseChange}
            onHoverChange={onHoverChange}
          />

          {/* Adaptive post-processing */}
          <EffectComposer>
            <Bloom
              intensity={bloomIntensity}
              luminanceThreshold={0.1}
              luminanceSmoothing={0.8}
              mipmapBlur
            />
            {showChromaticAberration && (
              <ChromaticAberration
                offset={[0.002, 0.002]}
                radialModulation
                modulationOffset={0.5}
              />
            )}
          </EffectComposer>
        </Canvas>
      </Suspense>
    </div>
  );
}
