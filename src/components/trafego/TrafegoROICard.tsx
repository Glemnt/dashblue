import { Gem } from "lucide-react";
import { formatarMoeda } from "@/utils/trafegoMetricsCalculator";

interface TrafegoROICardProps {
  investimento: number;
  receita: number;
  isTVMode?: boolean;
}

const TrafegoROICard = ({ investimento, receita, isTVMode = false }: TrafegoROICardProps) => {
  const lucroLiquido = receita - investimento;
  const roi = investimento > 0 ? ((receita - investimento) / investimento) * 100 : 0;
  const roiMultiplo = investimento > 0 ? receita / investimento : 0;

  return (
    <div className={`bg-gradient-to-r from-[#151E35] via-[#1a2744] to-[#151E35] rounded-2xl border-2 border-[#00E5CC]/30 ${isTVMode ? 'p-10' : 'p-6 sm:p-8'}`}>
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-[#00E5CC]/20 rounded-2xl p-4">
          <Gem className={`text-[#00E5CC] ${isTVMode ? 'w-10 h-10' : 'w-8 h-8'}`} />
        </div>
        <h3 className={`text-white font-bold ${isTVMode ? 'text-3xl' : 'text-xl sm:text-2xl'}`}>
          💎 ROI (Return on Investment) - INVESTIMENTO vs FATURAMENTO
        </h3>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 ${isTVMode ? 'gap-8 mb-8' : 'gap-4 sm:gap-6 mb-6'}`}>
        <div className="text-center">
          <p className={`text-[#94A3B8] uppercase tracking-wider font-semibold ${isTVMode ? 'text-base mb-2' : 'text-xs mb-1'}`}>
            Investido
          </p>
          <p className={`text-[#FF4757] font-black ${isTVMode ? 'text-4xl' : 'text-2xl sm:text-3xl'}`}>
            {formatarMoeda(investimento)}
          </p>
        </div>

        <div className="text-center flex items-center justify-center">
          <span className={`text-[#00E5CC] font-bold ${isTVMode ? 'text-4xl' : 'text-3xl'}`}>→</span>
        </div>

        <div className="text-center">
          <p className={`text-[#94A3B8] uppercase tracking-wider font-semibold ${isTVMode ? 'text-base mb-2' : 'text-xs mb-1'}`}>
            Faturado
          </p>
          <p className={`text-[#00E5CC] font-black ${isTVMode ? 'text-4xl' : 'text-2xl sm:text-3xl'}`}>
            {formatarMoeda(receita)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`relative ${isTVMode ? 'h-14' : 'h-10'} bg-[#0B1120] rounded-full overflow-hidden mb-6`}>
        <div 
          className="absolute h-full rounded-full bg-gradient-to-r from-[#00E5CC] to-[#0066FF] transition-all duration-1000"
          style={{ width: `${Math.min((receita / (investimento * 10)) * 100, 100)}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-white font-black ${isTVMode ? 'text-3xl' : 'text-xl sm:text-2xl'}`}>
            ROI: {roi.toFixed(0)}% 🚀
          </span>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${isTVMode ? 'gap-8' : 'gap-4'}`}>
        <div className="flex items-center gap-4">
          <span className={`${isTVMode ? 'text-2xl' : 'text-xl'}`}>💰</span>
          <div>
            <p className={`text-[#94A3B8] ${isTVMode ? 'text-lg' : 'text-sm'}`}>Lucro Líquido:</p>
            <p className={`text-[#00E5CC] font-black ${isTVMode ? 'text-3xl' : 'text-xl sm:text-2xl'}`}>
              {formatarMoeda(lucroLiquido)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className={`${isTVMode ? 'text-2xl' : 'text-xl'}`}>📊</span>
          <div>
            <p className={`text-[#94A3B8] ${isTVMode ? 'text-lg' : 'text-sm'}`}>Para cada R$ 1 investido, você lucrou:</p>
            <p className={`text-[#0066FF] font-black ${isTVMode ? 'text-3xl' : 'text-xl sm:text-2xl'}`}>
              R$ {roiMultiplo.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafegoROICard;
