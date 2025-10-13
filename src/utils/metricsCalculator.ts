export const parseValor = (valor: any): number => {
  // Se não existe, retorna 0
  if (valor === null || valor === undefined || valor === '') return 0;
  
  // Se já é número, retorna direto
  if (typeof valor === 'number') {
    return isNaN(valor) ? 0 : valor;
  }
  
  // Se não é string, tenta converter
  if (typeof valor !== 'string') {
    const converted = String(valor);
    return parseValor(converted);
  }
  
  // Remove R$, espaços e pontos de milhar
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

// Função auxiliar para comparar valores ignorando case e espaços
const matchValue = (value: any, target: string): boolean => {
  if (!value) return false;
  return String(value).trim().toLowerCase() === target.toLowerCase();
};

// Função auxiliar para buscar valor de coluna com múltiplos nomes possíveis
const getColumnValue = (row: any, possibleNames: string[]): any => {
  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return row[name];
    }
  }
  return null;
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
  
  // Logging dos headers
  if (data.length > 0) {
    console.log('📋 Headers disponíveis:', Object.keys(data[0]));
    console.log('🔍 Valores únicos de FECHAMENTO:', [...new Set(data.map(row => getColumnValue(row, ['FECHAMENTO', 'STATUS'])))]);
    console.log('🔍 Valores únicos de QUALIFICADA (SQL):', [...new Set(data.map(row => getColumnValue(row, ['QUALIFICADA (SQL)', 'QUALIFICADA'])))]);
    console.log('🔍 Primeiros 5 valores de VALOR:', data.slice(0, 5).map(row => getColumnValue(row, ['VALOR'])));
  }
  
  // Função para verificar se um closer pertence a um squad (matching flexível)
  const closerPertenceAoSquad = (closerNome: string, closersDoSquad: string[]): boolean => {
    if (!closerNome) return false;
    const nomeNormalizado = closerNome.trim().toLowerCase();
    
    return closersDoSquad.some(closerSquad => {
      const squadNormalizado = closerSquad.trim().toLowerCase();
      
      // Match exato
      if (nomeNormalizado === squadNormalizado) return true;
      
      // Match parcial (nome contém o nome do squad ou vice-versa)
      if (nomeNormalizado.includes(squadNormalizado) || squadNormalizado.includes(nomeNormalizado)) return true;
      
      // Match por abreviação (ex: "G. Fernandes" contém "Fernandes")
      const partes = nomeNormalizado.split(' ');
      if (partes.some(parte => squadNormalizado.includes(parte) && parte.length > 2)) return true;
      
      return false;
    });
  };
  
  // Metas fixas
  const metaMensal = 650000;
  const metaSemanal = 148000;
  const metaDiaria = 30000;
  
  // Filtros básicos
  const vendasGanhas = data.filter(row => {
    const fechamento = getColumnValue(row, ['FECHAMENTO', 'STATUS']);
    return matchValue(fechamento, 'SIM');
  });
  
  console.log('💰 Vendas com FECHAMENTO = "SIM":', vendasGanhas.length);
  if (vendasGanhas.length > 0) {
    console.log('💰 Exemplo de venda ganha:', vendasGanhas[0]);
  }
  
  const callsQualificadasList = data.filter(row => {
    const qualificada = getColumnValue(row, ['QUALIFICADA (SQL)', 'QUALIFICADA', 'SQL']);
    return matchValue(qualificada, 'SIM');
  });
  
  // Receitas
  const receitaTotal = vendasGanhas.reduce((acc, row) => {
    const valor = parseValor(getColumnValue(row, ['VALOR', 'PREÇO']));
    if (valor > 0) {
      console.log('💵 Valor parseado:', valor, 'de', getColumnValue(row, ['VALOR', 'PREÇO']));
    }
    return acc + valor;
  }, 0);
  
  console.log('💰 Receita Total calculada:', receitaTotal);
  
  const receitaPaga = data
    .filter(row => {
      const pagamento = getColumnValue(row, ['PAGAMENTO', 'STATUS PAGAMENTO']);
      return matchValue(pagamento, 'PAGOU');
    })
    .reduce((acc, row) => acc + parseValor(getColumnValue(row, ['VALOR', 'PREÇO'])), 0);
  
  const receitaAssinada = data
    .filter(row => {
      const assinatura = getColumnValue(row, ['ASSINATURA', 'STATUS ASSINATURA']);
      return matchValue(assinatura, 'ASSINOU');
    })
    .reduce((acc, row) => acc + parseValor(getColumnValue(row, ['VALOR', 'PREÇO'])), 0);
  
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
  
  // Análise de Squads - APENAS pelos Closers que fecharam
  const membrosHotDogs = {
    closers: ['Bruno', 'Cauã']
  };
  
  const membrosCorvoAzul = {
    closers: ['Gabriel Fernandes', 'Gabriel Franklin', 'G. Fernandes', 'G. Franklin']
  };
  
  // Filtrar vendas APENAS pelo Closer que fechou (ignora SDR)
  const vendasHotDogs = vendasGanhas.filter(row => {
    const closer = String(getColumnValue(row, ['CLOSER FECHOU', 'CLOSER']) || '').trim();
    return closerPertenceAoSquad(closer, membrosHotDogs.closers);
  });
  
  const vendasCorvoAzul = vendasGanhas.filter(row => {
    const closer = String(getColumnValue(row, ['CLOSER FECHOU', 'CLOSER']) || '').trim();
    return closerPertenceAoSquad(closer, membrosCorvoAzul.closers);
  });
  
  const receitaHotDogs = vendasHotDogs.reduce((acc, row) => acc + parseValor(getColumnValue(row, ['VALOR', 'PREÇO'])), 0);
  const receitaCorvoAzul = vendasCorvoAzul.reduce((acc, row) => acc + parseValor(getColumnValue(row, ['VALOR', 'PREÇO'])), 0);
  
  // Logging detalhado da Guerra de Squads
  console.log('🏆 GUERRA DE SQUADS - DEBUG:');
  console.log('Hot Dogs (Bruno, Cauã):', {
    vendas: vendasHotDogs.length,
    receita: receitaHotDogs,
    closers: vendasHotDogs.map(v => getColumnValue(v, ['CLOSER FECHOU', 'CLOSER']))
  });
  console.log('Corvo Azul (G. Fernandes, G. Franklin):', {
    vendas: vendasCorvoAzul.length,
    receita: receitaCorvoAzul,
    closers: vendasCorvoAzul.map(v => getColumnValue(v, ['CLOSER FECHOU', 'CLOSER']))
  });
  
  // Verificar vendas não atribuídas
  const vendasAtribuidas = vendasHotDogs.length + vendasCorvoAzul.length;
  const vendasNaoAtribuidas = vendasGanhas.length - vendasAtribuidas;
  
  if (vendasNaoAtribuidas > 0) {
    console.warn('⚠️ ATENÇÃO: Existem', vendasNaoAtribuidas, 'vendas não atribuídas a nenhum squad');
    const vendaSemSquad = vendasGanhas.filter(row => {
      const closer = String(getColumnValue(row, ['CLOSER FECHOU', 'CLOSER']) || '').trim();
      return !closerPertenceAoSquad(closer, membrosHotDogs.closers) && 
             !closerPertenceAoSquad(closer, membrosCorvoAzul.closers);
    });
    console.warn('Vendas sem squad:', vendaSemSquad.map(v => ({
      call: getColumnValue(v, ['NOME DA CALL']),
      closer: getColumnValue(v, ['CLOSER FECHOU', 'CLOSER']),
      valor: getColumnValue(v, ['VALOR'])
    })));
  }
  
  const lider = receitaHotDogs > receitaCorvoAzul ? 'hotDogs' : 'corvoAzul';
  const vantagem = Math.abs(receitaHotDogs - receitaCorvoAzul);
  const vantagemPercentual = receitaHotDogs === 0 && receitaCorvoAzul === 0
    ? 0
    : receitaHotDogs > receitaCorvoAzul 
      ? receitaCorvoAzul > 0 ? ((receitaHotDogs - receitaCorvoAzul) / receitaCorvoAzul) * 100 : 100
      : receitaHotDogs > 0 ? ((receitaCorvoAzul - receitaHotDogs) / receitaHotDogs) * 100 : 100;
  
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
        membros: membrosHotDogs.closers
      },
      corvoAzul: {
        receita: receitaCorvoAzul,
        contratos: vendasCorvoAzul.length,
        membros: membrosCorvoAzul.closers
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
