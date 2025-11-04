import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";
import { useGoogleSheets } from "@/hooks/useGoogleSheets";
import { useGoogleSheetsCampanhas } from "@/hooks/useGoogleSheetsCampanhas";
import { useGoogleSheetsLeads } from "@/hooks/useGoogleSheetsLeads";
import { calcularMetricas, formatarValor, formatarReal } from "@/utils/metricsCalculator";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PeriodFilter from "@/components/sdr/PeriodFilter";
import TVModeToggle from "@/components/TVModeToggle";
import { useTVMode } from "@/hooks/useTVMode";
import { usePeriodFilter } from "@/contexts/PeriodFilterContext";
import { filterDataByDateRange } from '@/utils/dateFilters';

// Função auxiliar para interpolar entre duas cores hex
const interpolateColor = (color1: string, color2: string, ratio: number): string => {
  const hex = (color: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const c1 = hex(color1);
  const c2 = hex(color2);
  
  if (!c1 || !c2) return color1;

  const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
  const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
  const b = Math.round(c1.b + (c2.b - c1.b) * ratio);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

// Função para calcular a cor da barra de progresso baseada na porcentagem
const getProgressColor = (percentage: number): string => {
  const progress = Math.min(percentage, 120);
  
  if (progress < 20) {
    return '#EF4444'; // Vermelho intenso
  } else if (progress < 35) {
    const ratio = (progress - 20) / 15;
    return interpolateColor('#EF4444', '#F97316', ratio);
  } else if (progress < 50) {
    const ratio = (progress - 35) / 15;
    return interpolateColor('#F97316', '#F59E0B', ratio);
  } else if (progress < 65) {
    const ratio = (progress - 50) / 15;
    return interpolateColor('#F59E0B', '#EAB308', ratio);
  } else if (progress < 80) {
    const ratio = (progress - 65) / 15;
    return interpolateColor('#EAB308', '#84CC16', ratio);
  } else if (progress < 90) {
    const ratio = (progress - 80) / 10;
    return interpolateColor('#84CC16', '#22C55E', ratio);
  } else if (progress < 100) {
    const ratio = (progress - 90) / 10;
    return interpolateColor('#22C55E', '#10B981', ratio);
  } else {
    return '#00E5CC'; // Verde água brilhante
  }
};

const Index = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Estado global do filtro de período
  const { periodType, dateRange, selectedMonthKey, updateFilter, setSelectedMonthKey } = usePeriodFilter();
  
  const { data, loading, error, lastUpdate, refetch, isRefetching } = useGoogleSheets(dateRange, selectedMonthKey);
  const { totalLeads: leadsCampanhas, totalMQLs: mqlsCampanhas, loading: loadingCampanhas } = useGoogleSheetsCampanhas();
  const leads = useGoogleSheetsLeads();
  
  // Estado do modo TV
  const { isTVMode, setIsTVMode } = useTVMode();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (isTVMode) {
      document.documentElement.requestFullscreen?.();
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
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
  
  // Handler para mudança de filtro (delega para o context)
  const handleFilterChange = updateFilter;
  
  // Filtrar dados por período antes de calcular métricas
  const filteredData = data.length > 0 ? filterDataByDateRange(data, dateRange) : [];
  
  // Calcular métricas com dados filtrados
  const metricas = filteredData.length > 0 ? calcularMetricas(filteredData, {
    totalLeads: leadsCampanhas,
    totalMQLs: leads.totalMQLs
  }, selectedMonthKey) : null;

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
  if ((loading || loadingCampanhas || leads.loading) && !metricas) {
    return (
      <div className="min-h-screen bg-[#0B1120] font-outfit flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-[#0066FF] mx-auto mb-4 animate-spin" />
          <h2 className="text-white text-3xl font-bold mb-2">Carregando Dashboard...</h2>
          <p className="text-[#94A3B8] text-lg">Buscando dados do Google Sheets</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || leads.error) {
    return (
      <div className="min-h-screen bg-[#0B1120] font-outfit flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-red-alert text-4xl font-bold mb-4">Erro ao Carregar Dados</h2>
          <p className="text-white text-lg mb-6">{error || leads.error}</p>
          <Button 
            onClick={refetch}
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
          
          <h1 className={`text-white font-outfit font-bold tracking-tight ${
            isTVMode ? 'text-7xl' : 'text-5xl'
          }`}>
            Dashboard Comercial
          </h1>
          
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
            onFilterChange={handleFilterChange}
            onMonthChange={setSelectedMonthKey}
            currentPeriod={periodType}
            currentDateRange={dateRange}
            selectedMonthKey={selectedMonthKey}
            isTVMode={isTVMode}
          />
        </div>
      </section>

      {/* SEÇÃO 1: BARRAS DE META */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'py-6 px-16' : 'py-20 px-12'}`}>
        <h2 className={`text-white font-outfit font-bold text-center tracking-tight ${
          isTVMode ? 'text-4xl mb-6' : 'text-5xl mb-16'
        }`}>
          Status das Metas
        </h2>
        
        <div className={`max-w-[1600px] mx-auto ${isTVMode ? 'space-y-3' : 'space-y-8'}`}>
          {/* META MENSAL */}
          <div className={`bg-[#151E35] rounded-2xl ${isTVMode ? 'p-6 animate-fade-in' : 'p-12'} border border-white/10`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className={`text-[#94A3B8] font-outfit font-semibold uppercase tracking-widest ${
                  isTVMode ? 'text-xs mb-1' : 'text-sm mb-3'
                }`}>
                  Meta Mensal
                </p>
                <p className={`text-white font-outfit font-black ${
                  isTVMode ? 'text-4xl' : 'text-6xl'
                }`}>
                  {formatarReal(metricas.metaMensal)}
                </p>
              </div>
              <div className="text-right">
                <p 
                  key={metricas.progressoMetaMensal}
                  className={`text-white font-outfit font-black ${
                    isTVMode ? 'text-5xl animate-number-change' : 'text-8xl'
                  }`}
                >
                  {metricas.progressoMetaMensal.toFixed(0)}%
                </p>
                <p className={`text-[#94A3B8] font-outfit ${
                  isTVMode ? 'text-base' : 'text-base'
                }`}>
                  do objetivo
                </p>
              </div>
            </div>
            
            <div className={`relative ${isTVMode ? 'h-8' : 'h-12'} bg-white/5 rounded-full overflow-hidden mb-3`}>
              <div 
                className={`absolute h-full rounded-full transition-all duration-1000 ${
                  metricas.progressoMetaMensal >= 90 ? 'animate-pulse-glow' : ''
                }`}
                style={{ 
                  width: `${Math.min(metricas.progressoMetaMensal, 100)}%`,
                  backgroundColor: getProgressColor(metricas.progressoMetaMensal)
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-white font-outfit font-bold ${
                  isTVMode ? 'text-2xl drop-shadow-2xl' : 'text-2xl drop-shadow-lg'
                }`}>
                  {formatarReal(metricas.receitaTotal)}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <p className={`text-[#94A3B8] font-outfit ${
                isTVMode ? 'text-base' : 'text-lg'
              }`}>
                Faltam <span className="text-white font-semibold">{formatarReal(metricas.metaMensal - metricas.receitaTotal)}</span> para a meta
              </p>
              {!isTVMode && (
                <p className="text-[#94A3B8] font-outfit text-sm">
                  15 dias úteis restantes
                </p>
              )}
            </div>
          </div>

          {/* META SEMANAL */}
          <div className={`bg-[#151E35] rounded-2xl ${isTVMode ? 'p-6 animate-fade-in' : 'p-12'} border border-white/10`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className={`text-[#94A3B8] font-outfit font-semibold uppercase tracking-widest ${
                  isTVMode ? 'text-xs mb-1' : 'text-sm mb-3'
                }`}>
                  Meta Semanal
                </p>
                <p className={`text-white font-outfit font-black ${
                  isTVMode ? 'text-4xl' : 'text-6xl'
                }`}>
                  {formatarReal(metricas.metaSemanal)}
                </p>
              </div>
              <div className="text-right">
                <p 
                  key={metricas.progressoMetaSemanal}
                  className={`text-white font-outfit font-black ${
                    isTVMode ? 'text-5xl animate-number-change' : 'text-8xl'
                  }`}
                >
                  {metricas.progressoMetaSemanal.toFixed(0)}%
                </p>
                <p className={`text-[#94A3B8] font-outfit ${
                  isTVMode ? 'text-base' : 'text-base'
                }`}>
                  do objetivo
                </p>
              </div>
            </div>
            
            <div className={`relative ${isTVMode ? 'h-8' : 'h-12'} bg-white/5 rounded-full overflow-hidden mb-3`}>
              <div 
                className={`absolute h-full rounded-full transition-all duration-1000 ${
                  metricas.progressoMetaSemanal >= 90 ? 'animate-pulse-glow' : ''
                }`}
                style={{ 
                  width: `${Math.min(metricas.progressoMetaSemanal, 100)}%`,
                  backgroundColor: getProgressColor(metricas.progressoMetaSemanal)
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-white font-outfit font-bold ${
                  isTVMode ? 'text-2xl drop-shadow-2xl' : 'text-2xl drop-shadow-lg'
                }`}>
                  {formatarReal(metricas.receitaSemanal)}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <p className={`text-[#94A3B8] font-outfit ${
                isTVMode ? 'text-base' : 'text-lg'
              }`}>
                Faltam <span className="text-white font-semibold">{formatarReal(metricas.metaSemanal - metricas.receitaSemanal)}</span> para a meta
              </p>
              <p className={`font-outfit ${isTVMode ? 'text-base' : 'text-sm'} font-semibold ${
                metricas.progressoMetaSemanal >= 70 ? 'text-[#00E5CC]' : 'text-[#94A3B8]'
              }`}>
                {metricas.progressoMetaSemanal >= 70 ? 'No caminho certo' : 'Atenção'}
              </p>
            </div>
          </div>

          {/* META DIÁRIA */}
          <div className={`bg-[#151E35] rounded-2xl ${isTVMode ? 'p-6 animate-fade-in' : 'p-12'} border border-white/10`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className={`text-[#94A3B8] font-outfit font-semibold uppercase tracking-widest ${
                  isTVMode ? 'text-xs mb-1' : 'text-sm mb-3'
                }`}>
                  Meta Diária
                </p>
                <p className={`text-white font-outfit font-black ${
                  isTVMode ? 'text-4xl' : 'text-6xl'
                }`}>
                  {formatarReal(metricas.metaDiaria)}
                </p>
              </div>
              <div className="text-right">
                <p 
                  key={metricas.progressoMetaDiaria}
                  className={`text-white font-outfit font-black ${
                    isTVMode ? 'text-5xl animate-number-change' : 'text-8xl'
                  }`}
                >
                  {metricas.progressoMetaDiaria.toFixed(0)}%
                </p>
                <p className={`text-[#94A3B8] font-outfit ${
                  isTVMode ? 'text-base' : 'text-base'
                }`}>
                  do objetivo
                </p>
              </div>
            </div>
            
            <div className={`relative ${isTVMode ? 'h-8' : 'h-12'} bg-white/5 rounded-full overflow-hidden mb-3`}>
              <div 
                className={`absolute h-full rounded-full transition-all duration-1000 ${
                  metricas.progressoMetaDiaria >= 90 ? 'animate-pulse-glow' : ''
                }`}
                style={{ 
                  width: `${Math.min(metricas.progressoMetaDiaria, 100)}%`,
                  backgroundColor: getProgressColor(metricas.progressoMetaDiaria)
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-white font-outfit font-bold ${
                  isTVMode ? 'text-2xl drop-shadow-2xl' : 'text-2xl drop-shadow-lg'
                }`}>
                  {formatarReal(metricas.receitaDiaria)}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <p className={`text-[#94A3B8] font-outfit ${
                isTVMode ? 'text-base' : 'text-lg'
              }`}>
                Faltam <span className="text-white font-semibold">{formatarReal(metricas.metaDiaria - metricas.receitaDiaria)}</span> para a meta
              </p>
              <p className={`font-outfit ${isTVMode ? 'text-base' : 'text-sm'} font-bold ${
                metricas.progressoMetaDiaria >= 90 ? 'text-[#00E5CC]' : 'text-[#94A3B8]'
              }`}>
                {metricas.progressoMetaDiaria >= 90 ? 'QUASE LÁ' : 'ATENÇÃO'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: KPI CARDS */}
      <section className={`bg-[#F8FAFC] ${isTVMode ? 'py-24 px-16' : 'py-20 px-12'}`}>
        <h2 className={`text-[#0B1120] font-outfit font-bold text-center tracking-tight ${
          isTVMode ? 'text-6xl mb-20' : 'text-5xl mb-16'
        }`}>
          Indicadores Principais
        </h2>
        
        <div className={`grid ${isTVMode ? 'grid-cols-3' : 'grid-cols-3'} ${isTVMode ? 'gap-12' : 'gap-8'} max-w-[1600px] mx-auto`}>
          
            {/* Card 1: Receita Total */}
          <div className="bg-white rounded-2xl p-10 border-2 border-[#F8FAFC] hover:shadow-xl transition-all duration-300">
            <p className="text-gray-medium font-outfit text-xs font-semibold uppercase tracking-widest mb-6">
              Receita Total
            </p>
            <p className="text-[#0B1120] font-outfit text-7xl font-black mb-4">
              {formatarValor(metricas.receitaTotal)}
            </p>
            <div className="h-2 bg-[#F8FAFC] rounded-full mb-4">
              <div className="h-full bg-[#0066FF] rounded-full" style={{ width: `${Math.min(metricas.progressoMetaMensal, 100)}%` }}></div>
            </div>
            <p className="text-gray-medium font-outfit text-base">
              {metricas.totalContratos} contratos fechados
            </p>
          </div>

          {/* Card 2: Ticket Médio */}
          <div className="bg-white rounded-2xl p-10 border-2 border-[#F8FAFC] hover:shadow-xl transition-all duration-300">
            <p className="text-gray-medium font-outfit text-xs font-semibold uppercase tracking-widest mb-6">
              Ticket Médio
            </p>
            <p className="text-[#0B1120] font-outfit text-7xl font-black mb-4">
              {formatarValor(metricas.ticketMedio)}
            </p>
            <div className="h-2 bg-[#F8FAFC] rounded-full mb-4">
              <div className="h-full bg-[#00E5CC] rounded-full" style={{ width: `${Math.min((metricas.ticketMedio / 12000) * 100, 100)}%` }}></div>
            </div>
            <p className="text-gray-medium font-outfit text-base">
              Meta: R$ 12.000
            </p>
          </div>

          {/* Card 3: Contratos */}
          <div className="bg-[#0066FF] rounded-2xl p-10 border-2 border-[#0066FF] hover:shadow-xl transition-all duration-300">
            <p className="text-white/70 font-outfit text-xs font-semibold uppercase tracking-widest mb-6">
              Contratos
            </p>
            <p className="text-white font-outfit text-7xl font-black mb-4">
              {metricas.totalContratos}
            </p>
            <div className="h-2 bg-white/20 rounded-full mb-4">
              <div className="h-full bg-white rounded-full" style={{ width: `${Math.min((metricas.totalContratos / 55) * 100, 100)}%` }}></div>
            </div>
            <p className="text-white/80 font-outfit text-base">
              Meta mensal: 55 ({((metricas.totalContratos / 55) * 100).toFixed(0)}%)
            </p>
          </div>

          {/* Card 4: Leads Total */}
          <div className="bg-white rounded-2xl p-10 border-2 border-[#0066FF] hover:shadow-xl transition-all duration-300">
            <p className="text-gray-medium font-outfit text-xs font-semibold uppercase tracking-widest mb-6">
              Leads Total
            </p>
            <p className="text-[#0B1120] font-outfit text-7xl font-black mb-4">
              {metricas.funil.leads}
            </p>
            <div className="h-2 bg-[#F8FAFC] rounded-full mb-4">
              <div 
                className="h-full bg-[#0066FF] rounded-full"
                style={{ width: `${metricas.funil.leads > 0 ? Math.min((metricas.funil.mqls / metricas.funil.leads) * 100, 100) : 0}%` }}
              ></div>
            </div>
            <p className="text-gray-medium font-outfit text-base">
              {metricas.funil.mqls} MQLs ({metricas.funil.leads > 0 ? ((metricas.funil.mqls / metricas.funil.leads) * 100).toFixed(1) : '0'}%)
            </p>
          </div>

          {/* Card 5: Taxa de Show */}
          <div className="bg-white rounded-2xl p-10 border-2 border-[#F8FAFC] hover:shadow-xl transition-all duration-300">
            <p className="text-gray-medium font-outfit text-xs font-semibold uppercase tracking-widest mb-6">
              Taxa de Show
            </p>
            <p className="text-[#0B1120] font-outfit text-7xl font-black mb-4">
              {metricas.taxaShow.toFixed(1)}%
            </p>
            <div className="h-2 bg-[#F8FAFC] rounded-full mb-4">
              <div className="h-full bg-[#00E5CC] rounded-full" style={{ width: `${Math.min(metricas.taxaShow, 100)}%` }}></div>
            </div>
            <p className="text-gray-medium font-outfit text-base">
              {metricas.callsRealizadas} realizadas / {metricas.callsAgendadas} agendadas
            </p>
          </div>

          {/* Card 6: Taxa Conversão */}
          <div className="bg-[#00E5CC] rounded-2xl p-10 border-2 border-[#00E5CC] hover:shadow-xl transition-all duration-300">
            <p className="text-[#0B1120]/70 font-outfit text-xs font-semibold uppercase tracking-widest mb-6">
              Taxa Conversão
            </p>
            <p className="text-[#0B1120] font-outfit text-7xl font-black mb-4">
              {metricas.taxaConversao.toFixed(1)}%
            </p>
            <div className="h-2 bg-[#0B1120]/10 rounded-full mb-4">
              <div className="h-full bg-[#0B1120] rounded-full" style={{ width: `${Math.min(metricas.taxaConversao, 100)}%` }}></div>
            </div>
            <p className="text-[#0B1120]/80 font-outfit text-base">
              {metricas.totalContratos} fechados / {metricas.callsQualificadas} qualificados
            </p>
          </div>

        </div>
      </section>

      {/* SEÇÃO 3: FUNIL DE CONVERSÃO */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-16' : 'py-20 px-12'}`}>
        <h2 className={`text-white font-outfit font-bold text-center tracking-tight ${
          isTVMode ? 'text-4xl mb-6' : 'text-5xl mb-16'
        }`}>
          Funil de Conversão
        </h2>
        
        <div className={`max-w-[900px] mx-auto ${isTVMode ? 'space-y-2' : 'space-y-6'}`}>
          
          {/* Leads (100%) */}
          <div className="relative">
            <div className={`bg-[#0066FF] rounded-2xl ${isTVMode ? 'p-5' : 'p-8'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/70 font-outfit text-sm font-semibold uppercase tracking-widest mb-2">Leads</p>
                  <p className={`text-white font-outfit font-black ${isTVMode ? 'text-5xl' : 'text-7xl'}`}>{formatarValor(metricas.funil.leads)}</p>
                </div>
                <p className="text-white/60 font-outfit text-lg">100% do total</p>
              </div>
            </div>
            <div className={`flex justify-center ${isTVMode ? 'mt-1' : 'mt-3'}`}>
              <div className="text-center">
                <p className="text-gray-muted font-outfit text-sm">
                  {metricas.funil.leads > 0 ? ((metricas.funil.mqls / metricas.funil.leads) * 100).toFixed(1) : '0'}% qualificação ↓
                </p>
              </div>
            </div>
          </div>

          {/* MQLs (90%) */}
          <div className="relative mx-auto" style={{ width: '90%' }}>
            <div className={`bg-blue-vibrant/90 rounded-2xl ${isTVMode ? 'p-5' : 'p-8'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/70 font-outfit text-sm font-semibold uppercase tracking-widest mb-2">MQLs</p>
                  <p className={`text-white font-outfit font-black ${isTVMode ? 'text-5xl' : 'text-7xl'}`}>{formatarValor(metricas.funil.mqls)}</p>
                </div>
                <p className="text-white/60 font-outfit text-lg">
                  {metricas.funil.leads > 0 ? ((metricas.funil.mqls / metricas.funil.leads) * 100).toFixed(1) : '0'}% do total
                </p>
              </div>
            </div>
            <div className={`flex justify-center ${isTVMode ? 'mt-1' : 'mt-3'}`}>
              <div className="text-center">
                <p className="text-gray-muted font-outfit text-sm">
                  {metricas.funil.mqls > 0 ? ((metricas.funil.callsAgendadas / metricas.funil.mqls) * 100).toFixed(1) : '0'}% agendamento ↓
                </p>
              </div>
            </div>
          </div>

          {/* Calls Agendadas (80%) */}
          <div className="relative mx-auto" style={{ width: '80%' }}>
            <div className={`bg-blue-vibrant/70 rounded-2xl ${isTVMode ? 'p-5' : 'p-8'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/70 font-outfit text-sm font-semibold uppercase tracking-widest mb-2">Calls Agendadas</p>
                  <p className={`text-white font-outfit font-black ${isTVMode ? 'text-5xl' : 'text-7xl'}`}>{formatarValor(metricas.funil.callsAgendadas)}</p>
                </div>
                <p className="text-white/60 font-outfit text-lg">
                  {metricas.funil.leads > 0 ? ((metricas.funil.callsAgendadas / metricas.funil.leads) * 100).toFixed(1) : '0'}% do total
                </p>
              </div>
            </div>
            <div className={`flex justify-center ${isTVMode ? 'mt-1' : 'mt-3'}`}>
              <div className="text-center">
                <p className="text-gray-muted font-outfit text-sm">
                  {metricas.funil.callsAgendadas > 0 ? ((metricas.funil.callsRealizadas / metricas.funil.callsAgendadas) * 100).toFixed(1) : '0'}% comparecimento ↓
                </p>
              </div>
            </div>
          </div>

          {/* Calls Realizadas (70%) */}
          <div className="relative mx-auto" style={{ width: '70%' }}>
            <div className={`bg-cyan-modern/80 rounded-2xl ${isTVMode ? 'p-5' : 'p-8'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-navy-ultra-dark/70 font-outfit text-sm font-semibold uppercase tracking-widest mb-2">Calls Realizadas</p>
                  <p className={`text-navy-ultra-dark font-outfit font-black ${isTVMode ? 'text-5xl' : 'text-7xl'}`}>{formatarValor(metricas.funil.callsRealizadas)}</p>
                </div>
                <p className="text-navy-ultra-dark/60 font-outfit text-lg">
                  {metricas.funil.leads > 0 ? ((metricas.funil.callsRealizadas / metricas.funil.leads) * 100).toFixed(1) : '0'}% do total
                </p>
              </div>
            </div>
            <div className={`flex justify-center ${isTVMode ? 'mt-1' : 'mt-3'}`}>
              <div className="text-center">
                <p className="text-gray-muted font-outfit text-sm">
                  {metricas.funil.callsRealizadas > 0 ? ((metricas.funil.callsQualificadas / metricas.funil.callsRealizadas) * 100).toFixed(1) : '0'}% qualificação ↓
                </p>
              </div>
            </div>
          </div>

          {/* Calls Qualificadas (65%) */}
          <div className="relative mx-auto" style={{ width: '65%' }}>
            <div className={`bg-cyan-modern/90 rounded-2xl ${isTVMode ? 'p-5' : 'p-8'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-navy-ultra-dark/70 font-outfit text-sm font-semibold uppercase tracking-widest mb-2">
                    Calls Qualificadas
                  </p>
                  <p className={`text-navy-ultra-dark font-outfit font-black ${isTVMode ? 'text-5xl' : 'text-7xl'}`}>
                    {formatarValor(metricas.funil.callsQualificadas)}
                  </p>
                </div>
                <p className="text-navy-ultra-dark/60 font-outfit text-lg">
                  {metricas.funil.leads > 0 ? ((metricas.funil.callsQualificadas / metricas.funil.leads) * 100).toFixed(1) : '0'}% do total
                </p>
              </div>
            </div>
            <div className={`flex justify-center ${isTVMode ? 'mt-1' : 'mt-3'}`}>
              <div className="text-center">
                <p className="text-gray-muted font-outfit text-sm">
                  {metricas.funil.callsQualificadas > 0 ? ((metricas.funil.contratos / metricas.funil.callsQualificadas) * 100).toFixed(1) : '0'}% conversão ↓
                </p>
              </div>
            </div>
          </div>

          {/* Contratos (60%) */}
          <div className="relative mx-auto" style={{ width: '60%' }}>
            <div className={`bg-cyan-modern rounded-2xl border-2 border-cyan-modern ${isTVMode ? 'p-5' : 'p-8'}`}>
              <div className={`flex justify-between items-center ${isTVMode ? 'mb-3' : 'mb-6'}`}>
                <div>
                  <p className="text-navy-ultra-dark/70 font-outfit text-sm font-semibold uppercase tracking-widest mb-2">Contratos Fechados</p>
                  <p className={`text-navy-ultra-dark font-outfit font-black ${isTVMode ? 'text-5xl' : 'text-7xl'}`}>{metricas.funil.contratos}</p>
                </div>
                <p className="text-navy-ultra-dark/60 font-outfit text-lg">
                  {metricas.funil.leads > 0 ? ((metricas.funil.contratos / metricas.funil.leads) * 100).toFixed(1) : '0'}% do total
                </p>
              </div>
              <div className={`border-t-2 border-navy-ultra-dark/10 ${isTVMode ? 'pt-3' : 'pt-6'}`}>
                <p className={`text-navy-ultra-dark font-outfit font-black mb-1 ${isTVMode ? 'text-2xl' : 'text-3xl'}`}>
                  {formatarReal(metricas.receitaTotal)}
                </p>
                <p className="text-navy-ultra-dark/60 font-outfit text-sm">
                  Receita Fechada
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SEÇÃO 4: GUERRA DE SQUADS */}
      <section className="bg-gray-light py-20 px-12">
        <h2 className="text-navy-ultra-dark font-outfit text-5xl font-bold mb-16 text-center tracking-tight">
          Guerra de Squads
        </h2>
        
        <div className="grid grid-cols-2 gap-8 max-w-[1600px] mx-auto mb-8">
          
          {/* Squad Hot Dogs */}
          <div className="bg-white rounded-2xl p-12 border-l-8 border-red-alert relative hover:shadow-xl transition-all duration-300">
            {metricas.squads.lider === 'hotDogs' && (
              <div className="absolute top-6 right-6">
                <div className="bg-yellow-warning px-6 py-2 rounded-lg">
                  <span className="text-navy-ultra-dark font-outfit text-sm font-bold uppercase tracking-wider">LÍDER</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-red-alert rounded-lg flex items-center justify-center">
                <span className="text-white font-outfit text-2xl font-black">HD</span>
              </div>
              <h3 className="text-navy-ultra-dark font-outfit text-4xl font-bold">
                SQUAD HOT DOGS
              </h3>
            </div>
            
            <p className="text-navy-ultra-dark font-outfit text-8xl font-black mb-2">
              {formatarValor(metricas.squads.hotDogs.receita)}
            </p>
            <p className="text-gray-medium font-outfit text-xl mb-6">
              {metricas.squads.hotDogs.contratos} contratos fechados
            </p>
            
            <div className="h-2 bg-gray-light rounded-full mb-8">
              <div 
                className="h-full bg-red-alert rounded-full" 
                style={{ 
                  width: `${(metricas.squads.hotDogs.receita / (metricas.squads.hotDogs.receita + metricas.squads.corvoAzul.receita)) * 100}%` 
                }}
              ></div>
            </div>
            
            <div className="bg-gray-light rounded-xl p-6">
              <p className="text-gray-medium font-outfit text-xs font-semibold uppercase tracking-widest mb-3">MEMBROS</p>
              <ul className="space-y-2 text-navy-ultra-dark font-outfit text-base">
                <li>• Marcos (SDR)</li>
                <li>• Bruno (Closer)</li>
                <li>• Cauã (Closer)</li>
              </ul>
            </div>
          </div>

          {/* Squad Corvo Azul */}
          <div className="bg-white rounded-2xl p-12 border-l-8 border-blue-vibrant relative hover:shadow-xl transition-all duration-300">
            {metricas.squads.lider === 'corvoAzul' && (
              <div className="absolute top-6 right-6">
                <div className="bg-yellow-warning px-6 py-2 rounded-lg">
                  <span className="text-navy-ultra-dark font-outfit text-sm font-bold uppercase tracking-wider">LÍDER</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-blue-vibrant rounded-lg flex items-center justify-center">
                <span className="text-white font-outfit text-2xl font-black">CA</span>
              </div>
              <h3 className="text-navy-ultra-dark font-outfit text-4xl font-bold">
                SQUAD CORVO AZUL
              </h3>
            </div>
            
            <p className="text-navy-ultra-dark font-outfit text-8xl font-black mb-2">
              {formatarValor(metricas.squads.corvoAzul.receita)}
            </p>
            <p className="text-gray-medium font-outfit text-xl mb-6">
              {metricas.squads.corvoAzul.contratos} contratos fechados
            </p>
            
            <div className="h-2 bg-gray-light rounded-full mb-8">
              <div 
                className="h-full bg-blue-vibrant rounded-full" 
                style={{ 
                  width: `${(metricas.squads.corvoAzul.receita / (metricas.squads.hotDogs.receita + metricas.squads.corvoAzul.receita)) * 100}%` 
                }}
              ></div>
            </div>
            
            <div className="bg-gray-light rounded-xl p-6">
              <p className="text-gray-medium font-outfit text-xs font-semibold uppercase tracking-widest mb-3">MEMBROS</p>
              <ul className="space-y-2 text-navy-ultra-dark font-outfit text-base">
                <li>• Vinícius (SDR)</li>
                <li>• Gabriel Fernandes (Closer)</li>
                <li>• Gabriel Franklin (Closer)</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Banner Dinâmico */}
        <div 
          className={`rounded-2xl p-10 text-center max-w-[1600px] mx-auto ${
            metricas.squads.lider === 'hotDogs' ? 'bg-red-alert' : 'bg-blue-vibrant'
          }`}
        >
          <p className="text-white font-outfit text-4xl font-bold mb-3 tracking-tight">
            {metricas.squads.lider === 'hotDogs' ? 'SQUAD HOT DOGS' : 'SQUAD CORVO AZUL'} ESTÁ NA LIDERANÇA
          </p>
          <p className="text-white font-outfit text-2xl mb-1 font-semibold">
            Vantagem: {formatarReal(metricas.squads.vantagem)} ({metricas.squads.vantagemPercentual.toFixed(1)}%)
          </p>
          <p className="text-white/80 font-outfit text-lg">
            Para {metricas.squads.lider === 'hotDogs' ? 'Corvo Azul' : 'Hot Dogs'} virar: +{formatarReal(metricas.squads.vantagem + 0.01)} em vendas
          </p>
        </div>
      </section>

      {/* FOOTER */}
      {!isTVMode && <Footer />}
    </div>
  );
};

export default Index;
