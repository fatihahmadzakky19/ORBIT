"use client";

import React, { useRef, useMemo, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════
   GLSL — Accretion Disk  (FBM turbulence, Kepler flow, plasma)
   Astrophysical color palette: white-hot → gold → orange → brown
   Relativistic blue used VERY sparingly (<5%)
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
  uniform float uHoverIntensity;
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

  /* ── tertiary micro-turbulence for particle-level detail ── */
  float fbmMicro(vec2 p) {
    float f = 0.0, w = 0.5;
    for (int i = 0; i < 4; i++) {
      f += w * vnoise(p);
      p = p * 2.8 + vec2(7.3, 2.1);
      w *= 0.38;
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
    float keplerSpeed = 1.0 / (0.05 + nr * nr);
    float flow = angle + uTime * keplerSpeed * 0.10;

    /* ── FBM turbulence for plasma detail ── */
    vec2 turbUV = vec2(flow * 3.5, nr * 20.0);
    float turb  = fbm(turbUV + uTime * 0.07);
    float turb2 = fbm(turbUV * 0.55 + vec2(uTime * 0.04, 3.3));
    float turb3 = fbm(vec2(flow * 9.0, nr * 7.0) - uTime * 0.05);
    float turbFine = fbmFine(vec2(flow * 14.0, nr * 30.0) + uTime * 0.03);
    float turbMicro = fbmMicro(vec2(flow * 22.0, nr * 45.0) + uTime * 0.02);

    /* ── concentric luminous bands ── */
    float band1 = sin(nr * 70.0 + turb * 6.0) * 0.5 + 0.5;
    float band2 = sin(nr * 32.0 + turb2 * 3.5 + 1.5) * 0.5 + 0.5;
    float band3 = sin(nr * 110.0 + turbFine * 3.0) * 0.5 + 0.5;
    float band4 = sin(nr * 180.0 + turbMicro * 4.0 + 2.8) * 0.5 + 0.5;
    float bands = band1 * 0.25 + band2 * 0.30 + band3 * 0.25 + band4 * 0.20;

    /* ── plasma wisps / bright strands ── */
    float wisp1 = smoothstep(0.50, 0.68, fbm(vec2(flow * 7.0, nr * 12.0) + uTime * 0.10));
    float wisp2 = smoothstep(0.55, 0.74, fbm(vec2(flow * 5.0 + 4.0, nr * 16.0) - uTime * 0.08));
    float wisp3 = smoothstep(0.42, 0.62, fbm(vec2(flow * 3.5 + 8.0, nr * 22.0) + uTime * 0.06));
    float wisp4 = smoothstep(0.48, 0.66, fbmFine(vec2(flow * 11.0 + 2.0, nr * 28.0) + uTime * 0.04));
    float wisps = wisp1 * 0.35 + wisp2 * 0.25 + wisp3 * 0.20 + wisp4 * 0.20;

    /* ── spiral arm structures ── */
    float spiral = sin(angle * 2.0 - nr * 12.0 + uTime * 0.15) * 0.5 + 0.5;
    spiral *= smoothstep(0.0, 0.3, nr) * smoothstep(1.0, 0.5, nr);
    float spiral2 = sin(angle * 3.0 + nr * 8.0 - uTime * 0.12 + 1.5) * 0.5 + 0.5;
    spiral2 *= smoothstep(0.05, 0.35, nr) * smoothstep(1.0, 0.6, nr);

    /* ── base brightness: hot inner → cool outer ── */
    float brightness = pow(1.0 - nr, 3.5) * 3.0;
    brightness += bands * (1.0 - nr) * 0.9;
    brightness += wisps * (1.0 - nr * 0.5) * 1.3;
    brightness += spiral * 0.25 + spiral2 * 0.15;

    /* ── angular motion streaks ── */
    float streak = 0.80 + 0.20 * sin(flow * 12.0 - nr * 20.0);
    brightness *= streak;

    /* ── fine grain turbulence for realism ── */
    brightness *= 0.82 + 0.18 * turbFine;
    brightness *= 0.92 + 0.08 * turbMicro;

    /* ── Doppler beaming: approaching side brighter ── */
    float doppler = 1.0 + 0.25 * sin(angle + 0.5);
    brightness *= doppler;

    /* ── gravitational intensification near inner edge ── */
    float gravBoost = smoothstep(0.12, 0.0, nr) * 2.5;
    brightness += gravBoost;

    /* ── hover intensity boost ── */
    brightness *= 1.0 + uHoverIntensity * 0.12;

    /* ── subtle brightness fluctuation (temporal) ── */
    float flicker = 1.0 + 0.03 * sin(uTime * 2.5 + nr * 10.0 + angle * 3.0);
    brightness *= flicker;

    /* ══════════════════════════════════════════════════════════
       ASTROPHYSICAL COLOR PALETTE
       Temperature-based: white-hot → yellow → gold → orange → brown
       with VERY subtle relativistic blue in the hottest zones
       ══════════════════════════════════════════════════════════ */
    vec3 whiteHot     = vec3(1.0, 1.0, 1.0);                   // #FFFFFF
    vec3 paleYellow   = vec3(1.0, 0.960, 0.839);               // #FFF5D6
    vec3 warmWhite    = vec3(1.0, 0.890, 0.627);               // #FFE3A0
    vec3 brightGold   = vec3(1.0, 0.773, 0.420);               // #FFC56B
    vec3 warmAmber    = vec3(0.949, 0.604, 0.271);              // #F29A45
    vec3 deepOrange   = vec3(0.835, 0.416, 0.196);             // #D56A32
    vec3 coolBrown    = vec3(0.541, 0.294, 0.165);             // #8A4B2A
    vec3 darkBrown    = vec3(0.333, 0.188, 0.122);             // #55301F
    vec3 cosmicDark   = vec3(0.165, 0.098, 0.082);             // #2A1915

    /* Relativistic blue for inner-most plasma — VERY subtle */
    vec3 relBlueHot   = vec3(0.784, 0.941, 1.0);               // #C8F0FF
    vec3 relBlueMid   = vec3(0.490, 0.843, 1.0);               // #7DD7FF

    vec3 color;
    if (nr < 0.04) {
      /* Innermost: white-hot with very subtle relativistic blue tint */
      color = mix(whiteHot, relBlueHot, nr / 0.04 * 0.15);
      color = mix(color, whiteHot, 0.85);
    } else if (nr < 0.10) {
      /* Hot inner: white → pale yellow */
      float t = (nr - 0.04) / 0.06;
      color = mix(whiteHot, paleYellow, t);
      color = mix(color, relBlueHot, wisps * 0.08);
    } else if (nr < 0.18) {
      /* Warm zone: pale yellow → warm white */
      float t = (nr - 0.10) / 0.08;
      color = mix(paleYellow, warmWhite, t);
    } else if (nr < 0.30) {
      /* Mid disk: warm white → bright gold */
      float t = (nr - 0.18) / 0.12;
      color = mix(warmWhite, brightGold, t);
      color = mix(color, paleYellow, spiral * 0.15);
    } else if (nr < 0.45) {
      /* Cooling: bright gold → warm amber */
      float t = (nr - 0.30) / 0.15;
      color = mix(brightGold, warmAmber, t);
    } else if (nr < 0.58) {
      /* Deep cooling: warm amber → deep orange */
      float t = (nr - 0.45) / 0.13;
      color = mix(warmAmber, deepOrange, t);
    } else if (nr < 0.72) {
      /* Outer cooling: deep orange → cool brown */
      float t = (nr - 0.58) / 0.14;
      color = mix(deepOrange, coolBrown, t);
    } else if (nr < 0.85) {
      /* Far outer: cool brown → dark brown */
      float t = (nr - 0.72) / 0.13;
      color = mix(coolBrown, darkBrown, t);
    } else {
      /* Extreme outer: dark brown → cosmic dark */
      float t = (nr - 0.85) / 0.15;
      color = mix(darkBrown, cosmicDark, t);
    }

    /* ── edge fade ── */
    float innerFade = smoothstep(0.0, 0.03, nr);
    float outerFade = smoothstep(1.0, 0.75, nr);
    float edgeFade  = innerFade * outerFade;

    /* ── final composition ── */
    vec3  finalColor = color * brightness * uBrightness;
    float alpha      = edgeFade * clamp(brightness * 0.7, 0.0, 1.0) * uOpacity;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

/* ═══════════════════════════════════════
   Accretion Disk Layer (reusable for volume)
   ═══════════════════════════════════════ */
interface DiskLayerProps {
  yOffset?: number;
  opacity?: number;
  brightness?: number;
  tiltOffset?: number;
  innerRadius?: number;
  outerRadius?: number;
  hoverIntensity?: number;
}

function AccretionDiskLayer({
  yOffset = 0,
  opacity = 1.0,
  brightness = 1.5,
  tiltOffset = 0,
  innerRadius = 0.5,
  outerRadius = 2.8,
  hoverIntensity = 0,
}: DiskLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const geometry = useMemo(
    () => new THREE.RingGeometry(innerRadius, outerRadius, 200, 64),
    [innerRadius, outerRadius]
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: opacity },
      uBrightness: { value: brightness },
      uHoverIntensity: { value: 0 },
    }),
    [opacity, brightness]
  );

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      matRef.current.uniforms.uHoverIntensity.value = THREE.MathUtils.lerp(
        matRef.current.uniforms.uHoverIntensity.value,
        hoverIntensity,
        0.05
      );
    }
    if (meshRef.current) meshRef.current.rotation.z += 0.0004;
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
   Pure #000000 center, zero ambient leakage
   ═══════════════════════════════════════ */
function EventHorizon() {
  const ref = useRef<THREE.Mesh>(null!);
  const auraRef = useRef<THREE.Mesh>(null!);
  const deepAuraRef = useRef<THREE.Mesh>(null!);
  const distortRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (auraRef.current) {
      const s = 1.0 + Math.sin(t * 0.5) * 0.005;
      auraRef.current.scale.setScalar(s);
    }
    if (deepAuraRef.current) {
      const s = 1.0 + Math.sin(t * 0.35 + 1.0) * 0.003;
      deepAuraRef.current.scale.setScalar(s);
    }
    if (distortRef.current) {
      const s = 1.0 + Math.sin(t * 0.25 + 2.0) * 0.004;
      distortRef.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      {/* True void — pure black, #000000 */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.48, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* Dark absorption aura — gravitational darkness #020304 */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[0.55, 48, 48]} />
        <meshBasicMaterial
          color="#020304"
          transparent
          opacity={0.75}
          depthWrite={false}
        />
      </mesh>
      {/* Deep outer absorption — extends the void feeling */}
      <mesh ref={deepAuraRef}>
        <sphereGeometry args={[0.62, 32, 32]} />
        <meshBasicMaterial
          color="#030508"
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>
      {/* Gravitational distortion layer — very subtle dark sphere to absorb stray light */}
      <mesh ref={distortRef}>
        <sphereGeometry args={[0.68, 32, 32]} />
        <meshBasicMaterial
          color="#020408"
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ═════════════════════════════════════════════
   Photon Ring — bright ring at the event horizon
   Astrophysical: white-hot inner edge
   Doppler beaming: asymmetric brightness
   ═════════════════════════════════════════════ */

const photonRingVertex = /* glsl */ `
  varying float vAngle;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vAngle = atan(position.y, position.x);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const photonRingFragment = /* glsl */ `
  uniform float uTime;
  uniform float uHoverIntensity;
  varying float vAngle;
  varying vec2 vUv;

  void main() {
    /* Doppler beaming: approaching side (angle ~0) is brighter */
    float doppler = 0.65 + 0.35 * sin(vAngle + 0.5);

    /* Subtle temporal pulse */
    float pulse = 1.0 + 0.04 * sin(uTime * 1.8 + vAngle * 2.0);

    /* Hover brightness boost */
    float hover = 1.0 + uHoverIntensity * 0.15;

    float brightness = doppler * pulse * hover;

    /* White-hot color: #FFF7E6 → #FFE7A8 */
    vec3 color = mix(vec3(1.0, 0.969, 0.902), vec3(1.0, 0.906, 0.659), 0.3);
    color *= brightness;

    float alpha = brightness * 0.9;
    gl_FragColor = vec4(color, alpha);
  }
`;

function PhotonRing({ hoverIntensity = 0 }: { hoverIntensity?: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const mat2Ref = useRef<THREE.ShaderMaterial>(null!);

  const uniforms1 = useMemo(() => ({
    uTime: { value: 0 },
    uHoverIntensity: { value: 0 },
  }), []);

  const uniforms2 = useMemo(() => ({
    uTime: { value: 0 },
    uHoverIntensity: { value: 0 },
  }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      const p = 1.0 + Math.sin(t * 1.8) * 0.008;
      ref.current.scale.setScalar(p);
    }
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t;
      matRef.current.uniforms.uHoverIntensity.value = THREE.MathUtils.lerp(
        matRef.current.uniforms.uHoverIntensity.value, hoverIntensity, 0.05
      );
    }
    if (mat2Ref.current) {
      mat2Ref.current.uniforms.uTime.value = t;
      mat2Ref.current.uniforms.uHoverIntensity.value = THREE.MathUtils.lerp(
        mat2Ref.current.uniforms.uHoverIntensity.value, hoverIntensity, 0.05
      );
    }
  });

  return (
    <group>
      {/* Primary photon ring — Doppler-beamed */}
      <mesh ref={ref} rotation={[-Math.PI * 0.42, 0.08, 0.12]}>
        <torusGeometry args={[0.51, 0.016, 32, 128]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={photonRingVertex}
          fragmentShader={photonRingFragment}
          uniforms={uniforms1}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Secondary photon ring — warm yellow, slightly larger */}
      <mesh rotation={[-Math.PI * 0.42, 0.08, 0.12]}>
        <torusGeometry args={[0.55, 0.008, 24, 96]} />
        <shaderMaterial
          ref={mat2Ref}
          vertexShader={photonRingVertex}
          fragmentShader={photonRingFragment}
          uniforms={uniforms2}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* ISCO glow ring — subtle warm gold #FFD27A */}
      <mesh rotation={[-Math.PI * 0.42, 0.08, 0.12]}>
        <torusGeometry args={[0.58, 0.006, 24, 96]} />
        <meshBasicMaterial
          color="#FFD27A"
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ══════════════════════════════════════════════════════════
   Gravitational Lensing Arcs — light bent from the far side
   Warmer colors, organic movement
   ══════════════════════════════════════════════════════════ */
function LensingArcs() {
  const ref1 = useRef<THREE.Mesh>(null!);
  const ref2 = useRef<THREE.Mesh>(null!);
  const ref3 = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref1.current) {
      ref1.current.rotation.z = Math.sin(t * 0.2) * 0.02;
      const p = 1.0 + Math.sin(t * 1.2) * 0.006;
      ref1.current.scale.setScalar(p);
    }
    if (ref2.current) {
      ref2.current.rotation.z = Math.sin(t * 0.15 + 1.0) * 0.015;
    }
    if (ref3.current) {
      ref3.current.rotation.z = Math.sin(t * 0.18 + 2.0) * 0.012;
      const p = 1.0 + Math.sin(t * 0.9 + 1.5) * 0.005;
      ref3.current.scale.setScalar(p);
    }
  });

  return (
    <group>
      {/* Upper lensing arc — warm white, simulates far-side disk bent over top */}
      <mesh ref={ref1} rotation={[-Math.PI * 0.12, 0.12, 0.25]} position={[0, 0.24, -0.08]}>
        <torusGeometry args={[0.58, 0.018, 16, 64, Math.PI * 0.85]} />
        <meshBasicMaterial
          color="#FFF4D6"
          transparent
          opacity={0.30}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Lower lensing arc — dimmer, warm gold tint */}
      <mesh ref={ref2} rotation={[Math.PI * 0.85, 0.1, -0.2]} position={[0, -0.18, -0.06]}>
        <torusGeometry args={[0.55, 0.010, 16, 48, Math.PI * 0.6]} />
        <meshBasicMaterial
          color="#FFC56B"
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Side lensing arc — very subtle, warm amber */}
      <mesh ref={ref3} rotation={[-Math.PI * 0.3, 0.3, 0.8]} position={[0.1, 0.05, -0.1]}>
        <torusGeometry args={[0.56, 0.007, 12, 48, Math.PI * 0.5]} />
        <meshBasicMaterial
          color="#F29A45"
          transparent
          opacity={0.10}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ══════════════════════════════════════
   Volumetric Glow (layered halo sprites)
   Astrophysical: warm inner, NO cyan dominance
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
      [0, "rgba(255,245,214,0.30)"],
      [0.15, "rgba(255,227,160,0.18)"],
      [0.35, "rgba(255,197,107,0.08)"],
      [0.55, "rgba(213,106,50,0.03)"],
      [0.75, "rgba(90,56,40,0.01)"],
      [1, "rgba(0,0,0,0)"],
    ]);
    /* Outer glow: deep dark blue cosmic atmosphere — very subtle */
    const outer = makeGlow([
      [0, "rgba(20,40,80,0.04)"],
      [0.25, "rgba(10,25,50,0.03)"],
      [0.5, "rgba(5,15,35,0.015)"],
      [1, "rgba(0,0,0,0)"],
    ]);
    /* Warm accent glow — off-center, simulates disk radiance */
    const warm = makeGlow([
      [0, "rgba(255,197,107,0.14)"],
      [0.25, "rgba(242,154,69,0.07)"],
      [0.5, "rgba(213,106,50,0.03)"],
      [0.75, "rgba(138,75,42,0.01)"],
      [1, "rgba(0,0,0,0)"],
    ]);
    return [inner, outer, warm];
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (innerRef.current) {
      const s = 3.6 + Math.sin(t * 0.6) * 0.08;
      innerRef.current.scale.set(s, s, 1);
    }
    if (outerRef.current) {
      const s = 5.5 + Math.sin(t * 0.35 + 1.0) * 0.15;
      outerRef.current.scale.set(s, s, 1);
    }
    if (warmRef.current) {
      const s = 4.0 + Math.sin(t * 0.45 + 0.5) * 0.10;
      warmRef.current.scale.set(s, s * 0.7, 1);
    }
  });

  return (
    <group>
      <sprite ref={innerRef} position={[0, 0, -0.2]}>
        <spriteMaterial map={innerTex} transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <sprite ref={outerRef} position={[0, 0, -0.5]}>
        <spriteMaterial map={outerTex} transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <sprite ref={warmRef} position={[0.1, -0.05, -0.3]}>
        <spriteMaterial map={warmTex} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
    </group>
  );
}

/* ═══════════════════════════════════════════════
   Orbital Particles — Keplerian orbits around BH
   Astrophysical palette: white, warm gold, pale orange
   ═══════════════════════════════════════════════ */
function OrbitalParticles({ count = 130, hoverIntensity = 0 }: { count?: number; hoverIntensity?: number }) {
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

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);

    const cWhite = new THREE.Color("#f0ede6");
    const cWarmWhite = new THREE.Color("#fff4d6");
    const cGold = new THREE.Color("#ffc56b");
    const cPaleOrange = new THREE.Color("#f29a45");
    const cBlue = new THREE.Color("#c8f0ff");
    const tmp = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const rng = Math.random();
      if (rng < 0.30) tmp.copy(cWhite);
      else if (rng < 0.50) tmp.copy(cWarmWhite);
      else if (rng < 0.70) tmp.copy(cGold);
      else if (rng < 0.90) tmp.copy(cPaleOrange);
      else tmp.copy(cBlue); // Very sparse blue

      col[i * 3] = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;

      // Size variation for depth perception
      sz[i] = 0.008 + Math.random() * 0.020;
    }
    return [pos, col, sz];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const d = orbitData[i];
      // Hover: subtle trajectory shift
      const hShift = hoverIntensity * 0.02 * Math.sin(t + i);
      const angle = d.phase + t * d.speed / Math.sqrt(d.radius) + hShift;
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
function InfallingParticles({ count = 50 }: { count?: number }) {
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
      if (rng < 0.35) tmp.set("#fff5d6");
      else if (rng < 0.60) tmp.set("#ffffff");
      else if (rng < 0.80) tmp.set("#ffc56b");
      else if (rng < 0.93) tmp.set("#f29a45");
      else tmp.set("#c8f0ff");

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
   Near-white inner fading to pale warm
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
      {/* Top jet — warm white, very subtle */}
      <mesh ref={topRef} position={[0, 0.7, 0]}>
        <coneGeometry args={[0.05, 1.6, 12]} />
        <meshBasicMaterial
          color="#e8e0d0"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Bottom jet — slightly dimmer */}
      <mesh ref={bottomRef} position={[0, -0.7, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.04, 1.2, 12]} />
        <meshBasicMaterial
          color="#d8c8b0"
          transparent
          opacity={0.04}
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
function CosmicDust({ count = 250 }: { count?: number }) {
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
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.006;
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
export interface BlackHoleProps {
  onHoverChange?: (hovered: boolean) => void;
  onClick?: () => void;
  visible?: boolean;
}

export function BlackHole({ onHoverChange, onClick, visible = true }: BlackHoleProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const { size } = useThree();
  const isMobile = size.width < 640;
  const hoverRef = useRef(0);
  const isHoveredRef = useRef(false);

  const handlePointerOver = useCallback(() => {
    isHoveredRef.current = true;
    document.body.style.cursor = "pointer";
    onHoverChange?.(true);
  }, [onHoverChange]);

  const handlePointerOut = useCallback(() => {
    isHoveredRef.current = false;
    document.body.style.cursor = "auto";
    onHoverChange?.(false);
  }, [onHoverChange]);

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Smooth hover intensity lerp
    const target = isHoveredRef.current ? 1.0 : 0.0;
    hoverRef.current = THREE.MathUtils.lerp(hoverRef.current, target, 0.04);

    /* gentle floating bob */
    groupRef.current.position.y =
      (isMobile ? -0.22 : 0.0) + Math.sin(state.clock.elapsedTime * 0.55) * 0.025;

    /* mouse parallax — subtle, gravitational feel */
    const targetRotX = state.pointer.y * -0.05 + 0.015;
    const targetRotY = state.pointer.x * 0.07;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX,
      0.018
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      0.018
    );
  });

  if (!visible) return null;

  const hoverVal = hoverRef.current;

  return (
    <group
      ref={groupRef}
      position={[isMobile ? 0.75 : 1.0, isMobile ? -0.22 : -0.1, 0]}
      scale={isMobile ? 0.82 : 1.0}
    >
      {/* Hit area for interaction — transparent mesh with visible=true so raycaster hits reliably */}
      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[2.2, 24, 24]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Layer 0 — volumetric glow (behind everything) */}
      <VolumetricGlow />

      {/* Layer 0.5 — cosmic dust cloud */}
      <CosmicDust count={isMobile ? 120 : 250} />

      {/* Layer 1 — lower accretion disk (volumetric depth) */}
      <AccretionDiskLayer yOffset={-0.06} opacity={0.28} brightness={0.85} tiltOffset={0.025} hoverIntensity={hoverVal} />

      {/* Layer 1.5 — extra depth layer */}
      <AccretionDiskLayer yOffset={-0.03} opacity={0.18} brightness={0.7} tiltOffset={0.012} innerRadius={0.55} outerRadius={2.5} hoverIntensity={hoverVal} />

      {/* Layer 2 — primary accretion disk */}
      <AccretionDiskLayer yOffset={0} opacity={1.0} brightness={1.5} hoverIntensity={hoverVal} />

      {/* Layer 3 — upper accretion disk (volumetric depth) */}
      <AccretionDiskLayer yOffset={0.05} opacity={0.32} brightness={0.95} tiltOffset={-0.018} hoverIntensity={hoverVal} />

      {/* Layer 3.5 — upper thin layer */}
      <AccretionDiskLayer yOffset={0.08} opacity={0.15} brightness={0.6} tiltOffset={-0.03} innerRadius={0.55} outerRadius={2.2} hoverIntensity={hoverVal} />

      {/* Event horizon (pure black void sphere) */}
      <EventHorizon />

      {/* Photon rings (bright boundary — Doppler-beamed) */}
      <PhotonRing hoverIntensity={hoverVal} />

      {/* Gravitational lensing arcs */}
      <LensingArcs />

      {/* Relativistic jets — very subtle */}
      <RelativisticJet />

      {/* Orbital particles (Keplerian) */}
      <OrbitalParticles count={isMobile ? 70 : 130} hoverIntensity={hoverVal} />

      {/* Infalling particles (spiraling inward) */}
      <InfallingParticles count={isMobile ? 25 : 50} />

      {/* Floating cosmic debris */}
      <CosmicDebris />
    </group>
  );
}
