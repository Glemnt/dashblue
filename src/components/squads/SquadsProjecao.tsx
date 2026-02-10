import { Card } from '@/components/ui/card';
import { formatarReal } from '@/utils/financialMetricsCalculator';
import { CenarioProjecao } from '@/utils/squadsMetricsCalculator';

interface ProjecaoSquad {
  cenarios: {
    pessimista: CenarioProjecao;
    realista: CenarioProjecao;
    otimista: CenarioProjecao;
  };
  range: { min: number; max: number; diferenca: number; };
  mediaDiaria: number;
  diasRestantes: number;
  metaSquad: number;
  receitaAtual: number;
}

interface SquadsProjecaoProps {
  projecao: {
    hotDogs: ProjecaoSquad;
    corvoAzul: ProjecaoSquad;
    kiKarnes?: ProjecaoSquad;
  };
  isTVMode: boolean;
}

const CenarioCard = ({ tipo, emoji, cenario, corPrimaria, corFundo, corBorda, destaque, isTVMode }: { 
  tipo: string; emoji: string; cenario: CenarioProjecao; 
  corPrimaria: string; corFundo: string; corBorda: string; destaque: boolean; isTVMode: boolean;
}) => (
  <div className={`${corFundo} ${destaque ? `${corBorda} border-4 shadow-lg` : `${corBorda} border-2`} rounded-xl ${isTVMode ? 'p-6' : 'p-4'}`}>
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
  const squadProjecoes: Array<{ nome: string; emoji: string; cor: string; data: ProjecaoSquad }> = [
    { nome: 'Hot Dogs', emoji: '🔴', cor: '#FF4757', data: projecao.hotDogs },
    { nome: 'Corvo Azul', emoji: '🔵', cor: '#0066FF', data: projecao.corvoAzul },
    ...(projecao.kiKarnes ? [{ nome: 'Ki Karnes', emoji: '🟠', cor: '#FF6B00', data: projecao.kiKarnes }] : [])
  ];
  
  const maxValue = Math.max(...squadProjecoes.map(s => Math.max(s.data.range.max, s.data.metaSquad)));
  
  const renderSquadCard = (nome: string, emoji: string, cor: string, squadData: ProjecaoSquad) => {
    const posicaoMeta = Math.max(0, Math.min(100, (squadData.metaSquad / maxValue) * 100 || 0));
    const posicaoMin = Math.max(0, Math.min(100, (squadData.range.min / maxValue) * 100 || 0));
    const larguraRange = Math.max(0, Math.min(100 - posicaoMin, ((squadData.range.diferenca) / maxValue) * 100 || 0));
    
    return (
      <Card className={`bg-white ${isTVMode ? 'p-8' : 'p-6'}`}>
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

        <div className={`relative ${isTVMode ? 'h-16' : 'h-12'} bg-gray-100 rounded-lg mb-6`}>
          <div className="absolute h-full bg-red-50 rounded-l-lg" style={{ width: `${Math.min(posicaoMeta, 100)}%` }} />
          {posicaoMeta < 100 && (
            <div className="absolute h-full bg-green-50 rounded-r-lg right-0" style={{ width: `${100 - posicaoMeta}%` }} />
          )}
          <div className="absolute h-full border-l-4 border-yellow-500 z-10" style={{ left: `${posicaoMeta}%` }}>
            <span className={`absolute ${isTVMode ? '-top-8 -left-16 text-base' : '-top-6 -left-12 text-xs'} font-bold text-yellow-600 whitespace-nowrap`}>
              Meta {formatarReal(squadData.metaSquad)}
            </span>
          </div>
          <div 
            className={`absolute top-1/2 -translate-y-1/2 ${isTVMode ? 'h-8' : 'h-6'} rounded-full z-20`}
            style={{ left: `${posicaoMin}%`, width: `${larguraRange}%`, background: cor }}
          />
        </div>

        <div className={`grid ${isTVMode ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-3'} gap-4`}>
          <CenarioCard tipo="Pessimista" emoji="😰" cenario={squadData.cenarios.pessimista} corPrimaria="text-red-600" corFundo="bg-red-50" corBorda="border-red-200" destaque={false} isTVMode={isTVMode} />
          <CenarioCard tipo="Realista" emoji="😐" cenario={squadData.cenarios.realista} corPrimaria="text-blue-600" corFundo="bg-blue-50" corBorda="border-blue-400" destaque={true} isTVMode={isTVMode} />
          <CenarioCard tipo="Otimista" emoji="🤩" cenario={squadData.cenarios.otimista} corPrimaria="text-green-600" corFundo="bg-green-50" corBorda="border-green-200" destaque={false} isTVMode={isTVMode} />
        </div>
      </Card>
    );
  };
  
  return (
    <div className="max-w-[1600px] mx-auto">
      <h2 className={`text-[#0B1120] font-black text-center mb-12 ${isTVMode ? 'text-6xl' : 'text-4xl'}`}>
        📊 Projeções para Fim do Mês
      </h2>
      
      <div className="space-y-8 mb-8">
        {squadProjecoes.map(sq => (
          <div key={sq.nome}>{renderSquadCard(sq.nome, sq.emoji, sq.cor, sq.data)}</div>
        ))}
      </div>
      
      {/* Comparative Analysis */}
      <Card className={`bg-gradient-to-br from-[#0B1120] to-[#151E35] ${isTVMode ? 'p-10' : 'p-8'} mt-8`}>
        <h3 className={`text-white font-bold text-center mb-8 ${isTVMode ? 'text-4xl' : 'text-2xl'}`}>
          📊 Análise Comparativa dos Cenários
        </h3>

        <div className={`space-y-6 ${isTVMode ? 'mb-10' : 'mb-8'}`}>
          {squadProjecoes.map(sq => (
            <div key={sq.nome}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-white font-semibold ${isTVMode ? 'text-2xl' : 'text-base'}`}>
                  {sq.emoji} {sq.nome}
                </span>
                <span className={`text-gray-400 ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                  Projeção: {formatarReal(sq.data.cenarios.realista.projecaoFinal)}
                </span>
              </div>
              <div className={`relative ${isTVMode ? 'h-10' : 'h-8'} bg-white/10 rounded-full overflow-hidden`}>
                <div 
                  className="absolute h-full rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${Math.max(0, Math.min(100, (sq.data.cenarios.realista.projecaoFinal / maxValue) * 100 || 0))}%`,
                    backgroundColor: sq.cor
                  }} 
                />
                <div 
                  className="absolute h-full border-l-2 border-yellow-400"
                  style={{ left: `${Math.max(0, Math.min(100, (sq.data.metaSquad / maxValue) * 100 || 0))}%` }} 
                />
              </div>
            </div>
          ))}

          <div className="flex items-center justify-center gap-2">
            <div className={`w-3 ${isTVMode ? 'h-10' : 'h-8'} border-l-2 border-yellow-400`}></div>
            <span className={`text-yellow-400 font-semibold ${isTVMode ? 'text-xl' : 'text-sm'}`}>
              Meta por Squad: {formatarReal(squadProjecoes[0].data.metaSquad)}
            </span>
          </div>
        </div>

        <div className={`bg-white/5 rounded-xl ${isTVMode ? 'p-8' : 'p-6'}`}>
          <h4 className={`text-[#00E5CC] font-bold mb-4 ${isTVMode ? 'text-3xl' : 'text-lg'}`}>
            🎯 Insights Estratégicos:
          </h4>
          <div className={`space-y-3 text-white ${isTVMode ? 'text-xl' : 'text-sm'}`}>
            <p className="flex items-start gap-2">
              <span className="text-yellow-400">⚡</span>
              <span>
                Faltam {squadProjecoes[0].data.diasRestantes} dias para decidir o campeão deste mês!
              </span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
