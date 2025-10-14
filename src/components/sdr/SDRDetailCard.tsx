import { useState } from 'react';
import { ChevronDown, ChevronUp, Phone, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import { SDRMetrics } from '@/utils/sdrMetricsCalculator';
import { formatarReal } from '@/utils/metricsCalculator';
import { getRecentActivities } from '@/utils/sdrActivityUtils';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SDRDetailCardProps {
  sdr: SDRMetrics;
  data: any[];
  metaIndividualCalls: number;
}

const SDRDetailCard = ({ sdr, data, metaIndividualCalls }: SDRDetailCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const recentActivities = getRecentActivities(data, sdr.nomeOriginal, 5);

  const getProgressColor = (value: number, meta: number) => {
    const percentage = (value / meta) * 100;
    if (percentage >= 90) return '#00E5CC';
    if (percentage >= 70) return '#FFB800';
    return '#FF4757';
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div 
        className="bg-white rounded-2xl border-l-8 hover:shadow-2xl transition-all duration-300 overflow-hidden"
        style={{ borderLeftColor: sdr.squadColor }}
      >
        
        <CollapsibleTrigger asChild>
          <div className="p-8 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              
              <div className="flex items-center gap-6">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl border-4 border-white shadow-lg"
                  style={{ backgroundColor: sdr.squadColor }}
                >
                  {sdr.emoji}
                </div>

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
          <div className="px-8 pb-8 pt-4 border-t border-gray-200">
            
            <div className="grid grid-cols-3 gap-6 mb-8">
              
              <div className="bg-[#0066FF]/5 rounded-xl p-6 border border-[#0066FF]/20">
                <div className="flex items-center gap-3 mb-3">
                  <Phone className="w-6 h-6 text-[#0066FF]" />
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Total Calls
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-4xl font-black">
                  {sdr.totalCalls}
                </p>
              </div>

              <div className="bg-[#00E5CC]/5 rounded-xl p-6 border border-[#00E5CC]/20">
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

              <div className="bg-[#FFB800]/5 rounded-xl p-6 border border-[#FFB800]/20">
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

              <div className="bg-[#00E5CC]/5 rounded-xl p-6 border border-[#00E5CC]/20">
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

              <div className="bg-[#FF4757]/5 rounded-xl p-6 border border-[#FF4757]/20">
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

              <div className="bg-[#0066FF]/5 rounded-xl p-6 border border-[#0066FF]/20">
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
                      Taxa de Qualificação vs Meta (35%)
                    </span>
                    <span className="text-[#0B1120] text-sm font-outfit font-semibold">
                      {sdr.taxaQualificacao.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(sdr.taxaQualificacao, 100)} 
                    className="h-3"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#64748B] text-sm font-outfit">
                      Taxa de Show vs Meta (75%)
                    </span>
                    <span className="text-[#0B1120] text-sm font-outfit font-semibold">
                      {sdr.taxaShow.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(sdr.taxaShow, 100)} 
                    className="h-3"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[#0B1120] font-outfit text-xl font-bold mb-4">
                Últimas 5 Atividades
              </h4>
              
              <div className="space-y-2">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-3 h-3 rounded-full ${activity.qualificada ? 'bg-[#00E5CC]' : 'bg-[#94A3B8]'}`} />
                        <div>
                          <p className="text-[#0B1120] font-outfit font-semibold">
                            {activity.empresa}
                          </p>
                          <p className="text-[#64748B] text-sm font-outfit">
                            {activity.data}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#0B1120] text-sm font-outfit font-semibold">
                          {activity.status}
                        </p>
                        <p className="text-[#64748B] text-xs font-outfit">
                          {activity.closer}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[#94A3B8] text-center py-8">
                    Nenhuma atividade registrada
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
