import { useState } from 'react';
import { ChevronDown, ChevronUp, Phone, CheckCircle, Calendar, TrendingUp, X } from 'lucide-react';
import { SDRMetrics, SDRCallData } from '@/utils/sdrMetricsCalculator';
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
  metaIndividualVendas?: number;
}

type DetailView = 'none' | 'agendadas' | 'realizadas' | 'qualificadas' | 'contratos' | 'noshows';

const SDRDetailCard = ({ sdr, data, metaIndividualCalls, metaTaxaQualificacao = 50, metaTaxaShow = 75, metaIndividualVendas = 150000 }: SDRDetailCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<DetailView>('none');

  const getProgressColor = (value: number, meta: number) => 
    getProgressColorByValue(value, meta, 'hex', 'performance');

  const toggleView = (view: DetailView) => {
    setSelectedView(selectedView === view ? 'none' : view);
  };

  const getCardClasses = (view: DetailView) => {
    const isSelected = selectedView === view;
    return `rounded-xl p-4 md:p-6 border cursor-pointer transition-all hover:shadow-md ${
      isSelected 
        ? 'ring-2 ring-offset-2' 
        : 'hover:scale-[1.02]'
    }`;
  };

  const renderCallItem = (call: SDRCallData, index: number) => (
    <div key={index} className={`rounded-lg p-4 border ${
      call.noShow ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[#0B1120] font-outfit font-semibold">{call.nomeCall}</p>
        <span className="text-[#64748B] text-sm">{call.data}</span>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {call.closer && (
          <span className="bg-[#0066FF]/10 text-[#0066FF] px-2 py-1 rounded-full">
            Closer: {call.closer}
          </span>
        )}
        {call.tipoCall && call.tipoCall !== '-' && (
          <span className="bg-[#FFB800]/10 text-[#FFB800] px-2 py-1 rounded-full">
            {call.tipoCall}
          </span>
        )}
        {call.noShow && (
          <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
            🚫 No-Show
          </span>
        )}
        {call.qualificada && (
          <span className="bg-[#00E5CC]/10 text-[#00E5CC] px-2 py-1 rounded-full">
            ✓ Qualificada
          </span>
        )}
        {call.valor > 0 && (
          <span className="bg-[#00E5CC]/10 text-[#00E5CC] px-2 py-1 rounded-full">
            {formatarReal(call.valor)}
          </span>
        )}
      </div>
    </div>
  );

  const renderContratoItem = (contrato: any, index: number) => (
    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[#0B1120] font-outfit font-semibold">{contrato.nomeCall}</p>
        <span className="text-[#64748B] text-sm">{contrato.data}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[#0B1120] font-outfit font-bold">{formatarReal(contrato.valor)}</span>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            contrato.assinado ? 'bg-[#00E5CC]/20 text-[#00E5CC]' : 'bg-[#FFB800]/20 text-[#FFB800]'
          }`}>
            {contrato.assinado ? '✓ Assinado' : 'Pendente'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            contrato.pago ? 'bg-[#00E5CC]/20 text-[#00E5CC]' : 'bg-[#FF4757]/20 text-[#FF4757]'
          }`}>
            {contrato.pago ? '✓ Pago' : 'Pendente'}
          </span>
        </div>
      </div>
      {contrato.closer && (
        <p className="text-[#64748B] text-xs mt-2">Fechado por: {contrato.closer}</p>
      )}
    </div>
  );

  const renderDetailPanel = () => {
    if (selectedView === 'none') return null;

    let title = '';
    let items: React.ReactNode[] = [];

    switch (selectedView) {
      case 'agendadas':
        title = `Calls Agendadas (${sdr.callsAgendadasData?.length || 0})`;
        items = (sdr.callsAgendadasData || []).map((call, i) => renderCallItem(call, i));
        break;
      case 'realizadas':
        title = `Calls Realizadas (${sdr.callsRealizadasData?.length || 0})`;
        items = (sdr.callsRealizadasData || []).map((call, i) => renderCallItem(call, i));
        break;
      case 'qualificadas':
        title = `Calls Qualificadas (${sdr.callsQualificadasData?.length || 0})`;
        items = (sdr.callsQualificadasData || []).map((call, i) => renderCallItem(call, i));
        break;
      case 'contratos':
        title = `Contratos Fechados (${sdr.contratos?.length || 0})`;
        items = (sdr.contratos || []).map((c, i) => renderContratoItem(c, i));
        break;
      case 'noshows':
        const noShowCalls = (sdr.callsAgendadasData || []).filter(c => c.noShow);
        title = `No-Shows (${noShowCalls.length})`;
        items = noShowCalls.map((call, i) => renderCallItem(call, i));
        break;
    }

    return (
      <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-[#0B1120] font-outfit text-lg font-bold">{title}</h4>
          <button 
            onClick={() => setSelectedView('none')}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#64748B]" />
          </button>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {items.length > 0 ? items : (
            <p className="text-[#64748B] text-center py-4">Nenhum item encontrado</p>
          )}
        </div>
      </div>
    );
  };

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
            
            {/* Grid de Métricas - Cards Clicáveis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              
              {/* Total Calls - CLICÁVEL */}
              <div 
                onClick={() => toggleView('agendadas')}
                className={`${getCardClasses('agendadas')} bg-[#0066FF]/5 border-[#0066FF]/20 ${
                  selectedView === 'agendadas' ? 'ring-[#0066FF]' : ''
                }`}
              >
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
                <p className="text-[#0066FF] text-xs mt-2 font-medium">Clique para ver detalhes</p>
              </div>

              {/* Realizadas - CLICÁVEL */}
              <div 
                onClick={() => toggleView('realizadas')}
                className={`${getCardClasses('realizadas')} bg-[#00E5CC]/5 border-[#00E5CC]/20 ${
                  selectedView === 'realizadas' ? 'ring-[#00E5CC]' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-6 h-6 text-[#00E5CC]" />
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Realizadas
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-4xl font-black">
                  {sdr.callsRealizadas}
                </p>
                <p className="text-[#00E5CC] text-xs mt-2 font-medium">Clique para ver detalhes</p>
              </div>

              {/* Qualificadas - CLICÁVEL */}
              <div 
                onClick={() => toggleView('qualificadas')}
                className={`${getCardClasses('qualificadas')} bg-[#FFB800]/5 border-[#FFB800]/20 ${
                  selectedView === 'qualificadas' ? 'ring-[#FFB800]' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-[#FFB800]" />
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Qualificadas
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-4xl font-black">
                  {sdr.callsQualificadas}
                </p>
                <p className="text-[#FFB800] text-xs mt-2 font-medium">Clique para ver detalhes</p>
              </div>

              {/* Contratos - CLICÁVEL */}
              <div 
                onClick={() => toggleView('contratos')}
                className={`${getCardClasses('contratos')} bg-[#00E5CC]/5 border-[#00E5CC]/20 ${
                  selectedView === 'contratos' ? 'ring-[#00E5CC]' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📝</span>
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Contratos
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-4xl font-black">
                  {sdr.contratosOriginados}
                </p>
                <p className="text-[#00E5CC] text-xs mt-2 font-medium">Clique para ver detalhes</p>
              </div>

            </div>

            {/* Métricas de Taxa - Não clicáveis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
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

              <div 
                onClick={() => toggleView('noshows')}
                className={`${getCardClasses('noshows')} bg-[#FF4757]/5 border-[#FF4757]/20 ${
                  selectedView === 'noshows' ? 'ring-[#FF4757]' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🚫</span>
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    No-Shows
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-4xl font-black">
                  {sdr.noShows}
                </p>
                <p className="text-[#FF4757] text-xs mt-2 font-medium">Clique para ver detalhes</p>
              </div>
            </div>

            {/* Painel de Detalhes */}
            {renderDetailPanel()}

            {/* Performance vs Meta Individual */}
            <div className="mb-8 mt-8">
              <h4 className="text-[#0B1120] font-outfit text-xl font-bold mb-6">
                Performance vs Meta Individual
              </h4>
              
              <div className="space-y-4">
                {/* Vendas Originadas vs Meta do Squad */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#64748B] text-sm font-outfit">
                      Vendas Originadas vs Meta ({formatarReal(metaIndividualVendas)})
                    </span>
                    <span className="text-[#0B1120] text-sm font-outfit font-semibold">
                      {formatarReal(sdr.vendasOriginadas)} ({((sdr.vendasOriginadas / metaIndividualVendas) * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <Progress 
                    value={(sdr.vendasOriginadas / metaIndividualVendas) * 100} 
                    className="h-3"
                  />
                </div>

                {/* Calls Realizadas vs Meta */}
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

          </div>
        </CollapsibleContent>

      </div>
    </Collapsible>
  );
};

export default SDRDetailCard;
