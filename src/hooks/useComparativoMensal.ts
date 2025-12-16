import { useMemo } from 'react';
import { usePeriodFilter } from '@/contexts/PeriodFilterContext';
import { useRealFinancials } from '@/hooks/useRealFinancials';
import { useMetaCampaigns } from '@/hooks/useMetaCampaigns';
import { getPreviousMonthKey, getMonthLabel, getDateRangeFromMonthKey } from '@/utils/dateFilters';

export interface ComparativoMetrica {
  label: string;
  anterior: string;
  atual: string;
  variacao: number;
  diferenca: string;
  positivo: boolean;
  invertido?: boolean; // Para métricas onde menor é melhor (CAC)
}

export interface ComparativoData {
  mesAtual: string;
  mesAnterior: string | null;
  metricas: ComparativoMetrica[];
  insight: string;
  loading: boolean;
  temComparativo: boolean;
}

const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
};

const formatarMoedaCompacta = (valor: number): string => {
  if (valor >= 1000000) {
    return `R$ ${(valor / 1000000).toFixed(1)}M`;
  }
  if (valor >= 1000) {
    return `R$ ${(valor / 1000).toFixed(0)}k`;
  }
  return formatarMoeda(valor);
};

const formatarNumero = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR').format(Math.round(valor));
};

const calcVariacao = (anterior: number, atual: number): number => {
  if (anterior === 0) return atual > 0 ? 100 : 0;
  return ((atual - anterior) / anterior) * 100;
};

export const useComparativoMensal = (): ComparativoData => {
  const { selectedMonthKey, dateRange } = usePeriodFilter();
  
  // Mês anterior
  const previousMonthKey = getPreviousMonthKey(selectedMonthKey);
  const previousDateRange = previousMonthKey ? getDateRangeFromMonthKey(previousMonthKey) : null;
  
  // Dados do mês atual
  const currentFinancials = useRealFinancials(selectedMonthKey);
  const currentCampaigns = useMetaCampaigns(dateRange, selectedMonthKey, currentFinancials);
  
  // Dados do mês anterior
  const previousFinancials = useRealFinancials(previousMonthKey || undefined);
  const previousCampaigns = useMetaCampaigns(
    previousDateRange || dateRange, 
    previousMonthKey || selectedMonthKey,
    previousFinancials
  );
  
  const comparativoData = useMemo((): ComparativoData => {
    const mesAtualLabel = getMonthLabel(selectedMonthKey);
    const mesAnteriorLabel = previousMonthKey ? getMonthLabel(previousMonthKey) : null;
    
    const loading = currentCampaigns.loading || previousCampaigns.loading || 
                    currentFinancials.loading || previousFinancials.loading;
    
    if (!previousMonthKey || loading) {
      return {
        mesAtual: mesAtualLabel,
        mesAnterior: mesAnteriorLabel,
        metricas: [],
        insight: '',
        loading,
        temComparativo: false
      };
    }
    
    // Dados atuais
    const investimentoAtual = currentCampaigns.totais.investimento;
    const leadsAtual = currentCampaigns.totais.leads;
    const roasAtual = currentCampaigns.totais.roas;
    const cacAtual = currentCampaigns.totais.cac;
    const receitaAtual = currentCampaigns.totais.receita;
    
    // Dados anteriores
    const investimentoAnterior = previousCampaigns.totais.investimento;
    const leadsAnterior = previousCampaigns.totais.leads;
    const roasAnterior = previousCampaigns.totais.roas;
    const cacAnterior = previousCampaigns.totais.cac;
    const receitaAnterior = previousCampaigns.totais.receita;
    
    // Calcular métricas
    const metricas: ComparativoMetrica[] = [
      {
        label: 'INVESTIMENTO',
        anterior: formatarMoedaCompacta(investimentoAnterior),
        atual: formatarMoedaCompacta(investimentoAtual),
        variacao: calcVariacao(investimentoAnterior, investimentoAtual),
        diferenca: formatarMoedaCompacta(Math.abs(investimentoAtual - investimentoAnterior)),
        positivo: true // Neutro para investimento
      },
      {
        label: 'LEADS GERADOS',
        anterior: formatarNumero(leadsAnterior),
        atual: formatarNumero(leadsAtual),
        variacao: calcVariacao(leadsAnterior, leadsAtual),
        diferenca: `${leadsAtual > leadsAnterior ? '+' : ''}${formatarNumero(leadsAtual - leadsAnterior)} leads`,
        positivo: leadsAtual >= leadsAnterior
      },
      {
        label: 'ROAS',
        anterior: `${roasAnterior.toFixed(2)}x`,
        atual: `${roasAtual.toFixed(2)}x`,
        variacao: calcVariacao(roasAnterior, roasAtual),
        diferenca: roasAtual > roasAnterior ? 'melhor eficiência' : 'menor eficiência',
        positivo: roasAtual >= roasAnterior
      },
      {
        label: 'CAC',
        anterior: formatarMoeda(cacAnterior),
        atual: formatarMoeda(cacAtual),
        variacao: calcVariacao(cacAnterior, cacAtual),
        diferenca: cacAtual < cacAnterior 
          ? `economia de ${formatarMoeda(cacAnterior - cacAtual)}`
          : `aumento de ${formatarMoeda(cacAtual - cacAnterior)}`,
        positivo: cacAtual <= cacAnterior,
        invertido: true // Menor é melhor
      },
      {
        label: 'RECEITA GERADA',
        anterior: formatarMoedaCompacta(receitaAnterior),
        atual: formatarMoedaCompacta(receitaAtual),
        variacao: calcVariacao(receitaAnterior, receitaAtual),
        diferenca: formatarMoedaCompacta(Math.abs(receitaAtual - receitaAnterior)),
        positivo: receitaAtual >= receitaAnterior
      }
    ];
    
    // Gerar insight automático
    const variacaoReceita = calcVariacao(receitaAnterior, receitaAtual);
    const variacaoInvestimento = calcVariacao(investimentoAnterior, investimentoAtual);
    
    let insight = '';
    if (variacaoReceita > variacaoInvestimento && variacaoReceita > 0) {
      insight = `${mesAtualLabel} está sendo ${variacaoReceita.toFixed(1)}% mais rentável que ${mesAnteriorLabel} com apenas ${variacaoInvestimento.toFixed(0)}% ${variacaoInvestimento >= 0 ? 'mais' : 'menos'} investimento!`;
    } else if (roasAtual > roasAnterior) {
      insight = `O ROAS melhorou ${((roasAtual - roasAnterior) / roasAnterior * 100).toFixed(1)}% comparado a ${mesAnteriorLabel}. Maior eficiência no investimento!`;
    } else if (cacAtual < cacAnterior) {
      insight = `O CAC reduziu ${((cacAnterior - cacAtual) / cacAnterior * 100).toFixed(1)}% em relação a ${mesAnteriorLabel}. Aquisição de clientes mais barata!`;
    } else {
      insight = `Comparando ${mesAtualLabel} com ${mesAnteriorLabel}: análise em andamento conforme os resultados evoluem.`;
    }
    
    return {
      mesAtual: mesAtualLabel,
      mesAnterior: mesAnteriorLabel,
      metricas,
      insight,
      loading: false,
      temComparativo: true
    };
  }, [
    selectedMonthKey, 
    previousMonthKey,
    currentCampaigns.totais, 
    previousCampaigns.totais,
    currentCampaigns.loading,
    previousCampaigns.loading,
    currentFinancials.loading,
    previousFinancials.loading
  ]);
  
  return comparativoData;
};