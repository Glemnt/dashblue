import { AlertTriangle, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MetaAlert, AlertSeverity } from '@/hooks/useMetaAlerts';
import { useState } from 'react';

interface AlertsBannerProps {
  alerts: MetaAlert[];
  isTVMode?: boolean;
}

const AlertsBanner = ({ alerts, isTVMode = false }: AlertsBannerProps) => {
  const [isOpen, setIsOpen] = useState(true);

  if (alerts.length === 0) return null;

  const getSeverityConfig = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          bgColor: 'bg-[#FF4757]/10',
          borderColor: 'border-[#FF4757]',
          textColor: 'text-[#FF4757]',
          icon: AlertTriangle,
          badgeBg: 'bg-[#FF4757]'
        };
      case 'warning':
        return {
          bgColor: 'bg-[#FFB800]/10',
          borderColor: 'border-[#FFB800]',
          textColor: 'text-[#FFB800]',
          icon: AlertCircle,
          badgeBg: 'bg-[#FFB800]'
        };
      case 'success':
        return {
          bgColor: 'bg-[#00E5CC]/10',
          borderColor: 'border-[#00E5CC]',
          textColor: 'text-[#00E5CC]',
          icon: CheckCircle,
          badgeBg: 'bg-[#00E5CC]'
        };
    }
  };

  const primaryAlert = alerts[0];
  const config = getSeverityConfig(primaryAlert.severity);
  const Icon = config.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div 
        className={`${config.bgColor} border-l-4 ${config.borderColor} ${
          isTVMode ? 'mx-16 my-8 rounded-2xl' : 'mx-12 my-6 rounded-xl'
        }`}
        role="alert"
        aria-live="assertive"
      >
        <CollapsibleTrigger asChild>
          <button 
            className={`w-full ${isTVMode ? 'p-8' : 'p-6'} flex items-center justify-between hover:bg-black/5 transition-colors`}
            aria-label={isOpen ? "Recolher alertas" : "Expandir alertas"}
          >
            <div className="flex items-center gap-4">
              <div className={`${config.badgeBg} rounded-full ${isTVMode ? 'p-4' : 'p-3'} animate-pulse`}>
                <Icon className={`${config.textColor} ${isTVMode ? 'w-8 h-8' : 'w-6 h-6'}`} />
              </div>
              <div className="text-left">
                <h3 className={`text-[#0B1120] font-bold ${isTVMode ? 'text-3xl' : 'text-xl'} mb-1`}>
                  {primaryAlert.title}
                </h3>
                <p className={`${config.textColor} ${isTVMode ? 'text-xl' : 'text-base'}`}>
                  {primaryAlert.message}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {alerts.length > 1 && (
                <span 
                  className={`${config.badgeBg} text-white font-bold rounded-full ${
                    isTVMode ? 'px-5 py-2 text-xl' : 'px-4 py-1 text-sm'
                  }`}
                  aria-label={`${alerts.length} alertas`}
                >
                  {alerts.length}
                </span>
              )}
              {isOpen ? (
                <ChevronUp className={`text-[#0B1120] ${isTVMode ? 'w-10 h-10' : 'w-6 h-6'}`} />
              ) : (
                <ChevronDown className={`text-[#0B1120] ${isTVMode ? 'w-10 h-10' : 'w-6 h-6'}`} />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className={`${isTVMode ? 'px-8 pb-8' : 'px-6 pb-6'} space-y-4 border-t border-[#0B1120]/10 pt-4`}>
            {alerts.map((alert) => {
              const alertConfig = getSeverityConfig(alert.severity);
              const AlertIcon = alertConfig.icon;
              
              return (
                <div 
                  key={alert.id}
                  className={`${alertConfig.bgColor} rounded-lg ${isTVMode ? 'p-6' : 'p-4'} border ${alertConfig.borderColor}`}
                >
                  <div className="flex items-start gap-4 mb-3">
                    <AlertIcon className={`${alertConfig.textColor} ${isTVMode ? 'w-7 h-7' : 'w-5 h-5'} flex-shrink-0 mt-1`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`text-[#0B1120] font-bold ${isTVMode ? 'text-2xl' : 'text-lg'}`}>
                          {alert.metric}
                        </h4>
                        <span className={`${alertConfig.textColor} font-bold ${isTVMode ? 'text-2xl' : 'text-base'}`}>
                          {alert.progress.toFixed(0)}%
                        </span>
                      </div>
                      <p className={`text-[#0B1120] ${isTVMode ? 'text-lg mb-4' : 'text-sm mb-3'}`}>
                        {alert.message}
                      </p>
                      <div className="space-y-2">
                        <Progress 
                          value={alert.progress} 
                          className={isTVMode ? 'h-3' : 'h-2'}
                          aria-label={`Progresso: ${alert.progress.toFixed(0)}%`}
                          role="progressbar"
                          aria-valuenow={alert.progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                        <div className="flex justify-between">
                          <span className={`text-[#64748B] ${isTVMode ? 'text-base' : 'text-xs'}`}>
                            {alert.diasRestantes} dias úteis restantes
                          </span>
                          {alert.meta > 0 && (
                            <span className={`text-[#64748B] ${isTVMode ? 'text-base' : 'text-xs'}`}>
                              Meta: {alert.meta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default AlertsBanner;
