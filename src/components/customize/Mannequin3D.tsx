import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { StyleOption, GarmentVisibility, BodyMeasurements } from "@/types/customize";
import { measurementsToMorphTargets } from "@/types/customize";

// ── Smooth spline profile helper ──
function splineProfile(pts: [number, number][], segments = 48): THREE.Vector2[] {
  const curve = new THREE.SplineCurve(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  return curve.getPoints(segments);
}

// ── Fabric bump texture ──
function useFabricTexture(fabricId: string) {
  return useMemo(() => {
    const s = 512;
    const c = document.createElement("canvas");
    c.width = s; c.height = s;
    const x = c.getContext("2d")!;
    x.fillStyle = "#808080";
    x.fillRect(0, 0, s, s);
    if (fabricId.includes("wool") || fabricId === "tweed") {
      for (let y = 0; y < s; y += 2) for (let i = 0; i < s; i += 2) { const v = 120 + Math.random() * 16; x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(i, y, 2, 2); }
      for (let y = 0; y < s; y += 8) { x.strokeStyle = `rgba(100,100,100,0.25)`; x.beginPath(); x.moveTo(0, y); x.lineTo(s, y + 4); x.stroke(); }
    } else if (fabricId.includes("linen")) {
      for (let y = 0; y < s; y += 3) { const v = 118 + Math.random() * 18; x.strokeStyle = `rgb(${v},${v},${v})`; x.lineWidth = 1; x.beginPath(); x.moveTo(0, y); x.lineTo(s, y); x.stroke(); }
      for (let i = 0; i < s; i += 4) { const v = 118 + Math.random() * 18; x.strokeStyle = `rgb(${v},${v},${v})`; x.lineWidth = 0.8; x.beginPath(); x.moveTo(i, 0); x.lineTo(i, s); x.stroke(); }
    } else if (fabricId === "silk-blend") {
      x.fillStyle = "#838383"; x.fillRect(0, 0, s, s);
      for (let y = 0; y < s; y++) { const v = 128 + Math.sin(y * 0.08) * 5; x.strokeStyle = `rgb(${v},${v},${v})`; x.lineWidth = 0.4; x.beginPath(); x.moveTo(0, y); x.lineTo(s, y); x.stroke(); }
    } else if (fabricId === "velvet") {
      for (let y = 0; y < s; y++) for (let i = 0; i < s; i++) { const v = 124 + Math.random() * 6; x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(i, y, 1, 1); }
    } else {
      for (let y = 0; y < s; y += 2) for (let i = 0; i < s; i += 2) { const v = 125 + Math.random() * 8; x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(i, y, 2, 2); }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, 10);
    return tex;
  }, [fabricId]);
}

// ── Full body mesh (single continuous lathe) ──
function createFullBodyGeo(cs: number, ws: number, hs: number, sw: number, heightS: number) {
  // One continuous profile from top of head to ankle
  // Y goes from 0 (top of head) to 1 (feet)
  const pts: [number, number][] = [
    // Head top
    [0.00, 0.000],
    [0.06, 0.005],
    [0.10, 0.015],
    [0.13, 0.030],
    [0.145, 0.050],
    [0.15, 0.070],  // forehead widest
    [0.148, 0.090],
    [0.14, 0.105],  // temple
    [0.135, 0.115],  // cheekbone
    [0.125, 0.130],  // jaw
    [0.10, 0.145],
    [0.065, 0.155],
    [0.03, 0.160],   // chin
    // Neck
    [0.055, 0.170],
    [0.065, 0.180],
    [0.070, 0.195],
    [0.072, 0.210],  // neck center
    [0.078, 0.225],  // neck base
    // Shoulders & upper torso
    [0.12, 0.235],   // trap
    [0.20 * sw, 0.245],   // shoulder onset
    [0.24 * sw, 0.255],   // shoulder peak
    [0.245 * sw, 0.265],  // deltoid
    [0.235 * sw, 0.280],
    // Chest
    [0.22 * cs, 0.300],   // upper chest
    [0.215 * cs, 0.320],  // chest
    [0.21 * cs, 0.340],   // mid chest
    [0.195 * cs, 0.360],  // under bust
    // Waist
    [0.175 * ws, 0.385],
    [0.160 * ws, 0.405],  // natural waist (narrowest)
    [0.158 * ws, 0.415],
    [0.165 * ws, 0.430],
    // Hips
    [0.185 * hs, 0.450],
    [0.205 * hs, 0.470],  // hip
    [0.215 * hs, 0.485],  // widest hip
    [0.218 * hs, 0.495],
    [0.215 * hs, 0.510],
    [0.205 * hs, 0.525],
    [0.190 * hs, 0.540],
    // Upper thigh / crotch area
    [0.165, 0.555],
    [0.145, 0.565],
    [0.130, 0.575],   // inner thigh line (legs split)
    [0.125, 0.580],
    // Upper leg (single leg profile for lathe)
    [0.120, 0.590],
    [0.115, 0.610],
    [0.110, 0.640],
    [0.105, 0.670],
    [0.098, 0.700],   // above knee
    // Knee
    [0.088, 0.720],
    [0.082, 0.735],   // knee center
    [0.078, 0.745],
    // Calf
    [0.082, 0.760],
    [0.085, 0.780],   // calf widest
    [0.082, 0.810],
    [0.072, 0.850],
    [0.060, 0.890],
    // Ankle
    [0.048, 0.925],
    [0.042, 0.945],
    [0.038, 0.960],   // ankle narrowest
    // Foot
    [0.045, 0.970],
    [0.055, 0.980],
    [0.060, 0.990],
    [0.055, 0.997],
    [0.040, 1.000],
  ];

  const profile = splineProfile(pts, 128);
  const geo = new THREE.LatheGeometry(profile, 80);
  return geo;
}

// ── Arm geometry (continuous shoulder to hand) ──
function createArmGeo(armScale: number) {
  const pts: [number, number][] = [
    // Shoulder cap
    [0.065, 0.00],
    [0.072, 0.03],   // deltoid
    [0.070, 0.08],
    [0.065, 0.14],
    // Bicep
    [0.060, 0.20],
    [0.057, 0.28],
    [0.052, 0.35],
    // Elbow
    [0.047, 0.42],
    [0.044, 0.46],
    [0.043, 0.48],   // elbow point
    // Forearm
    [0.048, 0.52],
    [0.046, 0.58],
    [0.042, 0.65],
    [0.037, 0.72],
    // Wrist
    [0.032, 0.78],
    [0.028, 0.82 * armScale],
    // Hand
    [0.035, 0.85 * armScale],
    [0.038, 0.88 * armScale],
    [0.036, 0.92 * armScale],
    [0.030, 0.95 * armScale],
    [0.018, 0.98 * armScale],
    [0.005, 1.00 * armScale],
  ];
  const profile = splineProfile(pts, 64);
  return new THREE.LatheGeometry(profile, 28);
}

// ── Jacket torso overlay ──
function createJacketGeo(cs: number, ws: number, hs: number, sw: number) {
  const offset = 0.018; // jacket sits slightly outside body
  const pts: [number, number][] = [
    [0.080 + offset, 0.00],   // collar
    [0.13 + offset, 0.03],    // neck
    [0.22 * sw + offset, 0.08], // shoulder
    [0.25 * sw + offset, 0.12], // shoulder pad
    [0.24 * sw + offset, 0.16],
    [0.23 * cs + offset, 0.22], // chest
    [0.22 * cs + offset, 0.30],
    [0.20 * cs + offset, 0.38],
    [0.18 * ws + offset, 0.46], // waist
    [0.17 * ws + offset, 0.50],
    [0.19 * hs + offset, 0.56], // hip
    [0.20 * hs + offset, 0.62],
    [0.21 * hs + offset, 0.68], // jacket hem
    [0.20 * hs + offset, 0.72],
    [0.15 + offset, 0.76],
  ];
  const profile = splineProfile(pts, 56);
  return new THREE.LatheGeometry(profile, 64);
}

// ── Trouser legs ──
function createTrouserLegGeo() {
  const offset = 0.008;
  const pts: [number, number][] = [
    [0.130 + offset, 0.00],  // waistband
    [0.125 + offset, 0.05],
    [0.120 + offset, 0.12],
    [0.115 + offset, 0.20],
    [0.108 + offset, 0.30],
    [0.098 + offset, 0.40],  // above knee
    [0.088 + offset, 0.48],
    [0.085 + offset, 0.52],  // knee
    [0.088 + offset, 0.56],
    [0.085 + offset, 0.62],
    [0.078 + offset, 0.70],
    [0.068 + offset, 0.80],
    [0.058 + offset, 0.88],
    [0.052 + offset, 0.94],  // cuff
    [0.050 + offset, 0.98],
    [0.048 + offset, 1.00],
  ];
  const profile = splineProfile(pts, 48);
  return new THREE.LatheGeometry(profile, 28);
}

// ── Shoe geometry ──
function createShoeGeo() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.04, 0);
  shape.quadraticCurveTo(-0.055, 0.01, -0.055, 0.035);
  shape.lineTo(-0.055, 0.055);
  shape.quadraticCurveTo(-0.04, 0.07, 0, 0.072);
  shape.lineTo(0.08, 0.072);
  shape.quadraticCurveTo(0.12, 0.065, 0.13, 0.04);
  shape.quadraticCurveTo(0.12, 0.005, 0.08, 0);
  shape.lineTo(-0.04, 0);
  return new THREE.ExtrudeGeometry(shape, { depth: 0.10, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 5 });
}

// ── Jacket sleeve ──
function createSleeveGeo(armScale: number) {
  const offset = 0.012;
  const pts: [number, number][] = [
    [0.072 + offset, 0.00],
    [0.078 + offset, 0.04],
    [0.074 + offset, 0.12],
    [0.068 + offset, 0.22],
    [0.062 + offset, 0.32],
    [0.055 + offset, 0.42],
    [0.050 + offset, 0.50],
    [0.052 + offset, 0.55],
    [0.050 + offset, 0.62],
    [0.046 + offset, 0.70],
    [0.042 + offset, 0.78],
    [0.038 + offset, 0.84 * armScale],
    [0.036 + offset, 0.88 * armScale],
  ];
  const profile = splineProfile(pts, 40);
  return new THREE.LatheGeometry(profile, 24);
}

interface MannequinProps {
  color: string;
  fabricId: string;
  fabricProps: { roughness: number; metalness: number; bumpScale: number };
  styleConfig: StyleOption;
  garments: GarmentVisibility;
  bodyMeasurements: BodyMeasurements | null;
}

export default function Mannequin3D({
  color, fabricId, fabricProps, styleConfig, garments, bodyMeasurements,
}: MannequinProps) {
  const group = useRef<THREE.Group>(null);
  const bumpMap = useFabricTexture(fabricId);

  const morph = useMemo(() => {
    if (!bodyMeasurements) return { heightScale: 1, chestScale: 1, waistScale: 1, hipScale: 1, shoulderScale: 1, legScale: 1, armScale: 1 };
    return measurementsToMorphTargets(bodyMeasurements);
  }, [bodyMeasurements]);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.06;
    }
  });

  // ── Materials ──
  const skinMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#d4a986",
    roughness: 0.48,
    metalness: 0.0,
    clearcoat: 0.15,
    clearcoatRoughness: 0.55,
    sheen: 0.25,
    sheenColor: new THREE.Color("#e8c4a0"),
    sheenRoughness: 0.35,
    envMapIntensity: 0.6,
  }), []);

  const suitMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: fabricProps.roughness,
    metalness: fabricProps.metalness,
    bumpMap, bumpScale: fabricProps.bumpScale,
    clearcoat: fabricId.includes("wool") ? 0.05 : fabricId === "silk-blend" ? 0.15 : 0,
    clearcoatRoughness: 0.85,
    sheen: fabricId === "cashmere" ? 0.45 : fabricId === "velvet" ? 0.65 : fabricId.includes("wool") ? 0.18 : 0.05,
    sheenColor: new THREE.Color(color).offsetHSL(0, -0.1, 0.15),
    sheenRoughness: 0.55,
    envMapIntensity: 0.5,
  }), [color, fabricProps, bumpMap, fabricId]);

  const trouserMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color).offsetHSL(0, 0, -0.03),
    roughness: fabricProps.roughness + 0.02,
    metalness: fabricProps.metalness,
    bumpMap, bumpScale: fabricProps.bumpScale * 0.8,
    envMapIntensity: 0.4,
  }), [color, fabricProps, bumpMap]);

  const shirtMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#f0ebe3", roughness: 0.75, metalness: 0, envMapIntensity: 0.3 }), []);
  const shoeMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#1a1410", roughness: 0.22, metalness: 0.10, clearcoat: 0.35, clearcoatRoughness: 0.35, envMapIntensity: 0.8 }), []);
  const buttonMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#6b5d4f", roughness: 0.35, metalness: 0.18, clearcoat: 0.25 }), []);
  const vestMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color).offsetHSL(0, 0.05, 0.05),
    roughness: fabricProps.roughness - 0.05, metalness: fabricProps.metalness + 0.02, bumpMap, bumpScale: fabricProps.bumpScale * 0.6,
  }), [color, fabricProps, bumpMap]);
  const tieMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#5c1a2a", roughness: 0.38, metalness: 0.05, sheen: 0.3, sheenColor: new THREE.Color("#8a2040"), sheenRoughness: 0.4 }), []);
  const beltMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#1a1410", roughness: 0.30, metalness: 0.12, clearcoat: 0.25 }), []);
  const hairMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#1a1410", roughness: 0.85, metalness: 0 }), []);

  const sw = styleConfig.shoulderMult * morph.shoulderScale;
  const cs = morph.chestScale;
  const ws = morph.waistScale;
  const hs = morph.hipScale;
  const heightS = morph.heightScale;
  const armS = morph.armScale;

  // ── Geometries ──
  const bodyGeo = useMemo(() => createFullBodyGeo(cs, ws, hs, sw, heightS), [cs, ws, hs, sw, heightS]);
  const armGeo = useMemo(() => createArmGeo(armS), [armS]);
  const jacketGeo = useMemo(() => createJacketGeo(cs, ws, hs, sw), [cs, ws, hs, sw]);
  const trouserLegGeo = useMemo(() => createTrouserLegGeo(), []);
  const shoeGeo = useMemo(() => createShoeGeo(), []);
  const sleeveGeo = useMemo(() => createSleeveGeo(armS), [armS]);

  // Scale body height — the body geo goes from y=0 (head top) downward
  // We need to scale and position so it stands at ground level
  const bodyHeight = 3.5 * heightS;
  const yBase = -bodyHeight / 2;

  return (
    <group ref={group} position={[0, yBase * 0.92, 0]}>
      {/* ── MAIN BODY ── */}
      <mesh
        geometry={bodyGeo}
        material={skinMat}
        scale={[1, bodyHeight, 1]}
        position={[0, bodyHeight, 0]}
        castShadow
        receiveShadow
      />

      {/* ── HAIR (skull cap) ── */}
      <mesh position={[0, bodyHeight * 1.002, 0]} material={hairMat}>
        <sphereGeometry args={[0.155, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
      </mesh>

      {/* ── EARS ── */}
      {[-1, 1].map((s) => (
        <mesh key={`ear${s}`} position={[s * 0.155, bodyHeight * 0.96, -0.01]} rotation={[0, s * 0.35, 0]} material={skinMat}>
          <sphereGeometry args={[0.028, 12, 12]} />
        </mesh>
      ))}

      {/* ── EYES (subtle indentations) ── */}
      {[-1, 1].map((s) => (
        <group key={`eye${s}`}>
          <mesh position={[s * 0.045, bodyHeight * 0.965, 0.125]} material={skinMat}>
            <sphereGeometry args={[0.018, 12, 12]} />
          </mesh>
          <mesh position={[s * 0.045, bodyHeight * 0.965, 0.13]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshPhysicalMaterial color="#2a2015" roughness={0.2} metalness={0.1} />
          </mesh>
        </group>
      ))}

      {/* ── NOSE ── */}
      <mesh position={[0, bodyHeight * 0.945, 0.145]} rotation={[0.2, 0, 0]} material={skinMat}>
        <coneGeometry args={[0.014, 0.035, 8]} />
      </mesh>
      <mesh position={[0, bodyHeight * 0.935, 0.14]} material={skinMat}>
        <sphereGeometry args={[0.016, 8, 8]} />
      </mesh>

      {/* ── LIPS ── */}
      <mesh position={[0, bodyHeight * 0.92, 0.13]} scale={[1.8, 0.6, 0.6]}>
        <sphereGeometry args={[0.012, 10, 8]} />
        <meshPhysicalMaterial color="#c48a78" roughness={0.4} metalness={0} clearcoat={0.3} />
      </mesh>

      {/* ── SHIRT COLLAR ── */}
      {garments.shirt && (
        <mesh position={[0, bodyHeight * 0.79, 0]} material={shirtMat}>
          <cylinderGeometry args={[0.082, 0.095, 0.025, 28]} />
        </mesh>
      )}

      {/* ── TIE ── */}
      {garments.tie && (
        <group>
          <mesh position={[0, bodyHeight * 0.785, 0.075]} material={tieMat}>
            <boxGeometry args={[0.032, 0.025, 0.018]} />
          </mesh>
          <mesh position={[0, bodyHeight * 0.65, 0.095]} material={tieMat}>
            <boxGeometry args={[0.04, bodyHeight * 0.24, 0.008]} />
          </mesh>
          <mesh position={[0, bodyHeight * 0.525, 0.095]} rotation={[0, 0, Math.PI / 4]} material={tieMat}>
            <boxGeometry args={[0.03, 0.03, 0.008]} />
          </mesh>
        </group>
      )}

      {/* ── JACKET ── */}
      {garments.jacket && (
        <>
          <mesh
            geometry={jacketGeo}
            material={suitMat}
            scale={[1, bodyHeight * 0.49, 1]}
            position={[0, bodyHeight * 0.79, 0]}
            castShadow
          />
          {/* Lapels */}
          {[-1, 1].map((side) => (
            <mesh
              key={`lapel${side}`}
              position={[side * 0.055 * styleConfig.lapelMult, bodyHeight * 0.73, 0.20]}
              rotation={[0.08, side * 0.18, side * 0.12]}
              material={suitMat} castShadow
            >
              <boxGeometry args={[0.075 * styleConfig.lapelMult, bodyHeight * 0.12, 0.010]} />
            </mesh>
          ))}
          {/* Front placket */}
          <mesh position={[0, bodyHeight * 0.65, 0.20]}>
            <boxGeometry args={[0.018, bodyHeight * 0.22, 0.008]} />
            <meshPhysicalMaterial color={color} roughness={fabricProps.roughness - 0.05} metalness={fabricProps.metalness} />
          </mesh>
          {/* Pocket welt */}
          <mesh position={[-0.08, bodyHeight * 0.70, 0.19]} material={suitMat}>
            <boxGeometry args={[0.08, 0.005, 0.012]} />
          </mesh>
          {/* Back vent */}
          <mesh position={[0, bodyHeight * 0.56, -0.19]}>
            <boxGeometry args={[0.002, bodyHeight * 0.10, 0.006]} />
            <meshPhysicalMaterial color={color} roughness={0.55} />
          </mesh>
        </>
      )}

      {/* ── SHIRT (if no jacket) ── */}
      {!garments.jacket && garments.shirt && (
        <mesh
          geometry={jacketGeo}
          material={shirtMat}
          scale={[0.97, bodyHeight * 0.48, 0.97]}
          position={[0, bodyHeight * 0.79, 0]}
          castShadow
        />
      )}

      {/* ── VEST ── */}
      {garments.vest && (
        <mesh position={[0, bodyHeight * 0.67, 0.005]} material={vestMat} castShadow>
          <boxGeometry args={[0.30 * cs, bodyHeight * 0.14, 0.17 * cs]} />
        </mesh>
      )}

      {/* ── BUTTONS ── */}
      {garments.jacket && styleConfig.buttonCount > 0 &&
        Array.from({ length: Math.min(styleConfig.buttonCount, 3) }).map((_, i) => {
          const isDouble = styleConfig.id === "doublebreasted";
          const yBtn = bodyHeight * (0.68 - i * 0.05);
          return (
            <group key={`btn${i}`}>
              <mesh position={[isDouble ? -0.03 : 0, yBtn, 0.21]} material={buttonMat} castShadow>
                <cylinderGeometry args={[0.012, 0.012, 0.005, 16]} />
              </mesh>
              {isDouble && (
                <mesh position={[0.03, yBtn, 0.21]} material={buttonMat} castShadow>
                  <cylinderGeometry args={[0.012, 0.012, 0.005, 16]} />
                </mesh>
              )}
            </group>
          );
        })
      }

      {/* ── ARMS ── */}
      {[-1, 1].map((side) => {
        const armMat = garments.jacket ? suitMat : garments.shirt ? shirtMat : skinMat;
        const armLen = bodyHeight * 0.38;
        return (
          <group key={`arm${side}`}>
            {/* Full arm — skin always, then sleeve overlay */}
            <mesh
              geometry={armGeo}
              material={skinMat}
              position={[side * 0.23 * sw, bodyHeight * 0.76, 0]}
              rotation={[0, 0, side * 0.07]}
              scale={[1, armLen, 1]}
              castShadow
            />
            {/* Sleeve overlay */}
            {(garments.jacket || garments.shirt) && (
              <mesh
                geometry={sleeveGeo}
                material={garments.jacket ? suitMat : shirtMat}
                position={[side * 0.23 * sw, bodyHeight * 0.76, 0]}
                rotation={[0, 0, side * 0.07]}
                scale={[1, armLen, 1]}
                castShadow
              />
            )}
            {/* Jacket cuff buttons */}
            {garments.jacket && [0, 1].map((bi) => (
              <mesh key={bi} position={[side * (0.26 * sw), bodyHeight * 0.44 + bi * 0.018, 0.03]} material={buttonMat}>
                <cylinderGeometry args={[0.007, 0.007, 0.004, 10]} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* ── BELT ── */}
      {garments.belt && (
        <>
          <mesh position={[0, bodyHeight * 0.455, 0]} material={beltMat}>
            <cylinderGeometry args={[0.175 * ws, 0.172 * ws, 0.022, 36]} />
          </mesh>
          <mesh position={[0, bodyHeight * 0.455, 0.175 * ws]}>
            <boxGeometry args={[0.028, 0.020, 0.005]} />
            <meshPhysicalMaterial color="#b8a88a" roughness={0.18} metalness={0.75} />
          </mesh>
        </>
      )}

      {/* ── TROUSERS ── */}
      {garments.trousers && [-1, 1].map((side) => (
        <group key={`trouser${side}`}>
          <mesh
            geometry={trouserLegGeo}
            material={trouserMat}
            position={[side * 0.065, bodyHeight * 0.46, 0]}
            scale={[hs, bodyHeight * 0.28, 1]}
            castShadow
          />
          {/* Crease */}
          <mesh position={[side * 0.065, bodyHeight * 0.30, 0.06]}>
            <boxGeometry args={[0.002, bodyHeight * 0.22, 0.002]} />
            <meshPhysicalMaterial color={color} roughness={0.5} metalness={0.02} />
          </mesh>
        </group>
      ))}

      {/* ── SHOES ── */}
      {garments.shoes && [-1, 1].map((side) => (
        <group key={`shoe${side}`} position={[side * 0.07, bodyHeight * 0.02, -0.02]}>
          <mesh geometry={shoeGeo} material={shoeMat} rotation={[-Math.PI / 2, 0, 0]} scale={[side, 1, 1]} castShadow />
          {/* Sole */}
          <mesh position={[0, -0.008, 0.04]}>
            <boxGeometry args={[0.10, 0.012, 0.22]} />
            <meshPhysicalMaterial color="#0a0a0a" roughness={0.95} />
          </mesh>
          {/* Heel */}
          <mesh position={[0, -0.015, -0.06]}>
            <boxGeometry args={[0.08, 0.02, 0.04]} />
            <meshPhysicalMaterial color="#0a0a0a" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
