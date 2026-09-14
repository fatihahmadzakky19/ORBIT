"use client";

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BlackHole } from "./BlackHole";
import { Rocket, RocketHandle } from "./Rocket";
import { WormholeEffect } from "./WormholeEffect";
import { SolarSystem } from "./SolarSystem";
import { Earth } from "./Earth";

/* ══════════════════════════════════════════════════════════════════
   CENTRALIZED JOURNEY STATE MACHINE
   IDLE → LAUNCH → APPROACH_BLACK_HOLE → ENTER_EVENT_HORIZON → WORMHOLE
   → SOLAR_SYSTEM → SOLAR_ORBIT (cinematic flyby) → TARGET_EARTH
   → APPROACH_EARTH → EARTH_ORBIT → RETURN
   ══════════════════════════════════════════════════════════════════ */

export type JourneyPhase =
  | "IDLE"
  | "LAUNCH"
  | "APPROACH_BLACK_HOLE"
  | "ENTER_EVENT_HORIZON"
  | "WORMHOLE"
  | "SOLAR_SYSTEM"
  | "SOLAR_ORBIT"
  | "TARGET_EARTH"
  | "APPROACH_EARTH"
  | "EARTH_ORBIT"
  | "RETURN";

const PHASE_DURATIONS: Record<JourneyPhase, number> = {
  IDLE: Infinity,
  LAUNCH: 1.5,
  APPROACH_BLACK_HOLE: 2.5,
  ENTER_EVENT_HORIZON: 1.4,
  WORMHOLE: 2.2,
  SOLAR_SYSTEM: 2.2,
  SOLAR_ORBIT: 4.8, // Cinematic flyby orbiting the Sun and planets
  TARGET_EARTH: 1.6,
  APPROACH_EARTH: 2.6,
  EARTH_ORBIT: Infinity,
  RETURN: 2.6,
};

// Initial Rocket Placement: Outside accretion disk to the lower-left
const INITIAL_ROCKET_POS: [number, number, number] = [0.32, -0.68, 1.25];
const INITIAL_ROCKET_ROT: [number, number, number] = [-0.12, 0.42, 0.38];
const INITIAL_ROCKET_SCALE = 0.22;

// Smooth easing functions (100% deterministic, zero jitter)
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function easeInQuad(t: number): number {
  return t * t;
}

export interface JourneyManagerHandle {
  startJourney: () => void;
  returnToOrbit: () => void;
  replayJourney: () => void;
}

export interface JourneyManagerProps {
  onPhaseChange?: (phase: JourneyPhase) => void;
  onHoverChange?: (hovered: boolean) => void;
}

export const JourneyManager = forwardRef<JourneyManagerHandle, JourneyManagerProps>(
  function JourneyManager({ onPhaseChange, onHoverChange }, ref) {
    const [phase, setPhase] = useState<JourneyPhase>("IDLE");
    const phaseRef = useRef<JourneyPhase>("IDLE");
    const phaseTimeRef = useRef(0);

    const { camera } = useThree();
    const initialCamPos = useRef(new THREE.Vector3(0, 0.6, 4.0));
    const initialCamRot = useRef(new THREE.Euler(0, 0, 0));

    // Rocket direct handle
    const rocketRef = useRef<RocketHandle>(null);

    // Earth target coordinates in Solar System space (at z = -17.5)
    const earthWorldPos = useMemo(() => new THREE.Vector3(2.5, 0.15, -16.2), []);

    // Store initial camera on mount
    useEffect(() => {
      initialCamPos.current.copy(camera.position);
      initialCamRot.current.copy(camera.rotation);
    }, [camera]);

    const advancePhase = useCallback(
      (next: JourneyPhase) => {
        phaseRef.current = next;
        phaseTimeRef.current = 0;
        setPhase(next);
        onPhaseChange?.(next);
      },
      [onPhaseChange]
    );

    const startJourney = useCallback(() => {
      if (phaseRef.current !== "IDLE") return;
      initialCamPos.current.copy(camera.position);
      initialCamRot.current.copy(camera.rotation);
      advancePhase("LAUNCH");
    }, [advancePhase, camera]);

    const returnToOrbit = useCallback(() => {
      if (phaseRef.current !== "EARTH_ORBIT") return;
      advancePhase("RETURN");
    }, [advancePhase]);

    const replayJourney = useCallback(() => {
      camera.position.copy(initialCamPos.current);
      camera.rotation.copy(initialCamRot.current);
      if (rocketRef.current?.group) {
        rocketRef.current.group.position.set(
          INITIAL_ROCKET_POS[0],
          INITIAL_ROCKET_POS[1],
          INITIAL_ROCKET_POS[2]
        );
        rocketRef.current.group.rotation.set(
          INITIAL_ROCKET_ROT[0],
          INITIAL_ROCKET_ROT[1],
          INITIAL_ROCKET_ROT[2]
        );
        rocketRef.current.group.scale.setScalar(INITIAL_ROCKET_SCALE);
        rocketRef.current.group.visible = true;
        rocketRef.current.setEngineActive(true);
        rocketRef.current.setExhaustIntensity(1.0);
      }
      advancePhase("LAUNCH");
    }, [advancePhase, camera]);

    useImperativeHandle(
      ref,
      () => ({
        startJourney,
        returnToOrbit,
        replayJourney,
      }),
      [startJourney, returnToOrbit, replayJourney]
    );

    useFrame((state, delta) => {
      const cur = phaseRef.current;
      const rocket = rocketRef.current?.group;

      // ── IDLE STATE: Subtle, deterministic cosmic floating ──
      if (cur === "IDLE") {
        if (rocket) {
          const t = state.clock.elapsedTime;
          rocket.position.x = INITIAL_ROCKET_POS[0] + Math.sin(t * 0.9) * 0.012;
          rocket.position.y = INITIAL_ROCKET_POS[1] + Math.sin(t * 1.2 + 0.4) * 0.016;
          rocket.position.z = INITIAL_ROCKET_POS[2] + Math.cos(t * 0.8) * 0.008;

          rocket.rotation.x = INITIAL_ROCKET_ROT[0] + Math.sin(t * 0.7) * 0.015;
          rocket.rotation.y = INITIAL_ROCKET_ROT[1] + Math.cos(t * 0.8) * 0.012;
          rocket.rotation.z = INITIAL_ROCKET_ROT[2] + Math.sin(t * 0.6) * 0.012;
        }
        return;
      }

      phaseTimeRef.current += delta;
      const dur = PHASE_DURATIONS[cur];
      const progress = Math.min(phaseTimeRef.current / dur, 1.0);
      const eased = easeInOutCubic(progress);

      switch (cur) {
        /* ── PHASE 1: ROCKET LAUNCH (Ignition & Curved Lift) ── */
        case "LAUNCH": {
          if (rocket) {
            rocket.visible = true;
            rocketRef.current?.setEngineActive(true);
            rocketRef.current?.setExhaustIntensity(1.6 + progress * 0.4);

            // Curved takeoff starting from initial position
            const p0 = new THREE.Vector3(
              INITIAL_ROCKET_POS[0],
              INITIAL_ROCKET_POS[1],
              INITIAL_ROCKET_POS[2]
            );
            const p1 = new THREE.Vector3(0.55, -0.35, 0.95);
            const p2 = new THREE.Vector3(0.75, -0.15, 0.65);

            const t = eased;
            const mt = 1 - t;
            rocket.position.x = mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x;
            rocket.position.y = mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y;
            rocket.position.z = mt * mt * p0.z + 2 * mt * t * p1.z + t * t * p2.z;

            // Stable smooth tilt pointing toward black hole
            rocket.rotation.x = THREE.MathUtils.lerp(INITIAL_ROCKET_ROT[0], -0.28, t);
            rocket.rotation.y = THREE.MathUtils.lerp(INITIAL_ROCKET_ROT[1], 0.62, t);
            rocket.rotation.z = THREE.MathUtils.lerp(INITIAL_ROCKET_ROT[2], 0.68, t);
          }

          // Camera subtle forward tracking
          camera.position.x = THREE.MathUtils.lerp(initialCamPos.current.x, 0.15, eased * 0.35);
          camera.position.z = THREE.MathUtils.lerp(initialCamPos.current.z, 3.85, eased * 0.35);

          if (progress >= 1.0) advancePhase("APPROACH_BLACK_HOLE");
          break;
        }

        /* ── PHASE 2: APPROACH BLACK HOLE (Curved Slingshot Trajectory) ── */
        case "APPROACH_BLACK_HOLE": {
          if (rocket) {
            const p0 = new THREE.Vector3(0.75, -0.15, 0.65);
            const p1 = new THREE.Vector3(0.98, 0.08, 0.32);
            const p2 = new THREE.Vector3(0.95, 0.0, 0.05);

            const t = easeInQuad(progress);
            const mt = 1 - t;
            rocket.position.x = mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x;
            rocket.position.y = mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y;
            rocket.position.z = mt * mt * p0.z + 2 * mt * t * p1.z + t * t * p2.z;

            // Stable rotation into the photon ring (no sudden snapping)
            rocket.rotation.x = THREE.MathUtils.lerp(-0.28, -0.15, t);
            rocket.rotation.y = THREE.MathUtils.lerp(0.62, 0.85, t);
            rocket.rotation.z += delta * (2.5 + progress * 4.0);
            rocket.scale.setScalar(INITIAL_ROCKET_SCALE * (1.0 - progress * 0.5));
            rocketRef.current?.setExhaustIntensity(2.0 + progress * 1.2);
          }

          // Camera follows rocket toward black hole center
          const targetCam = new THREE.Vector3(0.45, 0.18, 2.6);
          camera.position.lerp(targetCam, 0.035);
          camera.lookAt(0.95, 0, 0);

          if (progress >= 1.0) advancePhase("ENTER_EVENT_HORIZON");
          break;
        }

        /* ── PHASE 3: ENTER EVENT HORIZON (Dark Cinematic Singularity) ── */
        case "ENTER_EVENT_HORIZON": {
          if (rocket) {
            // Rocket cleanly enters the black singularity
            rocket.position.lerp(new THREE.Vector3(0.95, 0, -0.4), 0.1);
            rocket.scale.lerp(new THREE.Vector3(0.01, 0.01, 0.01), 0.12);
            if (progress > 0.35) rocket.visible = false;
          }

          // Camera pushes into singularity
          const plungeTarget = new THREE.Vector3(0.92, 0.0, -0.8);
          camera.position.lerp(plungeTarget, 0.06);

          if (progress >= 1.0) advancePhase("WORMHOLE");
          break;
        }

        /* ── PHASE 4: WORMHOLE (Dimensional Warp Transit) ── */
        case "WORMHOLE": {
          if (rocket) {
            rocket.visible = true;
            rocket.scale.setScalar(0.18);
            rocketRef.current?.setEngineActive(true);
            rocketRef.current?.setExhaustIntensity(2.2);

            // Flying through the center of the tunnel
            const wz = THREE.MathUtils.lerp(-1.5, -11.0, eased);
            rocket.position.set(0.12 * Math.sin(wz * 1.2), -0.08, wz);
            rocket.rotation.set(-Math.PI * 0.5, 0, Math.sin(wz * 0.8) * 0.15);
          }

          // Camera follows right behind rocket
          const camZ = THREE.MathUtils.lerp(-0.5, -9.0, eased);
          camera.position.set(0, 0.15, camZ);
          camera.lookAt(0, 0, camZ - 8.0);

          if (progress >= 1.0) advancePhase("SOLAR_SYSTEM");
          break;
        }

        /* ── PHASE 5: SOLAR SYSTEM (Emergence & Wide Overview) ── */
        case "SOLAR_SYSTEM": {
          if (rocket) {
            rocket.visible = true;
            rocket.scale.setScalar(0.17);
            rocketRef.current?.setEngineActive(true);
            rocketRef.current?.setExhaustIntensity(1.8);

            // Rocket emerges from wormhole into outer solar system
            const rx = THREE.MathUtils.lerp(-1.8, -0.6, eased);
            const ry = THREE.MathUtils.lerp(1.0, 0.5, eased);
            const rz = THREE.MathUtils.lerp(-12.0, -14.5, eased);
            rocket.position.set(rx, ry, rz);
            rocket.rotation.set(-0.35, 0.45, 0.15);
          }

          // Camera wide orbital perspective of Sun and planets
          const targetCam = new THREE.Vector3(0.6, 2.4, -10.0);
          camera.position.lerp(targetCam, 0.04);
          camera.lookAt(0, 0, -17.5);

          if (progress >= 1.0) advancePhase("SOLAR_ORBIT");
          break;
        }

        /* ── PHASE 6: SOLAR ORBIT (Cinematic Flyby Around Solar System) ── */
        case "SOLAR_ORBIT": {
          if (rocket) {
            rocket.visible = true;
            rocket.scale.setScalar(0.18);
            rocketRef.current?.setEngineActive(true);
            rocketRef.current?.setExhaustIntensity(1.6);

            // Sweeping orbital arc around the Sun (-X to +X via outer perimeter)
            const angle = Math.PI * 0.7 + eased * Math.PI * 0.85;
            const orbitRadX = 3.8;
            const orbitRadZ = 3.0;
            const sunCenterZ = -17.5;

            const rx = Math.cos(angle) * orbitRadX;
            const ry = 0.4 + Math.sin(eased * Math.PI) * 0.4;
            const rz = sunCenterZ + Math.sin(angle) * orbitRadZ;

            rocket.position.set(rx, ry, rz);

            // Tangent rotation following the arc
            const heading = angle + Math.PI * 0.5;
            rocket.rotation.set(-0.2, -heading + Math.PI, 0.18);
          }

          // Panoramic camera movement smoothly tracking the flyby
          const camAngle = Math.PI * 0.6 + eased * Math.PI * 0.5;
          const targetCam = new THREE.Vector3(
            Math.cos(camAngle) * 5.2,
            2.2 - eased * 0.6,
            -17.5 + Math.sin(camAngle) * 4.8
          );
          camera.position.lerp(targetCam, 0.035);
          camera.lookAt(0, 0, -17.5);

          if (progress >= 1.0) advancePhase("TARGET_EARTH");
          break;
        }

        /* ── PHASE 7: TARGET EARTH (Lock Reticle Engages) ── */
        case "TARGET_EARTH": {
          if (rocket) {
            rocket.visible = true;
            rocket.scale.setScalar(0.19);
            // Rocket aligns toward Earth
            const startP = new THREE.Vector3(1.2, 0.45, -15.2);
            const targetP = new THREE.Vector3(1.8, 0.3, -15.8);
            rocket.position.lerpVectors(startP, targetP, eased);
            rocket.rotation.set(-0.22, 0.48, 0.12);
          }

          // Camera focuses smoothly onto Earth
          const targetCam = new THREE.Vector3(1.8, 1.1, -12.5);
          camera.position.lerp(targetCam, 0.045);
          camera.lookAt(earthWorldPos.x, earthWorldPos.y, earthWorldPos.z);

          if (progress >= 1.0) advancePhase("APPROACH_EARTH");
          break;
        }

        /* ── PHASE 8: APPROACH EARTH (Glideslope Toward Parallel Orbit) ── */
        case "APPROACH_EARTH": {
          // Final stable parking position beside Earth
          const finalRocketPos = new THREE.Vector3(
            earthWorldPos.x + 1.25,
            earthWorldPos.y + 0.35,
            earthWorldPos.z + 0.45
          );

          if (rocket) {
            rocket.visible = true;
            const startRPos = new THREE.Vector3(1.8, 0.3, -15.8);
            rocket.position.lerpVectors(startRPos, finalRocketPos, eased);
            rocket.rotation.x = THREE.MathUtils.lerp(-0.22, -0.06, eased);
            rocket.rotation.y = THREE.MathUtils.lerp(0.48, 0.25, eased);
            rocket.rotation.z = THREE.MathUtils.lerp(0.12, 0.02, eased);
            rocket.scale.setScalar(THREE.MathUtils.lerp(0.19, 0.23, eased));
            // Engine thrust decelerates gracefully
            rocketRef.current?.setExhaustIntensity(1.4 * (1.0 - progress * 0.75));
          }

          // Camera swoops smoothly alongside Earth & Rocket
          const camTarget = new THREE.Vector3(
            earthWorldPos.x + 0.35,
            earthWorldPos.y + 0.55,
            earthWorldPos.z + 3.6
          );
          camera.position.lerp(camTarget, 0.04);
          camera.lookAt(earthWorldPos.x + 0.4, earthWorldPos.y, earthWorldPos.z);

          if (progress >= 1.0) {
            if (rocket) {
              rocketRef.current?.setEngineActive(true);
              rocketRef.current?.setExhaustIntensity(0.3);
            }
            advancePhase("EARTH_ORBIT");
          }
          break;
        }

        /* ── PHASE 9: EARTH ORBIT (Final State: Calm Parallel Parking Beside Earth) ── */
        case "EARTH_ORBIT": {
          const t = state.clock.elapsedTime;
          if (rocket) {
            // Calm, stable micro-float beside Earth (never crashes, never lands)
            rocket.position.x = earthWorldPos.x + 1.25 + Math.sin(t * 0.7) * 0.025;
            rocket.position.y = earthWorldPos.y + 0.35 + Math.cos(t * 0.6) * 0.02;
            rocket.position.z = earthWorldPos.z + 0.45 + Math.sin(t * 0.5) * 0.015;
            rocket.rotation.z = 0.02 + Math.sin(t * 0.5) * 0.01;
          }
          break;
        }

        /* ── PHASE 10: RETURN (Smooth Reverse Zoom to Dashboard Hero) ── */
        case "RETURN": {
          if (rocket) {
            rocket.visible = true;
            const startP = new THREE.Vector3(
              earthWorldPos.x + 1.25,
              earthWorldPos.y + 0.35,
              earthWorldPos.z + 0.45
            );
            const targetP = new THREE.Vector3(
              INITIAL_ROCKET_POS[0],
              INITIAL_ROCKET_POS[1],
              INITIAL_ROCKET_POS[2]
            );
            rocket.position.lerpVectors(startP, targetP, eased);
            rocket.rotation.x = THREE.MathUtils.lerp(-0.06, INITIAL_ROCKET_ROT[0], eased);
            rocket.rotation.y = THREE.MathUtils.lerp(0.25, INITIAL_ROCKET_ROT[1], eased);
            rocket.rotation.z = THREE.MathUtils.lerp(0.02, INITIAL_ROCKET_ROT[2], eased);
            rocket.scale.setScalar(THREE.MathUtils.lerp(0.23, INITIAL_ROCKET_SCALE, eased));
            rocketRef.current?.setEngineActive(true);
            rocketRef.current?.setExhaustIntensity(1.0);
          }

          // Camera smoothly interpolates back to initial hero position
          camera.position.lerp(initialCamPos.current, 0.05);
          camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, initialCamRot.current.x, 0.05);
          camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, initialCamRot.current.y, 0.05);
          camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, initialCamRot.current.z, 0.05);

          if (progress >= 1.0) {
            camera.position.copy(initialCamPos.current);
            camera.rotation.copy(initialCamRot.current);
            if (rocket) {
              rocket.position.set(
                INITIAL_ROCKET_POS[0],
                INITIAL_ROCKET_POS[1],
                INITIAL_ROCKET_POS[2]
              );
              rocket.rotation.set(
                INITIAL_ROCKET_ROT[0],
                INITIAL_ROCKET_ROT[1],
                INITIAL_ROCKET_ROT[2]
              );
              rocket.scale.setScalar(INITIAL_ROCKET_SCALE);
            }
            advancePhase("IDLE");
          }
          break;
        }
      }
    });

    const handleBlackHoleClick = useCallback(() => {
      startJourney();
    }, [startJourney]);

    const showBlackHole =
      phase === "IDLE" ||
      phase === "LAUNCH" ||
      phase === "APPROACH_BLACK_HOLE" ||
      phase === "ENTER_EVENT_HORIZON" ||
      phase === "RETURN";

    const showWormhole =
      phase === "ENTER_EVENT_HORIZON" || phase === "WORMHOLE" || phase === "RETURN";

    const showSolarSystem =
      phase === "SOLAR_SYSTEM" ||
      phase === "SOLAR_ORBIT" ||
      phase === "TARGET_EARTH" ||
      phase === "APPROACH_EARTH" ||
      phase === "EARTH_ORBIT";

    const showEarth =
      phase === "SOLAR_SYSTEM" ||
      phase === "SOLAR_ORBIT" ||
      phase === "TARGET_EARTH" ||
      phase === "APPROACH_EARTH" ||
      phase === "EARTH_ORBIT";

    return (
      <group>
        {/* 1. Interactive 3D Black Hole */}
        <BlackHole
          visible={showBlackHole}
          onClick={handleBlackHoleClick}
          onHoverChange={onHoverChange}
        />

        {/* 2. Space Shuttle 3D Stack (Deterministic, single source of transform) */}
        <Rocket
          ref={rocketRef}
          position={INITIAL_ROCKET_POS}
          rotation={INITIAL_ROCKET_ROT}
          scale={INITIAL_ROCKET_SCALE}
          engineActive={true}
          visible={true}
        />

        {/* 3. Wormhole Dimensional Warp Tunnel */}
        <WormholeEffect
          visible={showWormhole}
          intensity={phase === "WORMHOLE" ? 1.0 : 0.35}
        />

        {/* 4. Realistic Solar System at z = -17.5 */}
        <SolarSystem visible={showSolarSystem} position={[0, 0, -17.5]} scale={0.7} />

        {/* 5. Destination: Realistic Earth beside Solar System */}
        <Earth
          visible={showEarth}
          position={[earthWorldPos.x, earthWorldPos.y, earthWorldPos.z]}
          scale={1.65}
        />
      </group>
    );
  }
);
