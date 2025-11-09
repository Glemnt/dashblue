import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ReferenceLine } from 'recharts';
import { CloserMetrics } from '@/utils/closerMetricsCalculator';
import { formatarReal } from '@/utils/metricsCalculator';

interface CloserChartsProps {
  closers: CloserMetrics[];
  metaIndividual: number;
}

const CloserCharts = ({ closers, metaIndividual }: CloserChartsProps) => {
  
  // Dados para o gráfico de barras (ordenado por receita)
  const barChartData = [...closers]
    .sort((a, b) => b.receitaTotal - a.receitaTotal)
    .map(closer => ({
      nome: closer.nome,
      receita: closer.receitaTotal,
      contratos: closer.contratosFechados,
      color: closer.squadColor
    }));

  // Dados para o donut chart
  const pieChartData = closers.map(closer => ({
    nome: closer.nome,
    value: closer.receitaTotal,
    color: closer.squadColor
  }));

  const totalReceita = closers.reduce((sum, c) => sum + c.receitaTotal, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
      
      {/* GRÁFICO 1: Receita por Closer (Barras Horizontais) */}
      <div className="bg-[#151E35] rounded-2xl p-4 md:p-8 border border-white/5">
        <h3 className="text-white font-outfit text-xl md:text-2xl font-bold mb-4 md:mb-8">
          💰 Receita por Closer
        </h3>
        <ResponsiveContainer width="100%" height={300} className="md:!h-[400px]">
          <BarChart
            data={barChartData}
            layout="vertical"
            margin={{ top: 20, right: 40, left: 120, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              type="number" 
              stroke="#94A3B8"
              style={{ fontSize: '14px', fontFamily: 'Outfit' }}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
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
              labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '8px' }}
              formatter={(value: any, name: string, props: any) => {
                if (name === 'receita') {
                  return [
                    <div key="tooltip">
                      <div style={{ color: '#00E5CC' }}>{formatarReal(value)}</div>
                      <div style={{ color: '#94A3B8', fontSize: '12px', marginTop: '4px' }}>
                        {props.payload.contratos} contratos
                      </div>
                    </div>,
                    'Receita'
                  ];
                }
                return [value, name];
              }}
            />
            <ReferenceLine 
              x={metaIndividual} 
              stroke="#FFB800" 
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ 
                value: `Meta: ${formatarReal(metaIndividual)}`, 
                position: 'top',
                fill: '#FFB800',
                fontSize: 12,
                fontFamily: 'Outfit',
                fontWeight: 600
              }}
            />
            <Bar dataKey="receita" radius={[0, 8, 8, 0]}>
              {barChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* GRÁFICO 2: Donut Chart - Distribuição de Receita */}
      <div className="bg-[#151E35] rounded-2xl p-4 md:p-8 border border-white/5">
        <h3 className="text-white font-outfit text-xl md:text-2xl font-bold mb-4 md:mb-8">
          📊 Distribuição de Receita
        </h3>
        <ResponsiveContainer width="100%" height={300} className="md:!h-[400px]">
          <PieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={140}
              paddingAngle={5}
              dataKey="value"
              label={(entry) => {
                const percent = ((entry.value / totalReceita) * 100).toFixed(1);
                return `${entry.nome}: ${percent}%`;
              }}
              labelLine={{
                stroke: '#94A3B8',
                strokeWidth: 1
              }}
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#151E35',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontFamily: 'Outfit'
              }}
              formatter={(value: any) => [formatarReal(value), 'Receita']}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{
                fontFamily: 'Outfit',
                fontSize: '14px',
                color: '#94A3B8'
              }}
            />
            {/* Centro do Donut */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                fill: '#fff',
                fontFamily: 'Outfit'
              }}
            >
              {formatarReal(totalReceita)}
            </text>
            <text
              x="50%"
              y="50%"
              dy={30}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontSize: '12px',
                fill: '#94A3B8',
                fontFamily: 'Outfit'
              }}
            >
              Total
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default CloserCharts;
