import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MetaMensal {
  id: string;
  mes: string;
  meta_mensal: number;
  meta_individual_closer: number | null;
  meta_ticket_medio: number | null;
  meta_taxa_conversao: number | null;
  meta_taxa_qualificacao_sdr: number | null;
  meta_taxa_show_sdr: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useMetasMensais = () => {
  const queryClient = useQueryClient();

  const { data: metas = [], isLoading, error } = useQuery({
    queryKey: ['metas_mensais'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('metas_mensais')
        .select('*')
        .order('mes', { ascending: false });
      if (error) throw error;
      return (data || []) as MetaMensal[];
    }
  });

  const getMetaPorMes = (mes: string) => metas.find(m => m.mes === mes);

  const addMeta = useMutation({
    mutationFn: async (meta: Omit<MetaMensal, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await (supabase as any).from('metas_mensais').insert(meta).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['metas_mensais'] })
  });

  const updateMeta = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MetaMensal> & { id: string }) => {
      const { data, error } = await (supabase as any).from('metas_mensais').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['metas_mensais'] })
  });

  const upsertMeta = useMutation({
    mutationFn: async (meta: Omit<MetaMensal, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await (supabase as any).from('metas_mensais').upsert(meta, { onConflict: 'mes' }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['metas_mensais'] })
  });

  return { metas, isLoading, error, getMetaPorMes, addMeta, updateMeta, upsertMeta };
};
