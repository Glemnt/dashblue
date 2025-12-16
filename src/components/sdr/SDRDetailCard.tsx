import { useState } from 'react';
import { ChevronDown, ChevronUp, Phone, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import { SDRMetrics } from '@/utils/sdrMetricsCalculator';
import { formatarReal } from '@/utils/metricsCalculator';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ColaboradorAvatar from '@/components/ColaboradorAvatar';
import { getProgressColorByValue } from '@/utils/progressColorUtils';

interface SDRDetailCardProps {
  sdr: SDRMetrics;
  data: any[];
  metaIndividualCalls: number;
  metaTaxaQualificacao?: number;
  metaTaxaShow?: number;
}

const SDRDetailCard = ({ sdr, data, metaIndividualCalls, metaTaxaQualificacao = 50, metaTaxaShow = 75 }: SDRDetailCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getProgressColor = (value: number, meta: number) => 
    getProgressColorByValue(value, meta, 'hex', 'performance');

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div 
        className="bg-white rounded-2xl border-l-8 hover:shadow-2xl transition-all duration-300 overflow-hidden"
        style={{ borderLeftColor: sdr.squadColor }}
      >
        
        <CollapsibleTrigger asChild>
          <div className="p-4 sm:p-6 md:p-8 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              
              <div className="flex items-center gap-6">
                <ColaboradorAvatar 
                  nome={sdr.nome}
                  emoji={sdr.emoji}
                  squadColor={sdr.squadColor}
                  size="md"
                />

                <div>
                  <h3 className="text-[#0B1120] font-outfit text-3xl font-bold mb-2">
                    {sdr.nome}
                  </h3>
                  <div 
                    className="inline-block px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wider"
                    style={{ backgroundColor: sdr.squadColor + '20', color: sdr.squadColor }}
                  >
                    {sdr.squad}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[#64748B] text-sm font-outfit uppercase tracking-wider mb-1">
                    Vendas Originadas
                  </p>
                  <p className="text-[#0B1120] font-outfit text-4xl font-black">
                    {formatarReal(sdr.vendasOriginadas)}
                  </p>
                  <p className="text-[#94A3B8] text-sm font-outfit mt-1">
                    {sdr.contratosOriginados} contratos
                  </p>
                </div>

                {isOpen ? (
                  <ChevronUp className="w-8 h-8 text-[#64748B]" />
                ) : (
                  <ChevronDown className="w-8 h-8 text-[#64748B]" />
                )}
              </div>

            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 sm:px-6 md:px-8 pb-6 md:pb-8 pt-4 border-t border-gray-200">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              
              <div className="bg-[#0066FF]/5 rounded-xl p-4 md:p-6 border border-[#0066FF]/20">
                <div className="flex items-center gap-3 mb-3">
                  <Phone className="w-6 h-6 text-[#0066FF]" />
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Total Calls
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-4xl font-black">
                  {sdr.totalCalls}
                </p>
                <p className="text-[#64748B] text-sm mt-1">
                  <span className="text-[#0066FF] font-semibold">R1: {sdr.callsR1}</span>
                  {' • '}
                  <span className="text-[#00E5CC] font-semibold">R2: {sdr.callsR2}</span>
                </p>
              </div>

              <div className="bg-[#0066FF]/5 rounded-xl p-4 md:p-6 border border-[#0066FF]/20">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">1️⃣</span>
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Calls R1
                  </p>
                </div>
                <p className="text-[#0066FF] font-outfit text-4xl font-black">
                  {sdr.callsR1}
                </p>
              </div>

              <div className="bg-[#00E5CC]/5 rounded-xl p-4 md:p-6 border border-[#00E5CC]/20">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">2️⃣</span>
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Calls R2
                  </p>
                </div>
                <p className="text-[#00E5CC] font-outfit text-4xl font-black">
                  {sdr.callsR2}
                </p>
              </div>

              <div className="bg-[#00E5CC]/5 rounded-xl p-4 md:p-6 border border-[#00E5CC]/20">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-[#00E5CC]" />
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Qualificadas
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-4xl font-black">
                  {sdr.callsQualificadas}
                </p>
              </div>

              <div className="bg-[#FFB800]/5 rounded-xl p-4 md:p-6 border border-[#FFB800]/20">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-[#FFB800]" />
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Taxa Qualif.
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-4xl font-black">
                  {sdr.taxaQualificacao.toFixed(1)}%
                </p>
              </div>

              <div className="bg-[#00E5CC]/5 rounded-xl p-4 md:p-6 border border-[#00E5CC]/20">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-6 h-6 text-[#00E5CC]" />
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Realizadas
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-4xl font-black">
                  {sdr.callsRealizadas}
                </p>
              </div>

              <div className="bg-[#FF4757]/5 rounded-xl p-4 md:p-6 border border-[#FF4757]/20">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🚫</span>
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    No-Shows
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-4xl font-black">
                  {sdr.noShows}
                </p>
              </div>

              <div className="bg-[#0066FF]/5 rounded-xl p-4 md:p-6 border border-[#0066FF]/20">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📊</span>
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Taxa Show
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-4xl font-black">
                  {sdr.taxaShow.toFixed(1)}%
                </p>
              </div>

            </div>

            <div className="mb-8">
              <h4 className="text-[#0B1120] font-outfit text-xl font-bold mb-6">
                Performance vs Meta Individual
              </h4>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#64748B] text-sm font-outfit">
                      Calls Realizadas vs Meta ({metaIndividualCalls})
                    </span>
                    <span className="text-[#0B1120] text-sm font-outfit font-semibold">
                      {sdr.totalCalls} / {metaIndividualCalls} ({((sdr.totalCalls / metaIndividualCalls) * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <Progress 
                    value={(sdr.totalCalls / metaIndividualCalls) * 100} 
                    className="h-3"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#64748B] text-sm font-outfit">
                      Taxa de Qualificação vs Meta ({metaTaxaQualificacao}%)
                    </span>
                    <span className="text-[#0B1120] text-sm font-outfit font-semibold">
                      {sdr.taxaQualificacao.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={(sdr.taxaQualificacao / metaTaxaQualificacao) * 100} 
                    className="h-3"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#64748B] text-sm font-outfit">
                      Taxa de Show vs Meta ({metaTaxaShow}%)
                    </span>
                    <span className="text-[#0B1120] text-sm font-outfit font-semibold">
                      {sdr.taxaShow.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={(sdr.taxaShow / metaTaxaShow) * 100} 
                    className="h-3"
                  />
                </div>
              </div>
            </div>

            {/* Seção de Contratos Fechados */}
            <div>
              <h4 className="text-[#0B1120] font-outfit text-xl font-bold mb-4">
                Contratos Fechados ({sdr.contratos?.length || 0})
              </h4>
              
              <div className="space-y-3">
                {sdr.contratos && sdr.contratos.length > 0 ? (
                  sdr.contratos.map((contrato, index) => (
                    <div 
                      key={index}
                      className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:border-[#00E5CC]/30 hover:shadow-md"
                    >
                      {/* Header: Nome do cliente + Data */}
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[#0B1120] font-outfit text-lg font-bold">
                          {contrato.nomeCall}
                        </p>
                        <span className="text-[#64748B] text-sm font-outfit">
                          {contrato.data}
                        </span>
                      </div>

                      {/* Info do Closer */}
                      <div className="mb-3">
                        <p className="text-[#64748B] text-xs font-outfit uppercase tracking-wider mb-1">
                          Fechado por
                        </p>
                        <p className="text-[#0B1120] font-outfit font-semibold">
                          {contrato.closer}
                        </p>
                      </div>

                      {/* Grid com informações do contrato */}
                      <div className="bg-white rounded-lg p-4 border border-[#00E5CC]/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                          
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
                  ))
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

export default SDRDetailCard;
