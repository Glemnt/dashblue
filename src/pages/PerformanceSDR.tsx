import { useEffect, useState } from 'react';
import { RefreshCw, TrendingUp, Target, Trophy, Phone } from 'lucide-react';
import logoWhite from '@/assets/logo-white.png';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useSDRKPIs } from '@/hooks/useSDRKPIs';
import { calcularMetricasSDR, mesclarMetricasSDRComDashboard } from '@/utils/sdrMetricsCalculator';
import { formatarReal } from '@/utils/metricsCalculator';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SDRPodium from '@/components/sdr/SDRPodium';
import SDRComparisonTable from '@/components/sdr/SDRComparisonTable';
import PeriodFilter from '@/components/sdr/PeriodFilter';
import SDRDetailCard from '@/components/sdr/SDRDetailCard';
import SDRCharts from '@/components/sdr/SDRCharts';
import TVModeToggle from '@/components/TVModeToggle';
import ColaboradorAvatar from '@/components/ColaboradorAvatar';
import { PeriodType, DateRange, getCurrentMonthRange } from '@/utils/dateFilters';

const PerformanceSDR = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { data, loading, error, lastUpdate, refetch } = useGoogleSheets();
  const { 
    kpis: sdrKPIs, 
    total: totalKPI,
    loading: loadingKPIs,
    error: errorKPIs,
    refetch: refetchKPIs
  } = useSDRKPIs();

  // State para filtro de período
  const [currentPeriod, setCurrentPeriod] = useState<PeriodType>('mes');
  const [currentDateRange, setCurrentDateRange] = useState<DateRange>(getCurrentMonthRange());
  
  // Estado do modo TV
  const [isTVMode, setIsTVMode] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Auto-refresh no modo TV
    const autoRefresh = isTVMode ? setInterval(() => {
      refetch();
      refetchKPIs();
    }, 5 * 60 * 1000) : null;
    
    return () => {
      clearInterval(timer);
      if (autoRefresh) clearInterval(autoRefresh);
    };
  }, [isTVMode, refetch, refetchKPIs]);
  
  // Controle de fullscreen
  useEffect(() => {
    if (isTVMode) {
      document.documentElement.requestFullscreen?.();
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    }
  }, [isTVMode]);
  
  // Ocultar cursor no modo TV
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

  // Calcular métricas SDR COM filtro de data
  const metricasCalculadas = data.length > 0 ? calcularMetricasSDR(data, currentDateRange) : null;
  const metricas = metricasCalculadas && sdrKPIs.length > 0
    ? mesclarMetricasSDRComDashboard(metricasCalculadas, sdrKPIs)
    : metricasCalculadas;

  // Handler para mudança de filtro
  const handleFilterChange = (type: PeriodType, dateRange: DateRange) => {
    setCurrentPeriod(type);
    setCurrentDateRange(dateRange);
  };

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

  // Loading State
  if ((loading || loadingKPIs) && !metricas) {
    return (
      <div className="min-h-screen bg-[#0B1120] font-outfit flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-[#0066FF] mx-auto mb-4 animate-spin" />
          <h2 className="text-white text-3xl font-bold mb-2">Carregando Performance SDR...</h2>
          <p className="text-[#94A3B8] text-lg">Buscando dados do Google Sheets</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || errorKPIs) {
    return (
      <div className="min-h-screen bg-[#0B1120] font-outfit flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-[#FF4757] text-4xl font-bold mb-4">Erro ao Carregar Dados</h2>
          <p className="text-white text-lg mb-6">{error || errorKPIs}</p>
          <Button
            onClick={() => { refetch(); refetchKPIs(); }}
            className="bg-[#0066FF] hover:bg-[#0066FF]/90 text-white px-8 py-3 text-lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!metricas) {
    return null;
  }

  const metaMensalCalls = 367;
  const metaIndividualCalls = Math.ceil(metaMensalCalls / 4);

  const getProgressColor = (value: number, meta: number) => {
    const percentage = (value / meta) * 100;
    if (percentage >= 90) return '#00E5CC';
    if (percentage >= 70) return '#FFB800';
    return '#FF4757';
  };

  return (
    <div className="min-h-screen bg-[#0B1120] font-outfit">
      {/* HEADER */}
      <header className={`bg-[#0B1120] border-b border-white/5 ${isTVMode ? '' : 'sticky top-0'} z-50`}>
        <div className={`max-w-[1920px] mx-auto ${isTVMode ? 'px-16 py-12' : 'px-12 py-8'} flex justify-between items-center`}>
          {!isTVMode && (
            <div className="flex items-center">
              <img src={logoWhite} alt="Blue Ocean" className="h-10 w-auto" />
            </div>
          )}

          <div className="text-center">
            <h1 className={`text-white font-outfit font-bold tracking-tight ${
              isTVMode ? 'text-7xl' : 'text-5xl'
            }`}>
              Performance SDR
            </h1>
            {!isTVMode && (
              <p className="text-[#94A3B8] font-outfit text-lg mt-2">
                Análise detalhada da equipe de prospecção
              </p>
            )}
          </div>

          <div className="text-right flex flex-col items-end gap-3">
            <div className={`flex ${isTVMode ? 'gap-6' : 'gap-3'}`}>
              <TVModeToggle isTVMode={isTVMode} onToggle={() => setIsTVMode(!isTVMode)} />
              <Button
                onClick={() => { refetch(); refetchKPIs(); }}
                variant="outline"
                className={`bg-[#0066FF]/10 border-2 border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF] hover:text-white transition-all ${
                  isTVMode ? 'px-8 py-6 text-2xl' : 'px-6 py-3 text-lg'
                }`}
              >
                <RefreshCw className={`${isTVMode ? 'w-8 h-8 mr-4' : 'w-5 h-5 mr-2'}`} />
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

      {/* INDICADOR DE ATUALIZAÇÃO (TV MODE) */}
      {isTVMode && (loading || loadingKPIs) && (
        <div className="fixed top-4 right-4 bg-[#0066FF] text-white px-6 py-3 rounded-full flex items-center gap-3 animate-pulse z-50">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="font-outfit text-lg font-semibold">Atualizando...</span>
        </div>
      )}

      {/* FILTRO DE PERÍODO */}
      {!isTVMode && (
        <section className="bg-[#0B1120] pt-12 px-12">
          <div className="max-w-[1800px] mx-auto">
            <PeriodFilter
              onFilterChange={handleFilterChange}
              currentPeriod={currentPeriod}
              currentDateRange={currentDateRange}
            />
          </div>
        </section>
      )}

      {/* SEÇÃO 1: RESUMO GERAL */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-12' : 'py-20 px-12'}`}>
        <div className="max-w-[1600px] mx-auto">
          <div className={`grid grid-cols-2 ${isTVMode ? 'gap-4' : 'gap-8'}`}>
            
            {/* Card 1: Total de Calls */}
            <div className={`bg-[#151E35] rounded-2xl border border-white/5 hover:shadow-2xl transition-all duration-300 ${isTVMode ? 'p-6' : 'p-12'}`}>
              <div className={`flex items-start justify-between ${isTVMode ? 'mb-4' : 'mb-8'}`}>
                <div className={`bg-[#0066FF]/20 rounded-2xl ${isTVMode ? 'p-4' : 'p-6'}`}>
                  <Phone className={`text-[#0066FF] ${isTVMode ? 'w-7 h-7' : 'w-10 h-10'}`} />
                </div>
                <TrendingUp className="w-10 h-10 text-[#0066FF]" />
              </div>
              <h3 className={`text-[#94A3B8] font-outfit uppercase tracking-wider ${isTVMode ? 'text-sm mb-2' : 'text-lg mb-3'}`}>
                Total de Calls
              </h3>
              <p className={`text-white font-outfit font-black ${isTVMode ? 'text-5xl mb-2' : 'text-7xl mb-4'}`}>
                {metricas.totais.totalCalls}
              </p>
              <p className={`text-[#94A3B8] font-outfit ${isTVMode ? 'text-sm mb-3' : 'text-lg mb-6'}`}>
                Meta mensal: {metaMensalCalls} calls
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#94A3B8]">Progresso</span>
                  <span className="text-white font-semibold">
                    {((metricas.totais.totalCalls / metaMensalCalls) * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={(metricas.totais.totalCalls / metaMensalCalls) * 100} 
                  className={isTVMode ? 'h-2' : 'h-3'}
                  style={{
                    '--progress-background': getProgressColor(metricas.totais.totalCalls, metaMensalCalls)
                  } as any}
                />
              </div>
            </div>

            {/* Card 2: Taxa Média de Qualificação */}
            <div className={`bg-[#151E35] rounded-2xl border border-white/5 hover:shadow-2xl transition-all duration-300 ${isTVMode ? 'p-6' : 'p-12'}`}>
              <div className={`flex items-start justify-between ${isTVMode ? 'mb-4' : 'mb-8'}`}>
                <div className={`bg-[#00E5CC]/20 rounded-2xl ${isTVMode ? 'p-4' : 'p-6'}`}>
                  <span className="text-5xl">✅</span>
                </div>
                <Target className={`text-[#00E5CC] ${isTVMode ? 'w-7 h-7' : 'w-10 h-10'}`} />
              </div>
              <h3 className={`text-[#94A3B8] font-outfit uppercase tracking-wider ${isTVMode ? 'text-sm mb-2' : 'text-lg mb-3'}`}>
                Taxa Média de Qualificação
              </h3>
              <p className={`text-white font-outfit font-black ${isTVMode ? 'text-5xl mb-2' : 'text-7xl mb-4'}`}>
                {metricas.totais.taxaQualificacaoMedia.toFixed(1)}%
              </p>
              <p className={`text-[#94A3B8] font-outfit ${isTVMode ? 'text-sm mb-3' : 'text-lg mb-6'}`}>
                Meta: 50%
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#94A3B8]">Progresso</span>
                  <span className="text-white font-semibold">
                    {((metricas.totais.taxaQualificacaoMedia / 50) * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(metricas.totais.taxaQualificacaoMedia, 100)} 
                  className={isTVMode ? 'h-2' : 'h-3'}
                  style={{
                    '--progress-background': getProgressColor(metricas.totais.taxaQualificacaoMedia, 50)
                  } as any}
                />
              </div>
            </div>

            {/* Card 3: Taxa Média de Show */}
            <div className={`bg-[#151E35] rounded-2xl border border-white/5 hover:shadow-2xl transition-all duration-300 ${isTVMode ? 'p-6' : 'p-12'}`}>
              <div className={`flex items-start justify-between ${isTVMode ? 'mb-4' : 'mb-8'}`}>
                <div className={`bg-[#FFB800]/20 rounded-2xl ${isTVMode ? 'p-4' : 'p-6'}`}>
                  <span className="text-5xl">📊</span>
                </div>
                <Target className={`text-[#FFB800] ${isTVMode ? 'w-7 h-7' : 'w-10 h-10'}`} />
              </div>
              <h3 className={`text-[#94A3B8] font-outfit uppercase tracking-wider ${isTVMode ? 'text-sm mb-2' : 'text-lg mb-3'}`}>
                Taxa Média de Show
              </h3>
              <p className={`text-white font-outfit font-black ${isTVMode ? 'text-5xl mb-2' : 'text-7xl mb-4'}`}>
                {metricas.totais.taxaShowMedia.toFixed(1)}%
              </p>
              <p className={`text-[#94A3B8] font-outfit ${isTVMode ? 'text-sm mb-3' : 'text-lg mb-6'}`}>
                Meta: 75%
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#94A3B8]">Progresso</span>
                  <span className="text-white font-semibold">
                    {((metricas.totais.taxaShowMedia / 75) * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(metricas.totais.taxaShowMedia, 100)} 
                  className={isTVMode ? 'h-2' : 'h-3'}
                  style={{
                    '--progress-background': getProgressColor(metricas.totais.taxaShowMedia, 75)
                  } as any}
                />
              </div>
            </div>

            {/* Card 4: SDR Destaque */}
            <div className={`bg-gradient-to-br from-[#FFB800] to-[#FF8C00] rounded-2xl border-4 border-[#FFD700] hover:shadow-2xl hover:scale-105 transition-all duration-300 relative ${isTVMode ? 'p-6' : 'p-12'}`}>
              <div className={`flex items-start justify-between ${isTVMode ? 'mb-4' : 'mb-8'}`}>
                <div className={`bg-white/20 rounded-2xl ${isTVMode ? 'p-4' : 'p-6'}`}>
                  <Trophy className={`text-white ${isTVMode ? 'w-7 h-7' : 'w-10 h-10'}`} />
                </div>
                <ColaboradorAvatar 
                  nome={metricas.destaque?.nome || ''}
                  emoji={metricas.destaque?.emoji || '🏆'}
                  squadColor={metricas.destaque?.squadColor || '#FFB800'}
                  size="xl"
                  className="absolute -top-8 right-8"
                />
              </div>
              <h3 className={`text-white/90 font-outfit uppercase tracking-wider ${isTVMode ? 'text-sm mb-2' : 'text-lg mb-3'}`}>
                SDR Destaque
              </h3>
              <p className={`text-white font-outfit font-black ${isTVMode ? 'text-4xl mb-2' : 'text-5xl mb-4'}`}>
                {metricas.destaque?.nome}
              </p>
              <p className={`text-white/90 font-outfit font-bold ${isTVMode ? 'text-2xl mb-1' : 'text-3xl mb-2'}`}>
                {formatarReal(metricas.destaque?.vendasOriginadas || 0)}
              </p>
              <p className={`text-white/80 font-outfit ${isTVMode ? 'text-base' : 'text-lg'}`}>
                {metricas.destaque?.contratosOriginados} contratos originados
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SEÇÃO 2: PÓDIO DOS TOP 3 */}
      <section className={`bg-[#F8FAFC] ${isTVMode ? 'py-16 px-12' : 'py-20 px-12'}`}>
        <h2 className={`text-[#0B1120] font-outfit font-bold text-center tracking-tight ${isTVMode ? 'text-4xl mb-8' : 'text-5xl mb-16'}`}>
          Pódio dos Top 3 SDRs
        </h2>
        <SDRPodium top3={metricas.top3} />
      </section>

      {/* SEÇÃO 3: TABELA COMPARATIVA */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-12' : 'py-20 px-12'}`}>
        <h2 className={`text-white font-outfit font-bold text-center tracking-tight ${isTVMode ? 'text-4xl mb-6' : 'text-5xl mb-16'}`}>
          Comparação de Performance
        </h2>
        <div className="max-w-[1800px] mx-auto">
          <SDRComparisonTable sdrs={metricas.sdrs} destaque={metricas.destaque} />
        </div>
      </section>

      {/* SEÇÃO 4: CARDS INDIVIDUAIS EXPANSÍVEIS */}
      <section className={`bg-[#F8FAFC] ${isTVMode ? 'py-8 px-12' : 'py-20 px-12'}`}>
        <h2 className={`text-[#0B1120] font-outfit font-bold text-center tracking-tight ${isTVMode ? 'text-4xl mb-6' : 'text-5xl mb-16'}`}>
          Detalhamento Individual
        </h2>
        <div className={`max-w-[1400px] mx-auto ${isTVMode ? 'space-y-3' : 'space-y-6'}`}>
          {metricas.sdrs.map((sdr) => (
            <SDRDetailCard
              key={sdr.nomeOriginal}
              sdr={sdr}
              data={data}
              metaIndividualCalls={metaIndividualCalls}
            />
          ))}
        </div>
      </section>

      {/* SEÇÃO 5: GRÁFICOS COMPARATIVOS */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-12' : 'py-20 px-12'}`}>
        <h2 className={`text-white font-outfit font-bold text-center tracking-tight ${isTVMode ? 'text-4xl mb-6' : 'text-5xl mb-16'}`}>
          Análise Gráfica Comparativa
        </h2>
        <div className="max-w-[1800px] mx-auto">
          <SDRCharts 
            sdrs={metricas.sdrs} 
            metaIndividualCalls={metaIndividualCalls}
          />
        </div>
      </section>

      {/* FOOTER */}
      {!isTVMode && <Footer />}
    </div>
  );
};

export default PerformanceSDR;
