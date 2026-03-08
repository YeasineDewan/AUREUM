import { useState, Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Html } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Palette, Shirt, Layers, RotateCcw } from "lucide-react";
import * as THREE from "three";

const FABRICS = [
  { id: "wool", name: "Italian Wool", color: "#2c2c2c" },
  { id: "linen", name: "Belgian Linen", color: "#c8b99a" },
  { id: "cotton", name: "Egyptian Cotton", color: "#f5f0e8" },
  { id: "cashmere", name: "Cashmere Blend", color: "#4a3f35" },
];

const COLORS = [
  { id: "charcoal", name: "Charcoal", hex: "#2c2c2c" },
  { id: "navy", name: "Navy", hex: "#1a2744" },
  { id: "burgundy", name: "Burgundy", hex: "#5c1a2a" },
  { id: "camel", name: "Camel", hex: "#c4a265" },
  { id: "slate", name: "Slate Grey", hex: "#6b7280" },
  { id: "cream", name: "Ivory", hex: "#f5f0e8" },
];

const STYLES = [
  { id: "classic", name: "Classic" },
  { id: "slim", name: "Slim Modern" },
  { id: "doublebreasted", name: "Double Breasted" },
  { id: "deconstructed", name: "Deconstructed" },
];

function Mannequin({ color, style }: { color: string; style: string }) {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.7,
    metalness: 0.05,
  });

  const skinMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#d4a574"),
    roughness: 0.8,
    metalness: 0,
  });

  // Suit proportions based on style
  const shoulderWidth = style === "slim" ? 0.85 : style === "doublebreasted" ? 1.0 : 0.92;
  const lapelWidth = style === "doublebreasted" ? 0.15 : style === "deconstructed" ? 0.08 : 0.11;

  return (
    <group ref={group} position={[0, -1.8, 0]}>
      {/* Head */}
      <mesh position={[0, 3.3, 0]} material={skinMaterial}>
        <sphereGeometry args={[0.28, 32, 32]} />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 2.95, 0]} material={skinMaterial}>
        <cylinderGeometry args={[0.1, 0.12, 0.25, 16]} />
      </mesh>

      {/* Torso / Jacket */}
      <mesh position={[0, 2.2, 0]} material={material}>
        <boxGeometry args={[shoulderWidth * 1.1, 1.3, 0.5]} />
      </mesh>
      
      {/* Jacket lapels */}
      <mesh position={[-lapelWidth * 2, 2.55, 0.26]} material={material} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[lapelWidth, 0.6, 0.02]} />
      </mesh>
      <mesh position={[lapelWidth * 2, 2.55, 0.26]} material={material} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[lapelWidth, 0.6, 0.02]} />
      </mesh>

      {/* Left Arm */}
      <mesh position={[-0.62, 2.15, 0]} material={material} rotation={[0, 0, 0.12]}>
        <boxGeometry args={[0.2, 1.2, 0.22]} />
      </mesh>
      
      {/* Right Arm */}
      <mesh position={[0.62, 2.15, 0]} material={material} rotation={[0, 0, -0.12]}>
        <boxGeometry args={[0.2, 1.2, 0.22]} />
      </mesh>

      {/* Hands */}
      <mesh position={[-0.7, 1.45, 0]} material={skinMaterial}>
        <sphereGeometry args={[0.08, 16, 16]} />
      </mesh>
      <mesh position={[0.7, 1.45, 0]} material={skinMaterial}>
        <sphereGeometry args={[0.08, 16, 16]} />
      </mesh>

      {/* Trousers - upper */}
      <mesh position={[0, 1.15, 0]} material={material}>
        <boxGeometry args={[0.55, 0.5, 0.45]} />
      </mesh>

      {/* Left Leg */}
      <mesh position={[-0.16, 0.4, 0]} material={material}>
        <boxGeometry args={[0.24, 1.1, 0.28]} />
      </mesh>
      
      {/* Right Leg */}
      <mesh position={[0.16, 0.4, 0]} material={material}>
        <boxGeometry args={[0.24, 1.1, 0.28]} />
      </mesh>

      {/* Shoes */}
      <mesh position={[-0.16, -0.2, 0.05]} material={new THREE.MeshStandardMaterial({ color: "#1a1a1a", roughness: 0.3 })}>
        <boxGeometry args={[0.2, 0.12, 0.35]} />
      </mesh>
      <mesh position={[0.16, -0.2, 0.05]} material={new THREE.MeshStandardMaterial({ color: "#1a1a1a", roughness: 0.3 })}>
        <boxGeometry args={[0.2, 0.12, 0.35]} />
      </mesh>

      {/* Buttons */}
      {style !== "deconstructed" && (
        <>
          <mesh position={[0, 2.3, 0.26]}>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshStandardMaterial color="#8b7d6b" metalness={0.3} roughness={0.5} />
          </mesh>
          <mesh position={[0, 2.05, 0.26]}>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshStandardMaterial color="#8b7d6b" metalness={0.3} roughness={0.5} />
          </mesh>
        </>
      )}
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
          {/* Header */}
          <div className="text-center mb-8">
            <span className="font-body text-xs tracking-widest uppercase text-primary">Customization Studio</span>
            <h1 className="font-display text-3xl md:text-4xl text-foreground mt-2">Design Your Garment</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* 3D Viewer - takes 3 cols */}
            <div className="lg:col-span-3 bg-card border border-border rounded-lg overflow-hidden" style={{ height: "600px" }}>
              <Canvas camera={{ position: [0, 0.5, 3.5], fov: 45 }} shadows>
                <Suspense fallback={<LoadingFallback />}>
                  <ambientLight intensity={0.4} />
                  <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
                  <directionalLight position={[-3, 3, -3]} intensity={0.3} />
                  <Mannequin color={selectedColor.hex} style={selectedStyle.id} />
                  <ContactShadows position={[0, -1.8, 0]} opacity={0.4} scale={5} blur={2.5} />
                  <Environment preset="studio" />
                  <OrbitControls
                    enablePan={false}
                    minDistance={2.5}
                    maxDistance={6}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.8}
                  />
                </Suspense>
              </Canvas>
            </div>

            {/* Controls Panel - takes 2 cols */}
            <div className="lg:col-span-2 space-y-4">
              {/* Fabric */}
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

              {/* Color */}
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

              {/* Style */}
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

              {/* Summary & Actions */}
              <Card className="border-border bg-card">
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">Fabric: <span className="text-foreground">{selectedFabric.name}</span></p>
                    <p className="text-muted-foreground">Color: <span className="text-foreground">{selectedColor.name}</span></p>
                    <p className="text-muted-foreground">Style: <span className="text-foreground">{selectedStyle.name}</span></p>
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
