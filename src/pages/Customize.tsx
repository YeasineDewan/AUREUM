import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Html } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Palette, Shirt, Layers, RotateCcw, DollarSign, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/hooks/use-toast";
import Mannequin3D from "@/components/customize/Mannequin3D";
import BodyScanner from "@/components/customize/BodyScanner";
import OutfitBuilder from "@/components/customize/OutfitBuilder";
import {
  FABRICS, COLORS, STYLES, BASE_TAILORING, DEFAULT_GARMENT_VISIBILITY,
  type BodyMeasurements, type GarmentVisibility,
} from "@/types/customize";

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
  const [selectedFabric, setSelectedFabric] = useState(FABRICS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [garments, setGarments] = useState<GarmentVisibility>(DEFAULT_GARMENT_VISIBILITY);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurements | null>(null);

  const totalPrice = selectedFabric.price + BASE_TAILORING + selectedStyle.price + selectedColor.premium;

  const reset = () => {
    setSelectedFabric(FABRICS[0]);
    setSelectedColor(COLORS[0]);
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
              Upload a photo for AI-powered measurements, customize every detail, and preview in real-time 3D
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Body Scanner + Outfit Builder */}
            <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
              <BodyScanner onMeasurements={setBodyMeasurements} measurements={bodyMeasurements} />
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

                {/* Measurement badge overlay */}
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

            {/* Right: Customization Controls */}
            <div className="lg:col-span-4 space-y-4 order-3">
              <Tabs defaultValue="fabric" className="space-y-4">
                <TabsList className="bg-secondary w-full grid grid-cols-3">
                  <TabsTrigger value="fabric" className="text-xs">
                    <Layers className="h-3.5 w-3.5 mr-1.5" /> Fabric
                  </TabsTrigger>
                  <TabsTrigger value="color" className="text-xs">
                    <Palette className="h-3.5 w-3.5 mr-1.5" /> Color
                  </TabsTrigger>
                  <TabsTrigger value="style" className="text-xs">
                    <Shirt className="h-3.5 w-3.5 mr-1.5" /> Style
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="fabric">
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Select Fabric</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-2">
                      {FABRICS.map((fabric) => (
                        <button
                          key={fabric.id}
                          onClick={() => setSelectedFabric(fabric)}
                          className={`p-3 rounded border text-left transition-all flex items-center gap-3 ${
                            selectedFabric.id === fabric.id
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-muted-foreground"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg border border-border shrink-0" style={{ backgroundColor: fabric.color }} />
                          <div className="flex-1">
                            <p className="font-body text-xs text-foreground font-medium">{fabric.name}</p>
                            <p className="font-body text-[10px] text-muted-foreground">
                              {fabric.id === "wool" && "Twill weave, structured drape"}
                              {fabric.id === "linen" && "Crosshatch weave, relaxed drape"}
                              {fabric.id === "cotton" && "Fine weave, crisp drape"}
                              {fabric.id === "cashmere" && "Ultra-soft, flowing drape"}
                            </p>
                          </div>
                          <span className="font-body text-xs text-primary">${fabric.price}</span>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="color">
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Select Color</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-3">
                        {COLORS.map((color) => (
                          <button
                            key={color.id}
                            onClick={() => setSelectedColor(color)}
                            className={`flex flex-col items-center gap-2 p-3 rounded border transition-all ${
                              selectedColor.id === color.id
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-muted-foreground"
                            }`}
                          >
                            <div
                              className={`w-12 h-12 rounded-full border-2 transition-all ${
                                selectedColor.id === color.id ? "border-primary ring-2 ring-primary/30 scale-110" : "border-border"
                              }`}
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="font-body text-[10px] text-muted-foreground">{color.name}</span>
                            {color.premium > 0 && (
                              <span className="font-body text-[9px] text-primary">+${color.premium}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="style">
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Select Style</CardTitle>
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
                </TabsContent>
              </Tabs>

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
                    <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold text-sm">
                      <span className="text-foreground">Estimated Total</span>
                      <span className="text-primary">${totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="hero"
                      className="flex-1"
                      onClick={() => {
                        addItem({
                          id: `custom-${selectedFabric.id}-${selectedColor.id}-${selectedStyle.id}`,
                          name: "Custom Bespoke Suit",
                          price: totalPrice,
                          fabric: selectedFabric.name,
                          color: selectedColor.name,
                          style: selectedStyle.name,
                        });
                        toast({ title: "Added to cart", description: `Custom suit — ${selectedFabric.name}, ${selectedColor.name}` });
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
