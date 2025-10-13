export const parseValor = (valor: string): number => {
  if (!valor || typeof valor !== 'string') return 0;
  
  // Remove R$, espaços, e pontos de milhar
  const cleanValue = valor
    .replace(/R\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatarValor = (valor: number): string => {
  if (valor >= 1000) {
    return `${(valor / 1000).toFixed(1)}k`;
  }
  return valor.toFixed(0);
};

export const formatarReal = (valor: number): string => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

interface Squad {
  receita: number;
  contratos: number;
  membros: string[];
}

interface Metricas {
  // Metas
  metaMensal: number;
  metaSemanal: number;
  metaDiaria: number;
  
  // Receitas
  receitaTotal: number;
  receitaPaga: number;
  receitaAssinada: number;
  receitaSemanal: number;
  receitaDiaria: number;
  
  // Contratos
  totalContratos: number;
  
  // Calls
  totalCalls: number;
  callsQualificadas: number;
  callsRealizadas: number;
  callsAgendadas: number;
  noShow: number;
  
  // Taxas
  taxaQualificacao: number;
  taxaShow: number;
  taxaConversao: number;
  
  // Ticket
  ticketMedio: number;
  
  // Progressos
  progressoMetaMensal: number;
  progressoMetaSemanal: number;
  progressoMetaDiaria: number;
  
  // Squads
  squads: {
    hotDogs: Squad;
    corvoAzul: Squad;
    lider: 'hotDogs' | 'corvoAzul';
    vantagem: number;
    vantagemPercentual: number;
  };
  
  // Funil
  funil: {
    leads: number;
    mqls: number;
    callsAgendadas: number;
    callsRealizadas: number;
    contratos: number;
    receitaEsperada: number;
  };
}

export const calcularMetricas = (data: any[]): Metricas => {
  console.log('🔄 Calculando métricas com', data.length, 'linhas');
  
  // Metas fixas
  const metaMensal = 650000;
  const metaSemanal = 148000;
  const metaDiaria = 30000;
  
  // Filtros básicos
  const vendasGanhas = data.filter(row => row['FECHAMENTO']?.trim() === 'Ganho');
  const callsQualificadasList = data.filter(row => row['QUALIFICADA (SQL)']?.trim() === 'Sim');
  
  // Receitas
  const receitaTotal = vendasGanhas.reduce((acc, row) => acc + parseValor(row['VALOR']), 0);
  const receitaPaga = data
    .filter(row => row['PAGAMENTO']?.trim() === 'Pago')
    .reduce((acc, row) => acc + parseValor(row['VALOR']), 0);
  const receitaAssinada = data
    .filter(row => row['ASSINATURA']?.trim() === 'Assinado')
    .reduce((acc, row) => acc + parseValor(row['VALOR']), 0);
  
  // Receita semanal e diária (últimos 7 dias e hoje)
  const hoje = new Date();
  const seteDiasAtras = new Date(hoje);
  seteDiasAtras.setDate(hoje.getDate() - 7);
  
  const receitaSemanal = vendasGanhas
    .filter(row => {
      const dataEntrada = row['DATA DE ENTRADA'];
      if (!dataEntrada) return false;
      const data = new Date(dataEntrada);
      return data >= seteDiasAtras && data <= hoje;
    })
    .reduce((acc, row) => acc + parseValor(row['VALOR']), 0);
  
  const receitaDiaria = vendasGanhas
    .filter(row => {
      const dataEntrada = row['DATA DE ENTRADA'];
      if (!dataEntrada) return false;
      const data = new Date(dataEntrada);
      return data.toDateString() === hoje.toDateString();
    })
    .reduce((acc, row) => acc + parseValor(row['VALOR']), 0);
  
  // Contratos
  const totalContratos = vendasGanhas.length;
  
  // Calls
  const totalCalls = data.length;
  const callsQualificadas = callsQualificadasList.length;
  const callsRealizadas = data.filter(row => row['DATAHORA'] && row['DATAHORA'].trim() !== '').length;
  const callsAgendadas = totalCalls;
  const noShow = callsAgendadas - callsRealizadas;
  
  // Taxas
  const taxaQualificacao = totalCalls > 0 ? (callsQualificadas / totalCalls) * 100 : 0;
  const taxaShow = callsAgendadas > 0 ? (callsRealizadas / callsAgendadas) * 100 : 0;
  const taxaConversao = callsQualificadas > 0 ? (totalContratos / callsQualificadas) * 100 : 0;
  
  // Ticket médio
  const ticketMedio = totalContratos > 0 ? receitaTotal / totalContratos : 0;
  
  // Progressos
  const progressoMetaMensal = (receitaTotal / metaMensal) * 100;
  const progressoMetaSemanal = (receitaSemanal / metaSemanal) * 100;
  const progressoMetaDiaria = (receitaDiaria / metaDiaria) * 100;
  
  // Análise de Squads
  const membrosHotDogs = {
    sdrs: ['Marcos'],
    closers: ['Bruno', 'Cauã']
  };
  
  const membrosCorvoAzul = {
    sdrs: ['Vinícius'],
    closers: ['Gabriel Fernandes', 'Gabriel Franklin']
  };
  
  const vendasHotDogs = vendasGanhas.filter(row => {
    const sdr = row['SDR FECHOU']?.trim() || '';
    const closer = row['CLOSER FECHOU']?.trim() || '';
    return membrosHotDogs.sdrs.includes(sdr) || membrosHotDogs.closers.includes(closer);
  });
  
  const vendasCorvoAzul = vendasGanhas.filter(row => {
    const sdr = row['SDR FECHOU']?.trim() || '';
    const closer = row['CLOSER FECHOU']?.trim() || '';
    return membrosCorvoAzul.sdrs.includes(sdr) || membrosCorvoAzul.closers.includes(closer);
  });
  
  const receitaHotDogs = vendasHotDogs.reduce((acc, row) => acc + parseValor(row['VALOR']), 0);
  const receitaCorvoAzul = vendasCorvoAzul.reduce((acc, row) => acc + parseValor(row['VALOR']), 0);
  
  const lider = receitaHotDogs > receitaCorvoAzul ? 'hotDogs' : 'corvoAzul';
  const vantagem = Math.abs(receitaHotDogs - receitaCorvoAzul);
  const vantagemPercentual = receitaHotDogs > receitaCorvoAzul 
    ? ((receitaHotDogs - receitaCorvoAzul) / receitaCorvoAzul) * 100
    : ((receitaCorvoAzul - receitaHotDogs) / receitaHotDogs) * 100;
  
  const metricas: Metricas = {
    metaMensal,
    metaSemanal,
    metaDiaria,
    receitaTotal,
    receitaPaga,
    receitaAssinada,
    receitaSemanal,
    receitaDiaria,
    totalContratos,
    totalCalls,
    callsQualificadas,
    callsRealizadas,
    callsAgendadas,
    noShow,
    taxaQualificacao,
    taxaShow,
    taxaConversao,
    ticketMedio,
    progressoMetaMensal,
    progressoMetaSemanal,
    progressoMetaDiaria,
    squads: {
      hotDogs: {
        receita: receitaHotDogs,
        contratos: vendasHotDogs.length,
        membros: [...membrosHotDogs.sdrs, ...membrosHotDogs.closers]
      },
      corvoAzul: {
        receita: receitaCorvoAzul,
        contratos: vendasCorvoAzul.length,
        membros: [...membrosCorvoAzul.sdrs, ...membrosCorvoAzul.closers]
      },
      lider,
      vantagem,
      vantagemPercentual
    },
    funil: {
      leads: 2100,
      mqls: 734,
      callsAgendadas: 367,
      callsRealizadas: 275,
      contratos: 55,
      receitaEsperada: 650000
    }
  };
  
  console.log('✅ Métricas calculadas:', metricas);
  
  return metricas;
};
