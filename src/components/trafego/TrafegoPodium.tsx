import { Trophy, Medal } from "lucide-react";
import { CampanhaData, formatarMoeda, formatarMoedaCompacta, calcularScoreCampanha, CORES_CANAIS } from "@/utils/trafegoMetricsCalculator";

interface TrafegoPodiumProps {
  campanhas: CampanhaData[];
  isTVMode?: boolean;
}

const TrafegoPodium = ({ campanhas, isTVMode = false }: TrafegoPodiumProps) => {
  // Sort campaigns by score and get top 3
  const rankedCampanhas = [...campanhas]
    .map(c => ({ ...c, score: calcularScoreCampanha(c) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const [primeiro, segundo, terceiro] = rankedCampanhas;

  const PodiumCard = ({ 
    campanha, 
    position, 
    score 
  }: { 
    campanha: CampanhaData & { score: number }; 
    position: 1 | 2 | 3;
    score: number;
  }) => {
    const positionConfig = {
      1: {
        icon: '🥇',
        label: '1º LUGAR',
        bgGradient: 'from-[#FFD700]/20 to-[#FFA500]/10',
        borderColor: 'border-[#FFD700]',
        size: isTVMode ? 'col-span-2' : 'col-span-1 md:col-span-2'
      },
      2: {
        icon: '🥈',
        label: '2º LUGAR',
        bgGradient: 'from-[#C0C0C0]/20 to-[#A0A0A0]/10',
        borderColor: 'border-[#C0C0C0]',
        size: 'col-span-1'
      },
      3: {
        icon: '🥉',
        label: '3º LUGAR',
        bgGradient: 'from-[#CD7F32]/20 to-[#B87333]/10',
        borderColor: 'border-[#CD7F32]',
        size: 'col-span-1'
      }
    };

    const config = positionConfig[position];

    return (
      <div className={`bg-gradient-to-br ${config.bgGradient} rounded-2xl border-2 ${config.borderColor} ${config.size} ${isTVMode ? 'p-8' : 'p-6'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`${isTVMode ? 'text-5xl' : 'text-4xl'}`}>{config.icon}</span>
            <div>
              <p className={`text-[#94A3B8] font-semibold uppercase tracking-wider ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                {config.label}
              </p>
              <h3 className={`text-white font-black ${isTVMode ? 'text-2xl' : 'text-lg'}`}>
                {campanha.nome}
              </h3>
            </div>
          </div>
          <div 
            className={`rounded-xl px-4 py-2 ${isTVMode ? 'text-lg' : 'text-sm'}`}
            style={{ backgroundColor: CORES_CANAIS[campanha.canal] || '#6B7280' }}
          >
            <span className="text-white font-bold">{campanha.canal}</span>
          </div>
        </div>

        <div className={`grid ${position === 1 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'} gap-4 ${isTVMode ? 'text-lg' : 'text-sm'}`}>
          <div>
            <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-1">💰 Investimento</p>
            <p className="text-white font-bold">{formatarMoedaCompacta(campanha.investimento)}</p>
          </div>
          <div>
            <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-1">🎯 Fechamentos</p>
            <p className="text-white font-bold">{campanha.fechamentos} contratos</p>
          </div>
          <div>
            <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-1">📊 ROAS</p>
            <p className={`font-black ${campanha.roas >= 5 ? 'text-[#10B981]' : campanha.roas >= 3 ? 'text-[#34D399]' : 'text-[#FBBF24]'}`}>
              {campanha.roas.toFixed(1)}x
            </p>
          </div>
          <div>
            <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-1">💵 CAC</p>
            <p className="text-white font-bold">{formatarMoedaCompacta(campanha.cac)}</p>
          </div>
          <div>
            <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-1">💎 ROI</p>
            <p className="text-[#00E5CC] font-bold">{campanha.roi.toFixed(0)}%</p>
          </div>
          {position === 1 && (
            <div>
              <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-1">💰 Receita</p>
              <p className="text-[#FFB800] font-bold">{formatarMoedaCompacta(campanha.valorFechado)}</p>
            </div>
          )}
        </div>

        {/* Score Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-xs'} uppercase tracking-wider`}>
              ⭐ Score
            </p>
            <p className={`font-black ${isTVMode ? 'text-2xl' : 'text-xl'} ${score >= 90 ? 'text-[#10B981]' : score >= 70 ? 'text-[#34D399]' : 'text-[#FBBF24]'}`}>
              {score}/100
            </p>
          </div>
          <div className={`${isTVMode ? 'h-4' : 'h-3'} bg-[#0B1120] rounded-full overflow-hidden`}>
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                score >= 90 ? 'bg-gradient-to-r from-[#10B981] to-[#00E5CC]' :
                score >= 70 ? 'bg-gradient-to-r from-[#34D399] to-[#10B981]' :
                'bg-gradient-to-r from-[#FBBF24] to-[#FFB800]'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-10' : 'p-6'}`}>
      <div className="flex items-center gap-4 mb-8">
        <Trophy className={`text-[#FFD700] ${isTVMode ? 'w-12 h-12' : 'w-10 h-10'}`} />
        <h3 className={`text-white font-black ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
          🏆 TOP 3 CAMPANHAS DO MÊS
        </h3>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${isTVMode ? 'gap-8' : 'gap-6'}`}>
        {primeiro && <PodiumCard campanha={primeiro} position={1} score={primeiro.score} />}
        {segundo && <PodiumCard campanha={segundo} position={2} score={segundo.score} />}
        {terceiro && <PodiumCard campanha={terceiro} position={3} score={terceiro.score} />}
      </div>

      {/* Score Formula Explanation */}
      <div className={`mt-8 p-4 bg-[#0B1120] rounded-xl border border-white/5 ${isTVMode ? 'text-base' : 'text-sm'}`}>
        <p className="text-[#94A3B8]">
          <span className="text-white font-semibold">📊 Como o Score é calculado:</span>{' '}
          ROAS (máx 40pts) + Taxa Qualificação (máx 30pts) + CAC vs Meta (máx 20pts) + Fechamentos (máx 10pts)
        </p>
      </div>
    </div>
  );
};

export default TrafegoPodium;
