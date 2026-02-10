import { formatarReal } from '@/utils/financialMetricsCalculator';

interface SquadsPlacarProps {
  dados: {
    lider: string;
    squads: Array<{
      nome: string;
      emoji: string;
      cor: string;
      receita: number;
      contratos: number;
      percentual: number;
    }>;
    vantagem: number;
    vantagemPercentual: number;
  };
  isTVMode: boolean;
}

export const SquadsPlacar = ({ dados, isTVMode }: SquadsPlacarProps) => {
  const squads = dados.squads;
  const isThreeSquads = squads.length >= 3;
  
  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
      {/* TÍTULO */}
      <h2 className={`text-white font-black text-center mb-8 md:mb-12 ${
        isTVMode ? 'text-4xl md:text-5xl lg:text-6xl' : 'text-2xl md:text-4xl lg:text-5xl'
      }`}>
        Guerra de Squads
      </h2>
      
      {/* PLACAR */}
      <div className={`bg-gradient-to-r ${
        isThreeSquads 
          ? 'from-[#FF4757]/10 via-[#0B1120] to-[#FF6B00]/10'
          : 'from-[#FF4757]/10 via-[#0B1120] to-[#0066FF]/10'
      } rounded-3xl border-2 border-white/10 p-3 sm:p-4 md:p-8 lg:p-12`}>
        
        {/* GRID SQUADS */}
        <div className={`grid grid-cols-1 ${
          isThreeSquads ? 'md:grid-cols-3' : 'md:grid-cols-3'
        } gap-6 md:gap-8 lg:gap-12 items-start md:items-center`}>
          
          {squads.map((squad, idx) => (
            <div key={squad.nome} className={`text-center ${
              !isThreeSquads && idx === 0 ? 'order-1' : 
              !isThreeSquads && idx === 1 ? 'order-3' : 
              `order-${idx + 1}`
            } min-w-0 px-2 md:px-4`}>
              {/* VS separator for 2-squad layout */}
              {!isThreeSquads && idx === 0 && (
                <></>
              )}
              
              <div className={`mb-4 ${isTVMode ? 'text-5xl md:text-6xl lg:text-7xl' : 'text-4xl md:text-6xl lg:text-7xl'}`}>
                {squad.emoji}
              </div>
              <h3 className={`text-white font-black mb-4 md:mb-6 break-words ${
                isTVMode ? 'text-3xl md:text-5xl lg:text-6xl' : 'text-xl md:text-3xl lg:text-4xl'
              }`}>
                {squad.nome.toUpperCase()}
              </h3>
              
              <div className="rounded-xl p-3 sm:p-4 md:p-6 lg:p-8 mb-4 overflow-hidden"
                style={{ backgroundColor: `${squad.cor}20` }}>
                <p className={`text-white font-black mb-2 break-all overflow-hidden leading-tight ${
                  isTVMode ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl' : 'text-base sm:text-lg md:text-2xl lg:text-3xl'
                }`}>
                  {formatarReal(squad.receita)}
                </p>
                <p className={`text-[#94A3B8] break-words ${
                  isTVMode ? 'text-xl md:text-2xl' : 'text-sm md:text-lg lg:text-xl'
                }`}>
                  {squad.contratos} contratos
                </p>
              </div>
              
              <div className={`font-black ${
                isTVMode ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl lg:text-3xl'
              }`} style={{ color: squad.cor }}>
                {squad.percentual.toFixed(1)}%
              </div>
              
              {dados.lider === squad.nome && (
                <div className="mt-3">
                  <span className={`${isTVMode ? 'text-4xl' : 'text-3xl'}`}>🏆</span>
                </div>
              )}
            </div>
          ))}
          
          {/* VS center for 2-squad layout */}
          {!isThreeSquads && (
            <div className="text-center order-2 min-w-0 px-2 md:px-4">
              <p className={`text-white font-black mb-6 md:mb-8 ${
                isTVMode ? 'text-5xl md:text-7xl' : 'text-3xl md:text-5xl lg:text-7xl'
              }`}>
                VS
              </p>
              
              {dados.lider !== 'Empate' && (
                <div className="bg-[#151E35] rounded-2xl p-4 md:p-6 border-2 border-[#FFB800] overflow-hidden">
                  <p className={`text-[#FFB800] font-black mb-2 break-all overflow-hidden leading-tight ${
                    isTVMode ? 'text-xl md:text-3xl' : 'text-lg md:text-2xl'
                  }`}>
                    +{formatarReal(dados.vantagem)}
                  </p>
                  <p className={`text-[#94A3B8] break-words ${
                    isTVMode ? 'text-base md:text-lg' : 'text-xs md:text-base'
                  }`}>
                    de vantagem ({dados.vantagemPercentual.toFixed(1)}%)
                  </p>
                </div>
              )}
              
              {dados.lider === 'Empate' && (
                <div className="bg-[#151E35] rounded-2xl p-4 md:p-6 overflow-hidden">
                  <p className={`text-white font-black break-words ${
                    isTVMode ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'
                  }`}>
                    ⚔️ EMPATE TÉCNICO!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Vantagem for 3-squad layout */}
        {isThreeSquads && dados.lider !== 'Empate' && (
          <div className="mt-6 flex justify-center">
            <div className="bg-[#151E35] rounded-2xl p-4 md:p-6 border-2 border-[#FFB800] overflow-hidden text-center">
              <p className={`text-[#FFB800] font-black mb-1 ${
                isTVMode ? 'text-2xl md:text-3xl' : 'text-lg md:text-2xl'
              }`}>
                🏆 {dados.lider} lidera com +{formatarReal(dados.vantagem)} de vantagem
              </p>
            </div>
          </div>
        )}
        
        {/* BARRA DE COMPARAÇÃO HORIZONTAL */}
        <div className="mt-6 md:mt-8 lg:mt-12">
          <div className="relative h-16 md:h-20 lg:h-24 bg-white/10 rounded-full overflow-hidden flex">
            {squads.map((squad) => (
              <div 
                key={squad.nome}
                className="h-full transition-all duration-1000"
                style={{ 
                  width: `${Math.max(0, Math.min(100, squad.percentual || 0))}%`,
                  backgroundColor: squad.cor
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
