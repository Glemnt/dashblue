import { useVendas } from '@/hooks/admin/useVendas';
import { useAgendamentos } from '@/hooks/admin/useAgendamentos';
import { useMetasMensais } from '@/hooks/admin/useMetasMensais';
import { useColaboradores } from '@/hooks/admin/useColaboradores';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, Users, Award } from 'lucide-react';

interface AdminResumoPanelProps {
  mesKey: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatPercent = (value: number) => {
  return `${value.toFixed(2)}%`;
};

const AdminResumoPanel = ({ mesKey }: AdminResumoPanelProps) => {
  const { vendas, totalVendas } = useVendas(mesKey);
  const { agendamentos, totalAgendados, totalRealizados, totalNoShow, totalQualificados } = useAgendamentos(mesKey);
  const { metas, getMetaPorMes } = useMetasMensais();
  const { sdrs, closers } = useColaboradores();

  const metaAtual = getMetaPorMes(mesKey);
  const metaMensal = metaAtual?.meta_mensal || 325000;
  const percentualMeta = totalVendas > 0 ? (totalVendas / metaMensal) * 100 : 0;

  // Calcular métricas por SDR
  const sdrMetrics = sdrs.map(sdr => {
    const agendamentosSdr = agendamentos.filter(a => a.sdr_nome === sdr.nome);
    const vendasSdr = vendas.filter(v => {
      const agendamentoVenda = agendamentos.find(a => 
        a.lead_nome === v.lead_nome && a.sdr_nome === sdr.nome
      );
      return agendamentoVenda !== undefined;
    });
    
    const totalAgendadosSdr = agendamentosSdr.length;
    const qualificadosSdr = agendamentosSdr.filter(a => a.qualificado).length;
    const noShowSdr = agendamentosSdr.filter(a => a.status === 'no_show').length;
    const valorVendasSdr = vendasSdr.reduce((acc, v) => acc + Number(v.valor), 0);
    const percentualVendas = totalVendas > 0 ? (valorVendasSdr / totalVendas) * 100 : 0;
    const taxaNoShow = totalAgendadosSdr > 0 ? (noShowSdr / totalAgendadosSdr) * 100 : 0;
    const taxaComparecimento = 100 - taxaNoShow;

    return {
      nome: sdr.nome,
      valorVendas: valorVendasSdr,
      percentualVendas,
      callsAgendadas: totalAgendadosSdr,
      callsQualificadas: qualificadosSdr,
      noShow: noShowSdr,
      taxaNoShow,
      taxaComparecimento
    };
  }).sort((a, b) => b.valorVendas - a.valorVendas);

  // Calcular métricas por Closer
  const closerMetrics = closers.map(closer => {
    const vendasCloser = vendas.filter(v => v.colaborador_nome === closer.nome);
    const agendamentosCloser = agendamentos.filter(a => a.closer_nome === closer.nome);
    
    const valorVendas = vendasCloser.reduce((acc, v) => acc + Number(v.valor), 0);
    const numContratos = vendasCloser.length;
    const callsRealizadas = agendamentosCloser.filter(a => a.status === 'realizado').length;
    const callsQualificadas = agendamentosCloser.filter(a => a.qualificado).length;
    const percentualVendas = totalVendas > 0 ? (valorVendas / totalVendas) * 100 : 0;
    const ticketMedio = numContratos > 0 ? valorVendas / numContratos : 0;
    const taxaConversao = callsRealizadas > 0 ? (numContratos / callsRealizadas) * 100 : 0;

    return {
      nome: closer.nome,
      valorVendas,
      percentualVendas,
      ticketMedio,
      callsRealizadas,
      callsQualificadas,
      numContratos,
      taxaConversao
    };
  }).sort((a, b) => b.valorVendas - a.valorVendas);

  const topSdr = sdrMetrics.length > 0 ? sdrMetrics[0].nome : '-';
  const topCloser = closerMetrics.length > 0 ? closerMetrics[0].nome : '-';

  // Totais
  const ticketMedioTotal = vendas.length > 0 ? totalVendas / vendas.length : 0;
  const taxaConversaoTotal = totalRealizados > 0 ? (vendas.length / totalRealizados) * 100 : 0;
  const taxaNoShowTotal = totalAgendados > 0 ? (totalNoShow / totalAgendados) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A1F2E] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              META
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{formatCurrency(metaMensal)}</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1F2E] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              % DA META
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${percentualMeta >= 100 ? 'text-green-400' : percentualMeta >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
              {formatPercent(percentualMeta)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1F2E] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              TOP SDR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#0066FF]">{topSdr}</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1F2E] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              TOP CLOSER
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#0066FF]">{topCloser}</p>
          </CardContent>
        </Card>
      </div>

      {/* SDR Table */}
      <Card className="bg-[#1A1F2E] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Performance SDRs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-muted-foreground">SDR</TableHead>
                <TableHead className="text-muted-foreground text-right">Valor em vendas</TableHead>
                <TableHead className="text-muted-foreground text-right">% das vendas</TableHead>
                <TableHead className="text-muted-foreground text-right">Calls agendadas</TableHead>
                <TableHead className="text-muted-foreground text-right">Calls qualificadas</TableHead>
                <TableHead className="text-muted-foreground text-right">No-show</TableHead>
                <TableHead className="text-muted-foreground text-right">Tx. No-show</TableHead>
                <TableHead className="text-muted-foreground text-right">Tx. Comparecimento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-white/10 bg-[#0066FF]/10 font-semibold">
                <TableCell className="text-white">TOTAL</TableCell>
                <TableCell className="text-white text-right">{formatCurrency(totalVendas)}</TableCell>
                <TableCell className="text-white text-right">-</TableCell>
                <TableCell className="text-white text-right">{totalAgendados}</TableCell>
                <TableCell className="text-white text-right">{totalQualificados}</TableCell>
                <TableCell className="text-white text-right">{totalNoShow}</TableCell>
                <TableCell className="text-white text-right">{formatPercent(taxaNoShowTotal)}</TableCell>
                <TableCell className="text-white text-right">{formatPercent(100 - taxaNoShowTotal)}</TableCell>
              </TableRow>
              {sdrMetrics.map((sdr) => (
                <TableRow key={sdr.nome} className="border-white/10">
                  <TableCell className="text-white font-medium">{sdr.nome}</TableCell>
                  <TableCell className="text-white text-right">{formatCurrency(sdr.valorVendas)}</TableCell>
                  <TableCell className="text-white text-right">{formatPercent(sdr.percentualVendas)}</TableCell>
                  <TableCell className="text-white text-right">{sdr.callsAgendadas}</TableCell>
                  <TableCell className="text-white text-right">{sdr.callsQualificadas}</TableCell>
                  <TableCell className="text-white text-right">{sdr.noShow}</TableCell>
                  <TableCell className="text-white text-right">{formatPercent(sdr.taxaNoShow)}</TableCell>
                  <TableCell className="text-white text-right">{formatPercent(sdr.taxaComparecimento)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Closer Table */}
      <Card className="bg-[#1A1F2E] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Performance Closers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-muted-foreground">CLOSER</TableHead>
                <TableHead className="text-muted-foreground text-right">Valor em vendas</TableHead>
                <TableHead className="text-muted-foreground text-right">% das vendas</TableHead>
                <TableHead className="text-muted-foreground text-right">Ticket médio</TableHead>
                <TableHead className="text-muted-foreground text-right">Calls realizadas</TableHead>
                <TableHead className="text-muted-foreground text-right">Calls Qualificadas</TableHead>
                <TableHead className="text-muted-foreground text-right">N. contratos</TableHead>
                <TableHead className="text-muted-foreground text-right">Tx. conversão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-white/10 bg-[#0066FF]/10 font-semibold">
                <TableCell className="text-white">TOTAL</TableCell>
                <TableCell className="text-white text-right">{formatCurrency(totalVendas)}</TableCell>
                <TableCell className="text-white text-right">-</TableCell>
                <TableCell className="text-white text-right">{formatCurrency(ticketMedioTotal)}</TableCell>
                <TableCell className="text-white text-right">{totalRealizados}</TableCell>
                <TableCell className="text-white text-right">{totalQualificados}</TableCell>
                <TableCell className="text-white text-right">{vendas.length}</TableCell>
                <TableCell className="text-white text-right">{formatPercent(taxaConversaoTotal)}</TableCell>
              </TableRow>
              {closerMetrics.map((closer) => (
                <TableRow key={closer.nome} className="border-white/10">
                  <TableCell className="text-white font-medium">{closer.nome}</TableCell>
                  <TableCell className="text-white text-right">{formatCurrency(closer.valorVendas)}</TableCell>
                  <TableCell className="text-white text-right">{formatPercent(closer.percentualVendas)}</TableCell>
                  <TableCell className="text-white text-right">{formatCurrency(closer.ticketMedio)}</TableCell>
                  <TableCell className="text-white text-right">{closer.callsRealizadas}</TableCell>
                  <TableCell className="text-white text-right">{closer.callsQualificadas}</TableCell>
                  <TableCell className="text-white text-right">{closer.numContratos}</TableCell>
                  <TableCell className="text-white text-right">{formatPercent(closer.taxaConversao)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminResumoPanel;
