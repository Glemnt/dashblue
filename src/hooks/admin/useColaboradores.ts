import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Colaborador {
  id: string;
  nome: string;
  tipo: string;
  squad: string | null;
  ativo: boolean | null;
  created_at: string | null;
}

export const useColaboradores = () => {
  const queryClient = useQueryClient();

  const { data: colaboradores = [], isLoading, error } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('colaboradores')
        .select('*')
        .order('tipo', { ascending: true })
        .order('nome', { ascending: true });
      
      if (error) throw error;
      return (data || []) as Colaborador[];
    }
  });

  const addColaborador = useMutation({
    mutationFn: async (colaborador: Omit<Colaborador, 'id' | 'created_at'>) => {
      const { data, error } = await (supabase as any)
        .from('colaboradores')
        .insert(colaborador)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['colaboradores'] })
  });

  const updateColaborador = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Colaborador> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('colaboradores')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['colaboradores'] })
  });

  const deleteColaborador = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('colaboradores')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['colaboradores'] })
  });

  const sdrs = colaboradores.filter(c => c.tipo === 'sdr' && c.ativo);
  const closers = colaboradores.filter(c => c.tipo === 'closer' && c.ativo);

  return { colaboradores, sdrs, closers, isLoading, error, addColaborador, updateColaborador, deleteColaborador };
};
