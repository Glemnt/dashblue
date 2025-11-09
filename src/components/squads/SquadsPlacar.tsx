import { formatarReal } from '@/utils/financialMetricsCalculator';

interface SquadsPlacarProps {
  dados: {
    lider: 'Hot Dogs' | 'Corvo Azul' | 'Empate';
    hotDogsReceita: number;
    corvoAzulReceita: number;
    hotDogsContratos: number;
    corvoAzulContratos: number;
    vantagem: number;
    vantagemPercentual: number;
    paraVirar: number;
    percentualHotDogs: number;
    percentualCorvoAzul: number;
  };
  isTVMode: boolean;
}

export const SquadsPlacar = ({ dados, isTVMode }: SquadsPlacarProps) => {
  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
      {/* TÍTULO */}
      <h2 className={`text-white font-black text-center mb-8 md:mb-12 ${
        isTVMode ? 'text-4xl md:text-5xl lg:text-6xl' : 'text-2xl md:text-4xl lg:text-5xl'
      }`}>
        Guerra de Squads
      </h2>
      
      {/* PLACAR GIGANTE */}
      <div className="bg-gradient-to-r from-[#FF4757]/10 via-[#0B1120] to-[#0066FF]/10 rounded-3xl border-2 border-white/10 p-3 sm:p-4 md:p-8 lg:p-12">
        
        {/* GRID 3 COLUNAS: Esquerda | Centro | Direita */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12 items-start md:items-center">
          
          {/* COLUNA ESQUERDA: HOT DOGS */}
          <div className="text-center order-1 min-w-0 px-2 md:px-4">
            <div className={`mb-4 ${isTVMode ? 'text-5xl md:text-6xl lg:text-7xl' : 'text-4xl md:text-6xl lg:text-7xl'}`}>🔴</div>
            <h3 className={`text-white font-black mb-4 md:mb-6 break-words ${
              isTVMode ? 'text-3xl md:text-5xl lg:text-6xl' : 'text-xl md:text-4xl lg:text-5xl'
            }`}>
              HOT DOGS
            </h3>
            
            <div className="bg-[#FF4757]/20 rounded-xl p-3 sm:p-4 md:p-6 lg:p-8 mb-4 overflow-hidden">
              <p className={`text-white font-black mb-2 break-all overflow-hidden leading-tight ${
                isTVMode ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl' : 'text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl'
              }`}>
                {formatarReal(dados.hotDogsReceita)}
              </p>
              <p className={`text-[#94A3B8] break-words ${
                isTVMode ? 'text-xl md:text-2xl' : 'text-sm md:text-lg lg:text-xl'
              }`}>
                {dados.hotDogsContratos} contratos
              </p>
            </div>
            
            <div className={`text-[#FF4757] font-black ${
              isTVMode ? 'text-3xl md:text-4xl lg:text-5xl' : 'text-xl md:text-3xl lg:text-4xl'
            }`}>
              {dados.percentualHotDogs.toFixed(1)}%
            </div>
          </div>
          
          {/* COLUNA CENTRO: VS + TROFÉU */}
          <div className="text-center order-2 min-w-0 px-2 md:px-4">
            <p className={`text-white font-black mb-6 md:mb-8 ${
              isTVMode ? 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl' : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl'
            }`}>
              VS
            </p>
            
            {/* TROFÉU APONTANDO PARA LÍDER */}
            {dados.lider !== 'Empate' && (
              <div className={`flex items-center justify-center gap-4 mb-6 md:mb-8 ${
                dados.lider === 'Hot Dogs' ? 'flex-row' : 'flex-row-reverse'
              }`}>
                <div className={isTVMode ? 'text-5xl md:text-6xl lg:text-7xl' : 'text-5xl md:text-6xl lg:text-7xl'}>🏆</div>
                <div className={isTVMode ? 'text-4xl md:text-5xl lg:text-6xl' : 'text-4xl md:text-5xl lg:text-6xl'}>
                  {dados.lider === 'Hot Dogs' ? '←' : '→'}
                </div>
              </div>
            )}
            
            {dados.lider === 'Empate' && (
              <div className={`mb-6 md:mb-8 ${isTVMode ? 'text-5xl md:text-6xl lg:text-7xl' : 'text-5xl md:text-6xl lg:text-7xl'}`}>
                ⚔️
              </div>
            )}
            
            {/* VANTAGEM */}
            {dados.lider !== 'Empate' && (
              <div className="bg-[#151E35] rounded-2xl p-4 md:p-6 border-2 border-[#FFB800] overflow-hidden">
                <p className={`text-[#FFB800] font-black mb-2 break-all overflow-hidden leading-tight ${
                  isTVMode ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl' : 'text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl'
                }`}>
                  +{formatarReal(dados.vantagem)}
                </p>
                <p className={`text-[#94A3B8] break-words ${
                  isTVMode ? 'text-base md:text-lg lg:text-xl' : 'text-xs sm:text-sm md:text-base lg:text-lg'
                }`}>
                  de vantagem ({dados.vantagemPercentual.toFixed(1)}%)
                </p>
              </div>
            )}
            
            {dados.lider === 'Empate' && (
              <div className="bg-[#151E35] rounded-2xl p-4 md:p-6 overflow-hidden">
                <p className={`text-white font-black break-words ${
                  isTVMode ? 'text-xl md:text-2xl lg:text-3xl' : 'text-lg md:text-xl lg:text-2xl'
                }`}>
                  EMPATE TÉCNICO!
                </p>
              </div>
            )}
          </div>
          
          {/* COLUNA DIREITA: CORVO AZUL */}
          <div className="text-center order-3 min-w-0 px-2 md:px-4">
            <div className={`mb-4 ${isTVMode ? 'text-5xl md:text-6xl lg:text-7xl' : 'text-4xl md:text-6xl lg:text-7xl'}`}>🔵</div>
            <h3 className={`text-white font-black mb-4 md:mb-6 break-words ${
              isTVMode ? 'text-3xl md:text-5xl lg:text-6xl' : 'text-xl md:text-4xl lg:text-5xl'
            }`}>
              CORVO AZUL
            </h3>
            
            <div className="bg-[#0066FF]/20 rounded-xl p-3 sm:p-4 md:p-6 lg:p-8 mb-4 overflow-hidden">
              <p className={`text-white font-black mb-2 break-all overflow-hidden leading-tight ${
                isTVMode ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl' : 'text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl'
              }`}>
                {formatarReal(dados.corvoAzulReceita)}
              </p>
              <p className={`text-[#94A3B8] break-words ${
                isTVMode ? 'text-xl md:text-2xl' : 'text-sm md:text-lg lg:text-xl'
              }`}>
                {dados.corvoAzulContratos} contratos
              </p>
            </div>
            
            <div className={`text-[#0066FF] font-black ${
              isTVMode ? 'text-3xl md:text-4xl lg:text-5xl' : 'text-xl md:text-3xl lg:text-4xl'
            }`}>
              {dados.percentualCorvoAzul.toFixed(1)}%
            </div>
          </div>
        </div>
        
        {/* BARRA DE COMPARAÇÃO HORIZONTAL */}
        <div className="mt-6 md:mt-8 lg:mt-12">
          <div className="relative h-16 md:h-20 lg:h-24 bg-white/10 rounded-full overflow-hidden">
            {/* Barra Hot Dogs */}
            <div 
              className="absolute left-0 h-full bg-gradient-to-r from-[#FF4757] to-[#FF4757]/80 transition-all duration-1000"
              style={{ width: `${Math.max(0, Math.min(100, dados.percentualHotDogs || 0))}%` }}
            />
            {/* Barra Corvo Azul */}
            <div 
              className="absolute right-0 h-full bg-gradient-to-l from-[#0066FF] to-[#0066FF]/80 transition-all duration-1000"
              style={{ width: `${Math.max(0, Math.min(100, dados.percentualCorvoAzul || 0))}%` }}
            />
            {/* Marcador do meio */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-white/50" />
          </div>
        </div>
        
        {/* INFO ADICIONAL */}
        <div className="mt-4 md:mt-6 lg:mt-8 flex justify-center px-2">
          {dados.lider !== 'Empate' && (
            <div className="bg-[#151E35]/50 rounded-xl p-3 md:p-4 max-w-lg mx-auto">
              <p className={`text-[#94A3B8] text-center ${
                isTVMode ? 'text-lg md:text-xl lg:text-2xl' : 'text-sm md:text-base lg:text-lg'
              }`}>
                <span className="block sm:inline mb-1 sm:mb-0">
                  {dados.lider === 'Hot Dogs' ? '🔵 Corvo Azul' : '🔴 Hot Dogs'} precisa de
                </span>
                {' '}
                <span className={`text-white font-bold block sm:inline ${
                  isTVMode ? 'text-xl md:text-2xl lg:text-3xl' : 'text-base md:text-lg lg:text-xl'
                }`}>
                  +{formatarReal(dados.paraVirar)}
                </span>
                {' '}
                <span className="block sm:inline">para virar o jogo</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
