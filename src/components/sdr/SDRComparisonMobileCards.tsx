import { SDRMetrics } from '@/utils/sdrMetricsCalculator';
import { formatarReal } from '@/utils/metricsCalculator';
import { Progress } from '@/components/ui/progress';
import ColaboradorAvatar from '@/components/ColaboradorAvatar';

interface SDRComparisonMobileCardsProps {
  sdrs: SDRMetrics[];
  destaque: SDRMetrics | null;
}

const SDRComparisonMobileCards = ({ sdrs, destaque }: SDRComparisonMobileCardsProps) => {
  const getIndicador = (taxa: number, metaBoa: number, metaRazoavel: number) => {
    if (taxa >= metaBoa) return '🟢';
    if (taxa >= metaRazoavel) return '🟡';
    return '🔴';
  };

  return (
    <div className="space-y-4">
      {sdrs.map((sdr) => {
        const isDestaque = destaque?.nome === sdr.nome;
        
        return (
          <div
            key={sdr.nome}
            className={`bg-[#151E35] rounded-xl p-4 border ${
              isDestaque ? 'border-[#FFB800] shadow-lg shadow-[#FFB800]/20' : 'border-white/5'
            }`}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
              <ColaboradorAvatar 
                nome={sdr.nome}
                emoji={sdr.emoji}
                squadColor={sdr.squadColor}
                size="sm"
                showBorder={false}
              />
              <div className="flex-1">
                <h3 className="text-white font-outfit font-bold text-lg">{sdr.nome}</h3>
                <span 
                  className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold uppercase"
                  style={{ backgroundColor: sdr.squadColor + '20', color: sdr.squadColor }}
                >
                  {sdr.squad}
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
                <p className="text-white font-outfit text-xl font-bold">{sdr.totalCalls}</p>
                <p className="text-[#94A3B8] text-xs mt-1">
                  <span className="text-[#0066FF]">R1: {sdr.callsR1}</span>
                  {' • '}
                  <span className="text-[#00E5CC]">R2: {sdr.callsR2}</span>
                </p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-[#94A3B8] text-xs font-semibold uppercase mb-1">Qualificadas</p>
                <p className="text-white font-outfit text-xl font-bold">{sdr.callsQualificadas}</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-[#94A3B8] text-xs font-semibold uppercase mb-1">Taxa Qualif.</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getIndicador(sdr.taxaQualificacao, 40, 25)}</span>
                  <span className="text-white font-outfit text-lg font-bold">{sdr.taxaQualificacao.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-[#94A3B8] text-xs font-semibold uppercase mb-1">Taxa Show</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getIndicador(sdr.taxaShow, 75, 60)}</span>
                  <span className="text-white font-outfit text-lg font-bold">{sdr.taxaShow.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Receita - Destaque */}
            <div className="bg-[#0066FF]/10 rounded-lg p-3 border border-[#0066FF]/30">
              <p className="text-[#94A3B8] text-xs font-semibold uppercase mb-1">Vendas Originadas</p>
              <p className="text-white font-outfit text-2xl font-black">
                {formatarReal(sdr.vendasOriginadas)}
              </p>
              <Progress 
                value={Math.min((sdr.vendasOriginadas / 50000) * 100, 100)} 
                className="h-2 mt-2"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SDRComparisonMobileCards;
