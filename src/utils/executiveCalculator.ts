export interface Projecoes {
  otimista: {
    receitaFinal: number;
    contratos: number;
    probabilidade: number;
    diasRestantes: number;
  };
  pessimista: {
    receitaFinal: number;
    contratos: number;
    probabilidade: number;
    diasRestantes: number;
  };
  riscosCriticos: string[];
  oportunidades: string[];
}

export const calcularProjecoes = (metricas: any, alerts: any[]): Projecoes => {
  const diasUteis = 22; // total de dias úteis no mês
  const now = new Date();
  const diaAtual = now.getDate();
  const diasDecorridos = Math.min(diaAtual, diasUteis);
  const diasRestantes = Math.max(diasUteis - diasDecorridos, 0);
  
  // Ritmo atual (receita por dia útil)
  const ritmoAtual = diasDecorridos > 0 ? metricas.receitaTotal / diasDecorridos : 0;
  
  // PROJEÇÃO OTIMISTA (mantém ou melhora ritmo atual)
  const receitaOtimista = metricas.receitaTotal + (ritmoAtual * diasRestantes * 1.1); // +10% boost
  const contratosOtimistas = Math.round(metricas.totalContratos * (receitaOtimista / (metricas.receitaTotal || 1)));
  
  // PROJEÇÃO PESSIMISTA (desaceleração de 20%)
  const receitaPessimista = metricas.receitaTotal + (ritmoAtual * diasRestantes * 0.8);
  const contratosPessimistas = Math.round(metricas.totalContratos * (receitaPessimista / (metricas.receitaTotal || 1)));
  
  // Probabilidades baseadas no progresso atual
  const progressoAtual = metricas.progressoMetaMensal;
  const probabilidadeOtimista = progressoAtual >= 70 ? 65 : progressoAtual >= 50 ? 45 : 25;
  const probabilidadePessimista = 100 - probabilidadeOtimista;
  
  // RISCOS CRÍTICOS (baseado em alertas)
  const riscosCriticos = alerts
    .filter(a => a.severity === 'critical')
    .map(a => a.message)
    .slice(0, 3);
  
  // OPORTUNIDADES (baseado em performance)
  const oportunidades = [];
  if (metricas.taxaConversao > 35) {
    oportunidades.push('Taxa de conversão acima da média - capitalize com mais leads');
  }
  if (metricas.ticketMedio > 11000) {
    oportunidades.push('Ticket médio alto - foque em clientes premium');
  }
  if (metricas.progressoMetaSemanal > 90) {
    oportunidades.push('Ritmo semanal excelente - aumente a meta');
  }
  if (metricas.taxaShow > 70) {
    oportunidades.push('Excelente taxa de show - equipe está engajada');
  }
  
  return {
    otimista: {
      receitaFinal: receitaOtimista,
      contratos: contratosOtimistas,
      probabilidade: probabilidadeOtimista,
      diasRestantes
    },
    pessimista: {
      receitaFinal: receitaPessimista,
      contratos: contratosPessimistas,
      probabilidade: probabilidadePessimista,
      diasRestantes
    },
    riscosCriticos: riscosCriticos.length > 0 ? riscosCriticos : ['Nenhum risco crítico identificado'],
    oportunidades: oportunidades.length > 0 ? oportunidades.slice(0, 3) : ['Continue mantendo o bom desempenho']
  };
};
