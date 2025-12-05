import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp } from "lucide-react";
import { formatarMoeda, formatarMoedaCompacta, formatarNumero } from "@/utils/trafegoMetricsCalculator";

interface TrafegoComparativoProps {
  isTVMode?: boolean;
}

const TrafegoComparativo = ({ isTVMode = false }: TrafegoComparativoProps) => {
  // Mock data for comparison
  const comparacao = {
    investimento: { anterior: 35000, atual: 39000 },
    leads: { anterior: 488, atual: 576, projetado: 738 },
    leadsQualificados: { anterior: 268, atual: 342 },
    fechamentos: { anterior: 18, atual: 23 },
    receita: { anterior: 238000, atual: 285000 },
    roas: { anterior: 6.8, atual: 7.31 },
    cac: { anterior: 1142, atual: 987 }
  };

  const calcVariacao = (anterior: number, atual: number) => {
    if (anterior === 0) return 0;
    return ((atual - anterior) / anterior) * 100;
  };

  const metrics = [
    {
      label: 'INVESTIMENTO',
      anterior: formatarMoedaCompacta(comparacao.investimento.anterior),
      atual: formatarMoedaCompacta(comparacao.investimento.atual),
      variacao: calcVariacao(comparacao.investimento.anterior, comparacao.investimento.atual),
      diferenca: formatarMoedaCompacta(comparacao.investimento.atual - comparacao.investimento.anterior),
      positivo: true // For investment, neutral
    },
    {
      label: 'LEADS GERADOS',
      anterior: formatarNumero(comparacao.leads.anterior),
      atual: `${formatarNumero(comparacao.leads.atual)} (projetado: ${formatarNumero(comparacao.leads.projetado)})`,
      variacao: calcVariacao(comparacao.leads.anterior, comparacao.leads.atual),
      diferenca: `+${comparacao.leads.atual - comparacao.leads.anterior} leads`,
      positivo: true
    },
    {
      label: 'ROAS',
      anterior: `${comparacao.roas.anterior.toFixed(1)}x`,
      atual: `${comparacao.roas.atual.toFixed(2)}x`,
      variacao: calcVariacao(comparacao.roas.anterior, comparacao.roas.atual),
      diferenca: 'melhor eficiência',
      positivo: true
    },
    {
      label: 'CAC',
      anterior: formatarMoeda(comparacao.cac.anterior),
      atual: formatarMoeda(comparacao.cac.atual),
      variacao: calcVariacao(comparacao.cac.anterior, comparacao.cac.atual),
      diferenca: `economia de ${formatarMoeda(comparacao.cac.anterior - comparacao.cac.atual)}`,
      positivo: comparacao.cac.atual < comparacao.cac.anterior // Lower is better for CAC
    },
    {
      label: 'RECEITA GERADA',
      anterior: formatarMoedaCompacta(comparacao.receita.anterior),
      atual: formatarMoedaCompacta(comparacao.receita.atual),
      variacao: calcVariacao(comparacao.receita.anterior, comparacao.receita.atual),
      diferenca: formatarMoedaCompacta(comparacao.receita.atual - comparacao.receita.anterior),
      positivo: true
    }
  ];

  const TrendIcon = ({ variacao, positivo, inverted = false }: { variacao: number; positivo: boolean; inverted?: boolean }) => {
    const isGood = inverted ? variacao < 0 : variacao > 0;
    if (Math.abs(variacao) < 1) {
      return <Minus className={`w-5 h-5 text-[#94A3B8]`} />;
    }
    if (isGood) {
      return <ArrowUpRight className={`w-5 h-5 ${positivo ? 'text-[#10B981]' : 'text-[#EF4444]'}`} />;
    }
    return <ArrowDownRight className={`w-5 h-5 ${positivo ? 'text-[#10B981]' : 'text-[#EF4444]'}`} />;
  };

  return (
    <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-10' : 'p-6'}`}>
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-[#0066FF]/20 rounded-xl p-3">
          <TrendingUp className={`text-[#0066FF] ${isTVMode ? 'w-10 h-10' : 'w-8 h-8'}`} />
        </div>
        <div>
          <h3 className={`text-white font-black ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
            📊 Comparação: Outubro vs Setembro
          </h3>
          <p className={`text-[#94A3B8] ${isTVMode ? 'text-lg' : 'text-sm'}`}>
            Análise de evolução mês a mês
          </p>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${isTVMode ? 'gap-6' : 'gap-4'}`}>
        {metrics.map((metric, i) => {
          const isCac = metric.label === 'CAC';
          const variacaoColor = isCac 
            ? (metric.variacao < 0 ? 'text-[#10B981]' : 'text-[#EF4444]')
            : (metric.variacao > 0 ? 'text-[#10B981]' : metric.variacao < 0 ? 'text-[#EF4444]' : 'text-[#94A3B8]');
          
          return (
            <div key={i} className={`bg-[#0B1120] rounded-xl ${isTVMode ? 'p-6' : 'p-4'}`}>
              <p className={`text-[#94A3B8] font-semibold uppercase tracking-wider mb-4 ${isTVMode ? 'text-base' : 'text-xs'}`}>
                {metric.label}
              </p>
              
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[#64748B] ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                  Setembro:
                </span>
                <span className={`text-white ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                  {metric.anterior}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-[#64748B] ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                  Outubro:
                </span>
                <span className={`text-white font-bold ${isTVMode ? 'text-xl' : 'text-base'}`}>
                  {metric.atual}
                </span>
              </div>

              <div className={`flex items-center gap-2 pt-3 border-t border-white/10`}>
                <TrendIcon variacao={metric.variacao} positivo={metric.positivo} inverted={isCac} />
                <span className={`font-bold ${variacaoColor} ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                  {metric.variacao > 0 ? '↑' : metric.variacao < 0 ? '↓' : ''} {Math.abs(metric.variacao).toFixed(1)}%
                </span>
                <span className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-xs'}`}>
                  ({metric.diferenca})
                </span>
              </div>
            </div>
          );
        })}

        {/* Insight Card */}
        <div className={`bg-gradient-to-br from-[#00E5CC]/20 to-[#0066FF]/10 rounded-xl border border-[#00E5CC]/30 ${isTVMode ? 'p-6' : 'p-4'}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className={`${isTVMode ? 'text-3xl' : 'text-2xl'}`}>💡</span>
            <p className={`text-white font-bold ${isTVMode ? 'text-lg' : 'text-base'}`}>
              INSIGHT
            </p>
          </div>
          <p className={`text-[#94A3B8] ${isTVMode ? 'text-lg' : 'text-sm'}`}>
            Outubro está sendo <span className="text-[#00E5CC] font-bold">19,7% mais rentável</span> que Setembro com apenas <span className="text-[#FFB800] font-bold">11% mais investimento</span>!
          </p>
          <p className={`text-[#94A3B8] mt-3 ${isTVMode ? 'text-base' : 'text-sm'}`}>
            🎯 Eficiência do investimento melhorou significativamente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrafegoComparativo;
