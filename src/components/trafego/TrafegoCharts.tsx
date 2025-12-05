import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, ReferenceLine,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { CampanhaData, CanalMetrics, formatarMoeda, formatarMoedaCompacta, CORES_CANAIS, METAS_TRAFEGO } from "@/utils/trafegoMetricsCalculator";

interface TrafegoChartsProps {
  campanhas: CampanhaData[];
  canais: CanalMetrics[];
  isTVMode?: boolean;
}

const TrafegoCharts = ({ campanhas, canais, isTVMode = false }: TrafegoChartsProps) => {
  // Data for bar chart - Investment vs Revenue by Channel
  const barChartData = canais.map(c => ({
    name: c.canal,
    investimento: c.investimento,
    receita: c.receita,
    fill: CORES_CANAIS[c.canal] || '#6B7280'
  }));

  // Data for pie chart - Investment distribution
  const pieChartData = canais.map(c => ({
    name: c.canal,
    value: c.investimento,
    fill: CORES_CANAIS[c.canal] || '#6B7280'
  }));

  // Mock data for CAC evolution
  const cacEvolutionData = Array.from({ length: 30 }, (_, i) => ({
    dia: i + 1,
    cac: 800 + Math.random() * 600 + (i < 15 ? 200 : -100)
  }));

  // Data for scatter chart - Investment vs ROAS
  const scatterData = campanhas.map(c => ({
    nome: c.nome,
    investimento: c.investimento,
    roas: c.roas,
    fechamentos: c.fechamentos,
    canal: c.canal,
    fill: CORES_CANAIS[c.canal] || '#6B7280'
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#151E35] border border-white/20 rounded-lg p-4 shadow-xl">
          <p className="text-white font-bold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.name.includes('ROAS') ? `${entry.value.toFixed(2)}x` : formatarMoedaCompacta(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#151E35] border border-white/20 rounded-lg p-4 shadow-xl">
          <p className="text-white font-bold mb-2">{data.nome}</p>
          <p className="text-[#94A3B8] text-sm">Canal: {data.canal}</p>
          <p className="text-[#0066FF] text-sm">Investimento: {formatarMoedaCompacta(data.investimento)}</p>
          <p className="text-[#00E5CC] text-sm">ROAS: {data.roas.toFixed(2)}x</p>
          <p className="text-[#FFB800] text-sm">Fechamentos: {data.fechamentos}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 ${isTVMode ? 'gap-8' : 'gap-6'}`}>
      {/* Gráfico 1: Barras - Investimento vs Retorno por Canal */}
      <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-8' : 'p-6'}`}>
        <h3 className={`text-white font-bold mb-6 ${isTVMode ? 'text-2xl' : 'text-lg'}`}>
          📊 Investimento vs Retorno por Canal
        </h3>
        <ResponsiveContainer width="100%" height={isTVMode ? 400 : 300}>
          <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: isTVMode ? 14 : 12 }} />
            <YAxis 
              tick={{ fill: '#94A3B8', fontSize: isTVMode ? 14 : 12 }} 
              tickFormatter={(value) => formatarMoedaCompacta(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#94A3B8' }} />
            <Bar dataKey="investimento" name="Investimento" fill="#0066FF" radius={[4, 4, 0, 0]} />
            <Bar dataKey="receita" name="Receita" fill="#00E5CC" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico 2: Pizza - Distribuição de Investimento */}
      <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-8' : 'p-6'}`}>
        <h3 className={`text-white font-bold mb-6 ${isTVMode ? 'text-2xl' : 'text-lg'}`}>
          🥧 Distribuição de Investimento
        </h3>
        <ResponsiveContainer width="100%" height={isTVMode ? 400 : 300}>
          <PieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              innerRadius={isTVMode ? 80 : 60}
              outerRadius={isTVMode ? 130 : 100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: '#94A3B8' }}
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => formatarMoedaCompacta(value)}
              contentStyle={{ backgroundColor: '#151E35', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico 3: Linhas - Evolução do CAC */}
      <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-8' : 'p-6'}`}>
        <h3 className={`text-white font-bold mb-6 ${isTVMode ? 'text-2xl' : 'text-lg'}`}>
          📈 Evolução do CAC no Mês
        </h3>
        <ResponsiveContainer width="100%" height={isTVMode ? 400 : 300}>
          <LineChart data={cacEvolutionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis 
              dataKey="dia" 
              tick={{ fill: '#94A3B8', fontSize: isTVMode ? 14 : 12 }}
              label={{ value: 'Dia do mês', position: 'insideBottom', offset: -5, fill: '#94A3B8' }}
            />
            <YAxis 
              tick={{ fill: '#94A3B8', fontSize: isTVMode ? 14 : 12 }} 
              tickFormatter={(value) => formatarMoedaCompacta(value)}
              domain={[0, 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={METAS_TRAFEGO.cacMaximo} 
              stroke="#EF4444" 
              strokeDasharray="5 5"
              label={{ value: 'Meta CAC', fill: '#EF4444', position: 'right' }}
            />
            <Line 
              type="monotone" 
              dataKey="cac" 
              name="CAC"
              stroke="#0066FF" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 8, fill: '#0066FF' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico 4: Scatter - Investimento vs ROAS */}
      <div className={`bg-[#151E35] rounded-2xl border border-white/10 ${isTVMode ? 'p-8' : 'p-6'}`}>
        <h3 className={`text-white font-bold mb-6 ${isTVMode ? 'text-2xl' : 'text-lg'}`}>
          🎯 Investimento vs ROAS (Tamanho = Fechamentos)
        </h3>
        <ResponsiveContainer width="100%" height={isTVMode ? 400 : 300}>
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis 
              type="number" 
              dataKey="investimento" 
              name="Investimento"
              tick={{ fill: '#94A3B8', fontSize: isTVMode ? 14 : 12 }}
              tickFormatter={(value) => formatarMoedaCompacta(value)}
              label={{ value: 'Investimento', position: 'insideBottom', offset: -5, fill: '#94A3B8' }}
            />
            <YAxis 
              type="number" 
              dataKey="roas" 
              name="ROAS"
              tick={{ fill: '#94A3B8', fontSize: isTVMode ? 14 : 12 }}
              label={{ value: 'ROAS', angle: -90, position: 'insideLeft', fill: '#94A3B8' }}
            />
            <ZAxis type="number" dataKey="fechamentos" range={[100, 1000]} name="Fechamentos" />
            <Tooltip content={<CustomScatterTooltip />} />
            
            {/* Reference lines for quadrants */}
            <ReferenceLine x={7000} stroke="#ffffff20" strokeDasharray="3 3" />
            <ReferenceLine y={5} stroke="#ffffff20" strokeDasharray="3 3" />
            
            <Scatter data={scatterData}>
              {scatterData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        
        {/* Quadrant Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#10B981] rounded"></div>
            <span className="text-[#94A3B8]">Alto Invest. + Alto ROAS = Vencedoras</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#0066FF] rounded"></div>
            <span className="text-[#94A3B8]">Baixo Invest. + Alto ROAS = Oportunidades</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#EF4444] rounded"></div>
            <span className="text-[#94A3B8]">Alto Invest. + Baixo ROAS = Atenção</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafegoCharts;
