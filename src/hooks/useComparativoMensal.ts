import { useMemo } from 'react';
import { usePeriodFilter } from '@/contexts/PeriodFilterContext';
import { useRealFinancials } from '@/hooks/useRealFinancials';
import { useMetaCampaigns } from '@/hooks/useMetaCampaigns';
import { getPreviousMonthKey, getMonthLabel, getDateRangeFromMonthKey } from '@/utils/dateFilters';

export interface ComparativoMetrica {
  label: string;
  anterior: number;
  atual: number;
  anteriorFormatado: string;
  atualFormatado: string;
  variacao: number;
  diferenca: string;
  positivo: boolean;
  invertido?: boolean;
}

export interface ComparativoData {
  mesAtual: string;
  mesAnterior: string | null;
  metricas: ComparativoMetrica[];
  insight: string;
  loading: boolean;
  temComparativo: boolean;
  // Variações específicas para KPI cards
  variacoes: {
    investimento: number;
    leads: number;
    leadsQualificados: number;
    fechamentos: number;
    roas: number;
    cac: number;
    receita: number;
  };
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
  
  // Dados do mês anterior - IMPORTANTE: só buscar se tiver mês anterior válido
  const previousFinancials = useRealFinancials(previousMonthKey || 'invalid');
  const previousCampaigns = useMetaCampaigns(
    previousDateRange || { start: new Date(), end: new Date() }, 
    previousMonthKey || 'invalid',
    previousMonthKey ? previousFinancials : undefined
  );
  
  const comparativoData = useMemo((): ComparativoData => {
    const mesAtualLabel = getMonthLabel(selectedMonthKey);
    const mesAnteriorLabel = previousMonthKey ? getMonthLabel(previousMonthKey) : null;
    
    const loading = currentCampaigns.loading || 
                    (previousMonthKey ? previousCampaigns.loading : false) || 
                    currentFinancials.loading || 
                    (previousMonthKey ? previousFinancials.loading : false);
    
    // Variações zeradas como fallback
    const variacoesVazias = {
      investimento: 0,
      leads: 0,
      leadsQualificados: 0,
      fechamentos: 0,
      roas: 0,
      cac: 0,
      receita: 0
    };
    
    if (!previousMonthKey || loading) {
      return {
        mesAtual: mesAtualLabel,
        mesAnterior: mesAnteriorLabel,
        metricas: [],
        insight: '',
        loading,
        temComparativo: false,
        variacoes: variacoesVazias
      };
    }
    
    // Dados atuais
    const investimentoAtual = currentCampaigns.totais.investimento;
    const leadsAtual = currentCampaigns.totais.leads;
    const leadsQualificadosAtual = currentCampaigns.totais.leadsQualificados;
    const fechamentosAtual = currentCampaigns.totais.fechamentos;
    const roasAtual = currentCampaigns.totais.roas;
    const cacAtual = currentCampaigns.totais.cac;
    const receitaAtual = currentCampaigns.totais.receita;
    
    // Dados anteriores
    const investimentoAnterior = previousCampaigns.totais.investimento;
    const leadsAnterior = previousCampaigns.totais.leads;
    const leadsQualificadosAnterior = previousCampaigns.totais.leadsQualificados;
    const fechamentosAnterior = previousCampaigns.totais.fechamentos;
    const roasAnterior = previousCampaigns.totais.roas;
    const cacAnterior = previousCampaigns.totais.cac;
    const receitaAnterior = previousCampaigns.totais.receita;
    
    // Calcular variações
    const variacoes = {
      investimento: calcVariacao(investimentoAnterior, investimentoAtual),
      leads: calcVariacao(leadsAnterior, leadsAtual),
      leadsQualificados: calcVariacao(leadsQualificadosAnterior, leadsQualificadosAtual),
      fechamentos: calcVariacao(fechamentosAnterior, fechamentosAtual),
      roas: calcVariacao(roasAnterior, roasAtual),
      cac: calcVariacao(cacAnterior, cacAtual),
      receita: calcVariacao(receitaAnterior, receitaAtual)
    };
    
    // Calcular métricas para exibição
    const metricas: ComparativoMetrica[] = [
      {
        label: 'INVESTIMENTO',
        anterior: investimentoAnterior,
        atual: investimentoAtual,
        anteriorFormatado: formatarMoedaCompacta(investimentoAnterior),
        atualFormatado: formatarMoedaCompacta(investimentoAtual),
        variacao: variacoes.investimento,
        diferenca: formatarMoedaCompacta(Math.abs(investimentoAtual - investimentoAnterior)),
        positivo: true
      },
      {
        label: 'LEADS GERADOS',
        anterior: leadsAnterior,
        atual: leadsAtual,
        anteriorFormatado: formatarNumero(leadsAnterior),
        atualFormatado: formatarNumero(leadsAtual),
        variacao: variacoes.leads,
        diferenca: `${leadsAtual > leadsAnterior ? '+' : ''}${formatarNumero(leadsAtual - leadsAnterior)} leads`,
        positivo: leadsAtual >= leadsAnterior
      },
      {
        label: 'ROAS',
        anterior: roasAnterior,
        atual: roasAtual,
        anteriorFormatado: `${roasAnterior.toFixed(2)}x`,
        atualFormatado: `${roasAtual.toFixed(2)}x`,
        variacao: variacoes.roas,
        diferenca: roasAtual > roasAnterior ? 'melhor eficiência' : 'menor eficiência',
        positivo: roasAtual >= roasAnterior
      },
      {
        label: 'CAC',
        anterior: cacAnterior,
        atual: cacAtual,
        anteriorFormatado: formatarMoeda(cacAnterior),
        atualFormatado: formatarMoeda(cacAtual),
        variacao: variacoes.cac,
        diferenca: cacAtual < cacAnterior 
          ? `economia de ${formatarMoeda(cacAnterior - cacAtual)}`
          : `aumento de ${formatarMoeda(cacAtual - cacAnterior)}`,
        positivo: cacAtual <= cacAnterior,
        invertido: true
      },
      {
        label: 'RECEITA GERADA',
        anterior: receitaAnterior,
        atual: receitaAtual,
        anteriorFormatado: formatarMoedaCompacta(receitaAnterior),
        atualFormatado: formatarMoedaCompacta(receitaAtual),
        variacao: variacoes.receita,
        diferenca: formatarMoedaCompacta(Math.abs(receitaAtual - receitaAnterior)),
        positivo: receitaAtual >= receitaAnterior
      }
    ];
    
    // Gerar insight automático
    let insight = '';
    if (variacoes.receita > variacoes.investimento && variacoes.receita > 0) {
      insight = `${mesAtualLabel} está sendo ${variacoes.receita.toFixed(1)}% mais rentável que ${mesAnteriorLabel} com apenas ${variacoes.investimento.toFixed(0)}% ${variacoes.investimento >= 0 ? 'mais' : 'menos'} investimento!`;
    } else if (roasAtual > roasAnterior) {
      insight = `O ROAS melhorou ${variacoes.roas.toFixed(1)}% comparado a ${mesAnteriorLabel}. Maior eficiência no investimento!`;
    } else if (cacAtual < cacAnterior) {
      insight = `O CAC reduziu ${Math.abs(variacoes.cac).toFixed(1)}% em relação a ${mesAnteriorLabel}. Aquisição de clientes mais barata!`;
    } else {
      insight = `Comparando ${mesAtualLabel} com ${mesAnteriorLabel}: análise em andamento conforme os resultados evoluem.`;
    }
    
    return {
      mesAtual: mesAtualLabel,
      mesAnterior: mesAnteriorLabel,
      metricas,
      insight,
      loading: false,
      temComparativo: true,
      variacoes
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