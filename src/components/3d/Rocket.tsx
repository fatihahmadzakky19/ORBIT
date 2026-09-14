"use client";

import React, {
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ══════════════════════════════════════════════════════════════════
   SPACE SHUTTLE STACK — Modeled after reference (media_1789365971113.jpg)
   - Orange External Tank (ET) with ogive nose
   - Twin White Solid Rocket Boosters (SRBs) with joint bands & nozzles
   - White Orbiter Shuttle: cockpit windshield, delta wings with black thermal edges,
     rudder vertical fin, and 3 SSME main engines
   - Stable, flicker-free engine flame plumes & deterministic particle stream
   - High-contrast rim lighting for razor-sharp silhouette outside accretion disk
   ══════════════════════════════════════════════════════════════════ */

export interface RocketHandle {
  group: THREE.Group | null;
  setEngineActive: (active: boolean) => void;
  setExhaustIntensity: (intensity: number) => void;
}

export interface RocketProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  engineActive?: boolean;
  visible?: boolean;
}

/* Deterministic, smooth particle stream without rapid flicker */
function ExhaustParticleStream({
  active = true,
  intensity = 1.0,
}: {
  active?: boolean;
  intensity?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 36;

  const particleData = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        offset: i / count,
        speed: 1.2 + (i % 5) * 0.2,
        spreadX: ((i % 7) - 3) * 0.02,
        spreadY: (((i * 3) % 7) - 3) * 0.02,
      })),
    []
  );

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const tmp = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const frac = i / count;
      if (frac < 0.25) tmp.set("#ffffff");
      else if (frac < 0.6) tmp.set("#ffe082");
      else if (frac < 0.85) tmp.set("#ff9800");
      else tmp.set("#e65100");

      col[i * 3] = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current || !active) return;
    const t = state.clock.elapsedTime;
    const posArr = pointsRef.current.geometry.attributes.position
      .array as Float32Array;

    const streamLength = 0.55 * intensity;
    for (let i = 0; i < count; i++) {
      const d = particleData[i];
      const p = (t * d.speed * 0.8 + d.offset) % 1.0;
      posArr[i * 3] = d.spreadX * (0.4 + p * 1.6);
      posArr[i * 3 + 1] = -p * streamLength;
      posArr[i * 3 + 2] = d.spreadY * (0.4 + p * 1.6);
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef} position={[0, -0.92, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
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

/* Stable Engine Flame Cone — smooth breathing pulsation, no erratic jitter */
function EnginePlume({
  position,
  scale = 1.0,
  active = true,
}: {
  position: [number, number, number];
  scale?: number;
  active?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!meshRef.current || !active) return;
    const t = state.clock.elapsedTime;
    // Calibrated smooth breath, no high-frequency sine flicker
    const pulse = 1.0 + Math.sin(t * 5.0) * 0.05;
    meshRef.current.scale.set(scale * pulse, scale * 1.5 * pulse, scale * pulse);
  });

  if (!active) return null;

  return (
    <group position={position}>
      {/* Outer flame cone */}
      <mesh ref={meshRef} position={[0, -0.2 * scale, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.065 * scale, 0.42 * scale, 14, 1, true]} />
        <meshBasicMaterial
          color="#ff9800"
          transparent
          opacity={0.8}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Inner white-hot core */}
      <mesh position={[0, -0.11 * scale, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.032 * scale, 0.22 * scale, 12, 1, true]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.92}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export const Rocket = forwardRef<RocketHandle, RocketProps>(function Rocket(
  {
    position = [0.32, -0.68, 1.25],
    rotation = [-0.12, 0.42, 0.38],
    scale = 0.22,
    engineActive = true,
    visible = true,
  },
  ref
) {
  const groupRef = useRef<THREE.Group>(null!);
  const engineLightRef = useRef<THREE.PointLight>(null!);
  const engineStateRef = useRef(engineActive);
  const exhaustIntensityRef = useRef(1.0);

  useImperativeHandle(
    ref,
    () => ({
      group: groupRef.current,
      setEngineActive: (act: boolean) => {
        engineStateRef.current = act;
      },
      setExhaustIntensity: (val: number) => {
        exhaustIntensityRef.current = val;
      },
    }),
    []
  );

  useFrame((state) => {
    if (!groupRef.current || !visible) return;

    // Smooth engine light intensity lerping (no rapid strobe)
    if (engineLightRef.current) {
      if (engineStateRef.current) {
        const t = state.clock.elapsedTime;
        const targetIntensity = (1.2 + Math.sin(t * 3.5) * 0.15) * exhaustIntensityRef.current;
        engineLightRef.current.intensity = THREE.MathUtils.lerp(
          engineLightRef.current.intensity,
          targetIntensity,
          0.08
        );
      } else {
        engineLightRef.current.intensity = THREE.MathUtils.lerp(
          engineLightRef.current.intensity,
          0,
          0.1
        );
      }
    }
  });

  if (!visible) return null;

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. CENTRAL EXTERNAL TANK (ET) — Burnt Orange / Rust
          ───────────────────────────────────────────────────────────── */}
      <group position={[0, 0, 0]}>
        {/* Main tank cylinder */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 1.4, 24]} />
          <meshStandardMaterial
            color="#b85623"
            roughness={0.48}
            metalness={0.16}
          />
        </mesh>

        {/* Aerodynamic ogive nose cone */}
        <mesh position={[0, 0.88, 0]}>
          <coneGeometry args={[0.26, 0.42, 24]} />
          <meshStandardMaterial
            color="#a34718"
            roughness={0.46}
            metalness={0.18}
          />
        </mesh>

        {/* Gold/Cream intertank ribbed structural band */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.266, 0.266, 0.16, 24]} />
          <meshStandardMaterial
            color="#c5a56a"
            roughness={0.38}
            metalness={0.35}
          />
        </mesh>

        {/* Bottom dome */}
        <mesh position={[0, -0.72, 0]}>
          <sphereGeometry args={[0.258, 20, 10, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5]} />
          <meshStandardMaterial
            color="#9e4316"
            roughness={0.55}
            metalness={0.18}
          />
        </mesh>
      </group>

      {/* ─────────────────────────────────────────────────────────────
          2. TWIN SOLID ROCKET BOOSTERS (SRBs) — Left & Right
          ───────────────────────────────────────────────────────────── */}
      {[-1, 1].map((side) => (
        <group key={`srb-${side}`} position={[side * 0.38, -0.05, 0]}>
          {/* Main booster white cylinder */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.115, 0.115, 1.55, 18]} />
            <meshStandardMaterial
              color="#f2f2ef"
              roughness={0.32}
              metalness={0.12}
            />
          </mesh>

          {/* Segmented black field joint rings */}
          {[-0.45, -0.15, 0.2, 0.5].map((yRing, idx) => (
            <mesh key={`ring-${idx}`} position={[0, yRing, 0]}>
              <cylinderGeometry args={[0.118, 0.118, 0.016, 18]} />
              <meshBasicMaterial color="#1a1c1e" />
            </mesh>
          ))}

          {/* Pointed white nose cap */}
          <mesh position={[0, 0.88, 0]}>
            <coneGeometry args={[0.115, 0.26, 18]} />
            <meshStandardMaterial
              color="#f7f7f5"
              roughness={0.32}
              metalness={0.12}
            />
          </mesh>

          {/* Flared dark metallic nozzle skirt */}
          <mesh position={[0, -0.85, 0]}>
            <cylinderGeometry args={[0.09, 0.13, 0.16, 18]} />
            <meshStandardMaterial
              color="#232629"
              roughness={0.65}
              metalness={0.8}
            />
          </mesh>

          {/* SRB Engine Plume */}
          <EnginePlume
            position={[0, -0.95, 0]}
            scale={0.82}
            active={engineActive}
          />
        </group>
      ))}

      {/* ─────────────────────────────────────────────────────────────
          3. SPACE SHUTTLE ORBITER — Mounted onto front of ET (+Z)
          ───────────────────────────────────────────────────────────── */}
      <group position={[0, -0.08, 0.28]}>
        {/* Orbiter Fuselage Body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.19, 1.05, 20]} />
          <meshStandardMaterial
            color="#f8f7f4"
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>

        {/* Cockpit Nose Section */}
        <mesh position={[0, 0.62, 0]}>
          <coneGeometry args={[0.16, 0.28, 20]} />
          <meshStandardMaterial
            color="#f8f7f4"
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>

        {/* Black Thermal Nose Tip Cap */}
        <mesh position={[0, 0.74, 0.02]}>
          <sphereGeometry args={[0.07, 14, 14]} />
          <meshStandardMaterial
            color="#111315"
            roughness={0.85}
            metalness={0.05}
          />
        </mesh>

        {/* Cockpit Windshield Windows (Dark tinted glass with cyan sheen) */}
        <mesh position={[0, 0.58, 0.12]} rotation={[-0.35, 0, 0]}>
          <boxGeometry args={[0.14, 0.05, 0.06]} />
          <meshStandardMaterial
            color="#08141e"
            roughness={0.15}
            metalness={0.85}
            emissive="#00d9ff"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Delta Wings (Left & Right) */}
        {[-1, 1].map((wingSide) => (
          <group key={`wing-${wingSide}`}>
            {/* Wing body */}
            <mesh
              position={[wingSide * 0.32, -0.16, -0.02]}
              rotation={[0, 0, wingSide * -0.08]}
            >
              <boxGeometry args={[0.38, 0.58, 0.024]} />
              <meshStandardMaterial
                color="#f0eee9"
                roughness={0.35}
                metalness={0.12}
              />
            </mesh>

            {/* Black thermal tile leading edge */}
            <mesh
              position={[wingSide * 0.44, -0.08, -0.02]}
              rotation={[0, 0, wingSide * 0.42]}
            >
              <boxGeometry args={[0.04, 0.48, 0.028]} />
              <meshStandardMaterial
                color="#14171a"
                roughness={0.85}
                metalness={0.05}
              />
            </mesh>

            {/* Wingtip cyan accent */}
            <mesh position={[wingSide * 0.51, -0.28, -0.02]}>
              <boxGeometry args={[0.02, 0.22, 0.03]} />
              <meshBasicMaterial color="#00d9ff" />
            </mesh>
          </group>
        ))}

        {/* Vertical Tail Stabilizer Fin */}
        <mesh position={[0, 0.12, -0.18]}>
          <boxGeometry args={[0.024, 0.42, 0.28]} />
          <meshStandardMaterial
            color="#f2efe9"
            roughness={0.38}
            metalness={0.1}
          />
        </mesh>

        {/* Tail leading edge */}
        <mesh position={[0, 0.22, -0.14]} rotation={[0.45, 0, 0]}>
          <boxGeometry args={[0.028, 0.36, 0.04]} />
          <meshStandardMaterial color="#14171a" roughness={0.8} />
        </mesh>

        {/* Black heat-shield underside tiles */}
        <mesh position={[0, -0.04, -0.08]}>
          <boxGeometry args={[0.36, 0.95, 0.02]} />
          <meshStandardMaterial
            color="#121416"
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>

        {/* 3 Main SSME Engine Nozzles */}
        {[
          [0, -0.58, 0.06],
          [-0.09, -0.66, -0.04],
          [0.09, -0.66, -0.04],
        ].map((enginePos, idx) => (
          <group key={`ssme-${idx}`} position={enginePos as [number, number, number]}>
            <mesh>
              <cylinderGeometry args={[0.045, 0.075, 0.14, 14]} />
              <meshStandardMaterial
                color="#1e2124"
                roughness={0.6}
                metalness={0.85}
              />
            </mesh>
            <EnginePlume
              position={[0, -0.1, 0]}
              scale={0.72}
              active={engineActive}
            />
          </group>
        ))}
      </group>

      {/* ─────────────────────────────────────────────────────────────
          4. EXHAUST PARTICLES & DEDICATED HIGH-CONTRAST LIGHTING
          ───────────────────────────────────────────────────────────── */}
      <ExhaustParticleStream active={engineActive} />

      {/* Engine thrust glow light */}
      {engineActive && (
        <pointLight
          ref={engineLightRef}
          position={[0, -1.05, 0.1]}
          intensity={1.2}
          distance={3.0}
          color="#ff9800"
        />
      )}

      {/* Cool blue-white outer rim light — ensures sharp silhouette against dark space */}
      <pointLight
        position={[-0.8, 0.6, 0.5]}
        intensity={0.65}
        distance={2.5}
        color="#90caf9"
      />

      {/* Warm golden accretion reflection on right-facing side */}
      <pointLight
        position={[0.7, 0.3, 0.4]}
        intensity={0.35}
        distance={2.2}
        color="#ffc56a"
      />
    </group>
  );
});
