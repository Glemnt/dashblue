// Gerenciador de URLs das planilhas de leads

export interface LeadSource {
  key: string;
  name: string;
  gid: string;
}

// Fontes de leads organizadas por mês
const LEAD_SOURCES_BY_MONTH: Record<string, LeadSource[]> = {
  'novembro-2025': [
    { key: 'form-qualificacao', name: 'Form Qualificação 11/11', gid: '1680388014' },
    { key: 'form-promax', name: 'Form ProMax 2.0', gid: '1023080672' },
    { key: 'landing-page', name: 'Landing Page', gid: '1432234443' },
    { key: 'vsl', name: 'VSL', gid: '1423689787' },
    { key: 'lp-v2', name: 'LP V2', gid: '1093821118' }
  ],
  'dezembro-2025': [
    // Mesmas planilhas - leads de dezembro serão filtrados pela data
    { key: 'form-qualificacao', name: 'Form Qualificação 11/11', gid: '1680388014' },
    { key: 'form-promax', name: 'Form ProMax 2.0', gid: '1023080672' },
    { key: 'landing-page', name: 'Landing Page', gid: '1432234443' },
    { key: 'vsl', name: 'VSL', gid: '1423689787' },
    { key: 'lp-v2', name: 'LP V2', gid: '1093821118' }
  ],
  'outubro-2025': [
    // Mesmas planilhas - leads de outubro serão filtrados pela data
    { key: 'form-qualificacao', name: 'Form Qualificação 11/11', gid: '1680388014' },
    { key: 'form-promax', name: 'Form ProMax 2.0', gid: '1023080672' },
    { key: 'landing-page', name: 'Landing Page', gid: '1432234443' },
    { key: 'vsl', name: 'VSL', gid: '1423689787' },
    { key: 'lp-v2', name: 'LP V2', gid: '1093821118' }
  ]
};

const BASE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTiBWb4KkxNxK-WwtnetmSBqedeaGkJ1zyjJf1xd07v_v9LevCbDMX2rSttHCbcWz2dU3ce3JO7lDWv/pub";

// Mapeamento de monthKey para número do mês (0-indexed)
const MONTH_KEY_TO_NUMBER: Record<string, number> = {
  'outubro-2025': 9,
  'novembro-2025': 10,
  'dezembro-2025': 11
};

export const getLeadSourcesForMonth = (monthKey?: string): LeadSource[] => {
  if (!monthKey) {
    // Retorna todas as fontes disponíveis (padrão: dezembro)
    return LEAD_SOURCES_BY_MONTH['dezembro-2025'] || [];
  }
  
  return LEAD_SOURCES_BY_MONTH[monthKey] || LEAD_SOURCES_BY_MONTH['dezembro-2025'] || [];
};

export const getLeadSourceUrls = (monthKey?: string): { source: LeadSource; url: string }[] => {
  const sources = getLeadSourcesForMonth(monthKey);
  
  return sources.map(source => ({
    source,
    url: `${BASE_URL}?gid=${source.gid}&single=true&output=csv`
  }));
};

export const getTargetMonthNumber = (monthKey?: string): number => {
  if (!monthKey) {
    // Padrão: mês atual
    return new Date().getMonth();
  }
  
  return MONTH_KEY_TO_NUMBER[monthKey] ?? new Date().getMonth();
};

// Parse de data em múltiplos formatos
export const parseLeadDate = (dateStr: string): Date | null => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  const trimmed = dateStr.trim();
  
  // Formato brasileiro dd/mm/yyyy ou dd/mm/yyyy HH:mm:ss
  const brMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (brMatch) {
    const day = parseInt(brMatch[1], 10);
    const month = parseInt(brMatch[2], 10) - 1; // 0-indexed
    const year = parseInt(brMatch[3], 10);
    return new Date(year, month, day);
  }
  
  // ISO format yyyy-mm-dd ou yyyy-mm-ddTHH:mm:ss
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    return new Date(year, month, day);
  }
  
  // Tentar parse genérico
  const genericDate = new Date(trimmed);
  if (!isNaN(genericDate.getTime())) {
    return genericDate;
  }
  
  return null;
};
