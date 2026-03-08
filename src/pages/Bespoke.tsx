import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Ruler, User, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MeasurementField {
  id: string;
  label: string;
  placeholder: string;
  unit: string;
  group: string;
}

const measurementFields: MeasurementField[] = [
  { id: "chest", label: "Chest", placeholder: "40", unit: "in", group: "Upper Body" },
  { id: "shoulders", label: "Shoulders", placeholder: "18", unit: "in", group: "Upper Body" },
  { id: "neck", label: "Neck", placeholder: "15.5", unit: "in", group: "Upper Body" },
  { id: "armLength", label: "Arm Length", placeholder: "25", unit: "in", group: "Upper Body" },
  { id: "bicep", label: "Bicep", placeholder: "14", unit: "in", group: "Upper Body" },
  { id: "wrist", label: "Wrist", placeholder: "7", unit: "in", group: "Upper Body" },
  { id: "waist", label: "Waist", placeholder: "34", unit: "in", group: "Lower Body" },
  { id: "hips", label: "Hips", placeholder: "40", unit: "in", group: "Lower Body" },
  { id: "inseam", label: "Inseam", placeholder: "32", unit: "in", group: "Lower Body" },
  { id: "thigh", label: "Thigh", placeholder: "23", unit: "in", group: "Lower Body" },
  { id: "outseam", label: "Outseam", placeholder: "42", unit: "in", group: "Lower Body" },
];

const Bespoke = () => {
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [fit, setFit] = useState("");
  const [garmentType, setGarmentType] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleChange = (id: string, value: string) => {
    setMeasurements((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filled = Object.values(measurements).filter(Boolean).length;
    if (filled < 5) {
      toast({ title: "Please fill at least 5 measurements", variant: "destructive" });
      return;
    }
    if (!garmentType) {
      toast({ title: "Please select a garment type", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "Measurements saved", description: "Our tailors will review your profile." });
  };

  const groups = [...new Set(measurementFields.map((f) => f.group))];

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-20 flex flex-col items-center justify-center text-center px-6">
          <CheckCircle className="h-16 w-16 text-primary mb-6" />
          <h1 className="font-display text-4xl mb-4 text-foreground">Measurements Received</h1>
          <p className="text-muted-foreground max-w-md mb-8">
            Our master tailors will review your measurements and craft your perfect garment. You'll receive a confirmation within 24 hours.
          </p>
          <Button variant="hero" size="lg" onClick={() => setSubmitted(false)}>
            Submit Another
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Ruler className="h-5 w-5 text-primary" />
              <span className="font-body text-xs tracking-widest uppercase text-primary">Bespoke Service</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Your Measurements</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Provide your body measurements for a garment tailored exclusively for you. All measurements in inches.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Garment & Fit Selection */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Garment Details
                </CardTitle>
                <CardDescription>Select the type of garment and your preferred fit.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Garment Type</Label>
                  <Select value={garmentType} onValueChange={setGarmentType}>
                    <SelectTrigger><SelectValue placeholder="Select garment" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suit">Full Suit</SelectItem>
                      <SelectItem value="blazer">Blazer</SelectItem>
                      <SelectItem value="shirt">Dress Shirt</SelectItem>
                      <SelectItem value="trousers">Trousers</SelectItem>
                      <SelectItem value="overcoat">Overcoat</SelectItem>
                      <SelectItem value="vest">Waistcoat / Vest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Fit</Label>
                  <Select value={fit} onValueChange={setFit}>
                    <SelectTrigger><SelectValue placeholder="Select fit" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slim">Slim Fit</SelectItem>
                      <SelectItem value="regular">Regular Fit</SelectItem>
                      <SelectItem value="relaxed">Relaxed Fit</SelectItem>
                      <SelectItem value="athletic">Athletic Fit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Measurement Groups */}
            {groups.map((group) => (
              <Card key={group} className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">{group}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {measurementFields
                    .filter((f) => f.group === group)
                    .map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id}>{field.label} ({field.unit})</Label>
                        <Input
                          id={field.id}
                          type="number"
                          step="0.25"
                          min="0"
                          placeholder={field.placeholder}
                          value={measurements[field.id] || ""}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                        />
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}

            {/* Notes */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Additional Notes</CardTitle>
                <CardDescription>Any preferences, posture details, or special requests.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g. One shoulder slightly lower, prefer extra room in the chest..."
                  rows={4}
                />
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button type="submit" variant="hero" size="lg" className="px-12">
                Submit Measurements
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Bespoke;
