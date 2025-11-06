import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Target, Trophy } from 'lucide-react';
import logoWhite from '@/assets/logo-white.png';
import DataStaleIndicator from '@/components/DataStaleIndicator';
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
import ColaboradorAvatar from '@/components/ColaboradorAvatar';
import { useTVMode } from '@/hooks/useTVMode';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { calcularMetricasCloser } from '@/utils/closerMetricsCalculator';
import { formatarReal } from '@/utils/metricsCalculator';
import { usePeriodFilter } from '@/contexts/PeriodFilterContext';
import { getMetasPorMes } from '@/utils/metasConfig';

const PerformanceCloser = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Estado global do filtro de período
  const { periodType: currentPeriod, dateRange: currentDateRange, selectedMonthKey, updateFilter, setSelectedMonthKey } = usePeriodFilter();
  
  const { data, loading, error, lastUpdate, refetch, isRefetching } = useGoogleSheets(currentDateRange, selectedMonthKey);
  
  // Estado do modo TV
  const { isTVMode, setIsTVMode } = useTVMode();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
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

  // Handler para mudança de filtro (delega para o context)
  const handleFilterChange = updateFilter;

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

  const configMeta = getMetasPorMes(selectedMonthKey);
  const metaMensalReceita = configMeta.metaMensal;
  const metaIndividualReceita = configMeta.metaIndividualCloser;
  const metaTicketMedio = 4000;
  const metaTaxaConversao = 25;

  console.log('🎯 Performance Closer - Metas:', {
    mes: selectedMonthKey,
    modelo: configMeta.modelo,
    metaMensal: metaMensalReceita,
    metaIndividual: metaIndividualReceita
  });

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
            <div className="flex items-center gap-4">
              <img src={logoWhite} alt="Blue Ocean" className="h-10 w-auto" />
              <DataStaleIndicator lastUpdate={lastUpdate} isTVMode={isTVMode} />
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
              <p className="text-[#A8B8D0] font-outfit text-lg mt-2">
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
              <p className={`text-[#A8B8D0] font-outfit ${
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

      {/* FILTRO DE PERÍODO */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'pt-16 px-16' : 'pt-12 px-12'}`}>
        <div className="max-w-[1800px] mx-auto">
          <PeriodFilter
            onFilterChange={handleFilterChange}
            onMonthChange={setSelectedMonthKey}
            currentPeriod={currentPeriod}
            currentDateRange={currentDateRange}
            selectedMonthKey={selectedMonthKey}
            isTVMode={isTVMode}
          />
        </div>
      </section>

      {/* SEÇÃO 1: RESUMO GERAL */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-12' : 'py-20 px-12'}`}>
        <div className="max-w-[1600px] mx-auto">
          
          <div className={`grid grid-cols-2 ${isTVMode ? 'gap-4' : 'gap-8'}`}>
            
            {/* Card 1: Receita Total */}
            <div className={`bg-[#151E35] rounded-2xl border border-white/5 hover:shadow-2xl transition-all duration-300 ${isTVMode ? 'p-6' : 'p-12'}`}>
              <div className={`flex items-start justify-between ${isTVMode ? 'mb-4' : 'mb-8'}`}>
                <div className={`bg-[#0066FF]/20 rounded-2xl ${isTVMode ? 'p-4' : 'p-6'}`}>
                  <span className="text-5xl">💰</span>
                </div>
                <TrendingUp className={`text-[#0066FF] ${isTVMode ? 'w-7 h-7' : 'w-10 h-10'}`} />
              </div>
              <h3 className={`text-[#A8B8D0] font-outfit uppercase tracking-wider ${isTVMode ? 'text-sm mb-2' : 'text-lg mb-3'}`}>
                Receita Total
              </h3>
              <p className={`text-white font-outfit font-black ${isTVMode ? 'text-4xl md:text-5xl mb-2' : 'text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-4 break-all leading-tight'}`}>
                {formatarReal(metricas.totais.receitaTotal)}
              </p>
              <p className={`text-[#A8B8D0] font-outfit ${isTVMode ? 'text-sm mb-3' : 'text-lg mb-6'}`}>
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
                  className={isTVMode ? 'h-2' : 'h-3'}
                  style={{
                    '--progress-background': getProgressColor(metricas.totais.receitaTotal, metaMensalReceita)
                  } as any}
                />
              </div>
            </div>

            {/* Card 2: Ticket Médio Geral */}
            <div className={`bg-[#151E35] rounded-2xl border border-white/5 hover:shadow-2xl transition-all duration-300 ${isTVMode ? 'p-6' : 'p-12'}`}>
              <div className={`flex items-start justify-between ${isTVMode ? 'mb-4' : 'mb-8'}`}>
                <div className={`bg-[#00E5CC]/20 rounded-2xl ${isTVMode ? 'p-4' : 'p-6'}`}>
                  <span className="text-5xl">📊</span>
                </div>
                <Target className={`text-[#00E5CC] ${isTVMode ? 'w-7 h-7' : 'w-10 h-10'}`} />
              </div>
              <h3 className={`text-[#94A3B8] font-outfit uppercase tracking-wider ${isTVMode ? 'text-sm mb-2' : 'text-lg mb-3'}`}>
                Ticket Médio Geral
              </h3>
              <p className={`text-white font-outfit font-black ${isTVMode ? 'text-5xl mb-2' : 'text-7xl mb-4'}`}>
                {formatarReal(metricas.totais.ticketMedioGeral)}
              </p>
              <p className={`text-[#94A3B8] font-outfit ${isTVMode ? 'text-sm mb-3' : 'text-lg mb-6'}`}>
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
                  className={isTVMode ? 'h-2' : 'h-3'}
                  style={{
                    '--progress-background': getProgressColor(metricas.totais.ticketMedioGeral, metaTicketMedio)
                  } as any}
                />
              </div>
            </div>

            {/* Card 3: Taxa de Conversão Média */}
            <div className={`bg-[#151E35] rounded-2xl border border-white/5 hover:shadow-2xl transition-all duration-300 ${isTVMode ? 'p-6' : 'p-12'}`}>
              <div className={`flex items-start justify-between ${isTVMode ? 'mb-4' : 'mb-8'}`}>
                <div className={`bg-[#FFB800]/20 rounded-2xl ${isTVMode ? 'p-4' : 'p-6'}`}>
                  <span className="text-5xl">🎯</span>
                </div>
                <Target className={`text-[#FFB800] ${isTVMode ? 'w-7 h-7' : 'w-10 h-10'}`} />
              </div>
              <h3 className={`text-[#94A3B8] font-outfit uppercase tracking-wider ${isTVMode ? 'text-sm mb-2' : 'text-lg mb-3'}`}>
                Taxa de Conversão Média
              </h3>
              <p className={`text-white font-outfit font-black ${isTVMode ? 'text-5xl mb-2' : 'text-7xl mb-4'}`}>
                {metricas.totais.taxaConversaoMedia.toFixed(1)}%
              </p>
              <p className={`text-[#94A3B8] font-outfit ${isTVMode ? 'text-sm mb-3' : 'text-lg mb-6'}`}>
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
                  className={isTVMode ? 'h-2' : 'h-3'}
                  style={{
                    '--progress-background': getProgressColor(metricas.totais.taxaConversaoMedia, metaTaxaConversao)
                  } as any}
                />
              </div>
            </div>

            {/* Card 4: Closer Destaque */}
            {metricas.destaque && (
              <div className={`bg-gradient-to-br from-[#FFB800] to-[#FF8C00] rounded-2xl border-4 border-[#FFD700] hover:shadow-2xl hover:scale-105 transition-all duration-300 relative ${isTVMode ? 'p-6' : 'p-12'}`}>
                <div className={`flex items-start justify-between ${isTVMode ? 'mb-4' : 'mb-8'}`}>
                  <div className={`bg-white/20 rounded-2xl ${isTVMode ? 'p-4' : 'p-6'}`}>
                    <Trophy className={`text-white ${isTVMode ? 'w-7 h-7' : 'w-10 h-10'}`} />
                  </div>
                  <ColaboradorAvatar 
                    nome={metricas.destaque.nome}
                    emoji={metricas.destaque.emoji}
                    squadColor={metricas.destaque.squadColor}
                    size="xl"
                    className="absolute -top-8 right-8"
                  />
                </div>
                <h3 className={`text-white/90 font-outfit uppercase tracking-wider ${isTVMode ? 'text-sm mb-2' : 'text-lg mb-3'}`}>
                  🏆 Closer Destaque
                </h3>
                <p className={`text-white font-outfit font-black ${isTVMode ? 'text-4xl mb-2' : 'text-5xl mb-4'}`}>
                  {metricas.destaque.nome}
                </p>
                <p className={`text-white/90 font-outfit font-bold ${isTVMode ? 'text-2xl mb-1' : 'text-3xl mb-2'}`}>
                  {formatarReal(metricas.destaque.receitaTotal)}
                </p>
                <p className={`text-white/80 font-outfit ${isTVMode ? 'text-base' : 'text-lg'}`}>
                  {metricas.destaque.contratosFechados} contratos fechados
                </p>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* SEÇÃO 1.5: META INDIVIDUAL POR CLOSER */}
      <section className={`bg-[#F8FAFC] ${isTVMode ? 'py-12 px-12' : 'py-16 px-12'}`}>
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center mb-8">
            <h2 className={`text-[#0B1120] font-outfit font-bold tracking-tight ${
              isTVMode ? 'text-3xl mb-2' : 'text-4xl mb-3'
            }`}>
              Meta Individual por Closer
            </h2>
            <p className={`text-[#64748B] font-outfit ${
              isTVMode ? 'text-base' : 'text-lg'
            }`}>
              Modelo {configMeta.modelo} • {selectedMonthKey.includes('novembro') ? 'Novembro' : 'Outubro'} 2025
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${
            isTVMode ? 'gap-4' : 'gap-6'
          }`}>
            {metricas.closers.map((closer) => {
              const progressoMeta = (closer.receitaTotal / metaIndividualReceita) * 100;
              const faltaParaMeta = metaIndividualReceita - closer.receitaTotal;
              
              return (
                <div 
                  key={closer.nomeOriginal}
                  className={`bg-white rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                    isTVMode ? 'p-5' : 'p-8'
                  } ${
                    progressoMeta >= 100 
                      ? 'border-[#00E5CC] bg-gradient-to-br from-[#00E5CC]/5 to-white' 
                      : progressoMeta >= 70
                      ? 'border-[#FFB800]'
                      : 'border-[#E2E8F0]'
                  }`}
                >
                  {/* Avatar e Nome */}
                  <div className="flex flex-col items-center mb-4">
                    <ColaboradorAvatar
                      nome={closer.nome}
                      emoji={closer.emoji}
                      squadColor={closer.squadColor}
                      size={isTVMode ? 'lg' : 'xl'}
                      className="mb-3"
                    />
                    <h3 className={`text-[#0B1120] font-outfit font-bold text-center ${
                      isTVMode ? 'text-xl' : 'text-2xl'
                    }`}>
                      {closer.nome}
                    </h3>
                    <p className={`text-[#64748B] font-outfit ${
                      isTVMode ? 'text-xs' : 'text-sm'
                    }`}>
                      Squad {closer.squad}
                    </p>
                  </div>

                  {/* Progresso Visual */}
                  <div className="mb-4">
                    <div className="flex justify-between items-end mb-2">
                      <span className={`text-[#64748B] font-outfit ${
                        isTVMode ? 'text-xs' : 'text-sm'
                      }`}>
                        Meta
                      </span>
                      <span className={`font-outfit font-black ${
                        isTVMode ? 'text-lg' : 'text-2xl'
                      } ${
                        progressoMeta >= 100 ? 'text-[#00E5CC]' : 
                        progressoMeta >= 70 ? 'text-[#FFB800]' : 
                        'text-[#0B1120]'
                      }`}>
                        {progressoMeta.toFixed(0)}%
                      </span>
                    </div>
                    
                    <div className={`relative ${
                      isTVMode ? 'h-3' : 'h-4'
                    } bg-[#E2E8F0] rounded-full overflow-hidden mb-3`}>
                      <div
                        className="absolute h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(progressoMeta, 100)}%`,
                          backgroundColor: progressoMeta >= 100 ? '#00E5CC' : 
                                           progressoMeta >= 70 ? '#FFB800' : '#0066FF'
                        }}
                      />
                    </div>
                  </div>

                  {/* Valores */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-[#64748B] font-outfit ${
                        isTVMode ? 'text-xs' : 'text-sm'
                      }`}>
                        Realizado
                      </span>
                      <span className={`text-[#0B1120] font-outfit font-bold ${
                        isTVMode ? 'text-sm' : 'text-base'
                      }`}>
                        {formatarReal(closer.receitaTotal)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={`text-[#64748B] font-outfit ${
                        isTVMode ? 'text-xs' : 'text-sm'
                      }`}>
                        Meta
                      </span>
                      <span className={`text-[#64748B] font-outfit font-semibold ${
                        isTVMode ? 'text-sm' : 'text-base'
                      }`}>
                        {formatarReal(metaIndividualReceita)}
                      </span>
                    </div>

                    <div className={`pt-2 border-t border-[#E2E8F0] ${
                      faltaParaMeta > 0 ? '' : 'bg-[#00E5CC]/10 -mx-3 px-3 py-2 rounded-lg'
                    }`}>
                      <span className={`font-outfit font-bold block text-center ${
                        isTVMode ? 'text-sm' : 'text-base'
                      } ${
                        faltaParaMeta > 0 ? 'text-[#FF4757]' : 'text-[#00E5CC]'
                      }`}>
                        {faltaParaMeta > 0 
                          ? `Faltam ${formatarReal(faltaParaMeta)}`
                          : `🎉 Meta batida!`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: PÓDIO DOS TOP 3 */}
      <section className={`bg-[#F8FAFC] ${isTVMode ? 'py-16 px-12' : 'py-20 px-12'}`}>
        <h2 className={`text-[#0B1120] font-outfit font-bold text-center tracking-tight ${isTVMode ? 'text-4xl mb-8' : 'text-5xl mb-16'}`}>
          Pódio dos Top 3 Closers
        </h2>
        <div className="max-w-[1600px] mx-auto">
          <CloserPodium top3={metricas.top3} />
        </div>
      </section>

      {/* SEÇÃO 3: TABELA COMPARATIVA */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-12' : 'py-20 px-12'}`}>
        <h2 className={`text-white font-outfit font-bold text-center tracking-tight ${isTVMode ? 'text-4xl mb-6' : 'text-5xl mb-16'}`}>
          Comparação de Performance
        </h2>
        <div className="max-w-[1800px] mx-auto">
          <CloserComparisonTable closers={metricas.closers} destaque={metricas.destaque} />
        </div>
      </section>

      {/* SEÇÃO 4: CARDS INDIVIDUAIS */}
      <section className={`bg-[#F8FAFC] ${isTVMode ? 'py-8 px-12' : 'py-20 px-12'}`}>
        <h2 className={`text-[#0B1120] font-outfit font-bold text-center tracking-tight ${isTVMode ? 'text-4xl mb-6' : 'text-5xl mb-16'}`}>
          Detalhamento Individual
        </h2>
        <div className={`max-w-[1400px] mx-auto ${isTVMode ? 'space-y-3' : 'space-y-6'}`}>
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
      <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-12' : 'py-20 px-12'}`}>
        <h2 className={`text-white font-outfit font-bold text-center tracking-tight ${isTVMode ? 'text-4xl mb-6' : 'text-5xl mb-16'}`}>
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
