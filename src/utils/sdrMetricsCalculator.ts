import { parseValor } from './metricsCalculator';
import { DateRange } from './dateFilters';

export interface SDRContract {
  nomeCall: string;
  closer: string;
  valor: number;
  data: string;
  assinado: boolean;
  pago: boolean;
}

export interface SDRCallData {
  nomeCall: string;
  data: string;
  closer: string;
  tipoCall: string;
  qualificada: boolean;
  valor: number;
  fechamento: boolean;
  noShow: boolean;
}

export interface SDRMetrics {
  nome: string;
  nomeOriginal: string;
  squad: string;
  squadColor: string;
  emoji: string;
  totalCalls: number;
  callsR1: number;
  callsR2: number;
  callsQualificadas: number;
  taxaQualificacao: number;
  callsAgendadas: number;
  callsRealizadas: number;
  noShows: number;
  taxaShow: number;
  vendasOriginadas: number;
  contratosOriginados: number;
  contratos: SDRContract[];
  callsAgendadasData: SDRCallData[];
  callsRealizadasData: SDRCallData[];
  callsQualificadasData: SDRCallData[];
  // Campos do dashboard
  valorVendasDash?: number;
  percentualVendasDash?: number;
  callsAgendadasDash?: number;
  callsQualificadasDash?: number;
  noShowDash?: number;
  txNoShowDash?: number;
  txComparecimentoDash?: number;
}

export interface SDRData {
  sdrs: SDRMetrics[];
  totais: {
    totalCalls: number;
    taxaQualificacaoMedia: number;
    taxaShowMedia: number;
    vendasOriginadasTotal: number;
  };
  top3: SDRMetrics[];
  destaque: SDRMetrics | null;
}

// Função para normalizar nomes removendo acentos
const removerAcentos = (str: string): string => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

// Função para comparar nomes de SDR com flexibilidade
const compararNomeSDR = (nomeColuna: string, nomeBusca: string): boolean => {
  if (!nomeColuna || !nomeBusca) return false;
  
  const colunaLimpa = removerAcentos(nomeColuna).toUpperCase().trim();
  const buscaLimpa = removerAcentos(nomeBusca).toUpperCase().trim();
  
  // Comparação exata
  if (colunaLimpa === buscaLimpa) return true;
  
  // Mapeamento de variantes para nomes completos
  const variantesMap: Record<string, string[]> = {
    'VINICIUS MEIRELES': ['VINICIUS', 'VINÍCIUS', 'VINICIUS MEIRELES', 'VINÍCIUS MEIRELES'],
    'DAVI': ['DAVI'],
    'ANDREY': ['ANDREY'],
    'TIAGO': ['TIAGO'],
    'MARCOS': ['MARCOS'],
    'JOAO LOPES': ['JOAO LOPES', 'JOAO', 'JOÃO LOPES', 'JOÃO'],
    'BRUNNO VAZ': ['BRUNNO VAZ', 'BRUNNO', 'BRUNO VAZ']
  };
  
  // Normalizar a busca para key do mapa
  const buscaNormalizada = removerAcentos(buscaLimpa);
  const variantes = variantesMap[buscaNormalizada] || [];
  
  return variantes.some(v => removerAcentos(v).toUpperCase() === colunaLimpa);
};

export const calcularMetricasSDR = (data: any[], dateRange?: DateRange): SDRData => {
  // Debug: listar todos os valores únicos de SDR na planilha
  if (data.length > 0) {
    const sdrsUnicos = [...new Set(data.map(row => String(row['SDR'] || '').trim()))].filter(Boolean);
    console.log('📋 SDRs únicos na planilha:', sdrsUnicos);
    
    const sdrsFechouUnicos = [...new Set(data.map(row => String(row['SDR FECHOU'] || '').trim()))].filter(Boolean);
    console.log('📋 SDRs FECHOU únicos na planilha:', sdrsFechouUnicos);
  }

  // Filtrar dados por período se houver filtro
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

  // Determinar equipe baseada no período
  const isOutubro = dateRange && dateRange.start.getMonth() === 9 && dateRange.start.getFullYear() === 2025;
  const isDezembro = dateRange && dateRange.start.getMonth() === 11 && dateRange.start.getFullYear() === 2025;
  const isJaneiro = dateRange && dateRange.start.getMonth() === 0 && dateRange.start.getFullYear() === 2026;
  const isFevereiro = dateRange && dateRange.start.getMonth() === 1 && dateRange.start.getFullYear() === 2026;

  let sdrsNomes: string[];
  let squadMap: Record<string, { squad: string; color: string; emoji: string; displayName: string }>;

  if (isFevereiro) {
    // FEVEREIRO 2026: Vinícius (Hot Dogs), Andrey (Corvo Azul), Brunno Vaz (Ki Karnes)
    sdrsNomes = ['VINICIUS MEIRELES', 'ANDREY', 'BRUNNO VAZ'];
    squadMap = {
      'VINICIUS MEIRELES': { squad: 'Hot Dogs', color: '#FF4757', emoji: '🔴', displayName: 'Vinícius' },
      'ANDREY': { squad: 'Corvo Azul', color: '#0066FF', emoji: '🔵', displayName: 'Andrey' },
      'BRUNNO VAZ': { squad: 'Ki Karnes', color: '#FF6B00', emoji: '🟠', displayName: 'Brunno Vaz' }
    };
  } else if (isJaneiro) {
    // JANEIRO 2026: Davi (função dupla SDR/Closer) no Hot Dogs, Vinícius no Corvo Azul, Andrey sem squad
    sdrsNomes = ['VINICIUS MEIRELES', 'DAVI', 'ANDREY'];
    squadMap = {
      'VINICIUS MEIRELES': { squad: 'Corvo Azul', color: '#0066FF', emoji: '🔵', displayName: 'Vinícius' },
      'DAVI': { squad: 'Hot Dogs', color: '#FF4757', emoji: '🔴', displayName: 'Davi' },
      'ANDREY': { squad: 'Sem Squad', color: '#64748B', emoji: '⚪', displayName: 'Andrey' }
    };
  } else if (isOutubro) {
    // OUTUBRO: Marcos como SDR
    sdrsNomes = ['VINICIUS MEIRELES', 'MARCOS', 'TIAGO', 'JOAO LOPES'];
    squadMap = {
      'VINICIUS MEIRELES': { squad: 'Corvo Azul', color: '#0066FF', emoji: '🔵', displayName: 'Vinícius' },
      'MARCOS': { squad: 'Hot Dogs', color: '#FF4757', emoji: '🔴', displayName: 'Marcos' },
      'TIAGO': { squad: 'Sem Squad', color: '#64748B', emoji: '⚪', displayName: 'Tiago' },
      'JOAO LOPES': { squad: 'RevOps', color: '#94A3B8', emoji: '⚙️', displayName: 'João Lopes' }
    };
  } else if (isDezembro) {
    // DEZEMBRO: Davi no Hot Dogs, Vinícius no Corvo Azul, Andrey sem squad
    sdrsNomes = ['VINICIUS MEIRELES', 'DAVI', 'ANDREY'];
    squadMap = {
      'VINICIUS MEIRELES': { squad: 'Corvo Azul', color: '#0066FF', emoji: '🔵', displayName: 'Vinícius' },
      'DAVI': { squad: 'Hot Dogs', color: '#FF4757', emoji: '🔴', displayName: 'Davi' },
      'ANDREY': { squad: 'Sem Squad', color: '#64748B', emoji: '⚪', displayName: 'Andrey' }
    };
  } else {
    // NOVEMBRO: Tiago no Hot Dogs, Vinícius no Corvo Azul, Davi sem squad
    sdrsNomes = ['VINICIUS MEIRELES', 'TIAGO', 'DAVI'];
    squadMap = {
      'VINICIUS MEIRELES': { squad: 'Corvo Azul', color: '#0066FF', emoji: '🔵', displayName: 'Vinícius' },
      'TIAGO': { squad: 'Hot Dogs', color: '#FF4757', emoji: '🔴', displayName: 'Tiago' },
      'DAVI': { squad: 'Sem Squad', color: '#10B981', emoji: '🟢', displayName: 'Davi' }
    };
  }

  const sdrsMetrics: SDRMetrics[] = sdrsNomes.map(nome => {
    // Filtrar linhas onde SDR = nome do SDR (usando comparação flexível)
    const callsDoSDR = filteredData.filter(row => {
      const sdrNome = String(row['SDR'] || '').trim();
      return compararNomeSDR(sdrNome, nome);
    });

    const totalCalls = callsDoSDR.length;

    // Contar calls por tipo (R1 ou R2)
    const callsR1 = callsDoSDR.filter(row => {
      const tipoCall = String(row['TIPO DA CALL'] || row['Tipo da Call'] || row['TIPO DA CALL'] || '').trim().toUpperCase();
      return tipoCall === 'R1';
    }).length;

    const callsR2 = callsDoSDR.filter(row => {
      const tipoCall = String(row['TIPO DA CALL'] || row['Tipo da Call'] || row['TIPO DA CALL'] || '').trim().toUpperCase();
      return tipoCall === 'R2';
    }).length;

    // Contar calls qualificadas (QUALIFICADA (SQL) = "SIM")
    const callsQualificadas = callsDoSDR.filter(row => {
      const qualificada = String(row['QUALIFICADA (SQL)'] || '').trim().toUpperCase();
      return qualificada === 'SIM';
    }).length;

    const taxaQualificacao = totalCalls > 0 ? (callsQualificadas / totalCalls) * 100 : 0;

    // Calls Agendadas = todas as calls do SDR
    const callsAgendadas = totalCalls;

    // Calls Realizadas = contar onde tem CLOSER preenchido E não é NO-SHOW
    const callsRealizadas = callsDoSDR.filter(row => {
      const closer = String(row['CLOSER'] || '').trim().toUpperCase();
      return closer.length > 0 && closer !== 'NO-SHOW';
    }).length;

    // No-Shows = contar diretamente onde CLOSER = "NO-SHOW"
    const noShows = callsDoSDR.filter(row => {
      const closer = String(row['CLOSER'] || '').trim().toUpperCase();
      return closer === 'NO-SHOW';
    }).length;

    // Taxa de Show
    const taxaShow = callsAgendadas > 0 ? (callsRealizadas / callsAgendadas) * 100 : 0;

    // Mapear dados detalhados das calls
    const mapCallData = (row: any): SDRCallData => {
      const tipoCall = String(row['TIPO DA CALL'] || row['Tipo da Call'] || '').trim().toUpperCase();
      const qualificada = String(row['QUALIFICADA (SQL)'] || '').trim().toUpperCase() === 'SIM';
      const fechamento = String(row['FECHAMENTO'] || '').trim().toUpperCase() === 'SIM';
      const closer = String(row['CLOSER'] || '').trim();
      const noShow = closer.toUpperCase() === 'NO-SHOW';
      return {
        nomeCall: row['NOME DA CALL'] || row['LEAD'] || row['CLIENTE'] || 'Cliente não identificado',
        data: row['DATA'] || row['Data'] || 'Sem data',
        closer,
        tipoCall: tipoCall || '-',
        qualificada,
        valor: parseValor(row['VALOR'] || '0'),
        fechamento,
        noShow
      };
    };

    const callsAgendadasData: SDRCallData[] = callsDoSDR.map(mapCallData);

    const callsRealizadasData: SDRCallData[] = callsDoSDR
      .filter(row => {
        const closer = String(row['CLOSER'] || '').trim().toUpperCase();
        return closer.length > 0 && closer !== 'NO-SHOW';
      })
      .map(mapCallData);

    const callsQualificadasData: SDRCallData[] = callsDoSDR
      .filter(row => {
        const qualificada = String(row['QUALIFICADA (SQL)'] || '').trim().toUpperCase();
        return qualificada === 'SIM';
      })
      .map(mapCallData);

    // Vendas Originadas (somar VALOR onde SDR FECHOU = nome do SDR E FECHAMENTO = SIM)
    const vendasOriginadas = filteredData
      .filter(row => {
        const sdrFechou = String(row['SDR FECHOU'] || '').trim();
        const fechamento = String(row['FECHAMENTO'] || '').trim().toUpperCase();
        return compararNomeSDR(sdrFechou, nome) && fechamento === 'SIM';
      })
      .reduce((acc, row) => {
        const valor = parseValor(row['VALOR']);
        return acc + valor;
      }, 0);

    // Número de Contratos Originados (apenas FECHAMENTO = SIM)
    const contratosOriginados = filteredData.filter(row => {
      const sdrFechou = String(row['SDR FECHOU'] || '').trim();
      const fechamento = String(row['FECHAMENTO'] || '').trim().toUpperCase();
      return compararNomeSDR(sdrFechou, nome) && fechamento === 'SIM';
    }).length;

    // Coletar contratos fechados originados por este SDR
    const contratos: SDRContract[] = filteredData
      .filter(row => {
        const sdrFechou = String(row['SDR FECHOU'] || '').trim();
        const fechamento = String(row['FECHAMENTO'] || '').trim().toUpperCase();
        return compararNomeSDR(sdrFechou, nome) && fechamento === 'SIM';
      })
      .map(row => {
        const assinatura = String(row['ASSINATURA'] || '').trim().toUpperCase();
        const pagamento = String(row['PAGAMENTO'] || '').trim().toUpperCase();
        
        return {
          nomeCall: row['NOME DA CALL'] || 'Cliente não identificado',
          closer: row['CLOSER'] || 'Closer não atribuído',
          valor: parseValor(row['VALOR'] || '0'),
          data: row['DATA'] || row['Data'] || 'Sem data',
          assinado: assinatura === 'ASSINOU',
          pago: pagamento === 'PAGOU'
        };
      })
      .sort((a, b) => {
        // Ordenar por data (mais recente primeiro)
        try {
          const dateA = new Date(a.data.split('/').reverse().join('-'));
          const dateB = new Date(b.data.split('/').reverse().join('-'));
          return dateB.getTime() - dateA.getTime();
        } catch {
          return 0;
        }
      });

    // Log de debug
    console.log(`📊 SDR: ${nome}`);
    console.log('  - Total Calls:', totalCalls, `(R1: ${callsR1}, R2: ${callsR2})`);
    console.log('  - Calls Realizadas:', callsRealizadas);
    console.log('  - No-Shows:', noShows);
    console.log('  - Vendas Originadas:', vendasOriginadas);
    console.log('  - Contratos:', contratosOriginados);

    return {
      nome: squadMap[nome]?.displayName || nome, // exibir "Vinícius" no UI
      nomeOriginal: nome, // guardar "VINICIUS MEIRELES" para filtros
      squad: squadMap[nome]?.squad || 'Sem Squad',
      squadColor: squadMap[nome]?.color || '#64748B',
      emoji: squadMap[nome]?.emoji || '⚪',
      totalCalls,
      callsR1,
      callsR2,
      callsQualificadas,
      taxaQualificacao,
      callsAgendadas,
      callsRealizadas,
      noShows,
      taxaShow,
      vendasOriginadas,
      contratosOriginados,
      contratos,
      callsAgendadasData,
      callsRealizadasData,
      callsQualificadasData
    };
  });

  // Calcular totais
  const totais = {
    totalCalls: sdrsMetrics.reduce((acc, sdr) => acc + sdr.totalCalls, 0),
    taxaQualificacaoMedia: sdrsMetrics.length > 0 
      ? sdrsMetrics.reduce((acc, sdr) => acc + sdr.taxaQualificacao, 0) / sdrsMetrics.length 
      : 0,
    taxaShowMedia: sdrsMetrics.length > 0
      ? sdrsMetrics.reduce((acc, sdr) => acc + sdr.taxaShow, 0) / sdrsMetrics.length
      : 0,
    vendasOriginadasTotal: sdrsMetrics.reduce((acc, sdr) => acc + sdr.vendasOriginadas, 0)
  };

  // Top 3 por receita originada
  const top3 = [...sdrsMetrics]
    .sort((a, b) => b.vendasOriginadas - a.vendasOriginadas)
    .slice(0, 3);

  // SDR destaque (maior receita)
  const destaque = sdrsMetrics.reduce((prev, current) => 
    current.vendasOriginadas > prev.vendasOriginadas ? current : prev
  , sdrsMetrics[0]);

  return {
    sdrs: sdrsMetrics,
    totais,
    top3,
    destaque
  };
};

// Função para mesclar métricas calculadas com dados do dashboard
export const mesclarMetricasSDRComDashboard = (
  metricasCalculadas: SDRData,
  dadosDashboard: any[]
): SDRData => {
  console.log('🔄 Mesclando métricas SDR com dashboard...');
  console.log('Métricas calculadas:', metricasCalculadas);
  console.log('Dados dashboard:', dadosDashboard);

  // Criar mapa de normalização de nomes
  const mapearNomes: Record<string, string> = {
    'VINICIUS': 'VINICIUS MEIRELES',
    'VINÍCIUS': 'VINICIUS MEIRELES',
    'VINICIUS MEIRELES': 'VINICIUS MEIRELES',
    'MARCOS': 'MARCOS',
    'TIAGO': 'TIAGO',
    'JOÃO': 'JOÃO LOPES',
    'JOÃO LOPES': 'JOÃO LOPES',
    'JOAO': 'JOÃO LOPES',
    'JOAO LOPES': 'JOÃO LOPES',
    'DAVI': 'DAVI',
    'ANDREY': 'ANDREY',
    'BRUNNO VAZ': 'BRUNNO VAZ',
    'BRUNNO': 'BRUNNO VAZ',
    'BRUNO VAZ': 'BRUNNO VAZ'
  };

  const normalizarNome = (nome: string): string => {
    const nomeUpper = nome.toUpperCase().trim();
    return mapearNomes[nomeUpper] || nomeUpper;
  };

  // Mesclar dados
  const sdrsMesclados = metricasCalculadas.sdrs.map(sdr => {
    const nomeDash = normalizarNome(sdr.nomeOriginal);
    const dashData = dadosDashboard.find(d => 
      normalizarNome(d.nome) === nomeDash
    );

    if (dashData) {
      console.log(`✅ Match encontrado para ${sdr.nome}:`, dashData);
      return {
        ...sdr,
        valorVendasDash: dashData.valorVendas,
        percentualVendasDash: dashData.percentualVendas,
        callsAgendadasDash: dashData.callsAgendadas,
        callsQualificadasDash: dashData.callsQualificadas,
        noShowDash: dashData.noShow,
        txNoShowDash: dashData.txNoShow,
        txComparecimentoDash: dashData.txComparecimento,
        // Priorizar dados do dashboard onde aplicável
        vendasOriginadas: dashData.valorVendas || sdr.vendasOriginadas,
        contratos: sdr.contratos
      };
    } else {
      console.log(`⚠️ Nenhum match encontrado para ${sdr.nome}`);
      return sdr;
    }
  });

  // Recalcular top3 e destaque com dados mesclados
  const top3Mesclado = [...sdrsMesclados]
    .sort((a, b) => b.vendasOriginadas - a.vendasOriginadas)
    .slice(0, 3);

  const destaqueMesclado = sdrsMesclados.reduce((prev, current) => 
    current.vendasOriginadas > prev.vendasOriginadas ? current : prev
  , sdrsMesclados[0]);

  // Recalcular totais
  const totaisMesclados = {
    totalCalls: sdrsMesclados.reduce((acc, sdr) => acc + sdr.totalCalls, 0),
    taxaQualificacaoMedia: sdrsMesclados.length > 0 
      ? sdrsMesclados.reduce((acc, sdr) => acc + sdr.taxaQualificacao, 0) / sdrsMesclados.length 
      : 0,
    taxaShowMedia: sdrsMesclados.length > 0
      ? sdrsMesclados.reduce((acc, sdr) => acc + sdr.taxaShow, 0) / sdrsMesclados.length
      : 0,
    vendasOriginadasTotal: sdrsMesclados.reduce((acc, sdr) => acc + sdr.vendasOriginadas, 0)
  };

  return {
    sdrs: sdrsMesclados,
    totais: totaisMesclados,
    top3: top3Mesclado,
    destaque: destaqueMesclado
  };
};
