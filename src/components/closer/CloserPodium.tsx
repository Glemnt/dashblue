import { Trophy } from 'lucide-react';
import { CloserMetrics } from '@/utils/closerMetricsCalculator';
import { formatarReal } from '@/utils/metricsCalculator';
import ColaboradorAvatar from '@/components/ColaboradorAvatar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface CloserPodiumProps {
  top3: CloserMetrics[];
}

const CloserPodium = ({ top3 }: CloserPodiumProps) => {
  if (top3.length < 3) return null;

  const [primeiro, segundo, terceiro] = [top3[0], top3[1], top3[2]];

  const renderPodiumCard = (closer: CloserMetrics, posicao: number) => {
    const isFirst = posicao === 1;
    const configs = {
      1: { height: 'h-[480px]', bgColor: 'bg-[#FFB800]', badgeColor: 'bg-[#FFD700]' },
      2: { height: 'h-[400px]', bgColor: 'bg-[#94A3B8]', badgeColor: 'bg-[#C0C0C0]' },
      3: { height: 'h-[360px]', bgColor: 'bg-[#CD7F32]', badgeColor: 'bg-[#CD853F]' }
    };
    const config = configs[posicao as 1 | 2 | 3];

    return (
      <div className="flex flex-col items-center">
        {/* Avatar */}
        <div className="relative mb-6">
          <ColaboradorAvatar 
            nome={closer.nome}
            emoji={closer.emoji}
            squadColor={closer.squadColor}
            size="xl"
            className="border-8"
          />
          
          {/* Badge de Posição */}
          <div 
            className={`absolute -top-4 ${config.badgeColor} text-white rounded-full w-12 h-12 flex items-center justify-center font-outfit font-black text-lg shadow-lg left-1/2 transform -translate-x-1/2`}
          >
            {posicao}º
          </div>
        </div>

        {/* Bloco do Pódio */}
        <div 
          className={`${config.height} ${config.bgColor} rounded-2xl shadow-2xl px-6 py-6 flex flex-col justify-between items-center text-center min-w-[340px] max-w-[340px] overflow-hidden transform hover:scale-105 transition-all duration-300`}
        >
          {/* Nome e Squad */}
          <div className="w-full overflow-hidden">
            <h3 className="text-white font-outfit text-xl font-bold mb-2 break-words line-clamp-2">
              {closer.nome}
            </h3>
            <div 
              className="inline-block px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
              style={{ backgroundColor: closer.squadColor + '30', color: closer.squadColor }}
            >
              {closer.squad}
            </div>
          </div>

          {/* Receita Total */}
          <div className="w-full overflow-hidden space-y-2">
            <p className="text-white/80 text-sm font-outfit uppercase tracking-wider">
              Receita Total
            </p>
            <p className="text-white font-outfit text-xl sm:text-2xl md:text-3xl font-black break-all leading-tight">
              {formatarReal(closer.receitaTotal)}
            </p>
            
            {/* Contratos */}
            <p className="text-white/90 text-base font-outfit break-words">
              {closer.contratosFechados} contratos fechados
            </p>
            
            {/* Ticket Médio */}
            <p className="text-white/80 text-sm font-outfit break-words">
              Ticket médio: {formatarReal(closer.ticketMedio)}
            </p>
          </div>

          {/* Badge TOP CLOSER no 1º */}
          {isFirst && (
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full max-w-full overflow-hidden">
              <Trophy className="w-4 h-4 text-white flex-shrink-0" />
              <span className="text-white font-outfit font-bold text-xs uppercase tracking-wider truncate">
                Top Closer do Mês
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Desktop: Grid tradicional */}
      <div className="hidden md:flex md:items-start md:justify-center md:gap-8">
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

      {/* Mobile: Carousel */}
      <div className="md:hidden">
        <Carousel className="w-full max-w-sm mx-auto">
          <CarouselContent>
            <CarouselItem>
              {renderPodiumCard(primeiro, 1)}
            </CarouselItem>
            <CarouselItem>
              {renderPodiumCard(segundo, 2)}
            </CarouselItem>
            <CarouselItem>
              {renderPodiumCard(terceiro, 3)}
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>
    </div>
  );
};

export default CloserPodium;
