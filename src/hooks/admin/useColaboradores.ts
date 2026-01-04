import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/integrations/supabase/db';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface Colaborador {
  id: string;
  nome: string;
  tipo: string;
  squad: string | null;
  ativo: boolean | null;
  created_at: string | null;
  workspace_id: string | null;
}

export const useColaboradores = () => {
  const queryClient = useQueryClient();
  const { workspace } = useWorkspace();

  const { data: colaboradores = [], isLoading, error } = useQuery({
    queryKey: ['colaboradores', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      
      const { data, error } = await db
        .from('colaboradores')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('tipo', { ascending: true })
        .order('nome', { ascending: true });
      
      if (error) throw error;
      return (data || []) as Colaborador[];
    },
    enabled: !!workspace?.id
  });

  const addColaborador = useMutation({
    mutationFn: async (colaborador: Omit<Colaborador, 'id' | 'created_at' | 'workspace_id'>) => {
      if (!workspace?.id) throw new Error('No workspace selected');
      
      const { data, error } = await db
        .from('colaboradores')
        .insert({ ...colaborador, workspace_id: workspace.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['colaboradores', workspace?.id] })
  });

  const updateColaborador = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Colaborador> & { id: string }) => {
      const { data, error } = await db
        .from('colaboradores')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['colaboradores', workspace?.id] })
  });

  const deleteColaborador = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db
        .from('colaboradores')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['colaboradores', workspace?.id] })
  });

  const sdrs = colaboradores.filter(c => c.tipo === 'sdr' && c.ativo);
  const closers = colaboradores.filter(c => c.tipo === 'closer' && c.ativo);

  return { colaboradores, sdrs, closers, isLoading, error, addColaborador, updateColaborador, deleteColaborador };
};
