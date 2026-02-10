// ==========================================
// THRESHOLDS GLOBAIS
// ==========================================

export const THRESHOLDS_GLOBAIS = {
  // Thresholds para barras de progresso (padrão simples - metas absolutas)
  progressoVerde: 100,    // >= 100% = verde
  progressoAmarelo: 80,   // >= 80% = amarelo
  
  // Thresholds alternativos para métricas de performance
  progressoVerdePerformance: 90,   // >= 90% = verde
  progressoAmareloPerformance: 70, // >= 70% = amarelo
  
  // Alerta de gap financeiro
  alertaGapFinanceiro: 0.3,  // > 30% do total = alerta
  
  // Cores padrão
  cores: {
    verde: '#00E5CC',
    amarelo: '#FFB800',
    vermelho: '#FF4757'
  }
};

// ==========================================
// INTERFACES
// ==========================================

interface MetasSquads {
  metaPorSquad: number;
  totalSquads: number;
}

interface MetasMensais {
  metaMensal: number;
  metaIndividualCloser: number;
  modelo: 'TCV' | 'MRR';
  squads: MetasSquads;
  // Metas Closer (opcionais para retrocompatibilidade)
  metaTicketMedioCloser?: number;
  metaTaxaConversao?: number;
  metaTaxaAssinatura?: number;
  metaTaxaPagamento?: number;
  // Metas Financeiras
  metaTaxaRecebimentoMinimo?: number;
  // Metas SDR
  metaTaxaQualificacaoSDR?: number;
  metaTaxaShowSDR?: number;
  numSDRs?: number;
}

// ==========================================
// METAS DE TRÁFEGO COM FUNIL INVERTIDO
// ==========================================

export interface MetasTrafego {
  // Metas base
  investimentoMensal: number;
  metaReceita: number;
  ticketMedio: number;
  
  // Metas do funil (calculadas de baixo para cima)
  fechamentos: number;
  callsRealizadas: number;
  callsAgendadas: number; // = MQL (leads qualificados)
  leads: number;
  
  // Taxas de conversão meta
  taxaLeadParaQualificado: number;      // 50%
  taxaCallAgendadaParaRealizada: number; // 80%
  taxaCallParaFechamento: number;        // 20%
  
  // Métricas derivadas
  cplMeta: number;
  cacMeta: number;
  roasMinimo: number;
}

export const METAS_TRAFEGO_POR_MES: Record<string, MetasTrafego> = {
  'outubro-2025': {
    investimentoMensal: 220000,
    metaReceita: 325000,
    ticketMedio: 4000,
    fechamentos: 82,
    callsRealizadas: 410,
    callsAgendadas: 513,
    leads: 1026,
    taxaLeadParaQualificado: 0.50,
    taxaCallAgendadaParaRealizada: 0.80,
    taxaCallParaFechamento: 0.20,
    cplMeta: 214.42,
    cacMeta: 2682.93,
    roasMinimo: 1.48
  },
  'novembro-2025': {
    investimentoMensal: 220000,
    metaReceita: 325000,
    ticketMedio: 4000,
    fechamentos: 82,
    callsRealizadas: 410,
    callsAgendadas: 513,
    leads: 1026,
    taxaLeadParaQualificado: 0.50,
    taxaCallAgendadaParaRealizada: 0.80,
    taxaCallParaFechamento: 0.20,
    cplMeta: 214.42,
    cacMeta: 2682.93,
    roasMinimo: 1.48
  },
  'dezembro-2025': {
    investimentoMensal: 220000,
    metaReceita: 325000,
    ticketMedio: 4000,
    fechamentos: 82,
    callsRealizadas: 410,
    callsAgendadas: 513,
    leads: 1026,
    taxaLeadParaQualificado: 0.50,
    taxaCallAgendadaParaRealizada: 0.80,
    taxaCallParaFechamento: 0.20,
    cplMeta: 214.42,
    cacMeta: 2682.93,
    roasMinimo: 1.48
  },
  'janeiro-2026': {
    investimentoMensal: 220000,
    metaReceita: 350000,
    ticketMedio: 4000,
    fechamentos: 88,
    callsRealizadas: 440,
    callsAgendadas: 550,
    leads: 1100,
    taxaLeadParaQualificado: 0.50,
    taxaCallAgendadaParaRealizada: 0.80,
    taxaCallParaFechamento: 0.20,
    cplMeta: 200,
    cacMeta: 2500,
    roasMinimo: 1.59
  },
  'fevereiro-2026': {
    investimentoMensal: 220000,
    metaReceita: 310000,
    ticketMedio: 4000,
    fechamentos: 78,
    callsRealizadas: 390,
    callsAgendadas: 488,
    leads: 975,
    taxaLeadParaQualificado: 0.50,
    taxaCallAgendadaParaRealizada: 0.80,
    taxaCallParaFechamento: 0.20,
    cplMeta: 225.64,
    cacMeta: 2820.51,
    roasMinimo: 1.41
  }
};

export const getMetasTrafegoAtual = (monthKey?: string): MetasTrafego => {
  const key = monthKey || getCurrentMonthKey();
  return METAS_TRAFEGO_POR_MES[key] || METAS_TRAFEGO_POR_MES['fevereiro-2026'];
};

const getCurrentMonthKey = (): string => {
  const now = new Date();
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return `${meses[now.getMonth()]}-${now.getFullYear()}`;
};

// ==========================================
// METAS COMERCIAIS (EXISTENTES)
// ==========================================

export const METAS_POR_MES: Record<string, MetasMensais> = {
  'outubro-2025': {
    metaMensal: 650000,
    metaIndividualCloser: 162500,
    modelo: 'TCV',
    squads: {
      metaPorSquad: 325000,
      totalSquads: 2
    },
    metaTicketMedioCloser: 4200,
    metaTaxaConversao: 28,
    metaTaxaAssinatura: 100,
    metaTaxaPagamento: 100,
    metaTaxaRecebimentoMinimo: 90,
    metaTaxaQualificacaoSDR: 50,
    metaTaxaShowSDR: 75,
    numSDRs: 3
  },
  'novembro-2025': {
    metaMensal: 360000,
    metaIndividualCloser: 80000,
    modelo: 'MRR',
    squads: {
      metaPorSquad: 180000,
      totalSquads: 2
    },
    metaTicketMedioCloser: 4200,
    metaTaxaConversao: 28,
    metaTaxaAssinatura: 100,
    metaTaxaPagamento: 100,
    metaTaxaRecebimentoMinimo: 90,
    metaTaxaQualificacaoSDR: 50,
    metaTaxaShowSDR: 75,
    numSDRs: 3
  },
  'dezembro-2025': {
    metaMensal: 325000,
    metaIndividualCloser: 65000,
    modelo: 'MRR',
    squads: {
      metaPorSquad: 162500,
      totalSquads: 2
    },
    metaTicketMedioCloser: 4200,
    metaTaxaConversao: 28,
    metaTaxaAssinatura: 100,
    metaTaxaPagamento: 100,
    metaTaxaRecebimentoMinimo: 90,
    metaTaxaQualificacaoSDR: 50,
    metaTaxaShowSDR: 75,
    numSDRs: 3
  },
  'janeiro-2026': {
    metaMensal: 300000,
    metaIndividualCloser: 50000,
    modelo: 'MRR',
    squads: {
      metaPorSquad: 150000,
      totalSquads: 2
    },
    metaTicketMedioCloser: 4200,
    metaTaxaConversao: 28,
    metaTaxaAssinatura: 100,
    metaTaxaPagamento: 100,
    metaTaxaRecebimentoMinimo: 90,
    metaTaxaQualificacaoSDR: 50,
    metaTaxaShowSDR: 75,
    numSDRs: 3
  },
  'fevereiro-2026': {
    metaMensal: 310000,
    metaIndividualCloser: 51666,
    modelo: 'MRR',
    squads: {
      metaPorSquad: 103333,
      totalSquads: 3
    },
    metaTicketMedioCloser: 4200,
    metaTaxaConversao: 28,
    metaTaxaAssinatura: 100,
    metaTaxaPagamento: 100,
    metaTaxaRecebimentoMinimo: 90,
    metaTaxaQualificacaoSDR: 50,
    metaTaxaShowSDR: 75,
    numSDRs: 3
  }
};

export const getMetasPorMes = (monthKey: string): MetasMensais => {
  return METAS_POR_MES[monthKey] || METAS_POR_MES['fevereiro-2026'];
};

export const calcularMetaSemanal = (metaMensal: number): number => {
  // Considerando ~4 semanas por mês
  return metaMensal / 4;
};

export const calcularMetaDiaria = (metaMensal: number, diasUteis: number = 22): number => {
  // Considerando dias úteis médios por mês
  return metaMensal / diasUteis;
};
