"use client";

import React, { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface AmbientParticlesProps {
  count?: number;
}

export function AmbientParticles({ count = 120 }: AmbientParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const { size } = useThree();
  const isMobile = size.width < 640;
  const effectiveCount = isMobile ? Math.floor(count * 0.5) : count;

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(effectiveCount * 3);
    const sz = new Float32Array(effectiveCount);

    for (let i = 0; i < effectiveCount; i++) {
      // Wide cosmic spread for background star field
      const r = 3.0 + Math.random() * 7.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Size variation for depth — some large/close, some tiny/far
      const depthRng = Math.random();
      if (depthRng < 0.15) {
        // Close bright stars
        sz[i] = 0.035 + Math.random() * 0.025;
      } else if (depthRng < 0.5) {
        // Medium distance
        sz[i] = 0.018 + Math.random() * 0.015;
      } else {
        // Far away, tiny
        sz[i] = 0.008 + Math.random() * 0.010;
      }
    }

    return [pos, sz];
  }, [effectiveCount]);

  const colors = useMemo(() => {
    const col = new Float32Array(effectiveCount * 3);
    const tempColor = new THREE.Color();

    /* Astrophysical star palette: mostly warm white/dim, some gold accents,
       sparse blue-white for hot stars. NO pure cyan. */
    const colorWarmWhite = new THREE.Color("#e8e2d8");
    const colorCoolWhite = new THREE.Color("#d0d4dc");
    const colorPaleGold = new THREE.Color("#f0dca0");
    const colorBlueWhite = new THREE.Color("#c8d8f0");
    const colorDeepWarm = new THREE.Color("#d8b880");

    for (let i = 0; i < effectiveCount; i++) {
      const rng = Math.random();
      if (rng < 0.35) {
        /* Dim warm white — most stars */
        tempColor.copy(colorWarmWhite).multiplyScalar(0.4 + Math.random() * 0.5);
      } else if (rng < 0.55) {
        /* Cool white */
        tempColor.copy(colorCoolWhite).multiplyScalar(0.5 + Math.random() * 0.5);
      } else if (rng < 0.72) {
        /* Pale gold */
        tempColor.copy(colorPaleGold).multiplyScalar(0.4 + Math.random() * 0.4);
      } else if (rng < 0.88) {
        /* Blue-white hot stars (sparse) */
        tempColor.copy(colorBlueWhite).multiplyScalar(0.5 + Math.random() * 0.5);
      } else {
        /* Deep warm accent */
        tempColor.copy(colorDeepWarm).multiplyScalar(0.3 + Math.random() * 0.3);
      }

      col[i * 3] = tempColor.r;
      col[i * 3 + 1] = tempColor.g;
      col[i * 3 + 2] = tempColor.b;
    }

    return col;
  }, [effectiveCount]);

  // Twinkling phase offsets
  const twinkleData = useMemo(() => {
    return Array.from({ length: effectiveCount }, () => ({
      speed: 0.5 + Math.random() * 2.0,
      phase: Math.random() * Math.PI * 2,
      amplitude: 0.15 + Math.random() * 0.35,
    }));
  }, [effectiveCount]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.008;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.02;

    // Twinkling — modulate per-vertex color brightness
    const colArr = pointsRef.current.geometry.attributes.color.array as Float32Array;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < effectiveCount; i++) {
      const td = twinkleData[i];
      const twinkle = 0.6 + td.amplitude * (0.5 + 0.5 * Math.sin(t * td.speed + td.phase));
      // Modulate by scaling the base color
      const baseR = colors[i * 3];
      const baseG = colors[i * 3 + 1];
      const baseB = colors[i * 3 + 2];
      colArr[i * 3] = baseR * twinkle;
      colArr[i * 3 + 1] = baseG * twinkle;
      colArr[i * 3 + 2] = baseB * twinkle;
    }
    pointsRef.current.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[new Float32Array(colors), 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        vertexColors
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
