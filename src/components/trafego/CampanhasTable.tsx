import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Search, Download, Calendar, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { 
  CampanhaData, 
  formatarMoeda, 
  formatarMoedaCompacta,
  formatarNumero,
  formatarPercentual,
  getStatusColor,
  getStatusLabel,
  CORES_CANAIS,
  CORES_OBJETIVOS,
  ObjetivoType
} from "@/utils/trafegoMetricsCalculator";

interface CampanhasTableProps {
  campanhas: CampanhaData[];
  isTVMode?: boolean;
}

type SortKey = keyof CampanhaData;
type SortDirection = 'asc' | 'desc';

const CampanhasTable = ({ campanhas, isTVMode = false }: CampanhasTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('roas');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [canalFilter, setCanalFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [objetivoFilter, setObjetivoFilter] = useState<string>('all');
  
  // Estados para filtro de data com botão aplicar
  const [appliedDateFilter, setAppliedDateFilter] = useState<DateRange | undefined>(undefined);
  const [tempDateFilter, setTempDateFilter] = useState<DateRange | undefined>(undefined);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  const canais = useMemo(() => {
    const uniqueCanais = [...new Set(campanhas.map(c => c.canal))];
    return uniqueCanais;
  }, [campanhas]);

  const objetivos = useMemo(() => {
    const uniqueObjetivos = [...new Set(campanhas.map(c => c.objetivo).filter(Boolean))];
    return uniqueObjetivos as ObjetivoType[];
  }, [campanhas]);

  const filteredAndSortedCampanhas = useMemo(() => {
    let result = [...campanhas];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(c => 
        c.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by canal
    if (canalFilter !== 'all') {
      result = result.filter(c => c.canal === canalFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter);
    }

    // Filter by objetivo
    if (objetivoFilter !== 'all') {
      result = result.filter(c => c.objetivo === objetivoFilter);
    }

    // Filter by date range - usa appliedDateFilter
    if (appliedDateFilter?.from) {
      result = result.filter(c => {
        if (!c.dataInicio) return false; // Campanhas sem data NÃO passam quando há filtro ativo
        const campanhaDate = new Date(c.dataInicio);
        const fromDate = appliedDateFilter.from!;
        const toDate = appliedDateFilter.to || appliedDateFilter.from!;
        return campanhaDate >= fromDate && campanhaDate <= toDate;
      });
    }

    // Sort
    result.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return sortDirection === 'asc' 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    return result;
  }, [campanhas, searchTerm, sortKey, sortDirection, canalFilter, statusFilter, objetivoFilter, appliedDateFilter]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const totais = useMemo(() => {
    return filteredAndSortedCampanhas.reduce((acc, c) => ({
      investimento: acc.investimento + c.investimento,
      leads: acc.leads + c.leadsGerados,
      qualificados: acc.qualificados + c.leadsQualificados,
      fechamentos: acc.fechamentos + c.fechamentos,
      receita: acc.receita + c.valorFechado,
    }), { investimento: 0, leads: 0, qualificados: 0, fechamentos: 0, receita: 0 });
  }, [filteredAndSortedCampanhas]);

  const roasTotalCalculado = totais.investimento > 0 ? totais.receita / totais.investimento : 0;
  const cacTotalCalculado = totais.fechamentos > 0 ? totais.investimento / totais.fechamentos : 0;

  const exportToCSV = () => {
    const headers = ['Campanha', 'Canal', 'Objetivo', 'Investimento', 'Leads', 'Qualificados', 'Fechamentos', 'ROAS', 'ROI', 'CAC', 'Status'];
    const rows = filteredAndSortedCampanhas.map(c => [
      c.nome,
      c.canal,
      c.objetivo || 'Outros',
      c.investimento,
      c.leadsGerados,
      c.leadsQualificados,
      c.fechamentos,
      c.roas.toFixed(2),
      c.roi.toFixed(0) + '%',
      c.cac.toFixed(0),
      c.status
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campanhas-trafego.csv';
    a.click();
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const getStatusBadge = (roas: number) => {
    const color = getStatusColor(roas);
    const label = getStatusLabel(roas);
    return (
      <Badge style={{ backgroundColor: color }} className="text-white border-none">
        {label}
      </Badge>
    );
  };

  return (
    <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-8' : 'p-6'}`}>
      {/* Filters */}
      <div className={`flex flex-wrap gap-4 ${isTVMode ? 'mb-8' : 'mb-6'}`}>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B] w-5 h-5" />
          <Input
            placeholder="Buscar campanha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 bg-[#0B1120] border-white/10 text-white ${isTVMode ? 'h-14 text-lg' : ''}`}
          />
        </div>

        <Select value={canalFilter} onValueChange={setCanalFilter}>
          <SelectTrigger className={`w-[150px] bg-[#0B1120] border-white/10 text-white ${isTVMode ? 'h-14 text-lg' : ''}`}>
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent className="bg-[#151E35] border-white/10">
            <SelectItem value="all" className="text-white">Todos Canais</SelectItem>
            {canais.map(canal => (
              <SelectItem key={canal} value={canal} className="text-white">{canal}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className={`w-[150px] bg-[#0B1120] border-white/10 text-white ${isTVMode ? 'h-14 text-lg' : ''}`}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#151E35] border-white/10">
            <SelectItem value="all" className="text-white">Todos Status</SelectItem>
            <SelectItem value="ativo" className="text-white">Ativo</SelectItem>
            <SelectItem value="pausado" className="text-white">Pausado</SelectItem>
            <SelectItem value="finalizado" className="text-white">Finalizado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={objetivoFilter} onValueChange={setObjetivoFilter}>
          <SelectTrigger className={`w-[150px] bg-[#0B1120] border-white/10 text-white ${isTVMode ? 'h-14 text-lg' : ''}`}>
            <SelectValue placeholder="Objetivo" />
          </SelectTrigger>
          <SelectContent className="bg-[#151E35] border-white/10">
            <SelectItem value="all" className="text-white">Todos Objetivos</SelectItem>
            {objetivos.map(objetivo => (
              <SelectItem key={objetivo} value={objetivo} className="text-white">{objetivo}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Filter */}
        <Popover open={datePopoverOpen} onOpenChange={(open) => {
          setDatePopoverOpen(open);
          if (open) {
            // Ao abrir, sincronizar estado temporário com o aplicado
            setTempDateFilter(appliedDateFilter);
          }
        }}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className={`bg-[#0B1120] border-white/10 text-white hover:bg-white/10 ${isTVMode ? 'h-14 text-lg' : ''}`}
            >
              <Calendar className="w-5 h-5 mr-2" />
              {appliedDateFilter?.from ? (
                appliedDateFilter.to ? (
                  `${format(appliedDateFilter.from, "dd/MM", { locale: ptBR })} - ${format(appliedDateFilter.to, "dd/MM", { locale: ptBR })}`
                ) : (
                  format(appliedDateFilter.from, "dd/MM/yyyy", { locale: ptBR })
                )
              ) : (
                "Filtrar Data"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-[#151E35] border-white/10" align="start">
            <CalendarComponent
              mode="range"
              selected={tempDateFilter}
              onSelect={setTempDateFilter}
              locale={ptBR}
              className="pointer-events-auto bg-[#151E35]"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium text-white",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white border border-white/20 rounded",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-white/60 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative text-white",
                day: "h-9 w-9 p-0 font-normal text-white hover:bg-white/10 rounded-md",
                day_range_end: "day-range-end",
                day_selected: "bg-[#0066FF] text-white hover:bg-[#0066FF] hover:text-white focus:bg-[#0066FF] focus:text-white rounded-md",
                day_today: "bg-white/10 text-white",
                day_outside: "text-white/30 opacity-50",
                day_disabled: "text-white/20 opacity-50",
                day_range_middle: "bg-[#0066FF]/30 text-white",
                day_hidden: "invisible",
              }}
              initialFocus
            />
            {/* Botões Limpar e Aplicar */}
            <div className="flex gap-2 p-3 border-t border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTempDateFilter(undefined);
                }}
                className="flex-1 text-white/60 hover:text-white hover:bg-white/10"
              >
                Limpar
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setAppliedDateFilter(tempDateFilter);
                  setDatePopoverOpen(false);
                }}
                className="flex-1 bg-[#0066FF] text-white hover:bg-[#0066FF]/80"
                disabled={!tempDateFilter?.from}
              >
                Aplicar
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {appliedDateFilter?.from && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setAppliedDateFilter(undefined);
              setTempDateFilter(undefined);
            }}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4 mr-1" />
            Limpar Data
          </Button>
        )}

        <Button onClick={exportToCSV} variant="outline" className={`bg-[#0B1120] border-white/10 text-white hover:bg-white/10 ${isTVMode ? 'h-14 text-lg px-6' : ''}`}>
          <Download className="w-5 h-5 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th 
                className={`text-left text-[#94A3B8] font-semibold uppercase tracking-wider cursor-pointer hover:text-white ${isTVMode ? 'py-4 px-4 text-base' : 'py-3 px-3 text-xs'}`}
                onClick={() => handleSort('nome')}
              >
                <div className="flex items-center gap-2">
                  Campanha <SortIcon columnKey="nome" />
                </div>
              </th>
              <th 
                className={`text-left text-[#94A3B8] font-semibold uppercase tracking-wider cursor-pointer hover:text-white ${isTVMode ? 'py-4 px-4 text-base' : 'py-3 px-3 text-xs'}`}
                onClick={() => handleSort('canal')}
              >
                <div className="flex items-center gap-2">
                  Canal <SortIcon columnKey="canal" />
                </div>
              </th>
              <th 
                className={`text-left text-[#94A3B8] font-semibold uppercase tracking-wider cursor-pointer hover:text-white ${isTVMode ? 'py-4 px-4 text-base' : 'py-3 px-3 text-xs'}`}
                onClick={() => handleSort('objetivo')}
              >
                <div className="flex items-center gap-2">
                  Objetivo <SortIcon columnKey="objetivo" />
                </div>
              </th>
              <th 
                className={`text-right text-[#94A3B8] font-semibold uppercase tracking-wider cursor-pointer hover:text-white ${isTVMode ? 'py-4 px-4 text-base' : 'py-3 px-3 text-xs'}`}
                onClick={() => handleSort('investimento')}
              >
                <div className="flex items-center justify-end gap-2">
                  Invest. <SortIcon columnKey="investimento" />
                </div>
              </th>
              <th 
                className={`text-right text-[#94A3B8] font-semibold uppercase tracking-wider cursor-pointer hover:text-white ${isTVMode ? 'py-4 px-4 text-base' : 'py-3 px-3 text-xs'}`}
                onClick={() => handleSort('leadsGerados')}
              >
                <div className="flex items-center justify-end gap-2">
                  Leads <SortIcon columnKey="leadsGerados" />
                </div>
              </th>
              <th 
                className={`text-right text-[#94A3B8] font-semibold uppercase tracking-wider cursor-pointer hover:text-white ${isTVMode ? 'py-4 px-4 text-base' : 'py-3 px-3 text-xs'}`}
                onClick={() => handleSort('leadsQualificados')}
              >
                <div className="flex items-center justify-end gap-2">
                  Qualif. <SortIcon columnKey="leadsQualificados" />
                </div>
              </th>
              <th 
                className={`text-right text-[#94A3B8] font-semibold uppercase tracking-wider cursor-pointer hover:text-white ${isTVMode ? 'py-4 px-4 text-base' : 'py-3 px-3 text-xs'}`}
                onClick={() => handleSort('fechamentos')}
              >
                <div className="flex items-center justify-end gap-2">
                  Fecha. <SortIcon columnKey="fechamentos" />
                </div>
              </th>
              <th 
                className={`text-right text-[#94A3B8] font-semibold uppercase tracking-wider cursor-pointer hover:text-white ${isTVMode ? 'py-4 px-4 text-base' : 'py-3 px-3 text-xs'}`}
                onClick={() => handleSort('roas')}
              >
                <div className="flex items-center justify-end gap-2">
                  ROAS <SortIcon columnKey="roas" />
                </div>
              </th>
              <th 
                className={`text-right text-[#94A3B8] font-semibold uppercase tracking-wider cursor-pointer hover:text-white ${isTVMode ? 'py-4 px-4 text-base' : 'py-3 px-3 text-xs'}`}
                onClick={() => handleSort('roi')}
              >
                <div className="flex items-center justify-end gap-2">
                  ROI <SortIcon columnKey="roi" />
                </div>
              </th>
              <th 
                className={`text-right text-[#94A3B8] font-semibold uppercase tracking-wider cursor-pointer hover:text-white ${isTVMode ? 'py-4 px-4 text-base' : 'py-3 px-3 text-xs'}`}
                onClick={() => handleSort('cac')}
              >
                <div className="flex items-center justify-end gap-2">
                  CAC <SortIcon columnKey="cac" />
                </div>
              </th>
              <th className={`text-center text-[#94A3B8] font-semibold uppercase tracking-wider ${isTVMode ? 'py-4 px-4 text-base' : 'py-3 px-3 text-xs'}`}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedCampanhas.map((campanha) => (
              <tr key={campanha.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className={`text-white font-medium ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`}>
                  {campanha.nome}
                </td>
                <td className={`${isTVMode ? 'py-4 px-4' : 'py-3 px-3'}`}>
                  <Badge 
                    style={{ backgroundColor: CORES_CANAIS[campanha.canal] || '#6B7280' }}
                    className={`text-white border-none ${isTVMode ? 'text-base' : 'text-xs'}`}
                  >
                    {campanha.canal}
                  </Badge>
                </td>
                <td className={`${isTVMode ? 'py-4 px-4' : 'py-3 px-3'}`}>
                  <Badge 
                    style={{ backgroundColor: CORES_OBJETIVOS[campanha.objetivo] || '#6B7280' }}
                    className={`text-white border-none ${isTVMode ? 'text-base' : 'text-xs'}`}
                  >
                    {campanha.objetivo || 'Outros'}
                  </Badge>
                </td>
                <td className={`text-right text-white ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`}>
                  {formatarMoedaCompacta(campanha.investimento)}
                </td>
                <td className={`text-right text-white ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`}>
                  {campanha.leadsGerados}
                </td>
                <td className={`text-right ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`}>
                  <span className="text-white">{campanha.leadsQualificados}</span>
                  <span className="text-[#64748B] ml-1">({formatarPercentual(campanha.taxaQualificacao)})</span>
                </td>
                <td className={`text-right text-white font-bold ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`}>
                  {campanha.fechamentos}
                </td>
                <td className={`text-right font-bold ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`} style={{ color: getStatusColor(campanha.roas) }}>
                  {campanha.roas.toFixed(1)}x
                </td>
                <td className={`text-right font-bold ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`} style={{ color: campanha.roi >= 0 ? '#10B981' : '#EF4444' }}>
                  {campanha.roi.toFixed(0)}%
                </td>
                <td className={`text-right text-white ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`}>
                  {formatarMoedaCompacta(campanha.cac)}
                </td>
                <td className={`text-center ${isTVMode ? 'py-4 px-4' : 'py-3 px-3'}`}>
                  {getStatusBadge(campanha.roas)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#0066FF]/30 bg-[#0B1120]">
              <td className={`text-white font-black ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`}>
                TOTAIS
              </td>
              <td className={`${isTVMode ? 'py-4 px-4' : 'py-3 px-3'}`}>
                <Badge className="bg-[#0066FF] text-white border-none">
                  {filteredAndSortedCampanhas.length} campanhas
                </Badge>
              </td>
              <td></td>
              <td className={`text-right text-white font-black ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`}>
                {formatarMoedaCompacta(totais.investimento)}
              </td>
              <td className={`text-right text-white font-black ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`}>
                {totais.leads}
              </td>
              <td className={`text-right text-white font-black ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`}>
                {totais.qualificados}
              </td>
              <td className={`text-right text-white font-black ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`}>
                {totais.fechamentos}
              </td>
              <td className={`text-right font-black ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`} style={{ color: getStatusColor(roasTotalCalculado) }}>
                {roasTotalCalculado.toFixed(1)}x
              </td>
              <td className={`text-right text-[#10B981] font-black ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`}>
                {totais.investimento > 0 ? (((totais.receita - totais.investimento) / totais.investimento) * 100).toFixed(0) : 0}%
              </td>
              <td className={`text-right text-white font-black ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`}>
                {formatarMoedaCompacta(cacTotalCalculado)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default CampanhasTable;
