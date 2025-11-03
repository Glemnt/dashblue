import { DateRange } from './dateFilters';

// Mapeamento de período → GID da planilha
const SHEET_GIDS: Record<string, string> = {
  'outubro-2024': '2010777326',
  'novembro-2024': '548333510'
};

const BASE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSMYk5K5k39Apo7zd4z5xhi3aS9C_YE5FGgGJfhcLaCSlfh4YZp1AlAyjPw8PQho9fDlUYHSgofKyuj/pub";

export const getSheetUrlForPeriod = (dateRange: DateRange): string => {
  const startMonth = dateRange.start.getMonth(); // 0-11
  const startYear = dateRange.start.getFullYear();
  
  let periodKey: string;
  
  if (startMonth === 9 && startYear === 2024) { // outubro
    periodKey = 'outubro-2024';
  } else if (startMonth === 10 && startYear === 2024) { // novembro
    periodKey = 'novembro-2024';
  } else {
    // Padrão: mês atual
    const now = new Date();
    if (now.getMonth() === 10 && now.getFullYear() === 2024) {
      periodKey = 'novembro-2024';
    } else {
      periodKey = 'novembro-2024'; // Fallback
    }
  }
  
  const gid = SHEET_GIDS[periodKey] || SHEET_GIDS['novembro-2024'];
  return `${BASE_URL}?gid=${gid}&single=true&output=csv`;
};

export const getCurrentMonthSheetUrl = (): string => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  
  let periodKey: string;
  if (month === 9 && year === 2024) {
    periodKey = 'outubro-2024';
  } else {
    periodKey = 'novembro-2024'; // Padrão
  }
  
  const gid = SHEET_GIDS[periodKey];
  return `${BASE_URL}?gid=${gid}&single=true&output=csv`;
};
