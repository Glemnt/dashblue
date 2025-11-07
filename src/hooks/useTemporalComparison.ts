import { useState, useEffect } from 'react';
import { useGoogleSheets } from './useGoogleSheets';
import { DateRange } from '@/utils/dateFilters';
import { calcularMetricas, formatarReal } from '@/utils/metricsCalculator';
import { calcularMetricasSDR } from '@/utils/sdrMetricsCalculator';
import { calcularMetricasCloser } from '@/utils/closerMetricsCalculator';
import { calcularMetricasSquads } from '@/utils/squadsMetricsCalculator';

interface ComparisonPeriod {
  label: string;
  dateRange: DateRange;
  monthKey?: string;
}

export interface MetricComparison {
  metricName: string;
  currentValue: number;
  previousValue: number;
  variation: number;
  variationPercentual: number;
  trend: 'up' | 'down' | 'stable';
  isPositive: boolean;
  formattedCurrent: string;
  formattedPrevious: string;
  unit?: string;
}

interface Insight {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TemporalComparisonData {
  currentPeriod: ComparisonPeriod;
  previousPeriod: ComparisonPeriod;
  
  metricsComparison: MetricComparison[];
  
  sdrComparison?: {
    top3Current: any[];
    top3Previous: any[];
    improvements: string[];
    declines: string[];
  };
  
  closerComparison?: {
    top3Current: any[];
    top3Previous: any[];
    improvements: string[];
    declines: string[];
  };
  
  squadsComparison?: {
    liderCurrentPeriod: string;
    liderPreviousPeriod: string;
    mudancaLideranca: boolean;
  };
  
  insights: Insight[];
}

const calcularVariacaoPercentual = (atual: number, anterior: number): number => {
  if (anterior === 0) return atual > 0 ? 100 : 0;
  return ((atual - anterior) / anterior) * 100;
};

const getTrend = (atual: number, anterior: number): 'up' | 'down' | 'stable' => {
  const diff = atual - anterior;
  if (Math.abs(diff / (anterior || 1)) < 0.02) return 'stable';
  return diff > 0 ? 'up' : 'down';
};

const generateInsights = (
  metricasAtual: any,
  metricasAnterior: any,
  comparisons: MetricComparison[]
): Insight[] => {
  const insights: Insight[] = [];
  
  const maiorGanho = comparisons
    .filter(c => c.isPositive && c.variationPercentual > 10)
    .sort((a, b) => b.variationPercentual - a.variationPercentual)[0];
    
  if (maiorGanho) {
    insights.push({
      type: 'success',
      title: `🎉 ${maiorGanho.metricName} cresceu ${maiorGanho.variationPercentual.toFixed(1)}%`,
      description: `De ${maiorGanho.formattedPrevious} para ${maiorGanho.formattedCurrent}`,
      priority: 'high'
    });
  }
  
  const maiorQueda = comparisons
    .filter(c => c.isPositive && c.variationPercentual < -10)
    .sort((a, b) => a.variationPercentual - b.variationPercentual)[0];
    
  if (maiorQueda) {
    insights.push({
      type: 'warning',
      title: `⚠️ ${maiorQueda.metricName} caiu ${Math.abs(maiorQueda.variationPercentual).toFixed(1)}%`,
      description: `De ${maiorQueda.formattedPrevious} para ${maiorQueda.formattedCurrent}`,
      priority: 'high'
    });
  }
  
  if (metricasAtual.progressoMetaMensal > metricasAnterior.progressoMetaMensal + 10) {
    insights.push({
      type: 'success',
      title: '📈 Ritmo de vendas acelerou',
      description: `Progresso aumentou de ${metricasAnterior.progressoMetaMensal.toFixed(0)}% para ${metricasAtual.progressoMetaMensal.toFixed(0)}%`,
      priority: 'medium'
    });
  }
  
  if (metricasAtual.taxaConversao < metricasAnterior.taxaConversao - 5) {
    insights.push({
      type: 'warning',
      title: '⚠️ Taxa de conversão em queda',
      description: `Atenção: caiu de ${metricasAnterior.taxaConversao.toFixed(1)}% para ${metricasAtual.taxaConversao.toFixed(1)}%`,
      priority: 'high'
    });
  }
  
  if (metricasAtual.ticketMedio > metricasAnterior.ticketMedio * 1.15) {
    insights.push({
      type: 'success',
      title: '💎 Ticket médio aumentou significativamente',
      description: `De ${formatarReal(metricasAnterior.ticketMedio)} para ${formatarReal(metricasAtual.ticketMedio)}`,
      priority: 'medium'
    });
  }
  
  return insights;
};

export const useTemporalComparison = (
  currentPeriod: ComparisonPeriod,
  previousPeriod: ComparisonPeriod
) => {
  const [loading, setLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState<TemporalComparisonData | null>(null);
  
  const currentData = useGoogleSheets(currentPeriod.dateRange, currentPeriod.monthKey);
  const previousData = useGoogleSheets(previousPeriod.dateRange, previousPeriod.monthKey);
  
  useEffect(() => {
    if (currentData.loading || previousData.loading) {
      setLoading(true);
      return;
    }
    
    if (!currentData.data.length || !previousData.data.length) {
      setLoading(false);
      return;
    }
    
    const metricasAtual = calcularMetricas(currentData.data, undefined, currentPeriod.monthKey);
    const metricasAnterior = calcularMetricas(previousData.data, undefined, previousPeriod.monthKey);
    
    const comparisons: MetricComparison[] = [
      {
        metricName: 'Receita Total',
        currentValue: metricasAtual.receitaTotal,
        previousValue: metricasAnterior.receitaTotal,
        variation: metricasAtual.receitaTotal - metricasAnterior.receitaTotal,
        variationPercentual: calcularVariacaoPercentual(metricasAtual.receitaTotal, metricasAnterior.receitaTotal),
        trend: getTrend(metricasAtual.receitaTotal, metricasAnterior.receitaTotal),
        isPositive: true,
        formattedCurrent: formatarReal(metricasAtual.receitaTotal),
        formattedPrevious: formatarReal(metricasAnterior.receitaTotal),
        unit: 'currency'
      },
      {
        metricName: 'Contratos',
        currentValue: metricasAtual.totalContratos,
        previousValue: metricasAnterior.totalContratos,
        variation: metricasAtual.totalContratos - metricasAnterior.totalContratos,
        variationPercentual: calcularVariacaoPercentual(metricasAtual.totalContratos, metricasAnterior.totalContratos),
        trend: getTrend(metricasAtual.totalContratos, metricasAnterior.totalContratos),
        isPositive: true,
        formattedCurrent: metricasAtual.totalContratos.toString(),
        formattedPrevious: metricasAnterior.totalContratos.toString(),
        unit: 'number'
      },
      {
        metricName: 'Ticket Médio',
        currentValue: metricasAtual.ticketMedio,
        previousValue: metricasAnterior.ticketMedio,
        variation: metricasAtual.ticketMedio - metricasAnterior.ticketMedio,
        variationPercentual: calcularVariacaoPercentual(metricasAtual.ticketMedio, metricasAnterior.ticketMedio),
        trend: getTrend(metricasAtual.ticketMedio, metricasAnterior.ticketMedio),
        isPositive: true,
        formattedCurrent: formatarReal(metricasAtual.ticketMedio),
        formattedPrevious: formatarReal(metricasAnterior.ticketMedio),
        unit: 'currency'
      },
      {
        metricName: 'Taxa de Conversão',
        currentValue: metricasAtual.taxaConversao,
        previousValue: metricasAnterior.taxaConversao,
        variation: metricasAtual.taxaConversao - metricasAnterior.taxaConversao,
        variationPercentual: calcularVariacaoPercentual(metricasAtual.taxaConversao, metricasAnterior.taxaConversao),
        trend: getTrend(metricasAtual.taxaConversao, metricasAnterior.taxaConversao),
        isPositive: true,
        formattedCurrent: `${metricasAtual.taxaConversao.toFixed(1)}%`,
        formattedPrevious: `${metricasAnterior.taxaConversao.toFixed(1)}%`,
        unit: 'percent'
      },
      {
        metricName: 'Calls Realizadas',
        currentValue: metricasAtual.callsRealizadas,
        previousValue: metricasAnterior.callsRealizadas,
        variation: metricasAtual.callsRealizadas - metricasAnterior.callsRealizadas,
        variationPercentual: calcularVariacaoPercentual(metricasAtual.callsRealizadas, metricasAnterior.callsRealizadas),
        trend: getTrend(metricasAtual.callsRealizadas, metricasAnterior.callsRealizadas),
        isPositive: true,
        formattedCurrent: metricasAtual.callsRealizadas.toString(),
        formattedPrevious: metricasAnterior.callsRealizadas.toString(),
        unit: 'number'
      },
      {
        metricName: 'Taxa de Show',
        currentValue: metricasAtual.taxaShow,
        previousValue: metricasAnterior.taxaShow,
        variation: metricasAtual.taxaShow - metricasAnterior.taxaShow,
        variationPercentual: calcularVariacaoPercentual(metricasAtual.taxaShow, metricasAnterior.taxaShow),
        trend: getTrend(metricasAtual.taxaShow, metricasAnterior.taxaShow),
        isPositive: true,
        formattedCurrent: `${metricasAtual.taxaShow.toFixed(1)}%`,
        formattedPrevious: `${metricasAnterior.taxaShow.toFixed(1)}%`,
        unit: 'percent'
      }
    ];
    
    const insights = generateInsights(metricasAtual, metricasAnterior, comparisons);
    
    const sdrAtual = calcularMetricasSDR(currentData.data, currentPeriod.dateRange);
    const sdrAnterior = calcularMetricasSDR(previousData.data, previousPeriod.dateRange);
    
    const closerAtual = calcularMetricasCloser(currentData.data, currentPeriod.dateRange);
    const closerAnterior = calcularMetricasCloser(previousData.data, previousPeriod.dateRange);
    
    const squadsAtual = calcularMetricasSquads(currentData.data, currentPeriod.dateRange, currentPeriod.monthKey);
    const squadsAnterior = calcularMetricasSquads(previousData.data, previousPeriod.dateRange, previousPeriod.monthKey);
    
    setComparisonData({
      currentPeriod,
      previousPeriod,
      metricsComparison: comparisons,
      sdrComparison: {
        top3Current: sdrAtual.top3,
        top3Previous: sdrAnterior.top3,
        improvements: [],
        declines: []
      },
      closerComparison: {
        top3Current: closerAtual.top3,
        top3Previous: closerAnterior.top3,
        improvements: [],
        declines: []
      },
      squadsComparison: {
        liderCurrentPeriod: squadsAtual.placar.lider,
        liderPreviousPeriod: squadsAnterior.placar.lider,
        mudancaLideranca: squadsAtual.placar.lider !== squadsAnterior.placar.lider
      },
      insights
    });
    
    setLoading(false);
  }, [currentData.data, previousData.data, currentPeriod, previousPeriod]);
  
  return {
    loading,
    comparisonData,
    refetch: () => {
      currentData.refetch();
      previousData.refetch();
    }
  };
};
