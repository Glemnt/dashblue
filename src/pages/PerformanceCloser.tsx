import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Target, Trophy } from 'lucide-react';
import logoWhite from '@/assets/logo-white.png';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Navigation from '@/components/Navigation';
import PeriodFilter from '@/components/sdr/PeriodFilter';
import CloserPodium from '@/components/closer/CloserPodium';
import CloserComparisonTable from '@/components/closer/CloserComparisonTable';
import CloserDetailCard from '@/components/closer/CloserDetailCard';
import CloserCharts from '@/components/closer/CloserCharts';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { calcularMetricasCloser } from '@/utils/closerMetricsCalculator';
import { formatarReal } from '@/utils/metricsCalculator';
import { PeriodType, DateRange, getCurrentMonthRange } from '@/utils/dateFilters';

const PerformanceCloser = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { data, loading, error, lastUpdate, refetch } = useGoogleSheets();
  
  const [currentPeriod, setCurrentPeriod] = useState<PeriodType>('mes');
  const [currentDateRange, setCurrentDateRange] = useState<DateRange>(getCurrentMonthRange());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
      <header className="bg-[#0B1120] border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-12 py-8 flex justify-between items-center">
          
          {/* ESQUERDA: Logo */}
          <div className="flex items-center">
            <img src={logoWhite} alt="Blue Ocean" className="h-10 w-auto" />
          </div>

          {/* CENTRO: Título + Subtítulo */}
          <div className="text-center">
            <h1 className="text-white font-outfit text-5xl font-bold tracking-tight">
              Performance Closer
            </h1>
            <p className="text-[#94A3B8] font-outfit text-lg mt-2">
              Análise detalhada da equipe de fechamento
            </p>
          </div>

          {/* DIREITA: Botão + Data/Hora */}
          <div className="text-right flex flex-col items-end gap-3">
            <Button
              onClick={refetch}
              variant="outline"
              className="bg-[#0066FF]/10 border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF] hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <div>
              <p className="text-white font-outfit text-lg font-semibold capitalize">
                {formatDate(currentTime)}
              </p>
              <p className="text-[#94A3B8] font-outfit text-sm">
                Atualizado: {lastUpdate ? formatTime(lastUpdate) : '--:--'}
              </p>
            </div>
          </div>
          
        </div>
      </header>

      {/* NAVEGAÇÃO */}
      <Navigation />

      {/* FILTRO DE PERÍODO */}
      <section className="bg-[#0B1120] pt-12 px-12">
        <div className="max-w-[1800px] mx-auto">
          <PeriodFilter
            onFilterChange={handleFilterChange}
            currentPeriod={currentPeriod}
            currentDateRange={currentDateRange}
          />
        </div>
      </section>

      {/* SEÇÃO 1: RESUMO GERAL */}
      <section className="bg-[#0B1120] py-20 px-12">
        <div className="max-w-[1800px] mx-auto">
          
          <div className="grid grid-cols-2 gap-8">
            
            {/* Card 1: Receita Total */}
            <div className="bg-[#151E35] rounded-2xl p-12 border border-white/5 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start justify-between mb-8">
                <div className="bg-[#0066FF]/20 p-6 rounded-2xl">
                  <span className="text-6xl">💰</span>
                </div>
                <TrendingUp className="w-12 h-12 text-[#0066FF]" />
              </div>
              <h3 className="text-[#94A3B8] font-outfit text-lg uppercase tracking-wider mb-3">
                Receita Total
              </h3>
              <p className="text-white font-outfit text-6xl font-black mb-4">
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
                  <span className="text-6xl">📊</span>
                </div>
                <Target className="w-12 h-12 text-[#00E5CC]" />
              </div>
              <h3 className="text-[#94A3B8] font-outfit text-lg uppercase tracking-wider mb-3">
                Ticket Médio Geral
              </h3>
              <p className="text-white font-outfit text-6xl font-black mb-4">
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
                  <span className="text-6xl">🎯</span>
                </div>
                <Target className="w-12 h-12 text-[#FFB800]" />
              </div>
              <h3 className="text-[#94A3B8] font-outfit text-lg uppercase tracking-wider mb-3">
                Taxa de Conversão Média
              </h3>
              <p className="text-white font-outfit text-6xl font-black mb-4">
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
                    <Trophy className="w-12 h-12 text-white" />
                  </div>
                  <span className="text-6xl">{metricas.destaque.emoji}</span>
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

    </div>
  );
};

export default PerformanceCloser;
