import { useState, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Table, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { captureElement, composePDFWithCharts } from '@/utils/exportWithCharts';

interface ChartRef {
  title: string;
  ref: RefObject<HTMLDivElement>;
}

interface ExportButtonProps {
  pageTitle: string;
  period: string;
  data: any[];
  chartRefs?: ChartRef[];
  disabled?: boolean;
}

export const ExportButton = ({ pageTitle, period, data, chartRefs = [], disabled }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const { toast } = useToast();

  const handleExportPDF = async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      // PASSO 1: Capturar gráficos (se houver)
      const chartCaptures = [];
      
      if (chartRefs.length > 0) {
        toast({ 
          title: "Capturando gráficos...", 
          description: `0 de ${chartRefs.length} concluídos` 
        });
        
        for (let i = 0; i < chartRefs.length; i++) {
          const chart = chartRefs[i];
          if (chart.ref.current) {
            const imageData = await captureElement(chart.ref.current);
            
            chartCaptures.push({
              title: chart.title,
              imageData,
              width: chart.ref.current.offsetWidth,
              height: chart.ref.current.offsetHeight
            });
            
            setExportProgress(((i + 1) / chartRefs.length) * 50);
            
            toast({ 
              title: "Capturando gráficos...", 
              description: `${i + 1} de ${chartRefs.length} concluídos` 
            });
          }
        }
      }
      
      // PASSO 2: Compor PDF
      setExportProgress(60);
      toast({ title: "Gerando PDF..." });
      
      const doc = await composePDFWithCharts(
        pageTitle,
        period,
        data,
        chartCaptures
      );
      
      // PASSO 3: Salvar
      setExportProgress(90);
      doc.save(`${pageTitle}_${Date.now()}.pdf`);
      
      setExportProgress(100);
      toast({ 
        title: "PDF exportado com sucesso!", 
        description: chartCaptures.length > 0 
          ? `Incluindo ${chartCaptures.length} gráfico(s)` 
          : undefined
      });
      
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({ 
        title: "Erro ao exportar PDF", 
        variant: "destructive",
        description: error instanceof Error ? error.message : "Erro desconhecido"
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Dados");
      XLSX.writeFile(wb, `${pageTitle}_${Date.now()}.xlsx`);
      toast({ title: "Excel exportado com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao exportar Excel", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      {isExporting && exportProgress > 0 && (
        <span className="text-sm text-[#94A3B8]">
          {exportProgress.toFixed(0)}%
        </span>
      )}
      
      <Button 
        onClick={handleExportPDF} 
        disabled={disabled || isExporting} 
        variant="outline" 
        size="sm"
      >
        {isExporting && exportProgress > 0 ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <FileText className="w-4 h-4 mr-2" />
        )}
        PDF
      </Button>
      
      <Button 
        onClick={handleExportExcel} 
        disabled={disabled || isExporting} 
        variant="outline" 
        size="sm"
      >
        <Table className="w-4 h-4 mr-2" />
        Excel
      </Button>
    </div>
  );
};
