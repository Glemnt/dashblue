import { useState, useMemo } from 'react';
import { FinancialContract, formatarReal } from '@/utils/financialMetricsCalculator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, Search, Download } from 'lucide-react';
import { unparse } from 'papaparse';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Props {
  contratos: FinancialContract[];
  isTVMode: boolean;
}

const ContractsTable = ({ contratos, isTVMode }: Props) => {
  const { toast } = useToast();
  const [filtroAssinatura, setFiltroAssinatura] = useState<string>('todos');
  const [filtroPagamento, setFiltroPagamento] = useState<string>('todos');
  const [filtroSquad, setFiltroSquad] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const [sortColumn, setSortColumn] = useState<'valor' | 'data'>('valor');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtrar e buscar
  const contratosFiltrados = useMemo(() => {
    return contratos.filter(c => {
      // Filtros
      if (filtroAssinatura !== 'todos' && c.statusAssinatura !== filtroAssinatura) return false;
      if (filtroPagamento !== 'todos' && c.statusPagamento !== filtroPagamento) return false;
      if (filtroSquad !== 'todos' && c.squad !== filtroSquad) return false;
      
      // Busca
      if (busca) {
        const buscaLower = busca.toLowerCase();
        return (
          c.nomeCall.toLowerCase().includes(buscaLower) ||
          c.sdr.toLowerCase().includes(buscaLower) ||
          c.closer.toLowerCase().includes(buscaLower)
        );
      }
      
      return true;
    }).sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      return (a.valor - b.valor) * multiplier;
    });
  }, [contratos, filtroAssinatura, filtroPagamento, filtroSquad, busca, sortOrder]);

  // Cores para Status de Assinatura
  const getBadgeVariantAssinatura = (status: string): "success" | "warning" | "destructive" => {
    if (status === 'Assinado') return 'success';        // Verde
    if (status === 'Enviado') return 'warning';         // Amarelo
    return 'destructive';                               // Vermelho (Não Enviado)
  };

  // Cores para Status de Pagamento
  const getBadgeVariantPagamento = (status: string): "success" | "warning" | "destructive" => {
    if (status === 'Pago') return 'success';                      // Verde
    if (status === 'Link Enviado') return 'warning';              // Amarelo
    if (status === 'Esperando Financeiro') return 'destructive';  // Vermelho
    return 'destructive';                                         // Vermelho (fallback)
  };

  // Cores para Status Geral
  const getBadgeVariantGeral = (status: string): "success" | "warning" | "destructive" => {
    if (status === 'Completo') return 'success';       // Verde
    if (status === 'Parcial') return 'warning';        // Amarelo
    return 'destructive';                              // Vermelho (Pendente)
  };

  // Exportar para CSV
  const exportarParaCSV = () => {
    try {
      const dadosParaExportar = contratosFiltrados.map(contrato => ({
        'Nome da Call': contrato.nomeCall,
        'Data': format(new Date(contrato.dataFechamento), 'dd/MM/yyyy'),
        'SDR': contrato.sdr,
        'Closer': contrato.closer,
        'Valor': formatarReal(contrato.valor),
        'Status Assinatura': contrato.statusAssinatura,
        'Status Pagamento': contrato.statusPagamento,
        'Status Geral': contrato.statusGeral,
        'Squad': contrato.squad
      }));

      const csv = unparse(dadosParaExportar, {
        delimiter: ',',
        header: true
      });

      // Adicionar BOM para compatibilidade com Excel
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `contratos-financeiros-${format(new Date(), 'dd-MM-yyyy')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Sucesso!',
        description: 'Contratos exportados com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao exportar contratos',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="bg-[#151E35] rounded-2xl p-8">
      {/* Header com Botão de Exportação */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Contratos Detalhados</h3>
        <Button
          onClick={exportarParaCSV}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <div className={`grid gap-4 mb-6 ${isTVMode ? 'grid-cols-2' : 'grid-cols-4'}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
          <Input
            placeholder="Buscar por nome, SDR ou Closer..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 bg-[#0B1120] border-white/10 text-white"
          />
        </div>
        
        <Select value={filtroAssinatura} onValueChange={setFiltroAssinatura}>
          <SelectTrigger className="bg-[#0B1120] border-white/10 text-white">
            <SelectValue placeholder="Status Assinatura" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="Assinado">Assinado</SelectItem>
            <SelectItem value="Enviado">Enviado</SelectItem>
            <SelectItem value="Não Enviado">Não Enviado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroPagamento} onValueChange={setFiltroPagamento}>
          <SelectTrigger className="bg-[#0B1120] border-white/10 text-white">
            <SelectValue placeholder="Status Pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="Pago">Pago</SelectItem>
            <SelectItem value="Link Enviado">Link Enviado</SelectItem>
            <SelectItem value="Esperando Financeiro">Esperando Financeiro</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroSquad} onValueChange={setFiltroSquad}>
          <SelectTrigger className="bg-[#0B1120] border-white/10 text-white">
            <SelectValue placeholder="Squad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Squads</SelectItem>
            <SelectItem value="Hot Dogs">🔴 Hot Dogs</SelectItem>
            <SelectItem value="Corvo Azul">🔵 Corvo Azul</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className={isTVMode ? 'max-h-[400px] overflow-y-auto' : 'max-h-[600px] overflow-y-auto'}>
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-[#94A3B8] font-outfit font-semibold">Nome da Call</TableHead>
              <TableHead className="text-[#94A3B8] font-outfit font-semibold">Data</TableHead>
              <TableHead className="text-[#94A3B8] font-outfit font-semibold">SDR</TableHead>
              <TableHead className="text-[#94A3B8] font-outfit font-semibold">Closer</TableHead>
              <TableHead 
                className="text-[#94A3B8] font-outfit font-semibold cursor-pointer hover:bg-white/5"
                onClick={() => {
                  setSortColumn('valor');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                <div className="flex items-center gap-2">
                  Valor
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </TableHead>
              <TableHead className="text-[#94A3B8] font-outfit font-semibold">Assinatura</TableHead>
              <TableHead className="text-[#94A3B8] font-outfit font-semibold">Pagamento</TableHead>
              <TableHead className="text-[#94A3B8] font-outfit font-semibold">Status Geral</TableHead>
              <TableHead className="text-[#94A3B8] font-outfit font-semibold">Squad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contratosFiltrados.map((contrato, index) => (
              <TableRow key={index} className="border-white/10 hover:bg-white/5">
                <TableCell className="font-medium text-white">{contrato.nomeCall}</TableCell>
                <TableCell className="text-[#94A3B8]">{contrato.dataFechamento}</TableCell>
                <TableCell className="text-[#94A3B8]">{contrato.sdr}</TableCell>
                <TableCell className="text-[#94A3B8]">{contrato.closer}</TableCell>
                <TableCell className="font-semibold text-white">{formatarReal(contrato.valor)}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariantAssinatura(contrato.statusAssinatura)}>
                    {contrato.statusAssinatura}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariantPagamento(contrato.statusPagamento)}>
                    {contrato.statusPagamento}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariantGeral(contrato.statusGeral)}>
                    {contrato.statusGeral}
                  </Badge>
                </TableCell>
                <TableCell className="text-white">
                  {contrato.squad === 'Hot Dogs' ? '🔴' : '🔵'} {contrato.squad}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Rodapé com contador */}
      <div className="mt-4 pt-4 border-t border-white/10 text-center">
        <p className="text-[#94A3B8]">
          Mostrando <span className="text-white font-semibold">{contratosFiltrados.length}</span> de{' '}
          <span className="text-white font-semibold">{contratos.length}</span> contratos
        </p>
      </div>
    </div>
  );
};

export default ContractsTable;
