import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type PeriodType = 'semana' | 'mes' | 'mes-especifico' | 'personalizado';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface PeriodFilter {
  type: PeriodType;
  dateRange: DateRange;
}

export const getCurrentWeekRange = (): DateRange => {
  const now = new Date();
  return {
    start: startOfWeek(now, { locale: ptBR }),
    end: endOfWeek(now, { locale: ptBR })
  };
};

export const getCurrentMonthRange = (): DateRange => {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now)
  };
};

export const filterDataByDateRange = (data: any[], dateRange: DateRange): any[] => {
  return data.filter(row => {
    const dataStr = row['DATA'] || row['Data'] || row['data'] || row['Data_Realizacao'];
    
    if (!dataStr) return true;
    
    try {
      let rowDate: Date;
      
      if (dataStr.includes('/')) {
        const [day, month, year] = dataStr.split('/');
        rowDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else if (dataStr.includes('-')) {
        rowDate = parseISO(dataStr);
      } else {
        return true;
      }
      
      return isWithinInterval(rowDate, { start: dateRange.start, end: dateRange.end });
    } catch (error) {
      console.warn('Erro ao parsear data:', dataStr, error);
      return true;
    }
  });
};

export const formatDateRange = (dateRange: DateRange): string => {
  return `${format(dateRange.start, 'dd/MM/yyyy', { locale: ptBR })} - ${format(dateRange.end, 'dd/MM/yyyy', { locale: ptBR })}`;
};

// Retornar range completo de um mês específico
export const getMonthRange = (month: number, year: number): DateRange => {
  const date = new Date(year, month, 1);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date)
  };
};

// Formatar nome do mês/ano em português
export const formatMonthYear = (month: number, year: number): string => {
  const date = new Date(year, month, 1);
  return format(date, 'MMMM yyyy', { locale: ptBR });
};
