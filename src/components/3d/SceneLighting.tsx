"use client";

import React from "react";

export function SceneLighting() {
  return (
    <>
      {/* Soft overall ambient light */}
      <ambientLight intensity={0.4} />

      {/* Primary key directional light */}
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#f8fafc" />

      {/* Soft Cyan accent point light */}
      <pointLight position={[3, 2, 4]} intensity={2.2} distance={10} color="#22d3ee" />

      {/* Cool Slate-cyan rim light */}
      <pointLight position={[-4, -2, -3]} intensity={2.5} distance={12} color="#38bdf8" />

      {/* Deep teal fill */}
      <pointLight position={[0, -4, 2]} intensity={1.2} distance={8} color="#0e7490" />
    </>
  );
}
