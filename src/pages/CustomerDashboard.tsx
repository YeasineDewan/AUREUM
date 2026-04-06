import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingBag, Package, Truck, FileText, User, MapPin, CreditCard,
  CheckCircle2, Clock, AlertCircle, CalendarDays, Palette, Save,
  Sparkles, GitCompare, Shirt, Scissors, ExternalLink, Trash2, Ruler,
} from "lucide-react";
import { useState } from "react";

const statusIcon = (s: string) => {
  switch (s) {
    case "Delivered": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "Shipped": return <Truck className="h-4 w-4 text-blue-400" />;
    case "In Production": return <Clock className="h-4 w-4 text-primary" />;
    default: return <AlertCircle className="h-4 w-4 text-orange-400" />;
  }
};

const CustomerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const { data: appointments = [] } = useQuery({
    queryKey: ["my-appointments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user!.id)
        .order("preferred_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleSaveProfile = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", user.id);
    if (error) toast({ title: "Error saving", description: error.message, variant: "destructive" });
    else toast({ title: "Profile updated" });
  };

  const measurements = profile?.body_measurements as Record<string, string> | null;
  const savedDesigns = (profile?.saved_designs as any[]) || [];
  const styleRecommendations = savedDesigns.filter((d: any) => d._type === "style_recommendation");
  const customDesigns = savedDesigns.filter((d: any) => d._type !== "style_recommendation");

  const deleteRecommendationSet = async (id: string) => {
    if (!user) return;
    try {
      const updated = savedDesigns.filter((d: any) => d.id !== id);
      await supabase.from("profiles").update({ saved_designs: updated }).eq("id", user.id);
      refetchProfile();
      toast({ title: "Recommendation set deleted" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse font-display text-xl text-muted-foreground">Loading...</div>
    </div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl text-foreground">
                {profile?.full_name ? `Welcome, ${profile.full_name}` : "My Dashboard"}
              </h1>
              <p className="font-body text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Appointments", value: appointments.length, icon: CalendarDays },
              { label: "Style Sets", value: styleRecommendations.length, icon: Sparkles },
              { label: "Saved Designs", value: customDesigns.length, icon: Palette },
              { label: "Style", value: profile?.preferred_style || "Classic", icon: CreditCard },
            ].map((s) => (
              <Card key={s.label} className="border-border bg-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-lg text-foreground">{s.value}</p>
                    <p className="font-body text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="appointments" className="space-y-4">
            <TabsList className="bg-secondary w-full grid grid-cols-4">
              <TabsTrigger value="appointments" className="text-xs"><CalendarDays className="h-3.5 w-3.5 mr-1.5" /> Appointments</TabsTrigger>
              <TabsTrigger value="measurements" className="text-xs"><Package className="h-3.5 w-3.5 mr-1.5" /> Measurements</TabsTrigger>
              <TabsTrigger value="designs" className="text-xs"><Palette className="h-3.5 w-3.5 mr-1.5" /> Designs</TabsTrigger>
              <TabsTrigger value="profile" className="text-xs"><User className="h-3.5 w-3.5 mr-1.5" /> Profile</TabsTrigger>
            </TabsList>

            {/* APPOINTMENTS */}
            <TabsContent value="appointments">
              <Card className="border-border bg-card">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="font-display text-base">My Appointments</CardTitle>
                  <Button variant="heroOutline" size="sm" className="text-xs" onClick={() => navigate("/book")}>
                    Book New
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {appointments.length === 0 ? (
                    <p className="font-body text-sm text-muted-foreground text-center py-8">No appointments yet</p>
                  ) : appointments.map((apt: any) => (
                    <div key={apt.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-body text-sm font-medium capitalize">{apt.appointment_type}</p>
                          <p className="font-body text-xs text-muted-foreground">{apt.preferred_date} at {apt.preferred_time}</p>
                        </div>
                      </div>
                      <Badge variant={apt.status === "confirmed" ? "default" : "outline"} className="text-[10px] capitalize">{apt.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* MEASUREMENTS */}
            <TabsContent value="measurements">
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base">Saved Body Measurements</CardTitle>
                </CardHeader>
                <CardContent>
                  {measurements && Object.keys(measurements).length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(measurements).map(([key, value]) => (
                        <div key={key} className="p-3 rounded-lg bg-secondary/30 border border-border">
                          <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">
                            {key.replace(/([A-Z])/g, " $1")}
                          </p>
                          <p className="font-display text-lg text-foreground mt-1">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="font-body text-sm text-muted-foreground text-center py-8">
                      No measurements saved yet. Use the AI Body Scanner in the Customize section.
                    </p>
                  )}
                  <Button variant="heroOutline" className="w-full mt-4 text-xs" onClick={() => navigate("/customize")}>
                    Update Measurements via AI Scanner
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SAVED DESIGNS */}
            <TabsContent value="designs">
              <div className="space-y-6">
                {/* AI Style Recommendations */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <CardTitle className="font-display text-base">AI Style Recommendations</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {styleRecommendations.length >= 2 && (
                        <Button variant="outline" size="sm" className="text-xs border-primary/30" onClick={() => navigate("/style-advisor")}>
                          <GitCompare className="h-3.5 w-3.5 mr-1.5" /> Compare
                        </Button>
                      )}
                      <Button variant="heroOutline" size="sm" className="text-xs" onClick={() => navigate("/style-advisor")}>
                        <Sparkles className="h-3.5 w-3.5 mr-1.5" /> New Consultation
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {styleRecommendations.length === 0 ? (
                      <div className="text-center py-8">
                        <Sparkles className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="font-body text-sm text-muted-foreground">No AI recommendations yet</p>
                        <p className="font-body text-xs text-muted-foreground/60 mt-1">Get personalized fabric and style suggestions from our AI advisor</p>
                        <Button variant="heroOutline" className="mt-3 text-xs" onClick={() => navigate("/style-advisor")}>
                          Start AI Consultation
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {styleRecommendations.map((set: any) => (
                          <div key={set.id} className="p-4 rounded-lg border border-border bg-secondary/20 hover:border-primary/20 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Sparkles className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-display text-sm">{set.bodyType} · {set.style}</p>
                                  <p className="font-body text-[10px] text-muted-foreground">
                                    {new Date(set.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => deleteRecommendationSet(set.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                                </Button>
                              </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              <Badge variant="secondary" className="text-[9px]">📅 {set.occasion}</Badge>
                              <Badge variant="secondary" className="text-[9px]">💰 {set.budget}</Badge>
                              {set.measurements && (
                                <>
                                  <Badge variant="secondary" className="text-[9px]">📏 {set.measurements.height}cm</Badge>
                                  <Badge variant="secondary" className="text-[9px]">⚖️ {set.measurements.weight}kg</Badge>
                                </>
                              )}
                            </div>

                            {/* Recommendation previews */}
                            <div className="grid grid-cols-2 gap-2">
                              {(set.recommendations || []).slice(0, 4).map((rec: any, i: number) => (
                                <div key={i} className="p-2.5 rounded-md bg-background/50 border border-border/50">
                                  <p className="font-display text-[11px] text-foreground">{rec.garment}</p>
                                  <p className="font-body text-[9px] text-muted-foreground truncate">{rec.fabric}</p>
                                  <p className="font-body text-[9px] text-primary mt-0.5">৳{rec.priceRange}</p>
                                </div>
                              ))}
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full mt-3 text-[10px] tracking-wider text-primary hover:text-primary"
                              onClick={() => navigate("/style-advisor")}
                            >
                              <ExternalLink className="h-3 w-3 mr-1.5" /> View Full Details & Compare
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Custom Designs */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-base">Custom Designs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {customDesigns.length === 0 ? (
                      <div className="text-center py-8">
                        <Palette className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="font-body text-sm text-muted-foreground">No saved designs yet</p>
                        <Button variant="heroOutline" className="mt-3 text-xs" onClick={() => navigate("/customize")}>
                          Start Customizing
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {customDesigns.map((design: any, i: number) => (
                          <div key={i} className="p-4 rounded-lg border border-border bg-secondary/20">
                            <p className="font-display text-sm">{design.name || `Design ${i + 1}`}</p>
                            <p className="font-body text-[10px] text-muted-foreground mt-1">{design.garmentType || "Custom"}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* PROFILE */}
            <TabsContent value="profile">
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base">Profile Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-1.5 block">Full Name</label>
                      <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-secondary border-border" />
                    </div>
                    <div>
                      <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-1.5 block">Phone</label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-secondary border-border" />
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-secondary/20">
                    <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Email</p>
                    <p className="font-body text-sm text-foreground">{user.email}</p>
                  </div>
                  <Button variant="hero" className="w-full text-xs" onClick={handleSaveProfile}>
                    <Save className="h-3.5 w-3.5 mr-2" /> Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CustomerDashboard;
