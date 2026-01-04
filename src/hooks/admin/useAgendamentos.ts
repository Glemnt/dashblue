import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/integrations/supabase/db';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface Agendamento {
  id: string;
  sdr_id: string | null;
  sdr_nome: string;
  closer_id: string | null;
  closer_nome: string | null;
  lead_nome: string | null;
  data_agendamento: string;
  status: string | null;
  qualificado: boolean | null;
  origem: string | null;
  observacao: string | null;
  created_at: string | null;
  workspace_id: string | null;
}

export const useAgendamentos = (mesKey?: string) => {
  const queryClient = useQueryClient();
  const { workspace } = useWorkspace();

  const { data: agendamentos = [], isLoading, error } = useQuery({
    queryKey: ['agendamentos', mesKey, workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      
      let query = db
        .from('agendamentos')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('data_agendamento', { ascending: false });
      
      if (mesKey) {
        const [mesNome, ano] = mesKey.split('-');
        const meses: Record<string, number> = { 
          'janeiro': 0, 'fevereiro': 1, 'marco': 2, 'abril': 3, 'maio': 4, 'junho': 5, 
          'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11 
        };
        const mesNum = meses[mesNome];
        const anoNum = parseInt(ano);
        const startDate = new Date(anoNum, mesNum, 1);
        const endDate = new Date(anoNum, mesNum + 1, 0);
        query = query
          .gte('data_agendamento', startDate.toISOString().split('T')[0])
          .lte('data_agendamento', endDate.toISOString().split('T')[0]);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Agendamento[];
    },
    enabled: !!workspace?.id
  });

  const addAgendamento = useMutation({
    mutationFn: async (agendamento: Omit<Agendamento, 'id' | 'created_at' | 'workspace_id'>) => {
      if (!workspace?.id) throw new Error('No workspace selected');
      
      const { data, error } = await db
        .from('agendamentos')
        .insert({ ...agendamento, workspace_id: workspace.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agendamentos'] })
  });

  const updateAgendamento = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Agendamento> & { id: string }) => {
      const { data, error } = await db
        .from('agendamentos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agendamentos'] })
  });

  const deleteAgendamento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from('agendamentos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agendamentos'] })
  });

  const totalAgendados = agendamentos.length;
  const totalRealizados = agendamentos.filter(a => a.status === 'realizado').length;
  const totalNoShow = agendamentos.filter(a => a.status === 'no_show').length;
  const totalQualificados = agendamentos.filter(a => a.qualificado).length;

  return { 
    agendamentos, isLoading, error, 
    totalAgendados, totalRealizados, totalNoShow, totalQualificados, 
    addAgendamento, updateAgendamento, deleteAgendamento 
  };
};
