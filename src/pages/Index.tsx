import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";
import { useGoogleSheets } from "@/hooks/useGoogleSheets";
import { useGoogleSheetsCampanhas } from "@/hooks/useGoogleSheetsCampanhas";
import { useGoogleSheetsLeads } from "@/hooks/useGoogleSheetsLeads";
import { calcularMetricas, formatarValor, formatarReal } from "@/utils/metricsCalculator";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { data, loading, error, lastUpdate, refetch } = useGoogleSheets();
  const { totalLeads: leadsCampanhas, totalMQLs: mqlsCampanhas, loading: loadingCampanhas } = useGoogleSheetsCampanhas();
  const leads = useGoogleSheetsLeads();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Calcular métricas quando os dados mudarem
  const metricas = data.length > 0 ? calcularMetricas(data, {
    totalLeads: leadsCampanhas,
    totalMQLs: leads.totalMQLs
  }) : null;

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
      <div className="min-h-screen bg-navy-ultra-dark font-outfit flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-blue-vibrant mx-auto mb-4 animate-spin" />
          <h2 className="text-white text-3xl font-bold mb-2">Carregando Dashboard...</h2>
          <p className="text-gray-muted text-lg">Buscando dados do Google Sheets</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || leads.error) {
    return (
      <div className="min-h-screen bg-navy-ultra-dark font-outfit flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-red-alert text-4xl font-bold mb-4">Erro ao Carregar Dados</h2>
          <p className="text-white text-lg mb-6">{error || leads.error}</p>
          <Button 
            onClick={refetch}
            className="bg-blue-vibrant hover:bg-blue-vibrant/90 text-white px-8 py-3 text-lg"
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
    <div className="min-h-screen bg-navy-ultra-dark font-outfit">
      {/* HEADER */}
      <header className="bg-navy-ultra-dark border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-12 py-8 flex justify-between items-center">
          <div className="flex items-center">
            <img src={logoWhite} alt="Blue Ocean" className="h-10 w-auto" />
          </div>
          
          <h1 className="text-white font-outfit text-5xl font-bold tracking-tight">
            Dashboard Comercial
          </h1>
          
          <div className="text-right flex flex-col items-end gap-3">
            <Button 
              onClick={refetch}
              variant="outline"
              className="bg-blue-vibrant/10 border-blue-vibrant text-blue-vibrant hover:bg-blue-vibrant hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <div>
              <p className="text-white font-outfit text-lg font-semibold capitalize">
                {formatDate(currentTime)}
              </p>
              <p className="text-gray-muted font-outfit text-sm">
                Atualizado: {lastUpdate ? formatTime(lastUpdate) : '--:--'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* SEÇÃO 1: BARRAS DE META */}
      <section className="bg-navy-ultra-dark py-20 px-12">
        <h2 className="text-white font-outfit text-5xl font-bold mb-16 text-center tracking-tight">
          Status das Metas
        </h2>
        
        <div className="max-w-[1600px] mx-auto space-y-8">
          {/* META MENSAL */}
          <div className="bg-navy-card rounded-2xl p-12 border border-white/5">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-gray-muted font-outfit text-sm font-semibold uppercase tracking-widest mb-3">
                  Meta Mensal
                </p>
                <p className="text-white font-outfit text-6xl font-black">
                  {formatarReal(metricas.metaMensal)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-outfit text-8xl font-black">
                  {metricas.progressoMetaMensal.toFixed(0)}%
                </p>
                <p className="text-gray-muted font-outfit text-base">
                  do objetivo
                </p>
              </div>
            </div>
            
            <div className="relative h-12 bg-white/5 rounded-full overflow-hidden mb-6">
              <div 
                className={`absolute h-full rounded-full transition-all duration-1000 ${
                  metricas.progressoMetaMensal < 70 ? 'bg-red-alert' : 
                  metricas.progressoMetaMensal < 90 ? 'bg-yellow-warning' : 
                  'bg-cyan-modern'
                }`}
                style={{ width: `${Math.min(metricas.progressoMetaMensal, 100)}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-outfit text-2xl font-bold">
                  {formatarReal(metricas.receitaTotal)}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-gray-muted font-outfit text-lg">
                Faltam <span className="text-white font-semibold">{formatarReal(metricas.metaMensal - metricas.receitaTotal)}</span> para a meta
              </p>
              <p className="text-gray-muted font-outfit text-sm">
                15 dias úteis restantes
              </p>
            </div>
          </div>

          {/* META SEMANAL */}
          <div className="bg-navy-card rounded-2xl p-12 border border-white/5">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-gray-muted font-outfit text-sm font-semibold uppercase tracking-widest mb-3">
                  Meta Semanal
                </p>
                <p className="text-white font-outfit text-6xl font-black">
                  {formatarReal(metricas.metaSemanal)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-outfit text-8xl font-black">
                  {metricas.progressoMetaSemanal.toFixed(0)}%
                </p>
                <p className="text-gray-muted font-outfit text-base">
                  do objetivo
                </p>
              </div>
            </div>
            
            <div className="relative h-12 bg-white/5 rounded-full overflow-hidden mb-6">
              <div 
                className={`absolute h-full rounded-full transition-all duration-1000 ${
                  metricas.progressoMetaSemanal < 70 ? 'bg-red-alert' : 
                  metricas.progressoMetaSemanal < 90 ? 'bg-yellow-warning' : 
                  'bg-cyan-modern'
                }`}
                style={{ width: `${Math.min(metricas.progressoMetaSemanal, 100)}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-navy-ultra-dark font-outfit text-2xl font-bold">
                  {formatarReal(metricas.receitaSemanal)}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-gray-muted font-outfit text-lg">
                Faltam <span className="text-white font-semibold">{formatarReal(metricas.metaSemanal - metricas.receitaSemanal)}</span> para a meta
              </p>
              <p className={`font-outfit text-sm font-semibold ${
                metricas.progressoMetaSemanal >= 70 ? 'text-cyan-modern' : 'text-gray-muted'
              }`}>
                {metricas.progressoMetaSemanal >= 70 ? 'No caminho certo' : 'Atenção'}
              </p>
            </div>
          </div>

          {/* META DIÁRIA */}
          <div className="bg-navy-card rounded-2xl p-12 border border-white/5">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-gray-muted font-outfit text-sm font-semibold uppercase tracking-widest mb-3">
                  Meta Diária
                </p>
                <p className="text-white font-outfit text-6xl font-black">
                  {formatarReal(metricas.metaDiaria)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-outfit text-8xl font-black">
                  {metricas.progressoMetaDiaria.toFixed(0)}%
                </p>
                <p className="text-gray-muted font-outfit text-base">
                  do objetivo
                </p>
              </div>
            </div>
            
            <div className="relative h-12 bg-white/5 rounded-full overflow-hidden mb-6">
              <div 
                className={`absolute h-full rounded-full transition-all duration-1000 ${
                  metricas.progressoMetaDiaria < 70 ? 'bg-red-alert' : 
                  metricas.progressoMetaDiaria < 90 ? 'bg-yellow-warning' : 
                  'bg-cyan-modern'
                }`}
                style={{ width: `${Math.min(metricas.progressoMetaDiaria, 100)}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-navy-ultra-dark font-outfit text-2xl font-bold">
                  {formatarReal(metricas.receitaDiaria)}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-gray-muted font-outfit text-lg">
                Faltam <span className="text-white font-semibold">{formatarReal(metricas.metaDiaria - metricas.receitaDiaria)}</span> para a meta
              </p>
              <p className={`font-outfit text-sm font-bold ${
                metricas.progressoMetaDiaria >= 90 ? 'text-cyan-modern' : 'text-gray-muted'
              }`}>
                {metricas.progressoMetaDiaria >= 90 ? 'QUASE LÁ' : 'ATENÇÃO'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: KPI CARDS */}
      <section className="bg-gray-light py-20 px-12">
        <h2 className="text-navy-ultra-dark font-outfit text-5xl font-bold mb-16 text-center tracking-tight">
          Indicadores Principais
        </h2>
        
        <div className="grid grid-cols-3 gap-8 max-w-[1600px] mx-auto">
          
            {/* Card 1: Receita Total */}
          <div className="bg-white rounded-2xl p-10 border-2 border-gray-light hover:shadow-xl transition-all duration-300">
            <p className="text-gray-medium font-outfit text-xs font-semibold uppercase tracking-widest mb-6">
              Receita Total
            </p>
            <p className="text-navy-ultra-dark font-outfit text-8xl font-black mb-4">
              {formatarValor(metricas.receitaTotal)}
            </p>
            <div className="h-2 bg-gray-light rounded-full mb-4">
              <div className="h-full bg-blue-vibrant rounded-full" style={{ width: `${Math.min(metricas.progressoMetaMensal, 100)}%` }}></div>
            </div>
            <p className="text-gray-medium font-outfit text-base">
              {metricas.totalContratos} contratos fechados
            </p>
          </div>

          {/* Card 2: Ticket Médio */}
          <div className="bg-white rounded-2xl p-10 border-2 border-gray-light hover:shadow-xl transition-all duration-300">
            <p className="text-gray-medium font-outfit text-xs font-semibold uppercase tracking-widest mb-6">
              Ticket Médio
            </p>
            <p className="text-navy-ultra-dark font-outfit text-8xl font-black mb-4">
              {formatarValor(metricas.ticketMedio)}
            </p>
            <div className="h-2 bg-gray-light rounded-full mb-4">
              <div className="h-full bg-cyan-modern rounded-full" style={{ width: `${Math.min((metricas.ticketMedio / 12000) * 100, 100)}%` }}></div>
            </div>
            <p className="text-gray-medium font-outfit text-base">
              Meta: R$ 12.000
            </p>
          </div>

          {/* Card 3: Contratos */}
          <div className="bg-blue-vibrant rounded-2xl p-10 border-2 border-blue-vibrant hover:shadow-xl transition-all duration-300">
            <p className="text-white/70 font-outfit text-xs font-semibold uppercase tracking-widest mb-6">
              Contratos
            </p>
            <p className="text-white font-outfit text-8xl font-black mb-4">
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
          <div className="bg-white rounded-2xl p-10 border-2 border-blue-vibrant hover:shadow-xl transition-all duration-300">
            <p className="text-gray-medium font-outfit text-xs font-semibold uppercase tracking-widest mb-6">
              Leads Total
            </p>
            <p className="text-navy-ultra-dark font-outfit text-8xl font-black mb-4">
              {metricas.funil.leads}
            </p>
            <div className="h-2 bg-gray-light rounded-full mb-4">
              <div 
                className="h-full bg-blue-vibrant rounded-full" 
                style={{ width: `${metricas.funil.leads > 0 ? Math.min((metricas.funil.mqls / metricas.funil.leads) * 100, 100) : 0}%` }}
              ></div>
            </div>
            <p className="text-gray-medium font-outfit text-base">
              {metricas.funil.mqls} MQLs ({metricas.funil.leads > 0 ? ((metricas.funil.mqls / metricas.funil.leads) * 100).toFixed(1) : '0'}%)
            </p>
          </div>

          {/* Card 5: Taxa de Show */}
          <div className="bg-white rounded-2xl p-10 border-2 border-gray-light hover:shadow-xl transition-all duration-300">
            <p className="text-gray-medium font-outfit text-xs font-semibold uppercase tracking-widest mb-6">
              Taxa de Show
            </p>
            <p className="text-navy-ultra-dark font-outfit text-8xl font-black mb-4">
              {metricas.taxaShow.toFixed(1)}%
            </p>
            <div className="h-2 bg-gray-light rounded-full mb-4">
              <div className="h-full bg-cyan-modern rounded-full" style={{ width: `${Math.min(metricas.taxaShow, 100)}%` }}></div>
            </div>
            <p className="text-gray-medium font-outfit text-base">
              {metricas.callsRealizadas} realizadas / {metricas.callsAgendadas} agendadas
            </p>
          </div>

          {/* Card 6: Taxa Conversão */}
          <div className="bg-cyan-modern rounded-2xl p-10 border-2 border-cyan-modern hover:shadow-xl transition-all duration-300">
            <p className="text-navy-ultra-dark/70 font-outfit text-xs font-semibold uppercase tracking-widest mb-6">
              Taxa Conversão
            </p>
            <p className="text-navy-ultra-dark font-outfit text-8xl font-black mb-4">
              {metricas.taxaConversao.toFixed(1)}%
            </p>
            <div className="h-2 bg-navy-ultra-dark/10 rounded-full mb-4">
              <div className="h-full bg-navy-ultra-dark rounded-full" style={{ width: `${Math.min(metricas.taxaConversao, 100)}%` }}></div>
            </div>
            <p className="text-navy-ultra-dark/80 font-outfit text-base">
              {metricas.totalContratos} fechados / {metricas.callsQualificadas} qualificados
            </p>
          </div>

        </div>
      </section>

      {/* SEÇÃO 3: FUNIL DE CONVERSÃO */}
      <section className="bg-navy-ultra-dark py-20 px-12">
        <h2 className="text-white font-outfit text-5xl font-bold mb-16 text-center tracking-tight">
          Funil de Conversão
        </h2>
        
        <div className="max-w-[900px] mx-auto space-y-6">
          
          {/* Leads (100%) */}
          <div className="relative">
            <div className="bg-blue-vibrant rounded-2xl p-8">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/70 font-outfit text-sm font-semibold uppercase tracking-widest mb-2">Leads</p>
                  <p className="text-white font-outfit text-7xl font-black">{formatarValor(metricas.funil.leads)}</p>
                </div>
                <p className="text-white/60 font-outfit text-lg">100% do total</p>
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <div className="text-center">
                <p className="text-gray-muted font-outfit text-sm">
                  {metricas.funil.leads > 0 ? ((metricas.funil.mqls / metricas.funil.leads) * 100).toFixed(1) : '0'}% qualificação ↓
                </p>
              </div>
            </div>
          </div>

          {/* MQLs (90%) */}
          <div className="relative mx-auto" style={{ width: '90%' }}>
            <div className="bg-blue-vibrant/90 rounded-2xl p-8">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/70 font-outfit text-sm font-semibold uppercase tracking-widest mb-2">MQLs</p>
                  <p className="text-white font-outfit text-7xl font-black">{formatarValor(metricas.funil.mqls)}</p>
                </div>
                <p className="text-white/60 font-outfit text-lg">
                  {metricas.funil.leads > 0 ? ((metricas.funil.mqls / metricas.funil.leads) * 100).toFixed(1) : '0'}% do total
                </p>
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <div className="text-center">
                <p className="text-gray-muted font-outfit text-sm">
                  {metricas.funil.mqls > 0 ? ((metricas.funil.callsAgendadas / metricas.funil.mqls) * 100).toFixed(1) : '0'}% agendamento ↓
                </p>
              </div>
            </div>
          </div>

          {/* Calls Agendadas (80%) */}
          <div className="relative mx-auto" style={{ width: '80%' }}>
            <div className="bg-blue-vibrant/70 rounded-2xl p-8">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/70 font-outfit text-sm font-semibold uppercase tracking-widest mb-2">Calls Agendadas</p>
                  <p className="text-white font-outfit text-7xl font-black">{formatarValor(metricas.funil.callsAgendadas)}</p>
                </div>
                <p className="text-white/60 font-outfit text-lg">
                  {metricas.funil.leads > 0 ? ((metricas.funil.callsAgendadas / metricas.funil.leads) * 100).toFixed(1) : '0'}% do total
                </p>
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <div className="text-center">
                <p className="text-gray-muted font-outfit text-sm">
                  {metricas.funil.callsAgendadas > 0 ? ((metricas.funil.callsRealizadas / metricas.funil.callsAgendadas) * 100).toFixed(1) : '0'}% comparecimento ↓
                </p>
              </div>
            </div>
          </div>

          {/* Calls Realizadas (70%) */}
          <div className="relative mx-auto" style={{ width: '70%' }}>
            <div className="bg-cyan-modern/80 rounded-2xl p-8">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-navy-ultra-dark/70 font-outfit text-sm font-semibold uppercase tracking-widest mb-2">Calls Realizadas</p>
                  <p className="text-navy-ultra-dark font-outfit text-7xl font-black">{formatarValor(metricas.funil.callsRealizadas)}</p>
                </div>
                <p className="text-navy-ultra-dark/60 font-outfit text-lg">
                  {metricas.funil.leads > 0 ? ((metricas.funil.callsRealizadas / metricas.funil.leads) * 100).toFixed(1) : '0'}% do total
                </p>
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <div className="text-center">
                <p className="text-gray-muted font-outfit text-sm">
                  {metricas.funil.callsRealizadas > 0 ? ((metricas.funil.contratos / metricas.funil.callsRealizadas) * 100).toFixed(1) : '0'}% conversão ↓
                </p>
              </div>
            </div>
          </div>

          {/* Contratos (60%) */}
          <div className="relative mx-auto" style={{ width: '60%' }}>
            <div className="bg-cyan-modern rounded-2xl p-8 border-2 border-cyan-modern">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-navy-ultra-dark/70 font-outfit text-sm font-semibold uppercase tracking-widest mb-2">Contratos Fechados</p>
                  <p className="text-navy-ultra-dark font-outfit text-7xl font-black">{metricas.funil.contratos}</p>
                </div>
                <p className="text-navy-ultra-dark/60 font-outfit text-lg">
                  {metricas.funil.leads > 0 ? ((metricas.funil.contratos / metricas.funil.leads) * 100).toFixed(1) : '0'}% do total
                </p>
              </div>
              <div className="pt-6 border-t-2 border-navy-ultra-dark/10">
                <p className="text-navy-ultra-dark font-outfit text-3xl font-black mb-1">
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

    </div>
  );
};

export default Index;
