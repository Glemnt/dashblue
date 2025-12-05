import { DollarSign, Users, UserCheck, Target, TrendingUp, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TrafegoTotais, METAS_TRAFEGO, formatarMoeda, formatarNumero, formatarPercentual } from "@/utils/trafegoMetricsCalculator";

interface TrafegoKPICardsProps {
  totais: TrafegoTotais;
  isTVMode?: boolean;
}

const TrafegoKPICards = ({ totais, isTVMode = false }: TrafegoKPICardsProps) => {
  const getRoasColor = (roas: number) => {
    if (roas >= 5) return 'text-[#10B981]';
    if (roas >= 3) return 'text-[#34D399]';
    if (roas >= 2) return 'text-[#FBBF24]';
    return 'text-[#EF4444]';
  };

  const getRoasLabel = (roas: number) => {
    if (roas >= 5) return { text: 'Excelente', color: 'bg-[#10B981]' };
    if (roas >= 3) return { text: 'Bom', color: 'bg-[#34D399]' };
    if (roas >= 2) return { text: 'Regular', color: 'bg-[#FBBF24]' };
    return { text: 'Atenção', color: 'bg-[#EF4444]' };
  };

  const cacDentroMeta = totais.cac <= METAS_TRAFEGO.cacMaximo;
  const taxaQualificacaoBoa = totais.taxaQualificacao >= 55;
  const investimentoDentro = totais.investimento <= METAS_TRAFEGO.investimentoMensal;

  const cards = [
    {
      icon: DollarSign,
      iconBg: 'bg-[#0066FF]/20',
      iconColor: 'text-[#0066FF]',
      title: 'INVESTIMENTO TOTAL',
      value: formatarMoeda(totais.investimento),
      valueColor: 'text-white',
      subtitle: `${((totais.investimento / METAS_TRAFEGO.investimentoMensal) * 100).toFixed(0)}% da meta mensal`,
      badge: investimentoDentro 
        ? { text: 'No Budget', color: 'bg-[#10B981]' }
        : { text: 'Atenção ao Budget', color: 'bg-[#FBBF24]' },
      trend: '+12% vs mês passado',
      trendUp: true
    },
    {
      icon: Users,
      iconBg: 'bg-[#00E5CC]/20',
      iconColor: 'text-[#00E5CC]',
      title: 'LEADS GERADOS',
      value: `${formatarNumero(totais.leads)} leads`,
      valueColor: 'text-white',
      subtitle: `Média: ${(totais.leads / 30).toFixed(1)} leads/dia`,
      badge: null,
      trend: '+18% vs mês passado',
      trendUp: true
    },
    {
      icon: UserCheck,
      iconBg: taxaQualificacaoBoa ? 'bg-[#10B981]/20' : 'bg-[#FBBF24]/20',
      iconColor: taxaQualificacaoBoa ? 'text-[#10B981]' : 'text-[#FBBF24]',
      title: 'LEADS QUALIFICADOS',
      value: `${formatarNumero(totais.leadsQualificados)} leads`,
      valueColor: 'text-white',
      subtitle: `Taxa de qualificação: ${formatarPercentual(totais.taxaQualificacao)}`,
      badge: taxaQualificacaoBoa
        ? { text: 'Excelente', color: 'bg-[#10B981]' }
        : totais.taxaQualificacao >= 40
          ? { text: 'Bom', color: 'bg-[#FBBF24]' }
          : { text: 'Baixa', color: 'bg-[#EF4444]' },
      trend: '+15% vs mês passado',
      trendUp: true
    },
    {
      icon: Target,
      iconBg: 'bg-[#FFB800]/20',
      iconColor: 'text-[#FFB800]',
      title: 'FECHAMENTOS',
      value: `${totais.fechamentos} contratos`,
      valueColor: 'text-white',
      subtitle: formatarMoeda(totais.receita) + ' em vendas',
      badge: null,
      trend: `Taxa de fechamento: ${((totais.fechamentos / totais.leadsQualificados) * 100).toFixed(1)}%`,
      trendUp: null,
      highlight: true
    },
    {
      icon: TrendingUp,
      iconBg: 'bg-[#0066FF]/20',
      iconColor: 'text-[#0066FF]',
      title: 'ROAS',
      value: `${totais.roas.toFixed(2)}x`,
      valueColor: getRoasColor(totais.roas),
      subtitle: `A cada R$ 1 investido retornou R$ ${totais.roas.toFixed(2)}`,
      badge: getRoasLabel(totais.roas),
      trend: null,
      trendUp: null,
      showThermometer: true
    },
    {
      icon: Wallet,
      iconBg: cacDentroMeta ? 'bg-[#10B981]/20' : 'bg-[#EF4444]/20',
      iconColor: cacDentroMeta ? 'text-[#10B981]' : 'text-[#EF4444]',
      title: 'CAC (Custo de Aquisição)',
      value: formatarMoeda(totais.cac),
      valueColor: cacDentroMeta ? 'text-[#10B981]' : 'text-[#EF4444]',
      subtitle: `Meta: ${formatarMoeda(METAS_TRAFEGO.cacMaximo)}`,
      badge: cacDentroMeta
        ? { text: 'Dentro da Meta ✅', color: 'bg-[#10B981]' }
        : { text: 'Acima da Meta ⚠️', color: 'bg-[#EF4444]' },
      trend: '-15% vs mês passado',
      trendUp: false
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${isTVMode ? 'gap-6' : 'gap-4 sm:gap-6'}`}>
      {cards.map((card, index) => (
        <div 
          key={index}
          className={`bg-[#151E35] rounded-2xl border ${card.highlight ? 'border-2 border-[#FFB800]' : 'border-white/10'} ${isTVMode ? 'p-8' : 'p-6'} transition-all hover:border-white/20`}
        >
          <div className={`flex items-start justify-between ${isTVMode ? 'mb-6' : 'mb-4'}`}>
            <div className={`${card.iconBg} rounded-2xl ${isTVMode ? 'p-5' : 'p-4'}`}>
              <card.icon className={`${card.iconColor} ${isTVMode ? 'w-10 h-10' : 'w-8 h-8'}`} />
            </div>
            {card.badge && (
              <Badge className={`${card.badge.color} text-white border-none ${isTVMode ? 'text-sm px-3 py-1' : 'text-xs'}`}>
                {card.badge.text}
              </Badge>
            )}
          </div>

          <h3 className={`text-[#94A3B8] uppercase tracking-wider font-semibold ${isTVMode ? 'text-base mb-3' : 'text-xs mb-2'}`}>
            {card.title}
          </h3>

          <p className={`${card.valueColor} font-black leading-tight ${isTVMode ? 'text-5xl mb-4' : 'text-3xl sm:text-4xl mb-3'}`}>
            {card.value}
          </p>

          <p className={`text-[#94A3B8] ${isTVMode ? 'text-lg mb-3' : 'text-sm mb-2'}`}>
            {card.subtitle}
          </p>

          {card.trend && (
            <p className={`font-semibold ${isTVMode ? 'text-base' : 'text-sm'} ${
              card.trendUp === true ? 'text-[#10B981]' : 
              card.trendUp === false ? 'text-[#10B981]' : 
              'text-[#94A3B8]'
            }`}>
              {card.trendUp === true && '↑ '}
              {card.trendUp === false && '↓ '}
              {card.trend}
            </p>
          )}

          {card.showThermometer && (
            <div className="mt-4">
              <div className="h-3 bg-[#0B1120] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    totais.roas >= 5 ? 'bg-[#10B981]' :
                    totais.roas >= 3 ? 'bg-[#34D399]' :
                    totais.roas >= 2 ? 'bg-[#FBBF24]' :
                    'bg-[#EF4444]'
                  }`}
                  style={{ width: `${Math.min((totais.roas / 10) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-[#64748B]">
                <span>0x</span>
                <span>5x</span>
                <span>10x</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TrafegoKPICards;
