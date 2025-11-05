import { Badge } from '@/components/ui/badge';

interface IAContextBannerProps {
  isTVMode: boolean;
  dataAtual: string;
  trimestre: number;
  progressoMes: number;
  urgencia: string;
  sazonalidade: string;
}

const IAContextBanner = ({ 
  isTVMode, 
  dataAtual, 
  trimestre, 
  progressoMes,
  urgencia,
  sazonalidade
}: IAContextBannerProps) => {
  const getUrgenciaColor = (urgencia: string) => {
    if (urgencia.includes('CRÍTICA')) return 'text-red-400';
    if (urgencia.includes('ALTA')) return 'text-orange-400';
    if (urgencia.includes('MÉDIA')) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-6 py-3 border-b border-white/10">
      <div className={`flex items-center justify-between ${isTVMode ? 'text-xl' : 'text-sm'} transition-all`}>
        <span className="text-white font-medium">
          📅 {dataAtual} • Q{trimestre} • {progressoMes}% do mês decorrido
        </span>
        <div className="flex items-center gap-4">
          <span className={getUrgenciaColor(urgencia)}>
            🚨 Urgência: <strong>{urgencia}</strong>
          </span>
          <span className="text-cyan-400">
            📈 Sazonalidade: <strong>{sazonalidade}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default IAContextBanner;
