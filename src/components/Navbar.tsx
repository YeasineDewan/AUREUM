import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User, LogOut, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CartDrawer from "@/components/CartDrawer";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const navLinks = [
    { label: "Collections", href: "/products" },
    { label: "Customize", href: "/customize" },
    { label: "Bespoke", href: "/bespoke" },
    { label: "Book", href: "/book" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl tracking-wider text-primary">
          AUREUM
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="font-body text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <User className="h-4 w-4" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="font-body text-xs font-medium truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="font-body text-xs cursor-pointer">
                    <User className="h-3.5 w-3.5 mr-2" /> My Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/book" className="font-body text-xs cursor-pointer">
                    <CalendarDays className="h-3.5 w-3.5 mr-2" /> Book Appointment
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="font-body text-xs cursor-pointer text-destructive">
                  <LogOut className="h-3.5 w-3.5 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="heroOutline" size="sm" asChild>
              <Link to="/auth" className="font-body text-xs tracking-wider">
                Sign In
              </Link>
            </Button>
          )}
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
            <Link
              key={link.label}
              to={link.href}
              className="block font-body text-sm tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-border">
            {user ? (
              <>
                <Link to="/dashboard" className="block font-body text-sm text-muted-foreground hover:text-primary mb-4" onClick={() => setIsOpen(false)}>
                  My Dashboard
                </Link>
                <button onClick={() => { signOut(); setIsOpen(false); }} className="font-body text-sm text-destructive">
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/auth" className="block font-body text-sm text-primary" onClick={() => setIsOpen(false)}>
                Sign In / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
