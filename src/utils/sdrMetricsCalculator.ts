import { parseValor } from './metricsCalculator';

export interface SDRMetrics {
  nome: string;
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

export const calcularMetricasSDR = (data: any[]): SDRData => {
  // Lista dos 4 SDRs
  const sdrsNomes = ['Vinícius', 'Marcos', 'Tiago', 'João Lopes'];
  
  // Mapear squads e cores
  const squadMap: Record<string, { squad: string; color: string; emoji: string }> = {
    'Vinícius': { squad: 'Corvo Azul', color: '#0066FF', emoji: '🔵' },
    'Marcos': { squad: 'Hot Dogs', color: '#FF4757', emoji: '🔴' },
    'Tiago': { squad: 'Sem Squad', color: '#64748B', emoji: '⚪' },
    'João Lopes': { squad: 'RevOps', color: '#94A3B8', emoji: '⚙️' }
  };

  const sdrsMetrics: SDRMetrics[] = sdrsNomes.map(nome => {
    // Filtrar linhas onde SDR = nome do SDR (case-insensitive, trim)
    const callsDoSDR = data.filter(row => {
      const sdrNome = String(row['SDR'] || '').trim();
      return sdrNome.toLowerCase() === nome.toLowerCase();
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

    // Calls Realizadas = contar onde tem CLOSER preenchido (significa que a call foi realizada)
    const callsRealizadas = callsDoSDR.filter(row => {
      const closer = String(row['CLOSER'] || '').trim();
      return closer.length > 0;
    }).length;

    // No-Shows
    const noShows = callsAgendadas - callsRealizadas;

    // Taxa de Show
    const taxaShow = callsAgendadas > 0 ? (callsRealizadas / callsAgendadas) * 100 : 0;

    // Vendas Originadas (somar VALOR onde SDR FECHOU = nome do SDR)
    const vendasOriginadas = data
      .filter(row => {
        const sdrFechou = String(row['SDR FECHOU'] || '').trim();
        return sdrFechou.toLowerCase() === nome.toLowerCase();
      })
      .reduce((acc, row) => {
        const valor = parseValor(row['VALOR']);
        return acc + valor;
      }, 0);

    // Número de Contratos Originados
    const contratosOriginados = data.filter(row => {
      const sdrFechou = String(row['SDR FECHOU'] || '').trim();
      return sdrFechou.toLowerCase() === nome.toLowerCase();
    }).length;

    return {
      nome,
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
      contratosOriginados
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
