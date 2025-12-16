import { useState } from 'react';
import { ChevronDown, ChevronUp, Phone, CheckCircle, TrendingUp, DollarSign, X } from 'lucide-react';
import { CloserMetrics, CallData } from '@/utils/closerMetricsCalculator';
import { formatarReal } from '@/utils/metricsCalculator';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ColaboradorAvatar from '@/components/ColaboradorAvatar';

interface CloserDetailCardProps {
  closer: CloserMetrics;
  metaIndividual: number;
  metaTicketMedio?: number;
  metaTaxaConversao?: number;
  metaTaxaAssinatura?: number;
  metaTaxaPagamento?: number;
}

type DetailView = 'none' | 'callsRealizadas' | 'qualificadas' | 'contratos' | 'assinada' | 'paga';

const CloserDetailCard = ({ 
  closer, 
  metaIndividual,
  metaTicketMedio = 4200,
  metaTaxaConversao = 28,
  metaTaxaAssinatura = 100,
  metaTaxaPagamento = 100
}: CloserDetailCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<DetailView>('none');

  const getProgressColor = (value: number, meta: number) => {
    const percentage = (value / meta) * 100;
    if (percentage >= 90) return '#00E5CC';
    if (percentage >= 70) return '#FFB800';
    return '#FF4757';
  };

  const toggleView = (view: DetailView) => {
    setSelectedView(selectedView === view ? 'none' : view);
  };

  const getCardClasses = (view: DetailView) => {
    const isSelected = selectedView === view;
    return `rounded-xl p-6 border cursor-pointer transition-all hover:shadow-md ${
      isSelected 
        ? 'ring-2 ring-offset-2' 
        : 'hover:scale-[1.02]'
    }`;
  };

  const contratosAssinados = closer.contratos.filter(c => c.assinado);
  const contratosPagos = closer.contratos.filter(c => c.pago);

  const renderCallItem = (call: CallData, index: number) => (
    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[#0B1120] font-outfit font-semibold">{call.nomeCall}</p>
        <span className="text-[#64748B] text-sm">{call.data}</span>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {call.sdr && (
          <span className="bg-[#0066FF]/10 text-[#0066FF] px-2 py-1 rounded-full">
            SDR: {call.sdr}
          </span>
        )}
        {call.tipoCall && (
          <span className="bg-[#FFB800]/10 text-[#FFB800] px-2 py-1 rounded-full">
            {call.tipoCall}
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
        <p className="text-[#0B1120] font-outfit font-semibold">{contrato.nome}</p>
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
    </div>
  );

  const renderDetailPanel = () => {
    if (selectedView === 'none') return null;

    let title = '';
    let items: React.ReactNode[] = [];

    switch (selectedView) {
      case 'callsRealizadas':
        title = `Calls Realizadas (${closer.callsRealizadasData?.length || 0})`;
        items = (closer.callsRealizadasData || []).map((call, i) => renderCallItem(call, i));
        break;
      case 'qualificadas':
        title = `Calls Qualificadas (${closer.callsQualificadasData?.length || 0})`;
        items = (closer.callsQualificadasData || []).map((call, i) => renderCallItem(call, i));
        break;
      case 'contratos':
        title = `Contratos Fechados (${closer.contratos.length})`;
        items = closer.contratos.map((c, i) => renderContratoItem(c, i));
        break;
      case 'assinada':
        title = `Contratos Assinados (${contratosAssinados.length})`;
        items = contratosAssinados.map((c, i) => renderContratoItem(c, i));
        break;
      case 'paga':
        title = `Contratos Pagos (${contratosPagos.length})`;
        items = contratosPagos.map((c, i) => renderContratoItem(c, i));
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
        style={{ borderLeftColor: closer.squadColor }}
      >
        
        {/* HEADER */}
        <CollapsibleTrigger asChild>
          <div className="p-8 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              
              <div className="flex items-center gap-6">
                <ColaboradorAvatar 
                  nome={closer.nome}
                  emoji={closer.emoji}
                  squadColor={closer.squadColor}
                  size="md"
                />

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
            
            {/* Grid de Métricas 2x4 - Cards Clicáveis */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              
              {/* Calls Realizadas - CLICÁVEL */}
              <div 
                onClick={() => toggleView('callsRealizadas')}
                className={`${getCardClasses('callsRealizadas')} bg-[#0066FF]/5 border-[#0066FF]/20 ${
                  selectedView === 'callsRealizadas' ? 'ring-[#0066FF]' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Phone className="w-6 h-6 text-[#0066FF]" />
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Calls Realizadas
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-4xl font-black">
                  {closer.callsRealizadas}
                </p>
                <p className="text-[#0066FF] text-xs mt-2 font-medium">Clique para ver detalhes</p>
              </div>

              {/* Calls Qualificadas - CLICÁVEL */}
              <div 
                onClick={() => toggleView('qualificadas')}
                className={`${getCardClasses('qualificadas')} bg-[#00E5CC]/5 border-[#00E5CC]/20 ${
                  selectedView === 'qualificadas' ? 'ring-[#00E5CC]' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-[#00E5CC]" />
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Qualificadas
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-4xl font-black">
                  {closer.callsQualificadas}
                </p>
                <p className="text-[#00E5CC] text-xs mt-2 font-medium">Clique para ver detalhes</p>
              </div>

              {/* Contratos Fechados - CLICÁVEL */}
              <div 
                onClick={() => toggleView('contratos')}
                className={`${getCardClasses('contratos')} bg-[#FFB800]/5 border-[#FFB800]/20 ${
                  selectedView === 'contratos' ? 'ring-[#FFB800]' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📝</span>
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Contratos
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-4xl font-black">
                  {closer.contratosFechados}
                </p>
                <p className="text-[#FFB800] text-xs mt-2 font-medium">Clique para ver detalhes</p>
              </div>

              {/* Taxa Conversão - NÃO CLICÁVEL */}
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

              {/* Receita Total - NÃO CLICÁVEL */}
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

              {/* Receita Assinada - CLICÁVEL */}
              <div 
                onClick={() => toggleView('assinada')}
                className={`${getCardClasses('assinada')} bg-[#FFB800]/5 border-[#FFB800]/20 ${
                  selectedView === 'assinada' ? 'ring-[#FFB800]' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">✍️</span>
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Assinada
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-3xl font-black">
                  {formatarReal(closer.receitaAssinada)}
                </p>
                <p className="text-[#FFB800] text-xs mt-2 font-medium">Clique para ver detalhes</p>
              </div>

              {/* Receita Paga - CLICÁVEL */}
              <div 
                onClick={() => toggleView('paga')}
                className={`${getCardClasses('paga')} bg-[#00E5CC]/5 border-[#00E5CC]/20 ${
                  selectedView === 'paga' ? 'ring-[#00E5CC]' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">💰</span>
                  <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                    Paga
                  </p>
                </div>
                <p className="text-[#0B1120] font-outfit text-3xl font-black">
                  {formatarReal(closer.receitaPaga)}
                </p>
                <p className="text-[#00E5CC] text-xs mt-2 font-medium">Clique para ver detalhes</p>
              </div>

              {/* Ticket Médio - NÃO CLICÁVEL */}
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

            {/* Painel de Detalhes */}
            {renderDetailPanel()}

            {/* Performance vs Benchmarks */}
            <div className="mb-8 mt-8">
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
                      Ticket Médio vs Meta ({formatarReal(metaTicketMedio)})
                    </span>
                    <span className="text-[#0B1120] text-sm font-outfit font-semibold">
                      {formatarReal(closer.ticketMedio)}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((closer.ticketMedio / metaTicketMedio) * 100, 100)} 
                    className="h-3"
                    style={{ 
                      '--progress-background': getProgressColor(closer.ticketMedio, metaTicketMedio) 
                    } as any}
                  />
                </div>

                {/* Taxa Conversão vs Meta */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#64748B] text-sm font-outfit">
                      Taxa de Conversão vs Meta ({metaTaxaConversao}%)
                    </span>
                    <span className="text-[#0B1120] text-sm font-outfit font-semibold">
                      {closer.taxaConversao.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((closer.taxaConversao / metaTaxaConversao) * 100, 100)} 
                    className="h-3"
                    style={{ 
                      '--progress-background': getProgressColor(closer.taxaConversao, metaTaxaConversao) 
                    } as any}
                  />
                </div>

                {/* Taxa Assinatura vs Meta */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#64748B] text-sm font-outfit">
                      Taxa de Assinatura vs Meta ({metaTaxaAssinatura}%)
                    </span>
                    <span className="text-[#0B1120] text-sm font-outfit font-semibold">
                      {closer.taxaAssinatura.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((closer.taxaAssinatura / metaTaxaAssinatura) * 100, 100)} 
                    className="h-3"
                    style={{ 
                      '--progress-background': getProgressColor(closer.taxaAssinatura, metaTaxaAssinatura) 
                    } as any}
                  />
                </div>

                {/* Taxa Pagamento vs Meta */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#64748B] text-sm font-outfit">
                      Taxa de Pagamento vs Meta ({metaTaxaPagamento}%)
                    </span>
                    <span className="text-[#0B1120] text-sm font-outfit font-semibold">
                      {closer.taxaPagamento.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((closer.taxaPagamento / metaTaxaPagamento) * 100, 100)} 
                    className="h-3"
                    style={{ 
                      '--progress-background': getProgressColor(closer.taxaPagamento, metaTaxaPagamento) 
                    } as any}
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

export default CloserDetailCard;
