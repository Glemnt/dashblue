import { AlertTriangle, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DataStaleIndicatorProps {
  lastUpdate: Date | null;
  isTVMode?: boolean;
  threshold?: number; // minutos
}

const DataStaleIndicator = ({ lastUpdate, isTVMode = false, threshold = 5 }: DataStaleIndicatorProps) => {
  if (!lastUpdate) return null;
  
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - lastUpdate.getTime()) / 60000);
  
  // Se < threshold minutos, não mostrar nada
  if (diffMinutes < threshold) return null;
  
  // Se >= threshold minutos, mostrar badge de alerta
  const isVeryStale = diffMinutes >= 15; // Crítico após 15min
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all cursor-help ${
              isVeryStale 
                ? 'bg-[#FF4757]/20 border-[#FF4757] text-[#FF4757]' 
                : 'bg-[#FFB800]/20 border-[#FFB800] text-[#FFB800]'
            } ${isTVMode ? 'text-lg' : 'text-sm'}`}
          >
            {isVeryStale ? (
              <AlertTriangle className={isTVMode ? 'w-6 h-6' : 'w-4 h-4'} />
            ) : (
              <Clock className={isTVMode ? 'w-6 h-6' : 'w-4 h-4'} />
            )}
            <span className="font-outfit font-semibold">
              {isVeryStale ? 'Dados Desatualizados' : 'Dados com Atraso'}
            </span>
            <span className="font-outfit font-black">
              {diffMinutes} min
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-[#0B1120] border-[#FFB800]">
          <div className="max-w-xs">
            <p className="font-outfit text-sm font-semibold mb-1">
              {isVeryStale ? '⚠️ Atenção!' : 'ℹ️ Informação'}
            </p>
            <p className="font-outfit text-xs text-[#A8B8D0]">
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </p>
            <p className="font-outfit text-xs text-[#A8B8D0] mt-2">
              {isVeryStale 
                ? 'Os dados podem estar significativamente desatualizados. Clique em "Atualizar" ou verifique sua conexão.'
                : 'Os dados estão levemente desatualizados. Considere atualizar para dados mais recentes.'
              }
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DataStaleIndicator;
