import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { DateRange } from '@/utils/dateFilters';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export type MarketingMetric = Tables<'marketing_metrics'>;

interface UseMarketingMetricsOptions {
  dateRange?: DateRange;
  monthKey?: string;
  campanhaId?: string;
  objetivo?: string;
}

interface AggregatedMetrics {
  totalInvestimento: number;
  totalImpressions: number;
  totalCliques: number;
  totalLeads: number;
  avgCPL: number;
  avgCTR: number;
  avgCPC: number;
}

interface UseMarketingMetricsReturn {
  metrics: MarketingMetric[];
  aggregated: AggregatedMetrics;
  byObjective: Record<string, AggregatedMetrics>;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const getDateRangeFromMonthKey = (monthKey: string): DateRange => {
  const [mes, ano] = monthKey.split('-');
  const meses: Record<string, number> = {
    'janeiro': 0, 'fevereiro': 1, 'marco': 2, 'abril': 3,
    'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
    'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
  };
  
  const month = meses[mes.toLowerCase()] ?? 0;
  const year = parseInt(ano);
  const date = new Date(year, month, 1);
  
  return {
    start: startOfMonth(date),
    end: endOfMonth(date)
  };
};

export const useMarketingMetrics = (options: UseMarketingMetricsOptions = {}): UseMarketingMetricsReturn => {
  const { dateRange, monthKey, campanhaId, objetivo } = options;
  
  const effectiveRange = dateRange || (monthKey ? getDateRangeFromMonthKey(monthKey) : null);
  
  const queryKey = ['marketing_metrics', effectiveRange?.start?.toISOString(), effectiveRange?.end?.toISOString(), campanhaId, objetivo];
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('marketing_metrics')
        .select('*')
        .order('data', { ascending: false });
      
      if (effectiveRange) {
        const startDate = format(effectiveRange.start, 'yyyy-MM-dd');
        const endDate = format(effectiveRange.end, 'yyyy-MM-dd');
        query = query
          .gte('data', startDate)
          .lte('data', endDate);
      }
      
      if (campanhaId) {
        query = query.eq('campanha_id', campanhaId);
      }
      
      if (objetivo) {
        query = query.eq('objetivo', objetivo);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as MarketingMetric[];
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // 5 minutes
  });
  
  const metrics = data || [];
  
  // Calculate aggregated metrics
  const aggregated: AggregatedMetrics = {
    totalInvestimento: metrics.reduce((sum, m) => sum + Number(m.investimento || 0), 0),
    totalImpressions: metrics.reduce((sum, m) => sum + Number(m.impressoes || 0), 0),
    totalCliques: metrics.reduce((sum, m) => sum + Number(m.cliques || 0), 0),
    totalLeads: metrics.reduce((sum, m) => sum + Number(m.leads || 0), 0),
    avgCPL: 0,
    avgCTR: 0,
    avgCPC: 0,
  };
  
  // Calculate averages
  if (aggregated.totalLeads > 0) {
    aggregated.avgCPL = aggregated.totalInvestimento / aggregated.totalLeads;
  }
  if (aggregated.totalImpressions > 0) {
    aggregated.avgCTR = (aggregated.totalCliques / aggregated.totalImpressions) * 100;
  }
  if (aggregated.totalCliques > 0) {
    aggregated.avgCPC = aggregated.totalInvestimento / aggregated.totalCliques;
  }
  
  // Group by objective
  const byObjective: Record<string, AggregatedMetrics> = {};
  const objectives = [...new Set(metrics.map(m => m.objetivo).filter(Boolean))];
  
  for (const obj of objectives) {
    const objMetrics = metrics.filter(m => m.objetivo === obj);
    const totalInv = objMetrics.reduce((sum, m) => sum + Number(m.investimento || 0), 0);
    const totalImp = objMetrics.reduce((sum, m) => sum + Number(m.impressoes || 0), 0);
    const totalCli = objMetrics.reduce((sum, m) => sum + Number(m.cliques || 0), 0);
    const totalLds = objMetrics.reduce((sum, m) => sum + Number(m.leads || 0), 0);
    
    byObjective[obj as string] = {
      totalInvestimento: totalInv,
      totalImpressions: totalImp,
      totalCliques: totalCli,
      totalLeads: totalLds,
      avgCPL: totalLds > 0 ? totalInv / totalLds : 0,
      avgCTR: totalImp > 0 ? (totalCli / totalImp) * 100 : 0,
      avgCPC: totalCli > 0 ? totalInv / totalCli : 0,
    };
  }
  
  return {
    metrics,
    aggregated,
    byObjective,
    loading: isLoading,
    error: error?.message || null,
    refetch
  };
};
