import { Trophy } from 'lucide-react';
import { CloserMetrics } from '@/utils/closerMetricsCalculator';
import { formatarReal } from '@/utils/metricsCalculator';

interface CloserPodiumProps {
  top3: CloserMetrics[];
}

const CloserPodium = ({ top3 }: CloserPodiumProps) => {
  if (top3.length < 3) return null;

  const [primeiro, segundo, terceiro] = [top3[0], top3[1], top3[2]];

  const positions = [
    {
      closer: segundo,
      posicao: 2,
      height: 'h-64',
      marginTop: 'mt-16',
      bgColor: 'bg-[#94A3B8]',
      badgeColor: 'bg-[#C0C0C0]',
      badgeText: '2º',
      order: 1
    },
    {
      closer: primeiro,
      posicao: 1,
      height: 'h-80',
      marginTop: 'mt-0',
      bgColor: 'bg-[#FFB800]',
      badgeColor: 'bg-[#FFD700]',
      badgeText: '1º',
      order: 2,
      isFirst: true
    },
    {
      closer: terceiro,
      posicao: 3,
      height: 'h-56',
      marginTop: 'mt-24',
      bgColor: 'bg-[#CD7F32]',
      badgeColor: 'bg-[#CD853F]',
      badgeText: '3º',
      order: 3
    }
  ];

  return (
    <div className="flex items-start justify-center gap-8">
      {positions.map(({ closer, posicao, height, marginTop, bgColor, badgeColor, badgeText, isFirst }) => (
        <div key={posicao} className="flex flex-col items-center">
          {/* Avatar */}
          <div 
            className="w-32 h-32 rounded-full flex items-center justify-center text-6xl border-8 border-white shadow-2xl mb-6 relative"
            style={{ backgroundColor: closer.squadColor }}
          >
            {closer.emoji}
            
            {/* Badge de Posição */}
            <div 
              className={`absolute -top-4 ${badgeColor} text-white rounded-full w-12 h-12 flex items-center justify-center font-outfit font-black text-lg shadow-lg`}
            >
              {badgeText}
            </div>
          </div>

          {/* Bloco do Pódio */}
          <div 
            className={`${height} ${marginTop} ${bgColor} rounded-2xl shadow-2xl px-8 py-8 flex flex-col justify-center items-center text-center min-w-[320px] max-w-[320px] overflow-hidden transform hover:scale-105 transition-all duration-300 gap-4`}
          >
            {/* Nome e Squad */}
            <div>
              <h3 className="text-white font-outfit text-2xl font-bold mb-3 break-words line-clamp-2 w-full">
                {closer.nome}
              </h3>
              <div 
                className="inline-block px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ backgroundColor: closer.squadColor + '30', color: closer.squadColor }}
              >
                {closer.squad}
              </div>
            </div>

            {/* Receita Total */}
            <div>
              <p className="text-white/80 text-sm font-outfit uppercase tracking-wider mb-2">
                Receita Total
              </p>
              <p className="text-white font-outfit text-4xl font-black mb-4 break-all leading-tight">
                {formatarReal(closer.receitaTotal)}
              </p>
              
              {/* Contratos */}
              <p className="text-white/90 text-lg font-outfit mb-2 break-words">
                {closer.contratosFechados} contratos fechados
              </p>
              
              {/* Ticket Médio */}
              <p className="text-white/80 text-sm font-outfit break-words">
                Ticket médio: {formatarReal(closer.ticketMedio)}
              </p>
            </div>

            {/* Badge TOP CLOSER no 1º */}
            {isFirst && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                <Trophy className="w-5 h-5 text-white" />
                <span className="text-white font-outfit font-bold text-sm uppercase tracking-wider">
                  Top Closer do Mês
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CloserPodium;
