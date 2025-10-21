import { formatarReal } from '@/utils/financialMetricsCalculator';
import { SquadMetrics, MetricaComparacao } from '@/utils/squadsMetricsCalculator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
      <h2 className={`text-[#0B1120] font-black text-center mb-8 ${
        isTVMode ? 'text-5xl' : 'text-4xl'
      }`}>
        Comparação de Métricas
      </h2>
      
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100">
              <TableHead className={`font-black uppercase tracking-wider ${
                isTVMode ? 'text-2xl py-8' : 'text-lg py-6'
              } text-gray-700`}>
                Métrica
              </TableHead>
              <TableHead className={`text-center font-black uppercase tracking-wider ${
                isTVMode ? 'text-2xl py-8' : 'text-lg py-6'
              }`}>
                <div className="flex items-center justify-center gap-3">
                  <span className={isTVMode ? 'text-4xl' : 'text-3xl'}>🔴</span>
                  <span className="text-[#FF4757]">HOT DOGS</span>
                </div>
              </TableHead>
              <TableHead className={`text-center font-black uppercase tracking-wider ${
                isTVMode ? 'text-2xl py-8' : 'text-lg py-6'
              }`}>
                <div className="flex items-center justify-center gap-3">
                  <span className={isTVMode ? 'text-4xl' : 'text-3xl'}>🔵</span>
                  <span className="text-[#0066FF]">CORVO AZUL</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metricas.map((metrica, idx) => {
              const hotDogsVencedor = metrica.comparacao.vencedor === 'Hot Dogs';
              const corvoAzulVencedor = metrica.comparacao.vencedor === 'Corvo Azul';
              const empate = metrica.comparacao.vencedor === 'Empate';
              
              return (
                <TableRow 
                  key={idx}
                  className={`${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  } hover:bg-gray-100/50 transition-colors`}
                >
                  <TableCell className={`font-bold ${
                    isTVMode ? 'text-2xl py-8' : 'text-lg py-6'
                  } text-gray-700`}>
                    {metrica.label}
                  </TableCell>
                  
                  <TableCell className={`text-center ${
                    isTVMode ? 'py-8' : 'py-6'
                  } ${
                    hotDogsVencedor ? 'bg-[#FF4757]/5' : ''
                  }`}>
                    <div className="flex flex-col items-center gap-2">
                      <span className={`font-black ${
                        isTVMode ? 'text-3xl' : 'text-2xl'
                      } ${
                        hotDogsVencedor ? 'text-[#FF4757]' : 'text-gray-600'
                      }`}>
                        {metrica.hotDogsValor}
                      </span>
                      {!empate && (
                        <div className="flex items-center gap-2">
                          <span className={isTVMode ? 'text-2xl' : 'text-xl'}>
                            {hotDogsVencedor ? '🟢' : '🔴'}
                          </span>
                          <span className={`text-sm font-semibold ${
                            hotDogsVencedor ? 'text-[#FF4757]' : 'text-gray-400'
                          }`}>
                            {hotDogsVencedor 
                              ? `+${metrica.comparacao.diferencaPerc.toFixed(0)}%`
                              : `-${metrica.comparacao.diferencaPerc.toFixed(0)}%`
                            }
                          </span>
                        </div>
                      )}
                      {empate && (
                        <span className={`text-sm font-semibold text-yellow-600 ${
                          isTVMode ? 'text-xl' : ''
                        }`}>
                          🟡 Empate
                        </span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className={`text-center ${
                    isTVMode ? 'py-8' : 'py-6'
                  } ${
                    corvoAzulVencedor ? 'bg-[#0066FF]/5' : ''
                  }`}>
                    <div className="flex flex-col items-center gap-2">
                      <span className={`font-black ${
                        isTVMode ? 'text-3xl' : 'text-2xl'
                      } ${
                        corvoAzulVencedor ? 'text-[#0066FF]' : 'text-gray-600'
                      }`}>
                        {metrica.corvoAzulValor}
                      </span>
                      {!empate && (
                        <div className="flex items-center gap-2">
                          <span className={isTVMode ? 'text-2xl' : 'text-xl'}>
                            {corvoAzulVencedor ? '🟢' : '🔴'}
                          </span>
                          <span className={`text-sm font-semibold ${
                            corvoAzulVencedor ? 'text-[#0066FF]' : 'text-gray-400'
                          }`}>
                            {corvoAzulVencedor 
                              ? `+${metrica.comparacao.diferencaPerc.toFixed(0)}%`
                              : `-${metrica.comparacao.diferencaPerc.toFixed(0)}%`
                            }
                          </span>
                        </div>
                      )}
                      {empate && (
                        <span className={`text-sm font-semibold text-yellow-600 ${
                          isTVMode ? 'text-xl' : ''
                        }`}>
                          🟡 Empate
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
