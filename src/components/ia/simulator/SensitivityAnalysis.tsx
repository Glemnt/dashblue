import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatarReal } from '@/utils/metricsCalculator';
import { TrendingUp } from 'lucide-react';

interface SensitivityAnalysisProps {
  sensitivity: {
    taxaShow: { impacto: number; descricao: string };
    taxaConversao: { impacto: number; descricao: string };
    ticketMedio: { impacto: number; descricao: string };
    maiorAlavanca: 'taxaShow' | 'taxaConversao' | 'ticketMedio';
  };
  isTVMode: boolean;
}

export const SensitivityAnalysis = ({ sensitivity, isTVMode }: SensitivityAnalysisProps) => {
  const metricas = [
    {
      key: 'taxaShow' as const,
      label: 'Taxa de Show',
      data: sensitivity.taxaShow,
      color: 'bg-blue-500'
    },
    {
      key: 'taxaConversao' as const,
      label: 'Taxa de Conversão',
      data: sensitivity.taxaConversao,
      color: 'bg-purple-500'
    },
    {
      key: 'ticketMedio' as const,
      label: 'Ticket Médio',
      data: sensitivity.ticketMedio,
      color: 'bg-green-500'
    }
  ];

  const maxImpacto = Math.max(
    sensitivity.taxaShow.impacto,
    sensitivity.taxaConversao.impacto,
    sensitivity.ticketMedio.impacto
  );

  const labels: Record<string, string> = {
    taxaShow: 'Taxa de Show',
    taxaConversao: 'Taxa de Conversão',
    ticketMedio: 'Ticket Médio'
  };

  return (
    <Card className="bg-card border-border p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className={`font-bold text-primary flex items-center gap-2 ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
          📈 Sensibilidade ao Impacto
        </h3>
        <Badge className="bg-accent text-accent-foreground flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Maior Alavanca: {labels[sensitivity.maiorAlavanca]}
        </Badge>
      </div>

      <div className="space-y-6">
        {metricas.map((metrica) => {
          const porcentagem = (metrica.data.impacto / maxImpacto) * 100;
          const isMaiorAlavanca = metrica.key === sensitivity.maiorAlavanca;

          return (
            <div key={metrica.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${isTVMode ? 'text-lg' : 'text-base'} ${isMaiorAlavanca ? 'text-accent' : 'text-foreground'}`}>
                  {metrica.label}
                  {isMaiorAlavanca && <span className="ml-2">🏆</span>}
                </span>
                <span className={`text-sm font-bold ${isMaiorAlavanca ? 'text-accent' : 'text-muted-foreground'}`}>
                  {metrica.data.descricao}
                </span>
              </div>

              <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                <div 
                  className={`h-full ${metrica.color} transition-all duration-500 ease-out flex items-center justify-end pr-3`}
                  style={{ width: `${porcentagem}%` }}
                >
                  <span className="text-white text-xs font-bold">
                    {formatarReal(metrica.data.impacto)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-accent/10 border border-accent/30 rounded-lg">
        <p className="text-sm text-foreground">
          💡 <strong>Recomendação:</strong> Focar em <strong className="text-accent">{labels[sensitivity.maiorAlavanca]}</strong> trará maior retorno com menos esforço. 
          Cada melhoria nessa métrica tem impacto de <strong className="text-accent">{formatarReal(sensitivity[sensitivity.maiorAlavanca].impacto)}</strong>.
        </p>
      </div>
    </Card>
  );
};
