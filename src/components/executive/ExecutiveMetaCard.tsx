import { Card } from '@/components/ui/card';
import { formatarReal } from '@/utils/metricsCalculator';

interface Props {
  tipo: 'mensal' | 'semanal' | 'diária';
  valor: number;
  meta: number;
  progresso: number;
  faltante: number;
}

export const ExecutiveMetaCard = ({ tipo, valor, meta, progresso, faltante }: Props) => {
  const getColor = () => {
    if (progresso >= 90) return 'bg-green-500';
    if (progresso >= 70) return 'bg-yellow-500';
    if (progresso >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  const labels = {
    mensal: 'Meta Mensal',
    semanal: 'Meta Semanal',
    diária: 'Meta Diária'
  };
  
  return (
    <Card className="p-4 bg-white border-2 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {labels[tipo]}
        </p>
        <span className={`text-xl font-black ${
          progresso >= 70 ? 'text-green-600' : 'text-red-600'
        }`}>
          {progresso.toFixed(0)}%
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-2xl font-black text-gray-900">
            {formatarReal(valor)}
          </span>
          <span className="text-sm text-gray-500">
            / {formatarReal(meta)}
          </span>
        </div>
        
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getColor()} transition-all duration-500`}
            style={{ width: `${Math.min(progresso, 100)}%` }}
          />
        </div>
        
        <p className="text-xs text-gray-500">
          Faltam <span className="font-semibold text-gray-700">{formatarReal(faltante)}</span>
        </p>
      </div>
    </Card>
  );
};
