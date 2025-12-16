import { ArrowLeft, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import TrafegoAIInsights from "@/components/trafego/TrafegoAIInsights";
import { useMetaCampaigns } from "@/hooks/useMetaCampaigns";
import { useRealFinancials } from "@/hooks/useRealFinancials";
import { usePeriodFilter } from "@/contexts/PeriodFilterContext";
import { Button } from "@/components/ui/button";

const TrafegoIA = () => {
  const { dateRange, selectedMonthKey } = usePeriodFilter();
  const realFinancials = useRealFinancials(selectedMonthKey);
  const { campanhas, totais, canais, loading } = useMetaCampaigns(dateRange, selectedMonthKey, realFinancials);

  return (
    <div className="min-h-screen bg-[#0B1120] font-outfit">
      {/* Header */}
      <header className="bg-[#0B1120] border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/trafego">
                <Button
                  variant="outline"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para Tráfego
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="bg-purple-500/20 rounded-xl p-2">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl md:text-2xl">
                  🤖 Análise Completa de IA
                </h1>
                <p className="text-[#94A3B8] text-sm">
                  Insights, projeções e recomendações
                </p>
              </div>
            </div>
            
            <div className="hidden md:block w-[200px]" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation />

      {/* Loading state */}
      {loading && (
        <div className="bg-[#0066FF]/20 text-[#0066FF] py-2 px-8 flex items-center justify-center gap-2 border-b border-[#0066FF]/30">
          <div className="w-2 h-2 bg-[#0066FF] rounded-full animate-pulse" />
          <span className="font-semibold text-sm">Carregando dados...</span>
        </div>
      )}

      {/* Main Content */}
      <main className="py-10 md:py-16 px-4 sm:px-6 md:px-12">
        <div className="max-w-[1600px] mx-auto">
          <TrafegoAIInsights 
            campanhas={campanhas}
            totais={totais}
            canais={canais}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrafegoIA;
