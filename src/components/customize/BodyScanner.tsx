import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Loader2, CheckCircle2, AlertCircle, User, Ruler } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { BodyMeasurements } from "@/types/customize";
import BodyDiagram from "./BodyDiagram";

interface BodyScannerProps {
  onMeasurements: (m: BodyMeasurements) => void;
  measurements: BodyMeasurements | null;
}

const MEASUREMENT_LABELS: Record<string, string> = {
  height: "Height",
  chest: "Chest",
  waist: "Waist",
  hips: "Hips",
  shoulders: "Shoulders",
  sleeveLength: "Sleeve Length",
  inseam: "Inseam",
  neck: "Neck",
  armLength: "Arm Length",
  thigh: "Thigh",
};

export default function BodyScanner({ onMeasurements, measurements }: BodyScannerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, etc.)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB");
      return;
    }

    setError(null);
    setPreviewUrl(URL.createObjectURL(file));
    setIsAnalyzing(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error: fnError } = await supabase.functions.invoke("analyze-body", {
        body: { imageBase64: base64 },
      });

      if (fnError) throw new Error(fnError.message || "Analysis failed");
      if (data?.error) throw new Error(data.error);

      const m = data.measurements as BodyMeasurements;
      onMeasurements(m);
      toast({ title: "Body analysis complete", description: `Confidence: ${Math.round(m.confidence * 100)}%` });
    } catch (err: any) {
      const msg = err.message || "Failed to analyze photo";
      setError(msg);
      toast({ title: "Analysis failed", description: msg, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  }, [onMeasurements, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Camera className="h-4 w-4 text-primary" /> AI Body Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Upload area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="relative border-2 border-dashed border-border rounded-lg overflow-hidden transition-colors hover:border-primary/50 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <div className="relative">
              <img src={previewUrl} alt="Body scan" className="w-full h-40 object-cover opacity-80" />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto mb-2" />
                    <p className="font-body text-xs text-primary">Analyzing body structure...</p>
                  </div>
                </div>
              )}
              {measurements && !isAnalyzing && (
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="text-[10px] text-green-400 border-green-400/30 bg-background/80">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Analyzed
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <User className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="font-body text-xs text-muted-foreground">
                Upload a full-body photo
              </p>
              <p className="font-body text-[10px] text-muted-foreground/60 mt-1">
                AI will estimate your measurements
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>

        {!previewUrl && (
          <Button
            variant="heroOutline"
            size="sm"
            className="w-full text-xs"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
          >
            <Upload className="h-3.5 w-3.5 mr-2" /> Upload Photo
          </Button>
        )}

        {error && (
          <div className="flex items-start gap-2 p-2 rounded bg-destructive/10 text-destructive text-[11px] font-body">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Measurements display */}
        {measurements && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Ruler className="h-3.5 w-3.5 text-primary" />
              <span className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">
                Body Structure & Measurements
              </span>
              <Badge variant="outline" className="text-[10px] ml-auto">
                {Math.round(measurements.confidence * 100)}% conf.
              </Badge>
            </div>

            {/* Visual body diagram */}
            <BodyDiagram measurements={measurements} />

            {/* Measurements grid */}
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(MEASUREMENT_LABELS).map(([key, label]) => {
                const val = measurements[key as keyof BodyMeasurements];
                if (typeof val !== "number") return null;
                return (
                  <div key={key} className="flex justify-between items-center py-1 px-2 rounded bg-secondary/30">
                    <span className="font-body text-[10px] text-muted-foreground">{label}</span>
                    <span className="font-body text-[11px] text-foreground font-medium">{val}"</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-[10px] capitalize">{measurements.bodyType}</Badge>
            </div>
            {measurements.notes && (
              <p className="font-body text-[10px] text-muted-foreground/70 italic mt-1">{measurements.notes}</p>
            )}
            <Button
              variant="heroOutline"
              size="sm"
              className="w-full text-xs mt-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
            >
              <Camera className="h-3.5 w-3.5 mr-2" /> Retake Photo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
