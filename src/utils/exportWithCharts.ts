import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CaptureOptions {
  scale: number;
  backgroundColor: string;
  logging: boolean;
}

interface ChartCapture {
  title: string;
  imageData: string;
  width: number;
  height: number;
}

/**
 * Captura um elemento DOM como imagem usando html2canvas
 */
export async function captureElement(
  element: HTMLElement,
  options?: Partial<CaptureOptions>
): Promise<string> {
  const defaultOptions: CaptureOptions = {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false
  };
  
  const canvas = await html2canvas(element, {
    ...defaultOptions,
    ...options,
    useCORS: true,
    allowTaint: false
  });
  
  return canvas.toDataURL('image/png', 0.9);
}

/**
 * Compõe PDF com texto + imagens de gráficos
 */
export async function composePDFWithCharts(
  pageTitle: string,
  period: string,
  data: any[],
  charts: ChartCapture[]
): Promise<jsPDF> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let currentY = margin;
  
  // CABEÇALHO
  doc.setFontSize(20);
  doc.setTextColor(11, 17, 32); // #0B1120
  doc.text(pageTitle, pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 10;
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // #94A3B8
  doc.text(period, pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 15;
  
  // DADOS TABULARES
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  data.forEach(item => {
    if (currentY > pageHeight - 30) {
      doc.addPage();
      currentY = margin;
    }
    doc.text(`${item.label}: ${item.value}`, margin, currentY);
    currentY += 7;
  });
  
  currentY += 10;
  
  // GRÁFICOS
  for (const chart of charts) {
    // Calcular altura necessária para o gráfico
    const imgWidth = pageWidth - (margin * 2);
    const imgHeight = Math.min((chart.height / chart.width) * imgWidth, 100);
    const chartTotalHeight = imgHeight + 20; // incluindo título e espaçamento
    
    // Verifica se precisa adicionar nova página
    if (currentY + chartTotalHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
    }
    
    // Título do gráfico
    doc.setFontSize(14);
    doc.setTextColor(11, 17, 32);
    doc.text(chart.title, margin, currentY);
    currentY += 10;
    
    // Imagem do gráfico
    doc.addImage(
      chart.imageData,
      'PNG',
      margin,
      currentY,
      imgWidth,
      imgHeight
    );
    
    currentY += imgHeight + 15;
  }
  
  // RODAPÉ (todas as páginas)
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${i} de ${totalPages} - Gerado em ${new Date().toLocaleString('pt-BR')}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
  
  return doc;
}
