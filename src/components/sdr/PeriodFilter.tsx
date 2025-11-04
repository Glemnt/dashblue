import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PeriodType, DateRange, getCurrentWeekRange, getCurrentMonthRange, formatDateRange, getMonthRange } from '@/utils/dateFilters';
import { MonthSelector } from './MonthSelector';
import { AVAILABLE_MONTHS, getCurrentAvailableMonth } from '@/utils/sheetUrlManager';

interface PeriodFilterProps {
  onFilterChange: (type: PeriodType, dateRange: DateRange) => void;
  onMonthChange?: (monthKey: string) => void;
  currentPeriod: PeriodType;
  currentDateRange: DateRange;
  selectedMonthKey?: string;
}

const PeriodFilter = ({ onFilterChange, onMonthChange, currentPeriod, currentDateRange, selectedMonthKey }: PeriodFilterProps) => {
  const [customStart, setCustomStart] = useState<Date | undefined>(undefined);
  const [customEnd, setCustomEnd] = useState<Date | undefined>(undefined);
  const [internalMonthKey, setInternalMonthKey] = useState<string>(
    selectedMonthKey || getCurrentAvailableMonth().key
  );

  const handleMonthSelect = (monthKey: string) => {
    setInternalMonthKey(monthKey);
    const month = AVAILABLE_MONTHS.find(m => m.key === monthKey);
    if (month) {
      const dateRange = getMonthRange(month.month, month.year);
      onFilterChange('mes-especifico', dateRange);
      onMonthChange?.(monthKey);
    }
  };

  const handlePeriodChange = (type: PeriodType) => {
    let dateRange: DateRange;
    
    switch (type) {
      case 'semana':
        dateRange = getCurrentWeekRange();
        break;
      case 'mes':
        dateRange = getCurrentMonthRange();
        break;
      case 'personalizado':
        if (customStart && customEnd) {
          dateRange = { start: customStart, end: customEnd };
        } else {
          return;
        }
        break;
      default:
        dateRange = getCurrentMonthRange();
    }
    
    onFilterChange(type, dateRange);
  };

  const applyCustomRange = () => {
    if (customStart && customEnd) {
      onFilterChange('personalizado', { start: customStart, end: customEnd });
    }
  };

  return (
    <div className="bg-[#151E35] rounded-2xl p-8 border border-white/5">
      <div className="flex items-center justify-between gap-6 flex-wrap">
        
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-[#0066FF]" />
          <p className="text-white font-outfit text-lg font-semibold">Filtrar Período:</p>
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          {/* NOVO: Seletor de mês específico */}
          <div className="flex items-center gap-2">
            <span className="text-white/70 text-sm font-outfit">Mês:</span>
            <MonthSelector 
              selectedMonthKey={selectedMonthKey || internalMonthKey}
              onMonthChange={handleMonthSelect}
            />
          </div>
          
          <div className="h-8 w-px bg-white/20" /> {/* Separador */}
          
          <Button
            onClick={() => handlePeriodChange('semana')}
            variant={currentPeriod === 'semana' ? 'default' : 'outline'}
            className={cn(
              'font-outfit font-medium',
              currentPeriod === 'semana' 
                ? 'bg-[#0066FF] text-white hover:bg-[#0066FF]/90' 
                : 'bg-transparent border-white/20 text-white hover:bg-white/10'
            )}
          >
            Esta Semana
          </Button>

          <Button
            onClick={() => handlePeriodChange('mes')}
            variant={currentPeriod === 'mes' ? 'default' : 'outline'}
            className={cn(
              'font-outfit font-medium',
              currentPeriod === 'mes' 
                ? 'bg-[#0066FF] text-white hover:bg-[#0066FF]/90' 
                : 'bg-transparent border-white/20 text-white hover:bg-white/10'
            )}
          >
            Este Mês
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={currentPeriod === 'personalizado' ? 'default' : 'outline'}
                className={cn(
                  'font-outfit font-medium min-w-[240px] justify-start',
                  currentPeriod === 'personalizado' 
                    ? 'bg-[#0066FF] text-white hover:bg-[#0066FF]/90' 
                    : 'bg-transparent border-white/20 text-white hover:bg-white/10'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customStart && customEnd ? (
                  `${format(customStart, 'dd/MM/yy')} - ${format(customEnd, 'dd/MM/yy')}`
                ) : (
                  'Período Personalizado'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#151E35] border-white/20" align="end">
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-white text-sm font-semibold mb-2">Data Início:</p>
                  <Calendar
                    mode="single"
                    selected={customStart}
                    onSelect={setCustomStart}
                    initialFocus
                    className="pointer-events-auto"
                    classNames={{
                      caption_label: "text-white text-base font-semibold",
                      head_cell: "text-white/70 font-medium",
                      day: "text-white hover:bg-[#0066FF]/20 hover:text-white",
                      day_selected: "bg-[#0066FF] text-white hover:bg-[#0066FF] hover:text-white",
                      day_today: "bg-white/10 text-white font-bold",
                      nav_button: "text-white hover:bg-white/10 border-white/20"
                    }}
                  />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold mb-2">Data Fim:</p>
                  <Calendar
                    mode="single"
                    selected={customEnd}
                    onSelect={setCustomEnd}
                    className="pointer-events-auto"
                    classNames={{
                      caption_label: "text-white text-base font-semibold",
                      head_cell: "text-white/70 font-medium",
                      day: "text-white hover:bg-[#0066FF]/20 hover:text-white",
                      day_selected: "bg-[#0066FF] text-white hover:bg-[#0066FF] hover:text-white",
                      day_today: "bg-white/10 text-white font-bold",
                      nav_button: "text-white hover:bg-white/10 border-white/20"
                    }}
                  />
                </div>
                <Button
                  onClick={applyCustomRange}
                  disabled={!customStart || !customEnd}
                  className="w-full bg-[#0066FF] hover:bg-[#0066FF]/90"
                >
                  Aplicar Filtro
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="text-right">
          <p className="text-[#94A3B8] text-sm font-outfit">Período:</p>
          <p className="text-white text-base font-outfit font-semibold">
            {formatDateRange(currentDateRange)}
          </p>
        </div>

      </div>
    </div>
  );
};

export default PeriodFilter;
