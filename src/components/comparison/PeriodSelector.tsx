import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ComparisonPeriod {
  label: string;
  dateRange: { start: Date; end: Date };
  monthKey?: string;
}

interface Props {
  label: string;
  period: ComparisonPeriod;
  onPeriodChange: (period: ComparisonPeriod) => void;
  color: 'blue' | 'gray';
}

export const PeriodSelector = ({ label, period, onPeriodChange, color }: Props) => {
  const handlePresetClick = (preset: string) => {
    let newPeriod: ComparisonPeriod;
    const now = new Date();
    
    switch (preset) {
      case 'current-month':
        newPeriod = {
          label: format(now, 'MMMM yyyy', { locale: ptBR }),
          dateRange: {
            start: startOfMonth(now),
            end: endOfMonth(now)
          },
          monthKey: format(now, 'MMMM-yyyy', { locale: ptBR }).toLowerCase()
        };
        break;
      case 'previous-month':
        const prevMonth = subMonths(now, 1);
        newPeriod = {
          label: format(prevMonth, 'MMMM yyyy', { locale: ptBR }),
          dateRange: {
            start: startOfMonth(prevMonth),
            end: endOfMonth(prevMonth)
          },
          monthKey: format(prevMonth, 'MMMM-yyyy', { locale: ptBR }).toLowerCase()
        };
        break;
      case 'current-week':
        newPeriod = {
          label: 'Esta Semana',
          dateRange: {
            start: startOfWeek(now, { locale: ptBR }),
            end: endOfWeek(now, { locale: ptBR })
          }
        };
        break;
      case 'previous-week':
        const prevWeek = subWeeks(now, 1);
        newPeriod = {
          label: 'Semana Anterior',
          dateRange: {
            start: startOfWeek(prevWeek, { locale: ptBR }),
            end: endOfWeek(prevWeek, { locale: ptBR })
          }
        };
        break;
      default:
        return;
    }
    
    onPeriodChange(newPeriod);
  };
  
  const quickPresets = [
    { label: 'Este Mês', value: 'current-month' },
    { label: 'Mês Anterior', value: 'previous-month' },
    { label: 'Esta Semana', value: 'current-week' },
    { label: 'Semana Anterior', value: 'previous-week' },
  ];
  
  return (
    <div className={`border-2 rounded-lg p-4 ${color === 'blue' ? 'border-primary' : 'border-border'} bg-card`}>
      <h4 className="font-semibold mb-3 text-foreground">{label}</h4>
      
      <div className="grid grid-cols-2 gap-2 mb-3">
        {quickPresets.map(preset => (
          <Button
            key={preset.value}
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick(preset.value)}
            className="border-border"
          >
            {preset.label}
          </Button>
        ))}
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start border-border">
            <CalendarIcon className="mr-2 w-4 h-4" />
            {format(period.dateRange.start, 'dd/MM/yyyy')} - {format(period.dateRange.end, 'dd/MM/yyyy')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-card border-border">
          <Calendar
            mode="range"
            selected={{
              from: period.dateRange.start,
              to: period.dateRange.end
            }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onPeriodChange({
                  ...period,
                  dateRange: { start: range.from, end: range.to },
                  label: `${format(range.from, 'dd/MM')} - ${format(range.to, 'dd/MM')}`
                });
              }
            }}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
      
      <div className="mt-2 text-sm text-muted-foreground text-center">
        {period.label}
      </div>
    </div>
  );
};
