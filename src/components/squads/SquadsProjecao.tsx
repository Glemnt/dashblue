import { Card } from '@/components/ui/card';
import { formatarReal } from '@/utils/financialMetricsCalculator';
import { CenarioProjecao } from '@/utils/squadsMetricsCalculator';

interface SquadsProjecaoProps {
  projecao: {
    hotDogs: {
      cenarios: {
        pessimista: CenarioProjecao;
        realista: CenarioProjecao;
        otimista: CenarioProjecao;
      };
      range: {
        min: number;
        max: number;
        diferenca: number;
      };
      mediaDiaria: number;
      diasRestantes: number;
      metaSquad: number;
      receitaAtual: number;
    };
    corvoAzul: {
      cenarios: {
        pessimista: CenarioProjecao;
        realista: CenarioProjecao;
        otimista: CenarioProjecao;
      };
      range: {
        min: number;
        max: number;
        diferenca: number;
      };
      mediaDiaria: number;
      diasRestantes: number;
      metaSquad: number;
      receitaAtual: number;
    };
  };
  isTVMode: boolean;
}

// Componente para Card de Cenário
const CenarioCard = ({ 
  tipo, 
  emoji, 
  cenario, 
  corPrimaria, 
  corFundo, 
  corBorda, 
  destaque, 
  isTVMode 
}: { 
  tipo: string; 
  emoji: string; 
  cenario: CenarioProjecao; 
  corPrimaria: string; 
  corFundo: string; 
  corBorda: string; 
  destaque: boolean; 
  isTVMode: boolean;
}) => (
  <div 
    className={`${corFundo} ${destaque ? `${corBorda} border-4 shadow-lg` : `${corBorda} border-2`} rounded-xl ${isTVMode ? 'p-6' : 'p-4'}`}
  >
    <div className="text-center mb-2">
      <span className={isTVMode ? 'text-5xl' : 'text-3xl'}>{emoji}</span>
    </div>
    <p className={`${corPrimaria} font-bold text-center mb-1 ${isTVMode ? 'text-xl' : 'text-xs'}`}>
      {tipo.toUpperCase()}
    </p>
    <p className={`${corPrimaria} font-black text-center mb-2 ${destaque ? (isTVMode ? 'text-4xl' : 'text-xl') : (isTVMode ? 'text-3xl' : 'text-lg')}`}>
      {formatarReal(cenario.projecaoFinal)}
    </p>
    <div className={`${destaque ? 'bg-blue-200' : corFundo.replace('50', '100')} rounded-full px-2 py-1 text-center mb-2`}>
      <span className={`font-bold ${destaque ? 'text-blue-800' : corPrimaria} ${isTVMode ? 'text-base' : 'text-xs'}`}>
        {cenario.probabilidade} {destaque && '⭐'}
      </span>
    </div>
    <p className={`text-center mb-1 ${isTVMode ? 'text-base' : 'text-xs'} ${cenario.vaiAcertarMeta ? 'text-green-600' : 'text-orange-600'}`}>
      {cenario.vaiAcertarMeta ? '✅ Bate meta' : '⚠️ Abaixo da meta'}
    </p>
    <p className={`text-gray-600 text-center ${isTVMode ? 'text-base' : 'text-xs'}`}>
      {cenario.premissa}
    </p>
  </div>
);

export const SquadsProjecao = ({ projecao, isTVMode }: SquadsProjecaoProps) => {
  const { hotDogs, corvoAzul } = projecao;
  
  // Calcular valores para análise comparativa
  const maxValue = Math.max(hotDogs.range.max, corvoAzul.range.max, hotDogs.metaSquad);
  
  // Insights dinâmicos
  const diferencaOtimista = Math.abs(hotDogs.cenarios.otimista.projecaoFinal - corvoAzul.cenarios.otimista.projecaoFinal);
  const vencedorOtimista = hotDogs.cenarios.otimista.projecaoFinal > corvoAzul.cenarios.otimista.projecaoFinal ? 'Hot Dogs' : 'Corvo Azul';
  
  const ambosBatemPessimista = hotDogs.cenarios.pessimista.vaiAcertarMeta && corvoAzul.cenarios.pessimista.vaiAcertarMeta;
  
  const vencedorRealista = hotDogs.cenarios.realista.projecaoFinal > corvoAzul.cenarios.realista.projecaoFinal ? 'Hot Dogs' : 'Corvo Azul';
  const diferencaRealista = Math.abs(hotDogs.cenarios.realista.projecaoFinal - corvoAzul.cenarios.realista.projecaoFinal);
  
  const ticketMedio = (hotDogs.receitaAtual + corvoAzul.receitaAtual) / 2 / 10; // Estimativa
  
  // Renderizar card de squad com cenários
  const renderSquadCard = (
    nome: string,
    emoji: string,
    cor: string,
    squadData: typeof hotDogs
  ) => {
    const progressoRange = Math.min((squadData.range.max / maxValue) * 100, 100);
    const posicaoMeta = (squadData.metaSquad / maxValue) * 100;
    const posicaoMin = (squadData.range.min / maxValue) * 100;
    const larguraRange = ((squadData.range.diferenca) / maxValue) * 100;
    
    return (
      <Card className={`bg-white ${isTVMode ? 'p-8' : 'p-6'}`}>
        {/* Header com Squad */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className={isTVMode ? 'text-4xl' : 'text-3xl'}>{emoji}</span>
            <h3 className={`font-bold ${isTVMode ? 'text-3xl' : 'text-xl'}`}>{nome}</h3>
          </div>
          <div className="text-right">
            <p className={`text-gray-500 ${isTVMode ? 'text-base' : 'text-xs'}`}>Range de Projeção</p>
            <p className={`font-black ${isTVMode ? 'text-2xl' : 'text-lg'}`}>
              {formatarReal(squadData.range.min)} - {formatarReal(squadData.range.max)}
            </p>
          </div>
        </div>

        {/* Barra de Range Visual */}
        <div className={`relative ${isTVMode ? 'h-16' : 'h-12'} bg-gray-100 rounded-lg mb-6`}>
          {/* Zona abaixo da meta (vermelho claro) */}
          <div 
            className="absolute h-full bg-red-50 rounded-l-lg" 
            style={{ width: `${Math.min(posicaoMeta, 100)}%` }} 
          />
          
          {/* Zona acima da meta (verde claro) */}
          {posicaoMeta < 100 && (
            <div 
              className="absolute h-full bg-green-50 rounded-r-lg right-0" 
              style={{ width: `${100 - posicaoMeta}%` }} 
            />
          )}
          
          {/* Marcador da Meta */}
          <div 
            className="absolute h-full border-l-4 border-yellow-500 z-10" 
            style={{ left: `${posicaoMeta}%` }}
          >
            <span className={`absolute ${isTVMode ? '-top-8 -left-16 text-base' : '-top-6 -left-12 text-xs'} font-bold text-yellow-600 whitespace-nowrap`}>
              Meta {formatarReal(squadData.metaSquad)}
            </span>
          </div>
          
          {/* Range de projeção (barra espessa) */}
          <div 
            className={`absolute top-1/2 -translate-y-1/2 ${isTVMode ? 'h-8' : 'h-6'} rounded-full z-20`}
            style={{ 
              left: `${posicaoMin}%`,
              width: `${larguraRange}%`,
              background: cor
            }} 
          />
        </div>

        {/* Grid de Cenários */}
        <div className={`grid ${isTVMode ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-3'} gap-4`}>
          <CenarioCard
            tipo="Pessimista"
            emoji="😰"
            cenario={squadData.cenarios.pessimista}
            corPrimaria="text-red-600"
            corFundo="bg-red-50"
            corBorda="border-red-200"
            destaque={false}
            isTVMode={isTVMode}
          />
          
          <CenarioCard
            tipo="Realista"
            emoji="😐"
            cenario={squadData.cenarios.realista}
            corPrimaria="text-blue-600"
            corFundo="bg-blue-50"
            corBorda="border-blue-400"
            destaque={true}
            isTVMode={isTVMode}
          />
          
          <CenarioCard
            tipo="Otimista"
            emoji="🤩"
            cenario={squadData.cenarios.otimista}
            corPrimaria="text-green-600"
            corFundo="bg-green-50"
            corBorda="border-green-200"
            destaque={false}
            isTVMode={isTVMode}
          />
        </div>
      </Card>
    );
  };
  
  return (
    <div className="max-w-[1600px] mx-auto">
      <h2 className={`text-[#0B1120] font-black text-center mb-12 ${
        isTVMode ? 'text-6xl' : 'text-4xl'
      }`}>
        📊 Projeções para Fim do Mês
      </h2>
      
      {/* Cards dos Squads */}
      <div className="space-y-8 mb-8">
        {renderSquadCard('Hot Dogs', '🔴', '#FF4757', hotDogs)}
        {renderSquadCard('Corvo Azul', '🔵', '#0066FF', corvoAzul)}
      </div>
      
      {/* Card de Análise Comparativa */}
      <Card className={`bg-gradient-to-br from-[#0B1120] to-[#151E35] ${isTVMode ? 'p-10' : 'p-8'} mt-8`}>
        <h3 className={`text-white font-bold text-center mb-8 ${isTVMode ? 'text-4xl' : 'text-2xl'}`}>
          📊 Análise Comparativa dos Cenários
        </h3>

        {/* Range Visual Comparativo */}
        <div className={`space-y-6 ${isTVMode ? 'mb-10' : 'mb-8'}`}>
          {/* Hot Dogs Range */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-white font-semibold ${isTVMode ? 'text-2xl' : 'text-base'}`}>🔴 Hot Dogs</span>
              <span className={`text-gray-400 ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                {formatarReal(hotDogs.range.min)} - {formatarReal(hotDogs.range.max)}
              </span>
            </div>
            <div className={`relative ${isTVMode ? 'h-10' : 'h-8'} bg-white/10 rounded-full`}>
              <div 
                className="absolute h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                style={{ 
                  left: `${(hotDogs.range.min / maxValue) * 100}%`,
                  width: `${(hotDogs.range.diferenca / maxValue) * 100}%`
                }} 
              />
              <div 
                className="absolute h-full border-l-2 border-yellow-400"
                style={{ left: `${(hotDogs.metaSquad / maxValue) * 100}%` }} 
              />
            </div>
          </div>

          {/* Corvo Azul Range */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-white font-semibold ${isTVMode ? 'text-2xl' : 'text-base'}`}>🔵 Corvo Azul</span>
              <span className={`text-gray-400 ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                {formatarReal(corvoAzul.range.min)} - {formatarReal(corvoAzul.range.max)}
              </span>
            </div>
            <div className={`relative ${isTVMode ? 'h-10' : 'h-8'} bg-white/10 rounded-full`}>
              <div 
                className="absolute h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                style={{ 
                  left: `${(corvoAzul.range.min / maxValue) * 100}%`,
                  width: `${(corvoAzul.range.diferenca / maxValue) * 100}%`
                }} 
              />
              <div 
                className="absolute h-full border-l-2 border-yellow-400"
                style={{ left: `${(corvoAzul.metaSquad / maxValue) * 100}%` }} 
              />
            </div>
          </div>

          {/* Legenda da Meta */}
          <div className="flex items-center justify-center gap-2">
            <div className={`w-3 ${isTVMode ? 'h-10' : 'h-8'} border-l-2 border-yellow-400`}></div>
            <span className={`text-yellow-400 font-semibold ${isTVMode ? 'text-xl' : 'text-sm'}`}>
              Meta por Squad: {formatarReal(hotDogs.metaSquad)}
            </span>
          </div>
        </div>

        {/* Insights Dinâmicos */}
        <div className={`bg-white/5 rounded-xl ${isTVMode ? 'p-8' : 'p-6'}`}>
          <h4 className={`text-[#00E5CC] font-bold mb-4 ${isTVMode ? 'text-3xl' : 'text-lg'}`}>
            🎯 Insights Estratégicos:
          </h4>
          <div className={`space-y-3 text-white ${isTVMode ? 'text-xl' : 'text-sm'}`}>
            <p className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>
                No melhor cenário (otimista), <strong>{vencedorOtimista}</strong> lidera com {formatarReal(diferencaOtimista)} de vantagem
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-red-400">×</span>
              <span>
                No pior cenário (pessimista), {ambosBatemPessimista ? 'ambos batem a meta 🎉' : 'ambos ficam abaixo da meta'}
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-blue-400">→</span>
              <span>
                Cenário mais provável (realista): <strong>{vencedorRealista}</strong> lidera por {formatarReal(diferencaRealista)}
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-yellow-400">⚡</span>
              <span>
                Faltam {hotDogs.diasRestantes} dias. Cada contrato pode mudar até {formatarReal(ticketMedio * hotDogs.diasRestantes / 10)} no resultado final
              </span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};