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
import SDRPodium from '@/components/sdr/SDRPodium';
import SDRComparisonTable from '@/components/sdr/SDRComparisonTable';
import PeriodFilter from '@/components/sdr/PeriodFilter';
import SDRDetailCard from '@/components/sdr/SDRDetailCard';
import SDRCharts from '@/components/sdr/SDRCharts';
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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
      <header className="bg-[#0B1120] border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-12 py-8 flex justify-between items-center">
          <div className="flex items-center">
            <img src={logoWhite} alt="Blue Ocean" className="h-10 w-auto" />
          </div>

          <div className="text-center">
            <h1 className="text-white font-outfit text-5xl font-bold tracking-tight">
              Performance SDR
            </h1>
            <p className="text-[#94A3B8] font-outfit text-lg mt-2">
              Análise detalhada da equipe de prospecção
            </p>
          </div>

          <div className="text-right flex flex-col items-end gap-3">
            <Button
              onClick={() => { refetch(); refetchKPIs(); }}
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
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-2 gap-8">
            
            {/* Card 1: Total de Calls */}
            <div className="bg-[#151E35] rounded-2xl p-12 border border-white/5 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start justify-between mb-8">
                <div className="bg-[#0066FF]/20 p-6 rounded-2xl">
                  <Phone className="w-10 h-10 text-[#0066FF]" />
                </div>
                <TrendingUp className="w-10 h-10 text-[#0066FF]" />
              </div>
              <h3 className="text-[#94A3B8] font-outfit text-lg uppercase tracking-wider mb-3">
                Total de Calls
              </h3>
              <p className="text-white font-outfit text-7xl font-black mb-4">
                {metricas.totais.totalCalls}
              </p>
              <p className="text-[#94A3B8] text-lg font-outfit mb-6">
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
                  className="h-3"
                  style={{
                    '--progress-background': getProgressColor(metricas.totais.totalCalls, metaMensalCalls)
                  } as any}
                />
              </div>
            </div>

            {/* Card 2: Taxa Média de Qualificação */}
            <div className="bg-[#151E35] rounded-2xl p-12 border border-white/5 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start justify-between mb-8">
                <div className="bg-[#00E5CC]/20 p-6 rounded-2xl">
                  <span className="text-5xl">✅</span>
                </div>
                <Target className="w-10 h-10 text-[#00E5CC]" />
              </div>
              <h3 className="text-[#94A3B8] font-outfit text-lg uppercase tracking-wider mb-3">
                Taxa Média de Qualificação
              </h3>
              <p className="text-white font-outfit text-7xl font-black mb-4">
                {metricas.totais.taxaQualificacaoMedia.toFixed(1)}%
              </p>
              <p className="text-[#94A3B8] text-lg font-outfit mb-6">
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
                  className="h-3"
                  style={{
                    '--progress-background': getProgressColor(metricas.totais.taxaQualificacaoMedia, 50)
                  } as any}
                />
              </div>
            </div>

            {/* Card 3: Taxa Média de Show */}
            <div className="bg-[#151E35] rounded-2xl p-12 border border-white/5 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start justify-between mb-8">
                <div className="bg-[#FFB800]/20 p-6 rounded-2xl">
                  <span className="text-5xl">📊</span>
                </div>
                <Target className="w-10 h-10 text-[#FFB800]" />
              </div>
              <h3 className="text-[#94A3B8] font-outfit text-lg uppercase tracking-wider mb-3">
                Taxa Média de Show
              </h3>
              <p className="text-white font-outfit text-7xl font-black mb-4">
                {metricas.totais.taxaShowMedia.toFixed(1)}%
              </p>
              <p className="text-[#94A3B8] text-lg font-outfit mb-6">
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
                  className="h-3"
                  style={{
                    '--progress-background': getProgressColor(metricas.totais.taxaShowMedia, 75)
                  } as any}
                />
              </div>
            </div>

            {/* Card 4: SDR Destaque */}
            <div className="bg-gradient-to-br from-[#FFB800] to-[#FF8C00] rounded-2xl p-12 border-4 border-[#FFD700] hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="flex items-start justify-between mb-8">
                <div className="bg-white/20 p-6 rounded-2xl">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <span className="text-5xl">🏆</span>
              </div>
              <h3 className="text-white/90 font-outfit text-lg uppercase tracking-wider mb-3">
                SDR Destaque
              </h3>
              <p className="text-white font-outfit text-5xl font-black mb-4">
                {metricas.destaque?.nome}
              </p>
              <p className="text-white/90 text-3xl font-outfit font-bold mb-2">
                {formatarReal(metricas.destaque?.vendasOriginadas || 0)}
              </p>
              <p className="text-white/80 text-lg font-outfit">
                {metricas.destaque?.contratosOriginados} contratos originados
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SEÇÃO 2: PÓDIO DOS TOP 3 */}
      <section className="bg-[#F8FAFC] py-20 px-12">
        <h2 className="text-[#0B1120] font-outfit text-5xl font-bold mb-16 text-center tracking-tight">
          Pódio dos Top 3 SDRs
        </h2>
        <SDRPodium top3={metricas.top3} />
      </section>

      {/* SEÇÃO 3: TABELA COMPARATIVA */}
      <section className="bg-[#0B1120] py-20 px-12">
        <h2 className="text-white font-outfit text-5xl font-bold mb-16 text-center tracking-tight">
          Comparação de Performance
        </h2>
        <div className="max-w-[1800px] mx-auto">
          <SDRComparisonTable sdrs={metricas.sdrs} destaque={metricas.destaque} />
        </div>
      </section>

      {/* SEÇÃO 4: CARDS INDIVIDUAIS EXPANSÍVEIS */}
      <section className="bg-[#F8FAFC] py-20 px-12">
        <h2 className="text-[#0B1120] font-outfit text-5xl font-bold mb-16 text-center tracking-tight">
          Detalhamento Individual
        </h2>
        <div className="max-w-[1400px] mx-auto space-y-6">
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
      <section className="bg-[#0B1120] py-20 px-12">
        <h2 className="text-white font-outfit text-5xl font-bold mb-16 text-center tracking-tight">
          Análise Gráfica Comparativa
        </h2>
        <div className="max-w-[1800px] mx-auto">
          <SDRCharts 
            sdrs={metricas.sdrs} 
            metaIndividualCalls={metaIndividualCalls}
          />
        </div>
      </section>

    </div>
  );
};

export default PerformanceSDR;
