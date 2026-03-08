import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { StyleOption, GarmentVisibility, BodyMeasurements } from "@/types/customize";
import { measurementsToMorphTargets } from "@/types/customize";

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */

/** Lerp between two elliptical cross-sections along Y, building a smooth skin mesh */
function buildLimbMesh(
  sections: { y: number; rx: number; rz: number; cx?: number; cz?: number }[],
  radialSegs = 24,
  smooth = true
): THREE.BufferGeometry {
  const verts: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const rows = sections.length;
  for (let i = 0; i < rows; i++) {
    const s = sections[i];
    const cx = s.cx ?? 0;
    const cz = s.cz ?? 0;
    const v = i / (rows - 1);
    for (let j = 0; j <= radialSegs; j++) {
      const u = j / radialSegs;
      const theta = u * Math.PI * 2;
      const x = cx + Math.cos(theta) * s.rx;
      const z = cz + Math.sin(theta) * s.rz;
      verts.push(x, s.y, z);
      uvs.push(u, v);
      // approximate normal
      normals.push(Math.cos(theta), 0, Math.sin(theta));
    }
  }

  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * (radialSegs + 1) + j;
      const b = a + radialSegs + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  if (smooth) geo.computeVertexNormals();
  return geo;
}

/** Interpolate extra sections between defined ones for smoothness */
function interpolateSections(
  sections: { y: number; rx: number; rz: number; cx?: number; cz?: number }[],
  subdivisions = 3
) {
  const result: typeof sections = [];
  for (let i = 0; i < sections.length - 1; i++) {
    const a = sections[i];
    const b = sections[i + 1];
    for (let t = 0; t < subdivisions; t++) {
      const f = t / subdivisions;
      // Smooth interpolation using cosine
      const sf = 0.5 - 0.5 * Math.cos(f * Math.PI);
      result.push({
        y: a.y + (b.y - a.y) * sf,
        rx: a.rx + (b.rx - a.rx) * sf,
        rz: a.rz + (b.rz - a.rz) * sf,
        cx: (a.cx ?? 0) + ((b.cx ?? 0) - (a.cx ?? 0)) * sf,
        cz: (a.cz ?? 0) + ((b.cz ?? 0) - (a.cz ?? 0)) * sf,
      });
    }
  }
  result.push(sections[sections.length - 1]);
  return result;
}

/* ─────────────────────────────────────────────
   Fabric bump texture (canvas-based)
   ───────────────────────────────────────────── */
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
    } else if (fabricId.includes("linen")) {
      for (let y = 0; y < s; y += 3) { const v = 118 + Math.random() * 18; x.strokeStyle = `rgb(${v},${v},${v})`; x.lineWidth = 1; x.beginPath(); x.moveTo(0, y); x.lineTo(s, y); x.stroke(); }
    } else if (fabricId === "silk-blend") {
      for (let y = 0; y < s; y++) { const v = 128 + Math.sin(y * 0.08) * 5; x.strokeStyle = `rgb(${v},${v},${v})`; x.lineWidth = 0.4; x.beginPath(); x.moveTo(0, y); x.lineTo(s, y); x.stroke(); }
    } else {
      for (let y = 0; y < s; y += 2) for (let i = 0; i < s; i += 2) { const v = 125 + Math.random() * 8; x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(i, y, 2, 2); }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, 10);
    return tex;
  }, [fabricId]);
}

/* ─────────────────────────────────────────────
   Body part geometry builders
   ───────────────────────────────────────────── */

function createTorso(cs: number, ws: number, hs: number, sw: number) {
  const sections = interpolateSections([
    // Neck base
    { y: 1.42, rx: 0.06, rz: 0.055 },
    // Trapezius
    { y: 1.38, rx: 0.10, rz: 0.07 },
    // Shoulders
    { y: 1.32, rx: 0.21 * sw, rz: 0.11 },
    // Upper chest
    { y: 1.25, rx: 0.19 * cs, rz: 0.115 * cs },
    // Chest (widest)
    { y: 1.18, rx: 0.185 * cs, rz: 0.12 * cs },
    // Under bust
    { y: 1.10, rx: 0.17 * cs, rz: 0.11 * cs },
    // Ribcage
    { y: 1.02, rx: 0.155 * ws, rz: 0.10 * ws },
    // Natural waist (narrowest)
    { y: 0.94, rx: 0.135 * ws, rz: 0.09 * ws },
    // Lower waist
    { y: 0.88, rx: 0.145 * hs, rz: 0.095 * hs },
    // Iliac crest
    { y: 0.82, rx: 0.17 * hs, rz: 0.11 * hs },
    // Hip widest
    { y: 0.76, rx: 0.19 * hs, rz: 0.12 * hs },
    // Lower hip
    { y: 0.70, rx: 0.185 * hs, rz: 0.115 * hs },
    // Crotch line
    { y: 0.64, rx: 0.16, rz: 0.10 },
  ], 4);
  return buildLimbMesh(sections, 36);
}

function createHead() {
  const sections = interpolateSections([
    // Crown
    { y: 1.72, rx: 0.005, rz: 0.005 },
    { y: 1.71, rx: 0.08, rz: 0.085 },
    { y: 1.68, rx: 0.095, rz: 0.10 },
    // Forehead
    { y: 1.65, rx: 0.098, rz: 0.105 },
    // Brow
    { y: 1.62, rx: 0.097, rz: 0.10 },
    // Cheekbone
    { y: 1.59, rx: 0.092, rz: 0.09 },
    // Jaw
    { y: 1.55, rx: 0.075, rz: 0.075 },
    // Chin
    { y: 1.52, rx: 0.04, rz: 0.045, cz: 0.01 },
    { y: 1.505, rx: 0.02, rz: 0.025, cz: 0.015 },
  ], 4);
  return buildLimbMesh(sections, 32);
}

function createNeck() {
  const sections = interpolateSections([
    { y: 1.505, rx: 0.035, rz: 0.035 },
    { y: 1.49, rx: 0.045, rz: 0.042 },
    { y: 1.47, rx: 0.05, rz: 0.048 },
    { y: 1.45, rx: 0.055, rz: 0.052 },
    { y: 1.43, rx: 0.06, rz: 0.055 },
  ], 3);
  return buildLimbMesh(sections, 20);
}

function createLeg(side: -1 | 1, hs: number) {
  const hipOffset = side * 0.085;
  const sections = interpolateSections([
    // Upper thigh (connects to hip)
    { y: 0.68, rx: 0.085 * hs, rz: 0.09 * hs, cx: hipOffset },
    { y: 0.64, rx: 0.082, rz: 0.085, cx: hipOffset },
    { y: 0.58, rx: 0.078, rz: 0.08, cx: hipOffset * 0.9 },
    // Mid thigh
    { y: 0.52, rx: 0.072, rz: 0.074, cx: hipOffset * 0.8 },
    { y: 0.46, rx: 0.065, rz: 0.067, cx: hipOffset * 0.7 },
    // Above knee
    { y: 0.40, rx: 0.055, rz: 0.058, cx: hipOffset * 0.65 },
    // Knee
    { y: 0.36, rx: 0.050, rz: 0.055, cx: hipOffset * 0.6 },
    { y: 0.34, rx: 0.048, rz: 0.053, cx: hipOffset * 0.6 },
    // Below knee
    { y: 0.31, rx: 0.050, rz: 0.052, cx: hipOffset * 0.6 },
    // Calf
    { y: 0.27, rx: 0.052, rz: 0.050, cx: hipOffset * 0.55 },
    { y: 0.22, rx: 0.048, rz: 0.046, cx: hipOffset * 0.5 },
    // Shin
    { y: 0.16, rx: 0.040, rz: 0.038, cx: hipOffset * 0.5 },
    { y: 0.10, rx: 0.034, rz: 0.032, cx: hipOffset * 0.5 },
    // Ankle
    { y: 0.06, rx: 0.030, rz: 0.028, cx: hipOffset * 0.5 },
    { y: 0.04, rx: 0.028, rz: 0.026, cx: hipOffset * 0.5 },
    // Above foot
    { y: 0.02, rx: 0.032, rz: 0.030, cx: hipOffset * 0.5 },
  ], 3);
  return buildLimbMesh(sections, 20);
}

function createFoot(side: -1 | 1) {
  const cx = side * 0.085 * 0.5;
  const sections = interpolateSections([
    { y: 0.025, rx: 0.032, rz: 0.030, cx },
    { y: 0.015, rx: 0.035, rz: 0.045, cx, cz: 0.01 },
    { y: 0.005, rx: 0.038, rz: 0.06, cx, cz: 0.02 },
    { y: 0.0, rx: 0.037, rz: 0.065, cx, cz: 0.025 },
    { y: -0.008, rx: 0.030, rz: 0.055, cx, cz: 0.03 },
    { y: -0.015, rx: 0.015, rz: 0.04, cx, cz: 0.035 },
  ], 3);
  return buildLimbMesh(sections, 16);
}

function createArm(side: -1 | 1, sw: number, armScale: number) {
  const shoulderX = side * 0.22 * sw;
  const sections = interpolateSections([
    // Shoulder cap
    { y: 1.33, rx: 0.052, rz: 0.048, cx: shoulderX },
    // Deltoid
    { y: 1.28, rx: 0.050, rz: 0.046, cx: shoulderX * 1.02 },
    // Upper arm
    { y: 1.22, rx: 0.045, rz: 0.042, cx: shoulderX * 1.03 },
    // Bicep
    { y: 1.14, rx: 0.042, rz: 0.040, cx: shoulderX * 1.04 },
    { y: 1.06, rx: 0.038, rz: 0.036, cx: shoulderX * 1.04 },
    // Elbow
    { y: 0.98, rx: 0.033, rz: 0.032, cx: shoulderX * 1.03 },
    { y: 0.94, rx: 0.031, rz: 0.030, cx: shoulderX * 1.02 },
    // Forearm
    { y: 0.88, rx: 0.034, rz: 0.032, cx: shoulderX * 1.01 },
    { y: 0.80, rx: 0.030, rz: 0.028, cx: shoulderX },
    { y: 0.72, rx: 0.026, rz: 0.024, cx: shoulderX * 0.98 },
    // Wrist
    { y: 0.66, rx: 0.022, rz: 0.018, cx: shoulderX * 0.96 },
    // Hand
    { y: 0.62, rx: 0.028 * armScale, rz: 0.012 * armScale, cx: shoulderX * 0.95 },
    { y: 0.58, rx: 0.026 * armScale, rz: 0.010 * armScale, cx: shoulderX * 0.94 },
    { y: 0.55, rx: 0.018 * armScale, rz: 0.008 * armScale, cx: shoulderX * 0.93 },
    { y: 0.53, rx: 0.005, rz: 0.004, cx: shoulderX * 0.92 },
  ], 3);
  return buildLimbMesh(sections, 16);
}

/* ─────────────────────────────────────────────
   Garment geometry builders
   ───────────────────────────────────────────── */

function createJacketTorso(cs: number, ws: number, hs: number, sw: number) {
  const o = 0.016; // offset from body
  const sections = interpolateSections([
    { y: 1.40, rx: 0.065 + o, rz: 0.06 + o },
    { y: 1.34, rx: 0.22 * sw + o, rz: 0.12 + o },
    { y: 1.26, rx: 0.20 * cs + o, rz: 0.125 * cs + o },
    { y: 1.18, rx: 0.195 * cs + o, rz: 0.13 * cs + o },
    { y: 1.10, rx: 0.18 * cs + o, rz: 0.12 * cs + o },
    { y: 1.02, rx: 0.165 * ws + o, rz: 0.11 * ws + o },
    { y: 0.94, rx: 0.145 * ws + o, rz: 0.10 * ws + o },
    { y: 0.88, rx: 0.155 * hs + o, rz: 0.105 * hs + o },
    { y: 0.82, rx: 0.18 * hs + o, rz: 0.12 * hs + o },
    { y: 0.76, rx: 0.20 * hs + o, rz: 0.13 * hs + o },
    { y: 0.70, rx: 0.195 * hs + o, rz: 0.125 * hs + o },
    { y: 0.65, rx: 0.17 + o, rz: 0.11 + o },
  ], 4);
  return buildLimbMesh(sections, 36);
}

function createTrouserLeg(side: -1 | 1, hs: number) {
  const o = 0.006;
  const hipOff = side * 0.085;
  const sections = interpolateSections([
    { y: 0.70, rx: 0.09 * hs + o, rz: 0.095 * hs + o, cx: hipOff },
    { y: 0.64, rx: 0.086 + o, rz: 0.089 + o, cx: hipOff },
    { y: 0.56, rx: 0.080 + o, rz: 0.082 + o, cx: hipOff * 0.85 },
    { y: 0.48, rx: 0.070 + o, rz: 0.072 + o, cx: hipOff * 0.72 },
    { y: 0.40, rx: 0.060 + o, rz: 0.063 + o, cx: hipOff * 0.65 },
    { y: 0.34, rx: 0.054 + o, rz: 0.058 + o, cx: hipOff * 0.6 },
    { y: 0.28, rx: 0.056 + o, rz: 0.054 + o, cx: hipOff * 0.55 },
    { y: 0.20, rx: 0.050 + o, rz: 0.048 + o, cx: hipOff * 0.5 },
    { y: 0.12, rx: 0.042 + o, rz: 0.040 + o, cx: hipOff * 0.5 },
    { y: 0.06, rx: 0.036 + o, rz: 0.034 + o, cx: hipOff * 0.5 },
  ], 3);
  return buildLimbMesh(sections, 20);
}

function createSleeve(side: -1 | 1, sw: number) {
  const o = 0.010;
  const sx = side * 0.22 * sw;
  const sections = interpolateSections([
    { y: 1.34, rx: 0.056 + o, rz: 0.052 + o, cx: sx },
    { y: 1.28, rx: 0.054 + o, rz: 0.050 + o, cx: sx * 1.02 },
    { y: 1.20, rx: 0.049 + o, rz: 0.046 + o, cx: sx * 1.03 },
    { y: 1.12, rx: 0.046 + o, rz: 0.044 + o, cx: sx * 1.04 },
    { y: 1.04, rx: 0.042 + o, rz: 0.040 + o, cx: sx * 1.04 },
    { y: 0.96, rx: 0.037 + o, rz: 0.036 + o, cx: sx * 1.03 },
    { y: 0.90, rx: 0.038 + o, rz: 0.036 + o, cx: sx * 1.01 },
    { y: 0.82, rx: 0.034 + o, rz: 0.032 + o, cx: sx },
    { y: 0.74, rx: 0.030 + o, rz: 0.028 + o, cx: sx * 0.98 },
    { y: 0.68, rx: 0.026 + o, rz: 0.022 + o, cx: sx * 0.96 },
  ], 3);
  return buildLimbMesh(sections, 16);
}

/* ─────────────────────────────────────────────
   Shoe geometry
   ───────────────────────────────────────────── */
function createShoeGeo(side: -1 | 1) {
  const cx = side * 0.085 * 0.5;
  const sections = interpolateSections([
    { y: 0.06, rx: 0.035, rz: 0.035, cx },
    { y: 0.04, rx: 0.038, rz: 0.050, cx, cz: 0.005 },
    { y: 0.025, rx: 0.042, rz: 0.065, cx, cz: 0.015 },
    { y: 0.012, rx: 0.044, rz: 0.075, cx, cz: 0.025 },
    { y: 0.0, rx: 0.043, rz: 0.080, cx, cz: 0.03 },
    { y: -0.012, rx: 0.040, rz: 0.075, cx, cz: 0.035 },
    { y: -0.022, rx: 0.025, rz: 0.055, cx, cz: 0.035 },
  ], 3);
  return buildLimbMesh(sections, 16);
}

/* ─────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────── */

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
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.04;
    }
  });

  // ── Materials ──
  const skinMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#d4a986",
    roughness: 0.5,
    metalness: 0.0,
    clearcoat: 0.12,
    clearcoatRoughness: 0.6,
    sheen: 0.2,
    sheenColor: new THREE.Color("#e8c4a0"),
    sheenRoughness: 0.4,
    envMapIntensity: 0.5,
  }), []);

  const suitMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: fabricProps.roughness,
    metalness: fabricProps.metalness,
    bumpMap, bumpScale: fabricProps.bumpScale,
    clearcoat: fabricId === "silk-blend" ? 0.15 : 0.03,
    clearcoatRoughness: 0.85,
    sheen: fabricId === "velvet" ? 0.6 : fabricId === "cashmere" ? 0.4 : 0.1,
    sheenColor: new THREE.Color(color).offsetHSL(0, -0.1, 0.15),
    sheenRoughness: 0.55,
    envMapIntensity: 0.4,
  }), [color, fabricProps, bumpMap, fabricId]);

  const trouserMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color).offsetHSL(0, 0, -0.03),
    roughness: fabricProps.roughness + 0.02,
    metalness: fabricProps.metalness,
    bumpMap, bumpScale: fabricProps.bumpScale * 0.8,
    envMapIntensity: 0.35,
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
  const armS = morph.armScale;

  // ── Geometries ──
  const headGeo = useMemo(() => createHead(), []);
  const neckGeo = useMemo(() => createNeck(), []);
  const torsoGeo = useMemo(() => createTorso(cs, ws, hs, sw), [cs, ws, hs, sw]);
  const leftLegGeo = useMemo(() => createLeg(-1, hs), [hs]);
  const rightLegGeo = useMemo(() => createLeg(1, hs), [hs]);
  const leftFootGeo = useMemo(() => createFoot(-1), []);
  const rightFootGeo = useMemo(() => createFoot(1), []);
  const leftArmGeo = useMemo(() => createArm(-1, sw, armS), [sw, armS]);
  const rightArmGeo = useMemo(() => createArm(1, sw, armS), [sw, armS]);

  // Garment geos
  const jacketGeo = useMemo(() => createJacketTorso(cs, ws, hs, sw), [cs, ws, hs, sw]);
  const leftTrouserGeo = useMemo(() => createTrouserLeg(-1, hs), [hs]);
  const rightTrouserGeo = useMemo(() => createTrouserLeg(1, hs), [hs]);
  const leftSleeveGeo = useMemo(() => createSleeve(-1, sw), [sw]);
  const rightSleeveGeo = useMemo(() => createSleeve(1, sw), [sw]);
  const leftShoeGeo = useMemo(() => createShoeGeo(-1), []);
  const rightShoeGeo = useMemo(() => createShoeGeo(1), []);

  const scale = morph.heightScale;

  return (
    <group ref={group} scale={[scale, scale, scale]} position={[0, -0.85 * scale, 0]}>
      {/* ── BODY ── */}
      <mesh geometry={headGeo} material={skinMat} castShadow />
      <mesh geometry={neckGeo} material={skinMat} castShadow />
      <mesh geometry={torsoGeo} material={skinMat} castShadow receiveShadow />
      <mesh geometry={leftLegGeo} material={skinMat} castShadow />
      <mesh geometry={rightLegGeo} material={skinMat} castShadow />
      <mesh geometry={leftFootGeo} material={skinMat} />
      <mesh geometry={rightFootGeo} material={skinMat} />
      <mesh geometry={leftArmGeo} material={skinMat} castShadow />
      <mesh geometry={rightArmGeo} material={skinMat} castShadow />

      {/* Hair cap */}
      <mesh position={[0, 1.70, -0.005]} material={hairMat}>
        <sphereGeometry args={[0.10, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      </mesh>

      {/* Ears */}
      {([-1, 1] as const).map((s) => (
        <mesh key={`ear${s}`} position={[s * 0.098, 1.60, -0.01]} rotation={[0, s * 0.3, 0]} material={skinMat}>
          <sphereGeometry args={[0.018, 10, 10]} />
        </mesh>
      ))}

      {/* Eyes */}
      {([-1, 1] as const).map((s) => (
        <group key={`eye${s}`}>
          <mesh position={[s * 0.032, 1.63, 0.085]}>
            <sphereGeometry args={[0.012, 10, 10]} />
            <meshPhysicalMaterial color="#f5f0e8" roughness={0.1} metalness={0} />
          </mesh>
          <mesh position={[s * 0.032, 1.63, 0.094]}>
            <sphereGeometry args={[0.005, 8, 8]} />
            <meshPhysicalMaterial color="#2a1f15" roughness={0.15} metalness={0.05} />
          </mesh>
        </group>
      ))}

      {/* Nose */}
      <mesh position={[0, 1.59, 0.095]} rotation={[0.15, 0, 0]} material={skinMat}>
        <sphereGeometry args={[0.012, 8, 8]} />
      </mesh>

      {/* Lips */}
      <mesh position={[0, 1.565, 0.085]} scale={[1.6, 0.5, 0.5]}>
        <sphereGeometry args={[0.01, 10, 8]} />
        <meshPhysicalMaterial color="#c48a78" roughness={0.35} clearcoat={0.3} />
      </mesh>

      {/* ── SHIRT COLLAR ── */}
      {garments.shirt && (
        <mesh position={[0, 1.41, 0]} material={shirtMat}>
          <cylinderGeometry args={[0.062, 0.068, 0.02, 28]} />
        </mesh>
      )}

      {/* ── TIE ── */}
      {garments.tie && (
        <group>
          <mesh position={[0, 1.40, 0.06]} material={tieMat}>
            <boxGeometry args={[0.025, 0.02, 0.012]} />
          </mesh>
          <mesh position={[0, 1.15, 0.075]} material={tieMat}>
            <boxGeometry args={[0.032, 0.46, 0.006]} />
          </mesh>
          <mesh position={[0, 0.92, 0.075]} rotation={[0, 0, Math.PI / 4]} material={tieMat}>
            <boxGeometry args={[0.025, 0.025, 0.006]} />
          </mesh>
        </group>
      )}

      {/* ── JACKET ── */}
      {garments.jacket && (
        <>
          <mesh geometry={jacketGeo} material={suitMat} castShadow />
          {/* Lapels */}
          {([-1, 1] as const).map((side) => (
            <mesh key={`lapel${side}`}
              position={[side * 0.045 * styleConfig.lapelMult, 1.30, 0.12]}
              rotation={[0.06, side * 0.15, side * 0.1]}
              material={suitMat} castShadow
            >
              <boxGeometry args={[0.06 * styleConfig.lapelMult, 0.15, 0.008]} />
            </mesh>
          ))}
          {/* Pocket welt */}
          <mesh position={[-0.065, 1.06, 0.115]} material={suitMat}>
            <boxGeometry args={[0.06, 0.004, 0.008]} />
          </mesh>
          {/* Sleeves */}
          <mesh geometry={leftSleeveGeo} material={suitMat} castShadow />
          <mesh geometry={rightSleeveGeo} material={suitMat} castShadow />
        </>
      )}

      {/* ── SHIRT (no jacket) ── */}
      {!garments.jacket && garments.shirt && (
        <>
          <mesh geometry={jacketGeo} material={shirtMat} castShadow />
          <mesh geometry={leftSleeveGeo} material={shirtMat} castShadow />
          <mesh geometry={rightSleeveGeo} material={shirtMat} castShadow />
        </>
      )}

      {/* ── VEST ── */}
      {garments.vest && (
        <mesh position={[0, 1.10, 0]} material={vestMat} castShadow>
          <cylinderGeometry args={[0.16 * ws, 0.18 * cs, 0.30, 28]} />
        </mesh>
      )}

      {/* ── BUTTONS ── */}
      {garments.jacket && styleConfig.buttonCount > 0 &&
        Array.from({ length: Math.min(styleConfig.buttonCount, 3) }).map((_, i) => {
          const isDouble = styleConfig.id === "doublebreasted";
          const yBtn = 1.18 - i * 0.08;
          return (
            <group key={`btn${i}`}>
              <mesh position={[isDouble ? -0.025 : 0, yBtn, 0.13]} material={buttonMat} castShadow>
                <cylinderGeometry args={[0.008, 0.008, 0.004, 14]} />
              </mesh>
              {isDouble && (
                <mesh position={[0.025, yBtn, 0.13]} material={buttonMat} castShadow>
                  <cylinderGeometry args={[0.008, 0.008, 0.004, 14]} />
                </mesh>
              )}
            </group>
          );
        })
      }

      {/* ── BELT ── */}
      {garments.belt && (
        <>
          <mesh position={[0, 0.86, 0]} material={beltMat}>
            <cylinderGeometry args={[0.145 * ws, 0.142 * ws, 0.018, 32]} />
          </mesh>
          <mesh position={[0, 0.86, 0.145 * ws]}>
            <boxGeometry args={[0.022, 0.016, 0.004]} />
            <meshPhysicalMaterial color="#b8a88a" roughness={0.18} metalness={0.75} />
          </mesh>
        </>
      )}

      {/* ── TROUSERS ── */}
      {garments.trousers && (
        <>
          <mesh geometry={leftTrouserGeo} material={trouserMat} castShadow />
          <mesh geometry={rightTrouserGeo} material={trouserMat} castShadow />
        </>
      )}

      {/* ── SHOES ── */}
      {garments.shoes && (
        <>
          <mesh geometry={leftShoeGeo} material={shoeMat} castShadow />
          <mesh geometry={rightShoeGeo} material={shoeMat} castShadow />
        </>
      )}
    </group>
  );
}
