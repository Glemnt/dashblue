import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PeriodType, DateRange, getCurrentMonthRange } from '@/utils/dateFilters';
import { getCurrentAvailableMonth } from '@/utils/monthConfig';

interface PeriodFilterContextType {
  periodType: PeriodType;
  dateRange: DateRange;
  selectedMonthKey: string;
  setPeriodType: (type: PeriodType) => void;
  setDateRange: (range: DateRange) => void;
  setSelectedMonthKey: (key: string) => void;
  updateFilter: (type: PeriodType, range: DateRange) => void;
}

const PeriodFilterContext = createContext<PeriodFilterContextType | undefined>(undefined);

export const PeriodFilterProvider = ({ children }: { children: ReactNode }) => {
  // Tentar carregar estado salvo do localStorage
  const loadSavedState = () => {
    try {
      const saved = localStorage.getItem('periodFilter');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          periodType: parsed.periodType || 'mes',
          dateRange: {
            start: new Date(parsed.dateRange.start),
            end: new Date(parsed.dateRange.end)
          },
          selectedMonthKey: parsed.selectedMonthKey || getCurrentAvailableMonth().key
        };
      }
    } catch (e) {
      console.warn('Erro ao carregar filtro salvo:', e);
    }
    return null;
  };

  const savedState = loadSavedState();

  const [periodType, setPeriodType] = useState<PeriodType>(
    savedState?.periodType || 'mes'
  );
  const [dateRange, setDateRange] = useState<DateRange>(
    savedState?.dateRange || getCurrentMonthRange()
  );
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    savedState?.selectedMonthKey || getCurrentAvailableMonth().key
  );

  // Salvar no localStorage sempre que mudar
  useEffect(() => {
    const state = {
      periodType,
      dateRange: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      },
      selectedMonthKey
    };
    localStorage.setItem('periodFilter', JSON.stringify(state));
  }, [periodType, dateRange, selectedMonthKey]);

  const updateFilter = (type: PeriodType, range: DateRange) => {
    setPeriodType(type);
    setDateRange(range);
  };

  return (
    <PeriodFilterContext.Provider
      value={{
        periodType,
        dateRange,
        selectedMonthKey,
        setPeriodType,
        setDateRange,
        setSelectedMonthKey,
        updateFilter
      }}
    >
      {children}
    </PeriodFilterContext.Provider>
  );
};

export const usePeriodFilter = () => {
  const context = useContext(PeriodFilterContext);
  if (!context) {
    throw new Error('usePeriodFilter deve ser usado dentro de PeriodFilterProvider');
  }
  return context;
};
