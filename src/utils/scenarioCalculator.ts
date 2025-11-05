import { formatarReal } from './metricsCalculator';

export interface ScenarioData {
  taxaShow: number;
  taxaConversao: number;
  ticketMedio: number;
  callsRealizadas: number;
  contratos: number;
  receita: number;
  progressoMeta: number;
}

export interface SensitivityData {
  taxaShow: { impacto: number; descricao: string };
  taxaConversao: { impacto: number; descricao: string };
  ticketMedio: { impacto: number; descricao: string };
  maiorAlavanca: 'taxaShow' | 'taxaConversao' | 'ticketMedio';
}

/**
 * Calcula um cenário projetado baseado em valores simulados
 */
export const calcularCenario = (
  taxaShow: number,
  taxaConversao: number,
  ticketMedio: number,
  callsAgendadas: number,
  callsQualificadas: number,
  metaMensal: number
): ScenarioData => {
  // Calcular calls realizadas com taxa show
  const callsRealizadas = callsAgendadas * (taxaShow / 100);
  
  // Calcular contratos com taxa conversão
  const contratos = callsQualificadas * (taxaConversao / 100);
  
  // Calcular receita
  const receita = contratos * ticketMedio;
  
  // Progresso da meta
  const progressoMeta = (receita / metaMensal) * 100;
  
  return {
    taxaShow,
    taxaConversao,
    ticketMedio,
    callsRealizadas,
    contratos,
    receita,
    progressoMeta
  };
};

/**
 * Gera cenário realista com melhorias conservadoras
 * Taxa Show: +5%, Taxa Conversão: +3%, Ticket: +10%
 */
export const gerarCenarioRealista = (
  currentScenario: ScenarioData,
  callsAgendadas: number,
  callsQualificadas: number,
  metaMensal: number
): ScenarioData => {
  return calcularCenario(
    currentScenario.taxaShow * 1.05, // +5%
    currentScenario.taxaConversao * 1.03, // +3%
    currentScenario.ticketMedio * 1.10, // +10%
    callsAgendadas,
    callsQualificadas,
    metaMensal
  );
};

/**
 * Gera cenário otimista com metas ideais
 * Taxa Show: 75%, Taxa Conversão: 25%, Ticket: R$ 12.000
 */
export const gerarCenarioOtimista = (
  callsAgendadas: number,
  callsQualificadas: number,
  metaMensal: number
): ScenarioData => {
  return calcularCenario(
    75, // Meta taxa show
    25, // Meta taxa conversão
    12000, // Meta ticket médio
    callsAgendadas,
    callsQualificadas,
    metaMensal
  );
};

/**
 * Gera cenário pessimista com piora nas métricas
 * Taxa Show: -10%, Taxa Conversão: -5%, Ticket: -15%
 */
export const gerarCenarioPessimista = (
  currentScenario: ScenarioData,
  callsAgendadas: number,
  callsQualificadas: number,
  metaMensal: number
): ScenarioData => {
  return calcularCenario(
    currentScenario.taxaShow * 0.90, // -10%
    currentScenario.taxaConversao * 0.95, // -5%
    currentScenario.ticketMedio * 0.85, // -15%
    callsAgendadas,
    callsQualificadas,
    metaMensal
  );
};

/**
 * Calcula a sensibilidade de cada variável
 * Mostra o impacto financeiro de cada +1% ou +R$1.000
 */
export const calcularSensibilidade = (
  callsAgendadas: number,
  callsQualificadas: number,
  contratos: number,
  taxaShow: number,
  taxaConversao: number,
  ticketMedio: number
): SensitivityData => {
  // Impacto de +1% na taxa de show
  // Mais 1% de show = +1% de calls realizadas
  // Se temos X calls agendadas, +1% = +0.01*X calls
  // Essas calls a mais viram contratos: 0.01*X * taxaConversao * ticketMedio
  const impactoShow = (callsAgendadas * 0.01) * (taxaConversao / 100) * ticketMedio;
  
  // Impacto de +1% na taxa de conversão
  // Mais 1% de conversão = +1% de contratos sobre calls qualificadas
  // 0.01 * callsQualificadas * ticketMedio
  const impactoConversao = callsQualificadas * 0.01 * ticketMedio;
  
  // Impacto de +R$ 1.000 no ticket médio
  // Se temos X contratos, +R$1000 por contrato = X * 1000
  const impactoTicket = contratos * 1000;
  
  // Identificar maior alavanca
  const impactos = {
    taxaShow: impactoShow,
    taxaConversao: impactoConversao,
    ticketMedio: impactoTicket
  };
  
  const maiorAlavanca = (Object.keys(impactos) as Array<keyof typeof impactos>).reduce((a, b) => 
    impactos[a] > impactos[b] ? a : b
  );
  
  return {
    taxaShow: {
      impacto: impactoShow,
      descricao: `Cada +1% = +${formatarReal(impactoShow)}`
    },
    taxaConversao: {
      impacto: impactoConversao,
      descricao: `Cada +1% = +${formatarReal(impactoConversao)}`
    },
    ticketMedio: {
      impacto: impactoTicket,
      descricao: `Cada +R$ 1.000 = +${formatarReal(impactoTicket)}`
    },
    maiorAlavanca
  };
};

/**
 * Calcula dias úteis restantes no mês
 */
export const calcularDiasUteisRestantes = (): number => {
  const hoje = new Date();
  const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  
  let diasUteis = 0;
  const dataAtual = new Date(hoje);
  
  while (dataAtual <= ultimoDiaMes) {
    const diaSemana = dataAtual.getDay();
    // 0 = Domingo, 6 = Sábado
    if (diaSemana !== 0 && diaSemana !== 6) {
      diasUteis++;
    }
    dataAtual.setDate(dataAtual.getDate() + 1);
  }
  
  return diasUteis;
};
