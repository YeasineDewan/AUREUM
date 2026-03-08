import { useState, Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Html, RoundedBox } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Palette, Shirt, Layers, RotateCcw, DollarSign, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/hooks/use-toast";
import * as THREE from "three";

const FABRICS = [
  { id: "wool", name: "Italian Wool", color: "#2c2c2c", roughness: 0.85, metalness: 0.02, bumpScale: 0.015, price: 450 },
  { id: "linen", name: "Belgian Linen", color: "#c8b99a", roughness: 0.95, metalness: 0.0, bumpScale: 0.025, price: 320 },
  { id: "cotton", name: "Egyptian Cotton", color: "#f5f0e8", roughness: 0.9, metalness: 0.0, bumpScale: 0.01, price: 280 },
  { id: "cashmere", name: "Cashmere Blend", color: "#4a3f35", roughness: 0.75, metalness: 0.03, bumpScale: 0.008, price: 680 },
];

const COLORS = [
  { id: "charcoal", name: "Charcoal", hex: "#2c2c2c", premium: 0 },
  { id: "navy", name: "Navy", hex: "#1a2744", premium: 0 },
  { id: "burgundy", name: "Burgundy", hex: "#5c1a2a", premium: 25 },
  { id: "camel", name: "Camel", hex: "#c4a265", premium: 35 },
  { id: "slate", name: "Slate Grey", hex: "#6b7280", premium: 0 },
  { id: "cream", name: "Ivory", hex: "#f5f0e8", premium: 15 },
];

const STYLES = [
  { id: "classic", name: "Classic", shoulderMult: 1.0, lapelMult: 1.0, buttonCount: 2, price: 0 },
  { id: "slim", name: "Slim Modern", shoulderMult: 0.92, lapelMult: 0.8, buttonCount: 2, price: 50 },
  { id: "doublebreasted", name: "Double Breasted", shoulderMult: 1.06, lapelMult: 1.3, buttonCount: 4, price: 120 },
  { id: "deconstructed", name: "Deconstructed", shoulderMult: 0.96, lapelMult: 0.6, buttonCount: 0, price: 80 },
];

const BASE_TAILORING = 150;

/** Generate a canvas-based fabric bump texture */
function useFabricTexture(fabricId: string) {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Base
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, size, size);

    if (fabricId === "wool") {
      // Twill weave pattern
      for (let y = 0; y < size; y += 3) {
        for (let x = 0; x < size; x += 3) {
          const v = 120 + Math.random() * 16;
          ctx.fillStyle = `rgb(${v},${v},${v})`;
          ctx.fillRect(x, y, 2, 2);
        }
        // Diagonal weave lines
        if (y % 6 === 0) {
          ctx.strokeStyle = `rgba(100,100,100,0.3)`;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(size, y + size * 0.5);
          ctx.stroke();
        }
      }
    } else if (fabricId === "linen") {
      // Visible crosshatch weave
      for (let y = 0; y < size; y += 4) {
        const v = 118 + Math.random() * 20;
        ctx.strokeStyle = `rgb(${v},${v},${v})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y + (Math.random() - 0.5) * 2);
        ctx.stroke();
      }
      for (let x = 0; x < size; x += 5) {
        const v = 118 + Math.random() * 20;
        ctx.strokeStyle = `rgb(${v},${v},${v})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + (Math.random() - 0.5) * 2, size);
        ctx.stroke();
      }
    } else if (fabricId === "cotton") {
      // Fine smooth weave
      for (let y = 0; y < size; y += 2) {
        for (let x = 0; x < size; x += 2) {
          const v = 125 + Math.random() * 8;
          ctx.fillStyle = `rgb(${v},${v},${v})`;
          ctx.fillRect(x, y, 2, 2);
        }
      }
    } else {
      // Cashmere - ultra fine, soft
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          const v = 126 + Math.random() * 4;
          ctx.fillStyle = `rgb(${v},${v},${v})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return tex;
  }, [fabricId]);
}

function Mannequin({
  color,
  fabricId,
  fabricProps,
  styleConfig,
}: {
  color: string;
  fabricId: string;
  fabricProps: { roughness: number; metalness: number; bumpScale: number };
  styleConfig: typeof STYLES[0];
}) {
  const group = useRef<THREE.Group>(null);
  const bumpMap = useFabricTexture(fabricId);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.12;
    }
  });

  const suitMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(color),
        roughness: fabricProps.roughness,
        metalness: fabricProps.metalness,
        bumpMap,
        bumpScale: fabricProps.bumpScale,
        clearcoat: fabricId === "wool" ? 0.05 : 0,
        clearcoatRoughness: 0.9,
        sheen: fabricId === "cashmere" ? 0.4 : fabricId === "wool" ? 0.15 : 0,
        sheenColor: new THREE.Color(color).offsetHSL(0, -0.1, 0.15),
        sheenRoughness: 0.6,
      }),
    [color, fabricProps, bumpMap, fabricId]
  );

  const trouserMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(color).offsetHSL(0, 0, -0.03),
        roughness: fabricProps.roughness + 0.02,
        metalness: fabricProps.metalness,
        bumpMap,
        bumpScale: fabricProps.bumpScale * 0.8,
      }),
    [color, fabricProps, bumpMap]
  );

  const skinMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#c9956b",
        roughness: 0.65,
        metalness: 0,
        clearcoat: 0.08,
        clearcoatRoughness: 0.7,
      }),
    []
  );

  const shirtMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#f0ebe3",
        roughness: 0.8,
        metalness: 0,
      }),
    []
  );

  const shoeMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#1a1410",
        roughness: 0.25,
        metalness: 0.08,
        clearcoat: 0.3,
        clearcoatRoughness: 0.4,
      }),
    []
  );

  const buttonMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#6b5d4f",
        roughness: 0.4,
        metalness: 0.15,
        clearcoat: 0.2,
      }),
    []
  );

  const sw = styleConfig.shoulderMult;
  const lw = styleConfig.lapelMult;

  // Lathe profile for torso (smooth organic shape)
  const torsoPoints = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    // From bottom of torso to shoulders
    pts.push(new THREE.Vector2(0.22, 0));
    pts.push(new THREE.Vector2(0.24, 0.15));
    pts.push(new THREE.Vector2(0.23, 0.35));
    pts.push(new THREE.Vector2(0.22, 0.5));
    pts.push(new THREE.Vector2(0.25 * sw, 0.58));
    pts.push(new THREE.Vector2(0.28 * sw, 0.62));
    pts.push(new THREE.Vector2(0.27 * sw, 0.65));
    pts.push(new THREE.Vector2(0.14, 0.68));
    return pts;
  }, [sw]);

  const legPoints = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    pts.push(new THREE.Vector2(0.08, 0));
    pts.push(new THREE.Vector2(0.1, 0.15));
    pts.push(new THREE.Vector2(0.115, 0.35));
    pts.push(new THREE.Vector2(0.12, 0.5));
    pts.push(new THREE.Vector2(0.115, 0.55));
    return pts;
  }, []);

  const armPoints = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    pts.push(new THREE.Vector2(0.06, 0));
    pts.push(new THREE.Vector2(0.075, 0.1));
    pts.push(new THREE.Vector2(0.08, 0.25));
    pts.push(new THREE.Vector2(0.075, 0.4));
    pts.push(new THREE.Vector2(0.065, 0.55));
    pts.push(new THREE.Vector2(0.06, 0.6));
    return pts;
  }, []);

  return (
    <group ref={group} position={[0, -1.6, 0]}>
      {/* ─── HEAD ─── */}
      <mesh position={[0, 3.35, 0]} material={skinMat} castShadow>
        <sphereGeometry args={[0.22, 48, 48]} />
      </mesh>
      {/* Jaw */}
      <mesh position={[0, 3.18, 0.04]} material={skinMat}>
        <sphereGeometry args={[0.17, 32, 32]} />
      </mesh>
      {/* Hair */}
      <mesh position={[0, 3.48, -0.02]}>
        <sphereGeometry args={[0.21, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshPhysicalMaterial color="#1a1410" roughness={0.9} />
      </mesh>
      {/* Ears */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.22, 3.32, 0]} material={skinMat}>
          <sphereGeometry args={[0.05, 16, 16]} />
        </mesh>
      ))}

      {/* ─── NECK ─── */}
      <mesh position={[0, 3.0, 0]} material={skinMat}>
        <cylinderGeometry args={[0.08, 0.1, 0.2, 24]} />
      </mesh>

      {/* ─── SHIRT COLLAR ─── */}
      <mesh position={[0, 2.92, 0]} material={shirtMat}>
        <cylinderGeometry args={[0.12, 0.15, 0.08, 24]} />
      </mesh>

      {/* ─── TORSO (lathe) ─── */}
      <mesh position={[0, 2.2, 0]} material={suitMat} castShadow>
        <latheGeometry args={[torsoPoints, 48]} />
      </mesh>

      {/* ─── LAPELS ─── */}
      {[-1, 1].map((side) => (
        <group key={`lapel-${side}`}>
          <mesh
            position={[side * 0.08 * lw, 2.65, 0.23]}
            rotation={[0.1, side * 0.2, side * 0.15]}
            material={suitMat}
            castShadow
          >
            <boxGeometry args={[0.1 * lw, 0.45, 0.015]} />
          </mesh>
          {/* Lapel fold edge highlight */}
          <mesh
            position={[side * 0.12 * lw, 2.65, 0.235]}
            rotation={[0.1, side * 0.2, side * 0.15]}
          >
            <boxGeometry args={[0.01, 0.42, 0.018]} />
            <meshPhysicalMaterial color={color} roughness={0.6} metalness={0.05} />
          </mesh>
        </group>
      ))}

      {/* ─── POCKET WELT (left chest) ─── */}
      <mesh position={[-0.12, 2.52, 0.24]} rotation={[0, 0, 0.02]} material={suitMat}>
        <boxGeometry args={[0.12, 0.008, 0.018]} />
      </mesh>

      {/* ─── FRONT PLACKET ─── */}
      <mesh position={[0, 2.35, 0.24]}>
        <boxGeometry args={[0.025, 0.65, 0.012]} />
        <meshPhysicalMaterial color={color} roughness={fabricProps.roughness - 0.05} />
      </mesh>

      {/* ─── BUTTONS ─── */}
      {styleConfig.buttonCount > 0 &&
        Array.from({ length: Math.min(styleConfig.buttonCount, 3) }).map((_, i) => {
          const isDouble = styleConfig.id === "doublebreasted";
          const yBase = 2.45 - i * 0.18;
          return (
            <group key={`btn-${i}`}>
              <mesh position={[isDouble ? -0.04 : 0, yBase, 0.255]} material={buttonMat} castShadow>
                <cylinderGeometry args={[0.018, 0.018, 0.008, 24]} />
              </mesh>
              {isDouble && (
                <mesh position={[0.04, yBase, 0.255]} material={buttonMat} castShadow>
                  <cylinderGeometry args={[0.018, 0.018, 0.008, 24]} />
                </mesh>
              )}
              {/* Thread holes */}
              {[[-0.005, 0.005], [0.005, -0.005]].map(([dx, dz], j) => (
                <mesh key={j} position={[(isDouble ? -0.04 : 0) + dx, yBase, 0.258 + dz * 0.1]}>
                  <sphereGeometry args={[0.002, 8, 8]} />
                  <meshBasicMaterial color="#3a342c" />
                </mesh>
              ))}
            </group>
          );
        })}

      {/* ─── ARMS ─── */}
      {[-1, 1].map((side) => (
        <group key={`arm-${side}`}>
          {/* Upper arm */}
          <mesh
            position={[side * 0.32 * sw, 2.42, 0]}
            rotation={[0, 0, side * 0.08]}
            material={suitMat}
            castShadow
          >
            <latheGeometry args={[armPoints, 24]} />
          </mesh>
          {/* Sleeve cuff */}
          <mesh position={[side * 0.36 * sw, 1.82, 0]} material={suitMat}>
            <cylinderGeometry args={[0.065, 0.06, 0.05, 24]} />
          </mesh>
          {/* Cuff buttons */}
          {[0, 1].map((bi) => (
            <mesh key={bi} position={[side * (0.36 * sw - side * 0.06), 1.82 + bi * 0.03, 0.04]} material={buttonMat}>
              <cylinderGeometry args={[0.01, 0.01, 0.005, 12]} />
            </mesh>
          ))}
          {/* Hand */}
          <mesh position={[side * 0.37 * sw, 1.72, 0]} material={skinMat}>
            <sphereGeometry args={[0.055, 24, 24]} />
          </mesh>
          {/* Fingers */}
          <mesh position={[side * 0.37 * sw, 1.66, 0.01]} material={skinMat}>
            <boxGeometry args={[0.07, 0.06, 0.03]} />
          </mesh>
        </group>
      ))}

      {/* ─── BELT AREA ─── */}
      <mesh position={[0, 1.88, 0]}>
        <cylinderGeometry args={[0.24, 0.23, 0.04, 32]} />
        <meshPhysicalMaterial color="#1a1410" roughness={0.35} metalness={0.1} clearcoat={0.2} />
      </mesh>
      {/* Belt buckle */}
      <mesh position={[0, 1.88, 0.24]}>
        <boxGeometry args={[0.04, 0.035, 0.008]} />
        <meshPhysicalMaterial color="#b8a88a" roughness={0.2} metalness={0.7} />
      </mesh>

      {/* ─── HIPS / TROUSER TOP ─── */}
      <mesh position={[0, 1.7, 0]} material={trouserMat} castShadow>
        <cylinderGeometry args={[0.22, 0.2, 0.3, 32]} />
      </mesh>

      {/* ─── LEGS ─── */}
      {[-1, 1].map((side) => (
        <group key={`leg-${side}`}>
          <mesh position={[side * 0.1, 1.25, 0]} material={trouserMat} castShadow>
            <latheGeometry args={[legPoints, 24]} />
          </mesh>
          {/* Trouser crease (front) */}
          <mesh position={[side * 0.1, 1.1, 0.1]}>
            <boxGeometry args={[0.003, 0.8, 0.003]} />
            <meshPhysicalMaterial color={color} roughness={0.5} metalness={0.02} />
          </mesh>
          {/* Trouser cuff */}
          <mesh position={[side * 0.1, 0.72, 0]} material={trouserMat}>
            <cylinderGeometry args={[0.09, 0.088, 0.04, 24]} />
          </mesh>

          {/* ─── SHOE ─── */}
          <group position={[side * 0.1, 0.62, 0.04]}>
            {/* Shoe body */}
            <mesh material={shoeMat} castShadow>
              <boxGeometry args={[0.11, 0.08, 0.22]} />
            </mesh>
            {/* Toe cap */}
            <mesh position={[0, -0.01, 0.1]} material={shoeMat}>
              <sphereGeometry args={[0.06, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            </mesh>
            {/* Sole */}
            <mesh position={[0, -0.04, 0]}>
              <boxGeometry args={[0.12, 0.02, 0.24]} />
              <meshPhysicalMaterial color="#0d0d0d" roughness={0.9} />
            </mesh>
            {/* Heel */}
            <mesh position={[0, -0.04, -0.09]}>
              <boxGeometry args={[0.1, 0.03, 0.05]} />
              <meshPhysicalMaterial color="#0d0d0d" roughness={0.85} />
            </mesh>
          </group>
        </group>
      ))}

      {/* ─── JACKET BACK VENT ─── */}
      <mesh position={[0, 2.05, -0.23]}>
        <boxGeometry args={[0.003, 0.35, 0.01]} />
        <meshPhysicalMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="text-primary font-body text-sm tracking-widest uppercase animate-pulse">
        Loading Studio...
      </div>
    </Html>
  );
}

const Customize = () => {
  const [selectedFabric, setSelectedFabric] = useState(FABRICS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);

  const totalPrice = selectedFabric.price + BASE_TAILORING + selectedStyle.price + selectedColor.premium;

  const reset = () => {
    setSelectedFabric(FABRICS[0]);
    setSelectedColor(COLORS[0]);
    setSelectedStyle(STYLES[0]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <span className="font-body text-xs tracking-widest uppercase text-primary">Customization Studio</span>
            <h1 className="font-display text-3xl md:text-4xl text-foreground mt-2">Design Your Garment</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* 3D Viewer */}
            <div className="lg:col-span-3 bg-card border border-border rounded-lg overflow-hidden" style={{ height: "650px" }}>
              <Canvas camera={{ position: [0, 0.8, 3.2], fov: 40 }} shadows>
                <Suspense fallback={<LoadingFallback />}>
                  <ambientLight intensity={0.35} />
                  <directionalLight position={[4, 6, 4]} intensity={0.9} castShadow shadow-mapSize={[1024, 1024]} />
                  <directionalLight position={[-3, 4, -2]} intensity={0.25} />
                  <spotLight position={[0, 5, 3]} angle={0.3} penumbra={0.8} intensity={0.4} />
                  <Mannequin
                    color={selectedColor.hex}
                    fabricId={selectedFabric.id}
                    fabricProps={{ roughness: selectedFabric.roughness, metalness: selectedFabric.metalness, bumpScale: selectedFabric.bumpScale }}
                    styleConfig={selectedStyle}
                  />
                  <ContactShadows position={[0, -1.6, 0]} opacity={0.5} scale={4} blur={2} far={3} />
                  <Environment preset="studio" />
                  <OrbitControls
                    enablePan={false}
                    minDistance={2}
                    maxDistance={5.5}
                    minPolarAngle={Math.PI / 5}
                    maxPolarAngle={Math.PI / 1.7}
                    autoRotate
                    autoRotateSpeed={0.4}
                  />
                </Suspense>
              </Canvas>
            </div>

            {/* Controls */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" /> Fabric
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  {FABRICS.map((fabric) => (
                    <button
                      key={fabric.id}
                      onClick={() => setSelectedFabric(fabric)}
                      className={`p-3 rounded border text-left text-xs font-body transition-all ${
                        selectedFabric.id === fabric.id
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-muted-foreground"
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full mb-2 border border-border" style={{ backgroundColor: fabric.color }} />
                      {fabric.name}
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" /> Color
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      title={color.name}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor.id === color.id ? "border-primary scale-110 ring-2 ring-primary/30" : "border-border hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shirt className="h-4 w-4 text-primary" /> Style
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  {STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style)}
                      className={`p-3 rounded border text-xs font-body tracking-wide uppercase transition-all ${
                        selectedStyle.id === style.id
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-muted-foreground"
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-primary/30 bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" /> Price Estimate
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5 text-xs font-body">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Fabric — {selectedFabric.name}</span>
                      <span className="text-foreground">${selectedFabric.price}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Base tailoring</span>
                      <span className="text-foreground">${BASE_TAILORING}</span>
                    </div>
                    {selectedStyle.price > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Style — {selectedStyle.name}</span>
                        <span className="text-foreground">+${selectedStyle.price}</span>
                      </div>
                    )}
                    {selectedColor.premium > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Color — {selectedColor.name}</span>
                        <span className="text-foreground">+${selectedColor.premium}</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold text-sm">
                      <span className="text-foreground">Estimated Total</span>
                      <span className="text-primary">${totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="hero" className="flex-1" asChild>
                      <a href="/bespoke">Order Bespoke</a>
                    </Button>
                    <Button variant="heroOutline" size="icon" onClick={reset}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Customize;
