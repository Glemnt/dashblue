/**
 * Hook principal que substitui useGoogleSheets
 * Busca dados do Supabase e os adapta para o formato esperado pelos calculadores
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { DateRange } from '@/utils/dateFilters';
import { adaptDataForCalculator, SheetRow } from '@/utils/dataAdapters';
import { format, startOfMonth, endOfMonth } from 'date-fns';

type Venda = Tables<'vendas'>;
type Agendamento = Tables<'agendamentos'>;

interface UseDashboardDataOptions {
  dateRange?: DateRange;
  monthKey?: string;
}

interface UseDashboardDataReturn {
  data: SheetRow[];
  vendas: Venda[];
  agendamentos: Agendamento[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refetch: () => void;
  isRefetching: boolean;
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

export const useDashboardData = (
  dateRange?: DateRange,
  monthKey?: string
): UseDashboardDataReturn => {
  // Determinar o range de datas efetivo
  const effectiveRange = dateRange || (monthKey ? getDateRangeFromMonthKey(monthKey) : null);
  
  // Query para vendas
  const vendasQuery = useQuery({
    queryKey: ['dashboard-vendas', effectiveRange?.start?.toISOString(), effectiveRange?.end?.toISOString()],
    queryFn: async () => {
      let query = supabase
        .from('vendas')
        .select('*')
        .order('data_fechamento', { ascending: false });
      
      if (effectiveRange) {
        const startDate = format(effectiveRange.start, 'yyyy-MM-dd');
        const endDate = format(effectiveRange.end, 'yyyy-MM-dd');
        query = query
          .gte('data_fechamento', startDate)
          .lte('data_fechamento', endDate);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Venda[];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
  
  // Query para agendamentos
  const agendamentosQuery = useQuery({
    queryKey: ['dashboard-agendamentos', effectiveRange?.start?.toISOString(), effectiveRange?.end?.toISOString()],
    queryFn: async () => {
      let query = supabase
        .from('agendamentos')
        .select('*')
        .order('data_agendamento', { ascending: false });
      
      if (effectiveRange) {
        const startDate = format(effectiveRange.start, 'yyyy-MM-dd');
        const endDate = format(effectiveRange.end, 'yyyy-MM-dd');
        query = query
          .gte('data_agendamento', startDate)
          .lte('data_agendamento', endDate);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Agendamento[];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
  
  const vendas = vendasQuery.data || [];
  const agendamentos = agendamentosQuery.data || [];
  
  // Adaptar dados para o formato esperado pelos calculadores
  const data = useMemo(() => {
    return adaptDataForCalculator(vendas, agendamentos);
  }, [vendas, agendamentos]);
  
  const loading = vendasQuery.isLoading || agendamentosQuery.isLoading;
  const isRefetching = vendasQuery.isRefetching || agendamentosQuery.isRefetching;
  const error = vendasQuery.error?.message || agendamentosQuery.error?.message || null;
  
  const refetch = () => {
    vendasQuery.refetch();
    agendamentosQuery.refetch();
  };
  
  const lastUpdate = vendasQuery.dataUpdatedAt 
    ? new Date(vendasQuery.dataUpdatedAt)
    : null;
  
  return {
    data,
    vendas,
    agendamentos,
    loading,
    error,
    lastUpdate,
    refetch,
    isRefetching
  };
};

/**
 * Hook para buscar colaboradores do banco
 */
export const useColaboradores = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      
      if (error) throw error;
      return data as Tables<'colaboradores'>[];
    },
    staleTime: 300000, // 5 minutes
  });
  
  const colaboradores = data || [];
  const sdrs = colaboradores.filter(c => c.tipo === 'sdr');
  const closers = colaboradores.filter(c => c.tipo === 'closer');
  
  return {
    colaboradores,
    sdrs,
    closers,
    loading: isLoading,
    error: error?.message || null,
    refetch
  };
};

/**
 * Hook para buscar metas mensais do banco
 */
export const useMetasMensais = (monthKey?: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['metas_mensais', monthKey],
    queryFn: async () => {
      let query = supabase
        .from('metas_mensais')
        .select('*');
      
      if (monthKey) {
        query = query.eq('mes', monthKey);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Tables<'metas_mensais'>[];
    },
    staleTime: 300000,
  });
  
  const metas = data || [];
  const metaAtual = monthKey ? metas.find(m => m.mes === monthKey) : metas[0];
  
  return {
    metas,
    metaAtual,
    loading: isLoading,
    error: error?.message || null,
    refetch
  };
};
