import { Progress } from "@/components/ui/progress";
import { METAS_TRAFEGO, formatarMoeda, formatarNumero } from "@/utils/trafegoMetricsCalculator";
import { getDiasRestantesNoMes } from "@/utils/dateFilters";

interface TrafegoMetaBarsProps {
  investimentoAtual: number;
  leadsAtual: number;
  cacAtual: number;
  isTVMode?: boolean;
}

const TrafegoMetaBars = ({ 
  investimentoAtual, 
  leadsAtual, 
  cacAtual,
  isTVMode = false 
}: TrafegoMetaBarsProps) => {
  
  const percentualInvestimento = (investimentoAtual / METAS_TRAFEGO.investimentoMensal) * 100;
  const percentualLeads = (leadsAtual / METAS_TRAFEGO.leadsGerados) * 100;
  const cacDentroMeta = cacAtual <= METAS_TRAFEGO.cacMaximo;
  const percentualCac = cacAtual > 0 ? Math.min((cacAtual / METAS_TRAFEGO.cacMaximo) * 100, 150) : 0;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-[#00E5CC]';
    if (percentage >= 80) return 'bg-[#FFB800]';
    return 'bg-[#FF4757]';
  };

  const diasRestantes = getDiasRestantesNoMes();
  const saldoDisponivel = METAS_TRAFEGO.investimentoMensal - investimentoAtual;
  const leadsFaltando = METAS_TRAFEGO.leadsGerados - leadsAtual;

  return (
    <div className={`space-y-6 ${isTVMode ? 'space-y-8' : ''}`}>
      {/* Meta de Investimento */}
      <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-8' : 'p-6'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-white font-bold ${isTVMode ? 'text-2xl' : 'text-lg'}`}>
            💰 Meta de Investimento - {formatarMoeda(METAS_TRAFEGO.investimentoMensal)}
          </h3>
          <span className={`font-bold ${percentualInvestimento >= 100 ? 'text-[#00E5CC]' : percentualInvestimento >= 80 ? 'text-[#FFB800]' : 'text-[#FF4757]'} ${isTVMode ? 'text-3xl' : 'text-xl'}`}>
            {percentualInvestimento.toFixed(0)}%
          </span>
        </div>
        
        <div className={`relative ${isTVMode ? 'h-12' : 'h-8'} bg-[#0B1120] rounded-full overflow-hidden`}>
          <div 
            className={`absolute h-full rounded-full transition-all duration-1000 ${getProgressColor(percentualInvestimento)}`}
            style={{ width: `${Math.min(percentualInvestimento, 100)}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-white font-bold ${isTVMode ? 'text-xl' : 'text-sm'}`}>
              {formatarMoeda(investimentoAtual)}
            </span>
          </div>
        </div>
        
        <p className={`text-[#94A3B8] mt-3 ${isTVMode ? 'text-lg' : 'text-sm'}`}>
          Saldo disponível: <span className="text-[#00E5CC] font-semibold">{formatarMoeda(saldoDisponivel)}</span> | {diasRestantes} dias restantes
        </p>
      </div>

      {/* Meta de Leads */}
      <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-8' : 'p-6'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-white font-bold ${isTVMode ? 'text-2xl' : 'text-lg'}`}>
            📊 Meta de Leads - {formatarNumero(METAS_TRAFEGO.leadsGerados)} leads
          </h3>
          <span className={`font-bold ${percentualLeads >= 100 ? 'text-[#00E5CC]' : percentualLeads >= 80 ? 'text-[#FFB800]' : 'text-[#FF4757]'} ${isTVMode ? 'text-3xl' : 'text-xl'}`}>
            {percentualLeads.toFixed(0)}%
          </span>
        </div>
        
        <div className={`relative ${isTVMode ? 'h-12' : 'h-8'} bg-[#0B1120] rounded-full overflow-hidden`}>
          <div 
            className={`absolute h-full rounded-full transition-all duration-1000 ${getProgressColor(percentualLeads)}`}
            style={{ width: `${Math.min(percentualLeads, 100)}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-white font-bold ${isTVMode ? 'text-xl' : 'text-sm'}`}>
              {formatarNumero(leadsAtual)} leads
            </span>
          </div>
        </div>
        
        <p className={`text-[#94A3B8] mt-3 ${isTVMode ? 'text-lg' : 'text-sm'}`}>
          {leadsFaltando > 0 ? (
            <>Faltam <span className="text-[#FFB800] font-semibold">{formatarNumero(leadsFaltando)} leads</span> para a meta! 🎯</>
          ) : (
            <span className="text-[#00E5CC] font-semibold">Meta atingida! 🎉</span>
          )}
        </p>
      </div>

      {/* Meta de CAC */}
      <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-8' : 'p-6'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-white font-bold ${isTVMode ? 'text-2xl' : 'text-lg'}`}>
            💵 Meta de CAC - Máx. {formatarMoeda(METAS_TRAFEGO.cacMaximo)}
          </h3>
          <span className={`font-bold ${cacDentroMeta ? 'text-[#00E5CC]' : 'text-[#FF4757]'} ${isTVMode ? 'text-3xl' : 'text-xl'}`}>
            {cacDentroMeta ? '✅' : '⚠️'}
          </span>
        </div>
        
        <div className={`relative ${isTVMode ? 'h-12' : 'h-8'} bg-[#0B1120] rounded-full overflow-hidden`}>
          <div 
            className={`absolute h-full rounded-full transition-all duration-1000 ${cacDentroMeta ? 'bg-[#00E5CC]' : 'bg-[#FF4757]'}`}
            style={{ width: `${Math.min(percentualCac, 100)}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-white font-bold ${isTVMode ? 'text-xl' : 'text-sm'}`}>
              CAC atual: {formatarMoeda(cacAtual)}
            </span>
          </div>
        </div>
        
        <p className={`text-[#94A3B8] mt-3 ${isTVMode ? 'text-lg' : 'text-sm'}`}>
          {cacDentroMeta ? (
            <span className="text-[#00E5CC] font-semibold">
              {((1 - cacAtual / METAS_TRAFEGO.cacMaximo) * 100).toFixed(0)}% abaixo da meta! 🎉
            </span>
          ) : (
            <span className="text-[#FF4757] font-semibold">
              {((cacAtual / METAS_TRAFEGO.cacMaximo - 1) * 100).toFixed(0)}% acima da meta! ⚠️
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default TrafegoMetaBars;
