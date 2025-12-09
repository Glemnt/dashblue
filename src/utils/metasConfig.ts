interface MetasSquads {
  metaPorSquad: number;
  totalSquads: number;
}

interface MetasMensais {
  metaMensal: number;
  metaIndividualCloser: number;
  modelo: 'TCV' | 'MRR';
  squads: MetasSquads;
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
  'dezembro-2025': {
    // Metas base
    investimentoMensal: 220000,
    metaReceita: 325000,
    ticketMedio: 4000,
    
    // Funil invertido:
    // Meta 325k / Ticket 4k = 82 vendas
    // 82 vendas / 20% taxa fechamento = 410 calls realizadas
    // 410 calls / 80% taxa realização = 513 calls agendadas (MQL)
    // 513 MQL / 50% taxa qualificação = 1026 leads
    fechamentos: 82,
    callsRealizadas: 410,
    callsAgendadas: 513,
    leads: 1026,
    
    // Taxas de conversão meta
    taxaLeadParaQualificado: 0.50,
    taxaCallAgendadaParaRealizada: 0.80,
    taxaCallParaFechamento: 0.20,
    
    // Métricas derivadas
    cplMeta: 214.42,    // 220k / 1026 leads
    cacMeta: 2682.93,   // 220k / 82 fechamentos
    roasMinimo: 1.48    // 325k / 220k
  }
};

export const getMetasTrafegoAtual = (monthKey?: string): MetasTrafego => {
  const key = monthKey || getCurrentMonthKey();
  return METAS_TRAFEGO_POR_MES[key] || METAS_TRAFEGO_POR_MES['dezembro-2025'];
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
    }
  },
  'novembro-2025': {
    metaMensal: 360000,
    metaIndividualCloser: 80000,
    modelo: 'MRR',
    squads: {
      metaPorSquad: 180000,
      totalSquads: 2
    }
  },
  'dezembro-2025': {
    metaMensal: 325000,
    metaIndividualCloser: 65000,
    modelo: 'MRR',
    squads: {
      metaPorSquad: 162500,
      totalSquads: 2
    }
  }
};

export const getMetasPorMes = (monthKey: string): MetasMensais => {
  return METAS_POR_MES[monthKey] || METAS_POR_MES['dezembro-2025']; // Default dezembro
};

export const calcularMetaSemanal = (metaMensal: number): number => {
  // Considerando ~4 semanas por mês
  return metaMensal / 4;
};

export const calcularMetaDiaria = (metaMensal: number, diasUteis: number = 22): number => {
  // Considerando dias úteis médios por mês
  return metaMensal / diasUteis;
};
