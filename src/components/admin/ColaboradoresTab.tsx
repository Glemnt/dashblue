import { useState } from 'react';
import { useColaboradores, Colaborador } from '@/hooks/admin/useColaboradores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ColaboradoresTab = () => {
  const { colaboradores, isLoading, addColaborador, updateColaborador, deleteColaborador } = useColaboradores();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'sdr' as 'sdr' | 'closer',
    squad: '',
    ativo: true
  });

  const resetForm = () => {
    setFormData({ nome: '', tipo: 'sdr', squad: '', ativo: true });
    setEditingId(null);
  };

  const handleEdit = (colaborador: Colaborador) => {
    setFormData({
      nome: colaborador.nome,
      tipo: colaborador.tipo as 'sdr' | 'closer',
      squad: colaborador.squad || '',
      ativo: colaborador.ativo ?? true
    });
    setEditingId(colaborador.id);
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.nome) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    try {
      if (editingId) {
        await updateColaborador.mutateAsync({
          id: editingId,
          ...formData,
          squad: formData.squad || null
        });
        toast({ title: 'Sucesso', description: 'Colaborador atualizado' });
      } else {
        await addColaborador.mutateAsync({
          ...formData,
          squad: formData.squad || null
        });
        toast({ title: 'Sucesso', description: 'Colaborador adicionado' });
      }
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar colaborador', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este colaborador?')) return;
    
    try {
      await deleteColaborador.mutateAsync(id);
      toast({ title: 'Sucesso', description: 'Colaborador excluído' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao excluir colaborador', variant: 'destructive' });
    }
  };

  const handleToggleAtivo = async (colaborador: Colaborador) => {
    try {
      await updateColaborador.mutateAsync({
        id: colaborador.id,
        ativo: !colaborador.ativo
      });
      toast({ title: 'Sucesso', description: `Colaborador ${!colaborador.ativo ? 'ativado' : 'desativado'}` });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar status', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="text-white">Carregando...</div>;
  }

  return (
    <Card className="bg-[#1A1F2E] border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Colaboradores</CardTitle>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#0066FF] hover:bg-[#0066FF]/80">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1A1F2E] border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingId ? 'Editar Colaborador' : 'Novo Colaborador'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-white">Nome</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="bg-[#151E35] border-white/10 text-white"
                  placeholder="Nome do colaborador"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Tipo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: 'sdr' | 'closer') => setFormData({ ...formData, tipo: value })}
                >
                  <SelectTrigger className="bg-[#151E35] border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151E35] border-white/10">
                    <SelectItem value="sdr">SDR</SelectItem>
                    <SelectItem value="closer">Closer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.tipo === 'closer' && (
                <div className="space-y-2">
                  <Label className="text-white">Squad</Label>
                  <Select
                    value={formData.squad}
                    onValueChange={(value) => setFormData({ ...formData, squad: value })}
                  >
                    <SelectTrigger className="bg-[#151E35] border-white/10 text-white">
                      <SelectValue placeholder="Selecione o squad" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151E35] border-white/10">
                      <SelectItem value="Alfa">Alfa</SelectItem>
                      <SelectItem value="Beta">Beta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label className="text-white">Ativo</Label>
                <Switch
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full bg-[#0066FF] hover:bg-[#0066FF]/80">
                {editingId ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="text-muted-foreground">Nome</TableHead>
              <TableHead className="text-muted-foreground">Tipo</TableHead>
              <TableHead className="text-muted-foreground">Squad</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {colaboradores.map((colaborador) => (
              <TableRow key={colaborador.id} className="border-white/10">
                <TableCell className="text-white font-medium">{colaborador.nome}</TableCell>
                <TableCell>
                  <Badge variant={colaborador.tipo === 'closer' ? 'default' : 'secondary'}>
                    {colaborador.tipo.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-white">{colaborador.squad || '-'}</TableCell>
                <TableCell>
                  <Switch
                    checked={colaborador.ativo ?? false}
                    onCheckedChange={() => handleToggleAtivo(colaborador)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(colaborador)}
                      className="text-white hover:bg-white/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(colaborador.id)}
                      className="text-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ColaboradoresTab;
