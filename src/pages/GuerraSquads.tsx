import { useState, useEffect } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useTVMode } from '@/hooks/useTVMode';
import { usePeriodFilter } from '@/contexts/PeriodFilterContext';
import { calcularMetricasSquads } from '@/utils/squadsMetricsCalculator';
import { formatarReal } from '@/utils/financialMetricsCalculator';
import { filterDataByDateRange } from '@/utils/dateFilters';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import TVModeToggle from '@/components/TVModeToggle';
import PeriodFilter from '@/components/sdr/PeriodFilter';
import { SquadsPlacar } from '@/components/squads/SquadsPlacar';
import { SquadsComparativo } from '@/components/squads/SquadsComparativo';
import { SquadsMembros } from '@/components/squads/SquadsMembros';
import { SquadsProjecao } from '@/components/squads/SquadsProjecao';
import { SquadsMetaIndividual } from '@/components/squads/SquadsMetaIndividual';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import logoWhite from '@/assets/logo-white.png';

const GuerraSquads = () => {
  // Estado global do filtro de período
  const { periodType, dateRange, selectedMonthKey, updateFilter, setSelectedMonthKey } = usePeriodFilter();
  
  const { data, loading, error, refetch, lastUpdate, isRefetching } = useGoogleSheets(dateRange, selectedMonthKey);
  const { isTVMode, setIsTVMode } = useTVMode();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Atualizar hora a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Controle de fullscreen no TV Mode
  useEffect(() => {
    if (isTVMode) {
      document.documentElement.requestFullscreen?.();
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      }
    }
  }, [isTVMode]);

  // Esconder cursor no TV Mode
  useEffect(() => {
    if (isTVMode) {
      let timeout: NodeJS.Timeout;
      const hideCursor = () => {
        document.body.style.cursor = 'none';
      };
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
    }
  }, [isTVMode]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm:ss', { locale: ptBR });
  };

  // Filtrar dados por período e calcular métricas dos squads
  const filteredData = data ? filterDataByDateRange(data, dateRange) : [];
  const metricas = filteredData.length > 0 ? calcularMetricasSquads(filteredData, dateRange, selectedMonthKey) : null;

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00E5CC] mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Carregando dados da guerra...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl font-bold mb-4">Erro ao carregar dados</h2>
          <p className="text-[#94A3B8] mb-6">{error}</p>
          <Button onClick={handleRefresh} variant="outline" size="lg">
            <RefreshCw className="mr-2 h-5 w-5" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!metricas) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] font-outfit">
      {/* HEADER */}
      <header className={`bg-[#0B1120] border-b border-white/5 ${isTVMode ? '' : 'sticky top-0'} z-50`}>
        <div className={`max-w-[1920px] mx-auto ${isTVMode ? 'px-16 py-12' : 'px-12 py-8'} flex justify-between items-center`}>
          {/* ESQUERDA: Logo (oculto no TV Mode) */}
          {!isTVMode && (
            <div className="flex items-center">
              <img src={logoWhite} alt="Blue Ocean" className="h-10 w-auto" />
            </div>
          )}

          {/* CENTRO: Título + Subtítulo */}
          <div className={`text-center ${isTVMode ? 'flex-1' : ''}`}>
            <h1 className={`text-white font-outfit font-bold tracking-tight ${
              isTVMode ? 'text-7xl' : 'text-5xl'
            }`}>
              Guerra de Squads
            </h1>
            {!isTVMode && (
              <p className="text-[#94A3B8] font-outfit text-lg mt-2">
                Hot Dogs 🔴 vs Corvo Azul 🔵
              </p>
            )}
          </div>

          {/* DIREITA: Botões + Data/Hora */}
          <div className="text-right flex flex-col items-end gap-3">
            <div className={`flex ${isTVMode ? 'gap-6' : 'gap-3'}`}>
              <TVModeToggle isTVMode={isTVMode} onToggle={() => setIsTVMode(!isTVMode)} />
              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={isRefreshing}
                className={`bg-[#0066FF]/10 border-2 border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF] hover:text-white transition-all ${
                  isTVMode ? 'px-8 py-6 text-2xl' : 'px-6 py-3 text-lg'
                }`}
              >
                <RefreshCw className={`${isTVMode ? 'w-8 h-8 mr-4' : 'w-5 h-5 mr-2'} ${isRefreshing ? 'animate-spin' : ''}`} />
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

      {/* NAVIGATION */}
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

      {/* SEÇÃO 1: PLACAR GIGANTE */}
      <section className="bg-[#0B1120] py-12 md:py-20 px-6 md:px-12">
        <SquadsPlacar dados={metricas.placar} isTVMode={isTVMode} />
      </section>

      {/* SEÇÃO 1.5: META INDIVIDUAL POR SQUAD */}
      <section className="bg-[#F8FAFC] py-12 md:py-20 px-6 md:px-12">
        <SquadsMetaIndividual
          hotDogs={{
            receitaTotal: metricas.hotDogs.receitaTotal,
            metaSquad: metricas.hotDogs.metaSquad,
            progressoMetaIndividual: metricas.hotDogs.progressoMetaIndividual,
            faltaParaMeta: metricas.hotDogs.faltaParaMeta
          }}
          corvoAzul={{
            receitaTotal: metricas.corvoAzul.receitaTotal,
            metaSquad: metricas.corvoAzul.metaSquad,
            progressoMetaIndividual: metricas.corvoAzul.progressoMetaIndividual,
            faltaParaMeta: metricas.corvoAzul.faltaParaMeta
          }}
          isTVMode={isTVMode}
          monthKey={selectedMonthKey}
        />
      </section>

      {/* SEÇÃO 2: PAINEL COMPARATIVO */}
      <section className="bg-[#F8FAFC] py-12 md:py-20 px-6 md:px-12">
        <SquadsComparativo
          hotDogs={metricas.hotDogs}
          corvoAzul={metricas.corvoAzul}
          comparacao={metricas.comparacao}
          isTVMode={isTVMode}
        />
      </section>

      {/* SEÇÃO 3: BATALHA DE MEMBROS */}
      <section className="bg-[#0B1120] py-12 md:py-20 px-6 md:px-12">
        <SquadsMembros
          hotDogs={metricas.hotDogs}
          corvoAzul={metricas.corvoAzul}
          isTVMode={isTVMode}
        />
      </section>

      {/* SEÇÃO 6: PROJEÇÕES */}
      <section className="bg-[#F8FAFC] py-12 md:py-20 px-6 md:px-12">
        <SquadsProjecao 
          projecao={metricas.projecao} 
          isTVMode={isTVMode} 
        />
      </section>

      {/* SEÇÃO 7: TRASH TALK DINÂMICO */}
      <section className={`py-12 md:py-20 px-6 md:px-12 ${
        metricas.placar.lider === 'Hot Dogs'
          ? 'bg-gradient-to-r from-[#FF4757]/20 to-[#0B1120]'
          : metricas.placar.lider === 'Corvo Azul'
          ? 'bg-gradient-to-r from-[#0B1120] to-[#0066FF]/20'
          : 'bg-gradient-to-r from-[#FF4757]/10 via-[#0B1120] to-[#0066FF]/10'
      }`}>
        <div className="max-w-[1600px] mx-auto text-center">
          {metricas.placar.lider === 'Hot Dogs' && (
            <>
              <h2 className={`font-black text-white mb-4 ${isTVMode ? 'text-6xl' : 'text-4xl md:text-6xl'}`}>
                🔥 Hot Dogs on Fire!
              </h2>
              <p className={`text-white mb-2 ${isTVMode ? 'text-4xl' : 'text-2xl md:text-3xl'}`}>
                +{formatarReal(metricas.placar.vantagem)} na frente!
              </p>
              <p className={`text-[#94A3B8] ${isTVMode ? 'text-2xl' : 'text-lg md:text-xl'}`}>
                Corvo Azul, é hora de voar mais alto! 🦅
              </p>
            </>
          )}

          {metricas.placar.lider === 'Corvo Azul' && (
            <>
              <h2 className={`font-black text-white mb-4 ${isTVMode ? 'text-6xl' : 'text-4xl md:text-6xl'}`}>
                🦅 Corvo Azul Decolou!
              </h2>
              <p className={`text-white mb-2 ${isTVMode ? 'text-4xl' : 'text-2xl md:text-3xl'}`}>
                +{formatarReal(metricas.placar.vantagem)} de vantagem!
              </p>
              <p className={`text-[#94A3B8] ${isTVMode ? 'text-2xl' : 'text-lg md:text-xl'}`}>
                Hot Dogs, onde está o calor? 🔥
              </p>
            </>
          )}

          {metricas.placar.lider === 'Empate' && (
            <>
              <h2 className={`font-black text-white mb-4 ${isTVMode ? 'text-6xl' : 'text-4xl md:text-6xl'}`}>
                ⚔️ Empate Técnico!
              </h2>
              <p className={`text-white mb-2 ${isTVMode ? 'text-4xl' : 'text-2xl md:text-3xl'}`}>
                A batalha está acirrada!
              </p>
              <p className={`text-[#94A3B8] ${isTVMode ? 'text-2xl' : 'text-lg md:text-xl'}`}>
                Próximo contrato pode definir o líder! 🏆
              </p>
            </>
          )}

          <div className="mt-8">
            <p className={`text-[#FFB800] font-bold ${isTVMode ? 'text-2xl' : 'text-lg md:text-xl'}`}>
              Faltam {metricas.projecao.hotDogs.diasRestantes} dias para decidir o campeão deste mês!
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      {!isTVMode && <Footer />}
    </div>
  );
};

export default GuerraSquads;
