import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/AppSidebar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import IndexTest from "./pages/IndexTest";
import Auth from "./pages/Auth";
import SearchResults from "./pages/SearchResults";
import TransactionIntelligence from "./pages/TransactionIntelligence";
import SupplierRegistration from "./pages/SupplierRegistration";
import BuyerRegistration from "./pages/BuyerRegistration";
import TransportRegistration from "./pages/TransportRegistration";
import BankGuaranteeRegistration from "./pages/BankGuaranteeRegistration";
import LetterOfCreditRegistration from "./pages/LetterOfCreditRegistration";
import CertificationRegistration from "./pages/CertificationRegistration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Placeholder components for new routes
const HistoryPage = () => <div className="p-8"><h1 className="text-2xl font-bold">History</h1><p>Your search and order history will appear here.</p></div>;
const FavoritesPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Favorites</h1><p>Your favorite products will appear here.</p></div>;
const MessagesPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Messages</h1><p>Your conversations with suppliers will appear here.</p></div>;
// Import Settings page
import Settings from "@/pages/Settings";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider defaultOpen={false}>
            <div className="flex min-h-screen w-full bg-background">
              <AppSidebar />
              <main className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<IndexTest />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
                    <Route path="/transaction-intelligence" element={<ProtectedRoute><TransactionIntelligence /></ProtectedRoute>} />
                    <Route path="/supplier-registration" element={<ProtectedRoute><SupplierRegistration /></ProtectedRoute>} />
                    <Route path="/buyer-registration" element={<ProtectedRoute><BuyerRegistration /></ProtectedRoute>} />
                    <Route path="/transport-registration" element={<ProtectedRoute><TransportRegistration /></ProtectedRoute>} />
                    <Route path="/bank-guarantee-registration" element={<ProtectedRoute><BankGuaranteeRegistration /></ProtectedRoute>} />
                    <Route path="/letter-of-credit-registration" element={<ProtectedRoute><LetterOfCreditRegistration /></ProtectedRoute>} />
                    <Route path="/certification-registration" element={<ProtectedRoute><CertificationRegistration /></ProtectedRoute>} />
                    <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                    <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                    <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <Footer />
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
