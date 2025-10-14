import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import logoWhite from '@/assets/logo-white.png';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useSDRKPIs } from '@/hooks/useSDRKPIs';
import { calcularMetricasSDR, mesclarMetricasSDRComDashboard } from '@/utils/sdrMetricsCalculator';
import { formatarReal } from '@/utils/metricsCalculator';
import { Button } from '@/components/ui/button';
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
            <div className="bg-[#151E35] rounded-2xl p-12 border border-white/5 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">📞</div>
                <p className="text-[#64748B] font-outfit text-xs font-semibold uppercase tracking-widest">
                  Total de Calls
                </p>
              </div>
              <p className="text-white font-outfit text-7xl font-black mb-4">
                {metricas.totais.totalCalls}
              </p>
              <div className="h-3 bg-white/5 rounded-full mb-4">
                <div 
                  className={`h-full rounded-full ${
                    (metricas.totais.totalCalls / metaMensalCalls) * 100 >= 90 ? 'bg-[#00E5CC]' :
                    (metricas.totais.totalCalls / metaMensalCalls) * 100 >= 70 ? 'bg-[#FFB800]' :
                    'bg-[#FF4757]'
                  }`}
                  style={{ width: `${Math.min((metricas.totais.totalCalls / metaMensalCalls) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[#94A3B8] font-outfit text-base">
                Meta mensal: {metaMensalCalls} calls ({((metricas.totais.totalCalls / metaMensalCalls) * 100).toFixed(1)}%)
              </p>
            </div>

            {/* Card 2: Taxa Média de Qualificação */}
            <div className="bg-[#151E35] rounded-2xl p-12 border border-white/5 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">✅</div>
                <p className="text-[#64748B] font-outfit text-xs font-semibold uppercase tracking-widest">
                  Taxa Média Qualificação
                </p>
              </div>
              <p className="text-white font-outfit text-7xl font-black mb-4">
                {metricas.totais.taxaQualificacaoMedia.toFixed(1)}%
              </p>
              <div className="h-3 bg-white/5 rounded-full mb-4">
                <div 
                  className={`h-full rounded-full ${
                    metricas.totais.taxaQualificacaoMedia >= 35 ? 'bg-[#00E5CC]' :
                    metricas.totais.taxaQualificacaoMedia >= 25 ? 'bg-[#FFB800]' :
                    'bg-[#FF4757]'
                  }`}
                  style={{ width: `${Math.min(metricas.totais.taxaQualificacaoMedia, 100)}%` }}
                />
              </div>
              <p className="text-[#94A3B8] font-outfit text-base">
                Meta: 35%
              </p>
            </div>

            {/* Card 3: Taxa Média de Show */}
            <div className="bg-[#151E35] rounded-2xl p-12 border border-white/5 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">📊</div>
                <p className="text-[#64748B] font-outfit text-xs font-semibold uppercase tracking-widest">
                  Taxa Média de Show
                </p>
              </div>
              <p className="text-white font-outfit text-7xl font-black mb-4">
                {metricas.totais.taxaShowMedia.toFixed(1)}%
              </p>
              <div className="h-3 bg-white/5 rounded-full mb-4">
                <div 
                  className={`h-full rounded-full ${
                    metricas.totais.taxaShowMedia >= 75 ? 'bg-[#00E5CC]' :
                    metricas.totais.taxaShowMedia >= 50 ? 'bg-[#FFB800]' :
                    'bg-[#FF4757]'
                  }`}
                  style={{ width: `${Math.min(metricas.totais.taxaShowMedia, 100)}%` }}
                />
              </div>
              <p className="text-[#94A3B8] font-outfit text-base">
                Meta: 75%
              </p>
            </div>

            {/* Card 4: SDR Destaque */}
            <div className="bg-gradient-to-br from-[#FFB800] to-[#FF8C00] rounded-2xl p-12 border-2 border-[#FFB800] hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">🏆</div>
                <p className="text-white/90 font-outfit text-xs font-semibold uppercase tracking-widest">
                  SDR Destaque
                </p>
              </div>
              <p className="text-white font-outfit text-5xl font-black mb-2">
                {metricas.destaque?.nome}
              </p>
              <p className="text-white font-outfit text-4xl font-bold mb-4">
                {formatarReal(metricas.destaque?.vendasOriginadas || 0)}
              </p>
              <p className="text-white/80 font-outfit text-base">
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
