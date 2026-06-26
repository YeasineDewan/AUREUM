import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Ruler, ChevronDown, ChevronRight } from "lucide-react";
import {
  DEFAULT_EXT_MEASUREMENTS, MEASUREMENT_RANGES, SIZE_PRESETS,
  type ExtendedMeasurements,
} from "@/types/customize-extended";

interface Props {
  measurements: ExtendedMeasurements;
  onChange: (m: ExtendedMeasurements) => void;
}

const GROUPS = [
  { id: "core", label: "Core", icon: "📏" },
  { id: "torso", label: "Torso", icon: "👕" },
  { id: "arms", label: "Arms", icon: "💪" },
  { id: "legs", label: "Legs", icon: "🦵" },
  { id: "fit", label: "Fit", icon: "✂️" },
] as const;

export default function ExpandedMeasurements({ measurements, onChange }: Props) {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string>("core");

  const setField = (key: keyof ExtendedMeasurements, value: number) => {
    setActivePreset(null);
    onChange({ ...measurements, [key]: value });
  };

  const applyPreset = (presetId: string) => {
    const p = SIZE_PRESETS.find((s) => s.id === presetId);
    if (!p) return;
    setActivePreset(presetId);
    onChange(p.measurements);
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Ruler className="h-4 w-4 text-primary" /> Detailed Measurements
        </CardTitle>
        <p className="text-[10px] text-muted-foreground font-body">
          {Object.keys(MEASUREMENT_RANGES).length} measurement points • EU / US / UK charts
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Size presets */}
        <div>
          <p className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Quick Size
          </p>
          <div className="grid grid-cols-7 gap-1">
            {SIZE_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={`py-1.5 rounded text-[10px] font-body font-semibold border transition ${
                  activePreset === p.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                }`}
                title={`EU ${p.eu} • US ${p.us} • UK ${p.uk}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {activePreset && (() => {
            const p = SIZE_PRESETS.find((s) => s.id === activePreset)!;
            return (
              <p className="text-[9px] font-body text-primary mt-1.5 text-center">
                EU {p.eu} • US {p.us} • UK {p.uk}
              </p>
            );
          })()}
        </div>

        {/* Grouped sliders */}
        <div className="space-y-1.5">
          {GROUPS.map((g) => {
            const fields = (Object.keys(MEASUREMENT_RANGES) as (keyof ExtendedMeasurements)[]).filter(
              (k) => MEASUREMENT_RANGES[k].group === g.id
            );
            const isOpen = openGroup === g.id;
            return (
              <div key={g.id} className="border border-border rounded">
                <button
                  onClick={() => setOpenGroup(isOpen ? "" : g.id)}
                  className="w-full flex items-center justify-between p-2 hover:bg-secondary/50 transition"
                >
                  <span className="text-[11px] font-body font-medium flex items-center gap-1.5">
                    <span>{g.icon}</span> {g.label}
                    <span className="text-[9px] text-muted-foreground">({fields.length})</span>
                  </span>
                  {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </button>
                {isOpen && (
                  <div className="p-2.5 pt-1 space-y-2 border-t border-border">
                    {fields.map((key) => {
                      const cfg = MEASUREMENT_RANGES[key];
                      return (
                        <div key={key}>
                          <div className="flex justify-between items-baseline">
                            <label className="text-[10px] font-body text-muted-foreground">
                              {cfg.label}
                            </label>
                            <span className="text-[10px] font-body font-medium text-foreground">
                              {measurements[key]} {cfg.unit}
                            </span>
                          </div>
                          <Slider
                            min={cfg.min}
                            max={cfg.max}
                            step={cfg.step}
                            value={[measurements[key]]}
                            onValueChange={([v]) => setField(key, v)}
                            className="mt-1"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            setActivePreset(null);
            onChange(DEFAULT_EXT_MEASUREMENTS);
          }}
          className="w-full text-[10px] font-body text-muted-foreground hover:text-primary transition py-1"
        >
          Reset to defaults
        </button>
      </CardContent>
    </Card>
  );
}
