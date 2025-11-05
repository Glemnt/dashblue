import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatarReal } from '@/utils/metricsCalculator';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface ScenarioData {
  taxaShow: number;
  taxaConversao: number;
  ticketMedio: number;
  callsRealizadas: number;
  contratos: number;
  receita: number;
  progressoMeta: number;
}

interface ScenariosTableProps {
  currentScenario: ScenarioData;
  simulatedScenario: ScenarioData;
  realisticScenario: ScenarioData;
  optimisticScenario: ScenarioData;
  pessimisticScenario: ScenarioData;
  metaMensal: number;
  isTVMode: boolean;
}

export const ScenariosTable = ({
  currentScenario,
  simulatedScenario,
  realisticScenario,
  optimisticScenario,
  pessimisticScenario,
  metaMensal,
  isTVMode
}: ScenariosTableProps) => {
  const renderScenarioColumn = (
    label: string,
    badge: string,
    badgeColor: string,
    scenario: ScenarioData,
    showDiff: boolean = false,
    highlight: boolean = false
  ) => {
    const diff = showDiff ? {
      receita: scenario.receita - currentScenario.receita,
      contratos: scenario.contratos - currentScenario.contratos,
      progressoMeta: scenario.progressoMeta - currentScenario.progressoMeta
    } : null;

    return (
      <div 
        className={`scenario-column p-6 rounded-lg transition-all duration-300 ${
          highlight ? 'bg-accent/10 border-2 border-accent shadow-lg' : 'bg-card border border-border'
        } hover:scale-105`}
      >
        <div className="flex flex-col items-center mb-4">
          <Badge className={`${badgeColor} mb-2`}>
            {badge}
          </Badge>
          <h4 className={`font-bold text-center ${isTVMode ? 'text-xl' : 'text-lg'}`}>
            {label}
          </h4>
        </div>

        <div className="space-y-3 text-sm">
          <div className="border-b border-border pb-2">
            <p className="text-muted-foreground text-xs mb-1">Métricas:</p>
            <div className="space-y-1">
              <p className="text-foreground">Taxa Show: <strong>{scenario.taxaShow.toFixed(1)}%</strong></p>
              <p className="text-foreground">Taxa Conv: <strong>{scenario.taxaConversao.toFixed(1)}%</strong></p>
              <p className="text-foreground">Ticket: <strong>{formatarReal(scenario.ticketMedio)}</strong></p>
            </div>
          </div>

          <div className="border-b border-border pb-2">
            <p className="text-muted-foreground text-xs mb-1">Resultados:</p>
            <div className="space-y-1">
              <p className="text-foreground">Calls: <strong>{scenario.callsRealizadas.toFixed(0)}</strong></p>
              <p className="text-foreground">Contratos: <strong>{scenario.contratos.toFixed(0)}</strong></p>
              <p className="text-accent text-lg font-bold">{formatarReal(scenario.receita)}</p>
              <p className="text-foreground">Meta: <strong className={scenario.progressoMeta >= 100 ? 'text-green-500' : 'text-foreground'}>{scenario.progressoMeta.toFixed(1)}%</strong></p>
            </div>
          </div>

          {diff && (
            <div className="pt-2">
              <p className="text-muted-foreground text-xs mb-1">Diferença vs Atual:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  {diff.receita > 0 ? <ArrowUp className="w-3 h-3 text-green-500" /> : <ArrowDown className="w-3 h-3 text-red-500" />}
                  <span className={diff.receita > 0 ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
                    {formatarReal(Math.abs(diff.receita))}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {diff.contratos > 0 ? <ArrowUp className="w-3 h-3 text-green-500" /> : <ArrowDown className="w-3 h-3 text-red-500" />}
                  <span className={diff.contratos > 0 ? 'text-green-500' : 'text-red-500'}>
                    {diff.contratos > 0 ? '+' : ''}{diff.contratos.toFixed(0)} contratos
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {diff.progressoMeta > 0 ? <ArrowUp className="w-3 h-3 text-green-500" /> : <ArrowDown className="w-3 h-3 text-red-500" />}
                  <span className={diff.progressoMeta > 0 ? 'text-green-500' : 'text-red-500'}>
                    {diff.progressoMeta > 0 ? '+' : ''}{diff.progressoMeta.toFixed(1)}% progresso
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-background border-border p-8">
      <h3 className={`font-bold text-primary mb-6 ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
        📊 Comparação de Cenários
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {renderScenarioColumn(
          'Atual',
          '📍 Baseline',
          'bg-muted text-muted-foreground',
          currentScenario,
          false,
          false
        )}

        {renderScenarioColumn(
          'Seu Cenário',
          '🎯 Simulado',
          'bg-accent text-accent-foreground',
          simulatedScenario,
          true,
          true
        )}

        {renderScenarioColumn(
          'Realista',
          '✅ +5%/+3%/+10%',
          'bg-green-500 text-white',
          realisticScenario,
          true,
          false
        )}

        {renderScenarioColumn(
          'Otimista',
          '🚀 Metas',
          'bg-yellow-500 text-white',
          optimisticScenario,
          true,
          false
        )}

        {renderScenarioColumn(
          'Pessimista',
          '⚠️ -10%/-5%/-15%',
          'bg-red-500 text-white',
          pessimisticScenario,
          true,
          false
        )}
      </div>
    </Card>
  );
};
