import { Link2, Users, Target } from "lucide-react";
import { formatarMoeda, formatarMoedaCompacta, CORES_CANAIS } from "@/utils/trafegoMetricsCalculator";

interface TrafegoComercialProps {
  isTVMode?: boolean;
}

const TrafegoComercial = ({ isTVMode = false }: TrafegoComercialProps) => {
  // Mock data for squad conversion
  const squadData = {
    hotDogs: {
      nome: 'Hot Dogs 🌭',
      cor: '#FF4757',
      canais: [
        { canal: 'Facebook', vendas: 6, valor: 72000 },
        { canal: 'Google', vendas: 4, valor: 52000 },
        { canal: 'LinkedIn', vendas: 2, valor: 28000 }
      ]
    },
    corvoAzul: {
      nome: 'Corvo Azul 🦅',
      cor: '#0066FF',
      canais: [
        { canal: 'Facebook', vendas: 4, valor: 56000 },
        { canal: 'Google', vendas: 6, valor: 88000 },
        { canal: 'Instagram', vendas: 3, valor: 39000 }
      ]
    }
  };

  // Mock data for detailed breakdown
  const detailData = [
    { campanha: 'Google Search', leads: 98, sdr: 'Vinícius', sdrLeads: 45, closer: 'G. Fernandes', contratos: 4, valor: 52000 },
    { campanha: 'Google Search', leads: 98, sdr: 'Marcos', sdrLeads: 23, closer: 'Bruno', contratos: 4, valor: 36000 },
    { campanha: 'Campanha Webinar', leads: 142, sdr: 'Vinícius', sdrLeads: 58, closer: 'G. Franklin', contratos: 3, valor: 42000 },
    { campanha: 'LinkedIn B2B', leads: 76, sdr: 'Tiago', sdrLeads: 34, closer: 'G. Fernandes', contratos: 3, valor: 38500 },
    { campanha: 'Instagram Reels', leads: 187, sdr: 'Marcos', sdrLeads: 92, closer: 'Bruno', contratos: 2, valor: 12600 },
    { campanha: 'YouTube Pre-Roll', leads: 45, sdr: 'Andrey', sdrLeads: 21, closer: 'G. Franklin', contratos: 1, valor: 6300 }
  ];

  const getTotalForSquad = (squad: typeof squadData.hotDogs) => {
    return squad.canais.reduce((acc, c) => ({
      vendas: acc.vendas + c.vendas,
      valor: acc.valor + c.valor
    }), { vendas: 0, valor: 0 });
  };

  const hotDogsTotal = getTotalForSquad(squadData.hotDogs);
  const corvoAzulTotal = getTotalForSquad(squadData.corvoAzul);

  // Insights
  const insights = [
    { emoji: '🏆', text: 'Squad Corvo Azul converte melhor leads de Google!' },
    { emoji: '💡', text: 'Squad Hot Dogs se destaca com Facebook Ads!' }
  ];

  return (
    <div className={`space-y-8`}>
      {/* Overview por Squad */}
      <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-10' : 'p-6'}`}>
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-[#00E5CC]/20 rounded-xl p-3">
            <Link2 className={`text-[#00E5CC] ${isTVMode ? 'w-10 h-10' : 'w-8 h-8'}`} />
          </div>
          <div>
            <h3 className={`text-white font-black ${isTVMode ? 'text-3xl' : 'text-2xl'}`}>
              🔗 Conexão: Tráfego → Comercial
            </h3>
            <p className={`text-[#94A3B8] ${isTVMode ? 'text-lg' : 'text-sm'}`}>
              Leads por Origem convertidos em Vendas
            </p>
          </div>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 ${isTVMode ? 'gap-8' : 'gap-6'}`}>
          {/* Hot Dogs */}
          <div className={`bg-[#0B1120] rounded-xl border-l-4 ${isTVMode ? 'p-6' : 'p-4'}`} style={{ borderColor: squadData.hotDogs.cor }}>
            <h4 className={`text-white font-bold mb-4 ${isTVMode ? 'text-2xl' : 'text-xl'}`}>
              {squadData.hotDogs.nome}
            </h4>
            
            <div className="space-y-3">
              {squadData.hotDogs.canais.map((canal, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CORES_CANAIS[canal.canal] }}
                    />
                    <span className={`text-[#94A3B8] ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                      {canal.canal} Ads:
                    </span>
                  </div>
                  <span className={`text-white font-semibold ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                    {canal.vendas} vendas ({formatarMoedaCompacta(canal.valor)})
                  </span>
                </div>
              ))}
            </div>

            <div className={`mt-4 pt-4 border-t border-white/10`}>
              <div className="flex justify-between items-center">
                <span className={`text-[#94A3B8] font-semibold ${isTVMode ? 'text-lg' : 'text-sm'}`}>Total:</span>
                <span className={`text-white font-black ${isTVMode ? 'text-2xl' : 'text-xl'}`}>
                  {hotDogsTotal.vendas} vendas | {formatarMoedaCompacta(hotDogsTotal.valor)}
                </span>
              </div>
            </div>
          </div>

          {/* Corvo Azul */}
          <div className={`bg-[#0B1120] rounded-xl border-l-4 ${isTVMode ? 'p-6' : 'p-4'}`} style={{ borderColor: squadData.corvoAzul.cor }}>
            <h4 className={`text-white font-bold mb-4 ${isTVMode ? 'text-2xl' : 'text-xl'}`}>
              {squadData.corvoAzul.nome}
            </h4>
            
            <div className="space-y-3">
              {squadData.corvoAzul.canais.map((canal, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CORES_CANAIS[canal.canal] }}
                    />
                    <span className={`text-[#94A3B8] ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                      {canal.canal} Ads:
                    </span>
                  </div>
                  <span className={`text-white font-semibold ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                    {canal.vendas} vendas ({formatarMoedaCompacta(canal.valor)})
                  </span>
                </div>
              ))}
            </div>

            <div className={`mt-4 pt-4 border-t border-white/10`}>
              <div className="flex justify-between items-center">
                <span className={`text-[#94A3B8] font-semibold ${isTVMode ? 'text-lg' : 'text-sm'}`}>Total:</span>
                <span className={`text-white font-black ${isTVMode ? 'text-2xl' : 'text-xl'}`}>
                  {corvoAzulTotal.vendas} vendas | {formatarMoedaCompacta(corvoAzulTotal.valor)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className={`mt-6 flex flex-wrap gap-4`}>
          {insights.map((insight, i) => (
            <div key={i} className={`bg-[#0066FF]/10 rounded-lg px-4 py-2 border border-[#0066FF]/30`}>
              <span className={`text-[#00E5CC] ${isTVMode ? 'text-lg' : 'text-sm'}`}>
                {insight.emoji} {insight.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabela Detalhada */}
      <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-10' : 'p-6'}`}>
        <h4 className={`text-white font-bold mb-6 ${isTVMode ? 'text-2xl' : 'text-xl'}`}>
          📊 Leads por Campanha → SDR → Closer
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className={`text-left text-[#94A3B8] font-semibold uppercase tracking-wider ${isTVMode ? 'py-4 px-4 text-base' : 'py-3 px-3 text-xs'}`}>
                  Campanha
                </th>
                <th className={`text-center text-[#94A3B8] font-semibold uppercase tracking-wider ${isTVMode ? 'py-4 px-4 text-base' : 'py-3 px-3 text-xs'}`}>
                  Leads
                </th>
                <th className={`text-left text-[#94A3B8] font-semibold uppercase tracking-wider ${isTVMode ? 'py-4 px-4 text-base' : 'py-3 px-3 text-xs'}`}>
                  SDR
                </th>
                <th className={`text-center text-[#94A3B8] font-semibold uppercase tracking-wider ${isTVMode ? 'py-4 px-4 text-base' : 'py-3 px-3 text-xs'}`}>
                  Qualificou
                </th>
                <th className={`text-left text-[#94A3B8] font-semibold uppercase tracking-wider ${isTVMode ? 'py-4 px-4 text-base' : 'py-3 px-3 text-xs'}`}>
                  Closer
                </th>
                <th className={`text-center text-[#94A3B8] font-semibold uppercase tracking-wider ${isTVMode ? 'py-4 px-4 text-base' : 'py-3 px-3 text-xs'}`}>
                  Contratos
                </th>
                <th className={`text-right text-[#94A3B8] font-semibold uppercase tracking-wider ${isTVMode ? 'py-4 px-4 text-base' : 'py-3 px-3 text-xs'}`}>
                  Valor
                </th>
              </tr>
            </thead>
            <tbody>
              {detailData.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className={`text-white font-medium ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`}>
                    {row.campanha}
                  </td>
                  <td className={`text-center text-[#94A3B8] ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`}>
                    {row.leads}
                  </td>
                  <td className={`text-white ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`}>
                    {row.sdr}
                  </td>
                  <td className={`text-center text-[#00E5CC] ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`}>
                    {row.sdrLeads}
                  </td>
                  <td className={`text-white ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`}>
                    {row.closer}
                  </td>
                  <td className={`text-center text-[#FFB800] font-bold ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`}>
                    {row.contratos}
                  </td>
                  <td className={`text-right text-[#10B981] font-bold ${isTVMode ? 'py-4 px-4 text-lg' : 'py-3 px-3 text-sm'}`}>
                    {formatarMoedaCompacta(row.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrafegoComercial;
