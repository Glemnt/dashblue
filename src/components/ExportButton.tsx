import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Table } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface ExportButtonProps {
  pageTitle: string;
  period: string;
  data: any[];
  disabled?: boolean;
}

export const ExportButton = ({ pageTitle, period, data, disabled }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(pageTitle, 20, 20);
      doc.setFontSize(10);
      doc.text(period, 20, 30);
      
      let y = 40;
      data.forEach(item => {
        doc.text(`${item.label}: ${item.value}`, 20, y);
        y += 10;
      });
      
      doc.save(`${pageTitle}_${Date.now()}.pdf`);
      toast({ title: "PDF exportado com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao exportar PDF", variant: "destructive" });
    } finally {
      setIsExporting(false);
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
    <div className="flex gap-2">
      <Button onClick={handleExportPDF} disabled={disabled || isExporting} variant="outline" size="sm">
        <FileText className="w-4 h-4 mr-2" />
        PDF
      </Button>
      <Button onClick={handleExportExcel} disabled={disabled || isExporting} variant="outline" size="sm">
        <Table className="w-4 h-4 mr-2" />
        Excel
      </Button>
    </div>
  );
};
