import { useEffect, useState } from "react";
import { RefreshCw, DollarSign, FileCheck, CheckCircle, Clock, CreditCard, AlertTriangle } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";
import { useGoogleSheets } from "@/hooks/useGoogleSheets";
import { calcularMetricasFinanceiras, formatarReal } from "@/utils/financialMetricsCalculator";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import TVModeToggle from "@/components/TVModeToggle";
import FinancialFunnel from "@/components/financial/FinancialFunnel";
import ContractsTable from "@/components/financial/ContractsTable";
import { useTVMode } from "@/hooks/useTVMode";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ReferenceLine } from 'recharts';

const Financeiro = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { data, loading, error, lastUpdate, refetch, isRefetching } = useGoogleSheets();
  const { isTVMode, setIsTVMode } = useTVMode();

  // Calcular métricas
  const metricas = data.length > 0 ? calcularMetricasFinanceiras(data) : null;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fullscreen no modo TV
  useEffect(() => {
    if (isTVMode) {
      document.documentElement.requestFullscreen?.();
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
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

  const getProgressColor = (value: number, meta: number) => {
    const percentage = (value / meta) * 100;
    if (percentage >= 100) return 'bg-[#00E5CC]';
    if (percentage >= 80) return 'bg-[#FFB800]';
    return 'bg-[#FF4757]';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0066FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-outfit">Carregando Análise Financeira...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl font-outfit mb-4">Erro ao carregar dados: {error}</p>
          <Button onClick={refetch} className="bg-[#0066FF] hover:bg-[#0052CC]">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!metricas) return null;

  return (
    <div className="min-h-screen bg-[#0B1120] font-outfit">
      {/* HEADER */}
      <header className={`bg-[#0B1120] border-b border-white/5 ${isTVMode ? '' : 'sticky top-0'} z-50`}>
        <div className={`max-w-[1920px] mx-auto ${isTVMode ? 'px-16 py-12' : 'px-12 py-8'} flex justify-between items-center`}>
          
          {/* ESQUERDA: Logo (oculta no TV mode) */}
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
              Financeiro
            </h1>
            {!isTVMode && (
              <p className="text-[#94A3B8] font-outfit text-lg mt-2">
                Análise detalhada da saúde financeira
              </p>
            )}
          </div>

          {/* DIREITA: Botões + Data/Hora */}
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

      {/* SEÇÃO 1: OVERVIEW FINANCEIRO */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-12' : 'py-20 px-12'}`}>
        <h2 className={`text-white font-black mb-8 ${isTVMode ? 'text-4xl' : 'text-5xl'}`}>
          Resumo Financeiro
        </h2>
        
        <div className={`grid grid-cols-3 ${isTVMode ? 'gap-4' : 'gap-8'}`}>
          {/* Card 1: Receita Total */}
          <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-6' : 'p-12'}`}>
            <div className={`flex items-start justify-between ${isTVMode ? 'mb-4' : 'mb-8'}`}>
              <div className={`bg-[#0066FF]/20 rounded-2xl ${isTVMode ? 'p-4' : 'p-6'}`}>
                <DollarSign className={`text-[#0066FF] ${isTVMode ? 'w-7 h-7' : 'w-10 h-10'}`} />
              </div>
            </div>
            <h3 className={`text-[#94A3B8] uppercase tracking-wider font-semibold ${isTVMode ? 'text-xs mb-2' : 'text-sm mb-4'}`}>
              RECEITA TOTAL
            </h3>
            <p className={`text-white font-black ${isTVMode ? 'text-4xl mb-2' : 'text-6xl mb-4'}`}>
              {formatarReal(metricas.receitas.total)}
            </p>
            <p className={`text-[#94A3B8] ${isTVMode ? 'text-sm' : 'text-base'}`}>
              {metricas.contratos.total} contratos fechados
            </p>
          </div>

          {/* Card 2: Receita Assinada */}
          <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-6' : 'p-12'}`}>
            <div className={`flex items-start justify-between ${isTVMode ? 'mb-4' : 'mb-8'}`}>
              <div className={`bg-[#00E5CC]/20 rounded-2xl ${isTVMode ? 'p-4' : 'p-6'}`}>
                <FileCheck className={`text-[#00E5CC] ${isTVMode ? 'w-7 h-7' : 'w-10 h-10'}`} />
              </div>
            </div>
            <h3 className={`text-[#94A3B8] uppercase tracking-wider font-semibold ${isTVMode ? 'text-xs mb-2' : 'text-sm mb-4'}`}>
              RECEITA ASSINADA
            </h3>
            <p className={`text-white font-black ${isTVMode ? 'text-4xl mb-2' : 'text-6xl mb-4'}`}>
              {formatarReal(metricas.receitas.assinada)}
            </p>
            <p className={`text-[#94A3B8] ${isTVMode ? 'text-sm mb-2' : 'text-base mb-4'}`}>
              {metricas.contratos.assinados} contratos assinados
            </p>
            <Progress value={metricas.receitas.taxaAssinatura} className="h-2" />
            <p className={`text-[#00E5CC] mt-2 font-semibold ${isTVMode ? 'text-sm' : 'text-base'}`}>
              {metricas.receitas.taxaAssinatura.toFixed(1)}% do total
            </p>
          </div>

          {/* Card 3: Receita Paga */}
          <div className={`bg-gradient-to-br from-[#00E5CC]/20 to-[#0066FF]/10 rounded-2xl border-2 border-[#00E5CC] ${isTVMode ? 'p-6' : 'p-12'}`}>
            <div className={`flex items-start justify-between ${isTVMode ? 'mb-4' : 'mb-8'}`}>
              <div className={`bg-[#00E5CC]/30 rounded-2xl ${isTVMode ? 'p-4' : 'p-6'}`}>
                <CheckCircle className={`text-[#00E5CC] ${isTVMode ? 'w-7 h-7' : 'w-10 h-10'}`} />
              </div>
            </div>
            <h3 className={`text-[#94A3B8] uppercase tracking-wider font-semibold ${isTVMode ? 'text-xs mb-2' : 'text-sm mb-4'}`}>
              RECEITA PAGA
            </h3>
            <p className={`text-white font-black ${isTVMode ? 'text-4xl mb-2' : 'text-6xl mb-4'}`}>
              {formatarReal(metricas.receitas.paga)}
            </p>
            <p className={`text-[#94A3B8] ${isTVMode ? 'text-sm mb-2' : 'text-base mb-4'}`}>
              {metricas.contratos.pagos} contratos pagos
            </p>
            <Progress value={metricas.receitas.taxaRecebimentoTotal} className="h-2" />
            <p className={`text-[#00E5CC] mt-2 font-semibold ${isTVMode ? 'text-sm' : 'text-base'}`}>
              {metricas.receitas.taxaRecebimentoTotal.toFixed(1)}% recebido
            </p>
          </div>

          {/* Card 4: Gap de Assinatura */}
          <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-6' : 'p-12'}`}>
            <div className={`flex items-start justify-between ${isTVMode ? 'mb-4' : 'mb-8'}`}>
              <div className={`bg-[#FFB800]/20 rounded-2xl ${isTVMode ? 'p-4' : 'p-6'}`}>
                <Clock className={`text-[#FFB800] ${isTVMode ? 'w-7 h-7' : 'w-10 h-10'}`} />
              </div>
            </div>
            <h3 className={`text-[#94A3B8] uppercase tracking-wider font-semibold ${isTVMode ? 'text-xs mb-2' : 'text-sm mb-4'}`}>
              GAP DE ASSINATURA
            </h3>
            <p className={`text-[#FFB800] font-black ${isTVMode ? 'text-4xl mb-2' : 'text-6xl mb-4'}`}>
              {formatarReal(metricas.receitas.gapAssinatura)}
            </p>
            <p className={`text-[#94A3B8] ${isTVMode ? 'text-sm' : 'text-base'}`}>
              {metricas.contratos.pendenteAssinatura} contratos pendentes
            </p>
          </div>

          {/* Card 5: Gap de Pagamento */}
          <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-6' : 'p-12'}`}>
            <div className={`flex items-start justify-between ${isTVMode ? 'mb-4' : 'mb-8'}`}>
              <div className={`bg-[#FF8800]/20 rounded-2xl ${isTVMode ? 'p-4' : 'p-6'}`}>
                <CreditCard className={`text-[#FF8800] ${isTVMode ? 'w-7 h-7' : 'w-10 h-10'}`} />
              </div>
            </div>
            <h3 className={`text-[#94A3B8] uppercase tracking-wider font-semibold ${isTVMode ? 'text-xs mb-2' : 'text-sm mb-4'}`}>
              GAP DE PAGAMENTO
            </h3>
            <p className={`text-[#FF8800] font-black ${isTVMode ? 'text-4xl mb-2' : 'text-6xl mb-4'}`}>
              {formatarReal(metricas.receitas.gapPagamento)}
            </p>
            <p className={`text-[#94A3B8] ${isTVMode ? 'text-sm' : 'text-base'}`}>
              {metricas.contratos.pendentePagamento} aguardando pagamento
            </p>
          </div>

          {/* Card 6: Gap Financeiro Total */}
          <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-6' : 'p-12'}`}>
            <div className={`flex items-start justify-between ${isTVMode ? 'mb-4' : 'mb-8'}`}>
              <div className={`bg-[#FF4757]/20 rounded-2xl ${isTVMode ? 'p-4' : 'p-6'}`}>
                <AlertTriangle className={`text-[#FF4757] ${isTVMode ? 'w-7 h-7' : 'w-10 h-10'}`} />
              </div>
              {(metricas.receitas.gapFinanceiroTotal / metricas.receitas.total) > 0.3 && (
                <Badge variant="destructive" className={isTVMode ? 'text-xs' : 'text-sm'}>
                  ⚠️ Atenção
                </Badge>
              )}
            </div>
            <h3 className={`text-[#94A3B8] uppercase tracking-wider font-semibold ${isTVMode ? 'text-xs mb-2' : 'text-sm mb-4'}`}>
              GAP FINANCEIRO TOTAL
            </h3>
            <p className={`text-[#FF4757] font-black ${isTVMode ? 'text-4xl mb-2' : 'text-6xl mb-4'}`}>
              {formatarReal(metricas.receitas.gapFinanceiroTotal)}
            </p>
            <p className={`text-[#94A3B8] ${isTVMode ? 'text-sm' : 'text-base'}`}>
              Total ainda não recebido
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: FUNIL FINANCEIRO */}
      <section className={`bg-[#F8FAFC] ${isTVMode ? 'py-8 px-12' : 'py-20 px-12'}`}>
        <h2 className={`text-[#0B1120] font-black mb-8 ${isTVMode ? 'text-4xl' : 'text-5xl'}`}>
          Funil Financeiro
        </h2>
        <FinancialFunnel metricas={metricas} isTVMode={isTVMode} />
      </section>

      {/* SEÇÃO 3: ANÁLISE POR SQUAD */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-12' : 'py-20 px-12'}`}>
        <h2 className={`text-white font-black mb-8 ${isTVMode ? 'text-4xl' : 'text-5xl'}`}>
          Análise por Squad
        </h2>
        
        <div className={`grid grid-cols-2 ${isTVMode ? 'gap-4' : 'gap-8'}`}>
          {/* Hot Dogs */}
          <div className={`bg-[#151E35] rounded-2xl border-l-4 border-[#FF4757] ${isTVMode ? 'p-6' : 'p-12'}`}>
            <h3 className={`text-white font-black mb-6 ${isTVMode ? 'text-2xl' : 'text-3xl'}`}>
              🔴 Hot Dogs
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[#94A3B8] text-sm uppercase tracking-wider mb-2">Receita Total</p>
                <p className={`text-white font-black ${isTVMode ? 'text-2xl' : 'text-3xl'}`}>
                  {formatarReal(metricas.porSquad.hotDogs.receitaTotal)}
                </p>
              </div>
              <div>
                <p className="text-[#94A3B8] text-sm uppercase tracking-wider mb-2">Receita Paga</p>
                <p className={`text-[#00E5CC] font-black ${isTVMode ? 'text-2xl' : 'text-3xl'}`}>
                  {formatarReal(metricas.porSquad.hotDogs.receitaPaga)}
                </p>
              </div>
              <div>
                <p className="text-[#94A3B8] text-sm uppercase tracking-wider mb-2">Gap Financeiro</p>
                <p className={`text-[#FF8800] font-black ${isTVMode ? 'text-2xl' : 'text-3xl'}`}>
                  {formatarReal(metricas.porSquad.hotDogs.gapFinanceiro)}
                </p>
              </div>
              <div>
                <p className="text-[#94A3B8] text-sm uppercase tracking-wider mb-2">Taxa de Recebimento</p>
                <p className={`text-white font-black ${isTVMode ? 'text-2xl' : 'text-3xl'} mb-2`}>
                  {metricas.porSquad.hotDogs.taxaRecebimento.toFixed(1)}%
                </p>
                <Progress value={metricas.porSquad.hotDogs.taxaRecebimento} className="h-2" />
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-[#94A3B8] text-sm">
                {metricas.porSquad.hotDogs.contratosPagos} de {metricas.porSquad.hotDogs.contratosTotal} contratos pagos
              </p>
            </div>
          </div>

          {/* Corvo Azul */}
          <div className={`bg-[#151E35] rounded-2xl border-l-4 border-[#0066FF] ${isTVMode ? 'p-6' : 'p-12'}`}>
            <h3 className={`text-white font-black mb-6 ${isTVMode ? 'text-2xl' : 'text-3xl'}`}>
              🔵 Corvo Azul
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[#94A3B8] text-sm uppercase tracking-wider mb-2">Receita Total</p>
                <p className={`text-white font-black ${isTVMode ? 'text-2xl' : 'text-3xl'}`}>
                  {formatarReal(metricas.porSquad.corvoAzul.receitaTotal)}
                </p>
              </div>
              <div>
                <p className="text-[#94A3B8] text-sm uppercase tracking-wider mb-2">Receita Paga</p>
                <p className={`text-[#00E5CC] font-black ${isTVMode ? 'text-2xl' : 'text-3xl'}`}>
                  {formatarReal(metricas.porSquad.corvoAzul.receitaPaga)}
                </p>
              </div>
              <div>
                <p className="text-[#94A3B8] text-sm uppercase tracking-wider mb-2">Gap Financeiro</p>
                <p className={`text-[#FF8800] font-black ${isTVMode ? 'text-2xl' : 'text-3xl'}`}>
                  {formatarReal(metricas.porSquad.corvoAzul.gapFinanceiro)}
                </p>
              </div>
              <div>
                <p className="text-[#94A3B8] text-sm uppercase tracking-wider mb-2">Taxa de Recebimento</p>
                <p className={`text-white font-black ${isTVMode ? 'text-2xl' : 'text-3xl'} mb-2`}>
                  {metricas.porSquad.corvoAzul.taxaRecebimento.toFixed(1)}%
                </p>
                <Progress value={metricas.porSquad.corvoAzul.taxaRecebimento} className="h-2" />
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-[#94A3B8] text-sm">
                {metricas.porSquad.corvoAzul.contratosPagos} de {metricas.porSquad.corvoAzul.contratosTotal} contratos pagos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 4: TOP COLABORADORES */}
      <section className={`bg-[#F8FAFC] ${isTVMode ? 'py-8 px-12' : 'py-20 px-12'}`}>
        <h2 className={`text-[#0B1120] font-black mb-8 ${isTVMode ? 'text-4xl' : 'text-5xl'}`}>
          Análise por Colaborador
        </h2>
        
        <div className={`grid grid-cols-2 ${isTVMode ? 'gap-4' : 'gap-8'}`}>
          {/* Tabela SDRs */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className={`text-[#0B1120] font-black mb-6 ${isTVMode ? 'text-xl' : 'text-2xl'}`}>
              Top SDRs por Receita Paga
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#0B1120]/10">
                    <th className="text-left py-3 px-2 text-[#64748B] text-xs uppercase tracking-wider font-semibold">SDR</th>
                    <th className="text-right py-3 px-2 text-[#64748B] text-xs uppercase tracking-wider font-semibold">Total</th>
                    <th className="text-right py-3 px-2 text-[#64748B] text-xs uppercase tracking-wider font-semibold">Pago</th>
                    <th className="text-right py-3 px-2 text-[#64748B] text-xs uppercase tracking-wider font-semibold">Taxa</th>
                  </tr>
                </thead>
                <tbody>
                  {metricas.porSDR.map((sdr, index) => (
                    <tr key={sdr.nome} className="border-b border-[#0B1120]/5 hover:bg-[#F8FAFC]">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          {index < 3 && <span className="text-lg">{['🥇', '🥈', '🥉'][index]}</span>}
                          <span>{sdr.squadEmoji}</span>
                          <span className={`font-semibold ${isTVMode ? 'text-sm' : 'text-base'}`}>{sdr.nome}</span>
                        </div>
                      </td>
                      <td className={`py-3 px-2 text-right font-semibold ${isTVMode ? 'text-sm' : 'text-base'}`}>
                        {formatarReal(sdr.receitaOriginada)}
                      </td>
                      <td className={`py-3 px-2 text-right font-bold text-[#00E5CC] ${isTVMode ? 'text-sm' : 'text-base'}`}>
                        {formatarReal(sdr.receitaPaga)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`font-semibold ${isTVMode ? 'text-sm' : 'text-base'}`}>
                            {sdr.taxaRecebimento.toFixed(1)}%
                          </span>
                          <Progress value={sdr.taxaRecebimento} className="h-2 w-16" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabela Closers */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className={`text-[#0B1120] font-black mb-6 ${isTVMode ? 'text-xl' : 'text-2xl'}`}>
              Top Closers por Receita Paga
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#0B1120]/10">
                    <th className="text-left py-3 px-2 text-[#64748B] text-xs uppercase tracking-wider font-semibold">Closer</th>
                    <th className="text-right py-3 px-2 text-[#64748B] text-xs uppercase tracking-wider font-semibold">Total</th>
                    <th className="text-right py-3 px-2 text-[#64748B] text-xs uppercase tracking-wider font-semibold">Pago</th>
                    <th className="text-right py-3 px-2 text-[#64748B] text-xs uppercase tracking-wider font-semibold">Taxa</th>
                  </tr>
                </thead>
                <tbody>
                  {metricas.porCloser.map((closer, index) => (
                    <tr key={closer.nome} className="border-b border-[#0B1120]/5 hover:bg-[#F8FAFC]">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          {index < 3 && <span className="text-lg">{['🥇', '🥈', '🥉'][index]}</span>}
                          <span>{closer.squadEmoji}</span>
                          <span className={`font-semibold ${isTVMode ? 'text-sm' : 'text-base'}`}>{closer.nome}</span>
                        </div>
                      </td>
                      <td className={`py-3 px-2 text-right font-semibold ${isTVMode ? 'text-sm' : 'text-base'}`}>
                        {formatarReal(closer.receitaOriginada)}
                      </td>
                      <td className={`py-3 px-2 text-right font-bold text-[#00E5CC] ${isTVMode ? 'text-sm' : 'text-base'}`}>
                        {formatarReal(closer.receitaPaga)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`font-semibold ${isTVMode ? 'text-sm' : 'text-base'}`}>
                            {closer.taxaRecebimento.toFixed(1)}%
                          </span>
                          <Progress value={closer.taxaRecebimento} className="h-2 w-16" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 5: TABELA DE CONTRATOS */}
      <section className={`bg-[#0B1120] ${isTVMode ? 'py-8 px-12' : 'py-20 px-12'}`}>
        <h2 className={`text-white font-black mb-8 ${isTVMode ? 'text-4xl' : 'text-5xl'}`}>
          Contratos Detalhados
        </h2>
        <ContractsTable contratos={metricas.listaContratos} isTVMode={isTVMode} />
      </section>

      {/* SEÇÃO 6: GRÁFICOS */}
      {!isTVMode && (
        <section className="bg-[#F8FAFC] py-20 px-12">
          <h2 className="text-[#0B1120] font-black text-5xl mb-16">
            Análise Gráfica
          </h2>
          
          <div className="grid grid-cols-3 gap-8">
            {/* Gráfico 1: Pizza de Status */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-[#0B1120] font-black text-xl mb-6">Distribuição de Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completos', value: metricas.distribuicaoStatus.completos, color: '#00E5CC' },
                      { name: 'Parciais', value: metricas.distribuicaoStatus.parciais, color: '#FFB800' },
                      { name: 'Pendentes', value: metricas.distribuicaoStatus.pendentes, color: '#FF4757' }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.value}`}
                  >
                    {[
                      { color: '#00E5CC' },
                      { color: '#FFB800' },
                      { color: '#FF4757' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico 2: Barras Empilhadas por Squad */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-[#0B1120] font-black text-xl mb-6">Receita por Squad</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      squad: 'Hot Dogs',
                      pago: metricas.porSquad.hotDogs.receitaPaga,
                      assinadoNaoPago: metricas.porSquad.hotDogs.receitaAssinada - metricas.porSquad.hotDogs.receitaPaga,
                      naoAssinado: metricas.porSquad.hotDogs.receitaTotal - metricas.porSquad.hotDogs.receitaAssinada
                    },
                    {
                      squad: 'Corvo Azul',
                      pago: metricas.porSquad.corvoAzul.receitaPaga,
                      assinadoNaoPago: metricas.porSquad.corvoAzul.receitaAssinada - metricas.porSquad.corvoAzul.receitaPaga,
                      naoAssinado: metricas.porSquad.corvoAzul.receitaTotal - metricas.porSquad.corvoAzul.receitaAssinada
                    }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="squad" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatarReal(value as number)} />
                  <Legend />
                  <Bar dataKey="pago" stackId="a" fill="#00E5CC" name="Pago" />
                  <Bar dataKey="assinadoNaoPago" stackId="a" fill="#FFB800" name="Assinado não pago" />
                  <Bar dataKey="naoAssinado" stackId="a" fill="#FF4757" name="Não assinado" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico 3: Linha de Previsão */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-[#0B1120] font-black text-xl mb-6">Previsão de Recebimento</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={[
                    { dia: 'Hoje', acumulado: metricas.receitas.paga },
                    { dia: '30d', acumulado: metricas.receitas.paga + (metricas.receitas.assinada - metricas.receitas.paga) * 0.3 },
                    { dia: '60d', acumulado: metricas.receitas.paga + (metricas.receitas.assinada - metricas.receitas.paga) * 0.7 },
                    { dia: '90d', acumulado: metricas.receitas.assinada }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatarReal(value as number)} />
                  <ReferenceLine y={650000} stroke="#0066FF" strokeDasharray="3 3" label="Meta R$ 650k" />
                  <Line type="monotone" dataKey="acumulado" stroke="#00E5CC" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {!isTVMode && <Footer />}
    </div>
  );
};

export default Financeiro;
