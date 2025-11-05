import { Card } from '@/components/ui/card';
import { formatarReal } from '@/utils/financialMetricsCalculator';
import { CenarioProjecao } from '@/utils/squadsMetricsCalculator';

// Função auxiliar para interpolar entre duas cores hex
const interpolateColor = (color1: string, color2: string, ratio: number): string => {
  const hex = (color: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const c1 = hex(color1);
  const c2 = hex(color2);
  
  if (!c1 || !c2) return color1;

  const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
  const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
  const b = Math.round(c1.b + (c2.b - c1.b) * ratio);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

// Função para calcular a cor da barra de progresso baseada na porcentagem
const getProgressColor = (percentage: number): string => {
  const progress = Math.min(percentage, 120);
  
  if (progress < 20) {
    return '#EF4444'; // Vermelho intenso
  } else if (progress < 35) {
    const ratio = (progress - 20) / 15;
    return interpolateColor('#EF4444', '#F97316', ratio);
  } else if (progress < 50) {
    const ratio = (progress - 35) / 15;
    return interpolateColor('#F97316', '#F59E0B', ratio);
  } else if (progress < 65) {
    const ratio = (progress - 50) / 15;
    return interpolateColor('#F59E0B', '#EAB308', ratio);
  } else if (progress < 80) {
    const ratio = (progress - 65) / 15;
    return interpolateColor('#EAB308', '#84CC16', ratio);
  } else if (progress < 90) {
    const ratio = (progress - 80) / 10;
    return interpolateColor('#84CC16', '#22C55E', ratio);
  } else if (progress < 100) {
    const ratio = (progress - 90) / 10;
    return interpolateColor('#22C55E', '#10B981', ratio);
  } else {
    return '#00E5CC'; // Verde água brilhante
  }
};

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
    const posicaoMeta = Math.max(0, Math.min(100, (squadData.metaSquad / maxValue) * 100 || 0));
    const posicaoMin = Math.max(0, Math.min(100, (squadData.range.min / maxValue) * 100 || 0));
    const larguraRange = Math.max(0, Math.min(100 - posicaoMin, ((squadData.range.diferenca) / maxValue) * 100 || 0));
    
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
          {/* Hot Dogs Projeção Realista */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-white font-semibold ${isTVMode ? 'text-2xl' : 'text-base'}`}>🔴 Hot Dogs</span>
              <span className={`text-gray-400 ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                Projeção: {formatarReal(hotDogs.cenarios.realista.projecaoFinal)}
              </span>
            </div>
            <div className={`relative ${isTVMode ? 'h-10' : 'h-8'} bg-white/10 rounded-full overflow-hidden`}>
              <div 
                className="absolute h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.max(0, Math.min(100, (hotDogs.cenarios.realista.projecaoFinal / maxValue) * 100 || 0))}%`,
                  backgroundColor: getProgressColor((hotDogs.cenarios.realista.projecaoFinal / hotDogs.metaSquad) * 100)
                }} 
              />
              <div 
                className="absolute h-full border-l-2 border-yellow-400"
                style={{ left: `${Math.max(0, Math.min(100, (hotDogs.metaSquad / maxValue) * 100 || 0))}%` }} 
              />
            </div>
          </div>

          {/* Corvo Azul Projeção Realista */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-white font-semibold ${isTVMode ? 'text-2xl' : 'text-base'}`}>🔵 Corvo Azul</span>
              <span className={`text-gray-400 ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                Projeção: {formatarReal(corvoAzul.cenarios.realista.projecaoFinal)}
              </span>
            </div>
            <div className={`relative ${isTVMode ? 'h-10' : 'h-8'} bg-white/10 rounded-full overflow-hidden`}>
              <div 
                className="absolute h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.max(0, Math.min(100, (corvoAzul.cenarios.realista.projecaoFinal / maxValue) * 100 || 0))}%`,
                  backgroundColor: getProgressColor((corvoAzul.cenarios.realista.projecaoFinal / corvoAzul.metaSquad) * 100)
                }} 
              />
              <div 
                className="absolute h-full border-l-2 border-yellow-400"
                style={{ left: `${Math.max(0, Math.min(100, (corvoAzul.metaSquad / maxValue) * 100 || 0))}%` }} 
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

        {/* Como funcionam as projeções */}
        <div className={`bg-white/5 rounded-xl ${isTVMode ? 'p-8 mb-8' : 'p-6 mb-6'}`}>
          <h4 className={`text-[#00E5CC] font-bold mb-4 ${isTVMode ? 'text-3xl' : 'text-lg'}`}>
            📐 Como funcionam as projeções?
          </h4>
          <p className={`text-gray-300 ${isTVMode ? 'text-xl mb-6' : 'text-sm mb-4'}`}>
            As projeções são calculadas com base no <strong>volume de atividade</strong>, <strong>taxas de conversão reais</strong> e <strong>ticket médio</strong> de cada squad. Os cenários aplicam variações nessas métricas:
          </p>
          
          <div className={`grid ${isTVMode ? 'grid-cols-1 gap-6' : 'grid-cols-1 md:grid-cols-3 gap-4'}`}>
            {/* Pessimista */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={isTVMode ? 'text-3xl' : 'text-2xl'}>😰</span>
                <h5 className={`text-red-400 font-bold ${isTVMode ? 'text-2xl' : 'text-base'}`}>
                  Pessimista (30%)
                </h5>
              </div>
              <p className={`text-gray-300 ${isTVMode ? 'text-lg' : 'text-xs'} mb-2`}>
                <strong>Premissa:</strong> Queda de performance
              </p>
              <ul className={`text-gray-400 ${isTVMode ? 'text-base' : 'text-xs'} space-y-1`}>
                <li>• Taxa de Show: <strong className="text-red-400">-20%</strong></li>
                <li>• Taxa de Conversão: <strong className="text-red-400">-20%</strong></li>
                <li>• Ticket Médio: <strong className="text-red-400">-15%</strong></li>
                <li>• Volume de Calls: <strong className="text-red-400">-20%</strong></li>
              </ul>
              <div className={`mt-3 bg-red-500/20 rounded px-3 py-2 ${isTVMode ? 'text-base' : 'text-xs'} font-mono`}>
                <strong>Fórmula:</strong><br/>
                Receita Atual + (Calls/dia × 0.8 × Dias × Show × 0.8 × Conv × 0.8 × Ticket × 0.85)
              </div>
            </div>

            {/* Realista */}
            <div className="bg-blue-500/10 border-2 border-blue-500/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={isTVMode ? 'text-3xl' : 'text-2xl'}>😐</span>
                <h5 className={`text-blue-400 font-bold ${isTVMode ? 'text-2xl' : 'text-base'}`}>
                  Realista (50%) ⭐
                </h5>
              </div>
              <p className={`text-gray-300 ${isTVMode ? 'text-lg' : 'text-xs'} mb-2`}>
                <strong>Premissa:</strong> Mantém performance atual
              </p>
              <ul className={`text-gray-400 ${isTVMode ? 'text-base' : 'text-xs'} space-y-1`}>
                <li>• Taxa de Show: <strong className="text-blue-400">Atual</strong></li>
                <li>• Taxa de Conversão: <strong className="text-blue-400">Atual</strong></li>
                <li>• Ticket Médio: <strong className="text-blue-400">Atual</strong></li>
                <li>• Volume de Calls: <strong className="text-blue-400">Atual</strong></li>
              </ul>
              <div className={`mt-3 bg-blue-500/20 rounded px-3 py-2 ${isTVMode ? 'text-base' : 'text-xs'} font-mono`}>
                <strong>Fórmula:</strong><br/>
                Receita Atual + (Calls/dia × Dias × Taxa Show × Taxa Conv × Ticket Médio)
              </div>
            </div>

            {/* Otimista */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={isTVMode ? 'text-3xl' : 'text-2xl'}>🤩</span>
                <h5 className={`text-green-400 font-bold ${isTVMode ? 'text-2xl' : 'text-base'}`}>
                  Otimista (20%)
                </h5>
              </div>
              <p className={`text-gray-300 ${isTVMode ? 'text-lg' : 'text-xs'} mb-2`}>
                <strong>Premissa:</strong> Melhora de performance
              </p>
              <ul className={`text-gray-400 ${isTVMode ? 'text-base' : 'text-xs'} space-y-1`}>
                <li>• Taxa de Show: <strong className="text-green-400">+20%</strong></li>
                <li>• Taxa de Conversão: <strong className="text-green-400">+20%</strong></li>
                <li>• Ticket Médio: <strong className="text-green-400">+15%</strong></li>
                <li>• Volume de Calls: <strong className="text-green-400">+20%</strong></li>
              </ul>
              <div className={`mt-3 bg-green-500/20 rounded px-3 py-2 ${isTVMode ? 'text-base' : 'text-xs'} font-mono`}>
                <strong>Fórmula:</strong><br/>
                Receita Atual + (Calls/dia × 1.2 × Dias × Show × 1.2 × Conv × 1.2 × Ticket × 1.15)
              </div>
            </div>
          </div>

          {/* Exemplo Prático */}
          <div className="mt-6 bg-[#00E5CC]/10 border border-[#00E5CC]/30 rounded-lg p-4">
            <h5 className={`text-[#00E5CC] font-bold mb-2 ${isTVMode ? 'text-xl' : 'text-sm'}`}>
              💡 Exemplo Prático:
            </h5>
            <p className={`text-gray-300 ${isTVMode ? 'text-lg' : 'text-xs'}`}>
              Squad com: <strong>R$ 100k</strong> faturados | <strong>60 calls</strong> em 10 dias | 
              Taxa Show <strong>70%</strong> | Taxa Conv <strong>5%</strong> | 
              Ticket <strong>R$ 15k</strong> | <strong>20 dias restantes</strong>
            </p>
            <ul className={`mt-3 space-y-2 text-gray-300 ${isTVMode ? 'text-lg' : 'text-xs'}`}>
              <li className="flex items-start gap-2">
                <span className="text-red-400">😰</span>
                <span>
                  <strong>Pessimista:</strong> R$ 100k + (4.8 calls/dia × 20 dias × 56% show × 4% conv × R$ 12.750) 
                  = <strong className="text-red-400">~R$ 155k</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">😐</span>
                <span>
                  <strong>Realista:</strong> R$ 100k + (6 calls/dia × 20 dias × 70% show × 5% conv × R$ 15k) 
                  = <strong className="text-blue-400">~R$ 190k</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">🤩</span>
                <span>
                  <strong>Otimista:</strong> R$ 100k + (7.2 calls/dia × 20 dias × 84% show × 6% conv × R$ 17.250) 
                  = <strong className="text-green-400">~R$ 233k</strong>
                </span>
              </li>
            </ul>
            <p className={`mt-4 text-[#00E5CC] ${isTVMode ? 'text-base' : 'text-xs'}`}>
              ✨ <strong>As projeções se ajustam automaticamente</strong> conforme as métricas mudam ao longo do mês!
            </p>
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