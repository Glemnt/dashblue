import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PeriodFilterProvider } from "@/contexts/PeriodFilterContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import PerformanceSDR from "./pages/PerformanceSDR";
import PerformanceCloser from "./pages/PerformanceCloser";
import Financeiro from "./pages/Financeiro";
import GuerraSquads from "./pages/GuerraSquads";
import AssistenteIA from "./pages/AssistenteIA";
import TrafegoPago from "./pages/TrafegoPago";
import TrafegoIA from "./pages/TrafegoIA";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <WorkspaceProvider>
        <PeriodFilterProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/onboarding" element={<Onboarding />} />
                
                {/* Protected routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/sdr" element={
                  <ProtectedRoute>
                    <PerformanceSDR />
                  </ProtectedRoute>
                } />
                <Route path="/closer" element={
                  <ProtectedRoute>
                    <PerformanceCloser />
                  </ProtectedRoute>
                } />
                <Route path="/financeiro" element={
                  <ProtectedRoute>
                    <Financeiro />
                  </ProtectedRoute>
                } />
                <Route path="/squads" element={
                  <ProtectedRoute>
                    <GuerraSquads />
                  </ProtectedRoute>
                } />
                <Route path="/ia" element={
                  <ProtectedRoute>
                    <AssistenteIA />
                  </ProtectedRoute>
                } />
                <Route path="/trafego" element={
                  <ProtectedRoute>
                    <TrafegoPago />
                  </ProtectedRoute>
                } />
                <Route path="/trafego/ia" element={
                  <ProtectedRoute>
                    <TrafegoIA />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <Admin />
                  </ProtectedRoute>
                } />
                
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </PeriodFilterProvider>
      </WorkspaceProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
