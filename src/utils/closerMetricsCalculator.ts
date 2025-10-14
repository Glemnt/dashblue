import { DateRange } from './dateFilters';

export interface CloserContract {
  nome: string;
  valor: number;
  data: string;
  status: string;
  assinado: boolean;
  pago: boolean;
}

export interface CloserMetrics {
  nome: string;
  nomeOriginal: string;
  squad: string;
  squadColor: string;
  emoji: string;
  callsRealizadas: number;
  callsQualificadas: number;
  contratosFechados: number;
  taxaConversao: number;
  receitaTotal: number;
  receitaAssinada: number;
  receitaPaga: number;
  ticketMedio: number;
  taxaAssinatura: number;
  taxaPagamento: number;
  contratos: CloserContract[];
  // Dados do Dashboard VENDAS-OUTUBRO
  valorVendasDash?: number;
  percentualVendasDash?: number;
  ticketMedioDash?: number;
  callsRealizadasDash?: number;
  callsQualificadasDash?: number;
  numeroContratosDash?: number;
  taxaConversaoDash?: number;
}

export interface CloserData {
  closers: CloserMetrics[];
  totais: {
    receitaTotal: number;
    contratosTotais: number;
    ticketMedioGeral: number;
    taxaConversaoMedia: number;
    taxaAssinaturaMedia: number;
    taxaPagamentoMedia: number;
  };
  top3: CloserMetrics[];
  destaque: CloserMetrics | null;
}

const parseValor = (valorStr: string): number => {
  if (!valorStr) return 0;
  const cleanValue = String(valorStr).replace(/[R$\s.]/g, '').replace(',', '.');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

export const calcularMetricasCloser = (data: any[], dateRange?: DateRange): CloserData => {
  // Filtrar dados por data se necessário
  let filteredData = data;
  if (dateRange) {
    filteredData = data.filter(row => {
      const dataStr = row['DATA'] || row['Data'] || row['data'] || row['Data_Realizacao'];
      if (!dataStr) return true;
      
      try {
        let rowDate: Date;
        if (dataStr.includes('/')) {
          const [day, month, year] = dataStr.split('/');
          rowDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else if (dataStr.includes('-')) {
          rowDate = new Date(dataStr);
        } else {
          return true;
        }
        
        return rowDate >= dateRange.start && rowDate <= dateRange.end;
      } catch {
        return true;
      }
    });
  }

  const closersNomes = [
    { original: 'BRUNO', display: 'Bruno', squad: 'Hot Dogs', color: '#FF4757', emoji: '🔴' },
    { original: 'CAUÃ', display: 'Cauã', squad: 'Hot Dogs', color: '#FF4757', emoji: '🔴' },
    { original: 'GABRIEL FERNANDES', display: 'Gabriel Fernandes', squad: 'Corvo Azul', color: '#0066FF', emoji: '🔵' },
    { original: 'GABRIEL FRANKLIN', display: 'Gabriel Franklin', squad: 'Corvo Azul', color: '#0066FF', emoji: '🔵' }
  ];

  const closersMetrics: CloserMetrics[] = closersNomes.map(closer => {
    // Calls Realizadas: contar linhas onde CLOSER = nome
    const callsRealizadas = filteredData.filter(row => {
      const closerName = String(row['CLOSER'] || '').trim().toUpperCase();
      return closerName === closer.original;
    }).length;

    // Calls Qualificadas: CLOSER = nome E QUALIFICADA = "SIM"
    const callsQualificadas = filteredData.filter(row => {
      const closerName = String(row['CLOSER'] || '').trim().toUpperCase();
      const qualificada = String(row['QUALIFICADA (SQL)'] || '').trim().toUpperCase();
      return closerName === closer.original && qualificada === 'SIM';
    }).length;

    // Contratos Fechados e Receitas
    const contratosFechados = filteredData.filter(row => {
      const closerFechou = String(row['CLOSER FECHOU'] || '').trim().toUpperCase();
      const fechamento = String(row['FECHAMENTO'] || '').trim().toUpperCase();
      return closerFechou === closer.original && fechamento === 'GANHO';
    });

    const contratos: CloserContract[] = contratosFechados.map(row => {
      const valor = parseValor(row['VALOR'] || '0');
      const assinado = String(row['ASSINATURA'] || '').trim().toUpperCase() === 'ASSINADO';
      const pago = String(row['PAGAMENTO'] || '').trim().toUpperCase() === 'PAGO';
      
      let status = 'Pendente Assinatura';
      if (assinado && pago) status = 'Assinado + Pago';
      else if (assinado) status = 'Pendente Pagamento';

      return {
        nome: row['EMPRESA'] || row['Empresa'] || 'Contrato',
        valor,
        data: row['DATA'] || row['Data'] || 'Sem data',
        status,
        assinado,
        pago
      };
    });

    const receitaTotal = contratos.reduce((sum, c) => sum + c.valor, 0);
    const receitaAssinada = contratos.filter(c => c.assinado).reduce((sum, c) => sum + c.valor, 0);
    const receitaPaga = contratos.filter(c => c.pago).reduce((sum, c) => sum + c.valor, 0);

    const contratosFechadosCount = contratos.length;
    const ticketMedio = contratosFechadosCount > 0 ? receitaTotal / contratosFechadosCount : 0;
    const taxaConversao = callsQualificadas > 0 ? (contratosFechadosCount / callsQualificadas) * 100 : 0;
    const taxaAssinatura = receitaTotal > 0 ? (receitaAssinada / receitaTotal) * 100 : 0;
    const taxaPagamento = receitaAssinada > 0 ? (receitaPaga / receitaAssinada) * 100 : 0;

    return {
      nome: closer.display,
      nomeOriginal: closer.original,
      squad: closer.squad,
      squadColor: closer.color,
      emoji: closer.emoji,
      callsRealizadas,
      callsQualificadas,
      contratosFechados: contratosFechadosCount,
      taxaConversao,
      receitaTotal,
      receitaAssinada,
      receitaPaga,
      ticketMedio,
      taxaAssinatura,
      taxaPagamento,
      contratos
    };
  });

  // Totais
  const receitaTotal = closersMetrics.reduce((sum, c) => sum + c.receitaTotal, 0);
  const contratosTotais = closersMetrics.reduce((sum, c) => sum + c.contratosFechados, 0);
  const ticketMedioGeral = contratosTotais > 0 ? receitaTotal / contratosTotais : 0;
  const taxaConversaoMedia = closersMetrics.reduce((sum, c) => sum + c.taxaConversao, 0) / closersMetrics.length;
  const taxaAssinaturaMedia = closersMetrics.reduce((sum, c) => sum + c.taxaAssinatura, 0) / closersMetrics.length;
  const taxaPagamentoMedia = closersMetrics.reduce((sum, c) => sum + c.taxaPagamento, 0) / closersMetrics.length;

  // Top 3 por receita
  const top3 = [...closersMetrics].sort((a, b) => b.receitaTotal - a.receitaTotal).slice(0, 3);

  // Destaque (maior receita)
  const destaque = closersMetrics.length > 0 
    ? closersMetrics.reduce((max, c) => c.receitaTotal > max.receitaTotal ? c : max, closersMetrics[0])
    : null;

  return {
    closers: closersMetrics,
    totais: {
      receitaTotal,
      contratosTotais,
      ticketMedioGeral,
      taxaConversaoMedia,
      taxaAssinaturaMedia,
      taxaPagamentoMedia
    },
    top3,
    destaque
  };
};

// Função para mesclar dados calculados com dados do dashboard
export const mesclarMetricasComDashboard = (
  metricasCalculadas: CloserData,
  dadosDashboard: Array<{
    nome: string;
    valorVendas: number;
    percentualVendas: number;
    ticketMedio: number;
    callsRealizadas: number;
    callsQualificadas: number;
    numeroContratos: number;
    taxaConversao: number;
  }>
): CloserData => {
  const closersMap = new Map(
    dadosDashboard.map(d => [d.nome.toUpperCase(), d])
  );

  const closersMesclados = metricasCalculadas.closers.map(closer => {
    // Tentar match por nome
    let dashData = closersMap.get(closer.nomeOriginal);
    
    // Tentar match alternativo (G. Franklin -> GABRIEL FRANKLIN, etc)
    if (!dashData) {
      if (closer.nomeOriginal === 'GABRIEL FRANKLIN') {
        dashData = closersMap.get('G. FRANKLIN');
      } else if (closer.nomeOriginal === 'GABRIEL FERNANDES') {
        dashData = closersMap.get('G. FERNANDES');
      }
    }

    if (dashData) {
      return {
        ...closer,
        // Usar dados do dashboard como principal
        receitaTotal: dashData.valorVendas,
        ticketMedio: dashData.ticketMedio,
        callsRealizadas: dashData.callsRealizadas,
        callsQualificadas: dashData.callsQualificadas,
        contratosFechados: dashData.numeroContratos,
        taxaConversao: dashData.taxaConversao,
        // Manter dados do dashboard separados
        valorVendasDash: dashData.valorVendas,
        percentualVendasDash: dashData.percentualVendas,
        ticketMedioDash: dashData.ticketMedio,
        callsRealizadasDash: dashData.callsRealizadas,
        callsQualificadasDash: dashData.callsQualificadas,
        numeroContratosDash: dashData.numeroContratos,
        taxaConversaoDash: dashData.taxaConversao
      };
    }

    return closer;
  });

  // Recalcular top3 e destaque com dados mesclados
  const top3 = [...closersMesclados].sort((a, b) => b.receitaTotal - a.receitaTotal).slice(0, 3);
  const destaque = closersMesclados.length > 0 
    ? closersMesclados.reduce((max, c) => c.receitaTotal > max.receitaTotal ? c : max, closersMesclados[0])
    : null;

  // Recalcular totais
  const receitaTotal = closersMesclados.reduce((sum, c) => sum + c.receitaTotal, 0);
  const contratosTotais = closersMesclados.reduce((sum, c) => sum + c.contratosFechados, 0);
  const ticketMedioGeral = contratosTotais > 0 ? receitaTotal / contratosTotais : 0;
  const taxaConversaoMedia = closersMesclados.reduce((sum, c) => sum + c.taxaConversao, 0) / closersMesclados.length;

  return {
    closers: closersMesclados,
    totais: {
      ...metricasCalculadas.totais,
      receitaTotal,
      contratosTotais,
      ticketMedioGeral,
      taxaConversaoMedia
    },
    top3,
    destaque
  };
};
