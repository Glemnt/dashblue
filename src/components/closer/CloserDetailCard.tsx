import { useState } from 'react';
import { ChevronDown, ChevronUp, Phone, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';
import { CloserMetrics } from '@/utils/closerMetricsCalculator';
import { formatarReal } from '@/utils/metricsCalculator';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CloserDetailCardProps {
  closer: CloserMetrics;
  metaIndividual: number;
}

const CloserDetailCard = ({ closer, metaIndividual }: CloserDetailCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getProgressColor = (value: number, meta: number) => {
    const percentage = (value / meta) * 100;
    if (percentage >= 90) return '#00E5CC';
    if (percentage >= 70) return '#FFB800';
    return '#FF4757';
  };

  const getStatusBadge = (contrato: any) => {
    if (contrato.assinado && contrato.pago) {
      return { text: '✅ Assinado + Pago', color: 'bg-[#00E5CC]/20 text-[#00E5CC]' };
    } else if (contrato.assinado) {
      return { text: '💰 Pendente Pagamento', color: 'bg-[#FFB800]/20 text-[#FFB800]' };
    }
    return { text: '⏳ Pendente Assinatura', color: 'bg-[#94A3B8]/20 text-[#94A3B8]' };
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div 
        className="bg-white rounded-2xl border-l-8 hover:shadow-2xl transition-all duration-300 overflow-hidden"
        style={{ borderLeftColor: closer.squadColor }}
      >
        
        {/* HEADER */}
        <CollapsibleTrigger asChild>
          <div className="p-8 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              
              <div className="flex items-center gap-6">
                {/* Emoji do Squad */}
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl border-4 border-white shadow-lg"
                  style={{ backgroundColor: closer.squadColor }}
                >
                  {closer.emoji}
                </div>

                {/* Nome e Squad */}
                <div>
                  <h3 className="text-[#0B1120] font-outfit text-3xl font-bold mb-2">
                    {closer.nome}
                  </h3>
                  <div 
                    className="inline-block px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wider"
                    style={{ backgroundColor: closer.squadColor + '20', color: closer.squadColor }}
                  >
                    {closer.squad}
                  </div>
                </div>
              </div>

              {/* Receita + Expand Icon */}
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[#64748B] text-sm font-outfit uppercase tracking-wider mb-1">
                    Receita Total
                  </p>
                  <p className="text-[#0B1120] font-outfit text-4xl font-black">
                    {formatarReal(closer.receitaTotal)}
                  </p>
                  <p className="text-[#94A3B8] text-sm font-outfit mt-1">
                    {closer.contratosFechados} contratos
                  </p>
                </div>

                {/* Ícone */}
                {isOpen ? (
                  <ChevronUp className="w-8 h-8 text-[#64748B]" />
                ) : (
                  <ChevronDown className="w-8 h-8 text-[#64748B]" />
                )}
              </div>

            </div>
          </div>
        </CollapsibleTrigger>

        {/* CONTEÚDO EXPANDIDO */}
        <CollapsibleContent>
          <div className="px-8 pb-8 pt-4 border-t border-gray-200">
            
            {/* Grid de Métricas 2x4 */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              
              {/* Calls Realizadas */}
              <div className="bg-[#0066FF]/5 rounded-xl p-6 border border-[#0066FF]/20">
                <div className="flex items-center gap-3 mb-3">
                  <Phone className="w-6 h-6 text-[#0066FF]" />
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Calls Realizadas
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-4xl font-black">
                  {closer.callsRealizadas}
                </p>
              </div>

              {/* Calls Qualificadas */}
              <div className="bg-[#00E5CC]/5 rounded-xl p-6 border border-[#00E5CC]/20">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-[#00E5CC]" />
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Qualificadas
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-4xl font-black">
                  {closer.callsQualificadas}
                </p>
              </div>

              {/* Contratos Fechados */}
              <div className="bg-[#FFB800]/5 rounded-xl p-6 border border-[#FFB800]/20">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📝</span>
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Contratos
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-4xl font-black">
                  {closer.contratosFechados}
                </p>
              </div>

              {/* Taxa Conversão */}
              <div className="bg-[#0066FF]/5 rounded-xl p-6 border border-[#0066FF]/20">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-[#0066FF]" />
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Taxa Conversão
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-4xl font-black">
                  {closer.taxaConversao.toFixed(1)}%
                </p>
              </div>

              {/* Receita Total */}
              <div className="bg-[#00E5CC]/5 rounded-xl p-6 border border-[#00E5CC]/20">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-6 h-6 text-[#00E5CC]" />
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Receita Total
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-3xl font-black">
                  {formatarReal(closer.receitaTotal)}
                </p>
              </div>

              {/* Receita Assinada */}
              <div className="bg-[#FFB800]/5 rounded-xl p-6 border border-[#FFB800]/20">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">✍️</span>
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Assinada
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-3xl font-black">
                  {formatarReal(closer.receitaAssinada)}
                </p>
              </div>

              {/* Receita Paga */}
              <div className="bg-[#00E5CC]/5 rounded-xl p-6 border border-[#00E5CC]/20">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">💰</span>
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Paga
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-3xl font-black">
                  {formatarReal(closer.receitaPaga)}
                </p>
              </div>

              {/* Ticket Médio */}
              <div className="bg-[#0066FF]/5 rounded-xl p-6 border border-[#0066FF]/20">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🎯</span>
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Ticket Médio
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-3xl font-black">
                  {formatarReal(closer.ticketMedio)}
                </p>
              </div>

            </div>

            {/* Performance vs Benchmarks */}
            <div className="mb-8">
              <h4 className="text-[#0B1120] font-outfit text-xl font-bold mb-6">
                Performance vs Benchmarks
              </h4>
              
              <div className="space-y-4">
                {/* Receita vs Meta */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#64748B] text-sm font-outfit">
                      Receita vs Meta Individual ({formatarReal(metaIndividual)})
                    </span>
                    <span className="text-[#0B1120] text-sm font-outfit font-semibold">
                      {formatarReal(closer.receitaTotal)} ({((closer.receitaTotal / metaIndividual) * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <Progress 
                    value={(closer.receitaTotal / metaIndividual) * 100} 
                    className="h-3"
                    style={{ 
                      '--progress-background': getProgressColor(closer.receitaTotal, metaIndividual) 
                    } as any}
                  />
                </div>

                {/* Ticket Médio vs Meta */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#64748B] text-sm font-outfit">
                      Ticket Médio vs Meta (R$ 12.000)
                    </span>
                    <span className="text-[#0B1120] text-sm font-outfit font-semibold">
                      {formatarReal(closer.ticketMedio)}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((closer.ticketMedio / 12000) * 100, 100)} 
                    className="h-3"
                    style={{ 
                      '--progress-background': getProgressColor(closer.ticketMedio, 12000) 
                    } as any}
                  />
                </div>

                {/* Taxa Conversão vs Meta */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#64748B] text-sm font-outfit">
                      Taxa de Conversão vs Meta (25%)
                    </span>
                    <span className="text-[#0B1120] text-sm font-outfit font-semibold">
                      {closer.taxaConversao.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(closer.taxaConversao, 100)} 
                    className="h-3"
                    style={{ 
                      '--progress-background': getProgressColor(closer.taxaConversao, 25) 
                    } as any}
                  />
                </div>

                {/* Taxa Assinatura vs Meta */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#64748B] text-sm font-outfit">
                      Taxa de Assinatura vs Meta (90%)
                    </span>
                    <span className="text-[#0B1120] text-sm font-outfit font-semibold">
                      {closer.taxaAssinatura.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(closer.taxaAssinatura, 100)} 
                    className="h-3"
                    style={{ 
                      '--progress-background': getProgressColor(closer.taxaAssinatura, 90) 
                    } as any}
                  />
                </div>

                {/* Taxa Pagamento vs Meta */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#64748B] text-sm font-outfit">
                      Taxa de Pagamento vs Meta (95%)
                    </span>
                    <span className="text-[#0B1120] text-sm font-outfit font-semibold">
                      {closer.taxaPagamento.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(closer.taxaPagamento, 100)} 
                    className="h-3"
                    style={{ 
                      '--progress-background': getProgressColor(closer.taxaPagamento, 95) 
                    } as any}
                  />
                </div>
              </div>
            </div>

            {/* Lista de Contratos */}
            <div>
              <h4 className="text-[#0B1120] font-outfit text-xl font-bold mb-4">
                Contratos Fechados ({closer.contratos.length})
              </h4>
              
              <div className="space-y-3">
                {closer.contratos.length > 0 ? (
                  <TooltipProvider>
                    {closer.contratos.map((contrato, index) => (
                      <Tooltip key={index} delayDuration={200}>
                        <TooltipTrigger asChild>
                          <div 
                            className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:border-[#0066FF]/30 hover:shadow-md cursor-pointer"
                          >
                            {/* Header: Nome do cliente + Data */}
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-[#0B1120] font-outfit text-lg font-bold">
                                {contrato.nome}
                              </p>
                              <span className="text-[#64748B] text-sm font-outfit">
                                {contrato.data}
                              </span>
                            </div>

                            {/* Grid com informações do contrato */}
                            <div className="bg-white rounded-lg p-4 border border-[#0066FF]/20">
                              <div className="grid grid-cols-3 gap-4">
                                
                                {/* Valor do Contrato */}
                                <div>
                                  <p className="text-[#64748B] text-xs font-outfit uppercase tracking-wider mb-1">
                                    Valor
                                  </p>
                                  <p className="text-[#0B1120] font-outfit text-lg font-black">
                                    {formatarReal(contrato.valor)}
                                  </p>
                                </div>

                                {/* Status Assinatura */}
                                <div>
                                  <p className="text-[#64748B] text-xs font-outfit uppercase tracking-wider mb-1">
                                    Assinatura
                                  </p>
                                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                    contrato.assinado 
                                      ? 'bg-[#00E5CC]/20 text-[#00E5CC]' 
                                      : 'bg-[#FFB800]/20 text-[#FFB800]'
                                  }`}>
                                    {contrato.assinado ? '✓ Assinado' : 'Pendente'}
                                  </span>
                                </div>

                                {/* Status Pagamento */}
                                <div>
                                  <p className="text-[#64748B] text-xs font-outfit uppercase tracking-wider mb-1">
                                    Pagamento
                                  </p>
                                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                    contrato.pago 
                                      ? 'bg-[#00E5CC]/20 text-[#00E5CC]' 
                                      : 'bg-[#FF4757]/20 text-[#FF4757]'
                                  }`}>
                                    {contrato.pago ? '✓ Pago' : 'Pendente'}
                                  </span>
                                </div>

                              </div>
                            </div>
                          </div>
                        </TooltipTrigger>
                        
                        {/* Tooltip com observações */}
                        {contrato.observacoes && (
                          <TooltipContent 
                            side="top" 
                            className="max-w-md p-4 bg-[#0B1120] text-white border-[#0066FF]/30"
                          >
                            <div>
                              <p className="font-outfit text-xs uppercase tracking-wider text-[#94A3B8] mb-2">
                                Observações e Próximos Passos
                              </p>
                              <p className="font-outfit text-sm leading-relaxed">
                                {contrato.observacoes}
                              </p>
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                ) : (
                  <p className="text-[#94A3B8] text-center py-8">
                    Nenhum contrato fechado
                  </p>
                )}
              </div>
            </div>

          </div>
        </CollapsibleContent>

      </div>
    </Collapsible>
  );
};

export default CloserDetailCard;
