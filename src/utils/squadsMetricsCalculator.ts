import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from './dateFilters';
import { getMetasPorMes } from './metasConfig';

export interface SquadMemberMetrics {
  nome: string;
  funcao: 'SDR' | 'Closer';
  squad: 'Hot Dogs' | 'Corvo Azul';
  receitaIndividual: number;
  contratos: number;
  calls: number;
  taxaConversao: number;
  ticketMedio: number;
  badges: string[];
}

export interface SquadMetrics {
  nome: 'Hot Dogs' | 'Corvo Azul';
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
}

export interface RangeProjecao {
  min: number;
  max: number;
  diferenca: number;
}

export interface SquadsComparison {
  placar: {
    lider: 'Hot Dogs' | 'Corvo Azul' | 'Empate';
    hotDogsReceita: number;
    corvoAzulReceita: number;
    hotDogsContratos: number;
    corvoAzulContratos: number;
    vantagem: number;
    vantagemPercentual: number;
    paraVirar: number;
    percentualHotDogs: number;
    percentualCorvoAzul: number;
  };
  
  hotDogs: SquadMetrics;
  corvoAzul: SquadMetrics;
  
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
  if (nomeUpper.includes('BRUNO')) return 'Bruno';
  if (nomeUpper.includes('CAUA') || nomeUpper.includes('CAUÃ')) return 'Cauã';
  if (nomeUpper.includes('VINICIUS') || nomeUpper.includes('VINÍCIUS')) return 'Vinícius';
  if (nomeUpper.includes('FERNANDES')) return 'Gabriel Fernandes';
  if (nomeUpper.includes('FRANKLIN')) return 'Gabriel Franklin';
  if (nomeUpper.includes('TIAGO')) return 'Tiago';
  
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
  
  // Configuração dinâmica dos squads por período
  const SQUADS_CONFIG = isOutubro ? {
    hotDogs: {
      sdr: ['MARCOS'],
      closers: ['BRUNO', 'CAUÃ', 'CAUA'],
      membrosNomes: ['Marcos', 'Bruno', 'Cauã']
    },
    corvoAzul: {
      sdr: ['VINICIUS MEIRELES', 'VINÍCIUS', 'VINICIUS'],
      closers: ['GABRIEL FERNANDES', 'FERNANDES', 'GABRIEL FRANKLIN', 'FRANKLIN'],
      membrosNomes: ['Vinícius', 'Gabriel Fernandes', 'Gabriel Franklin']
    }
  } : {
    hotDogs: {
      sdr: ['TIAGO'],
      closers: ['BRUNO', 'GABRIEL FRANKLIN', 'FRANKLIN'],
      membrosNomes: ['Tiago', 'Bruno', 'Gabriel Franklin']
    },
    corvoAzul: {
      sdr: ['VINICIUS MEIRELES', 'VINÍCIUS', 'VINICIUS'],
      closers: ['MARCOS', 'CAUÃ', 'CAUA'],
      membrosNomes: ['Vinícius', 'Marcos', 'Cauã']
    }
  };
  
  // Função identificarSquad dinâmica
  const identificarSquad = (nome: string): 'Hot Dogs' | 'Corvo Azul' | null => {
    if (!nome) return null;
    const nomeUpper = nome.toUpperCase().trim();
    
    // Hot Dogs
    const isHotDog = SQUADS_CONFIG.hotDogs.sdr.some(s => nomeUpper.includes(s)) ||
                     SQUADS_CONFIG.hotDogs.closers.some(c => nomeUpper.includes(c));
    if (isHotDog) return 'Hot Dogs';
    
    // Corvo Azul
    const isCorvoAzul = SQUADS_CONFIG.corvoAzul.sdr.some(s => nomeUpper.includes(s)) ||
                        SQUADS_CONFIG.corvoAzul.closers.some(c => nomeUpper.includes(c));
    if (isCorvoAzul) return 'Corvo Azul';
    
    return null;
  };
  
  // Função identificarFuncao dinâmica
  const identificarFuncao = (nome: string): 'SDR' | 'Closer' => {
    const nomeUpper = nome.toUpperCase().trim();
    
    const isSdr = SQUADS_CONFIG.hotDogs.sdr.some(s => nomeUpper.includes(s)) ||
                  SQUADS_CONFIG.corvoAzul.sdr.some(s => nomeUpper.includes(s));
    
    return isSdr ? 'SDR' : 'Closer';
  };
  
  // Filtrar contratos ganhos
  const contratosGanhos = data.filter(row => {
    const fechamento = String(row['FECHAMENTO'] || '').trim().toUpperCase();
    return fechamento === 'SIM';
  });
  
  // Agrupar por squad
  const contratosPorSquad: Record<string, any[]> = {
    'Hot Dogs': [],
    'Corvo Azul': []
  };
  
  contratosGanhos.forEach(row => {
    const closer = String(row['CLOSER FECHOU'] || row['CLOSER'] || '').trim();
    const squad = identificarSquad(closer);
    
    if (squad) {
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
  
  // Processar dados de calls (se houver)
  const callsPorSquad: Record<string, any[]> = {
    'Hot Dogs': [],
    'Corvo Azul': []
  };
  
  data.forEach(row => {
    const sdr = String(row['SDR'] || '').trim();
    const squad = identificarSquad(sdr);
    
    if (squad) {
      callsPorSquad[squad].push(row);
    }
  });
  
  // Calcular métricas para cada squad
  const calcularSquadMetrics = (nomeSquad: 'Hot Dogs' | 'Corvo Azul'): SquadMetrics => {
    const contratos = contratosPorSquad[nomeSquad];
    const calls = callsPorSquad[nomeSquad];
    
    const receitaTotal = contratos.reduce((sum, c) => sum + c.valor, 0);
    const receitaPaga = contratos.filter(c => c.pago).reduce((sum, c) => sum + c.valor, 0);
    const receitaAssinada = contratos.filter(c => c.assinado).reduce((sum, c) => sum + c.valor, 0);
    const numeroContratos = contratos.length;
    const ticketMedio = numeroContratos > 0 ? receitaTotal / numeroContratos : 0;
    
    // Calls
    const totalCalls = calls.length;
    const callsQualificadas = calls.filter(c => 
      String(c['QUALIFICADA (SQL)'] || '').toUpperCase() === 'SIM'
    ).length;
    const callsAgendadas = calls.filter(c => 
      String(c['TIPO DA REUNIÃO'] || c['TIPO DA REUNIAO'] || '').trim() !== ''
    ).length;
    
    // Taxas
    const taxaQualificacao = totalCalls > 0 ? (callsQualificadas / totalCalls) * 100 : 0;
    const taxaShow = callsAgendadas > 0 ? (numeroContratos / callsAgendadas) * 100 : 0;
    const taxaConversao = totalCalls > 0 ? (numeroContratos / totalCalls) * 100 : 0;
    const taxaAssinatura = numeroContratos > 0 ? (contratos.filter(c => c.assinado).length / numeroContratos) * 100 : 0;
    const taxaPagamento = numeroContratos > 0 ? (contratos.filter(c => c.pago).length / numeroContratos) * 100 : 0;
    
    // Performance - Metas Dinâmicas
    const configMeta = getMetasPorMes(monthKey || 'novembro-2025');
    const metaReceita = configMeta.squads.metaPorSquad;
    const metaContratos = 27;
    const progressoMeta = (receitaTotal / metaReceita) * 100;
    const contratosMeta = (numeroContratos / metaContratos) * 100;
    const progressoMetaIndividual = (receitaTotal / metaReceita) * 100;
    const faltaParaMeta = metaReceita - receitaTotal;
    
    // Membros (usando configuração dinâmica)
    const membrosNomes = nomeSquad === 'Hot Dogs' 
      ? SQUADS_CONFIG.hotDogs.membrosNomes
      : SQUADS_CONFIG.corvoAzul.membrosNomes;
    
    const membros: SquadMemberMetrics[] = membrosNomes.map(nome => {
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
        squad: nomeSquad,
        receitaIndividual: receitaMembro,
        contratos: contratosMembro,
        calls: callsMembro,
        taxaConversao: taxaConversaoMembro,
        ticketMedio: ticketMedioMembro,
        badges
      };
    });
    
    // Ordenar membros por receita
    membros.sort((a, b) => b.receitaIndividual - a.receitaIndividual);
    
    // MVP
    const mvp = membros[0] || null;
    if (mvp) mvp.badges.push('mvp');
    
    // Badges do squad
    const badges: string[] = [];
    const mediaVendasPorMembro = numeroContratos / membros.length;
    
    return {
      nome: nomeSquad,
      cor: nomeSquad === 'Hot Dogs' ? '#FF4757' : '#0066FF',
      emoji: nomeSquad === 'Hot Dogs' ? '🔴' : '🔵',
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
  
  const hotDogs = calcularSquadMetrics('Hot Dogs');
  const corvoAzul = calcularSquadMetrics('Corvo Azul');
  
  // Determinar badges
  if (hotDogs.receitaTotal > corvoAzul.receitaTotal) hotDogs.badges.push('maior-receita');
  else if (corvoAzul.receitaTotal > hotDogs.receitaTotal) corvoAzul.badges.push('maior-receita');
  
  if (hotDogs.ticketMedio > corvoAzul.ticketMedio) hotDogs.badges.push('maior-ticket');
  else if (corvoAzul.ticketMedio > hotDogs.ticketMedio) corvoAzul.badges.push('maior-ticket');
  
  if (hotDogs.taxaConversao > corvoAzul.taxaConversao) hotDogs.badges.push('melhor-conversao');
  else if (corvoAzul.taxaConversao > hotDogs.taxaConversao) corvoAzul.badges.push('melhor-conversao');
  
  if (hotDogs.taxaShow > corvoAzul.taxaShow) hotDogs.badges.push('melhor-show');
  else if (corvoAzul.taxaShow > hotDogs.taxaShow) corvoAzul.badges.push('melhor-show');
  
  if (hotDogs.callsRealizadas > corvoAzul.callsRealizadas) hotDogs.badges.push('mais-calls');
  else if (corvoAzul.callsRealizadas > hotDogs.callsRealizadas) corvoAzul.badges.push('mais-calls');
  
  if (hotDogs.progressoMeta >= 100) hotDogs.badges.push('meta-batida');
  if (corvoAzul.progressoMeta >= 100) corvoAzul.badges.push('meta-batida');
  
  // Placar
  const receitaTotal = hotDogs.receitaTotal + corvoAzul.receitaTotal;
  const vantagem = Math.abs(hotDogs.receitaTotal - corvoAzul.receitaTotal);
  const vantagemPercentual = receitaTotal > 0 ? (vantagem / receitaTotal) * 100 : 0;
  
  let lider: 'Hot Dogs' | 'Corvo Azul' | 'Empate' = 'Empate';
  if (hotDogs.receitaTotal > corvoAzul.receitaTotal) lider = 'Hot Dogs';
  else if (corvoAzul.receitaTotal > hotDogs.receitaTotal) lider = 'Corvo Azul';
  
  const placar = {
    lider,
    hotDogsReceita: hotDogs.receitaTotal,
    corvoAzulReceita: corvoAzul.receitaTotal,
    hotDogsContratos: hotDogs.contratos,
    corvoAzulContratos: corvoAzul.contratos,
    vantagem,
    vantagemPercentual,
    paraVirar: vantagem + 1,
    percentualHotDogs: receitaTotal > 0 ? (hotDogs.receitaTotal / receitaTotal) * 100 : 50,
    percentualCorvoAzul: receitaTotal > 0 ? (corvoAzul.receitaTotal / receitaTotal) * 100 : 50
  };
  
  // Comparações
  const comparacao = {
    receita: compararMetrica(hotDogs.receitaTotal, corvoAzul.receitaTotal),
    contratos: compararMetrica(hotDogs.contratos, corvoAzul.contratos),
    ticketMedio: compararMetrica(hotDogs.ticketMedio, corvoAzul.ticketMedio),
    taxaConversao: compararMetrica(hotDogs.taxaConversao, corvoAzul.taxaConversao),
    callsRealizadas: compararMetrica(hotDogs.callsRealizadas, corvoAzul.callsRealizadas),
    taxaQualificacao: compararMetrica(hotDogs.taxaQualificacao, corvoAzul.taxaQualificacao),
    taxaShow: compararMetrica(hotDogs.taxaShow, corvoAzul.taxaShow)
  };
  
  // Histórico (mock por enquanto)
  const historico = {
    semanaAtual: {
      lider: lider === 'Empate' ? 'Empate' : lider,
      placar: `${hotDogs.contratos}x${corvoAzul.contratos}`,
      diferenca: vantagem
    },
    mesAtual: {
      lider: lider === 'Empate' ? 'Empate' : lider,
      placar: `${hotDogs.contratos}x${corvoAzul.contratos}`,
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
  
  // Projeções com Múltiplos Cenários
  const now = new Date();
  const diasNoMes = endOfMonth(now).getDate();
  const diaAtual = now.getDate();
  const diasRestantes = diasNoMes - diaAtual;
  
  const mediaDiariaHotDogs = diaAtual > 0 ? hotDogs.receitaTotal / diaAtual : 0;
  const mediaDiariaCorvoAzul = diaAtual > 0 ? corvoAzul.receitaTotal / diaAtual : 0;
  
  const configMetaProjecao = getMetasPorMes(monthKey || 'novembro-2025');
  const metaReceita = configMetaProjecao.squads.metaPorSquad;
  
  // Função para calcular cenários de um squad
  const calcularCenariosSquad = (receitaAtual: number, mediaDiaria: number, metaSquad: number) => {
    // CENÁRIO PESSIMISTA: -30% da média (desaceleração)
    const mediaPessimista = mediaDiaria * 0.7;
    const projecaoPessimista = receitaAtual + (mediaPessimista * diasRestantes);
    
    // CENÁRIO REALISTA: média atual (mantém ritmo)
    const projecaoRealista = receitaAtual + (mediaDiaria * diasRestantes);
    
    // CENÁRIO OTIMISTA: +30% da média (aceleração)
    const mediaOtimista = mediaDiaria * 1.3;
    const projecaoOtimista = receitaAtual + (mediaOtimista * diasRestantes);
    
    return {
      cenarios: {
        pessimista: {
          projecaoFinal: projecaoPessimista,
          probabilidade: '30%',
          premissa: 'Desaceleração de 30%',
          vaiAcertarMeta: projecaoPessimista >= metaSquad
        },
        realista: {
          projecaoFinal: projecaoRealista,
          probabilidade: '50%',
          premissa: 'Mantém ritmo atual',
          vaiAcertarMeta: projecaoRealista >= metaSquad
        },
        otimista: {
          projecaoFinal: projecaoOtimista,
          probabilidade: '20%',
          premissa: 'Aceleração de 30%',
          vaiAcertarMeta: projecaoOtimista >= metaSquad
        }
      },
      range: {
        min: projecaoPessimista,
        max: projecaoOtimista,
        diferenca: projecaoOtimista - projecaoPessimista
      }
    };
  };
  
  const cenariosHotDogs = calcularCenariosSquad(hotDogs.receitaTotal, mediaDiariaHotDogs, metaReceita);
  const cenariosCorvoAzul = calcularCenariosSquad(corvoAzul.receitaTotal, mediaDiariaCorvoAzul, metaReceita);
  
  const projecao = {
    hotDogs: {
      ...cenariosHotDogs,
      mediaDiaria: mediaDiariaHotDogs,
      diasRestantes,
      metaSquad: metaReceita,
      receitaAtual: hotDogs.receitaTotal
    },
    corvoAzul: {
      ...cenariosCorvoAzul,
      mediaDiaria: mediaDiariaCorvoAzul,
      diasRestantes,
      metaSquad: metaReceita,
      receitaAtual: corvoAzul.receitaTotal
    }
  };
  
  return {
    placar,
    hotDogs,
    corvoAzul,
    comparacao,
    historico,
    projecao
  };
};
