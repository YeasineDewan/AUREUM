import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Scissors, Palette, Shirt, Loader2 } from "lucide-react";

const BODY_TYPES = ["Slim", "Athletic", "Average", "Broad", "Stocky"];
const STYLES = ["Classic", "Modern", "Casual Elegant", "Bold & Statement", "Minimalist"];
const OCCASIONS = ["Business Meetings", "Wedding Guest", "Black Tie Event", "Smart Casual", "Everyday Luxury"];

interface Recommendation {
  garment: string;
  fabric: string;
  color: string;
  tip: string;
  priceRange: string;
  reasoning: string;
}

const StyleAdvisor = () => {
  const [bodyType, setBodyType] = useState("");
  const [style, setStyle] = useState("");
  const [occasion, setOccasion] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getRecommendations = async () => {
    if (!bodyType || !style || !occasion) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("style-recommendations", {
        body: { bodyType, preferredStyle: style, occasion },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setRecommendations(data.recommendations || []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const iconMap: Record<number, typeof Shirt> = { 0: Shirt, 1: Scissors, 2: Palette, 3: Sparkles };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="bg-secondary py-16 border-b border-border">
          <div className="container mx-auto px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-3">AI-Powered</p>
            <h1 className="font-display text-4xl md:text-5xl mb-4">
              Style <span className="italic text-gradient-gold">Advisor</span>
            </h1>
            <p className="font-body text-sm text-muted-foreground max-w-lg mx-auto">
              Get personalized fabric, color, and styling recommendations powered by AI, tailored to your body type and preferences.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-4xl">
          {/* Inputs */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div>
              <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-2 block">Body Type</label>
              <Select value={bodyType} onValueChange={setBodyType}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {BODY_TYPES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-2 block">Preferred Style</label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-2 block">Occasion</label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {OCCASIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button variant="hero" className="w-full py-6 text-sm tracking-wider mb-12" onClick={getRecommendations} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {loading ? "Analyzing Your Style..." : "Get AI Recommendations"}
          </Button>

          {/* Results */}
          {recommendations.length > 0 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-center mb-8">
                Your Personalized <span className="italic text-gradient-gold">Recommendations</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {recommendations.map((rec, i) => {
                  const Icon = iconMap[i % 4] || Sparkles;
                  return (
                    <Card key={i} className="border-border bg-card hover:border-primary/20 transition-all hover-lift">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-display text-base">{rec.garment}</h3>
                            <div className="space-y-1.5">
                              <p className="font-body text-xs">
                                <span className="text-primary font-medium">Fabric:</span>{" "}
                                <span className="text-muted-foreground">{rec.fabric}</span>
                              </p>
                              <p className="font-body text-xs">
                                <span className="text-primary font-medium">Color:</span>{" "}
                                <span className="text-muted-foreground">{rec.color}</span>
                              </p>
                              <p className="font-body text-xs">
                                <span className="text-primary font-medium">Tip:</span>{" "}
                                <span className="text-muted-foreground">{rec.tip}</span>
                              </p>
                            </div>
                            <p className="font-body text-[10px] text-muted-foreground italic leading-relaxed mt-2">
                              {rec.reasoning}
                            </p>
                            <p className="font-display text-sm text-primary mt-2">৳{rec.priceRange}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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
