import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Venda {
  id: string;
  colaborador_id: string | null;
  colaborador_nome: string;
  valor: number;
  origem: string;
  lead_nome: string | null;
  data_fechamento: string;
  observacao: string | null;
  created_at: string | null;
}

export const useVendas = (mesKey?: string) => {
  const queryClient = useQueryClient();

  const { data: vendas = [], isLoading, error } = useQuery({
    queryKey: ['vendas', mesKey],
    queryFn: async () => {
      let query = (supabase as any).from('vendas').select('*').order('data_fechamento', { ascending: false });
      
      if (mesKey) {
        const [mesNome, ano] = mesKey.split('-');
        const meses: Record<string, number> = { 'janeiro': 0, 'fevereiro': 1, 'marco': 2, 'abril': 3, 'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11 };
        const mesNum = meses[mesNome];
        const anoNum = parseInt(ano);
        const startDate = new Date(anoNum, mesNum, 1);
        const endDate = new Date(anoNum, mesNum + 1, 0);
        query = query.gte('data_fechamento', startDate.toISOString().split('T')[0]).lte('data_fechamento', endDate.toISOString().split('T')[0]);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Venda[];
    }
  });

  const addVenda = useMutation({
    mutationFn: async (venda: Omit<Venda, 'id' | 'created_at'>) => {
      const { data, error } = await (supabase as any).from('vendas').insert(venda).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendas'] })
  });

  const updateVenda = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Venda> & { id: string }) => {
      const { data, error } = await (supabase as any).from('vendas').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendas'] })
  });

  const deleteVenda = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('vendas').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendas'] })
  });

  const totalVendas = vendas.reduce((acc, v) => acc + Number(v.valor), 0);
  const vendasPorOrigem = { indicacao: vendas.filter(v => v.origem === 'indicacao'), outbound: vendas.filter(v => v.origem === 'outbound'), inbound: vendas.filter(v => v.origem === 'inbound') };

  return { vendas, isLoading, error, totalVendas, vendasPorOrigem, addVenda, updateVenda, deleteVenda };
};
