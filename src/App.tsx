import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AIChatWidget from "@/components/AIChatWidget";
import Index from "./pages/Index";
import Bespoke from "./pages/Bespoke";
import Customize from "./pages/Customize";
import Checkout from "./pages/Checkout";
import CustomerDashboard from "./pages/CustomerDashboard";
import Auth from "./pages/Auth";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import BookAppointment from "./pages/BookAppointment";
import StyleAdvisor from "./pages/StyleAdvisor";
import NotFound from "./pages/NotFound";
// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminMeasurements from "./pages/admin/AdminMeasurements";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminShipments from "./pages/admin/AdminShipments";
import AdminFraud from "./pages/admin/AdminFraud";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/products" element={<Products />} />
            <Route path="/bespoke" element={<Bespoke />} />
            <Route path="/customize" element={<Customize />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/book" element={<BookAppointment />} />
            <Route path="/style-advisor" element={<StyleAdvisor />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/dashboard" element={<CustomerDashboard />} />
            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/invoices" element={<AdminInvoices />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/measurements" element={<AdminMeasurements />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/shipments" element={<AdminShipments />} />
            <Route path="/admin/fraud" element={<AdminFraud />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
