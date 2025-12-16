import { TrafegoTotais, formatarMoeda, formatarNumero } from "@/utils/trafegoMetricsCalculator";

interface TrafegoFunnelProps {
  totais: TrafegoTotais;
  isTVMode?: boolean;
}

const TrafegoFunnel = ({ totais, isTVMode = false }: TrafegoFunnelProps) => {
  // Calcular percentuais relativos ao total de impressões (base do funil)
  const baseTotal = totais.impressoes || 1;
  
  const etapas = [
    {
      label: 'INVESTIMENTO',
      value: formatarMoeda(totais.investimento),
      detail: null,
      bgClass: 'bg-blue-vibrant',
      textClass: 'text-white',
      width: '100%',
      percentual: null,
      taxa: null
    },
    {
      label: 'IMPRESSÕES',
      value: formatarNumero(totais.impressoes),
      detail: `CPM: ${formatarMoeda(totais.impressoes > 0 ? (totais.investimento / totais.impressoes) * 1000 : 0)}`,
      bgClass: 'bg-blue-vibrant',
      textClass: 'text-white',
      width: '95%',
      percentual: '100',
      taxa: null
    },
    {
      label: 'CLIQUES',
      value: formatarNumero(totais.cliques),
      detail: `CPC: ${formatarMoeda(totais.cpc)}`,
      bgClass: 'bg-blue-vibrant/90',
      textClass: 'text-white',
      width: '85%',
      percentual: ((totais.cliques / baseTotal) * 100).toFixed(2),
      taxa: `${totais.ctr.toFixed(2)}% CTR`
    },
    {
      label: 'LEADS GERADOS',
      value: formatarNumero(totais.leads),
      detail: `CPL: ${formatarMoeda(totais.cpl)}`,
      bgClass: 'bg-blue-vibrant/80',
      textClass: 'text-white',
      width: '70%',
      percentual: ((totais.leads / baseTotal) * 100).toFixed(2),
      taxa: `${totais.cliques > 0 ? ((totais.leads / totais.cliques) * 100).toFixed(1) : 0}%`
    },
    {
      label: 'CALLS AGENDADAS (MQLs)',
      value: formatarNumero(totais.callsAgendadas),
      detail: `Custo/MQL: ${formatarMoeda(totais.callsAgendadas > 0 ? totais.investimento / totais.callsAgendadas : 0)}`,
      bgClass: 'bg-blue-vibrant/70',
      textClass: 'text-white',
      width: '55%',
      percentual: ((totais.callsAgendadas / baseTotal) * 100).toFixed(3),
      taxa: `${totais.leads > 0 ? ((totais.callsAgendadas / totais.leads) * 100).toFixed(1) : 0}%`
    },
    {
      label: 'CALLS REALIZADAS',
      value: formatarNumero(totais.callsRealizadas),
      detail: `Custo/Call: ${formatarMoeda(totais.callsRealizadas > 0 ? totais.investimento / totais.callsRealizadas : 0)}`,
      bgClass: 'bg-blue-vibrant/60',
      textClass: 'text-white',
      width: '45%',
      percentual: ((totais.callsRealizadas / baseTotal) * 100).toFixed(3),
      taxa: `${totais.callsAgendadas > 0 ? ((totais.callsRealizadas / totais.callsAgendadas) * 100).toFixed(1) : 0}%`
    },
    {
      label: 'CALLS QUALIFICADAS (SQL)',
      value: formatarNumero(totais.callsQualificadas),
      detail: `Custo/SQL: ${formatarMoeda(totais.callsQualificadas > 0 ? totais.investimento / totais.callsQualificadas : 0)}`,
      bgClass: 'bg-cyan-modern/90',
      textClass: 'text-navy-ultra-dark',
      width: '35%',
      percentual: ((totais.callsQualificadas / baseTotal) * 100).toFixed(4),
      taxa: `${totais.callsRealizadas > 0 ? ((totais.callsQualificadas / totais.callsRealizadas) * 100).toFixed(1) : 0}%`
    },
    {
      label: 'FECHAMENTOS',
      value: `${totais.fechamentos}`,
      detail: `CAC: ${formatarMoeda(totais.cac)}`,
      bgClass: 'bg-cyan-modern',
      textClass: 'text-navy-ultra-dark',
      width: '28%',
      percentual: ((totais.fechamentos / baseTotal) * 100).toFixed(4),
      taxa: `${totais.callsQualificadas > 0 ? ((totais.fechamentos / totais.callsQualificadas) * 100).toFixed(1) : 0}%`
    },
    {
      label: 'RECEITA GERADA',
      value: formatarMoeda(totais.receita),
      detail: `ROAS: ${totais.roas.toFixed(2)}x | ROI: ${totais.roi.toFixed(0)}%`,
      bgClass: 'bg-cyan-modern',
      textClass: 'text-navy-ultra-dark',
      width: '22%',
      percentual: null,
      taxa: null,
      highlight: true
    }
  ];

  return (
    <div className={`${isTVMode ? 'space-y-5' : 'space-y-4'}`}>
      {etapas.map((etapa, index) => (
        <div key={index} className="relative">
          {/* Taxa de conversão entre etapas */}
          {etapa.taxa && (
            <div className={`text-center ${isTVMode ? 'mb-3' : 'mb-2'}`}>
              <span className={`text-gray-muted font-medium ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                {etapa.taxa} ↓
              </span>
            </div>
          )}

          {/* Barra do funil */}
          <div 
            className="mx-auto transition-all duration-500"
            style={{ width: etapa.width }}
          >
            <div 
              className={`${etapa.bgClass} rounded-2xl ${isTVMode ? 'py-6 px-8' : 'py-5 px-6'} ${
                etapa.highlight ? 'ring-2 ring-cyan-modern/50 ring-offset-2 ring-offset-navy-ultra-dark' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${etapa.textClass}/70 uppercase tracking-widest font-semibold ${isTVMode ? 'text-base mb-2' : 'text-xs mb-1'}`}>
                    {etapa.label}
                  </p>
                  <p className={`${etapa.textClass} font-black ${isTVMode ? 'text-4xl' : 'text-2xl sm:text-3xl'}`}>
                    {etapa.value}
                  </p>
                  {etapa.detail && (
                    <p className={`${etapa.textClass}/60 font-medium ${isTVMode ? 'text-base mt-1' : 'text-sm mt-1'}`}>
                      {etapa.detail}
                    </p>
                  )}
                </div>
                {etapa.percentual && (
                  <div className="text-right">
                    <p className={`${etapa.textClass}/60 font-semibold ${isTVMode ? 'text-xl' : 'text-lg'}`}>
                      {etapa.percentual}%
                    </p>
                    <p className={`${etapa.textClass}/40 ${isTVMode ? 'text-sm' : 'text-xs'}`}>
                      do total
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
