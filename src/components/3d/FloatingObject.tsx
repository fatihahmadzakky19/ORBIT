"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function FloatingObject() {
  const groupRef = useRef<THREE.Group>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const innerWireRef = useRef<THREE.Mesh>(null!);
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Hover floating motion on the whole group
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.08;

      // Gentle interactive cursor tilt
      const targetRotX = (state.pointer.y * -0.3) + 0.1;
      const targetRotY = state.pointer.x * 0.4;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotX,
        0.05
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY,
        0.05
      );
    }

    // Core crystal rotation
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.25;
      coreRef.current.rotation.y += delta * 0.35;
    }

    if (innerWireRef.current) {
      innerWireRef.current.rotation.x -= delta * 0.2;
      innerWireRef.current.rotation.y -= delta * 0.3;
    }

    // Concentric orbital rings rotation
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.3;
      ring1Ref.current.rotation.x += delta * 0.15;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.25;
      ring2Ref.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Central Gem / Crystal (Icosahedron) */}
      <mesh ref={coreRef} scale={0.75}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#083344"
          emissive="#0e7490"
          emissiveIntensity={0.6}
          roughness={0.15}
          metalness={0.9}
          wireframe={false}
          flatShading
        />
      </mesh>

      {/* Subtle Glowing Wireframe Overlay */}
      <mesh ref={innerWireRef} scale={0.77}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          color="#67e8f9"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Outer Orbital Ring 1 */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.25, 0.015, 16, 64]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Outer Orbital Ring 2 (Offset angle) */}
      <mesh ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[1.5, 0.012, 16, 64]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#0891b2"
          emissiveIntensity={0.7}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Orbiting Satellite Node */}
      <mesh position={[1.4, 0.3, 0]} scale={0.06}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color="#34d399"
          emissive="#10b981"
          emissiveIntensity={1.2}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}
