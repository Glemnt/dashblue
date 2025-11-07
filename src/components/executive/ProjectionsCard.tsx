import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from 'lucide-react';
import { formatarReal } from '@/utils/metricsCalculator';
import { Badge } from '@/components/ui/badge';

interface Props {
  projecoes: {
    otimista: {
      receitaFinal: number;
      contratos: number;
      probabilidade: number;
      diasRestantes: number;
    };
    pessimista: {
      receitaFinal: number;
      contratos: number;
      probabilidade: number;
    };
    riscosCriticos: string[];
    oportunidades: string[];
  };
}

export const ProjectionsCard = ({ projecoes }: Props) => {
  return (
    <Card className="border-2 col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">Projeções e Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Projeção Otimista */}
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-bold text-green-900">Cenário Otimista</span>
              <Badge variant="outline" className="ml-auto bg-green-100 text-green-700">
                {projecoes.otimista.probabilidade}%
              </Badge>
            </div>
            <p className="text-2xl font-black text-green-900 mb-1">
              {formatarReal(projecoes.otimista.receitaFinal)}
            </p>
            <p className="text-xs text-green-700">
              {projecoes.otimista.contratos} contratos projetados
            </p>
            <p className="text-xs text-green-600 mt-2">
              Mantendo ritmo atual nos próximos {projecoes.otimista.diasRestantes} dias
            </p>
          </div>
          
          {/* Projeção Pessimista */}
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <span className="text-sm font-bold text-red-900">Cenário Pessimista</span>
              <Badge variant="outline" className="ml-auto bg-red-100 text-red-700">
                {projecoes.pessimista.probabilidade}%
              </Badge>
            </div>
            <p className="text-2xl font-black text-red-900 mb-1">
              {formatarReal(projecoes.pessimista.receitaFinal)}
            </p>
            <p className="text-xs text-red-700">
              {projecoes.pessimista.contratos} contratos projetados
            </p>
            <p className="text-xs text-red-600 mt-2">
              Com desaceleração de 20% no ritmo
            </p>
          </div>
          
          {/* Riscos Críticos */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-bold text-yellow-900">Riscos Críticos</span>
            </div>
            <ul className="space-y-1">
              {projecoes.riscosCriticos.map((risco, idx) => (
                <li key={idx} className="text-xs text-yellow-800 flex items-start gap-1">
                  <span className="text-yellow-600">•</span>
                  <span>{risco}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Oportunidades */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-900">Oportunidades</span>
            </div>
            <ul className="space-y-1">
              {projecoes.oportunidades.map((oportunidade, idx) => (
                <li key={idx} className="text-xs text-blue-800 flex items-start gap-1">
                  <span className="text-blue-600">•</span>
                  <span>{oportunidade}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
