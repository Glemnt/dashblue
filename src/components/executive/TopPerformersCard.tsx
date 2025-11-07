import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trophy, Medal } from 'lucide-react';
import { formatarReal } from '@/utils/metricsCalculator';

interface Performer {
  nome: string;
  valorVendas: number;
  percentual: number;
}

interface Props {
  tipo: 'SDR' | 'Closer';
  performers: Performer[];
}

export const TopPerformersCard = ({ tipo, performers }: Props) => {
  const top3 = performers.slice(0, 3);
  
  const medals = [
    { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-50' },
    { icon: Medal, color: 'text-orange-600', bg: 'bg-orange-50' }
  ];
  
  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">Top 3 {tipo}s</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {top3.map((performer, idx) => {
          const Medal = medals[idx];
          return (
            <div 
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-lg ${Medal.bg} border`}
            >
              <Medal.icon className={`w-5 h-5 ${Medal.color}`} />
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">
                  {performer.nome}
                </p>
                <p className="text-xs text-gray-600">
                  {performer.percentual.toFixed(1)}% das vendas
                </p>
              </div>
              <span className="text-sm font-black text-gray-900">
                {formatarReal(performer.valorVendas)}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
