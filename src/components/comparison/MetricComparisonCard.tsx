import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricComparison } from '@/hooks/useTemporalComparison';

interface Props {
  comparison: MetricComparison;
}

export const MetricComparisonCard = ({ comparison }: Props) => {
  const getTrendIcon = () => {
    switch (comparison.trend) {
      case 'up': return <TrendingUp className="w-5 h-5" />;
      case 'down': return <TrendingDown className="w-5 h-5" />;
      default: return <Minus className="w-5 h-5" />;
    }
  };
  
  const getTrendColor = () => {
    if (comparison.trend === 'stable') return 'text-muted-foreground';
    if (comparison.isPositive) {
      return comparison.trend === 'up' ? 'text-green-500' : 'text-red-500';
    } else {
      return comparison.trend === 'down' ? 'text-green-500' : 'text-red-500';
    }
  };
  
  return (
    <Card className="hover:shadow-lg transition-shadow border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {comparison.metricName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <div className="text-2xl font-bold text-foreground">
              {comparison.formattedCurrent}
            </div>
            <div className="text-xs text-muted-foreground">Período Atual</div>
          </div>
          
          <div className={cn("flex items-center gap-2", getTrendColor())}>
            {getTrendIcon()}
            <span className="font-semibold">
              {comparison.variationPercentual > 0 ? '+' : ''}
              {comparison.variationPercentual.toFixed(1)}%
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            vs {comparison.formattedPrevious}
          </div>
          
          <div className="h-8 flex items-end gap-1">
            {[...Array(7)].map((_, i) => {
              const height = comparison.trend === 'up' 
                ? (i + 1) * 10 
                : comparison.trend === 'down'
                ? (7 - i) * 10
                : 40 + Math.random() * 20;
              
              return (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-t transition-all",
                    comparison.trend === 'up' && comparison.isPositive && "bg-green-200 dark:bg-green-900",
                    comparison.trend === 'down' && comparison.isPositive && "bg-red-200 dark:bg-red-900",
                    comparison.trend === 'stable' && "bg-muted"
                  )}
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
