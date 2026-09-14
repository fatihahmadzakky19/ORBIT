"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ══════════════════════════════════════════════════════════════════
   SOLAR SYSTEM — Modeled after reference (media_1789365971215.png)
   - Radiant Sun with dynamic corona, solar flare, and point light
   - Concentric glowing elliptical orbital lines
   - 8 planets in orbital positions (Mercury, Venus, Earth+Moon, Mars,
     Jupiter with bands, Saturn with tilted rings, Uranus, Neptune)
   - Placed at z = -18 along the journey trajectory
   ══════════════════════════════════════════════════════════════════ */

interface PlanetDef {
  name: string;
  radius: number;
  orbitRadiusX: number;
  orbitRadiusZ: number;
  baseAngle: number;
  speed: number;
  color: string;
  roughness: number;
  metalness: number;
  hasRings?: boolean;
  ringInner?: number;
  ringOuter?: number;
  ringColor?: string;
  hasBands?: boolean;
}

const PLANET_DATA: PlanetDef[] = [
  {
    name: "Mercury",
    radius: 0.12,
    orbitRadiusX: 2.2,
    orbitRadiusZ: 1.8,
    baseAngle: 0.8,
    speed: 0.15,
    color: "#a89f91",
    roughness: 0.8,
    metalness: 0.2,
  },
  {
    name: "Venus",
    radius: 0.22,
    orbitRadiusX: 3.2,
    orbitRadiusZ: 2.6,
    baseAngle: 2.1,
    speed: 0.11,
    color: "#e8c582",
    roughness: 0.6,
    metalness: 0.1,
  },
  {
    name: "Earth",
    radius: 0.26,
    orbitRadiusX: 4.5,
    orbitRadiusZ: 3.6,
    baseAngle: 4.8,
    speed: 0.08,
    color: "#2b6cb0",
    roughness: 0.45,
    metalness: 0.15,
  },
  {
    name: "Mars",
    radius: 0.17,
    orbitRadiusX: 5.8,
    orbitRadiusZ: 4.6,
    baseAngle: 1.2,
    speed: 0.06,
    color: "#c05621",
    roughness: 0.75,
    metalness: 0.1,
  },
  {
    name: "Jupiter",
    radius: 0.62,
    orbitRadiusX: 8.0,
    orbitRadiusZ: 6.4,
    baseAngle: 3.5,
    speed: 0.035,
    color: "#c4a480",
    roughness: 0.5,
    metalness: 0.05,
    hasBands: true,
  },
  {
    name: "Saturn",
    radius: 0.52,
    orbitRadiusX: 10.5,
    orbitRadiusZ: 8.4,
    baseAngle: 5.9,
    speed: 0.025,
    color: "#dfcfab",
    roughness: 0.55,
    metalness: 0.1,
    hasRings: true,
    ringInner: 0.7,
    ringOuter: 1.35,
    ringColor: "#c9b68c",
  },
  {
    name: "Uranus",
    radius: 0.35,
    orbitRadiusX: 13.0,
    orbitRadiusZ: 10.4,
    baseAngle: 2.7,
    speed: 0.018,
    color: "#81e6d9",
    roughness: 0.5,
    metalness: 0.1,
  },
  {
    name: "Neptune",
    radius: 0.33,
    orbitRadiusX: 15.2,
    orbitRadiusZ: 12.2,
    baseAngle: 0.4,
    speed: 0.012,
    color: "#3182ce",
    roughness: 0.5,
    metalness: 0.1,
  },
];

/* Radiant Sun with Coronal Flare & Shimmer */
function Sun() {
  const sunMeshRef = useRef<THREE.Mesh>(null!);
  const coronaRef = useRef<THREE.Sprite>(null!);
  const sunLightRef = useRef<THREE.PointLight>(null!);

  const coronaTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const center = size / 2;

    const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
    grad.addColorStop(0.0, "rgba(255, 255, 240, 1.0)");
    grad.addColorStop(0.12, "rgba(255, 220, 110, 0.95)");
    grad.addColorStop(0.3, "rgba(255, 160, 40, 0.6)");
    grad.addColorStop(0.55, "rgba(230, 90, 20, 0.2)");
    grad.addColorStop(0.8, "rgba(180, 40, 10, 0.05)");
    grad.addColorStop(1.0, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (sunMeshRef.current) {
      sunMeshRef.current.rotation.y = t * 0.08;
    }
    if (coronaRef.current) {
      const pulse = 1.0 + Math.sin(t * 1.5) * 0.04 + Math.sin(t * 3.7) * 0.02;
      coronaRef.current.scale.set(6.5 * pulse, 6.5 * pulse, 1);
    }
    if (sunLightRef.current) {
      sunLightRef.current.intensity = 4.5;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Sun Core Sphere */}
      <mesh ref={sunMeshRef}>
        <sphereGeometry args={[1.0, 48, 48]} />
        <meshBasicMaterial color="#fffbe6" />
      </mesh>

      {/* Sun Corona Billboard Sprite */}
      <sprite ref={coronaRef} scale={[6.5, 6.5, 1]}>
        <spriteMaterial
          map={coronaTexture}
          transparent
          opacity={0.92}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      {/* Primary Radiant Point Light */}
      <pointLight
        ref={sunLightRef}
        position={[0, 0, 0]}
        intensity={4.5}
        distance={40}
        color="#fff5d6"
      />
    </group>
  );
}

/* Concentric Glowing Elliptical Orbital Paths */
function OrbitalTracks() {
  const lines = useMemo(() => {
    return PLANET_DATA.map((p) => {
      const segments = 128;
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(
          new THREE.Vector3(
            Math.cos(theta) * p.orbitRadiusX,
            0,
            Math.sin(theta) * p.orbitRadiusZ
          )
        );
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return { name: p.name, geometry };
    });
  }, []);

  return (
    <group>
      {lines.map((line) => (
        <lineLoop key={line.name} geometry={line.geometry}>
          <lineBasicMaterial
            color="#a7c4e6"
            transparent
            opacity={0.14}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineLoop>
      ))}
    </group>
  );
}

/* Individual 3D Planet Component */
function PlanetItem({ planet, time }: { planet: PlanetDef; time: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const currentAngle = planet.baseAngle + time * planet.speed;
  const x = Math.cos(currentAngle) * planet.orbitRadiusX;
  const z = Math.sin(currentAngle) * planet.orbitRadiusZ;

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.015;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Planet Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[planet.radius, 32, 32]} />
        <meshStandardMaterial
          color={planet.color}
          roughness={planet.roughness}
          metalness={planet.metalness}
        />
      </mesh>

      {/* Jupiter horizontal cloud bands */}
      {planet.hasBands && (
        <group>
          {[-0.25, -0.08, 0.1, 0.28].map((yOffset, idx) => (
            <mesh key={`band-${idx}`} position={[0, yOffset, 0]} rotation={[0, 0, 0]}>
              <cylinderGeometry
                args={[
                  planet.radius * 1.005,
                  planet.radius * 1.005,
                  planet.radius * 0.18,
                  32,
                  1,
                  true
                ]}
              />
              <meshBasicMaterial
                color={idx % 2 === 0 ? "#9e6b45" : "#e0c9a6"}
                transparent
                opacity={0.45}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Saturn's Majestic Rings */}
      {planet.hasRings && (
        <mesh rotation={[Math.PI * 0.35, 0.15, 0]}>
          <ringGeometry args={[planet.ringInner!, planet.ringOuter!, 64]} />
          <meshStandardMaterial
            color={planet.ringColor}
            side={THREE.DoubleSide}
            transparent
            opacity={0.8}
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>
      )}
    </group>
  );
}

export interface SolarSystemProps {
  visible?: boolean;
  position?: [number, number, number];
  scale?: number;
}

export function SolarSystem({
  visible = false,
  position = [0, 0, -18],
  scale = 0.65,
}: SolarSystemProps) {
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!visible) return;
    timeRef.current += delta;
  });

  if (!visible) return null;

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Central Radiant Sun */}
      <Sun />

      {/* Orbital Tracks */}
      <OrbitalTracks />

      {/* 8 Planets in Real-Time Motion */}
      {PLANET_DATA.map((p) => (
        <PlanetItem key={p.name} planet={p} time={timeRef.current} />
      ))}

      {/* Distant Star Cluster Glow for Deep Atmosphere */}
      <pointLight position={[8, 6, 5]} intensity={0.6} color="#80d8ff" distance={30} />
      <pointLight position={[-8, -4, -5]} intensity={0.4} color="#ffab40" distance={30} />
    </group>
  );
}
