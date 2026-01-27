import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AVAILABLE_MONTHS } from '@/utils/monthConfig';

interface MonthSelectorProps {
  selectedMonthKey: string;
  onMonthChange: (monthKey: string) => void;
}

export const MonthSelector = ({ selectedMonthKey, onMonthChange }: MonthSelectorProps) => {
  return (
    <Select value={selectedMonthKey} onValueChange={onMonthChange}>
      <SelectTrigger className="w-[200px] bg-[#151E35] border-white/20 text-white hover:bg-white/5">
        <SelectValue placeholder="Selecione o mês" />
      </SelectTrigger>
      <SelectContent className="bg-[#151E35] border-white/20 z-50">
        {AVAILABLE_MONTHS.map(month => (
          <SelectItem 
            key={month.key} 
            value={month.key}
            className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white"
          >
            {month.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
