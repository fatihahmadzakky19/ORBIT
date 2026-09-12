"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════
   GLSL — Accretion Disk  (FBM turbulence, Kepler flow, plasma)
   Astrophysical color palette: white-hot → gold → orange → blue
   ═══════════════════════════════════════════════════════════════ */

const diskVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPos;
  void main() {
    vUv = uv;
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const diskFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uBrightness;
  varying vec2 vUv;
  varying vec3 vPos;

  /* ── noise primitives ── */
  float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i),             hash21(i + vec2(1.0, 0.0)), f.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float f = 0.0, w = 0.5;
    for (int i = 0; i < 7; i++) {
      f += w * vnoise(p);
      p = p * 2.15 + vec2(1.7, 9.2);
      w *= 0.46;
    }
    return f;
  }

  /* ── secondary turbulence for fine detail ── */
  float fbmFine(vec2 p) {
    float f = 0.0, w = 0.5;
    for (int i = 0; i < 5; i++) {
      f += w * vnoise(p);
      p = p * 2.3 + vec2(3.1, 5.7);
      w *= 0.42;
    }
    return f;
  }

  void main() {
    /* polar coords from geometry position (RingGeometry lives in XY) */
    float r     = length(vPos.xy);
    float angle = atan(vPos.y, vPos.x);

    float innerR = 0.5;
    float outerR = 2.8;
    float nr = clamp((r - innerR) / (outerR - innerR), 0.0, 1.0);

    /* ── Keplerian flow: inner orbits much faster ── */
    float keplerSpeed = 1.0 / (0.06 + nr * nr);
    float flow = angle + uTime * keplerSpeed * 0.10;

    /* ── FBM turbulence for plasma detail ── */
    vec2 turbUV = vec2(flow * 3.5, nr * 20.0);
    float turb  = fbm(turbUV + uTime * 0.07);
    float turb2 = fbm(turbUV * 0.55 + vec2(uTime * 0.04, 3.3));
    float turb3 = fbm(vec2(flow * 9.0, nr * 7.0) - uTime * 0.05);
    float turbFine = fbmFine(vec2(flow * 14.0, nr * 30.0) + uTime * 0.03);

    /* ── concentric luminous bands ── */
    float band1 = sin(nr * 70.0 + turb * 6.0) * 0.5 + 0.5;
    float band2 = sin(nr * 32.0 + turb2 * 3.5 + 1.5) * 0.5 + 0.5;
    float band3 = sin(nr * 110.0 + turbFine * 3.0) * 0.5 + 0.5;
    float bands = band1 * 0.3 + band2 * 0.35 + band3 * 0.35;

    /* ── plasma wisps / bright strands ── */
    float wisp1 = smoothstep(0.50, 0.68, fbm(vec2(flow * 7.0, nr * 12.0) + uTime * 0.10));
    float wisp2 = smoothstep(0.55, 0.74, fbm(vec2(flow * 5.0 + 4.0, nr * 16.0) - uTime * 0.08));
    float wisp3 = smoothstep(0.42, 0.62, fbm(vec2(flow * 3.5 + 8.0, nr * 22.0) + uTime * 0.06));
    float wisps = wisp1 * 0.45 + wisp2 * 0.3 + wisp3 * 0.25;

    /* ── spiral arm structures ── */
    float spiral = sin(angle * 2.0 - nr * 12.0 + uTime * 0.15) * 0.5 + 0.5;
    spiral *= smoothstep(0.0, 0.3, nr) * smoothstep(1.0, 0.5, nr);

    /* ── base brightness: hot inner → cool outer ── */
    float brightness = pow(1.0 - nr, 3.2) * 2.8;
    brightness += bands * (1.0 - nr) * 0.8;
    brightness += wisps * (1.0 - nr * 0.5) * 1.2;
    brightness += spiral * 0.3;

    /* ── angular motion streaks ── */
    float streak = 0.80 + 0.20 * sin(flow * 12.0 - nr * 20.0);
    brightness *= streak;

    /* ── fine grain turbulence for realism ── */
    brightness *= 0.85 + 0.15 * turbFine;

    /* ── gravitational intensification near inner edge ── */
    float gravBoost = smoothstep(0.12, 0.0, nr) * 2.0;
    brightness += gravBoost;

    /* ══════════════════════════════════════════════════════════
       ASTROPHYSICAL COLOR PALETTE
       Temperature-based: white-hot → yellow → gold → orange → brown
       with relativistic blue in the hottest zones
       ══════════════════════════════════════════════════════════ */
    vec3 whiteHot     = vec3(1.0, 1.0, 1.0);
    vec3 paleYellow   = vec3(1.0, 0.957, 0.839);      // #FFF4D6
    vec3 warmGold     = vec3(1.0, 0.910, 0.659);      // #FFE8A8
    vec3 brightGold   = vec3(1.0, 0.824, 0.478);      // #FFD27A
    vec3 paleOrange   = vec3(0.95, 0.72, 0.42);       // warm mid
    vec3 deepOrange   = vec3(0.85, 0.54, 0.29);       // #D98A4A
    vec3 coolBrown    = vec3(0.66, 0.37, 0.20);       // #A95E32
    vec3 darkEdge     = vec3(0.35, 0.22, 0.16);       // #5A3828
    vec3 cosmicDark   = vec3(0.08, 0.05, 0.04);

    /* Relativistic blue for inner-most plasma */
    vec3 relBlueHot   = vec3(0.87, 0.96, 1.0);        // #DFF6FF
    vec3 relBlueMid   = vec3(0.56, 0.847, 1.0);       // #8FD8FF
    vec3 relBlueCool  = vec3(0.30, 0.745, 0.937);     // #4BBEFF

    vec3 color;
    if (nr < 0.04) {
      /* Innermost: white-hot with relativistic blue tint */
      color = mix(whiteHot, relBlueHot, nr / 0.04 * 0.3);
      color = mix(color, whiteHot, 0.7);
    } else if (nr < 0.10) {
      /* Hot inner: white → pale yellow */
      float t = (nr - 0.04) / 0.06;
      color = mix(whiteHot, paleYellow, t);
      color = mix(color, relBlueHot, wisps * 0.15);
    } else if (nr < 0.20) {
      /* Warm zone: pale yellow → bright gold */
      float t = (nr - 0.10) / 0.10;
      color = mix(paleYellow, brightGold, t);
      color = mix(color, relBlueMid, wisps * 0.10);
    } else if (nr < 0.35) {
      /* Mid disk: bright gold → pale orange */
      float t = (nr - 0.20) / 0.15;
      color = mix(brightGold, paleOrange, t);
      color = mix(color, warmGold, spiral * 0.2);
    } else if (nr < 0.52) {
      /* Cooling zone: pale orange → deep orange */
      float t = (nr - 0.35) / 0.17;
      color = mix(paleOrange, deepOrange, t);
      color = mix(color, relBlueCool, wisps * 0.08);
    } else if (nr < 0.70) {
      /* Outer cooling: deep orange → cool brown */
      float t = (nr - 0.52) / 0.18;
      color = mix(deepOrange, coolBrown, t);
    } else if (nr < 0.85) {
      /* Far outer: cool brown → dark edge */
      float t = (nr - 0.70) / 0.15;
      color = mix(coolBrown, darkEdge, t);
    } else {
      /* Extreme outer: dark edge → cosmic dark */
      float t = (nr - 0.85) / 0.15;
      color = mix(darkEdge, cosmicDark, t);
    }

    /* ── edge fade ── */
    float innerFade = smoothstep(0.0, 0.03, nr);
    float outerFade = smoothstep(1.0, 0.78, nr);
    float edgeFade  = innerFade * outerFade;

    /* ── final composition ── */
    vec3  finalColor = color * brightness * uBrightness;
    float alpha      = edgeFade * clamp(brightness * 0.7, 0.0, 1.0) * uOpacity;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

/* ═══════════════════════════════════════════
   Accretion Disk Layer (reusable for volume)
   ═══════════════════════════════════════════ */
interface DiskLayerProps {
  yOffset?: number;
  opacity?: number;
  brightness?: number;
  tiltOffset?: number;
  innerRadius?: number;
  outerRadius?: number;
}

function AccretionDiskLayer({
  yOffset = 0,
  opacity = 1.0,
  brightness = 1.5,
  tiltOffset = 0,
  innerRadius = 0.5,
  outerRadius = 2.8,
}: DiskLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const geometry = useMemo(
    () => new THREE.RingGeometry(innerRadius, outerRadius, 180, 56),
    [innerRadius, outerRadius]
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: opacity },
      uBrightness: { value: brightness },
    }),
    [opacity, brightness]
  );

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (meshRef.current) meshRef.current.rotation.z += 0.0005;
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI * 0.42 + tiltOffset, 0.08, 0.12]}
      position={[0, yOffset, 0]}
      geometry={geometry}
    >
      <shaderMaterial
        ref={matRef}
        vertexShader={diskVertex}
        fragmentShader={diskFragment}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════
   Event Horizon (deep black void)
   ═══════════════════════════════════════ */
function EventHorizon() {
  const ref = useRef<THREE.Mesh>(null!);
  const auraRef = useRef<THREE.Mesh>(null!);
  const deepAuraRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (auraRef.current) {
      const s = 1.0 + Math.sin(t * 0.5) * 0.006;
      auraRef.current.scale.setScalar(s);
    }
    if (deepAuraRef.current) {
      const s = 1.0 + Math.sin(t * 0.35 + 1.0) * 0.004;
      deepAuraRef.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      {/* True void — pure black */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.46, 64, 64]} />
        <meshBasicMaterial color="#000003" />
      </mesh>
      {/* Dark absorption aura — gravitational darkness */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[0.54, 48, 48]} />
        <meshBasicMaterial
          color="#020406"
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </mesh>
      {/* Deep outer absorption — extends the void feeling */}
      <mesh ref={deepAuraRef}>
        <sphereGeometry args={[0.60, 32, 32]} />
        <meshBasicMaterial
          color="#030508"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ═════════════════════════════════════════════
   Photon Ring — bright ring at the event horizon
   Astrophysical: white-hot inner edge
   ═════════════════════════════════════════════ */
function PhotonRing() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (ref.current) {
      const p = 1.0 + Math.sin(state.clock.elapsedTime * 1.8) * 0.012;
      ref.current.scale.setScalar(p);
    }
  });

  return (
    <group>
      {/* Primary photon ring — white-hot */}
      <mesh ref={ref} rotation={[-Math.PI * 0.42, 0.08, 0.12]}>
        <torusGeometry args={[0.50, 0.014, 32, 128]} />
        <meshBasicMaterial
          color="#FFF8E8"
          transparent
          opacity={0.92}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Secondary photon ring — warm yellow */}
      <mesh rotation={[-Math.PI * 0.42, 0.08, 0.12]}>
        <torusGeometry args={[0.54, 0.007, 24, 96]} />
        <meshBasicMaterial
          color="#FFE8A8"
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* ISCO glow ring — subtle warm */}
      <mesh rotation={[-Math.PI * 0.42, 0.08, 0.12]}>
        <torusGeometry args={[0.57, 0.009, 24, 96]} />
        <meshBasicMaterial
          color="#FFD27A"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ══════════════════════════════════════════════════════════
   Gravitational Lensing Arc — light bent from the far side
   ══════════════════════════════════════════════════════════ */
function LensingArcs() {
  const ref1 = useRef<THREE.Mesh>(null!);
  const ref2 = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref1.current) {
      ref1.current.rotation.z = Math.sin(t * 0.2) * 0.025;
      const p = 1.0 + Math.sin(t * 1.2) * 0.008;
      ref1.current.scale.setScalar(p);
    }
    if (ref2.current) {
      ref2.current.rotation.z = Math.sin(t * 0.15 + 1.0) * 0.018;
    }
  });

  return (
    <group>
      {/* Upper lensing arc — warm white, simulates far-side disk bent over top */}
      <mesh ref={ref1} rotation={[-Math.PI * 0.12, 0.12, 0.25]} position={[0, 0.24, -0.08]}>
        <torusGeometry args={[0.58, 0.020, 16, 64, Math.PI * 0.85]} />
        <meshBasicMaterial
          color="#FFF4D6"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Lower lensing arc — dimmer, warm orange tint */}
      <mesh ref={ref2} rotation={[Math.PI * 0.85, 0.1, -0.2]} position={[0, -0.18, -0.06]}>
        <torusGeometry args={[0.55, 0.010, 16, 48, Math.PI * 0.6]} />
        <meshBasicMaterial
          color="#FFD27A"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ══════════════════════════════════════
   Volumetric Glow (layered halo sprites)
   Astrophysical: warm inner, deep blue outer
   ══════════════════════════════════════ */
function VolumetricGlow() {
  const innerRef = useRef<THREE.Sprite>(null!);
  const outerRef = useRef<THREE.Sprite>(null!);
  const warmRef = useRef<THREE.Sprite>(null!);

  const [innerTex, outerTex, warmTex] = useMemo(() => {
    const makeGlow = (stops: [number, string][]) => {
      const size = 256;
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const ctx = c.getContext("2d")!;
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      stops.forEach(([s, col]) => g.addColorStop(s, col));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(c);
    };

    /* Inner glow: warm white-yellow from hot accretion disk */
    const inner = makeGlow([
      [0, "rgba(255,248,232,0.28)"],
      [0.2, "rgba(255,228,168,0.16)"],
      [0.45, "rgba(217,138,74,0.06)"],
      [0.7, "rgba(90,56,40,0.02)"],
      [1, "rgba(0,0,0,0)"],
    ]);
    /* Outer glow: deep blue cosmic atmosphere */
    const outer = makeGlow([
      [0, "rgba(30,60,120,0.06)"],
      [0.25, "rgba(15,40,80,0.04)"],
      [0.5, "rgba(8,20,45,0.02)"],
      [1, "rgba(0,0,0,0)"],
    ]);
    /* Warm accent glow — off-center, simulates disk radiance */
    const warm = makeGlow([
      [0, "rgba(255,210,122,0.12)"],
      [0.3, "rgba(255,180,80,0.06)"],
      [0.6, "rgba(180,100,40,0.02)"],
      [1, "rgba(0,0,0,0)"],
    ]);
    return [inner, outer, warm];
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (innerRef.current) {
      const s = 3.8 + Math.sin(t * 0.6) * 0.10;
      innerRef.current.scale.set(s, s, 1);
    }
    if (outerRef.current) {
      const s = 6.0 + Math.sin(t * 0.35 + 1.0) * 0.18;
      outerRef.current.scale.set(s, s, 1);
    }
    if (warmRef.current) {
      const s = 4.2 + Math.sin(t * 0.45 + 0.5) * 0.12;
      warmRef.current.scale.set(s, s * 0.7, 1);
    }
  });

  return (
    <group>
      <sprite ref={innerRef} position={[0, 0, -0.2]}>
        <spriteMaterial map={innerTex} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <sprite ref={outerRef} position={[0, 0, -0.5]}>
        <spriteMaterial map={outerTex} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <sprite ref={warmRef} position={[0.1, -0.05, -0.3]}>
        <spriteMaterial map={warmTex} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
    </group>
  );
}

/* ═══════════════════════════════════════════════
   Orbital Particles — Keplerian orbits around BH
   Astrophysical palette: white, warm gold, pale orange
   ═══════════════════════════════════════════════ */
function OrbitalParticles({ count = 110 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const orbitData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      radius: 0.6 + Math.random() * 2.4,
      speed: 0.25 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      tiltX: (Math.random() - 0.5) * 0.22,
      elevation: (Math.random() - 0.5) * 0.10,
    }));
  }, [count]);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const cWhite = new THREE.Color("#f0ede6");
    const cWarmWhite = new THREE.Color("#fff4d6");
    const cGold = new THREE.Color("#ffd27a");
    const cPaleOrange = new THREE.Color("#e8a050");
    const cBlue = new THREE.Color("#8fd8ff");
    const tmp = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const rng = Math.random();
      if (rng < 0.35) tmp.copy(cWhite);
      else if (rng < 0.55) tmp.copy(cWarmWhite);
      else if (rng < 0.72) tmp.copy(cGold);
      else if (rng < 0.88) tmp.copy(cPaleOrange);
      else tmp.copy(cBlue);

      col[i * 3] = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const d = orbitData[i];
      const angle = d.phase + t * d.speed / Math.sqrt(d.radius);
      posArr[i * 3] = Math.cos(angle) * d.radius;
      posArr[i * 3 + 1] = d.elevation + d.tiltX * Math.sin(angle * 2.0);
      posArr[i * 3 + 2] = Math.sin(angle) * d.radius;
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
        size={0.016}
        vertexColors
        transparent
        opacity={0.80}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ═══════════════════════════════════════════════════════
   Infalling Particles — spiraling toward event horizon
   ═══════════════════════════════════════════════════════ */
function InfallingParticles({ count = 40 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const spiralData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      maxRadius: 1.0 + Math.random() * 1.8,
      speed: 0.8 + Math.random() * 1.2,
      fallRate: 0.12 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
      phaseOffset: Math.random(),
      elevation: (Math.random() - 0.5) * 0.05,
    }));
  }, [count]);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const tmp = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const rng = Math.random();
      if (rng < 0.4) tmp.set("#fff4d6");
      else if (rng < 0.7) tmp.set("#ffffff");
      else if (rng < 0.85) tmp.set("#ffd27a");
      else tmp.set("#8fd8ff");

      col[i * 3] = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const d = spiralData[i];
      const progress = ((t * d.fallRate + d.phaseOffset) % 1.0);
      const r = d.maxRadius * (1.0 - progress * 0.85);
      const angle = d.phase + t * d.speed / Math.sqrt(Math.max(r, 0.3));
      posArr[i * 3] = Math.cos(angle) * r;
      posArr[i * 3 + 1] = d.elevation * (1.0 - progress);
      posArr[i * 3 + 2] = Math.sin(angle) * r;
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
        size={0.010}
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

/* ══════════════════════════════════════════════
   Relativistic Jet — subtle vertical light beam
   Near-white inner fading to pale blue
   ══════════════════════════════════════════════ */
function RelativisticJet() {
  const topRef = useRef<THREE.Mesh>(null!);
  const bottomRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pulse = 0.85 + Math.sin(t * 1.2) * 0.15;
    if (topRef.current) {
      topRef.current.scale.set(pulse, 1, pulse);
    }
    if (bottomRef.current) {
      bottomRef.current.scale.set(pulse, 1, pulse);
    }
  });

  return (
    <group rotation={[-Math.PI * 0.42, 0.08, 0.12]}>
      {/* Top jet — near white, very subtle */}
      <mesh ref={topRef} position={[0, 0.7, 0]}>
        <coneGeometry args={[0.05, 1.6, 12]} />
        <meshBasicMaterial
          color="#e8e0d8"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Bottom jet — slightly dimmer */}
      <mesh ref={bottomRef} position={[0, -0.7, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.04, 1.2, 12]} />
        <meshBasicMaterial
          color="#b8c8d8"
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ═════════════════════════════════
   Cosmic Debris — floating rocks
   ═════════════════════════════════ */
function CosmicDebris() {
  const groupRef = useRef<THREE.Group>(null!);

  const debris = useMemo(
    () => [
      { pos: [2.8, 0.6, -0.8] as [number, number, number], scale: 0.032, speed: 0.3 },
      { pos: [-1.8, -0.4, 0.6] as [number, number, number], scale: 0.022, speed: 0.22 },
      { pos: [1.6, -0.65, -0.6] as [number, number, number], scale: 0.018, speed: 0.38 },
      { pos: [-0.6, 0.55, -1.8] as [number, number, number], scale: 0.028, speed: 0.28 },
      { pos: [3.2, 0.2, 0.5] as [number, number, number], scale: 0.015, speed: 0.32 },
      { pos: [-2.2, 0.3, -0.4] as [number, number, number], scale: 0.020, speed: 0.26 },
      { pos: [0.8, 0.8, -1.2] as [number, number, number], scale: 0.012, speed: 0.35 },
    ],
    []
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      if (i < debris.length) {
        child.rotation.x += debris[i].speed * delta * 0.4;
        child.rotation.y += debris[i].speed * delta * 0.6;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {debris.map((d, i) => (
        <mesh key={i} position={d.pos} scale={d.scale}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#12100e" roughness={0.9} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   Cosmic Dust — very fine background particles
   ═══════════════════════════════════════════════ */
function CosmicDust({ count = 200 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const tmp = new THREE.Color();

    for (let i = 0; i < count; i++) {
      /* Spread widely for cosmic dust cloud */
      const r = 1.5 + Math.random() * 4.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * 0.6; /* flatten to disk plane */

      pos[i * 3] = r * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = r * Math.sin(phi) * 0.3;
      pos[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);

      const rng = Math.random();
      if (rng < 0.4) tmp.set("#3a2a1a");
      else if (rng < 0.7) tmp.set("#2a1e15");
      else tmp.set("#1a1510");

      col[i * 3] = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.008;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.008}
        vertexColors
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ═════════════════════════════════
   MAIN BLACK HOLE COMPOSITION
   ═════════════════════════════════ */
export function BlackHole() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;

    /* gentle floating bob */
    groupRef.current.position.y =
      0.0 + Math.sin(state.clock.elapsedTime * 0.55) * 0.03;

    /* mouse parallax — subtle, gravitational feel */
    const targetRotX = state.pointer.y * -0.06 + 0.02;
    const targetRotY = state.pointer.x * 0.08;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX,
      0.02
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      0.02
    );
  });

  return (
    <group ref={groupRef} position={[1.0, -0.1, 0]}>
      {/* Layer 0 — volumetric glow (behind everything) */}
      <VolumetricGlow />

      {/* Layer 0.5 — cosmic dust cloud */}
      <CosmicDust count={200} />

      {/* Layer 1 — lower accretion disk (volumetric depth) */}
      <AccretionDiskLayer yOffset={-0.05} opacity={0.30} brightness={0.9} tiltOffset={0.025} />

      {/* Layer 2 — primary accretion disk */}
      <AccretionDiskLayer yOffset={0} opacity={1.0} brightness={1.5} />

      {/* Layer 3 — upper accretion disk (volumetric depth) */}
      <AccretionDiskLayer yOffset={0.05} opacity={0.35} brightness={1.0} tiltOffset={-0.018} />

      {/* Event horizon (black void sphere) */}
      <EventHorizon />

      {/* Photon rings (bright boundary — white-hot) */}
      <PhotonRing />

      {/* Gravitational lensing arcs */}
      <LensingArcs />

      {/* Relativistic jets — very subtle */}
      <RelativisticJet />

      {/* Orbital particles (Keplerian) */}
      <OrbitalParticles count={110} />

      {/* Infalling particles (spiraling inward) */}
      <InfallingParticles count={40} />

      {/* Floating cosmic debris */}
      <CosmicDebris />
    </group>
  );
}
