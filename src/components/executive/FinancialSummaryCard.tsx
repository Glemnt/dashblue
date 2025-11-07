import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatarReal } from '@/utils/financialMetricsCalculator';

interface Props {
  receitaTotal: number;
  receitaAssinada: number;
  receitaPaga: number;
  gapFinanceiro: number;
  taxaRecebimento: number;
}

export const FinancialSummaryCard = ({ 
  receitaTotal, 
  receitaAssinada, 
  receitaPaga, 
  gapFinanceiro,
  taxaRecebimento 
}: Props) => {
  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Resumo Financeiro
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Funil Financeiro */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Receita Total</span>
              <span className="text-sm font-bold text-gray-900">
                {formatarReal(receitaTotal)}
              </span>
            </div>
            
            <div className="flex justify-between items-center pl-4">
              <span className="text-xs text-gray-600">→ Assinada</span>
              <span className="text-sm font-semibold text-blue-600">
                {formatarReal(receitaAssinada)}
              </span>
            </div>
            
            <div className="flex justify-between items-center pl-8">
              <span className="text-xs text-gray-600">→ Paga</span>
              <span className="text-sm font-semibold text-green-600">
                {formatarReal(receitaPaga)}
              </span>
            </div>
          </div>
          
          {/* Barra de Progresso */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500"
              style={{ width: `${taxaRecebimento}%` }}
            />
          </div>
          
          {/* Gap Financeiro */}
          <div className={`p-3 rounded-lg ${
            gapFinanceiro > 100000 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {gapFinanceiro > 100000 ? (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              ) : (
                <TrendingUp className="w-4 h-4 text-green-600" />
              )}
              <span className="text-xs font-semibold text-gray-700">Gap Financeiro</span>
            </div>
            <p className={`text-lg font-black ${
              gapFinanceiro > 100000 ? 'text-red-600' : 'text-green-600'
            }`}>
              {formatarReal(gapFinanceiro)}
            </p>
            <p className="text-xs text-gray-600">
              Taxa de recebimento: {taxaRecebimento.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
