import { formatarReal, FinancialMetrics } from '@/utils/financialMetricsCalculator';
import { ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
  metricas: FinancialMetrics;
  isTVMode: boolean;
}

const FinancialFunnel = ({ metricas, isTVMode }: Props) => {
  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      {/* Etapa 1: Receita Total */}
      <div className="relative">
        <div className="bg-[#0066FF] rounded-2xl p-4 sm:p-6 md:p-8 text-white" style={{ width: '100%' }}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-wider opacity-90 font-semibold">Receita Total</p>
              <p className={`font-black ${isTVMode ? 'text-2xl sm:text-3xl' : 'text-2xl sm:text-3xl md:text-4xl'}`}>{formatarReal(metricas.receitas.total)}</p>
            </div>
            <div className="text-right">
              <p className={`font-bold ${isTVMode ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}`}>100%</p>
              <p className="text-xs sm:text-sm opacity-90">{metricas.contratos.total} contratos</p>
            </div>
          </div>
        </div>
        
        {/* Seta + Label de conversão */}
        <div className="flex flex-col items-center my-4">
          <ArrowDown className={`text-[#0066FF] animate-bounce w-6 h-6 md:w-8 md:h-8`} />
          <div className="bg-[#0066FF]/10 px-4 py-2 rounded-full mt-2">
            <p className="text-[#0066FF] font-semibold text-sm">
              {metricas.receitas.taxaAssinatura.toFixed(1)}% assinados
            </p>
            <p className="text-xs text-[#64748B]">
              Gap: {formatarReal(metricas.receitas.gapAssinatura)}
            </p>
          </div>
        </div>
      </div>

      {/* Etapa 2: Receita Assinada */}
      <div className="relative mx-auto" style={{ width: '90%' }}>
        <div className="bg-gradient-to-r from-[#0066FF] to-[#00BFFF] rounded-2xl p-4 sm:p-6 md:p-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-wider opacity-90 font-semibold">Receita Assinada</p>
              <p className={`font-black ${isTVMode ? 'text-2xl sm:text-3xl' : 'text-2xl sm:text-3xl md:text-4xl'}`}>{formatarReal(metricas.receitas.assinada)}</p>
            </div>
            <div className="text-right">
              <p className={`font-bold ${isTVMode ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}`}>{metricas.receitas.taxaAssinatura.toFixed(1)}%</p>
              <p className="text-xs sm:text-sm opacity-90">{metricas.contratos.assinados} contratos</p>
            </div>
          </div>
        </div>
        
        {/* Seta + Label */}
        <div className="flex flex-col items-center my-4">
          <ArrowDown className={`text-[#00E5CC] animate-bounce w-6 h-6 md:w-8 md:h-8`} />
          <div className="bg-[#00E5CC]/10 px-4 py-2 rounded-full mt-2">
            <p className="text-[#00E5CC] font-semibold text-sm">
              {metricas.receitas.taxaPagamento.toFixed(1)}% pagos
            </p>
            <p className="text-xs text-[#64748B]">
              Gap: {formatarReal(metricas.receitas.gapPagamento)}
            </p>
          </div>
        </div>
      </div>

      {/* Etapa 3: Receita Paga */}
      <div className="relative mx-auto" style={{ width: '80%' }}>
        <div className="bg-[#00E5CC] rounded-2xl p-4 sm:p-6 md:p-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-wider opacity-90 font-semibold">Receita Paga</p>
              <p className={`font-black ${isTVMode ? 'text-2xl sm:text-3xl' : 'text-2xl sm:text-3xl md:text-4xl'}`}>{formatarReal(metricas.receitas.paga)}</p>
            </div>
            <div className="text-right">
              <p className={`font-bold ${isTVMode ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}`}>{metricas.receitas.taxaRecebimentoTotal.toFixed(1)}%</p>
              <p className="text-xs sm:text-sm opacity-90">{metricas.contratos.pagos} contratos</p>
            </div>
          </div>
          <div className="mt-4">
            <Badge className={metricas.receitas.taxaRecebimentoTotal >= 90 ? 'bg-green-500' : 'bg-yellow-500'}>
              {metricas.receitas.taxaRecebimentoTotal >= 90 ? '✅ Meta Atingida' : '⚠️ Meta: 90%'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialFunnel;
