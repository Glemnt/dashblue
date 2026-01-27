/**
 * Script para migrar dados legados das planilhas Google Sheets para o Supabase
 * 
 * Migra:
 * - Vendas (Out/2025 a Jan/2026)
 * - Agendamentos (Out/2025 a Jan/2026)
 * 
 * Uso: Importe e execute as funções deste arquivo no console do navegador
 * ou crie uma página de administração para executar a migração.
 */

import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';

const BASE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTiBWb4KkxNxK-WwtnetmSBqedeaGkJ1zyjJf1xd07v_v9LevCbDMX2rSttHCbcWz2dU3ce3JO7lDWv/pub";

interface MonthConfig {
  gid: string;
  month: number;
  year: number;
  label: string;
}

const MONTHS_TO_MIGRATE: Record<string, MonthConfig> = {
  'outubro-2025': { gid: '1439614322', month: 9, year: 2025, label: 'Outubro 2025' },
  'novembro-2025': { gid: '930588352', month: 10, year: 2025, label: 'Novembro 2025' },
  'dezembro-2025': { gid: '581766650', month: 11, year: 2025, label: 'Dezembro 2025' },
  'janeiro-2026': { gid: '749539490', month: 0, year: 2026, label: 'Janeiro 2026' }
};

interface Colaborador {
  id: string;
  nome: string;
  tipo: string;
}

interface VendaImport {
  colaborador_id: string | null;
  colaborador_nome: string;
  valor: number;
  origem: string;
  lead_nome: string | null;
  data_fechamento: string;
  observacao: string | null;
}

interface AgendamentoImport {
  sdr_id: string | null;
  sdr_nome: string;
  closer_id: string | null;
  closer_nome: string | null;
  lead_nome: string | null;
  data_agendamento: string;
  status: 'agendado' | 'realizado' | 'no_show' | 'cancelado';
  qualificado: boolean;
  origem: string | null;
  observacao: string | null;
}

// ============ FUNÇÕES AUXILIARES ============

const normalizeNome = (name: string): string => {
  return name.trim().toUpperCase()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const mapCloserToColaborador = (closerName: string, colaboradores: Colaborador[]): Colaborador | null => {
  const normalized = normalizeNome(closerName);
  
  const closerMappings: Record<string, string[]> = {
    'Bruno': ['BRUNO'],
    'Cauã': ['CAUA', 'CAUÃ'],
    'Fernandes': ['G. FERNANDES', 'GABRIEL FERNANDES', 'FERNANDES'],
    'Franklin': ['G. FRANKLIN', 'GABRIEL FRANKLIN', 'FRANKLIN'],
    'Marcos': ['MARCOS', 'OUTRO'],
    'Davi': ['DAVI']
  };

  for (const [dbName, aliases] of Object.entries(closerMappings)) {
    if (aliases.some(alias => normalized.includes(alias))) {
      return colaboradores.find(c => c.nome === dbName) || null;
    }
  }

  return colaboradores.find(c => normalizeNome(c.nome) === normalized) || null;
};

const mapSDRToColaborador = (sdrName: string, colaboradores: Colaborador[]): Colaborador | null => {
  const normalized = normalizeNome(sdrName);
  
  const sdrMappings: Record<string, string[]> = {
    'Davi': ['DAVI'],
    'Vinicius': ['VINICIUS', 'VINÍCIUS'],
    'Tiago': ['TIAGO'],
    'Andrey': ['ANDREY'],
    'João Lopes': ['JOAO LOPES', 'JOÃO LOPES', 'JOAO', 'JOÃO'],
    'Cauã': ['CAUA', 'CAUÃ'],
  };

  for (const [dbName, aliases] of Object.entries(sdrMappings)) {
    if (aliases.some(alias => normalized.includes(alias))) {
      return colaboradores.find(c => c.nome === dbName && c.tipo === 'sdr') || null;
    }
  }

  return colaboradores.find(c => normalizeNome(c.nome) === normalized && c.tipo === 'sdr') || null;
};

const parseDate = (dateStr: string, month: number, year: number): string => {
  if (!dateStr) {
    return new Date(year, month, 15).toISOString().split('T')[0];
  }

  // Try DD/MM/YYYY format
  const brMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (brMatch) {
    const [, day, mon, yr] = brMatch;
    return `${yr}-${mon.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Try DD/MM format
  const shortMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})/);
  if (shortMatch) {
    const [, day, mon] = shortMatch;
    return `${year}-${mon.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return new Date(year, month, 15).toISOString().split('T')[0];
};

const parseValor = (valorStr: string): number => {
  if (!valorStr) return 0;
  
  const cleaned = valorStr
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  
  return parseFloat(cleaned) || 0;
};

const determineOrigem = (row: any): string => {
  const canal = (row['CANAL DE AQUISIÇÃO'] || row['ORIGEM'] || row['FONTE'] || '').toLowerCase();
  if (canal.includes('indicacao') || canal.includes('indicação')) return 'indicacao';
  if (canal.includes('outbound')) return 'outbound';
  return 'inbound';
};

const fetchSheetData = async (gid: string): Promise<any[]> => {
  const url = `${BASE_URL}?gid=${gid}&single=true&output=csv`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet: ${response.status}`);
  }
  
  const csvText = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error: Error) => reject(error)
    });
  });
};

// ============ PARSE VENDAS ============

const parseVendasFromSheet = (
  data: any[], 
  monthConfig: MonthConfig, 
  colaboradores: Colaborador[]
): VendaImport[] => {
  const vendas: VendaImport[] = [];

  for (const row of data) {
    // Pular linhas de header, totais, etc.
    const nomeCall = (row['NOME DA CALL'] || row['NOME'] || '').trim();
    if (!nomeCall || nomeCall.toUpperCase().includes('TOP') || nomeCall.toUpperCase().includes('TOTAL')) {
      continue;
    }

    const fechamento = (row['FECHAMENTO'] || '').toUpperCase().trim();
    if (fechamento !== 'SIM') continue;

    const closerName = row['CLOSER FECHOU'] || row['CLOSER'] || '';
    if (!closerName || closerName.toUpperCase() === 'NO-SHOW') continue;

    const colaborador = mapCloserToColaborador(closerName, colaboradores);
    const valor = parseValor(row['VALOR'] || '');
    
    if (valor <= 0) continue;

    const dataFechamento = parseDate(
      row['DATA DE ENTRADA'] || row['DATA'] || '', 
      monthConfig.month, 
      monthConfig.year
    );
    
    vendas.push({
      colaborador_id: colaborador?.id || null,
      colaborador_nome: colaborador?.nome || closerName.trim(),
      valor,
      origem: determineOrigem(row),
      lead_nome: nomeCall || null,
      data_fechamento: dataFechamento,
      observacao: null
    });
  }

  return vendas;
};

// ============ PARSE AGENDAMENTOS ============

const parseAgendamentosFromSheet = (
  data: any[], 
  monthConfig: MonthConfig, 
  colaboradores: Colaborador[]
): AgendamentoImport[] => {
  const agendamentos: AgendamentoImport[] = [];

  for (const row of data) {
    // Pular linhas de header, totais, etc.
    const nomeCall = (row['NOME DA CALL'] || row['NOME'] || '').trim();
    if (!nomeCall || nomeCall.toUpperCase().includes('TOP') || nomeCall.toUpperCase().includes('TOTAL')) {
      continue;
    }

    const sdrName = row['SDR'] || '';
    if (!sdrName) continue;

    const closerName = row['CLOSER'] || '';
    
    const sdr = mapSDRToColaborador(sdrName, colaboradores);
    const closer = closerName && closerName.toUpperCase() !== 'NO-SHOW' 
      ? mapCloserToColaborador(closerName, colaboradores) 
      : null;

    const dataAgendamento = parseDate(
      row['DATA DE ENTRADA'] || row['DATA'] || '', 
      monthConfig.month, 
      monthConfig.year
    );

    // Determinar status baseado nos dados
    let status: 'agendado' | 'realizado' | 'no_show' | 'cancelado' = 'agendado';
    const closerUpper = closerName.toUpperCase().trim();
    const fechamento = (row['FECHAMENTO'] || '').toUpperCase().trim();
    
    if (closerUpper === 'NO-SHOW') {
      status = 'no_show';
    } else if (closerUpper && closerUpper !== '') {
      status = 'realizado';
    }

    // Verificar qualificação
    const qualificadoStr = (row['QUALIFICADA (SQL)'] || row['QUALIFICADA'] || row['SQL'] || '').toUpperCase().trim();
    const qualificado = qualificadoStr === 'SIM';

    agendamentos.push({
      sdr_id: sdr?.id || null,
      sdr_nome: sdr?.nome || sdrName.trim(),
      closer_id: closer?.id || null,
      closer_nome: closer?.nome || (closerUpper !== 'NO-SHOW' ? closerName.trim() : null),
      lead_nome: nomeCall || null,
      data_agendamento: dataAgendamento,
      status,
      qualificado,
      origem: determineOrigem(row),
      observacao: row['OBSERVAÇÕES E PRÓXIMOS PASSOS'] || null
    });
  }

  return agendamentos;
};

// ============ FUNÇÕES DE MIGRAÇÃO ============

export interface MigrationProgress {
  month: string;
  vendas: number;
  agendamentos: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  error?: string;
}

export interface MigrationResult {
  success: boolean;
  totalVendas: number;
  totalAgendamentos: number;
  byMonth: MigrationProgress[];
  errors: string[];
}

/**
 * Migra todos os dados de um mês específico
 */
export const migrateMonth = async (
  monthKey: string,
  onProgress?: (message: string) => void
): Promise<{ vendas: number; agendamentos: number }> => {
  const monthConfig = MONTHS_TO_MIGRATE[monthKey];
  if (!monthConfig) {
    throw new Error(`Mês não encontrado: ${monthKey}`);
  }

  onProgress?.(`Buscando colaboradores...`);
  
  const { data: colaboradores, error: colabError } = await supabase
    .from('colaboradores')
    .select('id, nome, tipo');

  if (colabError) throw new Error(`Erro ao buscar colaboradores: ${colabError.message}`);

  onProgress?.(`Buscando dados de ${monthConfig.label}...`);
  
  const data = await fetchSheetData(monthConfig.gid);
  
  // Parse vendas
  const vendas = parseVendasFromSheet(data, monthConfig, colaboradores || []);
  
  // Parse agendamentos
  const agendamentos = parseAgendamentosFromSheet(data, monthConfig, colaboradores || []);
  
  let vendasInseridas = 0;
  let agendamentosInseridos = 0;

  // Inserir vendas
  if (vendas.length > 0) {
    onProgress?.(`Inserindo ${vendas.length} vendas de ${monthConfig.label}...`);
    
    // Inserir em lotes de 50 para evitar timeout
    for (let i = 0; i < vendas.length; i += 50) {
      const batch = vendas.slice(i, i + 50);
      const { error } = await supabase.from('vendas').insert(batch);
      
      if (error) {
        console.error(`Erro ao inserir vendas (lote ${i}):`, error);
        // Continuar mesmo com erro
      } else {
        vendasInseridas += batch.length;
      }
    }
  }

  // Inserir agendamentos
  if (agendamentos.length > 0) {
    onProgress?.(`Inserindo ${agendamentos.length} agendamentos de ${monthConfig.label}...`);
    
    for (let i = 0; i < agendamentos.length; i += 50) {
      const batch = agendamentos.slice(i, i + 50);
      const { error } = await supabase.from('agendamentos').insert(batch);
      
      if (error) {
        console.error(`Erro ao inserir agendamentos (lote ${i}):`, error);
      } else {
        agendamentosInseridos += batch.length;
      }
    }
  }

  onProgress?.(`${monthConfig.label}: ${vendasInseridas} vendas, ${agendamentosInseridos} agendamentos`);

  return { vendas: vendasInseridas, agendamentos: agendamentosInseridos };
};

/**
 * Migra todos os dados de todos os meses (Out/2025 a Jan/2026)
 */
export const migrateAllMonths = async (
  onProgress?: (message: string) => void
): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: true,
    totalVendas: 0,
    totalAgendamentos: 0,
    byMonth: [],
    errors: []
  };

  for (const [monthKey, monthConfig] of Object.entries(MONTHS_TO_MIGRATE)) {
    const progress: MigrationProgress = {
      month: monthConfig.label,
      vendas: 0,
      agendamentos: 0,
      status: 'processing'
    };

    try {
      onProgress?.(`\n📅 Processando ${monthConfig.label}...`);
      
      const { vendas, agendamentos } = await migrateMonth(monthKey, onProgress);
      
      progress.vendas = vendas;
      progress.agendamentos = agendamentos;
      progress.status = 'done';
      
      result.totalVendas += vendas;
      result.totalAgendamentos += agendamentos;
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      progress.status = 'error';
      progress.error = errorMsg;
      result.errors.push(`${monthConfig.label}: ${errorMsg}`);
      result.success = false;
    }

    result.byMonth.push(progress);
  }

  onProgress?.(`\n✅ Migração concluída!`);
  onProgress?.(`📊 Total: ${result.totalVendas} vendas, ${result.totalAgendamentos} agendamentos`);

  return result;
};

/**
 * Limpa todos os dados migrados (vendas e agendamentos)
 * USE COM CUIDADO - apaga todos os dados!
 */
export const clearMigratedData = async (): Promise<void> => {
  console.log('⚠️ Limpando dados de vendas e agendamentos...');
  
  const { error: vendasError } = await supabase.from('vendas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (vendasError) console.error('Erro ao limpar vendas:', vendasError);
  
  const { error: agendamentosError } = await supabase.from('agendamentos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (agendamentosError) console.error('Erro ao limpar agendamentos:', agendamentosError);
  
  console.log('✅ Dados limpos');
};

// Exportar para uso global no console do navegador
if (typeof window !== 'undefined') {
  (window as any).migrateAllMonths = migrateAllMonths;
  (window as any).migrateMonth = migrateMonth;
  (window as any).clearMigratedData = clearMigratedData;
}
