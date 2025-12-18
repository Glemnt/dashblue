import { useMemo } from 'react';
import { useGoogleSheets } from './useGoogleSheets';
import { calcularMetricasFinanceiras } from '@/utils/financialMetricsCalculator';
import { calcularMetricas } from '@/utils/metricsCalculator';
import { filterDataByDateRange, DateRange } from '@/utils/dateFilters';

export interface RealFinancialsData {
  totalFechamentos: number;
  receitaTotal: number;
  receitaPaga: number;
  ticketMedio: number;
  callsAgendadas: number;
  callsRealizadas: number;
  callsQualificadas: number;
  loading: boolean;
  error: string | null;
}

export const useRealFinancials = (monthKey?: string, dateRange?: DateRange): RealFinancialsData => {
  const { data, loading, error } = useGoogleSheets(dateRange, monthKey);

  const financials = useMemo(() => {
    if (loading || !data || data.length === 0) {
      return {
        totalFechamentos: 0,
        receitaTotal: 0,
        receitaPaga: 0,
        ticketMedio: 0,
        callsAgendadas: 0,
        callsRealizadas: 0,
        callsQualificadas: 0
      };
    }

    // Filtrar dados pelo período selecionado
    const filteredData = dateRange ? filterDataByDateRange(data, dateRange) : data;
    
    console.log('📅 FILTRO DE PERÍODO APLICADO:');
    console.log('  - Dados originais:', data.length);
    console.log('  - Dados filtrados:', filteredData.length);
    console.log('  - Período:', dateRange ? `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}` : 'Todo o mês');

    const metrics = calcularMetricasFinanceiras(filteredData);
    
    // Calcular métricas de calls usando o mesmo cálculo dos SDRs
    const metricasGerais = calcularMetricas(filteredData, undefined, monthKey);
    
    console.log('📊 FINANCIALS REAIS CALCULADOS:');
    console.log('  - Fechamentos:', metrics.contratos.total);
    console.log('  - Receita Total:', metrics.receitas.total);
    console.log('  - Receita Paga:', metrics.receitas.paga);
    console.log('  - Calls Agendadas (REAL):', metricasGerais.callsAgendadas);
    console.log('  - Calls Realizadas (REAL):', metricasGerais.callsRealizadas);
    console.log('  - Calls Qualificadas (REAL):', metricasGerais.callsQualificadas);
    
    const ticketMedio = metrics.contratos.total > 0 
      ? metrics.receitas.total / metrics.contratos.total 
      : 0;

    return {
      totalFechamentos: metrics.contratos.total,
      receitaTotal: metrics.receitas.total,
      receitaPaga: metrics.receitas.paga,
      ticketMedio,
      callsAgendadas: metricasGerais.callsAgendadas,
      callsRealizadas: metricasGerais.callsRealizadas,
      callsQualificadas: metricasGerais.callsQualificadas
    };
  }, [data, loading, monthKey, dateRange]);

  return {
    ...financials,
    loading,
    error
  };
};
