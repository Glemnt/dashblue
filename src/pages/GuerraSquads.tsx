import { useState, useEffect } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useTVMode } from '@/hooks/useTVMode';
import { calcularMetricasSquads } from '@/utils/squadsMetricsCalculator';
import { formatarReal } from '@/utils/financialMetricsCalculator';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import TVModeToggle from '@/components/TVModeToggle';
import { SquadsPlacar } from '@/components/squads/SquadsPlacar';
import { SquadsComparativo } from '@/components/squads/SquadsComparativo';
import { SquadsMembros } from '@/components/squads/SquadsMembros';
import { SquadsGraficos } from '@/components/squads/SquadsGraficos';
import { SquadsHistorico } from '@/components/squads/SquadsHistorico';
import { SquadsProjecao } from '@/components/squads/SquadsProjecao';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import logoWhite from '@/assets/logo-white.png';

const GuerraSquads = () => {
  const { data, loading, error, refetch, lastUpdate } = useGoogleSheets();
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

  // Auto-refresh no TV Mode (60 segundos)
  useEffect(() => {
    if (isTVMode) {
      const interval = setInterval(() => {
        refetch();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [isTVMode, refetch]);

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

  // Calcular métricas dos squads
  const metricas = data ? calcularMetricasSquads(data) : null;

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
      <header className="sticky top-0 z-50 bg-[#0B1120] border-b border-white/10 px-6 py-4">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img src={logoWhite} alt="Blue Ocean" className="h-10" />
            <div>
              <h1 className={`text-white font-black ${isTVMode ? 'text-4xl' : 'text-2xl'}`}>
                Guerra de Squads
              </h1>
              <p className={`text-[#94A3B8] ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                Hot Dogs 🔴 vs Corvo Azul 🔵
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size={isTVMode ? 'lg' : 'default'}
              disabled={isRefreshing}
              className={isTVMode ? 'text-lg px-6 py-6' : ''}
            >
              <RefreshCw className={`mr-2 ${isTVMode ? 'h-6 w-6' : 'h-4 w-4'} ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>

            <div className="text-right">
              <div className={`text-white font-semibold ${isTVMode ? 'text-2xl' : 'text-sm'}`}>
                {formatDate(currentTime)}
              </div>
              <div className={`text-[#00E5CC] font-mono ${isTVMode ? 'text-3xl' : 'text-lg'}`}>
                {formatTime(currentTime)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* NAVIGATION */}
      <Navigation isTVMode={isTVMode} />

      {/* TV MODE TOGGLE */}
      {!isTVMode && (
        <div className="fixed bottom-6 right-6 z-50">
          <TVModeToggle isTVMode={isTVMode} onToggle={() => setIsTVMode(!isTVMode)} />
        </div>
      )}

      {/* INDICADOR DE ATUALIZAÇÃO EM TEMPO REAL (TV MODE) */}
      {isTVMode && (
        <div className="fixed top-24 right-6 z-40 bg-[#151E35] px-6 py-3 rounded-full border border-[#00E5CC] flex items-center gap-3">
          <Wifi className="h-5 w-5 text-[#00E5CC] animate-pulse" />
          <span className="text-white font-semibold text-sm">
            Atualização automática a cada 60s
          </span>
        </div>
      )}

      {/* SEÇÃO 1: PLACAR GIGANTE */}
      <section className="bg-[#0B1120] py-12 md:py-20 px-6 md:px-12">
        <SquadsPlacar dados={metricas.placar} isTVMode={isTVMode} />
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

      {/* SEÇÃO 4: GRÁFICOS COMPARATIVOS */}
      <section className="bg-[#F8FAFC] py-12 md:py-20 px-6 md:px-12">
        <SquadsGraficos
          hotDogs={metricas.hotDogs}
          corvoAzul={metricas.corvoAzul}
          isTVMode={isTVMode}
        />
      </section>

      {/* SEÇÃO 5: HISTÓRICO */}
      <section className="bg-[#0B1120] py-12 md:py-20 px-6 md:px-12">
        <SquadsHistorico historico={metricas.historico} isTVMode={isTVMode} />
      </section>

      {/* SEÇÃO 6: PROJEÇÕES */}
      <section className="bg-[#F8FAFC] py-12 md:py-20 px-6 md:px-12">
        <SquadsProjecao projecao={metricas.projecao} isTVMode={isTVMode} />
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
