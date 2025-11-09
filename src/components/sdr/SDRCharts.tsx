import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell, ReferenceLine } from 'recharts';
import { SDRMetrics } from '@/utils/sdrMetricsCalculator';
import { formatarReal } from '@/utils/metricsCalculator';

interface SDRChartsProps {
  sdrs: SDRMetrics[];
  metaIndividualCalls: number;
}

const SDRCharts = ({ sdrs, metaIndividualCalls }: SDRChartsProps) => {
  
  const barChartData = [...sdrs]
    .sort((a, b) => b.totalCalls - a.totalCalls)
    .map(sdr => ({
      nome: sdr.nome,
      calls: sdr.totalCalls,
      color: sdr.squadColor
    }));

  const scatterData = sdrs.map(sdr => ({
    nome: sdr.nome,
    calls: sdr.totalCalls,
    taxaShow: sdr.taxaShow,
    vendas: sdr.vendasOriginadas,
    color: sdr.squadColor
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
      
      <div className="bg-[#151E35] rounded-2xl p-4 md:p-8 border border-white/5">
        <h3 className="text-white font-outfit text-xl md:text-2xl font-bold mb-4 md:mb-8">
          📊 Calls por SDR
        </h3>
        <ResponsiveContainer width="100%" height={300} className="md:!h-[400px]">
          <BarChart
            data={barChartData}
            layout="vertical"
            margin={{ top: 20, right: 40, left: 100, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              type="number" 
              stroke="#94A3B8"
              style={{ fontSize: '14px', fontFamily: 'Outfit' }}
            />
            <YAxis 
              type="category" 
              dataKey="nome" 
              stroke="#94A3B8"
              style={{ fontSize: '14px', fontFamily: 'Outfit', fontWeight: 600 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#151E35',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontFamily: 'Outfit'
              }}
              labelStyle={{ color: '#fff', fontWeight: 'bold' }}
              itemStyle={{ color: '#00E5CC' }}
            />
            <ReferenceLine 
              x={metaIndividualCalls} 
              stroke="#FFB800" 
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ 
                value: `Meta: ${metaIndividualCalls}`, 
                position: 'top',
                fill: '#FFB800',
                fontSize: 12,
                fontFamily: 'Outfit',
                fontWeight: 600
              }}
            />
            <Bar dataKey="calls" radius={[0, 8, 8, 0]}>
              {barChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#151E35] rounded-2xl p-4 md:p-8 border border-white/5">
        <h3 className="text-white font-outfit text-xl md:text-2xl font-bold mb-2 md:mb-4">
          🎯 Volume vs Qualidade
        </h3>
        <p className="text-[#94A3B8] text-xs md:text-sm font-outfit mb-4 md:mb-6">
          Tamanho da bolha = receita originada
        </p>
        <ResponsiveContainer width="100%" height={300} className="md:!h-[400px]">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              type="number" 
              dataKey="calls" 
              name="Calls"
              stroke="#94A3B8"
              label={{ 
                value: 'Número de Calls', 
                position: 'bottom',
                fill: '#94A3B8',
                fontSize: 12,
                fontFamily: 'Outfit'
              }}
              style={{ fontSize: '12px', fontFamily: 'Outfit' }}
            />
            <YAxis 
              type="number" 
              dataKey="taxaShow" 
              name="Taxa Show"
              stroke="#94A3B8"
              label={{ 
                value: 'Taxa de Show (%)', 
                angle: -90, 
                position: 'left',
                fill: '#94A3B8',
                fontSize: 12,
                fontFamily: 'Outfit'
              }}
              style={{ fontSize: '12px', fontFamily: 'Outfit' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#151E35',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontFamily: 'Outfit'
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#151E35] border border-white/10 rounded-lg p-4">
                      <p className="text-white font-bold mb-2">{data.nome}</p>
                      <p className="text-[#94A3B8] text-sm">Calls: {data.calls}</p>
                      <p className="text-[#94A3B8] text-sm">Taxa Show: {data.taxaShow.toFixed(1)}%</p>
                      <p className="text-[#00E5CC] text-sm font-semibold">Vendas: {formatarReal(data.vendas)}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine 
              y={75} 
              stroke="#FFB800" 
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ 
                value: 'Meta: 75%', 
                position: 'right',
                fill: '#FFB800',
                fontSize: 12,
                fontFamily: 'Outfit',
                fontWeight: 600
              }}
            />
            <Scatter name="SDRs" data={scatterData}>
              {scatterData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default SDRCharts;
