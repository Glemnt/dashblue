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
    callsQualificadas: number;
    contratos: number;
    receitaEsperada: number;
  };
}

import { getMetasPorMes, calcularMetaSemanal, calcularMetaDiaria } from './metasConfig';

export const calcularMetricas = (
  data: any[],
  dadosMarketing?: {
    totalLeads: number;
    totalMQLs: number;
  },
  monthKey?: string
): Metricas => {
  console.log('🔄 Calculando métricas com', data.length, 'linhas');
  
  // FASE 2: Filtrar linhas de cálculo (TOP SDR, TOP CLOSER, TOTAL)
  const dadosValidos = data.filter(row => {
    const nomeCall = getColumnValue(row, ['NOME DA CALL', 'NOME']);
    if (!nomeCall) return false;
    
    const nomeStr = String(nomeCall).trim().toUpperCase();
    
    // Ignora linhas de cabeçalho/cálculo
    if (nomeStr.includes('TOP SDR')) return false;
    if (nomeStr.includes('TOP CLOSER')) return false;
    if (nomeStr.includes('TOTAL')) return false;
    if (nomeStr === 'SDR' || nomeStr === 'CLOSER') return false;
    
    return true;
  });
  
  console.log('✅ Linhas válidas após filtro:', dadosValidos.length);
  
  // Logging dos headers
  if (dadosValidos.length > 0) {
    console.log('📋 Headers disponíveis:', Object.keys(dadosValidos[0]));
    console.log('🔍 Valores únicos de FECHAMENTO:', [...new Set(dadosValidos.map(row => getColumnValue(row, ['FECHAMENTO', 'STATUS'])))]);
    console.log('🔍 Valores únicos de QUALIFICADA (SQL):', [...new Set(dadosValidos.map(row => getColumnValue(row, ['QUALIFICADA (SQL)', 'QUALIFICADA'])))]);
    console.log('🔍 Primeiros 5 valores de VALOR:', dadosValidos.slice(0, 5).map(row => getColumnValue(row, ['VALOR'])));
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
  
  // Função para parsear datas no formato brasileiro (dd/mm/yyyy ou dd/mm/yyyy HH:MM)
  const parseDataBrasileira = (dataStr: any): Date | null => {
    if (!dataStr) return null;
    
    const str = String(dataStr).trim();
    
    // Formato: dd/mm/yyyy ou dd/mm/yyyy HH:MM
    const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    
    if (!match) return null;
    
    const dia = parseInt(match[1], 10);
    const mes = parseInt(match[2], 10) - 1; // JS Date usa mês base 0
    const ano = parseInt(match[3], 10);
    
    const data = new Date(ano, mes, dia);
    
    // Validar se a data é válida
    if (isNaN(data.getTime())) return null;
    
    return data;
  };
  
  // Verifica se uma data está na semana atual (segunda a domingo)
  const estaSemanAtual = (data: Date): boolean => {
    const hoje = new Date();
    
    // Início da semana (última segunda-feira)
    const inicioSemana = new Date(hoje);
    const diaDaSemana = hoje.getDay(); // 0 = domingo, 1 = segunda, ...
    const diasParaSegunda = diaDaSemana === 0 ? -6 : 1 - diaDaSemana;
    inicioSemana.setDate(hoje.getDate() + diasParaSegunda);
    inicioSemana.setHours(0, 0, 0, 0);
    
    // Fim da semana (próximo domingo)
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    fimSemana.setHours(23, 59, 59, 999);
    
    return data >= inicioSemana && data <= fimSemana;
  };
  
  // Verifica se uma data é hoje
  const eHoje = (data: Date): boolean => {
    const hoje = new Date();
    return data.getDate() === hoje.getDate() &&
           data.getMonth() === hoje.getMonth() &&
           data.getFullYear() === hoje.getFullYear();
  };
  
  // Metas dinâmicas baseadas no mês selecionado
  const configMeta = getMetasPorMes(monthKey || 'novembro-2025');
  const metaMensal = configMeta.metaMensal;
  const metaSemanal = calcularMetaSemanal(metaMensal);
  const metaDiaria = calcularMetaDiaria(metaMensal);
  
  console.log('🎯 Metas do mês', monthKey, ':', {
    mensal: metaMensal,
    semanal: metaSemanal,
    diaria: metaDiaria,
    modelo: configMeta.modelo
  });
  
  // Filtros básicos (usar dadosValidos ao invés de data)
  const vendasGanhas = dadosValidos.filter(row => {
    const fechamento = getColumnValue(row, ['FECHAMENTO', 'STATUS']);
    return matchValue(fechamento, 'SIM');
  });
  
  console.log('💰 Vendas com FECHAMENTO = "SIM":', vendasGanhas.length);
  if (vendasGanhas.length > 0) {
    console.log('💰 Exemplo de venda ganha:', vendasGanhas[0]);
  }
  
  const callsQualificadasList = dadosValidos.filter(row => {
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
  
  const receitaPaga = dadosValidos
    .filter(row => {
      const pagamento = getColumnValue(row, ['PAGAMENTO', 'STATUS PAGAMENTO']);
      return matchValue(pagamento, 'PAGOU');
    })
    .reduce((acc, row) => acc + parseValor(getColumnValue(row, ['VALOR', 'PREÇO'])), 0);
  
  const receitaAssinada = dadosValidos
    .filter(row => {
      const assinatura = getColumnValue(row, ['ASSINATURA', 'STATUS ASSINATURA']);
      return matchValue(assinatura, 'ASSINOU');
    })
    .reduce((acc, row) => acc + parseValor(getColumnValue(row, ['VALOR', 'PREÇO'])), 0);
  
  // Receita semanal (semana atual: segunda a domingo)
  const receitaSemanal = vendasGanhas
    .filter(row => {
      const dataStr = getColumnValue(row, ['DATA DE ENTRADA', 'DATA', 'DATAHORA']);
      const data = parseDataBrasileira(dataStr);
      return data && estaSemanAtual(data);
    })
    .reduce((acc, row) => acc + parseValor(getColumnValue(row, ['VALOR', 'PREÇO'])), 0);
  
  // Receita diária (apenas hoje)
  const receitaDiaria = vendasGanhas
    .filter(row => {
      const dataStr = getColumnValue(row, ['DATA DE ENTRADA', 'DATA', 'DATAHORA']);
      const data = parseDataBrasileira(dataStr);
      return data && eHoje(data);
    })
    .reduce((acc, row) => acc + parseValor(getColumnValue(row, ['VALOR', 'PREÇO'])), 0);
  
  // Listar vendas da semana para debug
  const vendasDaSemana = vendasGanhas.filter(row => {
    const dataStr = getColumnValue(row, ['DATA DE ENTRADA', 'DATA', 'DATAHORA']);
    const data = parseDataBrasileira(dataStr);
    return data && estaSemanAtual(data);
  });
  
  // Listar vendas de hoje para debug
  const vendasDeHoje = vendasGanhas.filter(row => {
    const dataStr = getColumnValue(row, ['DATA DE ENTRADA', 'DATA', 'DATAHORA']);
    const data = parseDataBrasileira(dataStr);
    return data && eHoje(data);
  });
  
  console.log('📅 Receita Semanal calculada:', receitaSemanal);
  console.log('📅 Receita Diária calculada:', receitaDiaria);
  console.log('📊 Vendas da semana:', vendasDaSemana.length, 'contratos');
  if (vendasDaSemana.length > 0) {
    console.log('Primeiras vendas da semana:', vendasDaSemana.slice(0, 3).map(v => ({
      call: getColumnValue(v, ['NOME DA CALL']),
      data: getColumnValue(v, ['DATA DE ENTRADA', 'DATA']),
      valor: getColumnValue(v, ['VALOR'])
    })));
  }
  console.log('📊 Vendas de hoje:', vendasDeHoje.length, 'contratos');
  if (vendasDeHoje.length > 0) {
    console.log('Vendas de hoje:', vendasDeHoje.map(v => ({
      call: getColumnValue(v, ['NOME DA CALL']),
      valor: getColumnValue(v, ['VALOR'])
    })));
  }
  
  // Contratos
  const totalContratos = vendasGanhas.length;
  
  // Calls
  const totalCalls = dadosValidos.length;
  const callsQualificadas = callsQualificadasList.length;
  
  // FASE 1: Contar NO-SHOWS explícitos (apenas onde CLOSER = "NO-SHOW")
  const noShow = dadosValidos.filter(row => {
    const closer = getColumnValue(row, ['CLOSER', 'CLOSER FECHOU']);
    if (!closer) return false;
    const closerStr = String(closer).trim().toUpperCase();
    return closerStr === 'NO-SHOW' || closerStr === 'NOSHOW';
  }).length;
  
  const callsAgendadas = totalCalls;
  
  // Calls Realizadas = Total Agendadas - No-Shows (376 - 59 = 317)
  const callsRealizadas = callsAgendadas - noShow;
  
  console.log('📞 CALLS - DEBUG:');
  console.log('Calls Agendadas:', callsAgendadas);
  console.log('No-Shows (explícitos):', noShow);
  console.log('Calls Realizadas (agendadas - no-shows):', callsRealizadas);
  
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
  
  // Debug das metas
  console.log('🎯 METAS E PROGRESSOS:');
  console.log('Meta Mensal:', metaMensal, '| Receita:', receitaTotal, '| Progresso:', progressoMetaMensal.toFixed(1) + '%');
  console.log('Meta Semanal:', metaSemanal, '| Receita:', receitaSemanal, '| Progresso:', progressoMetaSemanal.toFixed(1) + '%');
  console.log('Meta Diária:', metaDiaria, '| Receita:', receitaDiaria, '| Progresso:', progressoMetaDiaria.toFixed(1) + '%');
  
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
      leads: dadosMarketing?.totalLeads || 0,
      mqls: callsAgendadas,
      callsAgendadas: callsAgendadas,
      callsRealizadas: callsRealizadas,
      callsQualificadas: callsQualificadas,
      contratos: totalContratos,
      receitaEsperada: metaMensal
    }
  };
  
  // FASE 5: Logging detalhado do funil
  console.log('📊 FUNIL DE CONVERSÃO - DEBUG:');
  console.log('Leads:', metricas.funil.leads);
  console.log('MQLs:', metricas.funil.mqls);
  console.log('Calls Agendadas:', metricas.funil.callsAgendadas);
  console.log('Calls Realizadas:', metricas.funil.callsRealizadas);
  console.log('Contratos:', metricas.funil.contratos);
  if (metricas.funil.leads > 0) {
    console.log('Taxa Leads → MQLs:', ((metricas.funil.mqls / metricas.funil.leads) * 100).toFixed(1) + '%');
  }
  if (metricas.funil.mqls > 0) {
    console.log('Taxa MQLs → Calls:', ((metricas.funil.callsAgendadas / metricas.funil.mqls) * 100).toFixed(1) + '%');
  }
  if (metricas.funil.callsRealizadas > 0) {
    console.log('Taxa Calls → Contratos:', ((metricas.funil.contratos / metricas.funil.callsRealizadas) * 100).toFixed(1) + '%');
  }
  
  console.log('✅ Métricas calculadas:', metricas);
  
  return metricas;
};
