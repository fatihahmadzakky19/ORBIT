"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AmbientParticlesProps {
  count?: number;
}

export function AmbientParticles({ count = 80 }: AmbientParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null!);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Wide cosmic spread for background star field
      const r = 3.0 + Math.random() * 6.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Size variation for depth
      sz[i] = 0.015 + Math.random() * 0.025;
    }

    return [pos, sz];
  }, [count]);

  const colors = useMemo(() => {
    const col = new Float32Array(count * 3);
    const tempColor = new THREE.Color();

    /* Astrophysical star palette: mostly warm white/dim, some gold accents,
       sparse blue-white for hot stars. NO pure cyan. */
    const colorWarmWhite = new THREE.Color("#e8e2d8");
    const colorCoolWhite = new THREE.Color("#d0d4dc");
    const colorPaleGold = new THREE.Color("#f0dca0");
    const colorBlueWhite = new THREE.Color("#c8d8f0");
    const colorDeepWarm = new THREE.Color("#d8b880");

    for (let i = 0; i < count; i++) {
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
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.010;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.06) * 0.025;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        vertexColors
        transparent
        opacity={0.60}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
