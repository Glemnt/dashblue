import { DateRange } from './dateFilters';

export interface CloserContract {
  nome: string;
  valor: number;
  data: string;
  status: string;
  assinado: boolean;
  pago: boolean;
  observacoes?: string;
}

export interface CallData {
  nomeCall: string;
  data: string;
  sdr: string;
  tipoCall: string;
  qualificada: boolean;
  fechamento: boolean;
  valor: number;
  observacoes: string;
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
  callsRealizadasData: CallData[];
  callsQualificadasData: CallData[];
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

// Função auxiliar para matching de nomes (inclui abreviações)
const matchCloserName = (closerFechou: string, closerOriginal: string): boolean => {
  if (closerFechou === closerOriginal) return true;
  
  // Match abreviado
  if (closerOriginal === 'GABRIEL FERNANDES' && closerFechou === 'G. FERNANDES') return true;
  if (closerOriginal === 'GABRIEL FRANKLIN' && closerFechou === 'G. FRANKLIN') return true;
  
  return false;
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

  // 🔍 DEBUG LOGS
  console.log('🔍 DEBUG calcularMetricasCloser:');
  console.log('📊 Total de linhas filtradas:', filteredData.length);

  // Ver quantas têm FECHAMENTO = "SIM"
  const linhasFechamento = filteredData.filter(row => {
    const fechamento = String(row['FECHAMENTO'] || '').trim().toUpperCase();
    return fechamento === 'SIM';
  });
  console.log('📊 Linhas com FECHAMENTO = "SIM":', linhasFechamento.length);

  // Ver nomes únicos em CLOSER FECHOU
  const nomesClosers = [...new Set(
    linhasFechamento
      .map(r => String(r['CLOSER FECHOU'] || '').trim())
      .filter(n => n !== '')
  )];
  console.log('📊 Nomes em CLOSER FECHOU:', nomesClosers);

  // Determinar equipe baseada no período
  const isOutubro = dateRange && dateRange.start.getMonth() === 9 && dateRange.start.getFullYear() === 2025;
  const isDezembro = dateRange && dateRange.start.getMonth() === 11 && dateRange.start.getFullYear() === 2025;
  const isJaneiro = dateRange && dateRange.start.getMonth() === 0 && dateRange.start.getFullYear() === 2026;
  const isFevereiro = dateRange && dateRange.start.getMonth() === 1 && dateRange.start.getFullYear() === 2026;
  const isMarco = dateRange && dateRange.start.getMonth() === 2 && dateRange.start.getFullYear() === 2026;

  if (isMarco || isFevereiro) {
    // MARÇO/FEVEREIRO 2026: 6 closers em 3 squads, Davi apenas Closer
    closersNomes = [
      { original: 'BRUNO', display: 'Bruno', squad: 'Hot Dogs', color: '#FF4757', emoji: '🔴' },
      { original: 'CAUÃ', display: 'Cauã', squad: 'Hot Dogs', color: '#FF4757', emoji: '🔴' },
      { original: 'MARCOS', display: 'Marcos', squad: 'Corvo Azul', color: '#0066FF', emoji: '🔵' },
      { original: 'GABRIEL FRANKLIN', display: 'Gabriel Franklin', squad: 'Corvo Azul', color: '#0066FF', emoji: '🔵' },
      { original: 'DAVI', display: 'Davi', squad: 'Ki Karnes', color: '#FF6B00', emoji: '🟠' },
      { original: 'GABRIEL FERNANDES', display: 'Gabriel Fernandes', squad: 'Ki Karnes', color: '#FF6B00', emoji: '🟠' }
    ];
  } else if (isJaneiro) {
    // JANEIRO 2026: 6 closers - Davi (função dupla SDR/Closer) no Hot Dogs
    closersNomes = [
      { original: 'BRUNO', display: 'Bruno', squad: 'Hot Dogs', color: '#FF4757', emoji: '🔴' },
      { original: 'GABRIEL FRANKLIN', display: 'Gabriel Franklin', squad: 'Hot Dogs', color: '#FF4757', emoji: '🔴' },
      { original: 'DAVI', display: 'Davi', squad: 'Hot Dogs', color: '#FF4757', emoji: '🔴' },
      { original: 'MARCOS', display: 'Marcos', squad: 'Corvo Azul', color: '#0066FF', emoji: '🔵' },
      { original: 'CAUÃ', display: 'Cauã', squad: 'Corvo Azul', color: '#0066FF', emoji: '🔵' },
      { original: 'GABRIEL FERNANDES', display: 'Gabriel Fernandes', squad: 'Sem Squad', color: '#64748B', emoji: '⚪' }
    ];
  } else if (isOutubro) {
    // OUTUBRO: Gabriel Fernandes como Closer, sem Marcos
    closersNomes = [
      { original: 'BRUNO', display: 'Bruno', squad: 'Hot Dogs', color: '#FF4757', emoji: '🔴' },
      { original: 'CAUÃ', display: 'Cauã', squad: 'Hot Dogs', color: '#FF4757', emoji: '🔴' },
      { original: 'GABRIEL FERNANDES', display: 'Gabriel Fernandes', squad: 'Corvo Azul', color: '#0066FF', emoji: '🔵' },
      { original: 'GABRIEL FRANKLIN', display: 'Gabriel Franklin', squad: 'Corvo Azul', color: '#0066FF', emoji: '🔵' }
    ];
  } else if (isDezembro) {
    // DEZEMBRO: Franklin e Bruno no Hot Dogs, Marcos e Cauã no Corvo Azul, Fernandes sem squad
    closersNomes = [
      { original: 'BRUNO', display: 'Bruno', squad: 'Hot Dogs', color: '#FF4757', emoji: '🔴' },
      { original: 'GABRIEL FRANKLIN', display: 'Gabriel Franklin', squad: 'Hot Dogs', color: '#FF4757', emoji: '🔴' },
      { original: 'MARCOS', display: 'Marcos', squad: 'Corvo Azul', color: '#0066FF', emoji: '🔵' },
      { original: 'CAUÃ', display: 'Cauã', squad: 'Corvo Azul', color: '#0066FF', emoji: '🔵' },
      { original: 'GABRIEL FERNANDES', display: 'Gabriel Fernandes', squad: 'Sem Squad', color: '#64748B', emoji: '⚪' }
    ];
  } else {
    // NOVEMBRO: Marcos e Cauã no Corvo Azul, Franklin e Bruno no Hot Dogs
    closersNomes = [
      { original: 'BRUNO', display: 'Bruno', squad: 'Hot Dogs', color: '#FF4757', emoji: '🔴' },
      { original: 'GABRIEL FRANKLIN', display: 'Gabriel Franklin', squad: 'Hot Dogs', color: '#FF4757', emoji: '🔴' },
      { original: 'MARCOS', display: 'Marcos', squad: 'Corvo Azul', color: '#0066FF', emoji: '🔵' },
      { original: 'CAUÃ', display: 'Cauã', squad: 'Corvo Azul', color: '#0066FF', emoji: '🔵' }
    ];
  }

  const closersMetrics: CloserMetrics[] = closersNomes.map(closer => {
    // Calls Realizadas: guardar dados completos
    const callsRealizadasData: CallData[] = filteredData
      .filter(row => {
        const closerName = String(row['CLOSER'] || '').trim().toUpperCase();
        return matchCloserName(closerName, closer.original);
      })
      .map(row => ({
        nomeCall: row['NOME DA CALL'] || 'Sem nome',
        data: row['DATA'] || row['Data'] || 'Sem data',
        sdr: row['SDR'] || '',
        tipoCall: row['TIPO DA CALL'] || '',
        qualificada: String(row['QUALIFICADA (SQL)'] || '').trim().toUpperCase() === 'SIM',
        fechamento: String(row['FECHAMENTO'] || '').trim().toUpperCase() === 'SIM',
        valor: parseValor(row['VALOR'] || '0'),
        observacoes: row['OBSERVAÇÕES E PRÓXIMOS PASSOS'] || ''
      }));

    const callsRealizadas = callsRealizadasData.length;

    // Calls Qualificadas: filtrar do array de realizadas
    const callsQualificadasData = callsRealizadasData.filter(call => call.qualificada);
    const callsQualificadas = callsQualificadasData.length;

    // Contratos Fechados e Receitas
    const contratosFechados = filteredData.filter(row => {
      const closerFechou = String(row['CLOSER FECHOU'] || '').trim().toUpperCase();
      const fechamento = String(row['FECHAMENTO'] || '').trim().toUpperCase();
      
      // Match por nome exato OU abreviado
      const nomeMatch = matchCloserName(closerFechou, closer.original);
      
      // FECHAMENTO = "SIM" (não "GANHO")
      return nomeMatch && fechamento === 'SIM';
    });

    const contratos: CloserContract[] = contratosFechados.map(row => {
      const valor = parseValor(row['VALOR'] || '0');
      const assinatura = String(row['ASSINATURA'] || '').trim().toUpperCase();
      const pagamento = String(row['PAGAMENTO'] || '').trim().toUpperCase();
      const assinado = assinatura === 'ASSINOU';
      const pago = pagamento === 'PAGOU';
      
      let status = 'Pendente Assinatura';
      if (assinado && pago) status = 'Assinado + Pago';
      else if (assinado) status = 'Pendente Pagamento';

      return {
        nome: row['NOME DA CALL'] || 'Contrato',
        valor,
        data: row['DATA'] || row['Data'] || 'Sem data',
        status,
        assinado,
        pago,
        observacoes: row['OBSERVAÇÕES E PRÓXIMOS PASSOS'] || ''
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
      contratos,
      callsRealizadasData,
      callsQualificadasData
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
