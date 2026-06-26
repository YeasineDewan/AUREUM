import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Html } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RotateCcw, DollarSign, ShoppingBag, Download } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/hooks/use-toast";
import Mannequin3D, { type Gender, SKIN_TONES, POSE_PRESETS, type PosePreset, type SkinTone } from "@/components/customize/Mannequin3D";
import SceneExportListener from "@/components/customize/SceneExportListener";
import BodyScanner from "@/components/customize/BodyScanner";
import OutfitBuilder from "@/components/customize/OutfitBuilder";
import ClothingOptions, {
  FABRIC_TYPES, COLOR_OPTIONS, PATTERNS, COLLAR_STYLES, CUFF_STYLES,
  type FabricType, type ColorOption, type PatternOption, type CollarOption, type CuffOption,
} from "@/components/customize/ClothingOptions";
import {
  STYLES, BASE_TAILORING, DEFAULT_GARMENT_VISIBILITY,
  type BodyMeasurements, type GarmentVisibility,
} from "@/types/customize";
import ModelLibrary from "@/components/customize/ModelLibrary";
import FabricTextureLibrary from "@/components/customize/FabricTextureLibrary";
import ExpandedMeasurements from "@/components/customize/ExpandedMeasurements";
import LoadedModelsScene from "@/components/customize/LoadedModelsScene";
import SceneControls from "@/components/customize/SceneControls";
import { DEFAULT_EXT_MEASUREMENTS, type ExtendedMeasurements } from "@/types/customize-extended";

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
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();
  const [selectedFabric, setSelectedFabric] = useState<FabricType>(FABRIC_TYPES[0]);
  const [selectedColor, setSelectedColor] = useState<ColorOption>(COLOR_OPTIONS[0]);
  const [selectedPattern, setSelectedPattern] = useState<PatternOption>(PATTERNS[0]);
  const [selectedCollar, setSelectedCollar] = useState<CollarOption>(COLLAR_STYLES[0]);
  const [selectedCuff, setSelectedCuff] = useState<CuffOption>(CUFF_STYLES[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [garments, setGarments] = useState<GarmentVisibility>(DEFAULT_GARMENT_VISIBILITY);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurements | null>(null);
  const [gender, setGender] = useState<Gender>("male");
  const [skinTone, setSkinTone] = useState<SkinTone>(SKIN_TONES[1]);
  const [pose, setPose] = useState<PosePreset>("standing");
  const [extMeasurements, setExtMeasurements] = useState<ExtendedMeasurements>(DEFAULT_EXT_MEASUREMENTS);

  const totalPrice = selectedFabric.price + BASE_TAILORING + selectedStyle.price + selectedColor.premium + selectedPattern.premium;

  const reset = () => {
    setSelectedFabric(FABRIC_TYPES[0]);
    setSelectedColor(COLOR_OPTIONS[0]);
    setSelectedPattern(PATTERNS[0]);
    setSelectedCollar(COLLAR_STYLES[0]);
    setSelectedCuff(CUFF_STYLES[0]);
    setSelectedStyle(STYLES[0]);
    setGarments(DEFAULT_GARMENT_VISIBILITY);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <span className="font-body text-xs tracking-widest uppercase text-primary">Customization Studio</span>
            <h1 className="font-display text-3xl md:text-4xl text-foreground mt-2">Design Your Garment</h1>
            <p className="font-body text-xs text-muted-foreground mt-2 max-w-md mx-auto">
              Upload a photo for AI-powered body structure analysis, then customize fabric, color, pattern, collar & cuff
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Body Scanner + Outfit Builder */}
            <div className="lg:col-span-3 space-y-4 order-2 lg:order-1 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:sticky lg:top-20 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent pr-1">
              {/* Gender Toggle */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Body Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    <button
                      onClick={() => setGender("male")}
                      className={`flex-1 py-2.5 px-3 text-xs font-body font-medium transition-all ${
                        gender === "male"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      ♂ Male
                    </button>
                    <button
                      onClick={() => setGender("female")}
                      className={`flex-1 py-2.5 px-3 text-xs font-body font-medium transition-all ${
                        gender === "female"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      ♀ Female
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Skin Tone Selector */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Skin Tone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    {SKIN_TONES.map((tone) => (
                      <button
                        key={tone.id}
                        onClick={() => setSkinTone(tone)}
                        title={tone.name}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          skinTone.id === tone.id
                            ? "border-primary scale-110 ring-2 ring-primary/30"
                            : "border-border hover:border-muted-foreground"
                        }`}
                        style={{ backgroundColor: tone.hex }}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-body text-muted-foreground mt-2">{skinTone.name}</p>
                </CardContent>
              </Card>

              {/* Pose Presets */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Pose</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-1.5">
                    {POSE_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPose(p.id)}
                        className={`py-2 px-2 text-xs font-body font-medium transition-all flex items-center justify-center gap-1 rounded-md border ${
                          pose === p.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-muted-foreground hover:text-foreground border-border"
                        }`}
                      >
                        <span>{p.icon}</span> {p.name}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <BodyScanner onMeasurements={setBodyMeasurements} measurements={bodyMeasurements} />
              <ExpandedMeasurements measurements={extMeasurements} onChange={setExtMeasurements} />
              <ModelLibrary />
              <FabricTextureLibrary />
              <OutfitBuilder visibility={garments} onChange={setGarments} />
            </div>

            {/* Center: 3D Viewer */}
            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="bg-card border border-border rounded-lg overflow-hidden sticky top-20" style={{ height: "650px" }}>
                <Canvas camera={{ position: [0, 0.8, 3.2], fov: 40 }} shadows>
                  <Suspense fallback={<LoadingFallback />}>
                    <ambientLight intensity={0.35} />
                    <directionalLight position={[4, 6, 4]} intensity={0.9} castShadow shadow-mapSize={[1024, 1024]} />
                    <directionalLight position={[-3, 4, -2]} intensity={0.25} />
                    <spotLight position={[0, 5, 3]} angle={0.3} penumbra={0.8} intensity={0.4} />
                    <Mannequin3D
                      color={selectedColor.hex}
                      fabricId={selectedFabric.id}
                      fabricProps={{ roughness: selectedFabric.roughness, metalness: selectedFabric.metalness, bumpScale: selectedFabric.bumpScale }}
                      styleConfig={selectedStyle}
                      garments={garments}
                      bodyMeasurements={bodyMeasurements}
                      gender={gender}
                      skinTone={skinTone}
                      pose={pose}
                    />
                    <ContactShadows position={[0, -1.65, 0]} opacity={0.5} scale={4} blur={2} far={3} />
                    <Environment preset="studio" />
                    <LoadedModelsScene />
                    <OrbitControls
                      makeDefault
                      enablePan={false}
                      minDistance={2}
                      maxDistance={5.5}
                      minPolarAngle={Math.PI / 5}
                      maxPolarAngle={Math.PI / 1.7}
                      autoRotate={false}
                      autoRotateSpeed={0.4}
                    />
                    <SceneExportListener />
                  </Suspense>
                </Canvas>

                {/* Export overlay buttons */}
                <div className="absolute top-3 right-3 flex gap-1.5">
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("export-model", { detail: { format: "glb" } }))}
                    className="bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-[10px] font-body text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 border border-border"
                  >
                    <Download className="h-3 w-3" /> .GLB
                  </button>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("export-model", { detail: { format: "obj" } }))}
                    className="bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-[10px] font-body text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 border border-border"
                  >
                    <Download className="h-3 w-3" /> .OBJ
                  </button>
                </div>

                {bodyMeasurements && (
                  <div className="absolute bottom-3 left-3 right-3 flex justify-center">
                    <div className="bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2 text-[10px] font-body text-muted-foreground">
                      <span className="text-primary">●</span>
                      Body morphed to {bodyMeasurements.bodyType} build — {bodyMeasurements.height}" tall
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Clothing Options + Style + Price */}
            <div className="lg:col-span-4 space-y-4 order-3">
              <ClothingOptions
                selectedFabric={selectedFabric}
                selectedColor={selectedColor}
                selectedPattern={selectedPattern}
                selectedCollar={selectedCollar}
                selectedCuff={selectedCuff}
                onFabricChange={setSelectedFabric}
                onColorChange={setSelectedColor}
                onPatternChange={setSelectedPattern}
                onCollarChange={setSelectedCollar}
                onCuffChange={setSelectedCuff}
              />

              {/* Style selector */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Suit Style</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  {STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style)}
                      className={`p-4 rounded border text-center transition-all ${
                        selectedStyle.id === style.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <p className="font-body text-xs font-medium text-foreground">{style.name}</p>
                      <p className="font-body text-[10px] text-muted-foreground mt-1">
                        {style.id === "classic" && "Traditional 2-button"}
                        {style.id === "slim" && "Modern slim cut"}
                        {style.id === "doublebreasted" && "Bold 4-button"}
                        {style.id === "deconstructed" && "Relaxed, no buttons"}
                      </p>
                      {style.price > 0 && (
                        <p className="font-body text-[10px] text-primary mt-1">+${style.price}</p>
                      )}
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Price Estimator */}
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
                    {selectedPattern.premium > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Pattern — {selectedPattern.name}</span>
                        <span className="text-foreground">+${selectedPattern.premium}</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold text-sm">
                      <span className="text-foreground">Estimated Total</span>
                      <span className="text-primary">${totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Summary of selections */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-[9px] font-body text-muted-foreground">
                      {selectedFabric.name}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-[9px] font-body text-muted-foreground">
                      {selectedColor.name}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-[9px] font-body text-muted-foreground">
                      {selectedPattern.name}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-[9px] font-body text-muted-foreground">
                      {selectedCollar.name} collar
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-[9px] font-body text-muted-foreground">
                      {selectedCuff.name} cuff
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="hero"
                      className="flex-1"
                      onClick={() => {
                        addItem({
                          id: `custom-${selectedFabric.id}-${selectedColor.id}-${selectedPattern.id}`,
                          name: "Custom Bespoke Suit",
                          price: totalPrice,
                          fabric: selectedFabric.name,
                          color: selectedColor.name,
                          style: `${selectedStyle.name} / ${selectedPattern.name} / ${selectedCollar.name} collar / ${selectedCuff.name} cuff`,
                        });
                        toast({ title: "Added to cart", description: `Custom suit — ${selectedFabric.name}, ${selectedColor.name}, ${selectedPattern.name}` });
                      }}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" /> Add to Cart
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
