import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";
import MobileMenu from '@/components/MobileMenu';
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import TVModeToggle from "@/components/TVModeToggle";
import { useTVMode } from "@/hooks/useTVMode";
import TrafegoMetaBars from "@/components/trafego/TrafegoMetaBars";
import TrafegoKPICards from "@/components/trafego/TrafegoKPICards";
import TrafegoROICard from "@/components/trafego/TrafegoROICard";
import TrafegoFunnel from "@/components/trafego/TrafegoFunnel";
import CampanhasTable from "@/components/trafego/CampanhasTable";
import TrafegoCanais from "@/components/trafego/TrafegoCanais";
import TrafegoCharts from "@/components/trafego/TrafegoCharts";
import { 
  campanhasMock, 
  calcularTotaisTrafego, 
  calcularMetricasPorCanal 
} from "@/utils/trafegoMetricsCalculator";

const TrafegoPago = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastUpdate, setLastUpdate] = useState<Date | null>(new Date());
  const [isRefetching, setIsRefetching] = useState(false);
  const { isTVMode, setIsTVMode } = useTVMode();

  // Calculate metrics from mock data
  const totais = calcularTotaisTrafego(campanhasMock);
  const canais = calcularMetricasPorCanal(campanhasMock);

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

  const handleRefetch = () => {
    setIsRefetching(true);
    setTimeout(() => {
      setLastUpdate(new Date());
      setIsRefetching(false);
    }, 1000);
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

      {/* Indicador discreto de atualização */}
      {isRefetching && (
        <div className="bg-[#0066FF]/20 text-[#0066FF] py-2 px-8 flex items-center justify-center gap-2 border-b border-[#0066FF]/30">
          <div className="w-2 h-2 bg-[#0066FF] rounded-full animate-pulse"></div>
          <span className="font-semibold text-sm">Atualizando...</span>
        </div>
      )}

      {/* SEÇÃO 1: BARRAS DE META */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-12' : 'py-10 md:py-16 px-4 sm:px-6 md:px-12'}`}>
        <div className="max-w-[1600px] mx-auto">
          <h2 className={`text-white font-black mb-8 ${isTVMode ? 'text-4xl' : 'text-3xl md:text-4xl'}`}>
            📊 Metas de Tráfego - Outubro 2025
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
          <CampanhasTable campanhas={campanhasMock} isTVMode={isTVMode} />
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
            campanhas={campanhasMock}
            canais={canais}
            isTVMode={isTVMode}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TrafegoPago;
