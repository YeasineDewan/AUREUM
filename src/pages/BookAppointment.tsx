import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, Video, Scissors, Ruler } from "lucide-react";

const APPOINTMENT_TYPES = [
  { id: "consultation", name: "Style Consultation", icon: Scissors, description: "Discuss your vision with our expert tailors", duration: "45 min" },
  { id: "measurement", name: "Body Measurement", icon: Ruler, description: "Precise measurements for the perfect fit", duration: "30 min" },
  { id: "fitting", name: "Fitting Session", icon: MapPin, description: "Try on and fine-tune your garment", duration: "60 min" },
  { id: "virtual", name: "Virtual Consultation", icon: Video, description: "Meet with a tailor online from anywhere", duration: "30 min" },
];

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM",
];

const BookAppointment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(APPOINTMENT_TYPES[0]);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      toast({ title: "Please select a date and time", variant: "destructive" });
      return;
    }
    setLoading(true);

    const { error } = await supabase.from("appointments").insert({
      user_id: user?.id || null,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      appointment_type: selectedType.id,
      preferred_date: format(date, "yyyy-MM-dd"),
      preferred_time: time,
      notes,
    });

    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Appointment booked!", description: `${selectedType.name} on ${format(date, "PPP")} at ${time}` });
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <p className="font-body text-xs tracking-[0.3em] uppercase text-primary mb-3">Book a Session</p>
            <h1 className="font-display text-3xl md:text-4xl mb-3">
              Schedule Your <span className="italic text-gradient-gold">Appointment</span>
            </h1>
            <p className="font-body text-sm text-muted-foreground max-w-md mx-auto">
              Meet with our expert tailors for a personalized consultation, measurement, or fitting session.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Appointment Type */}
            <div className="mb-8">
              <h2 className="font-body text-xs tracking-widest uppercase text-foreground mb-4">Select Service</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {APPOINTMENT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`p-4 rounded-sm border text-left transition-all ${
                      selectedType.id === type.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-muted-foreground"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <type.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-body text-sm font-medium text-foreground">{type.name}</p>
                        <p className="font-body text-[10px] text-muted-foreground mt-0.5">{type.description}</p>
                        <p className="font-body text-[10px] text-primary mt-1">{type.duration}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Date & Time */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Date & Time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-body text-xs">Preferred Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-body text-xs", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                          {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(d) => d < new Date() || d.getDay() === 0}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-body text-xs">Preferred Time</Label>
                    <Select value={time} onValueChange={setTime}>
                      <SelectTrigger className="bg-secondary border-border font-body text-xs">
                        <Clock className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((slot) => (
                          <SelectItem key={slot} value={slot} className="font-body text-xs">{slot}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Your Details</CardTitle>
                  <CardDescription className="font-body text-[10px]">
                    {user ? "Auto-filled from your account" : "Please provide your contact information"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="font-body text-xs">Full Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required className="bg-secondary border-border" placeholder="Your name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-body text-xs">Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-secondary border-border" placeholder="you@example.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-body text-xs">Phone (optional)</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-secondary border-border" placeholder="+880..." />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            <div className="mt-6 space-y-2">
              <Label className="font-body text-xs">Additional Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-secondary border-border font-body text-xs"
                placeholder="Any special requirements or preferences..."
                rows={3}
              />
            </div>

            <div className="mt-8 flex gap-3">
              <Button type="submit" variant="hero" size="lg" disabled={loading} className="flex-1 md:flex-none">
                {loading ? "Booking..." : "Confirm Booking"}
              </Button>
              <Button type="button" variant="heroOutline" size="lg" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookAppointment;
