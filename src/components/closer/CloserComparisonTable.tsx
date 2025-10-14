import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { CloserMetrics } from '@/utils/closerMetricsCalculator';
import { formatarReal } from '@/utils/metricsCalculator';
import { Progress } from '@/components/ui/progress';
import ColaboradorAvatar from '@/components/ColaboradorAvatar';

interface CloserComparisonTableProps {
  closers: CloserMetrics[];
  destaque: CloserMetrics | null;
}

type SortKey = 'nome' | 'callsRealizadas' | 'callsQualificadas' | 'contratosFechados' | 'taxaConversao' | 'receitaTotal' | 'ticketMedio' | 'taxaAssinatura' | 'taxaPagamento';

const CloserComparisonTable = ({ closers, destaque }: CloserComparisonTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>('receitaTotal');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const sortedClosers = [...closers].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return sortOrder === 'asc' 
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const getIndicador = (taxa: number, metaBoa: number, metaRazoavel: number) => {
    if (taxa >= metaBoa) return '🟢';
    if (taxa >= metaRazoavel) return '🟡';
    return '🔴';
  };

  const SortableHeader = ({ label, sortKeyVal }: { label: string; sortKeyVal: SortKey }) => (
    <th 
      className="text-[#64748B] text-xs font-semibold uppercase tracking-wider text-left px-6 py-4 cursor-pointer hover:text-white transition-colors"
      onClick={() => handleSort(sortKeyVal)}
    >
      <div className="flex items-center gap-2">
        {label}
        <ArrowUpDown className="w-4 h-4" />
      </div>
    </th>
  );

  return (
    <div className="bg-[#151E35] rounded-2xl overflow-hidden border border-white/5">
      <table className="w-full">
        <thead className="border-b border-white/10">
          <tr>
            <SortableHeader label="Closer" sortKeyVal="nome" />
            <SortableHeader label="Squad" sortKeyVal="nome" />
            <SortableHeader label="Calls Realizadas" sortKeyVal="callsRealizadas" />
            <SortableHeader label="Calls Qualificadas" sortKeyVal="callsQualificadas" />
            <SortableHeader label="Contratos" sortKeyVal="contratosFechados" />
            <SortableHeader label="Taxa Conversão" sortKeyVal="taxaConversao" />
            <SortableHeader label="Receita Total" sortKeyVal="receitaTotal" />
            <SortableHeader label="Ticket Médio" sortKeyVal="ticketMedio" />
            <SortableHeader label="Taxa Assinatura" sortKeyVal="taxaAssinatura" />
            <SortableHeader label="Taxa Pagamento" sortKeyVal="taxaPagamento" />
          </tr>
        </thead>
        <tbody>
          {sortedClosers.map((closer) => {
            const isDestaque = destaque?.nome === closer.nome;
            
            return (
              <tr 
                key={closer.nome}
                className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                  isDestaque ? 'bg-[#FFB800]/10' : ''
                }`}
              >
                {/* Closer */}
                <td className="px-6 py-6">
                  <div className="flex items-center gap-3">
                    <ColaboradorAvatar 
                      nome={closer.nome}
                      emoji={closer.emoji}
                      squadColor={closer.squadColor}
                      size="sm"
                      showBorder={false}
                    />
                    <span className="text-white font-outfit font-semibold text-base">
                      {closer.nome}
                    </span>
                  </div>
                </td>

                {/* Squad */}
                <td className="px-6 py-6">
                  <span 
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                    style={{ backgroundColor: closer.squadColor + '20', color: closer.squadColor }}
                  >
                    {closer.squad}
                  </span>
                </td>

                {/* Calls Realizadas */}
                <td className="px-6 py-6">
                  <span className="text-white font-outfit text-lg font-bold">
                    {closer.callsRealizadas}
                  </span>
                </td>

                {/* Calls Qualificadas */}
                <td className="px-6 py-6">
                  <span className="text-white font-outfit text-lg font-bold">
                    {closer.callsQualificadas}
                  </span>
                </td>

                {/* Contratos */}
                <td className="px-6 py-6">
                  <span className="text-white font-outfit text-lg font-bold">
                    {closer.contratosFechados}
                  </span>
                </td>

                {/* Taxa Conversão */}
                <td className="px-6 py-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getIndicador(closer.taxaConversao, 25, 15)}</span>
                      <span className="text-white font-outfit text-lg font-bold">
                        {closer.taxaConversao.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={Math.min(closer.taxaConversao, 100)} className="h-2" />
                  </div>
                </td>

                {/* Receita Total */}
                <td className="px-6 py-6">
                  <div>
                    <p className="text-white font-outfit text-xl font-black">
                      {formatarReal(closer.receitaTotal)}
                    </p>
                    <p className="text-[#94A3B8] text-xs font-outfit mt-1">
                      {closer.contratosFechados} contratos
                    </p>
                  </div>
                </td>

                {/* Ticket Médio */}
                <td className="px-6 py-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getIndicador(closer.ticketMedio, 12000, 8000)}</span>
                    <span className="text-white font-outfit text-lg font-bold">
                      {formatarReal(closer.ticketMedio)}
                    </span>
                  </div>
                </td>

                {/* Taxa Assinatura */}
                <td className="px-6 py-6">
                  <div className="space-y-2">
                    <span className="text-white font-outfit text-lg font-bold">
                      {closer.taxaAssinatura.toFixed(1)}%
                    </span>
                    <Progress value={Math.min(closer.taxaAssinatura, 100)} className="h-2" />
                  </div>
                </td>

                {/* Taxa Pagamento */}
                <td className="px-6 py-6">
                  <div className="space-y-2">
                    <span className="text-white font-outfit text-lg font-bold">
                      {closer.taxaPagamento.toFixed(1)}%
                    </span>
                    <Progress value={Math.min(closer.taxaPagamento, 100)} className="h-2" />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CloserComparisonTable;
