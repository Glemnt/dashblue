import { useState } from 'react';
import { formatarReal } from '@/utils/metricsCalculator';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { SDRMetrics } from '@/utils/sdrMetricsCalculator';
import ColaboradorAvatar from '@/components/ColaboradorAvatar';
import SDRComparisonMobileCards from './SDRComparisonMobileCards';

interface SDRComparisonTableProps {
  sdrs: SDRMetrics[];
  destaque: SDRMetrics | null;
}

type SortField = 'nome' | 'totalCalls' | 'taxaQualificacao' | 'taxaShow' | 'vendasOriginadas';

const SDRComparisonTable = ({ sdrs, destaque }: SDRComparisonTableProps) => {
  const [sortField, setSortField] = useState<SortField>('vendasOriginadas');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedSDRs = [...sdrs].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    if (sortField === 'nome') {
      return multiplier * a.nome.localeCompare(b.nome);
    }
    
    return multiplier * (a[sortField] - b[sortField]);
  });

  const getIndicator = (value: number, meta: number) => {
    const percentage = (value / meta) * 100;
    if (percentage >= 90) return '🟢';
    if (percentage >= 70) return '🟡';
    return '🔴';
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  return (
    <>
      {/* Mobile: Cards */}
      <div className="md:hidden">
        <SDRComparisonMobileCards sdrs={sortedSDRs} destaque={destaque} />
      </div>

      {/* Desktop: Tabela */}
      <div className="hidden md:block bg-[#151E35] rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-white/10">
              <th 
                className="text-left p-4 md:p-6 text-[#64748B] font-outfit text-xs font-semibold uppercase tracking-widest cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('nome')}
              >
                <div className="flex items-center gap-2">
                  SDR <SortIcon field="nome" />
                </div>
              </th>
              <th className="text-left p-4 md:p-6 text-[#64748B] font-outfit text-xs font-semibold uppercase tracking-widest">
                Squad
              </th>
              <th 
                className="text-center p-4 md:p-6 text-[#64748B] font-outfit text-xs font-semibold uppercase tracking-widest cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('totalCalls')}
              >
                <div className="flex items-center justify-center gap-2">
                  Calls <SortIcon field="totalCalls" />
                </div>
              </th>
              <th className="text-center p-4 md:p-6 text-[#64748B] font-outfit text-xs font-semibold uppercase tracking-widest">
                R1
              </th>
              <th className="text-center p-4 md:p-6 text-[#64748B] font-outfit text-xs font-semibold uppercase tracking-widest">
                R2
              </th>
              <th className="text-center p-4 md:p-6 text-[#64748B] font-outfit text-xs font-semibold uppercase tracking-widest">
                Qualificadas
              </th>
              <th 
                className="text-center p-4 md:p-6 text-[#64748B] font-outfit text-xs font-semibold uppercase tracking-widest cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('taxaQualificacao')}
              >
                <div className="flex items-center justify-center gap-2">
                  Taxa Qual. <SortIcon field="taxaQualificacao" />
                </div>
              </th>
              <th className="text-center p-4 md:p-6 text-[#64748B] font-outfit text-xs font-semibold uppercase tracking-widest">
                Realizadas
              </th>
              <th className="text-center p-4 md:p-6 text-[#64748B] font-outfit text-xs font-semibold uppercase tracking-widest">
                No-Shows
              </th>
              <th 
                className="text-center p-4 md:p-6 text-[#64748B] font-outfit text-xs font-semibold uppercase tracking-widest cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('taxaShow')}
              >
                <div className="flex items-center justify-center gap-2">
                  Taxa Show <SortIcon field="taxaShow" />
                </div>
              </th>
              <th 
                className="text-right p-4 md:p-6 text-[#64748B] font-outfit text-xs font-semibold uppercase tracking-widest cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('vendasOriginadas')}
              >
                <div className="flex items-center justify-end gap-2">
                  Vendas <SortIcon field="vendasOriginadas" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedSDRs.map((sdr) => {
              const isDestaque = destaque?.nome === sdr.nome;
              
              return (
                <tr 
                  key={sdr.nome}
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                    isDestaque ? 'bg-[#FFB800]/10' : ''
                  }`}
                >
                  <td className="p-4 md:p-6">
                    <div className="flex items-center gap-3">
                      <ColaboradorAvatar 
                        nome={sdr.nome}
                        emoji={sdr.emoji}
                        squadColor={sdr.squadColor}
                        size="sm"
                        showBorder={false}
                      />
                      <span className="text-white font-outfit text-lg font-semibold">
                        {sdr.nome}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 md:p-6">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                      style={{ backgroundColor: sdr.squadColor + '40', color: sdr.squadColor }}
                    >
                      {sdr.squad}
                    </span>
                  </td>
                  <td className="p-4 md:p-6 text-center text-white font-outfit text-xl font-bold">
                    {sdr.totalCalls}
                  </td>
                  <td className="p-4 md:p-6 text-center text-[#0066FF] font-outfit text-xl font-bold">
                    {sdr.callsR1}
                  </td>
                  <td className="p-4 md:p-6 text-center text-[#00E5CC] font-outfit text-xl font-bold">
                    {sdr.callsR2}
                  </td>
                  <td className="p-4 md:p-6 text-center text-white font-outfit text-xl font-bold">
                    {sdr.callsQualificadas}
                  </td>
                  <td className="p-4 md:p-6">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-outfit text-xl font-bold">
                          {sdr.taxaQualificacao.toFixed(1)}%
                        </span>
                        <span>{getIndicator(sdr.taxaQualificacao, 50)}</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full">
                        <div 
                          className={`h-full rounded-full ${
                            sdr.taxaQualificacao >= 50 ? 'bg-[#00E5CC]' : 
                            sdr.taxaQualificacao >= 35 ? 'bg-[#FFB800]' : 
                            'bg-[#FF4757]'
                          }`}
                          style={{ width: `${Math.min(sdr.taxaQualificacao, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4 md:p-6 text-center text-white font-outfit text-xl font-bold">
                    {sdr.callsRealizadas}
                  </td>
                  <td className="p-4 md:p-6 text-center text-white font-outfit text-xl font-bold">
                    {sdr.noShows}
                  </td>
                  <td className="p-4 md:p-6">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-outfit text-xl font-bold">
                          {sdr.taxaShow.toFixed(1)}%
                        </span>
                        <span>{getIndicator(sdr.taxaShow, 75)}</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full">
                        <div 
                          className={`h-full rounded-full ${
                            sdr.taxaShow >= 75 ? 'bg-[#00E5CC]' : 
                            sdr.taxaShow >= 50 ? 'bg-[#FFB800]' : 
                            'bg-[#FF4757]'
                          }`}
                          style={{ width: `${Math.min(sdr.taxaShow, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4 md:p-6 text-right">
                    <p className="text-white font-outfit text-2xl font-black">
                      {formatarReal(sdr.vendasOriginadas)}
                    </p>
                    <p className="text-[#94A3B8] font-outfit text-sm">
                      {sdr.contratosOriginados} contratos
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default SDRComparisonTable;
