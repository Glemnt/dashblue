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
    <div className="max-w-[1600px] mx-auto">
      {/* TÍTULO */}
      <h2 className={`text-white font-black text-center mb-12 ${
        isTVMode ? 'text-6xl' : 'text-5xl'
      }`}>
        Guerra de Squads
      </h2>
      
      {/* PLACAR GIGANTE */}
      <div className="bg-gradient-to-r from-[#FF4757]/10 via-[#0B1120] to-[#0066FF]/10 rounded-3xl border-2 border-white/10 p-8 md:p-16">
        
        {/* GRID 3 COLUNAS: Esquerda | Centro | Direita */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center">
          
          {/* COLUNA ESQUERDA: HOT DOGS */}
          <div className="text-center order-1">
            <div className={`mb-4 ${isTVMode ? 'text-8xl' : 'text-6xl md:text-8xl'}`}>🔴</div>
            <h3 className={`text-white font-black mb-6 ${
              isTVMode ? 'text-5xl md:text-6xl' : 'text-4xl md:text-6xl'
            }`}>
              HOT DOGS
            </h3>
            
            <div className="bg-[#FF4757]/20 rounded-2xl p-6 md:p-8 mb-4">
              <p className={`text-white font-black mb-2 ${
                isTVMode ? 'text-6xl md:text-8xl' : 'text-5xl md:text-7xl'
              }`}>
                {formatarReal(dados.hotDogsReceita)}
              </p>
              <p className={`text-[#94A3B8] ${
                isTVMode ? 'text-2xl md:text-3xl' : 'text-xl md:text-3xl'
              }`}>
                {dados.hotDogsContratos} contratos
              </p>
            </div>
            
            <div className={`text-[#FF4757] font-black ${
              isTVMode ? 'text-4xl md:text-5xl' : 'text-3xl md:text-5xl'
            }`}>
              {dados.percentualHotDogs.toFixed(1)}%
            </div>
          </div>
          
          {/* COLUNA CENTRO: VS + TROFÉU */}
          <div className="text-center order-3 md:order-2">
            <p className={`text-white font-black mb-8 ${
              isTVMode ? 'text-7xl md:text-9xl' : 'text-6xl md:text-9xl'
            }`}>
              VS
            </p>
            
            {/* TROFÉU APONTANDO PARA LÍDER */}
            {dados.lider !== 'Empate' && (
              <div className={`flex items-center justify-center gap-4 mb-8 ${
                dados.lider === 'Hot Dogs' ? 'flex-row' : 'flex-row-reverse'
              }`}>
                <div className={isTVMode ? 'text-7xl md:text-8xl' : 'text-6xl md:text-8xl'}>🏆</div>
                <div className={isTVMode ? 'text-5xl md:text-6xl' : 'text-4xl md:text-6xl'}>
                  {dados.lider === 'Hot Dogs' ? '←' : '→'}
                </div>
              </div>
            )}
            
            {dados.lider === 'Empate' && (
              <div className={`mb-8 ${isTVMode ? 'text-7xl md:text-8xl' : 'text-6xl md:text-8xl'}`}>
                ⚔️
              </div>
            )}
            
            {/* VANTAGEM */}
            {dados.lider !== 'Empate' && (
              <div className="bg-[#151E35] rounded-2xl p-4 md:p-6 border-2 border-[#FFB800]">
                <p className={`text-[#FFB800] font-black mb-2 ${
                  isTVMode ? 'text-3xl md:text-4xl' : 'text-2xl md:text-4xl'
                }`}>
                  +{formatarReal(dados.vantagem)}
                </p>
                <p className={`text-[#94A3B8] ${
                  isTVMode ? 'text-lg md:text-xl' : 'text-base md:text-xl'
                }`}>
                  de vantagem ({dados.vantagemPercentual.toFixed(1)}%)
                </p>
              </div>
            )}
            
            {dados.lider === 'Empate' && (
              <div className="bg-[#151E35] rounded-2xl p-4 md:p-6">
                <p className={`text-white font-black ${
                  isTVMode ? 'text-2xl md:text-3xl' : 'text-xl md:text-3xl'
                }`}>
                  EMPATE TÉCNICO!
                </p>
              </div>
            )}
          </div>
          
          {/* COLUNA DIREITA: CORVO AZUL */}
          <div className="text-center order-2 md:order-3">
            <div className={`mb-4 ${isTVMode ? 'text-8xl' : 'text-6xl md:text-8xl'}`}>🔵</div>
            <h3 className={`text-white font-black mb-6 ${
              isTVMode ? 'text-5xl md:text-6xl' : 'text-4xl md:text-6xl'
            }`}>
              CORVO AZUL
            </h3>
            
            <div className="bg-[#0066FF]/20 rounded-2xl p-6 md:p-8 mb-4">
              <p className={`text-white font-black mb-2 ${
                isTVMode ? 'text-6xl md:text-8xl' : 'text-5xl md:text-7xl'
              }`}>
                {formatarReal(dados.corvoAzulReceita)}
              </p>
              <p className={`text-[#94A3B8] ${
                isTVMode ? 'text-2xl md:text-3xl' : 'text-xl md:text-3xl'
              }`}>
                {dados.corvoAzulContratos} contratos
              </p>
            </div>
            
            <div className={`text-[#0066FF] font-black ${
              isTVMode ? 'text-4xl md:text-5xl' : 'text-3xl md:text-5xl'
            }`}>
              {dados.percentualCorvoAzul.toFixed(1)}%
            </div>
          </div>
        </div>
        
        {/* BARRA DE COMPARAÇÃO HORIZONTAL */}
        <div className="mt-8 md:mt-12">
          <div className="relative h-12 md:h-16 bg-white/10 rounded-full overflow-hidden">
            {/* Barra Hot Dogs */}
            <div 
              className="absolute left-0 h-full bg-gradient-to-r from-[#FF4757] to-[#FF4757]/80 transition-all duration-1000"
              style={{ width: `${dados.percentualHotDogs}%` }}
            />
            {/* Barra Corvo Azul */}
            <div 
              className="absolute right-0 h-full bg-gradient-to-l from-[#0066FF] to-[#0066FF]/80 transition-all duration-1000"
              style={{ width: `${dados.percentualCorvoAzul}%` }}
            />
            {/* Marcador do meio */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-white/50" />
          </div>
        </div>
        
        {/* INFO ADICIONAL */}
        <div className="mt-6 md:mt-8 text-center">
          {dados.lider !== 'Empate' && (
            <p className={`text-[#94A3B8] ${
              isTVMode ? 'text-xl md:text-2xl' : 'text-lg md:text-2xl'
            }`}>
              Para virar, {dados.lider === 'Hot Dogs' ? 'Corvo Azul' : 'Hot Dogs'} precisa de{' '}
              <span className="text-white font-bold">
                +{formatarReal(dados.paraVirar)}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
