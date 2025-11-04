import { formatarReal } from '@/utils/financialMetricsCalculator';

interface SquadsMetaIndividualProps {
  hotDogs: {
    receitaTotal: number;
    metaSquad: number;
    progressoMetaIndividual: number;
    faltaParaMeta: number;
  };
  corvoAzul: {
    receitaTotal: number;
    metaSquad: number;
    progressoMetaIndividual: number;
    faltaParaMeta: number;
  };
  isTVMode: boolean;
  monthKey: string;
}

export const SquadsMetaIndividual = ({ 
  hotDogs, 
  corvoAzul, 
  isTVMode,
  monthKey 
}: SquadsMetaIndividualProps) => {
  
  const renderSquadCard = (
    nome: 'Hot Dogs' | 'Corvo Azul',
    emoji: string,
    cor: string,
    dados: {
      receitaTotal: number;
      metaSquad: number;
      progressoMetaIndividual: number;
      faltaParaMeta: number;
    }
  ) => {
    const progressoPercent = Math.min(dados.progressoMetaIndividual, 100);
    const metaBatida = dados.progressoMetaIndividual >= 100;
    
    return (
      <div
        className={`rounded-3xl border-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
          isTVMode ? 'p-8' : 'p-10'
        } ${
          metaBatida
            ? 'border-[#00E5CC] bg-gradient-to-br from-[#00E5CC]/10 to-white'
            : dados.progressoMetaIndividual >= 70
            ? 'border-[#FFB800] bg-white'
            : 'border-[#E2E8F0] bg-white'
        }`}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className={`${isTVMode ? 'text-6xl mb-3' : 'text-7xl mb-4'}`}>
            {emoji}
          </div>
          <h3 className={`font-black ${
            isTVMode ? 'text-3xl' : 'text-4xl'
          }`} style={{ color: cor }}>
            {nome}
          </h3>
        </div>

        {/* Progresso */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-3">
            <span className={`text-[#64748B] font-outfit ${
              isTVMode ? 'text-base' : 'text-lg'
            }`}>
              Progresso da Meta
            </span>
            <span className={`font-outfit font-black ${
              isTVMode ? 'text-3xl' : 'text-4xl'
            } ${
              metaBatida ? 'text-[#00E5CC]' : 
              dados.progressoMetaIndividual >= 70 ? 'text-[#FFB800]' : 
              'text-[#0B1120]'
            }`}>
              {dados.progressoMetaIndividual.toFixed(0)}%
            </span>
          </div>
          
          <div className={`relative ${
            isTVMode ? 'h-6' : 'h-8'
          } bg-[#E2E8F0] rounded-full overflow-hidden mb-4`}>
            <div
              className="absolute h-full rounded-full transition-all duration-1000"
              style={{
                width: `${progressoPercent}%`,
                backgroundColor: metaBatida ? '#00E5CC' : 
                               dados.progressoMetaIndividual >= 70 ? '#FFB800' : cor
              }}
            />
          </div>
        </div>

        {/* Valores */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className={`text-[#64748B] font-outfit ${
              isTVMode ? 'text-base' : 'text-lg'
            }`}>
              Realizado
            </span>
            <span className={`font-outfit font-black ${
              isTVMode ? 'text-xl' : 'text-2xl'
            }`} style={{ color: cor }}>
              {formatarReal(dados.receitaTotal)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className={`text-[#64748B] font-outfit ${
              isTVMode ? 'text-base' : 'text-lg'
            }`}>
              Meta do Squad
            </span>
            <span className={`text-[#64748B] font-outfit font-bold ${
              isTVMode ? 'text-xl' : 'text-2xl'
            }`}>
              {formatarReal(dados.metaSquad)}
            </span>
          </div>

          <div className={`pt-4 border-t-2 border-[#E2E8F0] ${
            metaBatida ? 'bg-[#00E5CC]/10 -mx-4 px-4 py-3 rounded-xl' : ''
          }`}>
            <span className={`font-outfit font-black block text-center ${
              isTVMode ? 'text-xl' : 'text-2xl'
            } ${
              metaBatida ? 'text-[#00E5CC]' : 'text-[#FF4757]'
            }`}>
              {metaBatida 
                ? `🎉 Meta Batida! +${formatarReal(Math.abs(dados.faltaParaMeta))}`
                : `Faltam ${formatarReal(dados.faltaParaMeta)}`
              }
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="text-center mb-10">
        <h2 className={`text-[#0B1120] font-outfit font-bold tracking-tight ${
          isTVMode ? 'text-4xl mb-2' : 'text-5xl mb-3'
        }`}>
          Meta Individual por Squad
        </h2>
        <p className={`text-[#64748B] font-outfit ${
          isTVMode ? 'text-lg' : 'text-xl'
        }`}>
          {monthKey.includes('novembro') ? 'Novembro' : 'Outubro'} 2025 • Modelo {monthKey.includes('novembro') ? 'MRR' : 'TCV'}
        </p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${
        isTVMode ? 'gap-6' : 'gap-8'
      }`}>
        {renderSquadCard('Hot Dogs', '🔴', '#FF4757', hotDogs)}
        {renderSquadCard('Corvo Azul', '🔵', '#0066FF', corvoAzul)}
      </div>
    </div>
  );
};
