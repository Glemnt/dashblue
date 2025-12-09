// Types
export type ObjetivoType = 'WhatsApp' | 'Formulário' | 'Landing Page' | 'VSL' | 'Outros';

export interface CampanhaData {
  id: number;
  nome: string;
  canal: string;
  objetivo: ObjetivoType;
  status: 'ativo' | 'pausado' | 'finalizado';
  investimento: number;
  impressoes: number;
  cliques: number;
  ctr: number;
  cpc: number;
  leadsGerados: number;
  cpl: number;
  leadsQualificados: number;
  taxaQualificacao: number;
  callsAgendadas: number;
  callsRealizadas: number;
  fechamentos: number;
  valorFechado: number;
  roas: number;
  roi: number;
  cac: number;
  ticketMedio: number;
}

export interface CanalMetrics {
  canal: string;
  investimento: number;
  leads: number;
  leadsQualificados: number;
  fechamentos: number;
  receita: number;
  roas: number;
  cac: number;
  performance: number; // 1-5 stars
}

export interface TrafegoTotais {
  investimento: number;
  impressoes: number;
  cliques: number;
  ctr: number;
  cpc: number;
  leads: number;
  cpl: number;
  leadsQualificados: number;
  taxaQualificacao: number;
  callsAgendadas: number;
  callsRealizadas: number;
  fechamentos: number;
  receita: number;
  roas: number;
  roi: number;
  cac: number;
}

export interface TrafegoMetrics {
  totais: TrafegoTotais;
  campanhas: CampanhaData[];
  porCanal: CanalMetrics[];
}

// Metas de Tráfego - importar da config centralizada
import { getMetasTrafegoAtual, MetasTrafego } from './metasConfig';

// Re-exportar para manter compatibilidade
export const getMetasTrafego = (): MetasTrafego => getMetasTrafegoAtual();

// Alias para compatibilidade com código antigo
export const METAS_TRAFEGO = {
  get investimentoMensal() { return getMetasTrafegoAtual().investimentoMensal; },
  get leadsGerados() { return getMetasTrafegoAtual().leads; },
  get leadsQualificados() { return getMetasTrafegoAtual().callsAgendadas; },
  get cacMaximo() { return getMetasTrafegoAtual().cacMeta; },
  get roasMinimo() { return getMetasTrafegoAtual().roasMinimo; },
  get taxaQualificacaoMinima() { return getMetasTrafegoAtual().taxaLeadParaQualificado * 100; }
};

// Mock Data para campanhas
export const campanhasMock: CampanhaData[] = [
  {
    id: 1,
    nome: "Campanha Webinar 2.0",
    canal: "Meta Ads",
    objetivo: "Landing Page",
    status: "ativo",
    investimento: 8500,
    impressoes: 425000,
    cliques: 12750,
    ctr: 3.0,
    cpc: 0.67,
    leadsGerados: 142,
    cpl: 59.86,
    leadsQualificados: 89,
    taxaQualificacao: 62.7,
    callsAgendadas: 38,
    callsRealizadas: 34,
    fechamentos: 6,
    valorFechado: 69600,
    roas: 8.19,
    roi: 719,
    cac: 1416.67,
    ticketMedio: 11600
  },
  {
    id: 2,
    nome: "Google Search - SaaS",
    canal: "Google Ads",
    objetivo: "Landing Page",
    status: "ativo",
    investimento: 12000,
    impressoes: 580000,
    cliques: 13920,
    ctr: 2.4,
    cpc: 0.86,
    leadsGerados: 98,
    cpl: 122.45,
    leadsQualificados: 67,
    taxaQualificacao: 68.4,
    callsAgendadas: 31,
    callsRealizadas: 28,
    fechamentos: 8,
    valorFechado: 109200,
    roas: 9.1,
    roi: 810,
    cac: 1500,
    ticketMedio: 13650
  },
  {
    id: 3,
    nome: "LinkedIn B2B Premium",
    canal: "LinkedIn Ads",
    objetivo: "Formulário",
    status: "ativo",
    investimento: 9000,
    impressoes: 185000,
    cliques: 4625,
    ctr: 2.5,
    cpc: 1.95,
    leadsGerados: 76,
    cpl: 118.42,
    leadsQualificados: 58,
    taxaQualificacao: 76.3,
    callsAgendadas: 24,
    callsRealizadas: 21,
    fechamentos: 5,
    valorFechado: 61200,
    roas: 6.8,
    roi: 580,
    cac: 1800,
    ticketMedio: 12240
  },
  {
    id: 4,
    nome: "Instagram Reels",
    canal: "Meta Ads",
    objetivo: "WhatsApp",
    status: "ativo",
    investimento: 4500,
    impressoes: 320000,
    cliques: 9600,
    ctr: 3.0,
    cpc: 0.47,
    leadsGerados: 187,
    cpl: 24.06,
    leadsQualificados: 92,
    taxaQualificacao: 49.2,
    callsAgendadas: 28,
    callsRealizadas: 24,
    fechamentos: 3,
    valorFechado: 18900,
    roas: 4.2,
    roi: 320,
    cac: 1500,
    ticketMedio: 6300
  },
  {
    id: 5,
    nome: "YouTube Pre-Roll",
    canal: "YouTube Ads",
    objetivo: "VSL",
    status: "ativo",
    investimento: 3000,
    impressoes: 95000,
    cliques: 2375,
    ctr: 2.5,
    cpc: 1.26,
    leadsGerados: 45,
    cpl: 66.67,
    leadsQualificados: 21,
    taxaQualificacao: 46.7,
    callsAgendadas: 8,
    callsRealizadas: 7,
    fechamentos: 1,
    valorFechado: 6300,
    roas: 2.1,
    roi: 110,
    cac: 3000,
    ticketMedio: 6300
  },
  {
    id: 6,
    nome: "Remarketing Geral",
    canal: "Outros",
    objetivo: "Outros",
    status: "pausado",
    investimento: 2000,
    impressoes: 145000,
    cliques: 4350,
    ctr: 3.0,
    cpc: 0.46,
    leadsGerados: 28,
    cpl: 71.43,
    leadsQualificados: 15,
    taxaQualificacao: 53.6,
    callsAgendadas: 5,
    callsRealizadas: 4,
    fechamentos: 0,
    valorFechado: 0,
    roas: 0,
    roi: -100,
    cac: 0,
    ticketMedio: 0
  }
];

// Funções de cálculo
export const calcularTotaisTrafego = (campanhas: CampanhaData[]): TrafegoTotais => {
  const totais = campanhas.reduce((acc, c) => ({
    investimento: acc.investimento + c.investimento,
    impressoes: acc.impressoes + c.impressoes,
    cliques: acc.cliques + c.cliques,
    leads: acc.leads + c.leadsGerados,
    leadsQualificados: acc.leadsQualificados + c.leadsQualificados,
    callsAgendadas: acc.callsAgendadas + c.callsAgendadas,
    callsRealizadas: acc.callsRealizadas + c.callsRealizadas,
    fechamentos: acc.fechamentos + c.fechamentos,
    receita: acc.receita + c.valorFechado,
  }), {
    investimento: 0,
    impressoes: 0,
    cliques: 0,
    leads: 0,
    leadsQualificados: 0,
    callsAgendadas: 0,
    callsRealizadas: 0,
    fechamentos: 0,
    receita: 0,
  });

  const ctr = totais.impressoes > 0 ? (totais.cliques / totais.impressoes) * 100 : 0;
  const cpc = totais.cliques > 0 ? totais.investimento / totais.cliques : 0;
  const cpl = totais.leads > 0 ? totais.investimento / totais.leads : 0;
  const taxaQualificacao = totais.leads > 0 ? (totais.leadsQualificados / totais.leads) * 100 : 0;
  const roas = totais.investimento > 0 ? totais.receita / totais.investimento : 0;
  const roi = totais.investimento > 0 ? ((totais.receita - totais.investimento) / totais.investimento) * 100 : 0;
  const cac = totais.fechamentos > 0 ? totais.investimento / totais.fechamentos : 0;

  return {
    ...totais,
    ctr,
    cpc,
    cpl,
    taxaQualificacao,
    roas,
    roi,
    cac
  };
};

export const calcularMetricasPorCanal = (campanhas: CampanhaData[]): CanalMetrics[] => {
  const canaisMap = new Map<string, {
    investimento: number;
    leads: number;
    leadsQualificados: number;
    fechamentos: number;
    receita: number;
  }>();

  campanhas.forEach(c => {
    const atual = canaisMap.get(c.canal) || {
      investimento: 0,
      leads: 0,
      leadsQualificados: 0,
      fechamentos: 0,
      receita: 0,
    };

    canaisMap.set(c.canal, {
      investimento: atual.investimento + c.investimento,
      leads: atual.leads + c.leadsGerados,
      leadsQualificados: atual.leadsQualificados + c.leadsQualificados,
      fechamentos: atual.fechamentos + c.fechamentos,
      receita: atual.receita + c.valorFechado,
    });
  });

  return Array.from(canaisMap.entries()).map(([canal, dados]) => {
    const roas = dados.investimento > 0 ? dados.receita / dados.investimento : 0;
    const cac = dados.fechamentos > 0 ? dados.investimento / dados.fechamentos : 0;
    
    // Calcular performance (1-5 estrelas) baseado no ROAS
    let performance = 1;
    if (roas >= 8) performance = 5;
    else if (roas >= 6) performance = 4;
    else if (roas >= 4) performance = 3;
    else if (roas >= 2) performance = 2;

    return {
      canal,
      ...dados,
      roas,
      cac,
      performance
    };
  }).sort((a, b) => b.roas - a.roas);
};

// Calcular Score da Campanha (0-100)
export const calcularScoreCampanha = (campanha: CampanhaData): number => {
  const pontuacaoRoas = Math.min(campanha.roas * 10, 40); // Máx 40 pontos
  const pontuacaoQualificacao = (campanha.taxaQualificacao / 100) * 30; // Máx 30 pontos
  const pontuacaoCac = campanha.cac > 0 
    ? Math.max(0, (1 - campanha.cac / METAS_TRAFEGO.cacMaximo) * 20) 
    : 0; // Máx 20 pontos
  const pontuacaoFechamentos = Math.min(campanha.fechamentos * 2, 10); // Máx 10 pontos

  return Math.round(pontuacaoRoas + pontuacaoQualificacao + pontuacaoCac + pontuacaoFechamentos);
};

// Formatar valores
export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
};

export const formatarMoedaCompacta = (valor: number): string => {
  if (valor >= 1000000) {
    return `R$ ${(valor / 1000000).toFixed(1)}M`;
  }
  if (valor >= 1000) {
    return `R$ ${(valor / 1000).toFixed(1)}k`;
  }
  return formatarMoeda(valor);
};

export const formatarNumero = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR').format(valor);
};

export const formatarPercentual = (valor: number): string => {
  return `${valor.toFixed(1)}%`;
};

// Cores dos canais de aquisição (plataformas de mídia paga)
export const CORES_CANAIS: Record<string, string> = {
  'Meta Ads': '#0866FF',      // Azul Meta
  'Google Ads': '#4285F4',    // Azul Google
  'LinkedIn Ads': '#0A66C2',  // Azul LinkedIn
  'YouTube Ads': '#FF0000',   // Vermelho YouTube
  'TikTok Ads': '#000000',    // Preto TikTok
  'Outros': '#6B7280',        // Cinza
};

// Cores dos objetivos
export const CORES_OBJETIVOS: Record<string, string> = {
  'WhatsApp': '#25D366',
  'Formulário': '#1877F2',
  'Landing Page': '#8B5CF6',
  'VSL': '#EF4444',
  'Outros': '#6B7280'
};

// Status colors
export const getStatusColor = (roas: number): string => {
  if (roas >= 5) return '#10B981'; // Verde forte
  if (roas >= 3) return '#34D399'; // Verde claro
  if (roas >= 2) return '#FBBF24'; // Amarelo
  return '#EF4444'; // Vermelho
};

export const getStatusLabel = (roas: number): string => {
  if (roas >= 5) return 'Excelente';
  if (roas >= 3) return 'Bom';
  if (roas >= 2) return 'Regular';
  return 'Atenção';
};
