import { CloserMetrics } from '@/utils/closerMetricsCalculator';
import { formatarReal } from '@/utils/metricsCalculator';
import { Progress } from '@/components/ui/progress';
import ColaboradorAvatar from '@/components/ColaboradorAvatar';

interface CloserComparisonMobileCardsProps {
  closers: CloserMetrics[];
  destaque: CloserMetrics | null;
}

const CloserComparisonMobileCards = ({ closers, destaque }: CloserComparisonMobileCardsProps) => {
  const getIndicador = (taxa: number, metaBoa: number, metaRazoavel: number) => {
    if (taxa >= metaBoa) return '🟢';
    if (taxa >= metaRazoavel) return '🟡';
    return '🔴';
  };

  return (
    <div className="space-y-4">
      {closers.map((closer) => {
        const isDestaque = destaque?.nome === closer.nome;
        
        return (
          <div
            key={closer.nome}
            className={`bg-[#151E35] rounded-xl p-4 border ${
              isDestaque ? 'border-[#FFB800] shadow-lg shadow-[#FFB800]/20' : 'border-white/5'
            }`}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
              <ColaboradorAvatar 
                nome={closer.nome}
                emoji={closer.emoji}
                squadColor={closer.squadColor}
                size="sm"
                showBorder={false}
              />
              <div className="flex-1">
                <h3 className="text-white font-outfit font-bold text-lg">{closer.nome}</h3>
                <span 
                  className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold uppercase"
                  style={{ backgroundColor: closer.squadColor + '20', color: closer.squadColor }}
                >
                  {closer.squad}
                </span>
              </div>
              {isDestaque && (
                <span className="text-2xl">🏆</span>
              )}
            </div>

            {/* Métricas em Grid 2 colunas */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-[#94A3B8] text-xs font-semibold uppercase mb-1">Calls</p>
                <p className="text-white font-outfit text-xl font-bold">{closer.callsRealizadas}</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-[#94A3B8] text-xs font-semibold uppercase mb-1">Qualificadas</p>
                <p className="text-white font-outfit text-xl font-bold">{closer.callsQualificadas}</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-[#94A3B8] text-xs font-semibold uppercase mb-1">Contratos</p>
                <p className="text-white font-outfit text-xl font-bold">{closer.contratosFechados}</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-[#94A3B8] text-xs font-semibold uppercase mb-1">Taxa Conv.</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getIndicador(closer.taxaConversao, 25, 15)}</span>
                  <span className="text-white font-outfit text-lg font-bold">{closer.taxaConversao.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-[#94A3B8] text-xs font-semibold uppercase mb-1">Ticket Médio</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getIndicador(closer.ticketMedio, 12000, 8000)}</span>
                  <span className="text-white font-outfit text-lg font-bold">{formatarReal(closer.ticketMedio)}</span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-[#94A3B8] text-xs font-semibold uppercase mb-1">Taxa Assin.</p>
                <span className="text-white font-outfit text-lg font-bold">{closer.taxaAssinatura.toFixed(1)}%</span>
              </div>
            </div>

            {/* Receita - Destaque */}
            <div className="bg-[#0066FF]/10 rounded-lg p-3 border border-[#0066FF]/30">
              <p className="text-[#94A3B8] text-xs font-semibold uppercase mb-1">Receita Total</p>
              <p className="text-white font-outfit text-2xl font-black">
                {formatarReal(closer.receitaTotal)}
              </p>
              <Progress 
                value={Math.min((closer.receitaTotal / 100000) * 100, 100)} 
                className="h-2 mt-2"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CloserComparisonMobileCards;
