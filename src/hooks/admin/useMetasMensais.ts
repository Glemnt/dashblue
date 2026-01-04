import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/integrations/supabase/db';
import { useWorkspace } from '@/contexts/WorkspaceContext';

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
  workspace_id: string | null;
}

export const useMetasMensais = () => {
  const queryClient = useQueryClient();
  const { workspace } = useWorkspace();

  const { data: metas = [], isLoading, error } = useQuery({
    queryKey: ['metas_mensais', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      
      const { data, error } = await db
        .from('metas_mensais')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('mes', { ascending: false });
      if (error) throw error;
      return (data || []) as MetaMensal[];
    },
    enabled: !!workspace?.id
  });

  const getMetaPorMes = (mes: string) => metas.find(m => m.mes === mes);

  const addMeta = useMutation({
    mutationFn: async (meta: Omit<MetaMensal, 'id' | 'created_at' | 'updated_at' | 'workspace_id'>) => {
      if (!workspace?.id) throw new Error('No workspace selected');
      
      const { data, error } = await db
        .from('metas_mensais')
        .insert({ ...meta, workspace_id: workspace.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['metas_mensais', workspace?.id] })
  });

  const updateMeta = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MetaMensal> & { id: string }) => {
      const { data, error } = await db
        .from('metas_mensais')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['metas_mensais', workspace?.id] })
  });

  const upsertMeta = useMutation({
    mutationFn: async (meta: Omit<MetaMensal, 'id' | 'created_at' | 'updated_at' | 'workspace_id'>) => {
      if (!workspace?.id) throw new Error('No workspace selected');
      
      // Check if meta exists for this month and workspace
      const existing = metas.find(m => m.mes === meta.mes);
      
      if (existing) {
        const { data, error } = await db
          .from('metas_mensais')
          .update({ ...meta, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await db
          .from('metas_mensais')
          .insert({ ...meta, workspace_id: workspace.id })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['metas_mensais', workspace?.id] })
  });

  return { metas, isLoading, error, getMetaPorMes, addMeta, updateMeta, upsertMeta };
};
