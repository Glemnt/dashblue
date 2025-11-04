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

export interface SDRMetrics {
  nome: string;
  nomeOriginal: string;
  squad: string;
  squadColor: string;
  emoji: string;
  totalCalls: number;
  callsQualificadas: number;
  taxaQualificacao: number;
  callsAgendadas: number;
  callsRealizadas: number;
  noShows: number;
  taxaShow: number;
  vendasOriginadas: number;
  contratosOriginados: number;
  contratos: SDRContract[];
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

export const calcularMetricasSDR = (data: any[], dateRange?: DateRange): SDRData => {
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

  let sdrsNomes: string[];
  let squadMap: Record<string, { squad: string; color: string; emoji: string; displayName: string }>;

  if (isOutubro) {
    // OUTUBRO: Marcos como SDR
    sdrsNomes = ['VINICIUS MEIRELES', 'MARCOS', 'TIAGO', 'JOÃO LOPES'];
    squadMap = {
      'VINICIUS MEIRELES': { squad: 'Corvo Azul', color: '#0066FF', emoji: '🔵', displayName: 'Vinícius' },
      'MARCOS': { squad: 'Hot Dogs', color: '#FF4757', emoji: '🔴', displayName: 'Marcos' },
      'TIAGO': { squad: 'Sem Squad', color: '#64748B', emoji: '⚪', displayName: 'Tiago' },
      'JOÃO LOPES': { squad: 'RevOps', color: '#94A3B8', emoji: '⚙️', displayName: 'João Lopes' }
    };
  } else {
    // NOVEMBRO: Davi como SDR, sem Marcos e sem João Lopes
    sdrsNomes = ['VINICIUS MEIRELES', 'TIAGO', 'DAVI'];
    squadMap = {
      'VINICIUS MEIRELES': { squad: 'Corvo Azul', color: '#0066FF', emoji: '🔵', displayName: 'Vinícius' },
      'TIAGO': { squad: 'Hot Dogs', color: '#FF4757', emoji: '🔴', displayName: 'Tiago' },
      'DAVI': { squad: 'Sem Squad', color: '#10B981', emoji: '🟢', displayName: 'Davi' }
    };
  }

  const sdrsMetrics: SDRMetrics[] = sdrsNomes.map(nome => {
    // Filtrar linhas onde SDR = nome do SDR (case-insensitive, trim)
    const callsDoSDR = filteredData.filter(row => {
      const sdrNome = String(row['SDR'] || '').trim().toUpperCase();
      return sdrNome === nome; // nome já está em uppercase
    });

    const totalCalls = callsDoSDR.length;

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

    // Vendas Originadas (somar VALOR onde SDR FECHOU = nome do SDR)
    const vendasOriginadas = filteredData
      .filter(row => {
        const sdrFechou = String(row['SDR FECHOU'] || '').trim().toUpperCase();
        return sdrFechou === nome;
      })
      .reduce((acc, row) => {
        const valor = parseValor(row['VALOR']);
        return acc + valor;
      }, 0);

    // Número de Contratos Originados
    const contratosOriginados = filteredData.filter(row => {
      const sdrFechou = String(row['SDR FECHOU'] || '').trim().toUpperCase();
      return sdrFechou === nome;
    }).length;

    // Coletar contratos fechados originados por este SDR
    const contratos: SDRContract[] = filteredData
      .filter(row => {
        const sdrFechou = String(row['SDR FECHOU'] || '').trim().toUpperCase();
        const fechamento = String(row['FECHAMENTO'] || '').trim().toUpperCase();
        return sdrFechou === nome && fechamento === 'SIM';
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
    console.log('  - Total Calls:', totalCalls);
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
      callsQualificadas,
      taxaQualificacao,
      callsAgendadas,
      callsRealizadas,
      noShows,
      taxaShow,
      vendasOriginadas,
      contratosOriginados,
      contratos
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
    'JOAO LOPES': 'JOÃO LOPES'
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
