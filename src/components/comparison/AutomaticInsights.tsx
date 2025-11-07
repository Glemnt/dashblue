import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

interface Insight {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface Props {
  insights: Insight[];
}

export const AutomaticInsights = ({ insights }: Props) => {
  if (!insights.length) return null;
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'danger': return <XCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };
  
  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'danger': return 'destructive';
      default: return 'default';
    }
  };
  
  const sortedInsights = [...insights].sort((a, b) => {
    const priorityMap: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return priorityMap[a.priority] - priorityMap[b.priority];
  });
  
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
        <Info className="w-5 h-5" />
        Insights Automáticos
      </h3>
      
      <div className="grid gap-3">
        {sortedInsights.slice(0, 5).map((insight, idx) => (
          <Alert key={idx} variant={getAlertVariant(insight.type) as any}>
            <div className="flex items-start gap-3">
              {getIcon(insight.type)}
              <div>
                <AlertTitle>{insight.title}</AlertTitle>
                <AlertDescription>{insight.description}</AlertDescription>
              </div>
            </div>
          </Alert>
        ))}
      </div>
    </div>
  );
};
