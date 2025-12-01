import { DateRange } from './dateFilters';

// Interface para meses disponíveis
export interface AvailableMonth {
  key: string;          // 'outubro-2024'
  label: string;        // 'Outubro 2024'
  gid: string;          // '2010777326'
  month: number;        // 9 (outubro = mês 9, 0-indexed)
  year: number;         // 2024
}

// Lista de meses disponíveis (fácil adicionar novos meses aqui)
export const AVAILABLE_MONTHS: AvailableMonth[] = [
  {
    key: 'outubro-2025',
    label: 'Outubro 2025',
    gid: '1439614322',
    month: 9,
    year: 2025
  },
  {
    key: 'novembro-2025',
    label: 'Novembro 2025',
    gid: '930588352',
    month: 10,
    year: 2025
  },
  {
    key: 'dezembro-2025',
    label: 'Dezembro 2025',
    gid: '581766650',
    month: 11,
    year: 2025
  }
];

// Mapeamento legado (mantido para compatibilidade)
const SHEET_GIDS: Record<string, string> = {
  'outubro-2025': '1439614322',
  'novembro-2025': '930588352',
  'dezembro-2025': '581766650'
};

const BASE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTiBWb4KkxNxK-WwtnetmSBqedeaGkJ1zyjJf1xd07v_v9LevCbDMX2rSttHCbcWz2dU3ce3JO7lDWv/pub";

export const getSheetUrlForPeriod = (dateRange: DateRange): string => {
  const startMonth = dateRange.start.getMonth(); // 0-11
  const startYear = dateRange.start.getFullYear();
  
  let periodKey: string;
  
  if (startMonth === 9 && startYear === 2025) { // outubro
    periodKey = 'outubro-2025';
  } else if (startMonth === 10 && startYear === 2025) { // novembro
    periodKey = 'novembro-2025';
  } else if (startMonth === 11 && startYear === 2025) { // dezembro
    periodKey = 'dezembro-2025';
  } else {
    // Padrão: mês atual
    const now = new Date();
    if (now.getMonth() === 11 && now.getFullYear() === 2025) {
      periodKey = 'dezembro-2025';
    } else {
      periodKey = 'dezembro-2025'; // Fallback para dezembro
    }
  }
  
  const gid = SHEET_GIDS[periodKey] || SHEET_GIDS['novembro-2025'];
  return `${BASE_URL}?gid=${gid}&single=true&output=csv`;
};

// Função para obter o mês atual automaticamente
export const getCurrentAvailableMonth = (): AvailableMonth => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const found = AVAILABLE_MONTHS.find(m => m.month === currentMonth && m.year === currentYear);
  
  // Se não encontrar o mês atual, retorna o último disponível
  return found || AVAILABLE_MONTHS[AVAILABLE_MONTHS.length - 1];
};

// Função para obter URL por chave de mês
export const getSheetUrlByMonthKey = (monthKey: string): string => {
  const month = AVAILABLE_MONTHS.find(m => m.key === monthKey);
  const gid = month?.gid || AVAILABLE_MONTHS[AVAILABLE_MONTHS.length - 1].gid;
  return `${BASE_URL}?gid=${gid}&single=true&output=csv`;
};

export const getCurrentMonthSheetUrl = (): string => {
  const currentMonth = getCurrentAvailableMonth();
  return `${BASE_URL}?gid=${currentMonth.gid}&single=true&output=csv`;
};
