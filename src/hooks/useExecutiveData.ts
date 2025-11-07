import { useGoogleSheets } from './useGoogleSheets';
import { useSDRKPIs } from './useSDRKPIs';
import { useCloserKPIs } from './useCloserKPIs';
import { useGoogleSheetsCampanhas } from './useGoogleSheetsCampanhas';
import { useGoogleSheetsLeads } from './useGoogleSheetsLeads';
import { useMetaAlerts } from './useMetaAlerts';
import { usePeriodFilter } from '@/contexts/PeriodFilterContext';
import { calcularMetricas } from '@/utils/metricsCalculator';
import { calcularMetricasSquads } from '@/utils/squadsMetricsCalculator';
import { calcularMetricasFinanceiras } from '@/utils/financialMetricsCalculator';
import { calcularProjecoes, Projecoes } from '@/utils/executiveCalculator';

export interface ExecutiveData {
  // Métricas gerais
  metricas: ReturnType<typeof calcularMetricas> | null;
  metricasSquads: ReturnType<typeof calcularMetricasSquads> | null;
  metricasFinanceiras: ReturnType<typeof calcularMetricasFinanceiras> | null;
  
  // Performance individual
  sdrKPIs: ReturnType<typeof useSDRKPIs>;
  closerKPIs: ReturnType<typeof useCloserKPIs>;
  
  // Alertas
  alerts: any[];
  
  // Projeções
  projecoes: Projecoes | null;
  
  // Estado
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export const useExecutiveData = (): ExecutiveData => {
  const { dateRange, selectedMonthKey } = usePeriodFilter();
  const { data, loading, error, lastUpdate } = useGoogleSheets(dateRange, selectedMonthKey);
  const campanhas = useGoogleSheetsCampanhas();
  const leads = useGoogleSheetsLeads();
  const sdrKPIs = useSDRKPIs();
  const closerKPIs = useCloserKPIs();
  
  // Calcular métricas
  const metricas = data.length > 0 ? calcularMetricas(data, {
    totalLeads: campanhas.totalLeads,
    totalMQLs: leads.totalMQLs
  }, selectedMonthKey) : null;
  
  const metricasSquads = data.length > 0 
    ? calcularMetricasSquads(data, dateRange, selectedMonthKey) 
    : null;
    
  const metricasFinanceiras = data.length > 0
    ? calcularMetricasFinanceiras(data)
    : null;
  
  // Calcular alertas
  const now = new Date();
  const diasUteis = 22;
  const diasDecorridos = now.getDate();
  const diasUteisRestantes = Math.max(diasUteis - diasDecorridos, 0);
  
  const { alerts } = useMetaAlerts({
    metricas: metricas ? {
      progressoMetaMensal: metricas.progressoMetaMensal,
      metaMensal: metricas.metaMensal,
      receitaTotal: metricas.receitaTotal
    } : undefined,
    diasUteisRestantes
  });
  
  // Calcular projeções
  const projecoes = metricas ? calcularProjecoes(metricas, alerts) : null;
  
  return {
    metricas,
    metricasSquads,
    metricasFinanceiras,
    sdrKPIs,
    closerKPIs,
    alerts,
    projecoes,
    loading: loading || campanhas.loading || leads.loading,
    error: error || leads.error,
    lastUpdate
  };
};
