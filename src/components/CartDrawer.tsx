import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const CartDrawer = () => {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const count = totalItems();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingBag className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
              {count}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-card border-border flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-lg tracking-wider">Your Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
            <div>
              <p className="font-body text-sm text-muted-foreground">Your cart is empty</p>
              <p className="font-body text-xs text-muted-foreground/60 mt-1">
                Explore our collections to find something extraordinary
              </p>
            </div>
            <Button
              variant="heroOutline"
              size="sm"
              onClick={() => {
                setOpen(false);
                navigate("/#collections");
              }}
            >
              Browse Collections
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded border border-border bg-secondary/30"
                >
                  {/* Product thumbnail */}
                  <div className="w-16 h-16 rounded bg-charcoal-light flex items-center justify-center shrink-0">
                    <span className="font-display text-xl text-muted-foreground/30">
                      {item.name.charAt(0)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-sm truncate">{item.name}</h4>
                    {(item.fabric || item.color || item.style) && (
                      <p className="font-body text-[10px] tracking-wide text-muted-foreground mt-0.5 truncate">
                        {[item.fabric, item.color, item.style].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <p className="font-body text-xs text-primary mt-1">
                      ${item.price.toLocaleString()}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-body text-xs w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex justify-between font-body text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground font-semibold">${totalPrice().toLocaleString()}</span>
              </div>
              <Button
                variant="hero"
                className="w-full"
                onClick={() => {
                  setOpen(false);
                  navigate("/checkout");
                }}
              >
                Proceed to Checkout
              </Button>
              <button
                onClick={clearCart}
                className="w-full text-center font-body text-xs text-muted-foreground hover:text-destructive transition-colors py-1"
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
