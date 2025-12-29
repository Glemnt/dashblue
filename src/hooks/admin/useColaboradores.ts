import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Colaborador {
  id: string;
  nome: string;
  tipo: 'sdr' | 'closer';
  squad: string | null;
  ativo: boolean;
  created_at: string;
}

export const useColaboradores = () => {
  const queryClient = useQueryClient();

  const { data: colaboradores = [], isLoading, error } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('colaboradores' as any)
        .select('*')
        .order('tipo', { ascending: true })
        .order('nome', { ascending: true });
      
      if (error) throw error;
      return data as Colaborador[];
    }
  });

  const addColaborador = useMutation({
    mutationFn: async (colaborador: Omit<Colaborador, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('colaboradores' as any)
        .insert(colaborador as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
    }
  });

  const updateColaborador = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Colaborador> & { id: string }) => {
      const { data, error } = await supabase
        .from('colaboradores' as any)
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
    }
  });

  const deleteColaborador = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('colaboradores' as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
    }
  });

  const sdrs = colaboradores.filter(c => c.tipo === 'sdr' && c.ativo);
  const closers = colaboradores.filter(c => c.tipo === 'closer' && c.ativo);

  return {
    colaboradores,
    sdrs,
    closers,
    isLoading,
    error,
    addColaborador,
    updateColaborador,
    deleteColaborador
  };
};
