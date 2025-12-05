import { TrendingUp, AlertTriangle, Lightbulb, Rocket, Target } from "lucide-react";
import { TrafegoTotais, METAS_TRAFEGO, formatarMoeda, formatarMoedaCompacta, formatarNumero } from "@/utils/trafegoMetricsCalculator";

interface TrafegoProjecoesProps {
  totais: TrafegoTotais;
  isTVMode?: boolean;
}

const TrafegoProjecoes = ({ totais, isTVMode = false }: TrafegoProjecoesProps) => {
  // Mock: assume we're at 78% of the month
  const percentualMes = 78;
  const diasRestantes = 7;
  
  // Projections based on current performance
  const taxaCrescimento = 1 / (percentualMes / 100);
  const investimentoProjetado = totais.investimento * taxaCrescimento;
  const leadsProjetados = Math.round(totais.leads * taxaCrescimento);
  const fechamentosProjetados = Math.round(totais.fechamentos * taxaCrescimento);
  const receitaProjetada = totais.receita * taxaCrescimento;
  const roasProjetado = investimentoProjetado > 0 ? receitaProjetada / investimentoProjetado : 0;
  const cacProjetado = fechamentosProjetados > 0 ? investimentoProjetado / fechamentosProjetados : 0;
  
  // Status calculations
  const investimentoStatus = investimentoProjetado <= METAS_TRAFEGO.investimentoMensal ? 'ok' : 'atencao';
  const leadsStatus = leadsProjetados >= METAS_TRAFEGO.leadsGerados ? 'ok' : leadsProjetados >= METAS_TRAFEGO.leadsGerados * 0.9 ? 'atencao' : 'alerta';
  const cacStatus = cacProjetado <= METAS_TRAFEGO.cacMaximo ? 'ok' : 'alerta';
  
  const leadsFaltantes = METAS_TRAFEGO.leadsGerados - leadsProjetados;
  const budgetExtraNecessario = leadsFaltantes > 0 ? leadsFaltantes * totais.cpl : 0;

  // Alerts
  const alertas = {
    urgente: [
      {
        titulo: 'YouTube Pre-Roll: ROAS 2.1x (muito baixo)',
        recomendacao: 'Pausar e realocar budget',
        economia: 1500
      }
    ],
    atencao: [
      {
        titulo: 'Instagram Reels: CAC R$ 1.456 (acima da média)',
        recomendacao: 'Otimizar landing page',
        potencial: '20-30% redução de CAC'
      },
      {
        titulo: 'Remarketing: 0 fechamentos em 2 semanas',
        recomendacao: 'Revisar segmentação e criativos'
      }
    ],
    oportunidades: [
      {
        titulo: 'Google Search: ROAS 9.1x (excelente!)',
        recomendacao: 'Aumentar budget em 30%',
        potencial: '+R$ 32k/mês em receita'
      },
      {
        titulo: 'Facebook Webinar: Alta qualificação (63%)',
        recomendacao: 'Criar campanhas similares'
      }
    ]
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'ok') return <span className="text-[#10B981]">✅</span>;
    if (status === 'atencao') return <span className="text-[#FBBF24]">🟡</span>;
    return <span className="text-[#EF4444]">🔴</span>;
  };

  return (
    <div className={`space-y-8`}>
      {/* Projeções */}
      <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-10' : 'p-6'}`}>
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-[#0066FF]/20 rounded-xl p-3">
            <TrendingUp className={`text-[#0066FF] ${isTVMode ? 'w-10 h-10' : 'w-8 h-8'}`} />
          </div>
          <div>
            <h3 className={`text-white font-black ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
              🔮 Projeções para Fim do Mês
            </h3>
            <p className={`text-[#94A3B8] ${isTVMode ? 'text-lg' : 'text-sm'}`}>
              Baseado na performance atual ({percentualMes}% do mês)
            </p>
          </div>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${isTVMode ? 'gap-6' : 'gap-4'}`}>
          {/* Investimento */}
          <div className={`bg-[#0B1120] rounded-xl ${isTVMode ? 'p-6' : 'p-4'}`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-[#94A3B8] font-semibold ${isTVMode ? 'text-base' : 'text-sm'}`}>
                📈 Investimento Total
              </p>
              <StatusIcon status={investimentoStatus} />
            </div>
            <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-sm'}`}>
              {formatarMoedaCompacta(totais.investimento)} (atual) → <span className="text-white font-bold">{formatarMoedaCompacta(investimentoProjetado)}</span> (projetado)
            </p>
            <p className={`${investimentoStatus === 'ok' ? 'text-[#10B981]' : 'text-[#FBBF24]'} ${isTVMode ? 'text-base' : 'text-sm'} mt-2`}>
              {investimentoStatus === 'ok' ? '✅ Dentro do orçamento' : '⚠️ Atenção ao budget'}
            </p>
          </div>

          {/* Leads */}
          <div className={`bg-[#0B1120] rounded-xl ${isTVMode ? 'p-6' : 'p-4'}`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-[#94A3B8] font-semibold ${isTVMode ? 'text-base' : 'text-sm'}`}>
                📊 Leads Gerados
              </p>
              <StatusIcon status={leadsStatus} />
            </div>
            <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-sm'}`}>
              {formatarNumero(totais.leads)} (atual) → <span className="text-white font-bold">{formatarNumero(leadsProjetados)}</span> (projetado)
            </p>
            <p className={`${leadsStatus === 'ok' ? 'text-[#10B981]' : leadsStatus === 'atencao' ? 'text-[#FBBF24]' : 'text-[#EF4444]'} ${isTVMode ? 'text-base' : 'text-sm'} mt-2`}>
              {leadsStatus === 'ok' 
                ? '✅ Meta será atingida' 
                : `⚠️ Abaixo da meta (${METAS_TRAFEGO.leadsGerados})`}
            </p>
            {leadsStatus !== 'ok' && budgetExtraNecessario > 0 && (
              <p className={`text-[#94A3B8] ${isTVMode ? 'text-sm' : 'text-xs'} mt-1`}>
                💡 Aumentar budget em ~{formatarMoedaCompacta(budgetExtraNecessario)} para atingir meta
              </p>
            )}
          </div>

          {/* Fechamentos */}
          <div className={`bg-[#0B1120] rounded-xl ${isTVMode ? 'p-6' : 'p-4'}`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-[#94A3B8] font-semibold ${isTVMode ? 'text-base' : 'text-sm'}`}>
                🎯 Fechamentos
              </p>
              <span className="text-[#10B981]">✅</span>
            </div>
            <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-sm'}`}>
              {totais.fechamentos} (atual) → <span className="text-white font-bold">{fechamentosProjetados}-{fechamentosProjetados + 2}</span> (projetado)
            </p>
            <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-sm'} mt-2`}>
              Receita estimada: <span className="text-[#00E5CC] font-bold">{formatarMoedaCompacta(receitaProjetada)}</span>
            </p>
          </div>

          {/* ROAS */}
          <div className={`bg-[#0B1120] rounded-xl ${isTVMode ? 'p-6' : 'p-4'}`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-[#94A3B8] font-semibold ${isTVMode ? 'text-base' : 'text-sm'}`}>
                💰 ROAS Final
              </p>
              <span className="text-[#10B981]">✅</span>
            </div>
            <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-sm'}`}>
              {totais.roas.toFixed(2)}x (atual) → <span className="text-white font-bold">{(roasProjetado * 0.98).toFixed(1)}-{(roasProjetado * 1.02).toFixed(1)}x</span>
            </p>
            <p className={`text-[#10B981] ${isTVMode ? 'text-base' : 'text-sm'} mt-2`}>
              ✅ Mantendo excelência
            </p>
          </div>

          {/* CAC */}
          <div className={`bg-[#0B1120] rounded-xl ${isTVMode ? 'p-6' : 'p-4'}`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-[#94A3B8] font-semibold ${isTVMode ? 'text-base' : 'text-sm'}`}>
                💵 CAC Final
              </p>
              <StatusIcon status={cacStatus} />
            </div>
            <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-sm'}`}>
              {formatarMoeda(totais.cac)} (atual) → <span className="text-white font-bold">{formatarMoeda(cacProjetado * 0.95)}-{formatarMoeda(cacProjetado * 1.05)}</span>
            </p>
            <p className={`${cacStatus === 'ok' ? 'text-[#10B981]' : 'text-[#EF4444]'} ${isTVMode ? 'text-base' : 'text-sm'} mt-2`}>
              {cacStatus === 'ok' ? `✅ Abaixo da meta (${formatarMoeda(METAS_TRAFEGO.cacMaximo)})` : '⚠️ Acima da meta'}
            </p>
          </div>

          {/* Conclusão */}
          <div className={`bg-gradient-to-br from-[#00E5CC]/20 to-[#0066FF]/10 rounded-xl border border-[#00E5CC]/30 ${isTVMode ? 'p-6' : 'p-4'}`}>
            <div className="flex items-center gap-3 mb-3">
              <Rocket className={`text-[#00E5CC] ${isTVMode ? 'w-8 h-8' : 'w-6 h-6'}`} />
              <p className={`text-white font-bold ${isTVMode ? 'text-lg' : 'text-base'}`}>
                🎉 CONCLUSÃO
              </p>
            </div>
            <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-sm'}`}>
              Mês excelente! Considere aumentar investimento nas campanhas <span className="text-[#00E5CC] font-semibold">Google</span> e <span className="text-[#00E5CC] font-semibold">Facebook</span> para máximo retorno.
            </p>
          </div>
        </div>
      </div>

      {/* Alertas */}
      <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-10' : 'p-6'}`}>
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-[#FFB800]/20 rounded-xl p-3">
            <AlertTriangle className={`text-[#FFB800] ${isTVMode ? 'w-10 h-10' : 'w-8 h-8'}`} />
          </div>
          <h3 className={`text-white font-black ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
            ⚠️ Alertas e Ações Recomendadas
          </h3>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-3 ${isTVMode ? 'gap-6' : 'gap-4'}`}>
          {/* Urgente */}
          <div className={`bg-[#EF4444]/10 rounded-xl border border-[#EF4444]/30 ${isTVMode ? 'p-6' : 'p-4'}`}>
            <h4 className={`text-[#EF4444] font-bold mb-4 ${isTVMode ? 'text-xl' : 'text-lg'}`}>
              🔴 ATENÇÃO URGENTE
            </h4>
            {alertas.urgente.map((alerta, i) => (
              <div key={i} className={`${i > 0 ? 'mt-4 pt-4 border-t border-[#EF4444]/20' : ''}`}>
                <p className={`text-white font-semibold ${isTVMode ? 'text-base' : 'text-sm'}`}>
                  {alerta.titulo}
                </p>
                <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-sm'} mt-1`}>
                  → Recomendação: {alerta.recomendacao}
                </p>
                {alerta.economia && (
                  <p className={`text-[#10B981] ${isTVMode ? 'text-base' : 'text-sm'} mt-1`}>
                    → Economia potencial: {formatarMoedaCompacta(alerta.economia)}/semana
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Atenção */}
          <div className={`bg-[#FBBF24]/10 rounded-xl border border-[#FBBF24]/30 ${isTVMode ? 'p-6' : 'p-4'}`}>
            <h4 className={`text-[#FBBF24] font-bold mb-4 ${isTVMode ? 'text-xl' : 'text-lg'}`}>
              🟡 ATENÇÃO
            </h4>
            {alertas.atencao.map((alerta, i) => (
              <div key={i} className={`${i > 0 ? 'mt-4 pt-4 border-t border-[#FBBF24]/20' : ''}`}>
                <p className={`text-white font-semibold ${isTVMode ? 'text-base' : 'text-sm'}`}>
                  {alerta.titulo}
                </p>
                <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-sm'} mt-1`}>
                  → Recomendação: {alerta.recomendacao}
                </p>
                {alerta.potencial && (
                  <p className={`text-[#10B981] ${isTVMode ? 'text-base' : 'text-sm'} mt-1`}>
                    → Potencial: {alerta.potencial}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Oportunidades */}
          <div className={`bg-[#10B981]/10 rounded-xl border border-[#10B981]/30 ${isTVMode ? 'p-6' : 'p-4'}`}>
            <h4 className={`text-[#10B981] font-bold mb-4 ${isTVMode ? 'text-xl' : 'text-lg'}`}>
              🟢 OPORTUNIDADES
            </h4>
            {alertas.oportunidades.map((alerta, i) => (
              <div key={i} className={`${i > 0 ? 'mt-4 pt-4 border-t border-[#10B981]/20' : ''}`}>
                <p className={`text-white font-semibold ${isTVMode ? 'text-base' : 'text-sm'}`}>
                  {alerta.titulo}
                </p>
                <p className={`text-[#94A3B8] ${isTVMode ? 'text-base' : 'text-sm'} mt-1`}>
                  → Recomendação: {alerta.recomendacao}
                </p>
                {alerta.potencial && (
                  <p className={`text-[#00E5CC] ${isTVMode ? 'text-base' : 'text-sm'} mt-1`}>
                    → Potencial: {alerta.potencial}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafegoProjecoes;
