import { Card } from '@/components/ui/card';
import { formatarReal } from '@/utils/financialMetricsCalculator';

interface SquadsHistoricoProps {
  historico: {
    semanaAtual: { lider: string; placar: string; diferenca: number };
    mesAtual: { lider: string; placar: string; diferenca: number };
    ultimosMeses: Array<{ mes: string; vencedor: string }>;
    totalVitoriasHotDogs: number;
    totalVitoriasCorvoAzul: number;
    empates: number;
  };
  isTVMode: boolean;
}

export const SquadsHistorico = ({ historico, isTVMode }: SquadsHistoricoProps) => {
  return (
    <div className="max-w-[1600px] mx-auto">
      <h2 className={`text-white font-black text-center mb-12 ${
        isTVMode ? 'text-5xl' : 'text-4xl'
      }`}>
        Placar Histórico
      </h2>
      
      {/* GRID 3 COLUNAS: SEMANA | MÊS | TOTAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
        {/* SEMANA ATUAL */}
        <Card className="bg-[#151E35] p-6 md:p-8 text-center">
          <h3 className={`text-white font-bold mb-4 ${isTVMode ? 'text-2xl' : 'text-xl'}`}>
            Esta Semana
          </h3>
          <div className={`mb-4 ${isTVMode ? 'text-6xl' : 'text-5xl'}`}>
            {historico.semanaAtual.lider === 'Hot Dogs' ? '🔴' :
             historico.semanaAtual.lider === 'Corvo Azul' ? '🔵' : '⚔️'}
          </div>
          <p className={`text-white font-black mb-2 ${isTVMode ? 'text-4xl' : 'text-3xl'}`}>
            {historico.semanaAtual.placar}
          </p>
          <p className={`text-[#94A3B8] mb-2 ${isTVMode ? 'text-xl' : 'text-base'}`}>
            Líder: {historico.semanaAtual.lider}
          </p>
          <p className={`text-[#FFB800] font-bold ${isTVMode ? 'text-xl' : 'text-base'}`}>
            {formatarReal(historico.semanaAtual.diferenca)} de vantagem
          </p>
        </Card>
        
        {/* MÊS ATUAL */}
        <Card className="bg-[#151E35] p-6 md:p-8 text-center border-2 border-[#FFB800]">
          <h3 className={`text-white font-bold mb-4 ${isTVMode ? 'text-2xl' : 'text-xl'}`}>
            Este Mês
          </h3>
          <div className={`mb-4 ${isTVMode ? 'text-6xl' : 'text-5xl'}`}>
            {historico.mesAtual.lider === 'Hot Dogs' ? '🔴' :
             historico.mesAtual.lider === 'Corvo Azul' ? '🔵' : '⚔️'}
          </div>
          <p className={`text-white font-black mb-2 ${isTVMode ? 'text-4xl' : 'text-3xl'}`}>
            {historico.mesAtual.placar}
          </p>
          <p className={`text-[#94A3B8] mb-2 ${isTVMode ? 'text-xl' : 'text-base'}`}>
            Líder: {historico.mesAtual.lider}
          </p>
          <p className={`text-[#FFB800] font-bold ${isTVMode ? 'text-xl' : 'text-base'}`}>
            {formatarReal(historico.mesAtual.diferenca)} de vantagem
          </p>
        </Card>
        
        {/* HISTÓRICO TOTAL */}
        <Card className="bg-[#151E35] p-6 md:p-8 text-center">
          <h3 className={`text-white font-bold mb-4 ${isTVMode ? 'text-2xl' : 'text-xl'}`}>
            Histórico Total
          </h3>
          <div className="space-y-4">
            <div>
              <p className={`text-[#FF4757] font-black ${isTVMode ? 'text-4xl' : 'text-3xl'}`}>
                {historico.totalVitoriasHotDogs}
              </p>
              <p className={`text-[#94A3B8] ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                Vitórias Hot Dogs 🔴
              </p>
            </div>
            <div>
              <p className={`text-[#0066FF] font-black ${isTVMode ? 'text-4xl' : 'text-3xl'}`}>
                {historico.totalVitoriasCorvoAzul}
              </p>
              <p className={`text-[#94A3B8] ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                Vitórias Corvo Azul 🔵
              </p>
            </div>
            {historico.empates > 0 && (
              <div>
                <p className={`text-[#FFB800] font-black ${isTVMode ? 'text-4xl' : 'text-3xl'}`}>
                  {historico.empates}
                </p>
                <p className={`text-[#94A3B8] ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                  Empates ⚔️
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* TIMELINE DE CAMPEÕES */}
      <Card className="bg-[#151E35] p-6 md:p-8">
        <h3 className={`text-white font-bold text-center mb-6 ${
          isTVMode ? 'text-2xl' : 'text-xl'
        }`}>
          Timeline de Campeões
        </h3>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {historico.ultimosMeses.map((item, idx) => (
            <div key={idx} className="text-center">
              <div className={`mb-2 ${isTVMode ? 'text-5xl' : 'text-4xl'}`}>
                {item.vencedor === 'Hot Dogs' ? '🔴' : '🔵'}
              </div>
              <p className={`text-white font-semibold ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                {item.mes}
              </p>
              <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-xs'}`}>
                {item.vencedor}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
