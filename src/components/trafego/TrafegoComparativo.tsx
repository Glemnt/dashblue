import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, AlertCircle } from "lucide-react";
import { useComparativoMensal, ComparativoMetrica } from "@/hooks/useComparativoMensal";

interface TrafegoComparativoProps {
  isTVMode?: boolean;
}

const TrafegoComparativo = ({ isTVMode = false }: TrafegoComparativoProps) => {
  const { mesAtual, mesAnterior, metricas, insight, loading, temComparativo } = useComparativoMensal();

  const TrendIcon = ({ metrica }: { metrica: ComparativoMetrica }) => {
    const { variacao, positivo, invertido } = metrica;
    
    // Para métricas invertidas (CAC), variação negativa é boa
    const isGood = invertido ? variacao < 0 : variacao > 0;
    
    if (Math.abs(variacao) < 1) {
      return <Minus className="w-5 h-5 text-[#94A3B8]" />;
    }
    
    if (isGood) {
      return <ArrowUpRight className={`w-5 h-5 ${positivo ? 'text-[#10B981]' : 'text-[#EF4444]'}`} />;
    }
    return <ArrowDownRight className={`w-5 h-5 ${positivo ? 'text-[#10B981]' : 'text-[#EF4444]'}`} />;
  };

  // Loading state
  if (loading) {
    return (
      <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-10' : 'p-6'}`}>
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-[#0066FF]/20 rounded-xl p-3">
            <TrendingUp className={`text-[#0066FF] ${isTVMode ? 'w-10 h-10' : 'w-8 h-8'}`} />
          </div>
          <div>
            <h3 className={`text-white font-black ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
              📊 Comparação Mensal
            </h3>
            <p className={`text-[#94A3B8] ${isTVMode ? 'text-lg' : 'text-sm'}`}>
              Carregando dados...
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#0066FF] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Sem comparativo disponível
  if (!temComparativo || !mesAnterior) {
    return (
      <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-10' : 'p-6'}`}>
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-[#0066FF]/20 rounded-xl p-3">
            <TrendingUp className={`text-[#0066FF] ${isTVMode ? 'w-10 h-10' : 'w-8 h-8'}`} />
          </div>
          <div>
            <h3 className={`text-white font-black ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
              📊 Comparação Mensal
            </h3>
            <p className={`text-[#94A3B8] ${isTVMode ? 'text-lg' : 'text-sm'}`}>
              Análise de evolução mês a mês
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-12 h-12 text-[#94A3B8] mb-4" />
          <p className="text-[#94A3B8] text-lg">
            Comparativo não disponível para {mesAtual}
          </p>
          <p className="text-[#64748B] text-sm mt-2">
            Selecione Novembro ou Dezembro para ver a comparação com o mês anterior
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-10' : 'p-6'}`}>
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-[#0066FF]/20 rounded-xl p-3">
          <TrendingUp className={`text-[#0066FF] ${isTVMode ? 'w-10 h-10' : 'w-8 h-8'}`} />
        </div>
        <div>
          <h3 className={`text-white font-black ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
            📊 Comparação: {mesAtual} vs {mesAnterior}
          </h3>
          <p className={`text-[#94A3B8] ${isTVMode ? 'text-lg' : 'text-sm'}`}>
            Análise de evolução mês a mês
          </p>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${isTVMode ? 'gap-6' : 'gap-4'}`}>
        {metricas.map((metrica, i) => {
          const variacaoColor = metrica.positivo 
            ? 'text-[#10B981]' 
            : 'text-[#EF4444]';
          
          // Para variação próxima de zero
          const displayColor = Math.abs(metrica.variacao) < 1 
            ? 'text-[#94A3B8]' 
            : variacaoColor;
          
          return (
            <div key={i} className={`bg-[#0B1120] rounded-xl ${isTVMode ? 'p-6' : 'p-4'}`}>
              <p className={`text-[#94A3B8] font-semibold uppercase tracking-wider mb-4 ${isTVMode ? 'text-base' : 'text-xs'}`}>
                {metrica.label}
              </p>
              
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[#64748B] ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                  {mesAnterior}:
                </span>
                <span className={`text-white ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                  {metrica.anterior}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-[#64748B] ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                  {mesAtual}:
                </span>
                <span className={`text-white font-bold ${isTVMode ? 'text-xl' : 'text-base'}`}>
                  {metrica.atual}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                <TrendIcon metrica={metrica} />
                <span className={`font-bold ${displayColor} ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                  {metrica.variacao > 0 ? '↑' : metrica.variacao < 0 ? '↓' : ''} {Math.abs(metrica.variacao).toFixed(1)}%
                </span>
                <span className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-xs'}`}>
                  ({metrica.diferenca})
                </span>
              </div>
            </div>
          );
        })}

        {/* Insight Card */}
        <div className={`bg-gradient-to-br from-[#00E5CC]/20 to-[#0066FF]/10 rounded-xl border border-[#00E5CC]/30 ${isTVMode ? 'p-6' : 'p-4'}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className={`${isTVMode ? 'text-3xl' : 'text-2xl'}`}>💡</span>
            <p className={`text-white font-bold ${isTVMode ? 'text-lg' : 'text-base'}`}>
              INSIGHT
            </p>
          </div>
          <p className={`text-[#94A3B8] ${isTVMode ? 'text-lg' : 'text-sm'}`}>
            {insight}
          </p>
          <p className={`text-[#94A3B8] mt-3 ${isTVMode ? 'text-base' : 'text-sm'}`}>
            🎯 Dados atualizados em tempo real
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrafegoComparativo;