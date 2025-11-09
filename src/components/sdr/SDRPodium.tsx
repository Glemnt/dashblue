import { formatarReal } from '@/utils/metricsCalculator';
import { SDRMetrics } from '@/utils/sdrMetricsCalculator';
import ColaboradorAvatar from '@/components/ColaboradorAvatar';

interface SDRPodiumProps {
  top3: SDRMetrics[];
}

const SDRPodium = ({ top3 }: SDRPodiumProps) => {
  const [primeiro, segundo, terceiro] = top3;

  const getPodiumColor = (position: number) => {
    switch (position) {
      case 1: return 'bg-[#FFB800]';
      case 2: return 'bg-[#94A3B8]';
      case 3: return 'bg-[#CD7F32]';
      default: return 'bg-gray-500';
    }
  };

  const getPodiumHeight = (position: number) => {
    switch (position) {
      case 1: return 'h-80';
      case 2: return 'h-64';
      case 3: return 'h-56';
      default: return 'h-48';
    }
  };

  const renderPodiumCard = (sdr: SDRMetrics | undefined, position: number) => {
    if (!sdr) return null;

    return (
      <div className="flex flex-col items-center">
        {/* Avatar */}
        <ColaboradorAvatar 
          nome={sdr.nome}
          emoji={sdr.emoji}
          squadColor={sdr.squadColor}
          size="lg"
          className="mb-4"
        />

        {/* Bloco do Pódio */}
        <div 
          className={`${getPodiumColor(position)} ${getPodiumHeight(position)} rounded-t-2xl w-full flex flex-col items-center justify-start pt-8 px-6 shadow-2xl relative`}
        >
          {/* Badge de posição */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-4 border-current">
            <span className="text-2xl font-black font-outfit">{position}º</span>
          </div>

          {position === 1 && (
            <div className="mb-4 text-3xl">🏆</div>
          )}

          {/* Nome */}
          <h3 className="text-white font-outfit text-2xl font-bold mb-2 text-center">
            {sdr.nome}
          </h3>

          {/* Badge do Squad */}
          <div 
            className="px-4 py-1 rounded-full mb-4 text-xs font-semibold uppercase tracking-wider"
            style={{ backgroundColor: sdr.squadColor + '40', color: sdr.squadColor }}
          >
            {sdr.squad}
          </div>

          {/* Receita */}
            <p className="text-white font-outfit text-2xl sm:text-3xl md:text-4xl font-black mb-2 break-all leading-tight">
              {formatarReal(sdr.vendasOriginadas)}
            </p>

          {/* Calls */}
          <p className="text-white/80 font-outfit text-sm">
            {sdr.totalCalls} calls realizadas
          </p>

          {position === 1 && (
            <div className="mt-4 bg-white/20 px-4 py-2 rounded-lg">
              <span className="text-white text-xs font-bold uppercase tracking-wider">
                🏆 Destaque do Mês
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="grid grid-cols-3 gap-8 items-end">
        {/* 2º Lugar */}
        <div className="transform translate-y-8">
          {renderPodiumCard(segundo, 2)}
        </div>

        {/* 1º Lugar */}
        <div>
          {renderPodiumCard(primeiro, 1)}
        </div>

        {/* 3º Lugar */}
        <div className="transform translate-y-12">
          {renderPodiumCard(terceiro, 3)}
        </div>
      </div>
    </div>
  );
};

export default SDRPodium;
