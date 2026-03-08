import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cartStore";
import { ShoppingBag, ArrowLeft, Check, Truck, Shield, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [placed, setPlaced] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const subtotal = totalPrice();
  const shipping = subtotal >= 1000 ? 0 : 45;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + tax;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.address || !form.city || !form.zip) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setPlaced(true);
    clearCart();
  };

  if (placed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-24 px-4">
          <div className="container mx-auto max-w-lg text-center py-24">
            <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl mb-3">Order Confirmed</h1>
            <p className="font-body text-sm text-muted-foreground mb-2">
              Thank you for your order. A confirmation email has been sent to{" "}
              <span className="text-foreground">{form.email}</span>.
            </p>
            <p className="font-body text-xs text-muted-foreground mb-8">
              Order #{Math.random().toString(36).substring(2, 10).toUpperCase()}
            </p>
            <Button variant="hero" onClick={() => navigate("/")}>
              Continue Shopping
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-24 px-4">
          <div className="container mx-auto max-w-lg text-center py-24">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/20 mx-auto mb-6" />
            <h1 className="font-display text-2xl mb-3">Your cart is empty</h1>
            <p className="font-body text-sm text-muted-foreground mb-8">
              Add some items before checking out.
            </p>
            <Button variant="hero" onClick={() => navigate("/#collections")}>
              Browse Collections
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 font-body text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>

          <h1 className="font-display text-3xl md:text-4xl mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Shipping Form */}
              <div className="lg:col-span-3 space-y-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="font-display text-base flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" /> Shipping Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="font-body text-xs tracking-wide">
                          First Name *
                        </Label>
                        <Input name="firstName" value={form.firstName} onChange={handleChange} className="bg-secondary/40 border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="font-body text-xs tracking-wide">
                          Last Name *
                        </Label>
                        <Input name="lastName" value={form.lastName} onChange={handleChange} className="bg-secondary/40 border-border" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-body text-xs tracking-wide">Email *</Label>
                        <Input name="email" type="email" value={form.email} onChange={handleChange} className="bg-secondary/40 border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-body text-xs tracking-wide">Phone</Label>
                        <Input name="phone" type="tel" value={form.phone} onChange={handleChange} className="bg-secondary/40 border-border" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-body text-xs tracking-wide">Address *</Label>
                      <Input name="address" value={form.address} onChange={handleChange} className="bg-secondary/40 border-border" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="font-body text-xs tracking-wide">City *</Label>
                        <Input name="city" value={form.city} onChange={handleChange} className="bg-secondary/40 border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-body text-xs tracking-wide">State</Label>
                        <Input name="state" value={form.state} onChange={handleChange} className="bg-secondary/40 border-border" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-body text-xs tracking-wide">ZIP *</Label>
                        <Input name="zip" value={form.zip} onChange={handleChange} className="bg-secondary/40 border-border" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-body text-xs tracking-wide">Country</Label>
                      <Input name="country" value={form.country} onChange={handleChange} placeholder="United States" className="bg-secondary/40 border-border" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="font-display text-base flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" /> Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 rounded border border-dashed border-border text-center">
                      <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="font-body text-xs text-muted-foreground">
                        Payment processing will be configured with a secure payment provider.
                        <br />
                        For now, click "Place Order" to simulate the checkout.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-2">
                <Card className="border-primary/30 bg-card sticky top-24">
                  <CardHeader>
                    <CardTitle className="font-display text-base">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-12 h-12 rounded bg-charcoal-light flex items-center justify-center shrink-0">
                            <span className="font-display text-sm text-muted-foreground/30">
                              {item.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-xs truncate">{item.name}</p>
                            {(item.fabric || item.color || item.style) && (
                              <p className="font-body text-[10px] text-muted-foreground truncate">
                                {[item.fabric, item.color, item.style].filter(Boolean).join(" · ")}
                              </p>
                            )}
                            <p className="font-body text-[10px] text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <span className="font-body text-xs text-primary shrink-0">
                            ${(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator className="bg-border" />

                    <div className="space-y-2 font-body text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span className="text-foreground">${subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Shipping</span>
                        <span className="text-foreground">
                          {shipping === 0 ? (
                            <span className="text-primary">Complimentary</span>
                          ) : (
                            `$${shipping}`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Estimated Tax</span>
                        <span className="text-foreground">${tax.toLocaleString()}</span>
                      </div>
                    </div>

                    <Separator className="bg-border" />

                    <div className="flex justify-between font-semibold text-sm">
                      <span>Total</span>
                      <span className="text-primary">${total.toLocaleString()}</span>
                    </div>

                    {shipping === 0 && (
                      <p className="font-body text-[10px] text-primary/70 text-center">
                        ✦ Complimentary shipping on orders over $1,000
                      </p>
                    )}

                    <Button type="submit" variant="hero" className="w-full">
                      Place Order — ${total.toLocaleString()}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
