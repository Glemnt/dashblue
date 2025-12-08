import { useState, useEffect } from "react";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, Clock, Zap, Target, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrafegoAIAnalysis } from "@/hooks/useTrafegoAIAnalysis";
import { CampanhaData, TrafegoTotais, CanalMetrics, formatarMoeda, formatarMoedaCompacta, formatarNumero } from "@/utils/trafegoMetricsCalculator";

interface TrafegoAIInsightsProps {
  campanhas: CampanhaData[];
  totais: TrafegoTotais;
  canais: CanalMetrics[];
  isTVMode?: boolean;
}

const TrafegoAIInsights = ({ campanhas, totais, canais, isTVMode = false }: TrafegoAIInsightsProps) => {
  const { 
    analysis, 
    loading, 
    error, 
    lastUpdate, 
    nextUpdate, 
    refetch, 
    isAnalyzing 
  } = useTrafegoAIAnalysis(campanhas, totais, canais);

  const [timeUntilNext, setTimeUntilNext] = useState<string>('');

  // Atualizar contador de tempo
  useEffect(() => {
    const updateTimer = () => {
      if (!nextUpdate) return;
      
      const diff = nextUpdate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeUntilNext('Atualizando...');
        return;
      }
      
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeUntilNext(`${minutes}min ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextUpdate]);

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Estado de loading
  if (loading && !analysis) {
    return (
      <div className="space-y-8">
        <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-10' : 'p-6'}`}>
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-purple-500/20 rounded-xl p-3 animate-pulse">
              <Brain className={`text-purple-400 ${isTVMode ? 'w-10 h-10' : 'w-8 h-8'}`} />
            </div>
            <div>
              <h3 className={`text-white font-black ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
                🤖 Agente de IA Analisando...
              </h3>
              <p className={`text-[#94A3B8] ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                Processando dados de campanhas e gerando insights
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Brain className="w-16 h-16 text-purple-400 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping" />
              </div>
              <p className="text-[#94A3B8] text-lg animate-pulse">Analisando métricas e tendências...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error && !analysis) {
    return (
      <div className="space-y-8">
        <div className={`bg-[#151E35] rounded-2xl border border-red-500/30 ${isTVMode ? 'p-10' : 'p-6'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-red-500/20 rounded-xl p-3">
              <AlertTriangle className={`text-red-400 ${isTVMode ? 'w-10 h-10' : 'w-8 h-8'}`} />
            </div>
            <div>
              <h3 className={`text-white font-black ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
                Erro na Análise
              </h3>
              <p className="text-red-400">{error}</p>
            </div>
          </div>
          <Button
            onClick={refetch}
            className="bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  const projecoes = analysis?.projecoes;
  const alertas = analysis?.alertas;
  const recomendacoes = analysis?.recomendacoes;

  return (
    <div className="space-y-8">
      {/* Header com Status da IA */}
      <div className={`bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-2xl border border-purple-500/30 ${isTVMode ? 'p-8' : 'p-4 md:p-6'}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-purple-500/20 rounded-xl p-3">
                <Brain className={`text-purple-400 ${isTVMode ? 'w-10 h-10' : 'w-8 h-8'} ${isAnalyzing ? 'animate-pulse' : ''}`} />
              </div>
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isAnalyzing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
            </div>
            <div>
              <h3 className={`text-white font-black ${isTVMode ? 'text-3xl' : 'text-xl md:text-2xl'}`}>
                🤖 Agente de IA - Tráfego Pago
              </h3>
              <p className={`text-purple-300 ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                {isAnalyzing ? '🔄 Analisando dados...' : '✅ Online • Análise automática a cada 30 min'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2">
              <Clock className="w-4 h-4 text-[#94A3B8]" />
              <span className="text-[#94A3B8] text-sm">
                Última: <span className="text-white font-semibold">{formatLastUpdate(lastUpdate)}</span>
              </span>
            </div>
            
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2">
              <Zap className="w-4 h-4 text-[#94A3B8]" />
              <span className="text-[#94A3B8] text-sm">
                Próxima: <span className="text-white font-semibold">{timeUntilNext || '--:--'}</span>
              </span>
            </div>
            
            <Button
              onClick={refetch}
              disabled={isAnalyzing}
              size="sm"
              className="bg-purple-500/20 border border-purple-500 text-purple-300 hover:bg-purple-500 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analisando...' : 'Analisar Agora'}
            </Button>
          </div>
        </div>
        
        {/* Resumo Executivo */}
        {analysis?.executiveSummary && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className={`text-white ${isTVMode ? 'text-xl' : 'text-base'}`}>
              <span className="text-purple-400 font-bold">Resumo: </span>
              {analysis.executiveSummary}
            </p>
          </div>
        )}
      </div>

      {/* Projeções Inteligentes */}
      {projecoes && (
        <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-10' : 'p-6'}`}>
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-[#0066FF]/20 rounded-xl p-3">
              <TrendingUp className={`text-[#0066FF] ${isTVMode ? 'w-10 h-10' : 'w-8 h-8'}`} />
            </div>
            <div>
              <h3 className={`text-white font-black ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
                🔮 Projeções Inteligentes para Fim do Mês
              </h3>
              <p className={`text-[#94A3B8] ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                Calculadas pelo agente de IA com base nos dados atuais
              </p>
            </div>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${isTVMode ? 'gap-6' : 'gap-4'}`}>
            <div className={`bg-[#0B1120] rounded-xl ${isTVMode ? 'p-6' : 'p-4'}`}>
              <p className={`text-[#94A3B8] font-semibold ${isTVMode ? 'text-base' : 'text-sm'} mb-2`}>
                📈 Investimento Projetado
              </p>
              <p className={`text-white font-bold ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
                {formatarMoedaCompacta(projecoes.investimentoProjetado)}
              </p>
              <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-sm'} mt-1`}>
                Atual: {formatarMoedaCompacta(totais.investimento)}
              </p>
            </div>

            <div className={`bg-[#0B1120] rounded-xl ${isTVMode ? 'p-6' : 'p-4'}`}>
              <p className={`text-[#94A3B8] font-semibold ${isTVMode ? 'text-base' : 'text-sm'} mb-2`}>
                📊 Leads Projetados
              </p>
              <p className={`text-white font-bold ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
                {formatarNumero(projecoes.leadsProjetados)}
              </p>
              <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-sm'} mt-1`}>
                Atual: {formatarNumero(totais.leads)}
              </p>
            </div>

            <div className={`bg-[#0B1120] rounded-xl ${isTVMode ? 'p-6' : 'p-4'}`}>
              <p className={`text-[#94A3B8] font-semibold ${isTVMode ? 'text-base' : 'text-sm'} mb-2`}>
                🎯 Fechamentos Projetados
              </p>
              <p className={`text-white font-bold ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
                {projecoes.fechamentosProjetados}
              </p>
              <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-sm'} mt-1`}>
                Atual: {totais.fechamentos}
              </p>
            </div>

            <div className={`bg-[#0B1120] rounded-xl ${isTVMode ? 'p-6' : 'p-4'}`}>
              <p className={`text-[#94A3B8] font-semibold ${isTVMode ? 'text-base' : 'text-sm'} mb-2`}>
                💰 ROAS Projetado
              </p>
              <p className={`text-[#00E5CC] font-bold ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
                {projecoes.roasProjetado.toFixed(2)}x
              </p>
              <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-sm'} mt-1`}>
                Atual: {totais.roas.toFixed(2)}x
              </p>
            </div>

            <div className={`bg-[#0B1120] rounded-xl ${isTVMode ? 'p-6' : 'p-4'}`}>
              <p className={`text-[#94A3B8] font-semibold ${isTVMode ? 'text-base' : 'text-sm'} mb-2`}>
                💵 CAC Projetado
              </p>
              <p className={`text-white font-bold ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
                {formatarMoeda(projecoes.cacProjetado)}
              </p>
              <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-sm'} mt-1`}>
                Atual: {formatarMoeda(totais.cac)}
              </p>
            </div>

            <div className={`bg-gradient-to-br from-[#00E5CC]/20 to-[#0066FF]/10 rounded-xl border border-[#00E5CC]/30 ${isTVMode ? 'p-6' : 'p-4'}`}>
              <div className="flex items-center gap-3 mb-3">
                <Rocket className={`text-[#00E5CC] ${isTVMode ? 'w-8 h-8' : 'w-6 h-6'}`} />
                <p className={`text-white font-bold ${isTVMode ? 'text-lg' : 'text-base'}`}>
                  💡 CONCLUSÃO
                </p>
              </div>
              <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-sm'}`}>
                {projecoes.conclusao}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alertas Priorizados */}
      {alertas && (
        <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-10' : 'p-6'}`}>
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-[#FFB800]/20 rounded-xl p-3">
              <AlertTriangle className={`text-[#FFB800] ${isTVMode ? 'w-10 h-10' : 'w-8 h-8'}`} />
            </div>
            <h3 className={`text-white font-black ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
              ⚠️ Alertas e Ações Identificados pela IA
            </h3>
          </div>

          <div className={`grid grid-cols-1 lg:grid-cols-3 ${isTVMode ? 'gap-6' : 'gap-4'}`}>
            {/* Urgentes */}
            <div className={`bg-[#EF4444]/10 rounded-xl border border-[#EF4444]/30 ${isTVMode ? 'p-6' : 'p-4'}`}>
              <h4 className={`text-[#EF4444] font-bold mb-4 ${isTVMode ? 'text-xl' : 'text-lg'}`}>
                🔴 ATENÇÃO URGENTE ({alertas.urgentes?.length || 0})
              </h4>
              {alertas.urgentes?.length > 0 ? (
                alertas.urgentes.map((alerta, i) => (
                  <div key={i} className={`${i > 0 ? 'mt-4 pt-4 border-t border-[#EF4444]/20' : ''}`}>
                    <p className={`text-white font-semibold ${isTVMode ? 'text-base' : 'text-sm'}`}>
                      {alerta.campanha}
                    </p>
                    <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-sm'} mt-1`}>
                      {alerta.problema}
                    </p>
                    <p className={`text-[#EF4444] ${isTVMode ? 'text-base' : 'text-sm'} mt-1`}>
                      → {alerta.acao}
                    </p>
                    {alerta.impacto && (
                      <p className={`text-[#10B981] ${isTVMode ? 'text-base' : 'text-sm'} mt-1`}>
                        💰 {alerta.impacto}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[#94A3B8] text-sm">Nenhum alerta urgente no momento ✅</p>
              )}
            </div>

            {/* Atenção */}
            <div className={`bg-[#FBBF24]/10 rounded-xl border border-[#FBBF24]/30 ${isTVMode ? 'p-6' : 'p-4'}`}>
              <h4 className={`text-[#FBBF24] font-bold mb-4 ${isTVMode ? 'text-xl' : 'text-lg'}`}>
                🟡 ATENÇÃO ({alertas.atencao?.length || 0})
              </h4>
              {alertas.atencao?.length > 0 ? (
                alertas.atencao.map((alerta, i) => (
                  <div key={i} className={`${i > 0 ? 'mt-4 pt-4 border-t border-[#FBBF24]/20' : ''}`}>
                    <p className={`text-white font-semibold ${isTVMode ? 'text-base' : 'text-sm'}`}>
                      {alerta.campanha}
                    </p>
                    <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-sm'} mt-1`}>
                      {alerta.problema}
                    </p>
                    <p className={`text-[#FBBF24] ${isTVMode ? 'text-base' : 'text-sm'} mt-1`}>
                      → {alerta.acao}
                    </p>
                    {alerta.potencial && (
                      <p className={`text-[#10B981] ${isTVMode ? 'text-base' : 'text-sm'} mt-1`}>
                        📈 {alerta.potencial}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[#94A3B8] text-sm">Nenhum ponto de atenção ✅</p>
              )}
            </div>

            {/* Oportunidades */}
            <div className={`bg-[#10B981]/10 rounded-xl border border-[#10B981]/30 ${isTVMode ? 'p-6' : 'p-4'}`}>
              <h4 className={`text-[#10B981] font-bold mb-4 ${isTVMode ? 'text-xl' : 'text-lg'}`}>
                🟢 OPORTUNIDADES ({alertas.oportunidades?.length || 0})
              </h4>
              {alertas.oportunidades?.length > 0 ? (
                alertas.oportunidades.map((alerta, i) => (
                  <div key={i} className={`${i > 0 ? 'mt-4 pt-4 border-t border-[#10B981]/20' : ''}`}>
                    <p className={`text-white font-semibold ${isTVMode ? 'text-base' : 'text-sm'}`}>
                      {alerta.campanha}
                    </p>
                    <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-sm'} mt-1`}>
                      {alerta.oportunidade}
                    </p>
                    <p className={`text-[#10B981] ${isTVMode ? 'text-base' : 'text-sm'} mt-1`}>
                      → {alerta.acao}
                    </p>
                    {alerta.ganhoEstimado && (
                      <p className={`text-[#00E5CC] ${isTVMode ? 'text-base' : 'text-sm'} mt-1`}>
                        💰 {alerta.ganhoEstimado}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[#94A3B8] text-sm">Analisando oportunidades...</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recomendações Acionáveis */}
      {recomendacoes && recomendacoes.length > 0 && (
        <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-10' : 'p-6'}`}>
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-[#00E5CC]/20 rounded-xl p-3">
              <Lightbulb className={`text-[#00E5CC] ${isTVMode ? 'w-10 h-10' : 'w-8 h-8'}`} />
            </div>
            <h3 className={`text-white font-black ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
              💡 Recomendações da IA ({recomendacoes.length})
            </h3>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 ${isTVMode ? 'gap-6' : 'gap-4'}`}>
            {recomendacoes.slice(0, 4).map((rec, i) => (
              <div 
                key={i} 
                className={`bg-gradient-to-br from-[#0066FF]/10 to-[#00E5CC]/5 rounded-xl border border-[#0066FF]/30 ${isTVMode ? 'p-6' : 'p-4'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    rec.prioridade === 1 ? 'bg-[#EF4444]/20 text-[#EF4444]' :
                    rec.prioridade === 2 ? 'bg-[#FBBF24]/20 text-[#FBBF24]' :
                    'bg-[#10B981]/20 text-[#10B981]'
                  } font-bold text-sm`}>
                    {rec.prioridade}
                  </div>
                  <div className="flex-1">
                    <p className={`text-white font-bold ${isTVMode ? 'text-lg' : 'text-base'}`}>
                      {rec.titulo}
                    </p>
                    <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-sm'} mt-1`}>
                      {rec.descricao}
                    </p>
                    {rec.ganhoEstimado && (
                      <p className={`text-[#00E5CC] font-semibold ${isTVMode ? 'text-base' : 'text-sm'} mt-2`}>
                        💰 {rec.ganhoEstimado}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrafegoAIInsights;
