import { formatarReal } from '@/utils/metricsCalculator';

interface SimulatorSliderProps {
  label: string;
  value: number;
  currentValue: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: 'percentage' | 'currency';
  isTVMode?: boolean;
}

export const SimulatorSlider = ({
  label,
  value,
  currentValue,
  min,
  max,
  step = 1,
  onChange,
  format = 'percentage',
  isTVMode = false
}: SimulatorSliderProps) => {
  const formatValue = (val: number) => {
    if (format === 'currency') return formatarReal(val);
    return `${val.toFixed(1)}%`;
  };

  const percentage = ((value - min) / (max - min)) * 100;
  const delta = value - currentValue;
  const deltaColor = delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-gray-400';
  const deltaSymbol = delta > 0 ? '+' : '';

  return (
    <div className="space-y-3">
      {/* Header com valor atual e simulado */}
      <div className="flex items-center justify-between">
        <label className={`text-white font-semibold ${isTVMode ? 'text-2xl' : 'text-base'}`}>
          {label}
        </label>
        <div className="flex items-center gap-3">
          <span className={`text-[#00E5CC] font-bold ${isTVMode ? 'text-3xl' : 'text-xl'}`}>
            {formatValue(value)}
          </span>
          {delta !== 0 && (
            <span className={`${deltaColor} text-sm font-semibold ${isTVMode ? 'text-xl' : ''}`}>
              ({deltaSymbol}{format === 'currency' ? formatarReal(Math.abs(delta)) : `${delta.toFixed(1)}%`})
            </span>
          )}
        </div>
      </div>

      {/* Slider com gradiente visual */}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-3 rounded-lg appearance-none cursor-pointer
                     focus:outline-none focus:ring-4 focus:ring-[#00E5CC]/50
                     slider-thumb"
          style={{
            background: `linear-gradient(to right, 
              #ef4444 0%, 
              #f59e0b ${percentage/2}%, 
              #10b981 100%)`
          }}
        />
        
        {/* Marcador do valor atual */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-white border-2 border-[#0066FF] rounded-full pointer-events-none"
          style={{ 
            left: `${((currentValue - min) / (max - min)) * 100}%`,
            transform: 'translateX(-50%) translateY(-50%)'
          }}
        />
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-between text-xs text-[#94A3B8]">
        <span>Atual: <strong className="text-white">{formatValue(currentValue)}</strong></span>
        <span>Min: {formatValue(min)} | Max: {formatValue(max)}</span>
      </div>
    </div>
  );
};
