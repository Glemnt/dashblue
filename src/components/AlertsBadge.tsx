import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AlertsBadgeProps {
  criticalCount: number;
  warningCount: number;
  isTVMode?: boolean;
}

const AlertsBadge = ({ criticalCount, warningCount, isTVMode = false }: AlertsBadgeProps) => {
  const totalAlerts = criticalCount + warningCount;
  
  if (totalAlerts === 0) return null;

  const hasCritical = criticalCount > 0;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={`relative ${isTVMode ? 'p-4' : 'p-2'}`}
            aria-label={`${totalAlerts} alertas: ${criticalCount} críticos, ${warningCount} avisos`}
          >
            <AlertCircle 
              className={`${isTVMode ? 'w-10 h-10' : 'w-6 h-6'} ${
                hasCritical ? 'text-red-500' : 'text-yellow-500'
              } ${hasCritical ? 'animate-pulse' : ''}`}
            />
            <Badge 
              variant={hasCritical ? 'destructive' : 'default'}
              className={`absolute -top-1 -right-1 ${isTVMode ? 'text-base px-2 py-1' : 'text-xs px-1.5 py-0.5'} min-w-[20px] h-auto flex items-center justify-center`}
            >
              {totalAlerts}
            </Badge>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-semibold mb-1">Alertas Ativos</p>
            {criticalCount > 0 && (
              <p className="text-red-500">🚨 {criticalCount} crítico{criticalCount > 1 ? 's' : ''}</p>
            )}
            {warningCount > 0 && (
              <p className="text-yellow-500">⚠️ {warningCount} aviso{warningCount > 1 ? 's' : ''}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AlertsBadge;
