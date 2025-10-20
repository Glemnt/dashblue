import { formatarReal } from '@/utils/financialMetricsCalculator';
import { SquadMetrics, MetricaComparacao } from '@/utils/squadsMetricsCalculator';
import { Card } from '@/components/ui/card';

interface SquadsComparativoProps {
  hotDogs: SquadMetrics;
  corvoAzul: SquadMetrics;
  comparacao: {
    receita: MetricaComparacao;
    contratos: MetricaComparacao;
    ticketMedio: MetricaComparacao;
    taxaConversao: MetricaComparacao;
    callsRealizadas: MetricaComparacao;
    taxaQualificacao: MetricaComparacao;
    taxaShow: MetricaComparacao;
  };
  isTVMode: boolean;
}

interface MetricaCardProps {
  label: string;
  valor: string | number;
  isVencedor: boolean;
  isEmpate: boolean;
  comparacaoTexto?: string;
  isTVMode: boolean;
}

const MetricaCard = ({ label, valor, isVencedor, isEmpate, comparacaoTexto, isTVMode }: MetricaCardProps) => {
  const badgeEmoji = isEmpate ? '🟡' : isVencedor ? '🟢' : '🔴';
  
  return (
    <div className="text-center">
      <p className={`text-[#94A3B8] mb-2 ${isTVMode ? 'text-xl' : 'text-sm'}`}>
        {label}
      </p>
      <p className={`font-black mb-2 ${isTVMode ? 'text-5xl' : 'text-3xl'} ${
        isVencedor ? 'text-[#00E5CC]' : 'text-white'
      }`}>
        {valor}
      </p>
      <div className="flex items-center justify-center gap-2">
        <span className={isTVMode ? 'text-3xl' : 'text-2xl'}>{badgeEmoji}</span>
        {comparacaoTexto && (
          <span className={`text-xs ${isVencedor ? 'text-[#00E5CC]' : 'text-[#94A3B8]'}`}>
            {comparacaoTexto}
          </span>
        )}
      </div>
    </div>
  );
};

export const SquadsComparativo = ({ hotDogs, corvoAzul, comparacao, isTVMode }: SquadsComparativoProps) => {
  const metricas = [
    {
      label: 'Receita Total',
      hotDogsValor: formatarReal(hotDogs.receitaTotal),
      corvoAzulValor: formatarReal(corvoAzul.receitaTotal),
      comparacao: comparacao.receita
    },
    {
      label: 'Contratos',
      hotDogsValor: hotDogs.contratos,
      corvoAzulValor: corvoAzul.contratos,
      comparacao: comparacao.contratos
    },
    {
      label: 'Ticket Médio',
      hotDogsValor: formatarReal(hotDogs.ticketMedio),
      corvoAzulValor: formatarReal(corvoAzul.ticketMedio),
      comparacao: comparacao.ticketMedio
    },
    {
      label: 'Taxa Conversão',
      hotDogsValor: `${hotDogs.taxaConversao.toFixed(1)}%`,
      corvoAzulValor: `${corvoAzul.taxaConversao.toFixed(1)}%`,
      comparacao: comparacao.taxaConversao
    },
    {
      label: 'Calls Realizadas',
      hotDogsValor: hotDogs.callsRealizadas,
      corvoAzulValor: corvoAzul.callsRealizadas,
      comparacao: comparacao.callsRealizadas
    },
    {
      label: 'Calls Qualificadas',
      hotDogsValor: hotDogs.callsQualificadas,
      corvoAzulValor: corvoAzul.callsQualificadas,
      comparacao: comparacao.taxaQualificacao
    },
    {
      label: 'Taxa Qualificação',
      hotDogsValor: `${hotDogs.taxaQualificacao.toFixed(1)}%`,
      corvoAzulValor: `${corvoAzul.taxaQualificacao.toFixed(1)}%`,
      comparacao: comparacao.taxaQualificacao
    },
    {
      label: 'Taxa Show',
      hotDogsValor: `${hotDogs.taxaShow.toFixed(1)}%`,
      corvoAzulValor: `${corvoAzul.taxaShow.toFixed(1)}%`,
      comparacao: comparacao.taxaShow
    }
  ];
  
  return (
    <div className="max-w-[1600px] mx-auto">
      <h2 className={`text-white font-black text-center mb-12 ${
        isTVMode ? 'text-5xl' : 'text-4xl'
      }`}>
        Comparação de Métricas
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* CARD HOT DOGS */}
        <Card className="bg-white border-l-8 border-[#FF4757] p-6 md:p-12">
          <div className="text-center mb-8">
            <div className={isTVMode ? 'text-6xl mb-4' : 'text-5xl mb-4'}>🔴</div>
            <h3 className={`font-black text-[#FF4757] ${
              isTVMode ? 'text-4xl' : 'text-3xl'
            }`}>
              HOT DOGS
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-6 md:gap-8">
            {metricas.map((metrica, idx) => {
              const isVencedor = metrica.comparacao.vencedor === 'Hot Dogs';
              const isEmpate = metrica.comparacao.vencedor === 'Empate';
              const comparacaoTexto = isVencedor 
                ? `+${metrica.comparacao.diferencaPerc.toFixed(0)}%`
                : isEmpate ? 'empate' : `-${metrica.comparacao.diferencaPerc.toFixed(0)}%`;
              
              return (
                <MetricaCard
                  key={idx}
                  label={metrica.label}
                  valor={metrica.hotDogsValor}
                  isVencedor={isVencedor}
                  isEmpate={isEmpate}
                  comparacaoTexto={comparacaoTexto}
                  isTVMode={isTVMode}
                />
              );
            })}
          </div>
        </Card>
        
        {/* CARD CORVO AZUL */}
        <Card className="bg-white border-l-8 border-[#0066FF] p-6 md:p-12">
          <div className="text-center mb-8">
            <div className={isTVMode ? 'text-6xl mb-4' : 'text-5xl mb-4'}>🔵</div>
            <h3 className={`font-black text-[#0066FF] ${
              isTVMode ? 'text-4xl' : 'text-3xl'
            }`}>
              CORVO AZUL
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-6 md:gap-8">
            {metricas.map((metrica, idx) => {
              const isVencedor = metrica.comparacao.vencedor === 'Corvo Azul';
              const isEmpate = metrica.comparacao.vencedor === 'Empate';
              const comparacaoTexto = isVencedor 
                ? `+${metrica.comparacao.diferencaPerc.toFixed(0)}%`
                : isEmpate ? 'empate' : `-${metrica.comparacao.diferencaPerc.toFixed(0)}%`;
              
              return (
                <MetricaCard
                  key={idx}
                  label={metrica.label}
                  valor={metrica.corvoAzulValor}
                  isVencedor={isVencedor}
                  isEmpate={isEmpate}
                  comparacaoTexto={comparacaoTexto}
                  isTVMode={isTVMode}
                />
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
