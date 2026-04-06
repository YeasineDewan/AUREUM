import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Sparkles, Scissors, Palette, Shirt, Loader2, ChevronRight, ChevronLeft,
  User, Calendar, Target, DollarSign, Heart, RotateCcw, ArrowRight, Check,
  Ruler, Star, Gem, Crown, Wand2, Save, GitCompare, Trash2, X
} from "lucide-react";

const BODY_TYPES = [
  { value: "Slim", icon: "🧍", desc: "Lean build, narrow shoulders" },
  { value: "Athletic", icon: "💪", desc: "Broad shoulders, defined build" },
  { value: "Average", icon: "👤", desc: "Balanced proportions" },
  { value: "Broad", icon: "🏋️", desc: "Wide frame, strong build" },
  { value: "Stocky", icon: "🧱", desc: "Solid, compact build" },
];

const STYLES = [
  { value: "Classic", icon: Crown, desc: "Timeless elegance & sophistication", details: "Peak lapels, structured shoulders, full-canvas construction. Think Savile Row heritage." },
  { value: "Modern", icon: Target, desc: "Clean lines & contemporary cuts", details: "Slim notch lapels, minimal padding, half-canvas. Italian-inspired silhouettes." },
  { value: "Casual Elegant", icon: Star, desc: "Relaxed refinement", details: "Soft shoulders, patch pockets, unstructured blazers. Weekend luxury." },
  { value: "Bold & Statement", icon: Gem, desc: "Stand out with confidence", details: "Wide peak lapels, double-breasted cuts, textured fabrics, rich colors." },
  { value: "Minimalist", icon: Wand2, desc: "Less is more", details: "Clean hems, no pocket flaps, tonal buttons, monochrome palettes." },
  { value: "British Heritage", icon: Crown, desc: "Traditional tailoring excellence", details: "Ticket pockets, slanted hacking pockets, three-button fronts, tweed & flannel." },
  { value: "Italian Sprezzatura", icon: Star, desc: "Effortless Mediterranean style", details: "Unlined jackets, spalla camicia shoulders, lightweight fabrics, earth tones." },
  { value: "Power Dressing", icon: Target, desc: "Commanding boardroom presence", details: "Structured power shoulders, pinstripes, dark tones, full-canvas with heavy drape." },
];

const OCCASIONS = [
  { value: "Business Meetings", emoji: "💼", desc: "Boardroom-ready suits with authoritative presence", formality: "Semi-Formal" },
  { value: "Wedding Guest", emoji: "💍", desc: "Celebratory elegance without upstaging the couple", formality: "Formal" },
  { value: "Black Tie Event", emoji: "🎩", desc: "Dinner jackets, bow ties, and evening sophistication", formality: "Black Tie" },
  { value: "Smart Casual", emoji: "👔", desc: "Polished yet relaxed — blazers with chinos or tailored denim", formality: "Smart Casual" },
  { value: "Everyday Luxury", emoji: "✨", desc: "Elevated basics for daily wear — premium fabrics in relaxed cuts", formality: "Casual" },
  { value: "Date Night", emoji: "🌹", desc: "Confident, stylish looks that make an impression", formality: "Smart Casual" },
  { value: "Cultural Event", emoji: "🎭", desc: "Gallery openings, theater, concerts — creative formality", formality: "Semi-Formal" },
  { value: "Travel", emoji: "✈️", desc: "Wrinkle-resistant fabrics that look sharp after a long flight", formality: "Casual" },
  { value: "Groom / Wedding", emoji: "🤵", desc: "Your day — bespoke wedding suit with personal touches", formality: "Formal" },
  { value: "Graduation / Ceremony", emoji: "🎓", desc: "Milestone celebrations worthy of a fine suit", formality: "Semi-Formal" },
  { value: "Eid / Festival", emoji: "🌙", desc: "Festive occasion wear blending tradition with modern tailoring", formality: "Formal" },
  { value: "Job Interview", emoji: "📋", desc: "Professional first impressions — understated confidence", formality: "Semi-Formal" },
];

const BUDGETS = [
  { value: "Essential", range: "৳8,000 – ৳15,000", desc: "Quality ready-to-wear with minor adjustments", includes: "Basic alterations, standard fabrics" },
  { value: "Standard", range: "৳15,000 – ৳30,000", desc: "Made-to-measure with quality fabrics", includes: "Full measurements, Italian-blend fabrics, basic monogram" },
  { value: "Premium", range: "৳30,000 – ৳60,000", desc: "Elevated wardrobe with luxury materials", includes: "Hand-finished details, Loro Piana / Zegna fabrics, custom buttons" },
  { value: "Luxury", range: "৳60,000 – ৳120,000", desc: "Finest materials & master craftsmanship", includes: "Full-canvas construction, horn buttons, hand-stitched buttonholes" },
  { value: "Bespoke Elite", range: "৳120,000 – ৳250,000", desc: "Ultimate bespoke — no compromises", includes: "Multiple fittings, exclusive mill fabrics, individual pattern, lifetime adjustments" },
  { value: "Haute Couture", range: "৳250,000+", desc: "Exclusive couture-level commissions", includes: "Private consultations, one-of-one fabric selections, museum-grade construction" },
];

const COLOR_PREFS = [
  { value: "Navy", hex: "#1a2744", desc: "Versatile & authoritative" },
  { value: "Charcoal", hex: "#2c2c2c", desc: "Sophisticated & slimming" },
  { value: "Black", hex: "#0a0a0a", desc: "Formal & dramatic" },
  { value: "Brown", hex: "#5c3d2e", desc: "Warm & approachable" },
  { value: "Olive", hex: "#556b2f", desc: "Earthy & distinctive" },
  { value: "Burgundy", hex: "#5c1a2a", desc: "Rich & commanding" },
  { value: "Cream", hex: "#f5f0e8", desc: "Light & summery" },
  { value: "Light Blue", hex: "#6b9ac4", desc: "Fresh & youthful" },
  { value: "Camel", hex: "#c4a265", desc: "Luxurious & warm" },
  { value: "Forest Green", hex: "#2d5a27", desc: "Bold & natural" },
  { value: "Slate Grey", hex: "#6b7280", desc: "Modern & neutral" },
  { value: "Teal", hex: "#2c7873", desc: "Unique & confident" },
  { value: "Tan", hex: "#d2b48c", desc: "Classic & relaxed" },
  { value: "Plum", hex: "#4a2040", desc: "Deep & refined" },
  { value: "No Preference", hex: "", desc: "Let AI decide" },
];

interface Recommendation {
  garment: string;
  fabric: string;
  color: string;
  tip: string;
  priceRange: string;
  reasoning: string;
}

interface SavedRecommendationSet {
  id: string;
  date: string;
  bodyType: string;
  style: string;
  occasion: string;
  budget: string;
  measurements: BodyMeasurements;
  recommendations: Recommendation[];
}

interface BodyMeasurements {
  height: number;
  weight: number;
  chest: number;
  waist: number;
  shoulder: number;
  inseam: number;
}

const defaultMeasurements: BodyMeasurements = {
  height: 170,
  weight: 70,
  chest: 96,
  waist: 82,
  shoulder: 44,
  inseam: 78,
};

const MEASUREMENT_FIELDS: { key: keyof BodyMeasurements; label: string; unit: string; min: number; max: number; step: number }[] = [
  { key: "height", label: "Height", unit: "cm", min: 140, max: 210, step: 1 },
  { key: "weight", label: "Weight", unit: "kg", min: 40, max: 150, step: 1 },
  { key: "chest", label: "Chest", unit: "cm", min: 70, max: 140, step: 1 },
  { key: "waist", label: "Waist", unit: "cm", min: 55, max: 130, step: 1 },
  { key: "shoulder", label: "Shoulder Width", unit: "cm", min: 34, max: 60, step: 1 },
  { key: "inseam", label: "Inseam", unit: "cm", min: 60, max: 100, step: 1 },
];

const STEPS = ["Body Type", "Style", "Occasion", "Budget", "Colors"];

const StyleAdvisor = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [bodyType, setBodyType] = useState("");
  const [measurements, setMeasurements] = useState<BodyMeasurements>({ ...defaultMeasurements });
  const [style, setStyle] = useState("");
  const [occasion, setOccasion] = useState("");
  const [budget, setBudget] = useState("");
  const [colorPrefs, setColorPrefs] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [savedSets, setSavedSets] = useState<SavedRecommendationSet[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const progress = ((step + 1) / STEPS.length) * 100;

  // Load saved sets from profile
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("saved_designs").eq("id", user.id).single().then(({ data }) => {
      if (data?.saved_designs && Array.isArray(data.saved_designs)) {
        const sets = (data.saved_designs as any[]).filter(d => d._type === "style_recommendation");
        setSavedSets(sets);
      }
    });
  }, [user]);

  const toggleColor = (c: string) => {
    if (c === "No Preference") {
      setColorPrefs(prev => prev.includes(c) ? [] : [c]);
      return;
    }
    setColorPrefs(prev =>
      prev.filter(p => p !== "No Preference").includes(c)
        ? prev.filter(p => p !== c)
        : [...prev.filter(p => p !== "No Preference"), c]
    );
  };

  const canAdvance = () => {
    if (step === 0) return !!bodyType;
    if (step === 1) return !!style;
    if (step === 2) return !!occasion;
    if (step === 3) return !!budget;
    return true;
  };

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("style-recommendations", {
        body: {
          bodyType,
          preferredStyle: style,
          occasion,
          budget,
          colorPreferences: colorPrefs.length ? colorPrefs : undefined,
          measurements,
        },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setRecommendations(data.recommendations || []);
      setShowResults(true);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const saveToProfile = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to save recommendations.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const newSet: SavedRecommendationSet & { _type: string } = {
        _type: "style_recommendation",
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        bodyType,
        style,
        occasion,
        budget,
        measurements,
        recommendations,
      };

      const { data: profile } = await supabase.from("profiles").select("saved_designs").eq("id", user.id).single();
      const existing = Array.isArray(profile?.saved_designs) ? profile.saved_designs : [];
      const updated = [...existing, newSet] as any;

      const { error } = await supabase.from("profiles").update({ saved_designs: updated as any }).eq("id", user.id);
      if (error) throw error;

      setSavedSets(prev => [...prev, newSet]);
      toast({ title: "Saved!", description: "Recommendations saved to your dashboard." });
    } catch (e: any) {
      toast({ title: "Error saving", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const deleteSavedSet = async (id: string) => {
    if (!user) return;
    try {
      const { data: profile } = await supabase.from("profiles").select("saved_designs").eq("id", user.id).single();
      const existing = Array.isArray(profile?.saved_designs) ? profile.saved_designs : [];
      const updated = existing.filter((d: any) => d.id !== id);
      await supabase.from("profiles").update({ saved_designs: updated }).eq("id", user.id);
      setSavedSets(prev => prev.filter(s => s.id !== id));
      setCompareIds(prev => prev.filter(cid => cid !== id));
      toast({ title: "Deleted" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const reset = () => {
    setStep(0);
    setBodyType("");
    setMeasurements({ ...defaultMeasurements });
    setStyle("");
    setOccasion("");
    setBudget("");
    setColorPrefs([]);
    setRecommendations([]);
    setShowResults(false);
  };

  const iconMap: Record<number, typeof Shirt> = { 0: Shirt, 1: Scissors, 2: Palette, 3: Sparkles };
  const stepIcons = [User, Target, Calendar, DollarSign, Palette];

  const comparedSets = savedSets.filter(s => compareIds.includes(s.id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        {/* Hero */}
        <div className="relative overflow-hidden bg-secondary py-20 border-b border-border">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--primary)) 0%, transparent 50%), radial-gradient(circle at 80% 50%, hsl(var(--primary)) 0%, transparent 50%)`
          }} />
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="font-body text-[10px] tracking-[0.3em] uppercase text-primary">AI-Powered Consultation</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl mb-4 leading-tight">
              Your Personal
              <br />
              <span className="italic text-gradient-gold">Style Advisor</span>
            </h1>
            <p className="font-body text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Answer a few questions and our AI consultant will craft bespoke fabric, color, and silhouette recommendations tailored to your unique profile.
            </p>
            {savedSets.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-6 font-body text-xs tracking-wider border-primary/30"
                onClick={() => setShowCompare(true)}
              >
                <GitCompare className="h-3.5 w-3.5 mr-2" /> Compare Saved ({savedSets.length})
              </Button>
            )}
          </div>
        </div>

        <div className="container mx-auto px-6 py-16 max-w-4xl">
          {!showResults ? (
            <>
              {/* Progress */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-3">
                  {STEPS.map((s, i) => {
                    const StepIcon = stepIcons[i];
                    const isActive = i === step;
                    const isDone = i < step;
                    return (
                      <button
                        key={s}
                        onClick={() => i < step && setStep(i)}
                        className={`flex items-center gap-2 transition-all duration-300 ${
                          isActive ? "text-primary" : isDone ? "text-foreground cursor-pointer" : "text-muted-foreground/40"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                          isActive ? "bg-primary text-primary-foreground" : isDone ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground/40"
                        }`}>
                          {isDone ? <Check className="h-3.5 w-3.5" /> : <StepIcon className="h-3.5 w-3.5" />}
                        </div>
                        <span className="font-body text-[10px] tracking-widest uppercase hidden md:inline">{s}</span>
                      </button>
                    );
                  })}
                </div>
                <Progress value={progress} className="h-0.5 bg-muted" />
              </div>

              {/* Step Content */}
              <div className="min-h-[400px]">
                {/* Step 0: Body Type + Measurements */}
                {step === 0 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="font-display text-2xl mb-2">What's your body type?</h2>
                    <p className="font-body text-xs text-muted-foreground mb-6">Select your build and add measurements for precise recommendations.</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                      {BODY_TYPES.map(b => (
                        <button
                          key={b.value}
                          onClick={() => setBodyType(b.value)}
                          className={`group p-5 rounded-lg border text-center transition-all duration-300 hover-lift ${
                            bodyType === b.value
                              ? "border-primary bg-primary/10 glow-gold"
                              : "border-border bg-card hover:border-primary/30"
                          }`}
                        >
                          <span className="text-3xl block mb-2">{b.icon}</span>
                          <span className="font-display text-sm block mb-1">{b.value}</span>
                          <span className="font-body text-[10px] text-muted-foreground leading-tight block">{b.desc}</span>
                        </button>
                      ))}
                    </div>

                    {/* Body Measurements */}
                    <div className="border border-border rounded-lg p-6 bg-card">
                      <div className="flex items-center gap-2 mb-5">
                        <Ruler className="h-4 w-4 text-primary" />
                        <h3 className="font-display text-sm">Body Measurements</h3>
                        <span className="font-body text-[10px] text-muted-foreground ml-auto">For precise fit & silhouette matching</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {MEASUREMENT_FIELDS.map(f => (
                          <div key={f.key} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">{f.label}</label>
                              <span className="font-display text-sm text-primary">{measurements[f.key]} {f.unit}</span>
                            </div>
                            <Slider
                              value={[measurements[f.key]]}
                              onValueChange={([v]) => setMeasurements(prev => ({ ...prev, [f.key]: v }))}
                              min={f.min}
                              max={f.max}
                              step={f.step}
                              className="w-full"
                            />
                            <div className="flex justify-between">
                              <span className="font-body text-[9px] text-muted-foreground/60">{f.min}{f.unit}</span>
                              <span className="font-body text-[9px] text-muted-foreground/60">{f.max}{f.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 1: Style */}
                {step === 1 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="font-display text-2xl mb-2">Your preferred style?</h2>
                    <p className="font-body text-xs text-muted-foreground mb-8">Choose the aesthetic that resonates with your personality.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {STYLES.map(s => {
                        const SIcon = s.icon;
                        return (
                          <button
                            key={s.value}
                            onClick={() => setStyle(s.value)}
                            className={`group p-5 rounded-lg border text-left transition-all duration-300 hover-lift ${
                              style === s.value
                                ? "border-primary bg-primary/10 glow-gold"
                                : "border-border bg-card hover:border-primary/30"
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <SIcon className={`h-5 w-5 transition-colors ${
                                style === s.value ? "text-primary" : "text-muted-foreground group-hover:text-primary/60"
                              }`} />
                              <span className="font-display text-sm">{s.value}</span>
                            </div>
                            <p className="font-body text-[11px] text-muted-foreground leading-relaxed">{s.desc}</p>
                            <p className="font-body text-[10px] text-muted-foreground/60 mt-1.5 italic leading-snug">{s.details}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 2: Occasion */}
                {step === 2 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="font-display text-2xl mb-2">What's the occasion?</h2>
                    <p className="font-body text-xs text-muted-foreground mb-8">We'll fine-tune formality, fabric weight, and accessories accordingly.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {OCCASIONS.map(o => (
                        <button
                          key={o.value}
                          onClick={() => setOccasion(o.value)}
                          className={`group p-4 rounded-lg border text-left transition-all duration-300 hover-lift ${
                            occasion === o.value
                              ? "border-primary bg-primary/10 glow-gold"
                              : "border-border bg-card hover:border-primary/30"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xl">{o.emoji}</span>
                            <span className="font-display text-sm">{o.value}</span>
                          </div>
                          <p className="font-body text-[10px] text-muted-foreground leading-snug">{o.desc}</p>
                          <Badge variant="secondary" className="text-[8px] mt-2 tracking-widest">{o.formality}</Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Budget */}
                {step === 3 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="font-display text-2xl mb-2">Your investment range?</h2>
                    <p className="font-body text-xs text-muted-foreground mb-8">This guides our fabric, construction method, and finishing recommendations.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {BUDGETS.map(b => (
                        <button
                          key={b.value}
                          onClick={() => setBudget(b.value)}
                          className={`group p-6 rounded-lg border text-left transition-all duration-300 hover-lift ${
                            budget === b.value
                              ? "border-primary bg-primary/10 glow-gold"
                              : "border-border bg-card hover:border-primary/30"
                          }`}
                        >
                          <span className="font-display text-base block mb-1">{b.value}</span>
                          <span className="font-body text-primary text-sm block mb-1">{b.range}</span>
                          <span className="font-body text-[11px] text-muted-foreground block">{b.desc}</span>
                          <Separator className="my-2" />
                          <span className="font-body text-[9px] text-muted-foreground/70 italic block">Includes: {b.includes}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Color Preferences */}
                {step === 4 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="font-display text-2xl mb-2">Color preferences?</h2>
                    <p className="font-body text-xs text-muted-foreground mb-8">Select any colors you gravitate towards, or skip for AI's best judgment.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
                      {COLOR_PREFS.map(c => (
                        <button
                          key={c.value}
                          onClick={() => toggleColor(c.value)}
                          className={`group p-3 rounded-lg border text-center transition-all duration-300 ${
                            colorPrefs.includes(c.value)
                              ? "border-primary bg-primary/10"
                              : "border-border bg-card hover:border-primary/30"
                          }`}
                        >
                          {c.hex && (
                            <div
                              className="w-8 h-8 rounded-full mx-auto mb-2 border border-border/50"
                              style={{ backgroundColor: c.hex }}
                            />
                          )}
                          <span className="font-display text-[11px] block">{c.value}</span>
                          <span className="font-body text-[9px] text-muted-foreground">{c.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={() => setStep(s => s - 1)}
                  disabled={step === 0}
                  className="font-body text-xs tracking-wider"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>

                {step < STEPS.length - 1 ? (
                  <Button
                    variant="hero"
                    onClick={() => setStep(s => s + 1)}
                    disabled={!canAdvance()}
                    className="font-body text-xs tracking-wider px-8"
                  >
                    Continue <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    variant="hero"
                    onClick={getRecommendations}
                    disabled={loading}
                    className="font-body text-xs tracking-wider px-8"
                  >
                    {loading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Sparkles className="h-4 w-4 mr-2" /> Get Recommendations</>
                    )}
                  </Button>
                )}
              </div>

              {/* Summary strip */}
              <div className="mt-8 flex flex-wrap gap-2">
                {bodyType && <Badge variant="secondary" className="font-body text-[10px]">🧍 {bodyType}</Badge>}
                {measurements.height !== defaultMeasurements.height && (
                  <Badge variant="secondary" className="font-body text-[10px]">📏 {measurements.height}cm / {measurements.weight}kg</Badge>
                )}
                {style && <Badge variant="secondary" className="font-body text-[10px]">✨ {style}</Badge>}
                {occasion && <Badge variant="secondary" className="font-body text-[10px]">📅 {occasion}</Badge>}
                {budget && <Badge variant="secondary" className="font-body text-[10px]">💰 {budget}</Badge>}
                {colorPrefs.length > 0 && <Badge variant="secondary" className="font-body text-[10px]">🎨 {colorPrefs.join(", ")}</Badge>}
              </div>
            </>
          ) : (
            /* Results */
            <div ref={resultsRef} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Profile Summary */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-4">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  <span className="font-body text-[10px] tracking-[0.3em] uppercase text-primary">Analysis Complete</span>
                </div>
                <h2 className="font-display text-3xl md:text-4xl mb-3">
                  Your Curated <span className="italic text-gradient-gold">Collection</span>
                </h2>
                <p className="font-body text-xs text-muted-foreground max-w-md mx-auto mb-4">
                  Based on your {bodyType.toLowerCase()} build ({measurements.height}cm, {measurements.chest}cm chest), {style.toLowerCase()} aesthetic, and {occasion.toLowerCase()} needs.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <Badge variant="outline" className="font-body text-[10px] border-primary/30">🧍 {bodyType}</Badge>
                  <Badge variant="outline" className="font-body text-[10px] border-primary/30">📏 {measurements.height}cm</Badge>
                  <Badge variant="outline" className="font-body text-[10px] border-primary/30">✨ {style}</Badge>
                  <Badge variant="outline" className="font-body text-[10px] border-primary/30">📅 {occasion}</Badge>
                  <Badge variant="outline" className="font-body text-[10px] border-primary/30">💰 {budget}</Badge>
                </div>
                <Separator className="max-w-xs mx-auto" />
              </div>

              {/* Recommendation Cards */}
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {recommendations.map((rec, i) => {
                  const Icon = iconMap[i % 4] || Sparkles;
                  return (
                    <Card
                      key={i}
                      className="border-border bg-card hover:border-primary/30 transition-all duration-500 hover-lift group overflow-hidden"
                      style={{ animationDelay: `${i * 150}ms` }}
                    >
                      <CardContent className="p-0">
                        <div className="p-5 pb-4 border-b border-border bg-secondary/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-display text-base">{rec.garment}</h3>
                              <p className="font-display text-sm text-primary">৳{rec.priceRange}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-5 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-md bg-secondary/50">
                              <p className="font-body text-[9px] tracking-widest uppercase text-primary mb-1">Fabric</p>
                              <p className="font-body text-xs text-foreground leading-snug">{rec.fabric}</p>
                            </div>
                            <div className="p-3 rounded-md bg-secondary/50">
                              <p className="font-body text-[9px] tracking-widest uppercase text-primary mb-1">Color</p>
                              <p className="font-body text-xs text-foreground leading-snug">{rec.color}</p>
                            </div>
                          </div>
                          <div className="p-3 rounded-md bg-secondary/50">
                            <p className="font-body text-[9px] tracking-widest uppercase text-primary mb-1">Styling Tip</p>
                            <p className="font-body text-xs text-foreground leading-snug">{rec.tip}</p>
                          </div>
                          <p className="font-body text-[10px] text-muted-foreground italic leading-relaxed pt-1">
                            "{rec.reasoning}"
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="ghost" onClick={reset} className="font-body text-xs tracking-wider">
                  <RotateCcw className="h-4 w-4 mr-2" /> Start Over
                </Button>
                <Button
                  variant="outline"
                  onClick={saveToProfile}
                  disabled={saving}
                  className="font-body text-xs tracking-wider border-primary/30"
                >
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save to Profile
                </Button>
                <Button variant="hero" className="font-body text-xs tracking-wider px-8" asChild>
                  <a href="/book">
                    Book a Consultation <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Dialog */}
      <Dialog open={showCompare} onOpenChange={setShowCompare}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto bg-background border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-primary" /> Compare Recommendations
            </DialogTitle>
          </DialogHeader>

          {/* Saved sets list */}
          <div className="space-y-3 mb-6">
            <p className="font-body text-xs text-muted-foreground">Select up to 3 sets to compare side by side:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedSets.map(set => (
                <div
                  key={set.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    compareIds.includes(set.id)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                  onClick={() => toggleCompare(set.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        compareIds.includes(set.id) ? "border-primary bg-primary" : "border-muted-foreground/30"
                      }`}>
                        {compareIds.includes(set.id) && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span className="font-display text-sm">{set.bodyType} · {set.style}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => { e.stopPropagation(); deleteSavedSet(set.id); }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-[9px]">{set.occasion}</Badge>
                    <Badge variant="secondary" className="text-[9px]">{set.budget}</Badge>
                    <Badge variant="secondary" className="text-[9px]">{set.measurements.height}cm</Badge>
                  </div>
                  <p className="font-body text-[10px] text-muted-foreground mt-2">
                    {new Date(set.date).toLocaleDateString()} · {set.recommendations.length} items
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Side-by-side comparison */}
          {comparedSets.length >= 2 && (
            <div>
              <Separator className="mb-6" />
              <div className={`grid gap-4 ${comparedSets.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                {comparedSets.map(set => (
                  <div key={set.id} className="space-y-3">
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border text-center">
                      <p className="font-display text-sm">{set.bodyType} · {set.style}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{set.occasion} · {set.budget}</p>
                      <p className="font-body text-[9px] text-muted-foreground/60 mt-1">
                        {set.measurements.height}cm · {set.measurements.chest}cm chest · {set.measurements.waist}cm waist
                      </p>
                    </div>
                    {set.recommendations.map((rec, i) => (
                      <Card key={i} className="border-border bg-card">
                        <CardContent className="p-3 space-y-2">
                          <p className="font-display text-xs">{rec.garment}</p>
                          <div className="space-y-1">
                            <p className="font-body text-[9px] text-muted-foreground">
                              <span className="text-primary">Fabric:</span> {rec.fabric}
                            </p>
                            <p className="font-body text-[9px] text-muted-foreground">
                              <span className="text-primary">Color:</span> {rec.color}
                            </p>
                            <p className="font-body text-[9px] text-primary">৳{rec.priceRange}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {comparedSets.length < 2 && savedSets.length >= 2 && (
            <p className="font-body text-xs text-muted-foreground text-center py-4">Select at least 2 sets to compare</p>
          )}
          {savedSets.length < 2 && (
            <p className="font-body text-xs text-muted-foreground text-center py-4">Save at least 2 recommendation sets to use comparison</p>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default StyleAdvisor;
