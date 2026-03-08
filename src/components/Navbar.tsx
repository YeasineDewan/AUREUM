import { useState } from "react";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import CartDrawer from "@/components/CartDrawer";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: "Collections", href: "/#collections" },
    { label: "Customize", href: "/customize" },
    { label: "Bespoke", href: "/bespoke" },
    { label: "Admin", href: "/admin" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="font-display text-2xl tracking-wider text-primary">
          AUREUM
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-body text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
          </Button>
          <CartDrawer />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <CartDrawer />
          <button onClick={() => setIsOpen(!isOpen)} className="text-foreground">
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-background border-t border-border px-6 py-8 space-y-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block font-body text-sm tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
