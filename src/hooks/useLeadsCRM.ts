import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { DateRange } from '@/utils/dateFilters';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export type LeadCRM = Tables<'leads_crm'>;

interface UseLeadsCRMOptions {
  dateRange?: DateRange;
  monthKey?: string;
  status?: string;
  sdrNome?: string;
  closerNome?: string;
  isMql?: boolean;
}

interface UseLeadsCRMReturn {
  leads: LeadCRM[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  totais: {
    total: number;
    mqls: number;
    ganhos: number;
    perdidos: number;
    emNegociacao: number;
    valorTotal: number;
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

export const useLeadsCRM = (options: UseLeadsCRMOptions = {}): UseLeadsCRMReturn => {
  const { dateRange, monthKey, status, sdrNome, closerNome, isMql } = options;
  
  const effectiveRange = dateRange || (monthKey ? getDateRangeFromMonthKey(monthKey) : null);
  
  const queryKey = ['leads_crm', effectiveRange?.start?.toISOString(), effectiveRange?.end?.toISOString(), status, sdrNome, closerNome, isMql];
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('leads_crm')
        .select('*')
        .order('data_entrada', { ascending: false });
      
      if (effectiveRange) {
        const startDate = effectiveRange.start.toISOString();
        const endDate = effectiveRange.end.toISOString();
        query = query
          .gte('data_entrada', startDate)
          .lte('data_entrada', endDate);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (sdrNome) {
        query = query.eq('sdr_nome', sdrNome);
      }
      
      if (closerNome) {
        query = query.eq('closer_nome', closerNome);
      }
      
      if (isMql !== undefined) {
        query = query.eq('is_mql', isMql);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as LeadCRM[];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
  
  const leads = data || [];
  
  const totais = {
    total: leads.length,
    mqls: leads.filter(l => l.is_mql === true).length,
    ganhos: leads.filter(l => l.status === 'GANHO').length,
    perdidos: leads.filter(l => l.status === 'PERDIDO').length,
    emNegociacao: leads.filter(l => l.status === 'NEGOCIACAO').length,
    valorTotal: leads.reduce((sum, l) => sum + Number(l.valor_contrato || 0), 0),
  };
  
  return {
    leads,
    loading: isLoading,
    error: error?.message || null,
    refetch,
    totais
  };
};
