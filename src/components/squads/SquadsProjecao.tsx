import { Card } from '@/components/ui/card';
import { formatarReal } from '@/utils/financialMetricsCalculator';
import { Progress } from '@/components/ui/progress';

interface SquadsProjecaoProps {
  projecao: {
    hotDogs: {
      projecaoFinal: number;
      vaiAcertarMeta: boolean;
      mediaDiaria: number;
      diasRestantes: number;
    };
    corvoAzul: {
      projecaoFinal: number;
      vaiAcertarMeta: boolean;
      mediaDiaria: number;
      diasRestantes: number;
    };
  };
  isTVMode: boolean;
}

export const SquadsProjecao = ({ projecao, isTVMode }: SquadsProjecaoProps) => {
  const metaReceita = 325000;
  
  const progressoHotDogs = Math.min((projecao.hotDogs.projecaoFinal / metaReceita) * 100, 100);
  const progressoCorvoAzul = Math.min((projecao.corvoAzul.projecaoFinal / metaReceita) * 100, 100);
  
  return (
    <div className="max-w-[1600px] mx-auto">
      <h2 className={`text-white font-black text-center mb-12 ${
        isTVMode ? 'text-5xl' : 'text-4xl'
      }`}>
        Projeções e Cenários
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* CARD 1: PROJEÇÃO FIM DO MÊS */}
        <Card className="bg-white p-6 md:p-8">
          <h3 className={`font-bold text-center mb-6 ${isTVMode ? 'text-2xl' : 'text-xl'}`}>
            Projeção para Fim do Mês
          </h3>
          
          <div className="space-y-8">
            {/* HOT DOGS */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={isTVMode ? 'text-3xl' : 'text-2xl'}>🔴</span>
                  <span className={`font-bold ${isTVMode ? 'text-xl' : 'text-lg'}`}>
                    Hot Dogs
                  </span>
                </div>
                <span className={`font-black text-[#FF4757] ${isTVMode ? 'text-2xl' : 'text-xl'}`}>
                  {formatarReal(projecao.hotDogs.projecaoFinal)}
                </span>
              </div>
              
              <Progress 
                value={progressoHotDogs} 
                className="h-4 mb-2"
                style={{
                  background: '#E5E7EB'
                }}
              />
              
              <div className="flex justify-between text-sm text-[#94A3B8]">
                <span>Meta: {formatarReal(metaReceita)}</span>
                <span>{progressoHotDogs.toFixed(1)}% da meta</span>
              </div>
              
              {projecao.hotDogs.vaiAcertarMeta ? (
                <p className={`text-green-600 font-semibold mt-2 ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                  ✅ Projeção de bater a meta!
                </p>
              ) : (
                <p className={`text-orange-600 font-semibold mt-2 ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                  ⚠️ Abaixo da meta ({formatarReal(metaReceita - projecao.hotDogs.projecaoFinal)} faltando)
                </p>
              )}
              
              <p className={`text-[#64748B] mt-2 ${isTVMode ? 'text-base' : 'text-xs'}`}>
                Média diária: {formatarReal(projecao.hotDogs.mediaDiaria)} • {projecao.hotDogs.diasRestantes} dias restantes
              </p>
            </div>
            
            {/* CORVO AZUL */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={isTVMode ? 'text-3xl' : 'text-2xl'}>🔵</span>
                  <span className={`font-bold ${isTVMode ? 'text-xl' : 'text-lg'}`}>
                    Corvo Azul
                  </span>
                </div>
                <span className={`font-black text-[#0066FF] ${isTVMode ? 'text-2xl' : 'text-xl'}`}>
                  {formatarReal(projecao.corvoAzul.projecaoFinal)}
                </span>
              </div>
              
              <Progress 
                value={progressoCorvoAzul} 
                className="h-4 mb-2"
                style={{
                  background: '#E5E7EB'
                }}
              />
              
              <div className="flex justify-between text-sm text-[#94A3B8]">
                <span>Meta: {formatarReal(metaReceita)}</span>
                <span>{progressoCorvoAzul.toFixed(1)}% da meta</span>
              </div>
              
              {projecao.corvoAzul.vaiAcertarMeta ? (
                <p className={`text-green-600 font-semibold mt-2 ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                  ✅ Projeção de bater a meta!
                </p>
              ) : (
                <p className={`text-orange-600 font-semibold mt-2 ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                  ⚠️ Abaixo da meta ({formatarReal(metaReceita - projecao.corvoAzul.projecaoFinal)} faltando)
                </p>
              )}
              
              <p className={`text-[#64748B] mt-2 ${isTVMode ? 'text-base' : 'text-xs'}`}>
                Média diária: {formatarReal(projecao.corvoAzul.mediaDiaria)} • {projecao.corvoAzul.diasRestantes} dias restantes
              </p>
            </div>
          </div>
        </Card>
        
        {/* CARD 2: CENÁRIOS "E SE..." */}
        <Card className="bg-[#151E35] p-6 md:p-8">
          <h3 className={`text-white font-bold text-center mb-6 ${isTVMode ? 'text-2xl' : 'text-xl'}`}>
            Cenários e Estratégias
          </h3>
          
          <div className="space-y-6">
            {/* Cenário 1 */}
            <div className="bg-white/5 rounded-xl p-4">
              <p className={`text-[#FFB800] font-bold mb-2 ${isTVMode ? 'text-xl' : 'text-base'}`}>
                📊 Mantendo o Ritmo
              </p>
              <p className={`text-white ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                Se Hot Dogs mantiver média de {formatarReal(projecao.hotDogs.mediaDiaria)}/dia, 
                termina com {formatarReal(projecao.hotDogs.projecaoFinal)}
              </p>
            </div>
            
            {/* Cenário 2 */}
            <div className="bg-white/5 rounded-xl p-4">
              <p className={`text-[#00E5CC] font-bold mb-2 ${isTVMode ? 'text-xl' : 'text-base'}`}>
                🎯 Para Virar o Jogo
              </p>
              <p className={`text-white ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                Corvo Azul precisa de {formatarReal((projecao.hotDogs.projecaoFinal - projecao.corvoAzul.projecaoFinal) / projecao.corvoAzul.diasRestantes)} 
                por dia extras para ultrapassar
              </p>
            </div>
            
            {/* Cenário 3 */}
            <div className="bg-white/5 rounded-xl p-4">
              <p className={`text-[#FF4757] font-bold mb-2 ${isTVMode ? 'text-xl' : 'text-base'}`}>
                🏆 Para Bater a Meta
              </p>
              <p className={`text-white ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                {!projecao.hotDogs.vaiAcertarMeta && (
                  <>Hot Dogs precisa de {formatarReal((metaReceita - projecao.hotDogs.projecaoFinal) / projecao.hotDogs.diasRestantes)} extras/dia.</>
                )}
                {!projecao.corvoAzul.vaiAcertarMeta && (
                  <> Corvo Azul precisa de {formatarReal((metaReceita - projecao.corvoAzul.projecaoFinal) / projecao.corvoAzul.diasRestantes)} extras/dia.</>
                )}
                {projecao.hotDogs.vaiAcertarMeta && projecao.corvoAzul.vaiAcertarMeta && (
                  <>Ambos os squads estão no caminho para bater a meta! 🎉</>
                )}
              </p>
            </div>
            
            {/* Cenário 4 */}
            <div className="bg-white/5 rounded-xl p-4">
              <p className={`text-white/80 font-bold mb-2 ${isTVMode ? 'text-xl' : 'text-base'}`}>
                ⚡ Fato Motivacional
              </p>
              <p className={`text-white ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                Faltam {projecao.hotDogs.diasRestantes} dias. Cada contrato pode mudar o placar!
                A diferença ainda pode ser virada.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
