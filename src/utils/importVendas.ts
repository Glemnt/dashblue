import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';

const BASE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTiBWb4KkxNxK-WwtnetmSBqedeaGkJ1zyjJf1xd07v_v9LevCbDMX2rSttHCbcWz2dU3ce3JO7lDWv/pub";

const MONTH_GIDS: Record<string, { gid: string; month: number; year: number }> = {
  'outubro-2025': { gid: '1439614322', month: 9, year: 2025 },
  'novembro-2025': { gid: '930588352', month: 10, year: 2025 },
  'dezembro-2025': { gid: '581766650', month: 11, year: 2025 }
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

const normalizeCloserName = (name: string): string => {
  return name.trim().toUpperCase()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const mapCloserToColaborador = (closerName: string, colaboradores: Colaborador[]): Colaborador | null => {
  const normalized = normalizeCloserName(closerName);
  
  const closerMappings: Record<string, string[]> = {
    'Bruno': ['BRUNO'],
    'Cauã': ['CAUA', 'CAUÃ'],
    'Fernandes': ['GABRIEL FERNANDES', 'FERNANDES'],
    'Franklin': ['GABRIEL FRANKLIN', 'FRANKLIN'],
    'Marcos': ['MARCOS']
  };

  for (const [dbName, aliases] of Object.entries(closerMappings)) {
    if (aliases.some(alias => normalized.includes(alias))) {
      return colaboradores.find(c => c.nome === dbName) || null;
    }
  }

  return colaboradores.find(c => normalizeCloserName(c.nome) === normalized) || null;
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

  // Try DD/MM format (assume current year/month context)
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
  const origem = (row['ORIGEM'] || row['FONTE'] || '').toLowerCase();
  if (origem.includes('indicacao') || origem.includes('indicação')) return 'indicacao';
  if (origem.includes('outbound')) return 'outbound';
  return 'inbound';
};

export const fetchSheetData = async (gid: string): Promise<any[]> => {
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
      error: (error) => reject(error)
    });
  });
};

export const parseVendasFromSheet = (
  data: any[], 
  monthKey: string, 
  colaboradores: Colaborador[]
): VendaImport[] => {
  const monthInfo = MONTH_GIDS[monthKey];
  if (!monthInfo) return [];

  const vendas: VendaImport[] = [];

  for (const row of data) {
    const fechamento = (row['FECHAMENTO'] || '').toUpperCase().trim();
    if (fechamento !== 'SIM') continue;

    const closerName = row['CLOSER FECHOU'] || row['CLOSER'] || '';
    if (!closerName) continue;

    const colaborador = mapCloserToColaborador(closerName, colaboradores);
    const valor = parseValor(row['VALOR'] || '');
    
    if (valor <= 0) continue;

    vendas.push({
      colaborador_id: colaborador?.id || null,
      colaborador_nome: colaborador?.nome || closerName.trim(),
      valor,
      origem: determineOrigem(row),
      lead_nome: row['NOME DA CALL'] || row['LEAD'] || null,
      data_fechamento: parseDate(row['DATA'] || row['DATA DE ENTRADA'] || '', monthInfo.month, monthInfo.year),
      observacao: null
    });
  }

  return vendas;
};

export const importVendasFromAllMonths = async (
  onProgress?: (message: string) => void
): Promise<{ total: number; byMonth: Record<string, number> }> => {
  onProgress?.('Buscando colaboradores...');
  
  const { data: colaboradores, error: colabError } = await (supabase as any)
    .from('colaboradores')
    .select('id, nome, tipo')
    .eq('tipo', 'closer');

  if (colabError) throw new Error(`Erro ao buscar colaboradores: ${colabError.message}`);

  const results: Record<string, number> = {};
  let total = 0;

  for (const [monthKey, monthInfo] of Object.entries(MONTH_GIDS)) {
    onProgress?.(`Buscando dados de ${monthKey}...`);
    
    try {
      const data = await fetchSheetData(monthInfo.gid);
      const vendas = parseVendasFromSheet(data, monthKey, colaboradores || []);
      
      if (vendas.length > 0) {
        onProgress?.(`Inserindo ${vendas.length} vendas de ${monthKey}...`);
        
        const { error } = await (supabase as any)
          .from('vendas')
          .insert(vendas);

        if (error) throw new Error(`Erro ao inserir vendas de ${monthKey}: ${error.message}`);
        
        results[monthKey] = vendas.length;
        total += vendas.length;
      } else {
        results[monthKey] = 0;
      }
    } catch (err) {
      console.error(`Erro no mês ${monthKey}:`, err);
      results[monthKey] = 0;
    }
  }

  return { total, byMonth: results };
};

export const clearAllVendas = async (): Promise<void> => {
  const { error } = await (supabase as any)
    .from('vendas')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (error) throw new Error(`Erro ao limpar vendas: ${error.message}`);
};
