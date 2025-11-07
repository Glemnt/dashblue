import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, RefreshCw } from 'lucide-react';
import { DateRange } from '@/utils/dateFilters';
import { useTemporalComparison } from '@/hooks/useTemporalComparison';
import { MetricComparisonCard } from './MetricComparisonCard';
import { TrendChart } from './TrendChart';
import { AutomaticInsights } from './AutomaticInsights';
import { PeriodSelector } from './PeriodSelector';
import { SDRComparisonSection } from './SDRComparisonSection';
import { CloserComparisonSection } from './CloserComparisonSection';
import { SquadsComparisonSection } from './SquadsComparisonSection';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageType: 'dashboard' | 'sdr' | 'closer' | 'squads' | 'financeiro';
  defaultCurrentPeriod?: DateRange;
}

export const TemporalComparisonModal = ({ 
  open, 
  onOpenChange, 
  pageType,
  defaultCurrentPeriod 
}: Props) => {
  const now = new Date();
  const prevMonth = subMonths(now, 1);
  
  const [currentPeriod, setCurrentPeriod] = useState<{
    label: string;
    dateRange: DateRange;
    monthKey?: string;
  }>({
    label: 'Novembro 2025',
    dateRange: defaultCurrentPeriod || {
      start: startOfMonth(now),
      end: endOfMonth(now)
    },
    monthKey: 'novembro-2025'
  });
  
  const [previousPeriod, setPreviousPeriod] = useState<{
    label: string;
    dateRange: DateRange;
    monthKey?: string;
  }>({
    label: 'Outubro 2025',
    dateRange: {
      start: startOfMonth(prevMonth),
      end: endOfMonth(prevMonth)
    },
    monthKey: 'outubro-2025'
  });
  
  const { loading, comparisonData, refetch } = useTemporalComparison(
    currentPeriod,
    previousPeriod
  );
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[90vh] overflow-auto bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-foreground">
            <ArrowLeftRight className="w-6 h-6" />
            Comparação Temporal
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <PeriodSelector
            label="Período Atual"
            period={currentPeriod}
            onPeriodChange={setCurrentPeriod}
            color="blue"
          />
          <PeriodSelector
            label="Período de Comparação"
            period={previousPeriod}
            onPeriodChange={setPreviousPeriod}
            color="gray"
          />
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : comparisonData ? (
          <div className="space-y-6">
            <AutomaticInsights insights={comparisonData.insights} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparisonData.metricsComparison.map((comparison, idx) => (
                <MetricComparisonCard key={idx} comparison={comparison} />
              ))}
            </div>
            
            <TrendChart 
              currentPeriod={currentPeriod}
              previousPeriod={previousPeriod}
              metrics={comparisonData.metricsComparison}
            />
            
            {pageType === 'sdr' && comparisonData.sdrComparison && (
              <SDRComparisonSection data={comparisonData.sdrComparison} />
            )}
            
            {pageType === 'closer' && comparisonData.closerComparison && (
              <CloserComparisonSection data={comparisonData.closerComparison} />
            )}
            
            {pageType === 'squads' && comparisonData.squadsComparison && (
              <SquadsComparisonSection data={comparisonData.squadsComparison} />
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            Nenhum dado disponível para comparação
          </div>
        )}
        
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Button variant="outline" onClick={refetch} className="border-border">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar Dados
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
