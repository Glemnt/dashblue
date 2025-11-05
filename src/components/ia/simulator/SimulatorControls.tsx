import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Target, TrendingUp, RefreshCw, Sparkles, Info, Loader2 } from 'lucide-react';
import { formatarReal } from '@/utils/metricsCalculator';

interface SimulatorControlsProps {
  currentMetrics: {
    taxaShow: number;
    taxaConversao: number;
    ticketMedio: number;
  };
  simulatedValues: {
    taxaShow: number;
    taxaConversao: number;
    ticketMedio: number;
  };
  onValuesChange: (values: { taxaShow: number; taxaConversao: number; ticketMedio: number }) => void;
  onApplyPreset: (preset: 'metas' | 'benchmarks' | 'reset' | 'ai') => void;
  onSimulate: () => void;
  isLoading: boolean;
  isTVMode: boolean;
  impactData: {
    callsRealizadas: { atual: number; projetado: number; diff: number };
    contratos: { atual: number; projetado: number; diff: number };
    receita: { atual: number; projetado: number; diff: number };
    progressoMeta: { atual: number; projetado: number; diff: number };
  };
}

export const SimulatorControls = ({
  currentMetrics,
  simulatedValues,
  onValuesChange,
  onApplyPreset,
  onSimulate,
  isLoading,
  isTVMode,
  impactData
}: SimulatorControlsProps) => {
  const renderSlider = (
    label: string,
    value: number,
    currentValue: number,
    min: number,
    max: number,
    step: number,
    format: 'percentage' | 'currency',
    onChange: (val: number) => void,
    meta: number,
    benchmarkMin: number,
    benchmarkMax: number,
    tooltip: string
  ) => {
    const formatValue = (val: number) => 
      format === 'currency' ? formatarReal(val) : `${val.toFixed(1)}%`;
    
    const delta = value - currentValue;
    const deltaColor = delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-muted-foreground';

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className={`text-primary font-bold ${isTVMode ? 'text-2xl' : 'text-lg'}`}>
              {label}
            </label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
            <Badge variant="secondary" className="text-xs">
              Atual: {formatValue(currentValue)}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-accent font-bold ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
              {formatValue(value)}
            </span>
            {delta !== 0 && (
              <span className={`${deltaColor} font-semibold ${isTVMode ? 'text-xl' : 'text-sm'}`}>
                ({delta > 0 ? '+' : ''}{format === 'currency' ? formatarReal(Math.abs(delta)) : `${delta.toFixed(1)}%`})
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer simulator-slider slider-thumb"
          />
          
          {/* Marcador valor atual */}
          <div 
            className="absolute -top-8 bg-primary text-primary-foreground text-xs px-2 py-1 rounded pointer-events-none"
            style={{ 
              left: `${((currentValue - min) / (max - min)) * 100}%`,
              transform: 'translateX(-50%)'
            }}
          >
            ▼ Atual
          </div>
          
          {/* Marcador meta */}
          <div 
            className="absolute -bottom-8 bg-accent text-accent-foreground text-xs px-2 py-1 rounded pointer-events-none"
            style={{ 
              left: `${((meta - min) / (max - min)) * 100}%`,
              transform: 'translateX(-50%)'
            }}
          >
            🎯 Meta
          </div>
          
          {/* Área de benchmark */}
          <div 
            className="absolute top-0 h-3 bg-green-500/20 rounded pointer-events-none"
            style={{ 
              left: `${((benchmarkMin - min) / (max - min)) * 100}%`,
              width: `${((benchmarkMax - benchmarkMin) / (max - min)) * 100}%`
            }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mt-8">
          <span>Min: {formatValue(min)}</span>
          <span className="text-accent">Benchmark: {formatValue(benchmarkMin)}-{formatValue(benchmarkMax)}</span>
          <span>Max: {formatValue(max)}</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-card border-border p-8 space-y-8">
      <div>
        <h3 className={`font-bold text-primary flex items-center gap-2 ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
          ⚙️ Ajuste as Variáveis
        </h3>
        <p className="text-muted-foreground text-sm mt-2">
          Mova os sliders para simular diferentes cenários
        </p>
      </div>

      {/* Slider Taxa de Show */}
      {renderSlider(
        'Taxa de Show',
        simulatedValues.taxaShow,
        currentMetrics.taxaShow,
        0,
        100,
        1,
        'percentage',
        (val) => onValuesChange({ ...simulatedValues, taxaShow: val }),
        75,
        70,
        80,
        '% de calls agendadas que são efetivamente realizadas (pessoas que comparecem)'
      )}

      {/* Slider Taxa de Conversão */}
      {renderSlider(
        'Taxa de Conversão',
        simulatedValues.taxaConversao,
        currentMetrics.taxaConversao,
        0,
        50,
        1,
        'percentage',
        (val) => onValuesChange({ ...simulatedValues, taxaConversao: val }),
        25,
        20,
        30,
        '% de calls qualificadas que viram contratos fechados'
      )}

      {/* Slider Ticket Médio */}
      {renderSlider(
        'Ticket Médio',
        simulatedValues.ticketMedio,
        currentMetrics.ticketMedio,
        5000,
        30000,
        500,
        'currency',
        (val) => onValuesChange({ ...simulatedValues, ticketMedio: val }),
        12000,
        10000,
        15000,
        'Valor médio de cada contrato'
      )}

      {/* Botões de Preset */}
      <div className="grid grid-cols-2 gap-3 pt-4">
        <Button 
          variant="outline" 
          onClick={() => onApplyPreset('metas')}
          className="flex items-center gap-2"
        >
          <Target className="w-4 h-4" />
          Aplicar Metas
        </Button>
        <Button 
          variant="outline" 
          onClick={() => onApplyPreset('benchmarks')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Benchmarks
        </Button>
        <Button 
          variant="outline" 
          onClick={() => onApplyPreset('reset')}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Resetar
        </Button>
        <Button 
          variant="outline" 
          onClick={() => onApplyPreset('ai')}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Recomendação IA
        </Button>
      </div>

      {/* Calculadora de Impacto */}
      <Card className="bg-background border-border p-6 space-y-4">
        <h4 className="font-bold text-primary text-lg flex items-center gap-2">
          💰 Impacto Estimado
        </h4>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Calls Realizadas:</span>
            <div className="flex items-center gap-2">
              <span className="text-foreground">{impactData.callsRealizadas.atual.toFixed(0)}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-accent font-bold">{impactData.callsRealizadas.projetado.toFixed(0)}</span>
              <span className={impactData.callsRealizadas.diff > 0 ? 'text-green-500' : 'text-red-500'}>
                ({impactData.callsRealizadas.diff > 0 ? '+' : ''}{impactData.callsRealizadas.diff.toFixed(0)})
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Contratos:</span>
            <div className="flex items-center gap-2">
              <span className="text-foreground">{impactData.contratos.atual.toFixed(0)}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-accent font-bold">{impactData.contratos.projetado.toFixed(0)}</span>
              <span className={impactData.contratos.diff > 0 ? 'text-green-500' : 'text-red-500'}>
                ({impactData.contratos.diff > 0 ? '+' : ''}{impactData.contratos.diff.toFixed(0)})
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="text-sm font-semibold text-foreground">Receita Projetada:</span>
            <div className="flex items-center gap-2">
              <span className="text-foreground">{formatarReal(impactData.receita.atual)}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-accent font-bold text-xl">{formatarReal(impactData.receita.projetado)}</span>
              <span className={impactData.receita.diff > 0 ? 'text-green-500 font-bold' : 'text-red-500'}>
                ({impactData.receita.diff > 0 ? '+' : ''}{formatarReal(impactData.receita.diff)})
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Progresso da Meta:</span>
            <div className="flex items-center gap-2">
              <span className="text-foreground">{impactData.progressoMeta.atual.toFixed(1)}%</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-accent font-bold">{impactData.progressoMeta.projetado.toFixed(1)}%</span>
              <span className={impactData.progressoMeta.diff > 0 ? 'text-green-500' : 'text-red-500'}>
                ({impactData.progressoMeta.diff > 0 ? '+' : ''}{impactData.progressoMeta.diff.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Botão Simular */}
      <Button 
        onClick={onSimulate}
        disabled={isLoading}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
        size={isTVMode ? "lg" : "default"}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Simulando...
          </>
        ) : (
          <>
            🔮 Simular Impacto
          </>
        )}
      </Button>
    </Card>
  );
};
