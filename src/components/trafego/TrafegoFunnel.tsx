import { TrafegoTotais, formatarMoeda, formatarNumero, formatarPercentual } from "@/utils/trafegoMetricsCalculator";

interface TrafegoFunnelProps {
  totais: TrafegoTotais;
  isTVMode?: boolean;
}

const TrafegoFunnel = ({ totais, isTVMode = false }: TrafegoFunnelProps) => {
  const etapas = [
    {
      icon: '💰',
      label: 'INVESTIMENTO',
      value: formatarMoeda(totais.investimento),
      detail: null,
      color: 'from-[#0066FF] to-[#0052CC]',
      width: '100%'
    },
    {
      icon: '📊',
      label: 'IMPRESSÕES',
      value: formatarNumero(totais.impressoes),
      detail: `CPM: ${formatarMoeda(totais.impressoes > 0 ? (totais.investimento / totais.impressoes) * 1000 : 0)}`,
      color: 'from-[#0066FF] to-[#00A3FF]',
      width: '95%',
      taxa: null
    },
    {
      icon: '👆',
      label: 'CLIQUES',
      value: formatarNumero(totais.cliques),
      detail: `CPC: ${formatarMoeda(totais.cpc)}`,
      color: 'from-[#00A3FF] to-[#00E5CC]',
      width: '85%',
      taxa: `${totais.ctr.toFixed(1)}% CTR`
    },
    {
      icon: '🎯',
      label: 'LEADS GERADOS',
      value: formatarNumero(totais.leads),
      detail: `CPL: ${formatarMoeda(totais.cpl)}`,
      color: 'from-[#00E5CC] to-[#00D4AA]',
      width: '70%',
      taxa: `${totais.cliques > 0 ? ((totais.leads / totais.cliques) * 100).toFixed(1) : 0}%`
    },
    {
      icon: '📞',
      label: 'CALLS AGENDADAS (MQLs)',
      value: formatarNumero(totais.callsAgendadas),
      detail: `Custo/MQL: ${formatarMoeda(totais.callsAgendadas > 0 ? totais.investimento / totais.callsAgendadas : 0)}`,
      color: 'from-[#00D4AA] to-[#10B981]',
      width: '50%',
      taxa: `${totais.leads > 0 ? ((totais.callsAgendadas / totais.leads) * 100).toFixed(1) : 0}%`
    },
    {
      icon: '🤝',
      label: 'CALLS REALIZADAS',
      value: formatarNumero(totais.callsRealizadas),
      detail: `Custo/Call Real.: ${formatarMoeda(totais.callsRealizadas > 0 ? totais.investimento / totais.callsRealizadas : 0)}`,
      color: 'from-[#10B981] to-[#FFB800]',
      width: '40%',
      taxa: `${totais.callsAgendadas > 0 ? ((totais.callsRealizadas / totais.callsAgendadas) * 100).toFixed(1) : 0}%`
    },
    {
      icon: '✅',
      label: 'CALLS QUALIFICADAS (SQL)',
      value: formatarNumero(totais.callsQualificadas),
      detail: `Custo/SQL: ${formatarMoeda(totais.callsQualificadas > 0 ? totais.investimento / totais.callsQualificadas : 0)}`,
      color: 'from-[#FFB800] to-[#F97316]',
      width: '35%',
      taxa: `${totais.callsRealizadas > 0 ? ((totais.callsQualificadas / totais.callsRealizadas) * 100).toFixed(1) : 0}%`
    },
    {
      icon: '🎉',
      label: 'FECHAMENTOS',
      value: `${totais.fechamentos}`,
      detail: `CAC: ${formatarMoeda(totais.cac)}`,
      color: 'from-[#F97316] to-[#FF8800]',
      width: '25%',
      taxa: `${totais.callsQualificadas > 0 ? ((totais.fechamentos / totais.callsQualificadas) * 100).toFixed(1) : 0}%`
    },
    {
      icon: '💰',
      label: 'RECEITA GERADA',
      value: formatarMoeda(totais.receita),
      detail: `ROAS: ${totais.roas.toFixed(2)}x | ROI: ${totais.roi.toFixed(0)}%`,
      color: 'from-[#FF8800] to-[#00E5CC]',
      width: '20%',
      taxa: null,
      highlight: true
    }
  ];

  return (
    <div className={`${isTVMode ? 'space-y-4' : 'space-y-3'}`}>
      {etapas.map((etapa, index) => (
        <div key={index} className="relative">
          {/* Taxa de conversão entre etapas */}
          {etapa.taxa && (
            <div className={`absolute ${isTVMode ? '-top-3 left-1/2' : '-top-2 left-1/2'} transform -translate-x-1/2 z-10`}>
              <span className={`bg-[#0B1120] text-[#00E5CC] font-bold px-3 py-1 rounded-full border border-[#00E5CC]/30 ${isTVMode ? 'text-base' : 'text-xs'}`}>
                ↓ {etapa.taxa}
              </span>
            </div>
          )}

          {/* Barra do funil */}
          <div 
            className="mx-auto transition-all duration-500"
            style={{ width: etapa.width }}
          >
            <div 
              className={`bg-gradient-to-r ${etapa.color} rounded-xl ${isTVMode ? 'py-6 px-8' : 'py-4 px-6'} ${etapa.highlight ? 'ring-2 ring-[#00E5CC] ring-offset-2 ring-offset-[#0B1120]' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`${isTVMode ? 'text-4xl' : 'text-2xl'}`}>{etapa.icon}</span>
                  <div>
                    <p className={`text-white/80 uppercase tracking-wider font-semibold ${isTVMode ? 'text-lg' : 'text-xs sm:text-sm'}`}>
                      {etapa.label}
                    </p>
                    <p className={`text-white font-black ${isTVMode ? 'text-3xl' : 'text-xl sm:text-2xl'}`}>
                      {etapa.value}
                    </p>
                  </div>
                </div>
                {etapa.detail && (
                  <div className="text-right">
                    <p className={`text-white/90 font-semibold ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                      {etapa.detail}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrafegoFunnel;
