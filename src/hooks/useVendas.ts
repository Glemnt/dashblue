import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { DateRange } from '@/utils/dateFilters';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';

export type Venda = Tables<'vendas'>;

interface UseVendasOptions {
  dateRange?: DateRange;
  monthKey?: string;
  colaboradorId?: string;
}

interface UseVendasReturn {
  vendas: Venda[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  totalReceita: number;
  totalContratos: number;
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

export const useVendas = (options: UseVendasOptions = {}): UseVendasReturn => {
  const { dateRange, monthKey, colaboradorId } = options;
  
  // Determinar o range de datas
  const effectiveRange = dateRange || (monthKey ? getDateRangeFromMonthKey(monthKey) : null);
  
  const queryKey = ['vendas', effectiveRange?.start?.toISOString(), effectiveRange?.end?.toISOString(), colaboradorId];
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
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
      
      if (colaboradorId) {
        query = query.eq('colaborador_id', colaboradorId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Venda[];
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });
  
  const vendas = data || [];
  const totalReceita = vendas.reduce((sum, v) => sum + Number(v.valor || 0), 0);
  const totalContratos = vendas.length;
  
  return {
    vendas,
    loading: isLoading,
    error: error?.message || null,
    refetch,
    totalReceita,
    totalContratos
  };
};
