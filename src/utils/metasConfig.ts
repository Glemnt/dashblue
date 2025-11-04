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

export const METAS_POR_MES: Record<string, MetasMensais> = {
  'outubro-2025': {
    metaMensal: 650000,
    metaIndividualCloser: 162500, // 650k / 4 closers
    modelo: 'TCV',
    squads: {
      metaPorSquad: 325000, // 650k / 2 squads
      totalSquads: 2
    }
  },
  'novembro-2025': {
    metaMensal: 360000,
    metaIndividualCloser: 80000,
    modelo: 'MRR',
    squads: {
      metaPorSquad: 180000, // 360k / 2 squads
      totalSquads: 2
    }
  }
  // Fácil adicionar dezembro:
  // 'dezembro-2025': {
  //   metaMensal: 360000,
  //   metaIndividualCloser: 80000,
  //   modelo: 'MRR',
  //   squads: {
  //     metaPorSquad: 180000,
  //     totalSquads: 2
  //   }
  // }
};

export const getMetasPorMes = (monthKey: string): MetasMensais => {
  return METAS_POR_MES[monthKey] || METAS_POR_MES['novembro-2025']; // Default novembro
};

export const calcularMetaSemanal = (metaMensal: number): number => {
  // Considerando ~4 semanas por mês
  return metaMensal / 4;
};

export const calcularMetaDiaria = (metaMensal: number, diasUteis: number = 22): number => {
  // Considerando dias úteis médios por mês
  return metaMensal / diasUteis;
};
