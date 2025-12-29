import { useState } from 'react';
import { useAgendamentos, Agendamento } from '@/hooks/admin/useAgendamentos';
import { useColaboradores } from '@/hooks/admin/useColaboradores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AgendamentosTabProps {
  mesKey: string;
}

const AgendamentosTab = ({ mesKey }: AgendamentosTabProps) => {
  const { agendamentos, isLoading, totalAgendados, totalRealizados, totalNoShow, totalQualificados, addAgendamento, updateAgendamento, deleteAgendamento } = useAgendamentos(mesKey);
  const { sdrs, closers } = useColaboradores();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    sdr_id: '',
    sdr_nome: '',
    closer_id: '',
    closer_nome: '',
    lead_nome: '',
    data_agendamento: format(new Date(), 'yyyy-MM-dd'),
    status: 'agendado' as 'agendado' | 'realizado' | 'no_show' | 'cancelado',
    qualificado: false,
    origem: 'inbound' as 'indicacao' | 'outbound' | 'inbound',
    observacao: ''
  });

  const resetForm = () => {
    setFormData({
      sdr_id: '',
      sdr_nome: '',
      closer_id: '',
      closer_nome: '',
      lead_nome: '',
      data_agendamento: format(new Date(), 'yyyy-MM-dd'),
      status: 'agendado',
      qualificado: false,
      origem: 'inbound',
      observacao: ''
    });
    setEditingId(null);
  };

  const handleEdit = (agendamento: Agendamento) => {
    setFormData({
      sdr_id: agendamento.sdr_id || '',
      sdr_nome: agendamento.sdr_nome,
      closer_id: agendamento.closer_id || '',
      closer_nome: agendamento.closer_nome || '',
      lead_nome: agendamento.lead_nome || '',
      data_agendamento: agendamento.data_agendamento,
      status: (agendamento.status || 'agendado') as 'agendado' | 'realizado' | 'no_show' | 'cancelado',
      qualificado: agendamento.qualificado ?? false,
      origem: (agendamento.origem || 'inbound') as 'indicacao' | 'outbound' | 'inbound',
      observacao: agendamento.observacao || ''
    });
    setEditingId(agendamento.id);
    setIsOpen(true);
  };

  const handleSdrChange = (sdrId: string) => {
    const sdr = sdrs.find(s => s.id === sdrId);
    setFormData({
      ...formData,
      sdr_id: sdrId,
      sdr_nome: sdr?.nome || ''
    });
  };

  const handleCloserChange = (closerId: string) => {
    const closer = closers.find(c => c.id === closerId);
    setFormData({
      ...formData,
      closer_id: closerId,
      closer_nome: closer?.nome || ''
    });
  };

  const handleSubmit = async () => {
    if (!formData.sdr_nome) {
      toast({ title: 'Erro', description: 'SDR é obrigatório', variant: 'destructive' });
      return;
    }

    try {
      if (editingId) {
        await updateAgendamento.mutateAsync({
          id: editingId,
          ...formData,
          sdr_id: formData.sdr_id || null,
          closer_id: formData.closer_id || null,
          closer_nome: formData.closer_nome || null,
          lead_nome: formData.lead_nome || null,
          observacao: formData.observacao || null
        });
        toast({ title: 'Sucesso', description: 'Agendamento atualizado' });
      } else {
        await addAgendamento.mutateAsync({
          ...formData,
          sdr_id: formData.sdr_id || null,
          closer_id: formData.closer_id || null,
          closer_nome: formData.closer_nome || null,
          lead_nome: formData.lead_nome || null,
          observacao: formData.observacao || null
        });
        toast({ title: 'Sucesso', description: 'Agendamento registrado' });
      }
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar agendamento', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;
    
    try {
      await deleteAgendamento.mutateAsync(id);
      toast({ title: 'Sucesso', description: 'Agendamento excluído' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao excluir agendamento', variant: 'destructive' });
    }
  };

  const handleStatusChange = async (agendamento: Agendamento, newStatus: string) => {
    try {
      await updateAgendamento.mutateAsync({
        id: agendamento.id,
        status: newStatus as 'agendado' | 'realizado' | 'no_show' | 'cancelado'
      });
      toast({ title: 'Sucesso', description: 'Status atualizado' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar status', variant: 'destructive' });
    }
  };

  const statusColors: Record<string, string> = {
    agendado: 'bg-blue-500/20 text-blue-400',
    realizado: 'bg-green-500/20 text-green-400',
    no_show: 'bg-red-500/20 text-red-400',
    cancelado: 'bg-gray-500/20 text-gray-400'
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
            <p className="text-sm text-muted-foreground">Total Agendados</p>
            <p className="text-2xl font-bold text-white">{totalAgendados}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1F2E] border-white/10">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Realizados</p>
            <p className="text-2xl font-bold text-green-400">{totalRealizados}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1F2E] border-white/10">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">No-show</p>
            <p className="text-2xl font-bold text-red-400">{totalNoShow}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1F2E] border-white/10">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Qualificados</p>
            <p className="text-2xl font-bold text-blue-400">{totalQualificados}</p>
          </CardContent>
        </Card>
      </div>

      {/* Agendamentos Table */}
      <Card className="bg-[#1A1F2E] border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Agendamentos</CardTitle>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-[#0066FF] hover:bg-[#0066FF]/80">
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1A1F2E] border-white/10 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingId ? 'Editar Agendamento' : 'Novo Agendamento'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-white">SDR</Label>
                  <Select value={formData.sdr_id} onValueChange={handleSdrChange}>
                    <SelectTrigger className="bg-[#151E35] border-white/10 text-white">
                      <SelectValue placeholder="Selecione o SDR" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151E35] border-white/10">
                      {sdrs.map((sdr) => (
                        <SelectItem key={sdr.id} value={sdr.id}>
                          {sdr.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Closer (opcional)</Label>
                  <Select value={formData.closer_id} onValueChange={handleCloserChange}>
                    <SelectTrigger className="bg-[#151E35] border-white/10 text-white">
                      <SelectValue placeholder="Selecione o Closer" />
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
                  <Label className="text-white">Nome do Lead (opcional)</Label>
                  <Input
                    value={formData.lead_nome}
                    onChange={(e) => setFormData({ ...formData, lead_nome: e.target.value })}
                    className="bg-[#151E35] border-white/10 text-white"
                    placeholder="Nome do lead"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Data do Agendamento</Label>
                  <Input
                    type="date"
                    value={formData.data_agendamento}
                    onChange={(e) => setFormData({ ...formData, data_agendamento: e.target.value })}
                    className="bg-[#151E35] border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'agendado' | 'realizado' | 'no_show' | 'cancelado') => 
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger className="bg-[#151E35] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151E35] border-white/10">
                      <SelectItem value="agendado">Agendado</SelectItem>
                      <SelectItem value="realizado">Realizado</SelectItem>
                      <SelectItem value="no_show">No-show</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
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
                <div className="flex items-center justify-between">
                  <Label className="text-white">Qualificado</Label>
                  <Switch
                    checked={formData.qualificado}
                    onCheckedChange={(checked) => setFormData({ ...formData, qualificado: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Observação (opcional)</Label>
                  <Textarea
                    value={formData.observacao}
                    onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                    className="bg-[#151E35] border-white/10 text-white"
                    placeholder="Observações"
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
                <TableHead className="text-muted-foreground">SDR</TableHead>
                <TableHead className="text-muted-foreground">Closer</TableHead>
                <TableHead className="text-muted-foreground">Lead</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Qualificado</TableHead>
                <TableHead className="text-muted-foreground text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agendamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhum agendamento neste mês
                  </TableCell>
                </TableRow>
              ) : (
                agendamentos.map((agendamento) => (
                  <TableRow key={agendamento.id} className="border-white/10">
                    <TableCell className="text-white">
                      {format(new Date(agendamento.data_agendamento), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-white font-medium">{agendamento.sdr_nome}</TableCell>
                    <TableCell className="text-white">{agendamento.closer_nome || '-'}</TableCell>
                    <TableCell className="text-white">{agendamento.lead_nome || '-'}</TableCell>
                    <TableCell>
                      <Select
                        value={agendamento.status || 'agendado'}
                        onValueChange={(value) => handleStatusChange(agendamento, value)}
                      >
                        <SelectTrigger className={`w-28 border-0 ${statusColors[agendamento.status || 'agendado']}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#151E35] border-white/10">
                          <SelectItem value="agendado">Agendado</SelectItem>
                          <SelectItem value="realizado">Realizado</SelectItem>
                          <SelectItem value="no_show">No-show</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge className={(agendamento.qualificado ?? false) ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                        {(agendamento.qualificado ?? false) ? 'Sim' : 'Não'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(agendamento)}
                          className="text-white hover:bg-white/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(agendamento.id)}
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

export default AgendamentosTab;
