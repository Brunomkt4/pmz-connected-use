import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
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
const SettingsPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Settings</h1><p>Application settings and preferences.</p></div>;

const App = () => (
  <QueryClientProvider client={queryClient}>
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
                  <Route path="/" element={<Index />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/transaction-intelligence" element={<TransactionIntelligence />} />
                  <Route path="/supplier-registration" element={<SupplierRegistration />} />
                  <Route path="/buyer-registration" element={<BuyerRegistration />} />
                  <Route path="/transport-registration" element={<TransportRegistration />} />
                  <Route path="/bank-guarantee-registration" element={<BankGuaranteeRegistration />} />
                  <Route path="/letter-of-credit-registration" element={<LetterOfCreditRegistration />} />
                  <Route path="/certification-registration" element={<CertificationRegistration />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
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
  </QueryClientProvider>
);

export default App;
