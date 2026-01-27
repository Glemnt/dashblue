/**
 * Adaptadores de dados para converter tipos do Supabase para o formato
 * esperado pelos calculadores de métricas (que originalmente usavam CSV das planilhas)
 */

import { Tables } from '@/integrations/supabase/types';

type Venda = Tables<'vendas'>;
type Agendamento = Tables<'agendamentos'>;
type LeadCRM = Tables<'leads_crm'>;

// Interface que representa uma linha do formato antigo (CSV das planilhas)
export interface SheetRow {
  // Campos de identificação
  'NOME DA CALL'?: string;
  'NOME'?: string;
  'LEAD'?: string;
  
  // Status
  'FECHAMENTO'?: string;
  'STATUS'?: string;
  
  // Valores
  'VALOR'?: string;
  'PREÇO'?: string;
  
  // Pagamento e Assinatura
  'PAGAMENTO'?: string;
  'STATUS PAGAMENTO'?: string;
  'ASSINATURA'?: string;
  'STATUS ASSINATURA'?: string;
  
  // Datas
  'DATA DE ENTRADA'?: string;
  'DATA'?: string;
  'DATAHORA'?: string;
  
  // Qualificação
  'QUALIFICADA (SQL)'?: string;
  'QUALIFICADA'?: string;
  'SQL'?: string;
  
  // Responsáveis
  'CLOSER'?: string;
  'CLOSER FECHOU'?: string;
  'SDR'?: string;
  'SDR FECHOU'?: string;
  
  // Tipo de reunião
  'TIPO DA CALL'?: string;
  'Tipo da Call'?: string;
  'TIPO DA REUNIÃO'?: string;
  
  // Origem
  'CANAL DE AQUISIÇÃO'?: string;
  'ORIGEM'?: string;
  'FONTE'?: string;
  
  // Observações
  'OBSERVAÇÕES E PRÓXIMOS PASSOS'?: string;
  
  // Permite campos adicionais
  [key: string]: string | undefined;
}

/**
 * Converte uma venda do Supabase para o formato de linha da planilha
 */
export const vendaToSheetRow = (venda: Venda): SheetRow => {
  // Formatar valor para o formato brasileiro (R$ X.XXX,XX)
  const formatValor = (valor: number): string => {
    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  // Formatar data para DD/MM/YYYY
  const formatData = (dateStr: string | null): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };
  
  return {
    'NOME DA CALL': venda.lead_nome || '',
    'NOME': venda.lead_nome || '',
    'FECHAMENTO': 'SIM', // Todas as vendas no banco são fechadas
    'VALOR': formatValor(Number(venda.valor)),
    'DATA DE ENTRADA': formatData(venda.data_fechamento),
    'DATA': formatData(venda.data_fechamento),
    'CLOSER': venda.colaborador_nome || '',
    'CLOSER FECHOU': venda.colaborador_nome || '',
    'ORIGEM': venda.origem || 'inbound',
    'CANAL DE AQUISIÇÃO': venda.origem || 'inbound',
    // Status de pagamento e assinatura (TODO: adicionar esses campos ao banco)
    'ASSINATURA': 'PENDENTE',
    'PAGAMENTO': 'PENDENTE',
  };
};

/**
 * Converte um agendamento do Supabase para o formato de linha da planilha
 */
export const agendamentoToSheetRow = (agendamento: Agendamento): SheetRow => {
  const formatData = (dateStr: string | null): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };
  
  // Mapear status do agendamento para o formato da planilha
  const getCloserValue = (): string => {
    if (agendamento.status === 'no_show') return 'NO-SHOW';
    return agendamento.closer_nome || '';
  };
  
  return {
    'NOME DA CALL': agendamento.lead_nome || '',
    'NOME': agendamento.lead_nome || '',
    'DATA DE ENTRADA': formatData(agendamento.data_agendamento),
    'DATA': formatData(agendamento.data_agendamento),
    'SDR': agendamento.sdr_nome || '',
    'CLOSER': getCloserValue(),
    'QUALIFICADA (SQL)': agendamento.qualificado ? 'SIM' : 'NÃO',
    'QUALIFICADA': agendamento.qualificado ? 'SIM' : 'NÃO',
    'ORIGEM': agendamento.origem || 'inbound',
    'CANAL DE AQUISIÇÃO': agendamento.origem || 'inbound',
    // Inferir FECHAMENTO baseado no status
    'FECHAMENTO': agendamento.status === 'realizado' ? 'SIM' : 'NÃO',
  };
};

/**
 * Converte um lead do CRM para o formato de linha da planilha
 */
export const leadCRMToSheetRow = (lead: LeadCRM): SheetRow => {
  const formatData = (dateStr: string | null): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };
  
  const formatValor = (valor: number | null): string => {
    if (!valor) return '';
    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  return {
    'NOME DA CALL': lead.nome || '',
    'NOME': lead.nome || '',
    'DATA DE ENTRADA': formatData(lead.data_entrada),
    'DATA': formatData(lead.data_entrada),
    'SDR': lead.sdr_nome || '',
    'CLOSER': lead.closer_nome || '',
    'QUALIFICADA (SQL)': lead.is_mql ? 'SIM' : 'NÃO',
    'FECHAMENTO': lead.status === 'GANHO' ? 'SIM' : 'NÃO',
    'VALOR': formatValor(lead.valor_contrato),
    'STATUS': lead.status || '',
  };
};

/**
 * Combina vendas e agendamentos em um array unificado no formato de planilha
 * para uso nos calculadores de métricas existentes
 */
export const adaptDataForCalculator = (
  vendas: Venda[],
  agendamentos: Agendamento[]
): SheetRow[] => {
  const rows: SheetRow[] = [];
  
  // Criar um mapa de vendas por lead_nome para evitar duplicatas
  const vendasMap = new Map<string, SheetRow>();
  
  // Primeiro, processar vendas (são as mais importantes)
  for (const venda of vendas) {
    const row = vendaToSheetRow(venda);
    const key = `${venda.lead_nome}-${venda.data_fechamento}-${venda.valor}`;
    vendasMap.set(key, row);
    rows.push(row);
  }
  
  // Depois, processar agendamentos (adicionar informações que não são vendas)
  for (const agendamento of agendamentos) {
    const row = agendamentoToSheetRow(agendamento);
    
    // Verificar se já existe uma venda correspondente
    const existingVendaKey = Array.from(vendasMap.keys()).find(key => 
      key.includes(agendamento.lead_nome || '')
    );
    
    if (!existingVendaKey) {
      // Não há venda correspondente, adicionar o agendamento
      rows.push(row);
    } else {
      // Atualizar a venda existente com dados do agendamento (SDR, qualificação, etc.)
      const existingRow = vendasMap.get(existingVendaKey);
      if (existingRow) {
        existingRow['SDR'] = agendamento.sdr_nome || existingRow['SDR'];
        existingRow['SDR FECHOU'] = agendamento.sdr_nome || existingRow['SDR FECHOU'];
        existingRow['QUALIFICADA (SQL)'] = agendamento.qualificado ? 'SIM' : existingRow['QUALIFICADA (SQL)'];
      }
    }
  }
  
  return rows;
};

/**
 * Adapta leads do CRM para o formato de calculador
 */
export const adaptLeadsForCalculator = (leads: LeadCRM[]): SheetRow[] => {
  return leads.map(lead => leadCRMToSheetRow(lead));
};
