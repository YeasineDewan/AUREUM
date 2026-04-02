import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles, Scissors, Palette, Shirt, Loader2, ChevronRight, ChevronLeft,
  User, Calendar, Target, DollarSign, Heart, RotateCcw, ArrowRight, Check,
  Ruler, Star, Gem, Crown, Wand2
} from "lucide-react";

const BODY_TYPES = [
  { value: "Slim", icon: "🧍", desc: "Lean build, narrow shoulders" },
  { value: "Athletic", icon: "💪", desc: "Broad shoulders, defined build" },
  { value: "Average", icon: "👤", desc: "Balanced proportions" },
  { value: "Broad", icon: "🏋️", desc: "Wide frame, strong build" },
  { value: "Stocky", icon: "🧱", desc: "Solid, compact build" },
];

const STYLES = [
  { value: "Classic", icon: Crown, desc: "Timeless elegance & sophistication" },
  { value: "Modern", icon: Target, desc: "Clean lines & contemporary cuts" },
  { value: "Casual Elegant", icon: Star, desc: "Relaxed refinement" },
  { value: "Bold & Statement", icon: Gem, desc: "Stand out with confidence" },
  { value: "Minimalist", icon: Wand2, desc: "Less is more" },
];

const OCCASIONS = [
  { value: "Business Meetings", emoji: "💼" },
  { value: "Wedding Guest", emoji: "💍" },
  { value: "Black Tie Event", emoji: "🎩" },
  { value: "Smart Casual", emoji: "👔" },
  { value: "Everyday Luxury", emoji: "✨" },
  { value: "Date Night", emoji: "🌹" },
  { value: "Cultural Event", emoji: "🎭" },
  { value: "Travel", emoji: "✈️" },
];

const BUDGETS = [
  { value: "Standard", range: "৳15,000 – ৳30,000", desc: "Quality essentials" },
  { value: "Premium", range: "৳30,000 – ৳60,000", desc: "Elevated wardrobe" },
  { value: "Luxury", range: "৳60,000 – ৳120,000", desc: "Finest materials" },
  { value: "Bespoke Elite", range: "৳120,000+", desc: "No compromises" },
];

const COLOR_PREFS = ["Navy", "Charcoal", "Black", "Brown", "Olive", "Burgundy", "Cream", "Light Blue", "No Preference"];

interface Recommendation {
  garment: string;
  fabric: string;
  color: string;
  tip: string;
  priceRange: string;
  reasoning: string;
}

const STEPS = ["Body Type", "Style", "Occasion", "Budget", "Colors"];

const StyleAdvisor = () => {
  const [step, setStep] = useState(0);
  const [bodyType, setBodyType] = useState("");
  const [style, setStyle] = useState("");
  const [occasion, setOccasion] = useState("");
  const [budget, setBudget] = useState("");
  const [colorPrefs, setColorPrefs] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const progress = ((step + 1) / STEPS.length) * 100;

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

  const reset = () => {
    setStep(0);
    setBodyType("");
    setStyle("");
    setOccasion("");
    setBudget("");
    setColorPrefs([]);
    setRecommendations([]);
    setShowResults(false);
  };

  const iconMap: Record<number, typeof Shirt> = { 0: Shirt, 1: Scissors, 2: Palette, 3: Sparkles };
  const stepIcons = [User, Target, Calendar, DollarSign, Palette];

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
              <div className="min-h-[320px]">
                {/* Step 0: Body Type */}
                {step === 0 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="font-display text-2xl mb-2">What's your body type?</h2>
                    <p className="font-body text-xs text-muted-foreground mb-8">This helps us recommend the most flattering cuts and silhouettes.</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
                  </div>
                )}

                {/* Step 1: Style */}
                {step === 1 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="font-display text-2xl mb-2">Your preferred style?</h2>
                    <p className="font-body text-xs text-muted-foreground mb-8">Choose the aesthetic that resonates with your personality.</p>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {STYLES.map(s => {
                        const SIcon = s.icon;
                        return (
                          <button
                            key={s.value}
                            onClick={() => setStyle(s.value)}
                            className={`group p-5 rounded-lg border text-center transition-all duration-300 hover-lift ${
                              style === s.value
                                ? "border-primary bg-primary/10 glow-gold"
                                : "border-border bg-card hover:border-primary/30"
                            }`}
                          >
                            <SIcon className={`h-6 w-6 mx-auto mb-2 transition-colors ${
                              style === s.value ? "text-primary" : "text-muted-foreground group-hover:text-primary/60"
                            }`} />
                            <span className="font-display text-sm block mb-1">{s.value}</span>
                            <span className="font-body text-[10px] text-muted-foreground leading-tight block">{s.desc}</span>
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {OCCASIONS.map(o => (
                        <button
                          key={o.value}
                          onClick={() => setOccasion(o.value)}
                          className={`group p-5 rounded-lg border text-left transition-all duration-300 hover-lift ${
                            occasion === o.value
                              ? "border-primary bg-primary/10 glow-gold"
                              : "border-border bg-card hover:border-primary/30"
                          }`}
                        >
                          <span className="text-2xl block mb-2">{o.emoji}</span>
                          <span className="font-display text-sm block">{o.value}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Budget */}
                {step === 3 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="font-display text-2xl mb-2">Your investment range?</h2>
                    <p className="font-body text-xs text-muted-foreground mb-8">This guides our fabric and craftsmanship recommendations.</p>
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
                          <span className="font-body text-[10px] text-muted-foreground">{b.desc}</span>
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
                    <div className="flex flex-wrap gap-3 mb-8">
                      {COLOR_PREFS.map(c => (
                        <button
                          key={c}
                          onClick={() => toggleColor(c)}
                          className={`px-5 py-2.5 rounded-full border font-body text-xs tracking-wide transition-all duration-300 ${
                            colorPrefs.includes(c)
                              ? "border-primary bg-primary/15 text-primary"
                              : "border-border bg-card text-muted-foreground hover:border-primary/30"
                          }`}
                        >
                          {c}
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
                <p className="font-body text-xs text-muted-foreground max-w-md mx-auto mb-6">
                  Based on your {bodyType.toLowerCase()} build, {style.toLowerCase()} aesthetic, and {occasion.toLowerCase()} needs.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <Badge variant="outline" className="font-body text-[10px] border-primary/30">🧍 {bodyType}</Badge>
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
                        {/* Card header */}
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
                        {/* Card body */}
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
      <Footer />
    </div>
  );
};

export default StyleAdvisor;
