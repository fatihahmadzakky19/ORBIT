"use client";

import React from "react";

export function SceneLighting() {
  return (
    <>
      {/* Near-zero ambient — event horizon must stay pure black */}
      <ambientLight intensity={0.02} />

      {/* Warm accent near disk plane — simulates accretion radiance */}
      <pointLight position={[1.5, 0.3, 1.5]} intensity={1.6} distance={6} color="#f29a45" />

      {/* White-hot glow from inner disk */}
      <pointLight position={[0.8, 0.5, 2.0]} intensity={1.3} distance={8} color="#fff5d6" />

      {/* Deep warm-blue rim from behind — edge separation, NOT cyan */}
      <pointLight position={[-1.5, -0.5, -2.5]} intensity={0.8} distance={10} color="#1a3050" />

      {/* Warm orange fill from below — accretion disk reflection */}
      <pointLight position={[0, -2.5, 0.5]} intensity={0.6} distance={5} color="#d56a32" />

      {/* Subtle gold accent from side — asymmetric lighting */}
      <pointLight position={[2.5, 0.0, -0.5]} intensity={0.4} distance={6} color="#ffc56b" />
    </>
  );
}
