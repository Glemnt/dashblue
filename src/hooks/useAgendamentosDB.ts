import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { DateRange } from '@/utils/dateFilters';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export type Agendamento = Tables<'agendamentos'>;

interface UseAgendamentosDBOptions {
  dateRange?: DateRange;
  monthKey?: string;
  sdrId?: string;
  closerId?: string;
  status?: 'agendado' | 'realizado' | 'no_show' | 'cancelado';
}

interface UseAgendamentosDBReturn {
  agendamentos: Agendamento[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  totais: {
    total: number;
    agendados: number;
    realizados: number;
    noShow: number;
    cancelados: number;
    qualificados: number;
  };
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

export const useAgendamentosDB = (options: UseAgendamentosDBOptions = {}): UseAgendamentosDBReturn => {
  const { dateRange, monthKey, sdrId, closerId, status } = options;
  
  const effectiveRange = dateRange || (monthKey ? getDateRangeFromMonthKey(monthKey) : null);
  
  const queryKey = ['agendamentos', effectiveRange?.start?.toISOString(), effectiveRange?.end?.toISOString(), sdrId, closerId, status];
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
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
      
      if (sdrId) {
        query = query.eq('sdr_id', sdrId);
      }
      
      if (closerId) {
        query = query.eq('closer_id', closerId);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Agendamento[];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
  
  const agendamentos = data || [];
  
  const totais = {
    total: agendamentos.length,
    agendados: agendamentos.filter(a => a.status === 'agendado').length,
    realizados: agendamentos.filter(a => a.status === 'realizado').length,
    noShow: agendamentos.filter(a => a.status === 'no_show').length,
    cancelados: agendamentos.filter(a => a.status === 'cancelado').length,
    qualificados: agendamentos.filter(a => a.qualificado === true).length,
  };
  
  return {
    agendamentos,
    loading: isLoading,
    error: error?.message || null,
    refetch,
    totais
  };
};
