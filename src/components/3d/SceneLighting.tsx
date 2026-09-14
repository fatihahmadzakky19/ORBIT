"use client";

import React from "react";

export function SceneLighting() {
  return (
    <>
      {/* Extremely low ambient — black hole scene must be dark */}
      <ambientLight intensity={0.06} />

      {/* Warm accent near disk plane — simulates accretion radiance */}
      <pointLight position={[1.5, 0.3, 1.5]} intensity={1.4} distance={6} color="#f5a623" />

      {/* White-hot glow from inner disk */}
      <pointLight position={[0.8, 0.5, 2.0]} intensity={1.2} distance={8} color="#fff4d6" />

      {/* Deep blue rim from behind — edge separation */}
      <pointLight position={[-1.5, -0.5, -2.5]} intensity={1.0} distance={10} color="#1a3a6a" />

      {/* Warm orange fill from below — accretion disk reflection */}
      <pointLight position={[0, -2.5, 0.5]} intensity={0.5} distance={5} color="#d98a4a" />
    </>
  );
}
