import { useMemo } from 'react';
import { useGoogleSheets } from './useGoogleSheets';
import { calcularMetricasFinanceiras } from '@/utils/financialMetricsCalculator';

export interface RealFinancialsData {
  totalFechamentos: number;
  receitaTotal: number;
  receitaPaga: number;
  ticketMedio: number;
  loading: boolean;
  error: string | null;
}

export const useRealFinancials = (monthKey?: string): RealFinancialsData => {
  const { data, loading, error } = useGoogleSheets(undefined, monthKey);

  const financials = useMemo(() => {
    if (loading || !data || data.length === 0) {
      return {
        totalFechamentos: 0,
        receitaTotal: 0,
        receitaPaga: 0,
        ticketMedio: 0
      };
    }

    const metrics = calcularMetricasFinanceiras(data);
    
    console.log('📊 FINANCIALS REAIS CALCULADOS:');
    console.log('  - Fechamentos:', metrics.contratos.total);
    console.log('  - Receita Total:', metrics.receitas.total);
    console.log('  - Receita Paga:', metrics.receitas.paga);
    
    const ticketMedio = metrics.contratos.total > 0 
      ? metrics.receitas.total / metrics.contratos.total 
      : 0;

    return {
      totalFechamentos: metrics.contratos.total,
      receitaTotal: metrics.receitas.total,
      receitaPaga: metrics.receitas.paga,
      ticketMedio
    };
  }, [data, loading]);

  return {
    ...financials,
    loading,
    error
  };
};
