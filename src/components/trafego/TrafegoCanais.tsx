import { Star } from "lucide-react";
import { CanalMetrics, formatarMoeda, formatarMoedaCompacta, formatarNumero, CORES_CANAIS } from "@/utils/trafegoMetricsCalculator";

interface TrafegoCanaisProps {
  canais: CanalMetrics[];
  investimentoTotal: number;
  isTVMode?: boolean;
}

const canalIcons: Record<string, string> = {
  'Facebook': '📘',
  'Google': '🔍',
  'LinkedIn': '💼',
  'Instagram': '📸',
  'YouTube': '📺',
  'TikTok': '🎵',
  'Multi': '🔄'
};

const TrafegoCanais = ({ canais, investimentoTotal, isTVMode = false }: TrafegoCanaisProps) => {
  const renderStars = (performance: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${isTVMode ? 'w-5 h-5' : 'w-4 h-4'} ${star <= performance ? 'fill-[#FFB800] text-[#FFB800]' : 'text-[#64748B]'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${isTVMode ? 'gap-6' : 'gap-4 sm:gap-6'}`}>
      {canais.map((canal) => {
        const percentualInvestimento = investimentoTotal > 0 ? (canal.investimento / investimentoTotal) * 100 : 0;
        const canalColor = CORES_CANAIS[canal.canal] || '#6B7280';
        
        return (
          <div 
            key={canal.canal}
            className={`bg-[#151E35] rounded-2xl border-l-4 ${isTVMode ? 'p-6' : 'p-5'}`}
            style={{ borderColor: canalColor }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`${isTVMode ? 'text-4xl' : 'text-3xl'}`}>
                  {canalIcons[canal.canal] || '📊'}
                </span>
                <div>
                  <h3 className={`text-white font-bold ${isTVMode ? 'text-2xl' : 'text-lg'}`}>
                    {canal.canal.toUpperCase()} ADS
                  </h3>
                  {renderStars(canal.performance)}
                </div>
              </div>
              
              {/* Mini pie chart representation */}
              <div className="relative">
                <svg className={`${isTVMode ? 'w-16 h-16' : 'w-12 h-12'}`} viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="#0B1120"
                    strokeWidth="4"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke={canalColor}
                    strokeWidth="4"
                    strokeDasharray={`${percentualInvestimento} ${100 - percentualInvestimento}`}
                    strokeDashoffset="25"
                  />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-white font-bold ${isTVMode ? 'text-sm' : 'text-xs'}`}>
                  {percentualInvestimento.toFixed(0)}%
                </span>
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-4 ${isTVMode ? 'text-lg' : 'text-sm'}`}>
              <div>
                <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-1">Investimento</p>
                <p className="text-white font-bold">{formatarMoedaCompacta(canal.investimento)}</p>
              </div>
              <div>
                <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-1">Leads</p>
                <p className="text-white font-bold">{formatarNumero(canal.leads)}</p>
              </div>
              <div>
                <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-1">Qualificados</p>
                <p className="text-white font-bold">{formatarNumero(canal.leadsQualificados)}</p>
              </div>
              <div>
                <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-1">Fechamentos</p>
                <p className="text-white font-bold">{canal.fechamentos}</p>
              </div>
            </div>

            <div className={`mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4 ${isTVMode ? 'text-lg' : 'text-sm'}`}>
              <div>
                <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-1">ROAS</p>
                <p 
                  className="font-black text-xl"
                  style={{ color: canal.roas >= 5 ? '#10B981' : canal.roas >= 3 ? '#34D399' : canal.roas >= 2 ? '#FBBF24' : '#EF4444' }}
                >
                  {canal.roas.toFixed(1)}x
                </p>
              </div>
              <div>
                <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-1">CAC</p>
                <p className="text-white font-bold text-xl">{formatarMoedaCompacta(canal.cac)}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[#94A3B8] text-xs uppercase tracking-wider mb-2">Performance</p>
              <div className="flex items-center gap-2">
                {renderStars(canal.performance)}
                <span className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-sm'}`}>
                  ({canal.performance === 5 ? 'Excelente' : canal.performance === 4 ? 'Muito Bom' : canal.performance === 3 ? 'Bom' : canal.performance === 2 ? 'Regular' : 'Atenção'})
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TrafegoCanais;
