import { useEffect, useState } from "react";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import logoWhite from "@/assets/logo-white.png";
import MobileMenu from '@/components/MobileMenu';
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import TVModeToggle from "@/components/TVModeToggle";
import { useTVMode } from "@/hooks/useTVMode";
import { useMetaCampaigns } from "@/hooks/useMetaCampaigns";
import { usePeriodFilter } from "@/contexts/PeriodFilterContext";
import PeriodFilter from "@/components/sdr/PeriodFilter";
import TrafegoMetaBars from "@/components/trafego/TrafegoMetaBars";
import TrafegoKPICards from "@/components/trafego/TrafegoKPICards";
import TrafegoROICard from "@/components/trafego/TrafegoROICard";
import TrafegoFunnel from "@/components/trafego/TrafegoFunnel";
import CampanhasTable from "@/components/trafego/CampanhasTable";
import TrafegoCanais from "@/components/trafego/TrafegoCanais";
import TrafegoCharts from "@/components/trafego/TrafegoCharts";
import TrafegoPodium from "@/components/trafego/TrafegoPodium";
import TrafegoProjecoes from "@/components/trafego/TrafegoProjecoes";
import TrafegoComercial from "@/components/trafego/TrafegoComercial";
import TrafegoComparativo from "@/components/trafego/TrafegoComparativo";

const TrafegoPago = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isTVMode, setIsTVMode } = useTVMode();

  // Period filter context
  const { 
    periodType, 
    dateRange, 
    selectedMonthKey, 
    updateFilter, 
    setSelectedMonthKey 
  } = usePeriodFilter();

  // Use Meta campaigns data with date range
  const { 
    campanhas, 
    totais, 
    canais, 
    loading, 
    error, 
    refetch, 
    lastUpdate, 
    isFromMeta 
  } = useMetaCampaigns(dateRange, selectedMonthKey);

  const [isRefetching, setIsRefetching] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fullscreen no modo TV
  useEffect(() => {
    if (isTVMode) {
      document.documentElement.requestFullscreen?.();
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      }
    }
  }, [isTVMode]);

  // Ocultar cursor após inatividade no modo TV
  useEffect(() => {
    if (!isTVMode) return;
    
    let timeout: NodeJS.Timeout;
    const hideCursor = () => document.body.style.cursor = 'none';
    const showCursor = () => {
      document.body.style.cursor = 'default';
      clearTimeout(timeout);
      timeout = setTimeout(hideCursor, 3000);
    };
    
    document.addEventListener('mousemove', showCursor);
    timeout = setTimeout(hideCursor, 3000);
    
    return () => {
      document.removeEventListener('mousemove', showCursor);
      clearTimeout(timeout);
      document.body.style.cursor = 'default';
    };
  }, [isTVMode]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'short',
      year: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const handleRefetch = async () => {
    setIsRefetching(true);
    await refetch();
    setIsRefetching(false);
  };

  // Format selected month for display
  const getSelectedMonthLabel = () => {
    return format(dateRange.start, "MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <div className="min-h-screen bg-[#0B1120] font-outfit overflow-x-hidden max-w-full">
      {/* HEADER */}
      <header className={`bg-[#0B1120] border-b border-white/5 ${isTVMode ? '' : 'sticky top-0'} z-50`}>
        <div className={`max-w-[1920px] mx-auto ${isTVMode ? 'px-16 py-12' : 'px-4 sm:px-6 md:px-12 py-4 md:py-8'} flex justify-between items-center gap-4`}>
          
          {/* ESQUERDA: Menu Hamburguer (mobile) + Logo (desktop) */}
          <div className="flex items-center gap-4">
            {!isTVMode && <MobileMenu />}
            {!isTVMode && <img src={logoWhite} alt="Blue Ocean" className="hidden md:block h-8 md:h-10 w-auto" />}
          </div>

          {/* CENTRO: Título + Subtítulo */}
          <div className="text-center">
            <h1 className={`text-white font-outfit font-bold tracking-tight ${
              isTVMode ? 'text-7xl' : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'
            }`}>
              🎯 Tráfego Pago
            </h1>
            {!isTVMode && (
              <p className="text-[#94A3B8] font-outfit text-sm md:text-lg mt-2">
                Análise completa do investimento em mídia e resultados comerciais
              </p>
            )}
          </div>

          {/* DIREITA: Botões + Data/Hora */}
          <div className="text-right flex flex-col items-end gap-2 md:gap-3">
            <div className={`flex ${isTVMode ? 'gap-6' : 'gap-2 md:gap-3'}`}>
              <TVModeToggle isTVMode={isTVMode} onToggle={() => setIsTVMode(!isTVMode)} />
              <Button
                onClick={handleRefetch}
                variant="outline"
                className={`bg-[#0066FF]/10 border-2 border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF] hover:text-white transition-all ${
                  isTVMode ? 'px-8 py-6 text-2xl' : 'px-3 py-2 md:px-6 md:py-3 text-sm md:text-lg'
                }`}
              >
                <RefreshCw className={`${isTVMode ? 'w-8 h-8 mr-4' : 'w-5 h-5 mr-2'} ${isRefetching ? 'animate-spin' : ''}`} />
                <span className="font-outfit font-semibold">Atualizar</span>
              </Button>
            </div>
            <div>
              <p className={`text-white font-outfit font-semibold capitalize ${
                isTVMode ? 'text-2xl' : 'text-lg'
              }`}>
                {formatDate(currentTime)}
              </p>
              <p className={`text-[#94A3B8] font-outfit ${
                isTVMode ? 'text-lg' : 'text-sm'
              }`}>
                {isTVMode ? formatTime(currentTime) : `Atualizado: ${lastUpdate ? formatTime(lastUpdate) : '--:--'}`}
              </p>
            </div>
          </div>
          
        </div>
      </header>

      {/* NAVEGAÇÃO */}
      <Navigation isTVMode={isTVMode} />

      {/* FILTRO DE PERÍODO */}
      {!isTVMode && (
        <section className="bg-[#0B1120] py-4 px-4 sm:px-6 md:px-12 border-b border-white/5">
          <div className="max-w-[1600px] mx-auto">
            <PeriodFilter
              onFilterChange={updateFilter}
              onMonthChange={setSelectedMonthKey}
              currentPeriod={periodType}
              currentDateRange={dateRange}
              selectedMonthKey={selectedMonthKey}
              isTVMode={isTVMode}
            />
          </div>
        </section>
      )}

      {/* Status indicator */}
      {(isRefetching || loading) && (
        <div className="bg-[#0066FF]/20 text-[#0066FF] py-2 px-8 flex items-center justify-center gap-2 border-b border-[#0066FF]/30">
          <div className="w-2 h-2 bg-[#0066FF] rounded-full animate-pulse"></div>
          <span className="font-semibold text-sm">
            {loading ? 'Carregando dados da Meta...' : 'Atualizando...'}
          </span>
        </div>
      )}

      {/* Data source indicator */}
      {!loading && !isRefetching && (
        <div className={`py-2 px-8 flex items-center justify-center gap-2 border-b ${
          isFromMeta 
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        }`}>
          {isFromMeta ? (
            <>
              <Wifi className="w-4 h-4" />
              <span className="font-semibold text-sm">Dados ao vivo da Meta Ads</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span className="font-semibold text-sm">
                Dados de demonstração {error && `(${error})`}
              </span>
            </>
          )}
        </div>
      )}

      {/* SEÇÃO 1: BARRAS DE META */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-12' : 'py-10 md:py-16 px-4 sm:px-6 md:px-12'}`}>
        <div className="max-w-[1600px] mx-auto">
          <h2 className={`text-white font-black mb-8 capitalize ${isTVMode ? 'text-4xl' : 'text-3xl md:text-4xl'}`}>
            📊 Metas de Tráfego - {getSelectedMonthLabel()}
          </h2>
          <TrafegoMetaBars 
            investimentoAtual={totais.investimento}
            leadsAtual={totais.leads}
            cacAtual={totais.cac}
            isTVMode={isTVMode}
          />
        </div>
      </section>

      {/* SEÇÃO 2: KPI CARDS */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-12' : 'py-10 md:py-16 px-4 sm:px-6 md:px-12'}`}>
        <div className="max-w-[1600px] mx-auto">
          <h2 className={`text-white font-black mb-8 ${isTVMode ? 'text-4xl' : 'text-3xl md:text-4xl'}`}>
            💰 Métricas Principais
          </h2>
          <TrafegoKPICards totais={totais} isTVMode={isTVMode} />
        </div>
      </section>

      {/* SEÇÃO 3: CARD ROI */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-12' : 'py-10 md:py-16 px-4 sm:px-6 md:px-12'}`}>
        <div className="max-w-[1600px] mx-auto">
          <TrafegoROICard 
            investimento={totais.investimento}
            receita={totais.receita}
            isTVMode={isTVMode}
          />
        </div>
      </section>

      {/* SEÇÃO 4: FUNIL DE TRÁFEGO */}
      <section className={`bg-[#F8FAFC] ${isTVMode ? 'py-8 px-12' : 'py-10 md:py-16 px-4 sm:px-6 md:px-12'}`}>
        <div className="max-w-[1400px] mx-auto">
          <h2 className={`text-[#0B1120] font-black mb-8 ${isTVMode ? 'text-4xl' : 'text-3xl md:text-4xl'}`}>
            🎯 Funil de Tráfego - Jornada Completa do Lead
          </h2>
          <TrafegoFunnel totais={totais} isTVMode={isTVMode} />
        </div>
      </section>

      {/* SEÇÃO 5: TABELA DE CAMPANHAS */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-12' : 'py-10 md:py-16 px-4 sm:px-6 md:px-12'}`}>
        <div className="max-w-[1800px] mx-auto">
          <h2 className={`text-white font-black mb-8 ${isTVMode ? 'text-4xl' : 'text-3xl md:text-4xl'}`}>
            📋 Tabela Detalhada de Campanhas
          </h2>
          <CampanhasTable campanhas={campanhas} isTVMode={isTVMode} />
        </div>
      </section>

      {/* SEÇÃO 6: ANÁLISE POR CANAL */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-12' : 'py-10 md:py-16 px-4 sm:px-6 md:px-12'}`}>
        <div className="max-w-[1600px] mx-auto">
          <h2 className={`text-white font-black mb-8 ${isTVMode ? 'text-4xl' : 'text-3xl md:text-4xl'}`}>
            📢 Análise por Canal
          </h2>
          <TrafegoCanais 
            canais={canais}
            investimentoTotal={totais.investimento}
            isTVMode={isTVMode}
          />
        </div>
      </section>

      {/* SEÇÃO 7: GRÁFICOS COMPARATIVOS */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-12' : 'py-10 md:py-16 px-4 sm:px-6 md:px-12'}`}>
        <div className="max-w-[1800px] mx-auto">
          <h2 className={`text-white font-black mb-8 ${isTVMode ? 'text-4xl' : 'text-3xl md:text-4xl'}`}>
            📈 Gráficos Comparativos
          </h2>
          <TrafegoCharts 
            campanhas={campanhas}
            canais={canais}
            isTVMode={isTVMode}
          />
        </div>
      </section>

      {/* SEÇÃO 8: PÓDIO TOP 3 CAMPANHAS */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-12' : 'py-10 md:py-16 px-4 sm:px-6 md:px-12'}`}>
        <div className="max-w-[1600px] mx-auto">
          <TrafegoPodium campanhas={campanhas} isTVMode={isTVMode} />
        </div>
      </section>

      {/* SEÇÃO 9: PROJEÇÕES E ALERTAS */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-12' : 'py-10 md:py-16 px-4 sm:px-6 md:px-12'}`}>
        <div className="max-w-[1600px] mx-auto">
          <TrafegoProjecoes totais={totais} isTVMode={isTVMode} />
        </div>
      </section>

      {/* SEÇÃO 10: CONEXÃO TRÁFEGO → COMERCIAL */}
      <section className={`bg-[#F8FAFC] ${isTVMode ? 'py-8 px-12' : 'py-10 md:py-16 px-4 sm:px-6 md:px-12'}`}>
        <div className="max-w-[1600px] mx-auto">
          <TrafegoComercial isTVMode={isTVMode} />
        </div>
      </section>

      {/* SEÇÃO 11: COMPARAÇÃO TEMPORAL */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-12' : 'py-10 md:py-16 px-4 sm:px-6 md:px-12'}`}>
        <div className="max-w-[1600px] mx-auto">
          <TrafegoComparativo isTVMode={isTVMode} />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TrafegoPago;
