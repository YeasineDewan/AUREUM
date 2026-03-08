import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Layers, Palette, Shirt, Scissors, RectangleHorizontal } from "lucide-react";

// ── Cotton / Fabric types ──
export interface FabricType {
  id: string;
  name: string;
  category: string;
  description: string;
  weight: string;
  price: number;
  roughness: number;
  metalness: number;
  bumpScale: number;
  color: string;
}

export const FABRIC_TYPES: FabricType[] = [
  // Cotton varieties
  { id: "egyptian-cotton", name: "Egyptian Cotton", category: "Cotton", description: "Extra-long staple, silky smooth", weight: "Light", price: 280, roughness: 0.9, metalness: 0, bumpScale: 0.01, color: "#f5f0e8" },
  { id: "pima-cotton", name: "Pima Cotton", category: "Cotton", description: "Soft, durable, minimal pilling", weight: "Medium", price: 250, roughness: 0.88, metalness: 0, bumpScale: 0.012, color: "#ede6d8" },
  { id: "oxford-cotton", name: "Oxford Cotton", category: "Cotton", description: "Basket weave, slightly textured", weight: "Medium", price: 200, roughness: 0.92, metalness: 0, bumpScale: 0.02, color: "#e8e2d6" },
  { id: "poplin-cotton", name: "Poplin", category: "Cotton", description: "Tight weave, crisp formal feel", weight: "Light", price: 220, roughness: 0.85, metalness: 0, bumpScale: 0.008, color: "#f0ebe3" },
  // Wool varieties
  { id: "italian-wool", name: "Italian Wool", category: "Wool", description: "Twill weave, structured drape", weight: "Heavy", price: 450, roughness: 0.85, metalness: 0.02, bumpScale: 0.015, color: "#2c2c2c" },
  { id: "merino-wool", name: "Merino Wool", category: "Wool", description: "Super fine, temperature regulating", weight: "Medium", price: 380, roughness: 0.82, metalness: 0.01, bumpScale: 0.012, color: "#3a3a3a" },
  { id: "tweed", name: "Harris Tweed", category: "Wool", description: "Handwoven, rugged texture", weight: "Heavy", price: 520, roughness: 0.95, metalness: 0.01, bumpScale: 0.03, color: "#4a4538" },
  // Linen
  { id: "belgian-linen", name: "Belgian Linen", category: "Linen", description: "Crosshatch weave, relaxed drape", weight: "Light", price: 320, roughness: 0.95, metalness: 0, bumpScale: 0.025, color: "#c8b99a" },
  { id: "irish-linen", name: "Irish Linen", category: "Linen", description: "Crisp, cool, natural lustre", weight: "Light", price: 350, roughness: 0.9, metalness: 0.01, bumpScale: 0.02, color: "#d4c9b4" },
  // Luxury
  { id: "cashmere", name: "Cashmere Blend", category: "Luxury", description: "Ultra-soft, flowing drape", weight: "Medium", price: 680, roughness: 0.75, metalness: 0.03, bumpScale: 0.008, color: "#4a3f35" },
  { id: "silk-blend", name: "Silk Blend", category: "Luxury", description: "Lustrous sheen, lightweight", weight: "Light", price: 600, roughness: 0.6, metalness: 0.08, bumpScale: 0.005, color: "#5c5248" },
  { id: "velvet", name: "Velvet", category: "Luxury", description: "Rich pile, dramatic texture", weight: "Heavy", price: 550, roughness: 0.7, metalness: 0.05, bumpScale: 0.018, color: "#2a1f2e" },
];

// ── Colors ──
export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  premium: number;
  category: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  // Classic
  { id: "charcoal", name: "Charcoal", hex: "#2c2c2c", premium: 0, category: "Classic" },
  { id: "navy", name: "Navy", hex: "#1a2744", premium: 0, category: "Classic" },
  { id: "black", name: "Jet Black", hex: "#0a0a0a", premium: 0, category: "Classic" },
  { id: "slate", name: "Slate Grey", hex: "#6b7280", premium: 0, category: "Classic" },
  // Earth tones
  { id: "camel", name: "Camel", hex: "#c4a265", premium: 35, category: "Earth" },
  { id: "olive", name: "Olive", hex: "#4a5438", premium: 25, category: "Earth" },
  { id: "chocolate", name: "Chocolate", hex: "#3e2723", premium: 20, category: "Earth" },
  { id: "sand", name: "Sand", hex: "#d2c4a8", premium: 15, category: "Earth" },
  // Bold
  { id: "burgundy", name: "Burgundy", hex: "#5c1a2a", premium: 25, category: "Bold" },
  { id: "forest", name: "Forest Green", hex: "#1b4332", premium: 30, category: "Bold" },
  { id: "royal-blue", name: "Royal Blue", hex: "#1a3a6b", premium: 30, category: "Bold" },
  { id: "cream", name: "Ivory", hex: "#f5f0e8", premium: 15, category: "Light" },
  { id: "white", name: "Pure White", hex: "#fafafa", premium: 20, category: "Light" },
  { id: "lavender", name: "Lavender", hex: "#9b8ec4", premium: 35, category: "Bold" },
];

// ── Patterns ──
export interface PatternOption {
  id: string;
  name: string;
  description: string;
  premium: number;
}

export const PATTERNS: PatternOption[] = [
  { id: "solid", name: "Solid", description: "Clean, no pattern", premium: 0 },
  { id: "pinstripe", name: "Pinstripe", description: "Thin vertical lines, classic business", premium: 40 },
  { id: "chalk-stripe", name: "Chalk Stripe", description: "Bold chalk lines, vintage", premium: 50 },
  { id: "herringbone", name: "Herringbone", description: "V-shaped weave, textured", premium: 45 },
  { id: "windowpane", name: "Windowpane", description: "Open grid check", premium: 55 },
  { id: "houndstooth", name: "Houndstooth", description: "Broken check, bold", premium: 50 },
  { id: "glen-plaid", name: "Glen Plaid", description: "Prince of Wales check", premium: 60 },
];

// ── Collar Styles ──
export interface CollarOption {
  id: string;
  name: string;
  description: string;
}

export const COLLAR_STYLES: CollarOption[] = [
  { id: "spread", name: "Spread", description: "Wide angle, modern" },
  { id: "point", name: "Point", description: "Classic narrow collar" },
  { id: "button-down", name: "Button-Down", description: "Casual, buttoned tips" },
  { id: "mandarin", name: "Mandarin", description: "Stand-up, no fold" },
  { id: "cutaway", name: "Cutaway", description: "Extra wide, formal" },
  { id: "club", name: "Club", description: "Rounded tips, vintage" },
];

// ── Cuff Styles ──
export interface CuffOption {
  id: string;
  name: string;
  description: string;
}

export const CUFF_STYLES: CuffOption[] = [
  { id: "barrel", name: "Barrel", description: "Standard button cuff" },
  { id: "french", name: "French", description: "Folded, needs cufflinks" },
  { id: "convertible", name: "Convertible", description: "Button or cufflinks" },
  { id: "mitered", name: "Mitered", description: "Angled corner, refined" },
];

// ── Props ──
interface ClothingOptionsProps {
  selectedFabric: FabricType;
  selectedColor: ColorOption;
  selectedPattern: PatternOption;
  selectedCollar: CollarOption;
  selectedCuff: CuffOption;
  onFabricChange: (f: FabricType) => void;
  onColorChange: (c: ColorOption) => void;
  onPatternChange: (p: PatternOption) => void;
  onCollarChange: (c: CollarOption) => void;
  onCuffChange: (c: CuffOption) => void;
}

const fabricCategories = ["Cotton", "Wool", "Linen", "Luxury"];

export default function ClothingOptions({
  selectedFabric, selectedColor, selectedPattern, selectedCollar, selectedCuff,
  onFabricChange, onColorChange, onPatternChange, onCollarChange, onCuffChange,
}: ClothingOptionsProps) {
  return (
    <Tabs defaultValue="fabric" className="space-y-4">
      <TabsList className="bg-secondary w-full grid grid-cols-5">
        <TabsTrigger value="fabric" className="text-[10px]">
          <Layers className="h-3 w-3 mr-1" /> Fabric
        </TabsTrigger>
        <TabsTrigger value="color" className="text-[10px]">
          <Palette className="h-3 w-3 mr-1" /> Color
        </TabsTrigger>
        <TabsTrigger value="pattern" className="text-[10px]">
          <RectangleHorizontal className="h-3 w-3 mr-1" /> Pattern
        </TabsTrigger>
        <TabsTrigger value="collar" className="text-[10px]">
          <Shirt className="h-3 w-3 mr-1" /> Collar
        </TabsTrigger>
        <TabsTrigger value="cuff" className="text-[10px]">
          <Scissors className="h-3 w-3 mr-1" /> Cuff
        </TabsTrigger>
      </TabsList>

      {/* FABRIC TAB */}
      <TabsContent value="fabric">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Select Fabric & Cotton Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fabricCategories.map((cat) => (
              <div key={cat}>
                <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-1.5">{cat}</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {FABRIC_TYPES.filter((f) => f.category === cat).map((fabric) => (
                    <button
                      key={fabric.id}
                      onClick={() => onFabricChange(fabric)}
                      className={`p-2.5 rounded border text-left transition-all flex items-center gap-3 ${
                        selectedFabric.id === fabric.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <div className="w-8 h-8 rounded border border-border shrink-0" style={{ backgroundColor: fabric.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-xs text-foreground font-medium">{fabric.name}</p>
                        <p className="font-body text-[10px] text-muted-foreground truncate">{fabric.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-body text-xs text-primary">${fabric.price}</p>
                        <Badge variant="outline" className="text-[8px] px-1 py-0">{fabric.weight}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      {/* COLOR TAB */}
      <TabsContent value="color">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Select Color</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["Classic", "Earth", "Bold", "Light"].map((cat) => {
              const colors = COLOR_OPTIONS.filter((c) => c.category === cat);
              if (!colors.length) return null;
              return (
                <div key={cat}>
                  <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-1.5">{cat}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => onColorChange(color)}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded border transition-all ${
                          selectedColor.id === color.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            selectedColor.id === color.id ? "border-primary ring-2 ring-primary/30 scale-110" : "border-border"
                          }`}
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="font-body text-[9px] text-muted-foreground text-center leading-tight">{color.name}</span>
                        {color.premium > 0 && (
                          <span className="font-body text-[8px] text-primary">+${color.premium}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </TabsContent>

      {/* PATTERN TAB */}
      <TabsContent value="pattern">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Select Pattern</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-1.5">
            {PATTERNS.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => onPatternChange(pattern)}
                className={`p-3 rounded border text-left transition-all ${
                  selectedPattern.id === pattern.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-body text-xs text-foreground font-medium">{pattern.name}</p>
                    <p className="font-body text-[10px] text-muted-foreground">{pattern.description}</p>
                  </div>
                  {pattern.premium > 0 && (
                    <span className="font-body text-xs text-primary">+${pattern.premium}</span>
                  )}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      {/* COLLAR TAB */}
      <TabsContent value="collar">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Collar Style</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {COLLAR_STYLES.map((collar) => (
              <button
                key={collar.id}
                onClick={() => onCollarChange(collar)}
                className={`p-3 rounded border text-center transition-all ${
                  selectedCollar.id === collar.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <p className="font-body text-xs font-medium text-foreground">{collar.name}</p>
                <p className="font-body text-[10px] text-muted-foreground mt-0.5">{collar.description}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      {/* CUFF TAB */}
      <TabsContent value="cuff">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cuff Style</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {CUFF_STYLES.map((cuff) => (
              <button
                key={cuff.id}
                onClick={() => onCuffChange(cuff)}
                className={`p-3 rounded border text-center transition-all ${
                  selectedCuff.id === cuff.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <p className="font-body text-xs font-medium text-foreground">{cuff.name}</p>
                <p className="font-body text-[10px] text-muted-foreground mt-0.5">{cuff.description}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
