"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ══════════════════════════════════════════════════════════════════
   REALISTIC PROCEDURAL EARTH — Modeled after reference (media_1789365971118.jpg)
   - Deep blue oceans, green/brown continent relief, snow caps
   - High-contrast day/night terminator line
   - Night side with warm golden city lights clusters
   - Swirling procedural 3D cloud sphere with independent rotation
   - Atmospheric Rayleigh scattering rim glow (Fresnel shader)
   - Brilliant upper-left Sun flare matching the reference image
   ══════════════════════════════════════════════════════════════════ */

const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const earthFragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  /* Simplex / FBM noise for realistic continent contours */
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

  float fbm(vec2 p) {
    float f = 0.0, w = 0.5;
    for (int i = 0; i < 6; i++) {
      f += w * noise(p);
      p *= 2.15;
      w *= 0.48;
    }
    return f;
  }

  void main() {
    vec2 uv = vUv;

    /* Sun light direction: from upper-left (-X, +Y, +Z) matching reference image */
    vec3 sunDir = normalize(vec3(-0.7, 0.65, 0.5));
    float sunDot = dot(vNormal, sunDir);
    float daylight = smoothstep(-0.15, 0.25, sunDot);

    /* ── Continents vs Oceans ── */
    float continentNoise = fbm(uv * 7.5 + vec2(2.1, 0.9));
    float isLand = smoothstep(0.44, 0.52, continentNoise);

    /* Ocean colors — deep royal blue to shallow coastal azure */
    vec3 deepOcean = vec3(0.04, 0.12, 0.38);
    vec3 coastalOcean = vec3(0.09, 0.28, 0.62);
    vec3 oceanColor = mix(deepOcean, coastalOcean, smoothstep(0.38, 0.46, continentNoise));

    /* Land colors — Amazon green lowlands, Andes brown mountain ranges, polar snow */
    float elevation = fbm(uv * 14.0 + vec2(0.5, 3.2));
    vec3 lowlandGreen = vec3(0.12, 0.38, 0.15);
    vec3 mountainBrown = vec3(0.52, 0.38, 0.22);
    vec3 highlandRock = vec3(0.36, 0.30, 0.22);
    vec3 snowColor = vec3(0.95, 0.96, 0.98);

    vec3 landColor = mix(lowlandGreen, mountainBrown, elevation);
    landColor = mix(landColor, highlandRock, smoothstep(0.6, 0.75, elevation));

    /* Polar caps and snowy peaks */
    float polarLat = abs(uv.y - 0.5) * 2.0;
    float snowMask = smoothstep(0.78, 0.88, polarLat) + smoothstep(0.72, 0.85, elevation) * 0.6;
    landColor = mix(landColor, snowColor, clamp(snowMask, 0.0, 1.0));

    /* Ocean Specular Glint on sunlight side */
    vec3 viewDir = normalize(-vPosition);
    vec3 halfVec = normalize(sunDir + viewDir);
    float spec = pow(max(dot(vNormal, halfVec), 0.0), 32.0) * (1.0 - isLand) * daylight;
    vec3 specularGlint = vec3(1.0, 0.95, 0.85) * spec * 0.8;

    /* Base day color */
    vec3 surfaceColor = mix(oceanColor, landColor, isLand);
    vec3 dayColor = (surfaceColor * (0.35 + daylight * 0.9)) + specularGlint;

    /* ── Night Side City Lights ── */
    float cityFbm = fbm(uv * 26.0 + vec2(1.2, 5.7));
    float citySpots = smoothstep(0.62, 0.78, cityFbm) * isLand;
    vec3 cityLightColor = vec3(1.0, 0.82, 0.45) * citySpots * 1.6;
    vec3 nightColor = vec3(0.005, 0.008, 0.018) + cityLightColor;

    /* Blend Day / Night */
    vec3 finalColor = mix(nightColor, dayColor, daylight);

    /* ── Atmospheric Fresnel Limb Glow (Rayleigh scattering) ── */
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.8);
    vec3 atmosphereGlow = vec3(0.35, 0.65, 1.0) * fresnel * (0.3 + daylight * 0.8);
    finalColor += atmosphereGlow;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

/* 3D Atmospheric Cloud Layer */
function CloudSphere({ radius }: { radius: number }) {
  const cloudMeshRef = useRef<THREE.Mesh>(null!);

  const cloudTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const nx = x / size;
        const ny = y / size;
        // Swirling storm patterns
        const v =
          Math.sin(nx * 14.0 + ny * 6.0) * 0.35 +
          Math.cos(nx * 24.0 - ny * 16.0) * 0.25 +
          Math.sin(nx * 8.0 + ny * 28.0) * 0.2 +
          Math.sin((nx + ny) * 32.0) * 0.12;
        const alpha = Math.max(0, Math.min(1, (v - 0.05) * 2.2));
        if (alpha > 0.15) {
          ctx.fillStyle = `rgba(255, 255, 255, ${(alpha - 0.15) * 0.85})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    if (cloudMeshRef.current) {
      // Clouds rotate slightly faster than the planet surface
      cloudMeshRef.current.rotation.y = state.clock.elapsedTime * 0.028;
    }
  });

  return (
    <mesh ref={cloudMeshRef}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial
        map={cloudTexture}
        transparent
        opacity={0.55}
        depthWrite={false}
        roughness={0.9}
      />
    </mesh>
  );
}

/* Atmospheric Outer Halo Rim */
function AtmosphereHalo({ radius }: { radius: number }) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 48, 48]} />
      <meshBasicMaterial
        color="#4da6ff"
        transparent
        opacity={0.16}
        side={THREE.BackSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* Brilliant Sun Starburst Flare (matching upper-left flare in reference image) */
function SunFlareSprite() {
  const flareTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const center = size / 2;

    // Outer warm halo
    const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
    grad.addColorStop(0.0, "rgba(255, 255, 240, 1.0)");
    grad.addColorStop(0.15, "rgba(255, 215, 120, 0.85)");
    grad.addColorStop(0.35, "rgba(255, 140, 40, 0.4)");
    grad.addColorStop(0.65, "rgba(230, 80, 20, 0.1)");
    grad.addColorStop(1.0, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Starburst diffraction spikes
    ctx.strokeStyle = "rgba(255, 245, 200, 0.65)";
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(
        center + Math.cos(angle) * (size * 0.45),
        center + Math.sin(angle) * (size * 0.45)
      );
      ctx.lineTo(
        center - Math.cos(angle) * (size * 0.45),
        center - Math.sin(angle) * (size * 0.45)
      );
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <sprite position={[-3.2, 3.0, -1.5]} scale={[3.8, 3.8, 1]}>
      <spriteMaterial
        map={flareTexture}
        transparent
        opacity={0.92}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  );
}

export interface EarthProps {
  visible?: boolean;
  position?: [number, number, number];
  scale?: number;
}

export const Earth = React.memo(function Earth({
  visible = false,
  position = [2.2, 0.1, -15.5],
  scale = 1.6,
}: EarthProps) {
  const earthGroupRef = useRef<THREE.Group>(null!);
  const earthMatRef = useRef<THREE.ShaderMaterial>(null!);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (!visible || !earthGroupRef.current) return;
    const t = state.clock.elapsedTime;
    earthGroupRef.current.rotation.y = t * 0.015;

    if (earthMatRef.current) {
      earthMatRef.current.uniforms.uTime.value = t;
    }
  });

  if (!visible) return null;

  return (
    <group ref={earthGroupRef} position={position} scale={[scale, scale, scale]}>
      {/* Upper-left Sun Flare Backdrop (matching reference image) */}
      <SunFlareSprite />

      {/* Earth Surface Sphere */}
      <mesh>
        <sphereGeometry args={[1.0, 64, 64]} />
        <shaderMaterial
          ref={earthMatRef}
          vertexShader={earthVertexShader}
          fragmentShader={earthFragmentShader}
          uniforms={uniforms}
        />
      </mesh>

      {/* Swirling 3D Cloud Atmosphere */}
      <CloudSphere radius={1.025} />

      {/* Rayleigh Scattering Atmospheric Rim */}
      <AtmosphereHalo radius={1.08} />

      {/* Upper-left Key Sunlight Directional Light */}
      <directionalLight
        position={[-4, 3.5, 3]}
        intensity={2.8}
        color="#fff8e7"
      />

      {/* Subtle deep space bounce light on dark side */}
      <ambientLight intensity={0.06} />
    </group>
  );
});
