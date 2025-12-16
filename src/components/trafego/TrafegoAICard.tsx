import { Brain, ArrowRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTrafegoAIAnalysis } from "@/hooks/useTrafegoAIAnalysis";
import { CampanhaData, TrafegoTotais, CanalMetrics } from "@/utils/trafegoMetricsCalculator";

interface TrafegoAICardProps {
  campanhas: CampanhaData[];
  totais: TrafegoTotais;
  canais: CanalMetrics[];
  isTVMode?: boolean;
}

const TrafegoAICard = ({ campanhas, totais, canais, isTVMode = false }: TrafegoAICardProps) => {
  const { 
    analysis, 
    loading, 
    isAnalyzing 
  } = useTrafegoAIAnalysis(campanhas, totais, canais);

  const urgentCount = analysis?.alertas?.urgentes?.length || 0;
  const attentionCount = analysis?.alertas?.atencao?.length || 0;
  const opportunityCount = analysis?.alertas?.oportunidades?.length || 0;

  return (
    <div className={`bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-2xl border border-purple-500/30 ${isTVMode ? 'p-8' : 'p-4 md:p-6'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Status */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="bg-purple-500/20 rounded-xl p-3">
              <Brain className={`text-purple-400 ${isTVMode ? 'w-10 h-10' : 'w-8 h-8'} ${isAnalyzing ? 'animate-pulse' : ''}`} />
            </div>
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
              loading ? 'bg-yellow-500 animate-pulse' : 
              isAnalyzing ? 'bg-yellow-500 animate-pulse' : 
              'bg-green-500'
            }`} />
          </div>
          <div>
            <h3 className={`text-white font-black ${isTVMode ? 'text-3xl' : 'text-xl md:text-2xl'}`}>
              🤖 Agente de IA - Tráfego Pago
            </h3>
            <p className={`text-purple-300 ${isTVMode ? 'text-lg' : 'text-sm'}`}>
              {loading ? '🔄 Carregando...' : 
               isAnalyzing ? '🔄 Analisando dados...' : 
               '✅ Online • Análise automática'}
            </p>
          </div>
        </div>

        {/* Right: Button */}
        <Link to="/trafego/ia">
          <Button
            className={`bg-purple-500/20 border-2 border-purple-500 text-purple-300 hover:bg-purple-500 hover:text-white transition-all ${
              isTVMode ? 'px-8 py-6 text-xl' : 'px-6 py-3'
            }`}
          >
            Ver Análise Completa
            <ArrowRight className={`ml-2 ${isTVMode ? 'w-6 h-6' : 'w-4 h-4'}`} />
          </Button>
        </Link>
      </div>

      {/* Alert counts */}
      {analysis && (
        <div className={`mt-4 pt-4 border-t border-white/10 grid grid-cols-3 ${isTVMode ? 'gap-6' : 'gap-4'}`}>
          <div className={`flex items-center gap-2 ${isTVMode ? 'text-lg' : 'text-sm'}`}>
            <span className="text-red-400">🔴</span>
            <span className="text-white font-semibold">{urgentCount}</span>
            <span className="text-[#94A3B8]">Urgentes</span>
          </div>
          <div className={`flex items-center gap-2 ${isTVMode ? 'text-lg' : 'text-sm'}`}>
            <span className="text-yellow-400">🟡</span>
            <span className="text-white font-semibold">{attentionCount}</span>
            <span className="text-[#94A3B8]">Atenção</span>
          </div>
          <div className={`flex items-center gap-2 ${isTVMode ? 'text-lg' : 'text-sm'}`}>
            <span className="text-green-400">🟢</span>
            <span className="text-white font-semibold">{opportunityCount}</span>
            <span className="text-[#94A3B8]">Oportunidades</span>
          </div>
        </div>
      )}

      {/* Executive summary preview */}
      {analysis?.executiveSummary && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className={`text-white/80 line-clamp-2 ${isTVMode ? 'text-lg' : 'text-sm'}`}>
            <span className="text-purple-400 font-semibold">Resumo: </span>
            {analysis.executiveSummary}
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !analysis && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-4 bg-white/10 rounded w-1/2" />
          </div>
        </div>
      )}
    </div>
  );
};

export default TrafegoAICard;
