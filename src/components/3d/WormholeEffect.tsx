"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ══════════════════════════════════════════════════════════════════
   WORMHOLE DIMENSIONAL WARP EFFECT
   - Cylindrical tunnel aligned along the Z axis (rotation [Math.PI / 2, 0, 0])
   - Blue-white relativistic hyper-speed streaks + warm orange plasma remnants
   - Inward relativistic curvature
   - Hyper-drive streak particles rushing toward camera
   ══════════════════════════════════════════════════════════════════ */

const wormholeVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPos;
  void main() {
    vUv = uv;
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const wormholeFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;
  varying vec3 vPos;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  void main() {
    vec2 uv = vUv;

    /* High-speed longitudinal flow along the tunnel length (uv.y) */
    float zFlow = uv.y * 12.0 - uTime * 6.5;
    float angle = uv.x * 6.28318;

    /* Radial streaks */
    float streaks = 0.0;
    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      float a = angle * (3.0 + fi * 2.0) + uTime * (2.0 + fi * 0.8);
      float streak = smoothstep(0.12, 0.0, abs(sin(a + zFlow * 0.4)));
      streaks += streak * (0.35 + fi * 0.15);
    }

    /* Plasma turbulence */
    float turb = noise(vec2(angle * 4.0 + uTime * 1.5, zFlow * 0.8));
    float turb2 = noise(vec2(angle * 8.0 - uTime * 2.2, zFlow * 1.6));

    /* Dimensional colors: Blue-white hyper-speed core with warm gold/orange remnants */
    vec3 cyanWhite = vec3(0.85, 0.96, 1.0);
    vec3 relativisticBlue = vec3(0.12, 0.65, 1.0);
    vec3 warmAmber = vec3(1.0, 0.68, 0.25);
    vec3 darkVoid = vec3(0.01, 0.02, 0.05);

    vec3 color = mix(darkVoid, relativisticBlue, clamp(streaks * 0.6 + turb * 0.4, 0.0, 1.0));
    color = mix(color, cyanWhite, smoothstep(0.65, 1.0, streaks));
    color = mix(color, warmAmber, clamp(turb2 * 0.45 * (1.0 - streaks * 0.5), 0.0, 1.0));

    /* Intensity modulation */
    float alpha = clamp((streaks * 0.7 + turb * 0.3) * uIntensity, 0.0, 0.95);

    /* Fade tunnel ends smoothly */
    float edgeFade = smoothstep(0.0, 0.15, uv.y) * smoothstep(1.0, 0.85, uv.y);
    alpha *= edgeFade;

    gl_FragColor = vec4(color * 1.4, alpha);
  }
`;

function WarpSpeedLines({ count = 120 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const lineData = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        angle: Math.random() * Math.PI * 2,
        radius: 0.8 + Math.random() * 2.4,
        speed: 6.0 + Math.random() * 8.0,
        offset: Math.random(),
        baseZ: -Math.random() * 16.0,
      })),
    [count]
  );

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const tmp = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const rng = Math.random();
      if (rng < 0.45) tmp.set("#e0f7ff");
      else if (rng < 0.75) tmp.set("#00d9ff");
      else if (rng < 0.9) tmp.set("#ffb74d");
      else tmp.set("#ffffff");

      col[i * 3] = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const posArr = pointsRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < count; i++) {
      const d = lineData[i];
      // Particles stream toward +Z (toward the camera view)
      const progress = ((t * d.speed * 0.35 + d.offset) % 1.0);
      const z = 2.0 - progress * 16.0;
      posArr[i * 3] = Math.cos(d.angle) * d.radius;
      posArr[i * 3 + 1] = Math.sin(d.angle) * d.radius;
      posArr[i * 3 + 2] = z;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export interface WormholeEffectProps {
  visible?: boolean;
  intensity?: number;
}

export function WormholeEffect({
  visible = false,
  intensity = 1.0,
}: WormholeEffectProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity },
    }),
    [intensity]
  );

  useFrame((state) => {
    if (!matRef.current || !visible) return;
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    matRef.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(
      matRef.current.uniforms.uIntensity.value,
      intensity,
      0.08
    );
  });

  if (!visible) return null;

  return (
    <group position={[0, 0, -6]}>
      {/* Tunnel cylinder oriented along Z axis: rotation [Math.PI / 2, 0, 0] */}
      <mesh ref={meshRef} rotation={[Math.PI * 0.5, 0, 0]}>
        <cylinderGeometry args={[3.2, 3.2, 18, 32, 1, true]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={wormholeVertexShader}
          fragmentShader={wormholeFragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Warp speed line particles */}
      <WarpSpeedLines count={120} />

      {/* Blue-white dimensional exit beacon */}
      <pointLight position={[0, 0, -8]} intensity={2.5} color="#00d9ff" distance={15} />
    </group>
  );
}
