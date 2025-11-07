import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Crown } from 'lucide-react';
import { formatarReal } from '@/utils/metricsCalculator';

interface Props {
  hotDogs: {
    receita: number;
    contratos: number;
  };
  corvoAzul: {
    receita: number;
    contratos: number;
  };
  lider: 'Hot Dogs' | 'Corvo Azul' | 'Empate';
  vantagem: number;
}

export const SquadsBattleCard = ({ hotDogs, corvoAzul, lider, vantagem }: Props) => {
  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          Guerra de Squads
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Hot Dogs */}
          <div className={`p-4 rounded-lg ${
            lider === 'Hot Dogs' ? 'bg-red-50 border-2 border-red-500' : 'bg-gray-50'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-gray-900">🔴 Hot Dogs</p>
                <p className="text-xs text-gray-600">{hotDogs.contratos} contratos</p>
              </div>
              <span className="text-lg font-black text-gray-900">
                {formatarReal(hotDogs.receita)}
              </span>
            </div>
          </div>
          
          {/* Corvo Azul */}
          <div className={`p-4 rounded-lg ${
            lider === 'Corvo Azul' ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-gray-900">🔵 Corvo Azul</p>
                <p className="text-xs text-gray-600">{corvoAzul.contratos} contratos</p>
              </div>
              <span className="text-lg font-black text-gray-900">
                {formatarReal(corvoAzul.receita)}
              </span>
            </div>
          </div>
          
          {/* Vantagem */}
          {lider !== 'Empate' && (
            <div className="text-center pt-2 border-t">
              <p className="text-xs text-gray-600">
                <span className="font-bold">{lider}</span> lidera com
              </p>
              <p className="text-lg font-black text-gray-900">
                {formatarReal(vantagem)}
              </p>
              <p className="text-xs text-gray-500">de vantagem</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
