import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PeriodFilterProvider } from "@/contexts/PeriodFilterContext";
import Index from "./pages/Index";
import PerformanceSDR from "./pages/PerformanceSDR";
import PerformanceCloser from "./pages/PerformanceCloser";
import Financeiro from "./pages/Financeiro";
import GuerraSquads from "./pages/GuerraSquads";
import AssistenteIA from "./pages/AssistenteIA";
import TrafegoPago from "./pages/TrafegoPago";
import TrafegoIA from "./pages/TrafegoIA";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PeriodFilterProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sdr" element={<PerformanceSDR />} />
            <Route path="/closer" element={<PerformanceCloser />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/squads" element={<GuerraSquads />} />
            <Route path="/ia" element={<AssistenteIA />} />
            <Route path="/trafego" element={<TrafegoPago />} />
            <Route path="/trafego/ia" element={<TrafegoIA />} />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </PeriodFilterProvider>
  </QueryClientProvider>
);

export default App;
