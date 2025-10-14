export const parseValor = (valor: any): number => {
  if (valor === null || valor === undefined || valor === '') return 0;
  if (typeof valor === 'number') return isNaN(valor) ? 0 : valor;
  if (typeof valor !== 'string') return parseValor(String(valor));
  
  const cleanValue = valor
    .replace(/R\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatarReal = (valor: number): string => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export interface FinancialContract {
  nomeCall: string;
  dataFechamento: string;
  sdr: string;
  closer: string;
  valor: number;
  statusAssinatura: 'Assinado' | 'Enviado' | 'Não Enviado';
  statusPagamento: 'Pago' | 'Link Enviado' | 'Esperando Financeiro';
  statusGeral: 'Completo' | 'Parcial' | 'Pendente';
  squad: 'Hot Dogs' | 'Corvo Azul';
  assinado: boolean;
  pago: boolean;
}

export interface SquadFinancialMetrics {
  receitaTotal: number;
  receitaAssinada: number;
  receitaPaga: number;
  gapFinanceiro: number;
  taxaRecebimento: number;
  contratosTotal: number;
  contratosAssinados: number;
  contratosPagos: number;
}

export interface CollaboratorFinancialMetrics {
  nome: string;
  tipo: 'SDR' | 'Closer';
  squad: string;
  squadEmoji: string;
  receitaOriginada: number;
  receitaPaga: number;
  taxaRecebimento: number;
  gapFinanceiro: number;
  contratos: number;
}

export interface FinancialMetrics {
  receitas: {
    total: number;
    assinada: number;
    paga: number;
    gapAssinatura: number;
    gapPagamento: number;
    gapFinanceiroTotal: number;
    taxaAssinatura: number;
    taxaPagamento: number;
    taxaRecebimentoTotal: number;
  };
  contratos: {
    total: number;
    assinados: number;
    pagos: number;
    pendenteAssinatura: number;
    pendentePagamento: number;
  };
  porSquad: {
    hotDogs: SquadFinancialMetrics;
    corvoAzul: SquadFinancialMetrics;
  };
  porSDR: CollaboratorFinancialMetrics[];
  porCloser: CollaboratorFinancialMetrics[];
  listaContratos: FinancialContract[];
  distribuicaoStatus: {
    completos: number;
    parciais: number;
    pendentes: number;
  };
}

export const calcularMetricasFinanceiras = (data: any[]): FinancialMetrics => {
  console.log('📊 CALCULANDO MÉTRICAS FINANCEIRAS');
  console.log('Total de linhas recebidas:', data.length);

  // 1. Filtrar contratos ganhos
  const contratosGanhos = data.filter(row => {
    const fechamento = String(row['FECHAMENTO'] || '').trim().toUpperCase();
    const nomeCall = String(row['NOME DA CALL'] || '').trim().toUpperCase();
    
    if (nomeCall.includes('TOP') || nomeCall.includes('TOTAL') || !nomeCall) return false;
    
    return fechamento === 'SIM';
  });

  console.log('Contratos ganhos filtrados:', contratosGanhos.length);

  // 2. Processar cada contrato
  const contratos: FinancialContract[] = contratosGanhos.map(row => {
    const valor = parseValor(row['VALOR'] || '0');
    const assinatura = String(row['ASSINATURA'] || '').trim().toUpperCase();
    const pagamento = String(row['PAGAMENTO'] || '').trim().toUpperCase();
    const assinado = assinatura === 'ASSINOU';
    const pago = pagamento === 'PAGOU';
    
    let statusAssinatura: 'Assinado' | 'Enviado' | 'Não Enviado';
    if (assinado) {
      statusAssinatura = 'Assinado';
    } else if (assinatura === 'ENVIADO') {
      statusAssinatura = 'Enviado';
    } else {
      statusAssinatura = 'Não Enviado';
    }
    
    let statusPagamento: 'Pago' | 'Link Enviado' | 'Esperando Financeiro';
    if (pago) {
      statusPagamento = 'Pago';
    } else if (pagamento === 'LINK ENVIADO') {
      statusPagamento = 'Link Enviado';
    } else {
      statusPagamento = 'Esperando Financeiro';
    }
    
    let statusGeral: 'Completo' | 'Parcial' | 'Pendente';
    if (assinado && pago) statusGeral = 'Completo';
    else if (assinado) statusGeral = 'Parcial';
    else statusGeral = 'Pendente';
    
    const closer = String(row['CLOSER FECHOU'] || row['CLOSER'] || '').trim().toUpperCase();
    let squad: 'Hot Dogs' | 'Corvo Azul' = 'Hot Dogs';
    
    if (closer.includes('FERNANDES') || closer.includes('FRANKLIN') || closer.includes('VINICIUS') || closer.includes('VINÍCIUS')) {
      squad = 'Corvo Azul';
    }
    
    return {
      nomeCall: row['NOME DA CALL'] || 'Sem nome',
      dataFechamento: row['DATA'] || row['DATA DE ENTRADA'] || 'Sem data',
      sdr: row['SDR FECHOU'] || 'N/A',
      closer: row['CLOSER FECHOU'] || row['CLOSER'] || 'N/A',
      valor,
      statusAssinatura,
      statusPagamento,
      statusGeral,
      squad,
      assinado,
      pago
    };
  });

  console.log('Contratos processados:', contratos.length);

  // 3. Calcular receitas
  const receitaTotal = contratos.reduce((sum, c) => sum + c.valor, 0);
  const receitaAssinada = contratos.filter(c => c.assinado).reduce((sum, c) => sum + c.valor, 0);
  const receitaPaga = contratos.filter(c => c.pago).reduce((sum, c) => sum + c.valor, 0);

  console.log('Receita Total:', formatarReal(receitaTotal));
  console.log('Receita Assinada:', formatarReal(receitaAssinada));
  console.log('Receita Paga:', formatarReal(receitaPaga));

  // 4. Calcular gaps e taxas
  const gapAssinatura = receitaTotal - receitaAssinada;
  const gapPagamento = receitaAssinada - receitaPaga;
  const gapFinanceiroTotal = receitaTotal - receitaPaga;
  
  const taxaAssinatura = receitaTotal > 0 ? (receitaAssinada / receitaTotal) * 100 : 0;
  const taxaPagamento = receitaAssinada > 0 ? (receitaPaga / receitaAssinada) * 100 : 0;
  const taxaRecebimentoTotal = receitaTotal > 0 ? (receitaPaga / receitaTotal) * 100 : 0;

  // 5. Contratos por status
  const contratosTotal = contratos.length;
  const contratosAssinados = contratos.filter(c => c.assinado).length;
  const contratosPagos = contratos.filter(c => c.pago).length;
  const contratosPendenteAssinatura = contratosTotal - contratosAssinados;
  const contratosPendentePagamento = contratosAssinados - contratosPagos;

  // 6. Análise por Squad
  const calcularMetricasSquad = (squadName: 'Hot Dogs' | 'Corvo Azul'): SquadFinancialMetrics => {
    const contratosSquad = contratos.filter(c => c.squad === squadName);
    const receitaTotalSquad = contratosSquad.reduce((sum, c) => sum + c.valor, 0);
    const receitaAssinadaSquad = contratosSquad.filter(c => c.assinado).reduce((sum, c) => sum + c.valor, 0);
    const receitaPagaSquad = contratosSquad.filter(c => c.pago).reduce((sum, c) => sum + c.valor, 0);
    
    return {
      receitaTotal: receitaTotalSquad,
      receitaAssinada: receitaAssinadaSquad,
      receitaPaga: receitaPagaSquad,
      gapFinanceiro: receitaTotalSquad - receitaPagaSquad,
      taxaRecebimento: receitaTotalSquad > 0 ? (receitaPagaSquad / receitaTotalSquad) * 100 : 0,
      contratosTotal: contratosSquad.length,
      contratosAssinados: contratosSquad.filter(c => c.assinado).length,
      contratosPagos: contratosSquad.filter(c => c.pago).length
    };
  };

  // 7. Análise por Colaborador (SDRs)
  const sdrsUnicos = [...new Set(contratos.map(c => c.sdr).filter(s => s && s !== 'N/A'))];
  const porSDR: CollaboratorFinancialMetrics[] = sdrsUnicos.map(sdr => {
    const contratosSDR = contratos.filter(c => c.sdr === sdr);
    const receitaOriginada = contratosSDR.reduce((sum, c) => sum + c.valor, 0);
    const receitaPagaSDR = contratosSDR.filter(c => c.pago).reduce((sum, c) => sum + c.valor, 0);
    
    const sdrUpper = sdr.toUpperCase();
    const squadSDR = sdrUpper.includes('VINICIUS') || sdrUpper.includes('VINÍCIUS') ? 'Corvo Azul' : 
                     sdrUpper.includes('MARCOS') || sdrUpper.includes('BRUNO') || sdrUpper.includes('CAUÃ') || sdrUpper.includes('CAUA') ? 'Hot Dogs' : 'Sem Squad';
    const emoji = squadSDR === 'Hot Dogs' ? '🔴' : squadSDR === 'Corvo Azul' ? '🔵' : '⚪';
    
    return {
      nome: sdr,
      tipo: 'SDR' as const,
      squad: squadSDR,
      squadEmoji: emoji,
      receitaOriginada,
      receitaPaga: receitaPagaSDR,
      taxaRecebimento: receitaOriginada > 0 ? (receitaPagaSDR / receitaOriginada) * 100 : 0,
      gapFinanceiro: receitaOriginada - receitaPagaSDR,
      contratos: contratosSDR.length
    };
  }).sort((a, b) => b.receitaPaga - a.receitaPaga);

  // 8. Análise por Colaborador (Closers)
  const closersUnicos = [...new Set(contratos.map(c => c.closer).filter(c => c && c !== 'N/A'))];
  const porCloser: CollaboratorFinancialMetrics[] = closersUnicos.map(closer => {
    const contratosCloser = contratos.filter(c => c.closer === closer);
    const receitaFechada = contratosCloser.reduce((sum, c) => sum + c.valor, 0);
    const receitaPagaCloser = contratosCloser.filter(c => c.pago).reduce((sum, c) => sum + c.valor, 0);
    
    const closerUpper = closer.toUpperCase();
    const squadCloser = closerUpper.includes('FERNANDES') || closerUpper.includes('FRANKLIN') || closerUpper.includes('VINICIUS') || closerUpper.includes('VINÍCIUS') ? 'Corvo Azul' : 'Hot Dogs';
    const emoji = squadCloser === 'Hot Dogs' ? '🔴' : '🔵';
    
    return {
      nome: closer,
      tipo: 'Closer' as const,
      squad: squadCloser,
      squadEmoji: emoji,
      receitaOriginada: receitaFechada,
      receitaPaga: receitaPagaCloser,
      taxaRecebimento: receitaFechada > 0 ? (receitaPagaCloser / receitaFechada) * 100 : 0,
      gapFinanceiro: receitaFechada - receitaPagaCloser,
      contratos: contratosCloser.length
    };
  }).sort((a, b) => b.receitaPaga - a.receitaPaga);

  // 9. Distribuição de Status
  const distribuicaoStatus = {
    completos: contratos.filter(c => c.statusGeral === 'Completo').length,
    parciais: contratos.filter(c => c.statusGeral === 'Parcial').length,
    pendentes: contratos.filter(c => c.statusGeral === 'Pendente').length
  };

  return {
    receitas: {
      total: receitaTotal,
      assinada: receitaAssinada,
      paga: receitaPaga,
      gapAssinatura,
      gapPagamento,
      gapFinanceiroTotal,
      taxaAssinatura,
      taxaPagamento,
      taxaRecebimentoTotal
    },
    contratos: {
      total: contratosTotal,
      assinados: contratosAssinados,
      pagos: contratosPagos,
      pendenteAssinatura: contratosPendenteAssinatura,
      pendentePagamento: contratosPendentePagamento
    },
    porSquad: {
      hotDogs: calcularMetricasSquad('Hot Dogs'),
      corvoAzul: calcularMetricasSquad('Corvo Azul')
    },
    porSDR,
    porCloser,
    listaContratos: contratos,
    distribuicaoStatus
  };
};
