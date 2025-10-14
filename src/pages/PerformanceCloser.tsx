import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Target, Trophy } from 'lucide-react';
import logoWhite from '@/assets/logo-white.png';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PeriodFilter from '@/components/sdr/PeriodFilter';
import CloserPodium from '@/components/closer/CloserPodium';
import CloserComparisonTable from '@/components/closer/CloserComparisonTable';
import CloserDetailCard from '@/components/closer/CloserDetailCard';
import CloserCharts from '@/components/closer/CloserCharts';
import TVModeToggle from '@/components/TVModeToggle';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { calcularMetricasCloser } from '@/utils/closerMetricsCalculator';
import { formatarReal } from '@/utils/metricsCalculator';
import { PeriodType, DateRange, getCurrentMonthRange } from '@/utils/dateFilters';

const PerformanceCloser = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { data, loading, error, lastUpdate, refetch } = useGoogleSheets();
  
  const [currentPeriod, setCurrentPeriod] = useState<PeriodType>('mes');
  const [currentDateRange, setCurrentDateRange] = useState<DateRange>(getCurrentMonthRange());
  
  // Estado do modo TV
  const [isTVMode, setIsTVMode] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Auto-refresh no modo TV
    const autoRefresh = isTVMode ? setInterval(() => {
      refetch();
    }, 5 * 60 * 1000) : null;
    
    return () => {
      clearInterval(timer);
      if (autoRefresh) clearInterval(autoRefresh);
    };
  }, [isTVMode, refetch]);
  
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

  const metricas = data.length > 0 ? calcularMetricasCloser(data, currentDateRange) : null;

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

  const metaMensalReceita = 650000;
  const metaIndividualReceita = metaMensalReceita / 4;
  const metaTicketMedio = 12000;
  const metaTaxaConversao = 25;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0066FF] mx-auto mb-8"></div>
          <p className="text-white font-outfit text-2xl">Carregando Performance Closer...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-outfit text-2xl mb-6">Erro ao carregar dados</p>
          <p className="text-[#94A3B8] mb-8">{error}</p>
          <Button onClick={refetch} className="bg-[#0066FF] hover:bg-[#0066FF]/90">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!metricas) {
    return null;
  }

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
          
          {/* ESQUERDA: Logo */}
          {!isTVMode && (
            <div className="flex items-center">
              <img src={logoWhite} alt="Blue Ocean" className="h-10 w-auto" />
            </div>
          )}

          {/* CENTRO: Título + Subtítulo */}
          <div className="text-center">
            <h1 className={`text-white font-outfit font-bold tracking-tight ${
              isTVMode ? 'text-7xl' : 'text-5xl'
            }`}>
              Performance Closer
            </h1>
            {!isTVMode && (
              <p className="text-[#94A3B8] font-outfit text-lg mt-2">
                Análise detalhada da equipe de fechamento
              </p>
            )}
          </div>

          {/* DIREITA: Botão + Data/Hora */}
          <div className="text-right flex flex-col items-end gap-3">
            <div className={`flex ${isTVMode ? 'gap-6' : 'gap-3'}`}>
              <TVModeToggle isTVMode={isTVMode} onToggle={() => setIsTVMode(!isTVMode)} />
              <Button
                onClick={refetch}
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
      {isTVMode && loading && (
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
      <section className="bg-[#0B1120] py-20 px-12">
        <div className="max-w-[1600px] mx-auto">
          
          <div className="grid grid-cols-2 gap-8">
            
            {/* Card 1: Receita Total */}
            <div className="bg-[#151E35] rounded-2xl p-12 border border-white/5 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start justify-between mb-8">
                <div className="bg-[#0066FF]/20 p-6 rounded-2xl">
                  <span className="text-5xl">💰</span>
                </div>
                <TrendingUp className="w-10 h-10 text-[#0066FF]" />
              </div>
              <h3 className="text-[#94A3B8] font-outfit text-lg uppercase tracking-wider mb-3">
                Receita Total
              </h3>
              <p className="text-white font-outfit text-7xl font-black mb-4">
                {formatarReal(metricas.totais.receitaTotal)}
              </p>
              <p className="text-[#94A3B8] text-lg font-outfit mb-6">
                {metricas.totais.contratosTotais} contratos fechados
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#94A3B8]">Meta: {formatarReal(metaMensalReceita)}</span>
                  <span className="text-white font-semibold">
                    {((metricas.totais.receitaTotal / metaMensalReceita) * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={(metricas.totais.receitaTotal / metaMensalReceita) * 100} 
                  className="h-3"
                  style={{
                    '--progress-background': getProgressColor(metricas.totais.receitaTotal, metaMensalReceita)
                  } as any}
                />
              </div>
            </div>

            {/* Card 2: Ticket Médio Geral */}
            <div className="bg-[#151E35] rounded-2xl p-12 border border-white/5 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start justify-between mb-8">
                <div className="bg-[#00E5CC]/20 p-6 rounded-2xl">
                  <span className="text-5xl">📊</span>
                </div>
                <Target className="w-10 h-10 text-[#00E5CC]" />
              </div>
              <h3 className="text-[#94A3B8] font-outfit text-lg uppercase tracking-wider mb-3">
                Ticket Médio Geral
              </h3>
              <p className="text-white font-outfit text-7xl font-black mb-4">
                {formatarReal(metricas.totais.ticketMedioGeral)}
              </p>
              <p className="text-[#94A3B8] text-lg font-outfit mb-6">
                Meta: {formatarReal(metaTicketMedio)}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#94A3B8]">Progresso</span>
                  <span className="text-white font-semibold">
                    {((metricas.totais.ticketMedioGeral / metaTicketMedio) * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min((metricas.totais.ticketMedioGeral / metaTicketMedio) * 100, 100)} 
                  className="h-3"
                  style={{
                    '--progress-background': getProgressColor(metricas.totais.ticketMedioGeral, metaTicketMedio)
                  } as any}
                />
              </div>
            </div>

            {/* Card 3: Taxa de Conversão Média */}
            <div className="bg-[#151E35] rounded-2xl p-12 border border-white/5 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start justify-between mb-8">
                <div className="bg-[#FFB800]/20 p-6 rounded-2xl">
                  <span className="text-5xl">🎯</span>
                </div>
                <Target className="w-10 h-10 text-[#FFB800]" />
              </div>
              <h3 className="text-[#94A3B8] font-outfit text-lg uppercase tracking-wider mb-3">
                Taxa de Conversão Média
              </h3>
              <p className="text-white font-outfit text-7xl font-black mb-4">
                {metricas.totais.taxaConversaoMedia.toFixed(1)}%
              </p>
              <p className="text-[#94A3B8] text-lg font-outfit mb-6">
                Meta: {metaTaxaConversao}%
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#94A3B8]">Progresso</span>
                  <span className="text-white font-semibold">
                    {((metricas.totais.taxaConversaoMedia / metaTaxaConversao) * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(metricas.totais.taxaConversaoMedia, 100)} 
                  className="h-3"
                  style={{
                    '--progress-background': getProgressColor(metricas.totais.taxaConversaoMedia, metaTaxaConversao)
                  } as any}
                />
              </div>
            </div>

            {/* Card 4: Closer Destaque */}
            {metricas.destaque && (
              <div className="bg-gradient-to-br from-[#FFB800] to-[#FF8C00] rounded-2xl p-12 border-4 border-[#FFD700] hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <div className="flex items-start justify-between mb-8">
                  <div className="bg-white/20 p-6 rounded-2xl">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <span className="text-5xl">{metricas.destaque.emoji}</span>
                </div>
                <h3 className="text-white/90 font-outfit text-lg uppercase tracking-wider mb-3">
                  🏆 Closer Destaque
                </h3>
                <p className="text-white font-outfit text-5xl font-black mb-4">
                  {metricas.destaque.nome}
                </p>
                <p className="text-white/90 text-3xl font-outfit font-bold mb-2">
                  {formatarReal(metricas.destaque.receitaTotal)}
                </p>
                <p className="text-white/80 text-lg font-outfit">
                  {metricas.destaque.contratosFechados} contratos fechados
                </p>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* SEÇÃO 2: PÓDIO DOS TOP 3 */}
      <section className="bg-[#F8FAFC] py-20 px-12">
        <h2 className="text-[#0B1120] font-outfit text-5xl font-bold mb-16 text-center tracking-tight">
          Pódio dos Top 3 Closers
        </h2>
        <div className="max-w-[1600px] mx-auto">
          <CloserPodium top3={metricas.top3} />
        </div>
      </section>

      {/* SEÇÃO 3: TABELA COMPARATIVA */}
      <section className="bg-[#0B1120] py-20 px-12">
        <h2 className="text-white font-outfit text-5xl font-bold mb-16 text-center tracking-tight">
          Comparação de Performance
        </h2>
        <div className="max-w-[1800px] mx-auto">
          <CloserComparisonTable closers={metricas.closers} destaque={metricas.destaque} />
        </div>
      </section>

      {/* SEÇÃO 4: CARDS INDIVIDUAIS */}
      <section className="bg-[#F8FAFC] py-20 px-12">
        <h2 className="text-[#0B1120] font-outfit text-5xl font-bold mb-16 text-center tracking-tight">
          Detalhamento Individual
        </h2>
        <div className="max-w-[1400px] mx-auto space-y-6">
          {metricas.closers.map((closer) => (
            <CloserDetailCard
              key={closer.nomeOriginal}
              closer={closer}
              metaIndividual={metaIndividualReceita}
            />
          ))}
        </div>
      </section>

      {/* SEÇÃO 5: GRÁFICOS COMPARATIVOS */}
      <section className="bg-[#0B1120] py-20 px-12">
        <h2 className="text-white font-outfit text-5xl font-bold mb-16 text-center tracking-tight">
          Análise Gráfica Comparativa
        </h2>
        <div className="max-w-[1800px] mx-auto">
          <CloserCharts closers={metricas.closers} metaIndividual={metaIndividualReceita} />
        </div>
      </section>

      {/* FOOTER */}
      {!isTVMode && <Footer />}
    </div>
  );
};

export default PerformanceCloser;
