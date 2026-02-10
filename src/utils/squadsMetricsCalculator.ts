import { endOfMonth } from 'date-fns';

import { DateRange } from './dateFilters';
import { getMetasPorMes, getMetasTrafegoAtual } from './metasConfig';

export interface SquadMemberMetrics {
  nome: string;
  funcao: 'SDR' | 'Closer';
  squad: string;
  receitaIndividual: number;
  contratos: number;
  calls: number;
  taxaConversao: number;
  ticketMedio: number;
  badges: string[];
}

export interface SquadMetrics {
  nome: string;
  cor: string;
  emoji: string;
  
  // Receitas
  receitaTotal: number;
  receitaPaga: number;
  receitaAssinada: number;
  ticketMedio: number;
  
  // Volume
  contratos: number;
  callsRealizadas: number;
  callsQualificadas: number;
  callsAgendadas: number;
  
  // Qualidade
  taxaQualificacao: number;
  taxaShow: number;
  taxaConversao: number;
  taxaAssinatura: number;
  taxaPagamento: number;
  
  // Performance
  progressoMeta: number;
  contratosMeta: number;
  mediaVendasPorMembro: number;
  
  // Membros
  membros: SquadMemberMetrics[];
  mvp: SquadMemberMetrics | null;
  
  // Conquistas
  badges: string[];
  
  // Meta Individual
  metaSquad: number;
  progressoMetaIndividual: number;
  faltaParaMeta: number;
}

export interface MetricaComparacao {
  vencedor: string;
  diferenca: number;
  diferencaPerc: number;
}

export interface CenarioProjecao {
  projecaoFinal: number;
  probabilidade: string;
  premissa: string;
  vaiAcertarMeta: boolean;
  detalhes?: {
    callsPorDia: number;
    taxaShow: number;
    taxaConversao: number;
    ticketMedio: number;
  };
}

export interface RangeProjecao {
  min: number;
  max: number;
  diferenca: number;
}

export interface SquadsComparison {
  placar: {
    lider: string;
    squads: Array<{
      nome: string;
      emoji: string;
      cor: string;
      receita: number;
      contratos: number;
      percentual: number;
    }>;
    vantagem: number;
    vantagemPercentual: number;
  };
  
  squads: SquadMetrics[];
  
  // Legacy fields for backward compatibility
  hotDogs: SquadMetrics;
  corvoAzul: SquadMetrics;
  kiKarnes?: SquadMetrics;
  
  comparacao: {
    receita: MetricaComparacao;
    contratos: MetricaComparacao;
    ticketMedio: MetricaComparacao;
    taxaConversao: MetricaComparacao;
    callsRealizadas: MetricaComparacao;
    taxaQualificacao: MetricaComparacao;
    taxaShow: MetricaComparacao;
  };
  
  historico: {
    semanaAtual: { lider: string; placar: string; diferenca: number };
    mesAtual: { lider: string; placar: string; diferenca: number };
    ultimosMeses: Array<{ mes: string; vencedor: string }>;
    totalVitoriasHotDogs: number;
    totalVitoriasCorvoAzul: number;
    empates: number;
  };
  
  projecao: {
    hotDogs: {
      cenarios: {
        pessimista: CenarioProjecao;
        realista: CenarioProjecao;
        otimista: CenarioProjecao;
      };
      range: RangeProjecao;
      mediaDiaria: number;
      diasRestantes: number;
      metaSquad: number;
      receitaAtual: number;
    };
    corvoAzul: {
      cenarios: {
        pessimista: CenarioProjecao;
        realista: CenarioProjecao;
        otimista: CenarioProjecao;
      };
      range: RangeProjecao;
      mediaDiaria: number;
      diasRestantes: number;
      metaSquad: number;
      receitaAtual: number;
    };
    kiKarnes?: {
      cenarios: {
        pessimista: CenarioProjecao;
        realista: CenarioProjecao;
        otimista: CenarioProjecao;
      };
      range: RangeProjecao;
      mediaDiaria: number;
      diasRestantes: number;
      metaSquad: number;
      receitaAtual: number;
    };
  };
}

// Membros dos Squads - REMOVIDO (agora é dinâmico por período)

const parseValor = (valor: any): number => {
  if (typeof valor === 'number') return valor;
  if (!valor) return 0;
  
  const valorStr = String(valor)
    .replace(/[R$\s.]/g, '')
    .replace(',', '.');
  
  const num = parseFloat(valorStr);
  return isNaN(num) ? 0 : num;
};

const normalizarNome = (nome: string): string => {
  if (!nome) return '';
  const nomeUpper = nome.toUpperCase().trim();
  
  if (nomeUpper.includes('MARCOS')) return 'Marcos';
  if (nomeUpper.includes('BRUNO') && !nomeUpper.includes('BRUNNO')) return 'Bruno';
  if (nomeUpper.includes('CAUA') || nomeUpper.includes('CAUÃ')) return 'Cauã';
  if (nomeUpper.includes('VINICIUS') || nomeUpper.includes('VINÍCIUS')) return 'Vinícius';
  if (nomeUpper.includes('FERNANDES')) return 'Gabriel Fernandes';
  if (nomeUpper.includes('FRANKLIN')) return 'Gabriel Franklin';
  if (nomeUpper.includes('TIAGO')) return 'Tiago';
  if (nomeUpper.includes('DAVI')) return 'Davi';
  if (nomeUpper.includes('ANDREY')) return 'Andrey';
  if (nomeUpper.includes('BRUNNO')) return 'Brunno Vaz';
  
  return nome;
};

const compararMetrica = (valor1: number, valor2: number, tipo: 'maior' | 'menor' = 'maior'): MetricaComparacao => {
  const total = valor1 + valor2;
  const diferenca = Math.abs(valor1 - valor2);
  const diferencaPerc = total > 0 ? (diferenca / total) * 100 : 0;
  
  let vencedor = 'Empate';
  if (tipo === 'maior') {
    if (valor1 > valor2) vencedor = 'Hot Dogs';
    else if (valor2 > valor1) vencedor = 'Corvo Azul';
  } else {
    if (valor1 < valor2) vencedor = 'Hot Dogs';
    else if (valor2 < valor1) vencedor = 'Corvo Azul';
  }
  
  return { vencedor, diferenca, diferencaPerc };
};

export const calcularMetricasSquads = (data: any[], dateRange?: DateRange, monthKey?: string): SquadsComparison => {
  // Determinar período
  const isOutubro = dateRange && dateRange.start.getMonth() === 9 && dateRange.start.getFullYear() === 2025;
  const isDezembro = dateRange && dateRange.start.getMonth() === 11 && dateRange.start.getFullYear() === 2025;
  const isJaneiro = monthKey === 'janeiro-2026' || 
    (dateRange && dateRange.start.getMonth() === 0 && dateRange.start.getFullYear() === 2026);
  const isFevereiro = monthKey === 'fevereiro-2026' ||
    (dateRange && dateRange.start.getMonth() === 1 && dateRange.start.getFullYear() === 2026);
  
  // Configuração dinâmica dos squads por período
  interface SquadConfig {
    nome: string;
    cor: string;
    emoji: string;
    sdr: string[];
    closers: string[];
    membrosNomes: string[];
  }
  
  let SQUADS_LIST: SquadConfig[];
  
  if (isFevereiro) {
    SQUADS_LIST = [
      {
        nome: 'Hot Dogs', cor: '#FF4757', emoji: '🔴',
        sdr: ['VINICIUS MEIRELES', 'VINÍCIUS', 'VINICIUS'],
        closers: ['BRUNO', 'CAUÃ', 'CAUA'],
        membrosNomes: ['Vinícius', 'Bruno', 'Cauã']
      },
      {
        nome: 'Corvo Azul', cor: '#0066FF', emoji: '🔵',
        sdr: ['ANDREY'],
        closers: ['MARCOS', 'GABRIEL FRANKLIN', 'FRANKLIN'],
        membrosNomes: ['Andrey', 'Marcos', 'Gabriel Franklin']
      },
      {
        nome: 'Ki Karnes', cor: '#FF6B00', emoji: '🟠',
        sdr: ['BRUNNO VAZ', 'BRUNNO', 'BRUNO VAZ'],
        closers: ['DAVI', 'GABRIEL FERNANDES', 'FERNANDES'],
        membrosNomes: ['Brunno Vaz', 'Davi', 'Gabriel Fernandes']
      }
    ];
  } else if (isJaneiro) {
    SQUADS_LIST = [
      {
        nome: 'Hot Dogs', cor: '#FF4757', emoji: '🔴',
        sdr: ['DAVI'],
        closers: ['BRUNO', 'GABRIEL FRANKLIN', 'FRANKLIN', 'DAVI'],
        membrosNomes: ['Davi', 'Bruno', 'Gabriel Franklin']
      },
      {
        nome: 'Corvo Azul', cor: '#0066FF', emoji: '🔵',
        sdr: ['VINICIUS MEIRELES', 'VINÍCIUS', 'VINICIUS'],
        closers: ['MARCOS', 'CAUÃ', 'CAUA'],
        membrosNomes: ['Vinícius', 'Marcos', 'Cauã']
      }
    ];
  } else if (isOutubro) {
    SQUADS_LIST = [
      {
        nome: 'Hot Dogs', cor: '#FF4757', emoji: '🔴',
        sdr: ['MARCOS'],
        closers: ['BRUNO', 'CAUÃ', 'CAUA'],
        membrosNomes: ['Marcos', 'Bruno', 'Cauã']
      },
      {
        nome: 'Corvo Azul', cor: '#0066FF', emoji: '🔵',
        sdr: ['VINICIUS MEIRELES', 'VINÍCIUS', 'VINICIUS'],
        closers: ['GABRIEL FERNANDES', 'FERNANDES', 'GABRIEL FRANKLIN', 'FRANKLIN'],
        membrosNomes: ['Vinícius', 'Gabriel Fernandes', 'Gabriel Franklin']
      }
    ];
  } else if (isDezembro) {
    SQUADS_LIST = [
      {
        nome: 'Hot Dogs', cor: '#FF4757', emoji: '🔴',
        sdr: ['DAVI'],
        closers: ['BRUNO', 'GABRIEL FRANKLIN', 'FRANKLIN'],
        membrosNomes: ['Davi', 'Bruno', 'Gabriel Franklin']
      },
      {
        nome: 'Corvo Azul', cor: '#0066FF', emoji: '🔵',
        sdr: ['VINICIUS MEIRELES', 'VINÍCIUS', 'VINICIUS'],
        closers: ['MARCOS', 'CAUÃ', 'CAUA'],
        membrosNomes: ['Vinícius', 'Marcos', 'Cauã']
      }
    ];
  } else {
    SQUADS_LIST = [
      {
        nome: 'Hot Dogs', cor: '#FF4757', emoji: '🔴',
        sdr: ['TIAGO'],
        closers: ['BRUNO', 'GABRIEL FRANKLIN', 'FRANKLIN'],
        membrosNomes: ['Tiago', 'Bruno', 'Gabriel Franklin']
      },
      {
        nome: 'Corvo Azul', cor: '#0066FF', emoji: '🔵',
        sdr: ['VINICIUS MEIRELES', 'VINÍCIUS', 'VINICIUS'],
        closers: ['MARCOS', 'CAUÃ', 'CAUA'],
        membrosNomes: ['Vinícius', 'Marcos', 'Cauã']
      }
    ];
  }
  
  // Função identificarSquad dinâmica
  const identificarSquad = (nome: string): string | null => {
    if (!nome) return null;
    const nomeUpper = nome.toUpperCase().trim();
    
    for (const squad of SQUADS_LIST) {
      const isInSquad = squad.sdr.some(s => nomeUpper.includes(s)) ||
                        squad.closers.some(c => nomeUpper.includes(c));
      if (isInSquad) return squad.nome;
    }
    
    return null;
  };
  
  // Função identificarFuncao dinâmica
  const identificarFuncao = (nome: string): 'SDR' | 'Closer' => {
    const nomeUpper = nome.toUpperCase().trim();
    
    const isSdr = SQUADS_LIST.some(squad => 
      squad.sdr.some(s => nomeUpper.includes(s))
    );
    
    return isSdr ? 'SDR' : 'Closer';
  };
  
  // Filtrar contratos ganhos
  const contratosGanhos = data.filter(row => {
    const fechamento = String(row['FECHAMENTO'] || '').trim().toUpperCase();
    return fechamento === 'SIM';
  });
  
  // Agrupar por squad
  const contratosPorSquad: Record<string, any[]> = {};
  const callsPorSquad: Record<string, any[]> = {};
  SQUADS_LIST.forEach(s => {
    contratosPorSquad[s.nome] = [];
    callsPorSquad[s.nome] = [];
  });
  
  contratosGanhos.forEach(row => {
    const closer = String(row['CLOSER FECHOU'] || row['CLOSER'] || '').trim();
    const squad = identificarSquad(closer);
    
    if (squad && contratosPorSquad[squad]) {
      contratosPorSquad[squad].push({
        ...row,
        valor: parseValor(row['VALOR'] || '0'),
        assinado: String(row['ASSINATURA'] || '').toUpperCase().includes('ASSIN'),
        pago: String(row['PAGAMENTO'] || '').toUpperCase().includes('PAG'),
        closer: normalizarNome(closer),
        sdr: normalizarNome(row['SDR FECHOU'] || row['SDR'] || '')
      });
    }
  });
  
  data.forEach(row => {
    const sdr = String(row['SDR'] || '').trim();
    const squad = identificarSquad(sdr);
    
    if (squad && callsPorSquad[squad]) {
      callsPorSquad[squad].push(row);
    }
  });
  
  // Calcular métricas para cada squad
  const calcularSquadMetrics = (squadConfig: typeof SQUADS_LIST[0]): SquadMetrics => {
    const contratos = contratosPorSquad[squadConfig.nome] || [];
    const calls = callsPorSquad[squadConfig.nome] || [];
    
    const receitaTotal = contratos.reduce((sum, c) => sum + c.valor, 0);
    const receitaPaga = contratos.filter(c => c.pago).reduce((sum, c) => sum + c.valor, 0);
    const receitaAssinada = contratos.filter(c => c.assinado).reduce((sum, c) => sum + c.valor, 0);
    const numeroContratos = contratos.length;
    const ticketMedio = numeroContratos > 0 ? receitaTotal / numeroContratos : 0;
    
    const totalCalls = calls.length;
    const callsQualificadas = calls.filter(c => 
      String(c['QUALIFICADA (SQL)'] || '').toUpperCase() === 'SIM'
    ).length;
    const callsAgendadas = calls.filter(c => 
      String(c['TIPO DA REUNIÃO'] || c['TIPO DA REUNIAO'] || '').trim() !== ''
    ).length;
    const callsRealizadas = calls.filter(c => {
      const closer = String(c['CLOSER'] || '').trim().toUpperCase();
      return closer.length > 0 && closer !== 'NO-SHOW';
    }).length;
    
    const taxaQualificacao = totalCalls > 0 ? (callsQualificadas / totalCalls) * 100 : 0;
    const taxaShow = callsAgendadas > 0 ? (callsRealizadas / callsAgendadas) * 100 : 0;
    const taxaConversao = totalCalls > 0 ? (numeroContratos / totalCalls) * 100 : 0;
    const taxaAssinatura = numeroContratos > 0 ? (contratos.filter(c => c.assinado).length / numeroContratos) * 100 : 0;
    const taxaPagamento = numeroContratos > 0 ? (contratos.filter(c => c.pago).length / numeroContratos) * 100 : 0;
    
    const configMeta = getMetasPorMes(monthKey || 'fevereiro-2026');
    const metaReceita = configMeta.squads.metaPorSquad;
    const metasTrafegoSquad = getMetasTrafegoAtual(monthKey);
    const metaContratos = Math.ceil(metasTrafegoSquad.fechamentos / SQUADS_LIST.length);
    const progressoMeta = metaReceita > 0 ? (receitaTotal / metaReceita) * 100 : 0;
    const contratosMeta = metaContratos > 0 ? (numeroContratos / metaContratos) * 100 : 0;
    const progressoMetaIndividual = metaReceita > 0 ? (receitaTotal / metaReceita) * 100 : 0;
    const faltaParaMeta = metaReceita - receitaTotal;
    
    const membros: SquadMemberMetrics[] = squadConfig.membrosNomes.map(nome => {
      const contratosDoMembro = contratos.filter(c => 
        c.closer === nome || c.sdr === nome
      );
      const callsDoMembro = calls.filter(c => 
        normalizarNome(c['SDR'] || '') === nome
      );
      
      const receitaMembro = contratosDoMembro.reduce((sum, c) => sum + c.valor, 0);
      const contratosMembro = contratosDoMembro.length;
      const callsMembro = callsDoMembro.length;
      const ticketMedioMembro = contratosMembro > 0 ? receitaMembro / contratosMembro : 0;
      const taxaConversaoMembro = callsMembro > 0 ? (contratosMembro / callsMembro) * 100 : 0;
      
      const badges: string[] = [];
      
      return {
        nome,
        funcao: identificarFuncao(nome),
        squad: squadConfig.nome,
        receitaIndividual: receitaMembro,
        contratos: contratosMembro,
        calls: callsMembro,
        taxaConversao: taxaConversaoMembro,
        ticketMedio: ticketMedioMembro,
        badges
      };
    });
    
    membros.sort((a, b) => b.receitaIndividual - a.receitaIndividual);
    
    const mvp = membros[0] || null;
    if (mvp) mvp.badges.push('mvp');
    
    const badges: string[] = [];
    const mediaVendasPorMembro = membros.length > 0 ? receitaTotal / membros.length : 0;
    
    return {
      nome: squadConfig.nome,
      cor: squadConfig.cor,
      emoji: squadConfig.emoji,
      receitaTotal,
      receitaPaga,
      receitaAssinada,
      ticketMedio,
      contratos: numeroContratos,
      callsRealizadas: totalCalls,
      callsQualificadas,
      callsAgendadas,
      taxaQualificacao,
      taxaShow,
      taxaConversao,
      taxaAssinatura,
      taxaPagamento,
      progressoMeta,
      contratosMeta,
      mediaVendasPorMembro,
      membros,
      mvp,
      badges,
      metaSquad: metaReceita,
      progressoMetaIndividual,
      faltaParaMeta
    };
  };
  
  // Calcular métricas para todos os squads
  const allSquads = SQUADS_LIST.map(calcularSquadMetrics);
  
  // Determinar badges - maior receita
  const maxReceita = Math.max(...allSquads.map(s => s.receitaTotal));
  allSquads.forEach(s => {
    if (s.receitaTotal === maxReceita && maxReceita > 0) s.badges.push('maior-receita');
    if (s.progressoMeta >= 100) s.badges.push('meta-batida');
  });
  
  // Legacy references
  const hotDogs = allSquads.find(s => s.nome === 'Hot Dogs') || allSquads[0];
  const corvoAzul = allSquads.find(s => s.nome === 'Corvo Azul') || allSquads[1] || allSquads[0];
  const kiKarnes = allSquads.find(s => s.nome === 'Ki Karnes');
  
  // Placar
  const receitaTotal = allSquads.reduce((sum, s) => sum + s.receitaTotal, 0);
  const sortedByReceita = [...allSquads].sort((a, b) => b.receitaTotal - a.receitaTotal);
  const lider = sortedByReceita[0].receitaTotal > 0 ? sortedByReceita[0].nome : 'Empate';
  const vantagem = sortedByReceita.length >= 2 
    ? sortedByReceita[0].receitaTotal - sortedByReceita[1].receitaTotal 
    : 0;
  const vantagemPercentual = receitaTotal > 0 ? (vantagem / receitaTotal) * 100 : 0;
  
  // Check empate
  const isEmpate = sortedByReceita.length >= 2 && sortedByReceita[0].receitaTotal === sortedByReceita[1].receitaTotal;
  
  const placar = {
    lider: isEmpate ? 'Empate' : lider,
    squads: allSquads.map(s => ({
      nome: s.nome,
      emoji: s.emoji,
      cor: s.cor,
      receita: s.receitaTotal,
      contratos: s.contratos,
      percentual: receitaTotal > 0 ? (s.receitaTotal / receitaTotal) * 100 : 100 / allSquads.length
    })),
    vantagem,
    vantagemPercentual
  };
  
  // Comparações (mantém Hot Dogs vs Corvo Azul para compat)
  const comparacao = {
    receita: compararMetrica(hotDogs.receitaTotal, corvoAzul.receitaTotal),
    contratos: compararMetrica(hotDogs.contratos, corvoAzul.contratos),
    ticketMedio: compararMetrica(hotDogs.ticketMedio, corvoAzul.ticketMedio),
    taxaConversao: compararMetrica(hotDogs.taxaConversao, corvoAzul.taxaConversao),
    callsRealizadas: compararMetrica(hotDogs.callsRealizadas, corvoAzul.callsRealizadas),
    taxaQualificacao: compararMetrica(hotDogs.taxaQualificacao, corvoAzul.taxaQualificacao),
    taxaShow: compararMetrica(hotDogs.taxaShow, corvoAzul.taxaShow)
  };
  
  // Histórico
  const historico = {
    semanaAtual: {
      lider: isEmpate ? 'Empate' : lider,
      placar: allSquads.map(s => s.contratos).join('x'),
      diferenca: vantagem
    },
    mesAtual: {
      lider: isEmpate ? 'Empate' : lider,
      placar: allSquads.map(s => s.contratos).join('x'),
      diferenca: vantagem
    },
    ultimosMeses: [
      { mes: 'Janeiro', vencedor: 'Hot Dogs' },
      { mes: 'Fevereiro', vencedor: 'Corvo Azul' },
      { mes: 'Março', vencedor: 'Hot Dogs' },
      { mes: 'Abril', vencedor: 'Corvo Azul' },
      { mes: 'Maio', vencedor: 'Hot Dogs' },
    ],
    totalVitoriasHotDogs: 3,
    totalVitoriasCorvoAzul: 2,
    empates: 0
  };
  
  // Projeções
  const now = new Date();
  const diasNoMes = endOfMonth(now).getDate();
  const diaAtual = now.getDate();
  const diasRestantes = diasNoMes - diaAtual;
  
  const configMetaProjecao = getMetasPorMes(monthKey || 'fevereiro-2026');
  const metaReceitaProj = configMetaProjecao.squads.metaPorSquad;
  
  const calcularCenariosSquad = (
    receitaAtual: number,
    _mediaDiaria: number,
    metaSquad: number,
    totalCalls: number,
    taxaShow: number,
    taxaConversao: number,
    ticketMedio: number
  ) => {
    const callsPorDia = diaAtual > 0 ? totalCalls / diaAtual : 0;
    
    const cenarioPessimista = {
      callsPorDia: callsPorDia * 0.8,
      taxaShow: taxaShow * 0.8,
      taxaConversao: taxaConversao * 0.8,
      ticketMedio: ticketMedio * 0.85
    };
    
    const receitaPessimistaFutura = cenarioPessimista.callsPorDia * diasRestantes * (cenarioPessimista.taxaShow / 100) * (cenarioPessimista.taxaConversao / 100) * cenarioPessimista.ticketMedio;
    const projecaoPessimista = receitaAtual + receitaPessimistaFutura;
    
    const receitaRealistaFutura = callsPorDia * diasRestantes * (taxaShow / 100) * (taxaConversao / 100) * ticketMedio;
    const projecaoRealista = receitaAtual + receitaRealistaFutura;
    
    const cenarioOtimista = {
      callsPorDia: callsPorDia * 1.2,
      taxaShow: taxaShow * 1.2,
      taxaConversao: taxaConversao * 1.2,
      ticketMedio: ticketMedio * 1.15
    };
    
    const receitaOtimistaFutura = cenarioOtimista.callsPorDia * diasRestantes * (cenarioOtimista.taxaShow / 100) * (cenarioOtimista.taxaConversao / 100) * cenarioOtimista.ticketMedio;
    const projecaoOtimista = receitaAtual + receitaOtimistaFutura;
    
    return {
      cenarios: {
        pessimista: {
          projecaoFinal: projecaoPessimista,
          probabilidade: '30%',
          premissa: `Show ${cenarioPessimista.taxaShow.toFixed(1)}% • Conv ${cenarioPessimista.taxaConversao.toFixed(1)}% • Ticket ${(cenarioPessimista.ticketMedio/1000).toFixed(0)}k`,
          vaiAcertarMeta: projecaoPessimista >= metaSquad,
          detalhes: cenarioPessimista
        },
        realista: {
          projecaoFinal: projecaoRealista,
          probabilidade: '50%',
          premissa: `Show ${taxaShow.toFixed(1)}% • Conv ${taxaConversao.toFixed(1)}% • Ticket ${(ticketMedio/1000).toFixed(0)}k`,
          vaiAcertarMeta: projecaoRealista >= metaSquad,
          detalhes: { callsPorDia, taxaShow, taxaConversao, ticketMedio }
        },
        otimista: {
          projecaoFinal: projecaoOtimista,
          probabilidade: '20%',
          premissa: `Show ${cenarioOtimista.taxaShow.toFixed(1)}% • Conv ${cenarioOtimista.taxaConversao.toFixed(1)}% • Ticket ${(cenarioOtimista.ticketMedio/1000).toFixed(0)}k`,
          vaiAcertarMeta: projecaoOtimista >= metaSquad,
          detalhes: cenarioOtimista
        }
      },
      range: {
        min: projecaoPessimista,
        max: projecaoOtimista,
        diferenca: projecaoOtimista - projecaoPessimista
      }
    };
  };
  
  const buildProjecao = (squad: SquadMetrics) => {
    const mediaDiaria = diaAtual > 0 ? squad.receitaTotal / diaAtual : 0;
    const cenarios = calcularCenariosSquad(
      squad.receitaTotal, mediaDiaria, metaReceitaProj,
      squad.callsRealizadas, squad.taxaShow, squad.taxaConversao, squad.ticketMedio
    );
    return {
      ...cenarios,
      mediaDiaria,
      diasRestantes,
      metaSquad: metaReceitaProj,
      receitaAtual: squad.receitaTotal
    };
  };
  
  const projecao: SquadsComparison['projecao'] = {
    hotDogs: buildProjecao(hotDogs),
    corvoAzul: buildProjecao(corvoAzul),
    ...(kiKarnes ? { kiKarnes: buildProjecao(kiKarnes) } : {})
  };
  
  return {
    placar,
    squads: allSquads,
    hotDogs,
    corvoAzul,
    kiKarnes,
    comparacao,
    historico,
    projecao
  };
};
