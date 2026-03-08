import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Layers3 } from "lucide-react";
import type { GarmentVisibility } from "@/types/customize";

interface OutfitBuilderProps {
  visibility: GarmentVisibility;
  onChange: (v: GarmentVisibility) => void;
}

const GARMENT_ITEMS: { key: keyof GarmentVisibility; label: string; emoji: string }[] = [
  { key: "jacket", label: "Jacket", emoji: "🧥" },
  { key: "vest", label: "Waistcoat", emoji: "🦺" },
  { key: "shirt", label: "Shirt", emoji: "👔" },
  { key: "tie", label: "Tie", emoji: "🎀" },
  { key: "trousers", label: "Trousers", emoji: "👖" },
  { key: "belt", label: "Belt", emoji: "🪢" },
  { key: "shoes", label: "Shoes", emoji: "👞" },
];

export default function OutfitBuilder({ visibility, onChange }: OutfitBuilderProps) {
  const toggle = (key: keyof GarmentVisibility) => {
    onChange({ ...visibility, [key]: !visibility[key] });
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Layers3 className="h-4 w-4 text-primary" /> Outfit Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {GARMENT_ITEMS.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{item.emoji}</span>
              <span className="font-body text-xs text-foreground">{item.label}</span>
            </div>
            <Switch
              checked={visibility[item.key]}
              onCheckedChange={() => toggle(item.key)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
