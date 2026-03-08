import { useRef, useMemo, useCallback, forwardRef, useImperativeHandle } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { StyleOption, GarmentVisibility, BodyMeasurements } from "@/types/customize";
import { measurementsToMorphTargets } from "@/types/customize";

// ── Fabric bump texture generator ──
function useFabricTexture(fabricId: string) {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, size, size);

    if (fabricId.includes("wool") || fabricId === "tweed" || fabricId === "merino-wool") {
      for (let y = 0; y < size; y += 3) {
        for (let x = 0; x < size; x += 3) {
          const v = 120 + Math.random() * 16;
          ctx.fillStyle = `rgb(${v},${v},${v})`;
          ctx.fillRect(x, y, 2, 2);
        }
        if (y % 6 === 0) {
          ctx.strokeStyle = `rgba(100,100,100,0.3)`;
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y + size * 0.5); ctx.stroke();
        }
      }
    } else if (fabricId.includes("linen")) {
      for (let y = 0; y < size; y += 4) {
        const v = 118 + Math.random() * 20;
        ctx.strokeStyle = `rgb(${v},${v},${v})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y + (Math.random() - 0.5) * 2); ctx.stroke();
      }
      for (let x = 0; x < size; x += 5) {
        const v = 118 + Math.random() * 20;
        ctx.strokeStyle = `rgb(${v},${v},${v})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (Math.random() - 0.5) * 2, size); ctx.stroke();
      }
    } else if (fabricId === "velvet") {
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          const v = 124 + Math.random() * 6;
          ctx.fillStyle = `rgb(${v},${v},${v})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    } else if (fabricId === "silk-blend") {
      ctx.fillStyle = "#828282";
      ctx.fillRect(0, 0, size, size);
      for (let y = 0; y < size; y += 2) {
        const v = 128 + Math.sin(y * 0.1) * 4;
        ctx.strokeStyle = `rgb(${v},${v},${v})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y); ctx.stroke();
      }
    } else {
      for (let y = 0; y < size; y += 2) {
        for (let x = 0; x < size; x += 2) {
          const v = 125 + Math.random() * 8;
          ctx.fillStyle = `rgb(${v},${v},${v})`;
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return tex;
  }, [fabricId]);
}

// ── Create smooth lathe profile from points ──
function smoothLatheProfile(pts: [number, number][], segments = 32): THREE.Vector2[] {
  if (pts.length < 2) return pts.map(([x, y]) => new THREE.Vector2(x, y));
  const curve = new THREE.SplineCurve(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  return curve.getPoints(segments);
}

// ── Realistic body part geometries ──
function createTorsoGeometry(cs: number, ws: number, hs: number, sw: number) {
  // Female torso profile: shoulders → chest → waist → hips
  const pts: [number, number][] = [
    [0.03, 0],           // neck base center
    [0.10, 0.02],        // neck base
    [0.19 * sw, 0.06],   // shoulder transition
    [0.24 * sw, 0.10],   // shoulder
    [0.22 * cs, 0.18],   // upper chest
    [0.21 * cs, 0.25],   // chest
    [0.19 * cs, 0.32],   // under chest
    [0.16 * ws, 0.40],   // waist
    [0.15 * ws, 0.44],   // natural waist
    [0.17 * hs, 0.50],   // above hip
    [0.21 * hs, 0.56],   // hip
    [0.22 * hs, 0.60],   // widest hip
    [0.21 * hs, 0.64],   // lower hip
    [0.18 * hs, 0.68],   // hip bottom
    [0.15, 0.70],        // pelvis top
  ];
  const profile = smoothLatheProfile(pts, 48);
  return new THREE.LatheGeometry(profile, 64);
}

function createUpperLegGeometry() {
  const pts: [number, number][] = [
    [0.12, 0],      // top
    [0.115, 0.05],
    [0.11, 0.15],
    [0.10, 0.25],
    [0.09, 0.35],
    [0.08, 0.42],
    [0.075, 0.50],  // knee area
  ];
  const profile = smoothLatheProfile(pts, 32);
  return new THREE.LatheGeometry(profile, 32);
}

function createLowerLegGeometry() {
  const pts: [number, number][] = [
    [0.07, 0],      // below knee
    [0.072, 0.05],  // calf
    [0.075, 0.12],  // widest calf
    [0.068, 0.25],
    [0.055, 0.38],
    [0.045, 0.46],  // ankle
    [0.042, 0.50],  // ankle bottom
  ];
  const profile = smoothLatheProfile(pts, 32);
  return new THREE.LatheGeometry(profile, 32);
}

function createUpperArmGeometry() {
  const pts: [number, number][] = [
    [0.065, 0],     // shoulder cap
    [0.07, 0.05],
    [0.068, 0.12],  // deltoid
    [0.06, 0.25],   // bicep
    [0.055, 0.35],
    [0.048, 0.42],
    [0.045, 0.50],  // elbow
  ];
  const profile = smoothLatheProfile(pts, 24);
  return new THREE.LatheGeometry(profile, 24);
}

function createLowerArmGeometry() {
  const pts: [number, number][] = [
    [0.045, 0],     // elbow
    [0.048, 0.05],  // forearm
    [0.046, 0.15],
    [0.04, 0.28],
    [0.035, 0.38],
    [0.03, 0.45],   // wrist
    [0.028, 0.50],
  ];
  const profile = smoothLatheProfile(pts, 24);
  return new THREE.LatheGeometry(profile, 24);
}

function createHeadGeometry() {
  // Egg-shaped head
  const pts: [number, number][] = [
    [0.0, 0],       // top of head
    [0.08, 0.04],
    [0.14, 0.10],
    [0.17, 0.18],   // widest forehead
    [0.16, 0.28],   // temple
    [0.15, 0.35],   // cheekbone
    [0.14, 0.42],   // jaw
    [0.11, 0.48],
    [0.07, 0.52],   // chin
    [0.02, 0.55],
    [0.0, 0.56],    // chin tip
  ];
  const profile = smoothLatheProfile(pts, 36);
  return new THREE.LatheGeometry(profile, 48);
}

function createNeckGeometry() {
  const pts: [number, number][] = [
    [0.07, 0],
    [0.075, 0.15],
    [0.08, 0.4],
    [0.09, 0.7],
    [0.10, 1.0],
  ];
  const profile = smoothLatheProfile(pts, 16);
  return new THREE.LatheGeometry(profile, 24);
}

function createFootGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0.06, 0);
  shape.quadraticCurveTo(0.10, 0.01, 0.12, 0.04);
  shape.lineTo(0.12, 0.05);
  shape.quadraticCurveTo(0.10, 0.06, 0.06, 0.065);
  shape.lineTo(-0.04, 0.065);
  shape.quadraticCurveTo(-0.06, 0.06, -0.06, 0.04);
  shape.lineTo(-0.06, 0.02);
  shape.quadraticCurveTo(-0.06, 0, 0, 0);

  const extrudeSettings = { depth: 0.20, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 6 };
  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

function createHandGeometry() {
  const pts: [number, number][] = [
    [0.005, 0],
    [0.025, 0.03],
    [0.032, 0.06],
    [0.03, 0.09],
    [0.025, 0.11],
    [0.015, 0.12],
    [0.005, 0.12],
  ];
  const profile = smoothLatheProfile(pts, 12);
  return new THREE.LatheGeometry(profile, 16);
}

// ── Export handle ──
export interface MannequinHandle {
  exportScene: () => THREE.Group | null;
}

interface MannequinProps {
  color: string;
  fabricId: string;
  fabricProps: { roughness: number; metalness: number; bumpScale: number };
  styleConfig: StyleOption;
  garments: GarmentVisibility;
  bodyMeasurements: BodyMeasurements | null;
}

const Mannequin3D = forwardRef<MannequinHandle, MannequinProps>(({
  color, fabricId, fabricProps, styleConfig, garments, bodyMeasurements,
}, ref) => {
  const group = useRef<THREE.Group>(null);
  const bumpMap = useFabricTexture(fabricId);

  const morph = useMemo(() => {
    if (!bodyMeasurements) return { heightScale: 1, chestScale: 1, waistScale: 1, hipScale: 1, shoulderScale: 1, legScale: 1, armScale: 1 };
    return measurementsToMorphTargets(bodyMeasurements);
  }, [bodyMeasurements]);

  useImperativeHandle(ref, () => ({
    exportScene: () => group.current,
  }));

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.08;
    }
  });

  // ── Materials ──
  const skinMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#d4a986",
    roughness: 0.55,
    metalness: 0,
    clearcoat: 0.12,
    clearcoatRoughness: 0.6,
    sheen: 0.15,
    sheenColor: new THREE.Color("#e8c4a0"),
    sheenRoughness: 0.4,
  }), []);

  const suitMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: fabricProps.roughness,
    metalness: fabricProps.metalness,
    bumpMap, bumpScale: fabricProps.bumpScale,
    clearcoat: fabricId.includes("wool") ? 0.05 : fabricId === "silk-blend" ? 0.15 : 0,
    clearcoatRoughness: 0.9,
    sheen: fabricId === "cashmere" ? 0.4 : fabricId === "velvet" ? 0.6 : fabricId.includes("wool") ? 0.15 : 0,
    sheenColor: new THREE.Color(color).offsetHSL(0, -0.1, 0.15),
    sheenRoughness: 0.6,
  }), [color, fabricProps, bumpMap, fabricId]);

  const trouserMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color).offsetHSL(0, 0, -0.03),
    roughness: fabricProps.roughness + 0.02,
    metalness: fabricProps.metalness,
    bumpMap, bumpScale: fabricProps.bumpScale * 0.8,
  }), [color, fabricProps, bumpMap]);

  const shirtMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#f0ebe3", roughness: 0.8, metalness: 0 }), []);
  const shoeMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#1a1410", roughness: 0.25, metalness: 0.08, clearcoat: 0.3, clearcoatRoughness: 0.4 }), []);
  const buttonMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#6b5d4f", roughness: 0.4, metalness: 0.15, clearcoat: 0.2 }), []);
  const vestMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color).offsetHSL(0, 0.05, 0.05),
    roughness: fabricProps.roughness - 0.05, metalness: fabricProps.metalness + 0.02, bumpMap, bumpScale: fabricProps.bumpScale * 0.6,
  }), [color, fabricProps, bumpMap]);
  const tieMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#5c1a2a", roughness: 0.4, metalness: 0.05 }), []);
  const beltMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#1a1410", roughness: 0.35, metalness: 0.1, clearcoat: 0.2 }), []);

  // ── Geometries ──
  const sw = styleConfig.shoulderMult * morph.shoulderScale;
  const cs = morph.chestScale;
  const ws = morph.waistScale;
  const hs = morph.hipScale;
  const heightS = morph.heightScale;
  const legS = morph.legScale;
  const armS = morph.armScale;

  const torsoGeo = useMemo(() => createTorsoGeometry(cs, ws, hs, sw), [cs, ws, hs, sw]);
  const headGeo = useMemo(() => createHeadGeometry(), []);
  const neckGeo = useMemo(() => createNeckGeometry(), []);
  const upperLegGeo = useMemo(() => createUpperLegGeometry(), []);
  const lowerLegGeo = useMemo(() => createLowerLegGeometry(), []);
  const upperArmGeo = useMemo(() => createUpperArmGeometry(), []);
  const lowerArmGeo = useMemo(() => createLowerArmGeometry(), []);
  const footGeo = useMemo(() => createFootGeometry(), []);
  const handGeo = useMemo(() => createHandGeometry(), []);

  const yBase = -1.65 * heightS;

  return (
    <group ref={group} position={[0, yBase, 0]} scale={[1, heightS, 1]}>
      {/* ── HEAD ── */}
      <mesh geometry={headGeo} material={skinMat} position={[0, 3.42, 0]} castShadow />
      {/* Ears */}
      {[-1, 1].map((s) => (
        <mesh key={`ear-${s}`} position={[s * 0.16, 3.28, 0]} rotation={[0, s * 0.3, 0]} material={skinMat}>
          <sphereGeometry args={[0.035, 12, 12]} />
        </mesh>
      ))}
      {/* Nose */}
      <mesh position={[0, 3.22, 0.16]} material={skinMat}>
        <coneGeometry args={[0.02, 0.04, 8]} />
      </mesh>

      {/* ── NECK ── */}
      <mesh geometry={neckGeo} material={skinMat} position={[0, 2.92, 0]} scale={[1, 0.22, 1]} castShadow />

      {/* ── COLLAR (shirt) ── */}
      {garments.shirt && (
        <mesh position={[0, 2.94, 0]} material={shirtMat}>
          <cylinderGeometry args={[0.11, 0.13, 0.06, 24]} />
        </mesh>
      )}

      {/* ── TIE ── */}
      {garments.tie && (
        <group>
          <mesh position={[0, 2.88, 0.16]} material={tieMat}>
            <boxGeometry args={[0.04, 0.04, 0.025]} />
          </mesh>
          <mesh position={[0, 2.52, 0.21]} material={tieMat}>
            <boxGeometry args={[0.05, 0.7, 0.01]} />
          </mesh>
          <mesh position={[0, 2.15, 0.21]} rotation={[0, 0, Math.PI / 4]} material={tieMat}>
            <boxGeometry args={[0.04, 0.04, 0.01]} />
          </mesh>
        </group>
      )}

      {/* ── TORSO ── */}
      <mesh
        geometry={torsoGeo}
        material={garments.jacket ? suitMat : garments.shirt ? shirtMat : skinMat}
        position={[0, 2.22, 0]}
        castShadow
      />

      {/* ── VEST ── */}
      {garments.vest && (
        <mesh position={[0, 2.40, 0.01]} material={vestMat} castShadow>
          <boxGeometry args={[0.36 * cs, 0.45, 0.20 * cs]} />
        </mesh>
      )}

      {/* ── LAPELS ── */}
      {garments.jacket && [-1, 1].map((side) => (
        <group key={`lapel-${side}`}>
          <mesh
            position={[side * 0.07 * styleConfig.lapelMult, 2.68, 0.21]}
            rotation={[0.1, side * 0.2, side * 0.15]}
            material={suitMat} castShadow
          >
            <boxGeometry args={[0.09 * styleConfig.lapelMult, 0.4, 0.013]} />
          </mesh>
        </group>
      ))}

      {/* ── BUTTONS ── */}
      {garments.jacket && styleConfig.buttonCount > 0 &&
        Array.from({ length: Math.min(styleConfig.buttonCount, 3) }).map((_, i) => {
          const isDouble = styleConfig.id === "doublebreasted";
          const yBtn = 2.50 - i * 0.16;
          return (
            <group key={`btn-${i}`}>
              <mesh position={[isDouble ? -0.04 : 0, yBtn, 0.23]} material={buttonMat} castShadow>
                <cylinderGeometry args={[0.015, 0.015, 0.006, 16]} />
              </mesh>
              {isDouble && (
                <mesh position={[0.04, yBtn, 0.23]} material={buttonMat} castShadow>
                  <cylinderGeometry args={[0.015, 0.015, 0.006, 16]} />
                </mesh>
              )}
            </group>
          );
        })
      }

      {/* ── POCKET WELT ── */}
      {garments.jacket && (
        <mesh position={[-0.10, 2.55, 0.22]} rotation={[0, 0, 0.02]} material={suitMat}>
          <boxGeometry args={[0.10, 0.006, 0.015]} />
        </mesh>
      )}

      {/* ── ARMS ── */}
      {[-1, 1].map((side) => (
        <group key={`arm-${side}`}>
          {/* Upper arm */}
          <mesh
            geometry={upperArmGeo}
            material={garments.jacket ? suitMat : garments.shirt ? shirtMat : skinMat}
            position={[side * 0.26 * sw, 2.68, 0]}
            rotation={[0, 0, side * 0.06]}
            scale={[1, armS * 0.85, 1]}
            castShadow
          />
          {/* Lower arm */}
          <mesh
            geometry={lowerArmGeo}
            material={garments.jacket ? suitMat : garments.shirt ? shirtMat : skinMat}
            position={[side * 0.29 * sw, 2.25, 0]}
            rotation={[0, 0, side * 0.04]}
            scale={[1, armS * 0.85, 1]}
            castShadow
          />
          {/* Sleeve cuff */}
          {garments.jacket && (
            <mesh position={[side * 0.30 * sw, 1.85, 0]} material={suitMat}>
              <cylinderGeometry args={[0.042, 0.038, 0.04, 20]} />
            </mesh>
          )}
          {/* Hand */}
          <mesh
            geometry={handGeo}
            material={skinMat}
            position={[side * 0.31 * sw, 1.72, 0.02]}
            rotation={[0, 0, side * 0.1]}
            scale={[side, 1, 1]}
            castShadow
          />
          {/* Fingers hint */}
          {[0, 1, 2, 3].map((fi) => (
            <mesh key={fi} position={[side * (0.30 * sw + side * (fi - 1.5) * 0.012), 1.62, 0.025 + fi * 0.003]} material={skinMat}>
              <capsuleGeometry args={[0.006, 0.05, 4, 8]} />
            </mesh>
          ))}
          {/* Thumb */}
          <mesh position={[side * (0.28 * sw), 1.68, 0.045]} rotation={[0.4, side * 0.3, 0]} material={skinMat}>
            <capsuleGeometry args={[0.007, 0.035, 4, 8]} />
          </mesh>
        </group>
      ))}

      {/* ── BELT ── */}
      {garments.belt && (
        <>
          <mesh position={[0, 1.87, 0]} material={beltMat}>
            <cylinderGeometry args={[0.20 * ws, 0.19 * ws, 0.035, 32]} />
          </mesh>
          <mesh position={[0, 1.87, 0.20 * ws]}>
            <boxGeometry args={[0.035, 0.03, 0.006]} />
            <meshPhysicalMaterial color="#b8a88a" roughness={0.2} metalness={0.7} />
          </mesh>
        </>
      )}

      {/* ── LEGS ── */}
      {[-1, 1].map((side) => (
        <group key={`leg-${side}`}>
          {/* Upper leg */}
          <mesh
            geometry={upperLegGeo}
            material={garments.trousers ? trouserMat : skinMat}
            position={[side * 0.09, 1.52, 0]}
            scale={[hs, legS * 0.65, 1]}
            castShadow
          />
          {/* Lower leg */}
          <mesh
            geometry={lowerLegGeo}
            material={garments.trousers ? trouserMat : skinMat}
            position={[side * 0.09, 1.12, 0]}
            scale={[1, legS * 0.65, 1]}
            castShadow
          />
          {/* Knee cap */}
          <mesh position={[side * 0.09, 1.18, 0.06]} material={garments.trousers ? trouserMat : skinMat}>
            <sphereGeometry args={[0.04, 16, 16]} />
          </mesh>
          {/* Trouser crease */}
          {garments.trousers && (
            <mesh position={[side * 0.09, 1.10, 0.07]}>
              <boxGeometry args={[0.003, 0.65 * legS, 0.003]} />
              <meshPhysicalMaterial color={color} roughness={0.5} metalness={0.02} />
            </mesh>
          )}
          {/* Ankle */}
          <mesh position={[side * 0.09, 0.78, 0]} material={garments.trousers ? trouserMat : skinMat}>
            <sphereGeometry args={[0.045, 16, 16]} />
          </mesh>

          {/* ── FOOT / SHOE ── */}
          {garments.shoes ? (
            <group position={[side * 0.09, 0.68, -0.01]}>
              <mesh material={shoeMat} castShadow>
                <boxGeometry args={[0.10, 0.07, 0.22]} />
              </mesh>
              <mesh position={[0, -0.005, 0.09]} material={shoeMat}>
                <sphereGeometry args={[0.055, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
              </mesh>
              <mesh position={[0, -0.035, 0]}>
                <boxGeometry args={[0.11, 0.018, 0.24]} />
                <meshPhysicalMaterial color="#0d0d0d" roughness={0.9} />
              </mesh>
              <mesh position={[0, -0.035, -0.08]}>
                <boxGeometry args={[0.09, 0.028, 0.04]} />
                <meshPhysicalMaterial color="#0d0d0d" roughness={0.85} />
              </mesh>
            </group>
          ) : (
            <mesh
              geometry={footGeo}
              material={skinMat}
              position={[side * 0.09 - 0.03, 0.63, -0.08]}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={[side, 1, 1]}
              castShadow
            />
          )}
        </group>
      ))}

      {/* ── JACKET BACK VENT ── */}
      {garments.jacket && (
        <mesh position={[0, 2.08, -0.20]}>
          <boxGeometry args={[0.003, 0.30, 0.008]} />
          <meshPhysicalMaterial color={color} roughness={0.6} />
        </mesh>
      )}

      {/* ── SHOULDER DEFINITION (subtle) ── */}
      {[-1, 1].map((side) => (
        <mesh key={`shoulder-${side}`} position={[side * 0.23 * sw, 2.72, 0]} material={garments.jacket ? suitMat : skinMat}>
          <sphereGeometry args={[0.07, 16, 16]} />
        </mesh>
      ))}

      {/* ── COLLARBONE AREA ── */}
      <mesh position={[0, 2.82, 0.08]} material={garments.shirt ? shirtMat : skinMat} scale={[2.8 * sw, 0.3, 0.5]}>
        <sphereGeometry args={[0.06, 16, 8]} />
      </mesh>
    </group>
  );
});

Mannequin3D.displayName = "Mannequin3D";
export default Mannequin3D;
