import { useState } from 'react';
import { useVendas, Venda } from '@/hooks/admin/useVendas';
import { useColaboradores } from '@/hooks/admin/useColaboradores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VendasTabProps {
  mesKey: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const VendasTab = ({ mesKey }: VendasTabProps) => {
  const { vendas, isLoading, totalVendas, vendasPorOrigem, addVenda, updateVenda, deleteVenda } = useVendas(mesKey);
  const { closers } = useColaboradores();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    colaborador_id: '',
    colaborador_nome: '',
    valor: 0,
    origem: 'inbound' as 'indicacao' | 'outbound' | 'inbound',
    lead_nome: '',
    data_fechamento: format(new Date(), 'yyyy-MM-dd'),
    observacao: ''
  });

  const resetForm = () => {
    setFormData({
      colaborador_id: '',
      colaborador_nome: '',
      valor: 0,
      origem: 'inbound',
      lead_nome: '',
      data_fechamento: format(new Date(), 'yyyy-MM-dd'),
      observacao: ''
    });
    setEditingId(null);
  };

  const handleEdit = (venda: Venda) => {
    setFormData({
      colaborador_id: venda.colaborador_id || '',
      colaborador_nome: venda.colaborador_nome,
      valor: Number(venda.valor),
      origem: venda.origem,
      lead_nome: venda.lead_nome || '',
      data_fechamento: venda.data_fechamento,
      observacao: venda.observacao || ''
    });
    setEditingId(venda.id);
    setIsOpen(true);
  };

  const handleCloserChange = (closerId: string) => {
    const closer = closers.find(c => c.id === closerId);
    setFormData({
      ...formData,
      colaborador_id: closerId,
      colaborador_nome: closer?.nome || ''
    });
  };

  const handleSubmit = async () => {
    if (!formData.colaborador_nome || formData.valor <= 0) {
      toast({ title: 'Erro', description: 'Closer e valor são obrigatórios', variant: 'destructive' });
      return;
    }

    try {
      if (editingId) {
        await updateVenda.mutateAsync({
          id: editingId,
          ...formData,
          colaborador_id: formData.colaborador_id || null,
          lead_nome: formData.lead_nome || null,
          observacao: formData.observacao || null
        });
        toast({ title: 'Sucesso', description: 'Venda atualizada' });
      } else {
        await addVenda.mutateAsync({
          ...formData,
          colaborador_id: formData.colaborador_id || null,
          lead_nome: formData.lead_nome || null,
          observacao: formData.observacao || null
        });
        toast({ title: 'Sucesso', description: 'Venda registrada' });
      }
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar venda', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta venda?')) return;
    
    try {
      await deleteVenda.mutateAsync(id);
      toast({ title: 'Sucesso', description: 'Venda excluída' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao excluir venda', variant: 'destructive' });
    }
  };

  const origemColors: Record<string, string> = {
    indicacao: 'bg-purple-500/20 text-purple-400',
    outbound: 'bg-orange-500/20 text-orange-400',
    inbound: 'bg-green-500/20 text-green-400'
  };

  if (isLoading) {
    return <div className="text-white">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1F2E] border-white/10">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Vendas</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalVendas)}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1F2E] border-white/10">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Indicação</p>
            <p className="text-2xl font-bold text-purple-400">
              {formatCurrency(vendasPorOrigem.indicacao.reduce((acc, v) => acc + Number(v.valor), 0))}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1F2E] border-white/10">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Outbound</p>
            <p className="text-2xl font-bold text-orange-400">
              {formatCurrency(vendasPorOrigem.outbound.reduce((acc, v) => acc + Number(v.valor), 0))}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1F2E] border-white/10">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Inbound</p>
            <p className="text-2xl font-bold text-green-400">
              {formatCurrency(vendasPorOrigem.inbound.reduce((acc, v) => acc + Number(v.valor), 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vendas Table */}
      <Card className="bg-[#1A1F2E] border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Vendas Registradas</CardTitle>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-[#0066FF] hover:bg-[#0066FF]/80">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Venda
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1A1F2E] border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingId ? 'Editar Venda' : 'Nova Venda'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-white">Closer</Label>
                  <Select value={formData.colaborador_id} onValueChange={handleCloserChange}>
                    <SelectTrigger className="bg-[#151E35] border-white/10 text-white">
                      <SelectValue placeholder="Selecione o closer" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151E35] border-white/10">
                      {closers.map((closer) => (
                        <SelectItem key={closer.id} value={closer.id}>
                          {closer.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Valor (R$)</Label>
                  <Input
                    type="number"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
                    className="bg-[#151E35] border-white/10 text-white"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Origem</Label>
                  <Select
                    value={formData.origem}
                    onValueChange={(value: 'indicacao' | 'outbound' | 'inbound') => 
                      setFormData({ ...formData, origem: value })
                    }
                  >
                    <SelectTrigger className="bg-[#151E35] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151E35] border-white/10">
                      <SelectItem value="inbound">Inbound</SelectItem>
                      <SelectItem value="outbound">Outbound</SelectItem>
                      <SelectItem value="indicacao">Indicação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Nome do Lead (opcional)</Label>
                  <Input
                    value={formData.lead_nome}
                    onChange={(e) => setFormData({ ...formData, lead_nome: e.target.value })}
                    className="bg-[#151E35] border-white/10 text-white"
                    placeholder="Nome do cliente"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Data do Fechamento</Label>
                  <Input
                    type="date"
                    value={formData.data_fechamento}
                    onChange={(e) => setFormData({ ...formData, data_fechamento: e.target.value })}
                    className="bg-[#151E35] border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Observação (opcional)</Label>
                  <Textarea
                    value={formData.observacao}
                    onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                    className="bg-[#151E35] border-white/10 text-white"
                    placeholder="Observações sobre a venda"
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full bg-[#0066FF] hover:bg-[#0066FF]/80">
                  {editingId ? 'Salvar' : 'Registrar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-muted-foreground">Data</TableHead>
                <TableHead className="text-muted-foreground">Closer</TableHead>
                <TableHead className="text-muted-foreground">Lead</TableHead>
                <TableHead className="text-muted-foreground">Origem</TableHead>
                <TableHead className="text-muted-foreground text-right">Valor</TableHead>
                <TableHead className="text-muted-foreground text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhuma venda registrada neste mês
                  </TableCell>
                </TableRow>
              ) : (
                vendas.map((venda) => (
                  <TableRow key={venda.id} className="border-white/10">
                    <TableCell className="text-white">
                      {format(new Date(venda.data_fechamento), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-white font-medium">{venda.colaborador_nome}</TableCell>
                    <TableCell className="text-white">{venda.lead_nome || '-'}</TableCell>
                    <TableCell>
                      <Badge className={origemColors[venda.origem]}>
                        {venda.origem.charAt(0).toUpperCase() + venda.origem.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white text-right font-medium">
                      {formatCurrency(Number(venda.valor))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(venda)}
                          className="text-white hover:bg-white/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(venda.id)}
                          className="text-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendasTab;
