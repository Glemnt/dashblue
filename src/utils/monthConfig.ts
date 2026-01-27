/**
 * Configuração de meses disponíveis no sistema
 * Substitui as configurações que estavam no sheetUrlManager
 */

export interface MonthConfig {
  key: string;
  label: string;
  month: number;
  year: number;
}

// Meses disponíveis no sistema (dados históricos migrados + meses futuros)
export const AVAILABLE_MONTHS: Record<string, MonthConfig> = {
  'outubro-2025': { key: 'outubro-2025', label: 'Outubro 2025', month: 9, year: 2025 },
  'novembro-2025': { key: 'novembro-2025', label: 'Novembro 2025', month: 10, year: 2025 },
  'dezembro-2025': { key: 'dezembro-2025', label: 'Dezembro 2025', month: 11, year: 2025 },
  'janeiro-2026': { key: 'janeiro-2026', label: 'Janeiro 2026', month: 0, year: 2026 },
  'fevereiro-2026': { key: 'fevereiro-2026', label: 'Fevereiro 2026', month: 1, year: 2026 },
  'marco-2026': { key: 'marco-2026', label: 'Março 2026', month: 2, year: 2026 },
};

const MESES = [
  'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

/**
 * Gera a chave do mês atual
 */
export const getCurrentMonthKey = (): string => {
  const now = new Date();
  const mes = MESES[now.getMonth()];
  const ano = now.getFullYear();
  return `${mes}-${ano}`;
};

/**
 * Retorna a chave do mês atual se disponível, ou o mais recente disponível
 */
export const getCurrentAvailableMonth = (): string => {
  const currentKey = getCurrentMonthKey();
  
  // Se o mês atual está disponível, retorna ele
  if (AVAILABLE_MONTHS[currentKey]) {
    return currentKey;
  }
  
  // Senão, retorna o mês mais recente disponível
  const sortedMonths = Object.values(AVAILABLE_MONTHS)
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  
  return sortedMonths[0]?.key || 'janeiro-2026';
};

/**
 * Gera lista de opções de meses para selects
 */
export const getMonthOptions = (): { key: string; label: string }[] => {
  return Object.values(AVAILABLE_MONTHS)
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    })
    .map(m => ({ key: m.key, label: m.label }));
};

/**
 * Converte monthKey para Date range
 */
export const getDateRangeFromMonthKey = (monthKey: string): { start: Date; end: Date } | null => {
  const config = AVAILABLE_MONTHS[monthKey];
  if (!config) {
    // Tentar parsear dinamicamente
    const [mes, ano] = monthKey.split('-');
    const monthIndex = MESES.indexOf(mes.toLowerCase());
    if (monthIndex === -1) return null;
    
    const year = parseInt(ano);
    const start = new Date(year, monthIndex, 1);
    const end = new Date(year, monthIndex + 1, 0);
    return { start, end };
  }
  
  const start = new Date(config.year, config.month, 1);
  const end = new Date(config.year, config.month + 1, 0);
  return { start, end };
};
