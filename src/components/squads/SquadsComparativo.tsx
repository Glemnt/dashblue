import { formatarReal } from '@/utils/financialMetricsCalculator';
import { SquadMetrics } from '@/utils/squadsMetricsCalculator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SquadsComparativoProps {
  hotDogs: SquadMetrics;
  corvoAzul: SquadMetrics;
  comparacao: any;
  isTVMode: boolean;
  allSquads?: SquadMetrics[];
}

export const SquadsComparativo = ({ hotDogs, corvoAzul, isTVMode, allSquads }: SquadsComparativoProps) => {
  const squads = allSquads && allSquads.length > 0 ? allSquads : [hotDogs, corvoAzul];
  
  const metricasDefs = [
    { label: 'Receita Total', getValue: (s: SquadMetrics) => s.receitaTotal, format: (v: number) => formatarReal(v) },
    { label: 'Contratos', getValue: (s: SquadMetrics) => s.contratos, format: (v: number) => String(v) },
    { label: 'Ticket Médio', getValue: (s: SquadMetrics) => s.ticketMedio, format: (v: number) => formatarReal(v) },
    { label: 'Taxa Conversão', getValue: (s: SquadMetrics) => s.taxaConversao, format: (v: number) => `${v.toFixed(1)}%` },
    { label: 'Calls Realizadas', getValue: (s: SquadMetrics) => s.callsRealizadas, format: (v: number) => String(v) },
    { label: 'Calls Qualificadas', getValue: (s: SquadMetrics) => s.callsQualificadas, format: (v: number) => String(v) },
    { label: 'Taxa Qualificação', getValue: (s: SquadMetrics) => s.taxaQualificacao, format: (v: number) => `${v.toFixed(1)}%` },
    { label: 'Taxa Show', getValue: (s: SquadMetrics) => s.taxaShow, format: (v: number) => `${v.toFixed(1)}%` }
  ];
  
  return (
    <div className="max-w-[1600px] mx-auto">
      <h2 className={`text-[#0B1120] font-black text-center mb-8 ${
        isTVMode ? 'text-5xl' : 'text-2xl sm:text-3xl md:text-4xl'
      }`}>
        Comparação de Métricas
      </h2>
      
      {/* DESKTOP: Tabela */}
      <div className="hidden md:block bg-white rounded-2xl overflow-hidden shadow-2xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100">
              <TableHead className={`font-black uppercase tracking-wider ${
                isTVMode ? 'text-2xl py-8' : 'text-lg py-6'
              } text-gray-700`}>
                Métrica
              </TableHead>
              {squads.map(squad => (
                <TableHead key={squad.nome} className={`text-center font-black uppercase tracking-wider ${
                  isTVMode ? 'text-2xl py-8' : 'text-lg py-6'
                }`}>
                  <div className="flex items-center justify-center gap-3">
                    <span className={isTVMode ? 'text-4xl' : 'text-3xl'}>{squad.emoji}</span>
                    <span style={{ color: squad.cor }}>{squad.nome.toUpperCase()}</span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {metricasDefs.map((metrica, idx) => {
              const values = squads.map(s => metrica.getValue(s));
              const maxVal = Math.max(...values);
              
              return (
                <TableRow 
                  key={idx}
                  className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-gray-100/50 transition-colors`}
                >
                  <TableCell className={`font-bold ${isTVMode ? 'text-2xl py-8' : 'text-lg py-6'} text-gray-700`}>
                    {metrica.label}
                  </TableCell>
                  
                  {squads.map((squad, sIdx) => {
                    const val = values[sIdx];
                    const isWinner = val === maxVal && val > 0;
                    
                    return (
                      <TableCell key={squad.nome} className={`text-center ${isTVMode ? 'py-8' : 'py-6'} ${
                        isWinner ? `bg-opacity-5` : ''
                      }`} style={isWinner ? { backgroundColor: `${squad.cor}08` } : {}}>
                        <div className="flex flex-col items-center gap-2">
                          <span className={`font-black break-all leading-tight ${
                            isTVMode ? 'text-xl sm:text-2xl md:text-3xl' : 'text-lg sm:text-xl md:text-2xl'
                          }`} style={{ color: isWinner ? squad.cor : '#4B5563' }}>
                            {metrica.format(val)}
                          </span>
                          {isWinner && (
                            <span className={isTVMode ? 'text-2xl' : 'text-xl'}>🟢</span>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {/* MOBILE: Cards empilhados */}
      <div className="md:hidden space-y-4">
        {metricasDefs.map((metrica, idx) => {
          const values = squads.map(s => metrica.getValue(s));
          const maxVal = Math.max(...values);
          
          return (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-lg">
              <h3 className="text-gray-700 font-bold text-lg mb-4 text-center">
                {metrica.label}
              </h3>
              
              {squads.map((squad, sIdx) => {
                const val = values[sIdx];
                const isWinner = val === maxVal && val > 0;
                
                return (
                  <div key={squad.nome} className={`rounded-lg p-4 mb-3 ${
                    isWinner ? 'bg-opacity-10' : 'bg-opacity-5'
                  }`} style={{ backgroundColor: `${squad.cor}${isWinner ? '1A' : '0D'}` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{squad.emoji}</span>
                      <span className="font-bold text-sm" style={{ color: squad.cor }}>
                        {squad.nome.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-2xl font-black text-gray-800 break-all">
                      {metrica.format(val)}
                    </p>
                    {isWinner && (
                      <p className="text-sm font-semibold mt-2" style={{ color: squad.cor }}>
                        🟢 Líder
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
