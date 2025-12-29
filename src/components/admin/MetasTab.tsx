import { useState, useEffect } from 'react';
import { useMetasMensais, MetaMensal } from '@/hooks/admin/useMetasMensais';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MESES = [
  'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

const getCurrentMonthKey = () => {
  const now = new Date();
  const mes = MESES[now.getMonth()];
  const ano = now.getFullYear();
  return `${mes}-${ano}`;
};

const MetasTab = () => {
  const { metas, isLoading, upsertMeta, getMetaPorMes } = useMetasMensais();
  const { toast } = useToast();
  const [selectedMes, setSelectedMes] = useState(getCurrentMonthKey());
  const [formData, setFormData] = useState({
    meta_mensal: 0,
    meta_individual_closer: 0,
    meta_ticket_medio: 0,
    meta_taxa_conversao: 0,
    meta_taxa_qualificacao_sdr: 0,
    meta_taxa_show_sdr: 0
  });

  useEffect(() => {
    const meta = getMetaPorMes(selectedMes);
    if (meta) {
      setFormData({
        meta_mensal: Number(meta.meta_mensal) || 0,
        meta_individual_closer: Number(meta.meta_individual_closer) || 0,
        meta_ticket_medio: Number(meta.meta_ticket_medio) || 0,
        meta_taxa_conversao: Number(meta.meta_taxa_conversao) || 0,
        meta_taxa_qualificacao_sdr: Number(meta.meta_taxa_qualificacao_sdr) || 0,
        meta_taxa_show_sdr: Number(meta.meta_taxa_show_sdr) || 0
      });
    } else {
      setFormData({
        meta_mensal: 0,
        meta_individual_closer: 0,
        meta_ticket_medio: 0,
        meta_taxa_conversao: 0,
        meta_taxa_qualificacao_sdr: 0,
        meta_taxa_show_sdr: 0
      });
    }
  }, [selectedMes, metas]);

  const handleSave = async () => {
    try {
      await upsertMeta.mutateAsync({
        mes: selectedMes,
        ...formData
      });
      toast({ title: 'Sucesso', description: 'Metas salvas com sucesso' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar metas', variant: 'destructive' });
    }
  };

  const handleCopyFromPreviousMonth = () => {
    const [mesNome, ano] = selectedMes.split('-');
    const mesIndex = MESES.indexOf(mesNome);
    let prevMes: string;
    
    if (mesIndex === 0) {
      prevMes = `dezembro-${parseInt(ano) - 1}`;
    } else {
      prevMes = `${MESES[mesIndex - 1]}-${ano}`;
    }
    
    const prevMeta = getMetaPorMes(prevMes);
    if (prevMeta) {
      setFormData({
        meta_mensal: Number(prevMeta.meta_mensal) || 0,
        meta_individual_closer: Number(prevMeta.meta_individual_closer) || 0,
        meta_ticket_medio: Number(prevMeta.meta_ticket_medio) || 0,
        meta_taxa_conversao: Number(prevMeta.meta_taxa_conversao) || 0,
        meta_taxa_qualificacao_sdr: Number(prevMeta.meta_taxa_qualificacao_sdr) || 0,
        meta_taxa_show_sdr: Number(prevMeta.meta_taxa_show_sdr) || 0
      });
      toast({ title: 'Copiado', description: `Metas copiadas de ${prevMes}` });
    } else {
      toast({ title: 'Aviso', description: 'Não há metas no mês anterior', variant: 'destructive' });
    }
  };

  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = -6; i <= 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const mes = MESES[date.getMonth()];
      const ano = date.getFullYear();
      options.push(`${mes}-${ano}`);
    }
    return options;
  };

  if (isLoading) {
    return <div className="text-white">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#1A1F2E] border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Configurar Metas</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedMes} onValueChange={setSelectedMes}>
              <SelectTrigger className="w-48 bg-[#151E35] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#151E35] border-white/10">
                {generateMonthOptions().map((mes) => (
                  <SelectItem key={mes} value={mes}>
                    {mes.charAt(0).toUpperCase() + mes.slice(1).replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleCopyFromPreviousMonth}
              className="border-white/10 text-white hover:bg-white/10"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar do mês anterior
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-white">Meta Mensal Total (R$)</Label>
              <Input
                type="number"
                value={formData.meta_mensal}
                onChange={(e) => setFormData({ ...formData, meta_mensal: Number(e.target.value) })}
                className="bg-[#151E35] border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Meta Individual Closer (R$)</Label>
              <Input
                type="number"
                value={formData.meta_individual_closer}
                onChange={(e) => setFormData({ ...formData, meta_individual_closer: Number(e.target.value) })}
                className="bg-[#151E35] border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Ticket Médio Meta (R$)</Label>
              <Input
                type="number"
                value={formData.meta_ticket_medio}
                onChange={(e) => setFormData({ ...formData, meta_ticket_medio: Number(e.target.value) })}
                className="bg-[#151E35] border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Taxa de Conversão Meta (%)</Label>
              <Input
                type="number"
                value={formData.meta_taxa_conversao}
                onChange={(e) => setFormData({ ...formData, meta_taxa_conversao: Number(e.target.value) })}
                className="bg-[#151E35] border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Taxa Qualificação SDR Meta (%)</Label>
              <Input
                type="number"
                value={formData.meta_taxa_qualificacao_sdr}
                onChange={(e) => setFormData({ ...formData, meta_taxa_qualificacao_sdr: Number(e.target.value) })}
                className="bg-[#151E35] border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Taxa Show SDR Meta (%)</Label>
              <Input
                type="number"
                value={formData.meta_taxa_show_sdr}
                onChange={(e) => setFormData({ ...formData, meta_taxa_show_sdr: Number(e.target.value) })}
                className="bg-[#151E35] border-white/10 text-white"
              />
            </div>
          </div>
          <Button onClick={handleSave} className="mt-6 bg-[#0066FF] hover:bg-[#0066FF]/80">
            <Save className="h-4 w-4 mr-2" />
            Salvar Metas
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetasTab;
