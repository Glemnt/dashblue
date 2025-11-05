import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatarReal } from '@/utils/metricsCalculator';

interface ScenarioData {
  taxaShow: number;
  taxaConversao: number;
  ticketMedio: number;
  callsRealizadas: number;
  contratos: number;
  receita: number;
  progressoMeta: number;
}

interface ScenariosChartProps {
  scenarios: {
    current: ScenarioData;
    simulated: ScenarioData;
    realistic: ScenarioData;
    optimistic: ScenarioData;
    pessimistic: ScenarioData;
  };
  metaMensal: number;
}

export const ScenariosChart = ({ scenarios, metaMensal }: ScenariosChartProps) => {
  const data = [
    {
      name: 'Atual',
      receita: scenarios.current.receita,
      contratos: scenarios.current.contratos * 10000, // Normalizar para visualização
    },
    {
      name: 'Simulado',
      receita: scenarios.simulated.receita,
      contratos: scenarios.simulated.contratos * 10000,
    },
    {
      name: 'Realista',
      receita: scenarios.realistic.receita,
      contratos: scenarios.realistic.contratos * 10000,
    },
    {
      name: 'Otimista',
      receita: scenarios.optimistic.receita,
      contratos: scenarios.optimistic.contratos * 10000,
    },
    {
      name: 'Pessimista',
      receita: scenarios.pessimistic.receita,
      contratos: scenarios.pessimistic.contratos * 10000,
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-4 shadow-lg">
          <p className="text-foreground font-bold mb-2">{label}</p>
          <p className="text-accent text-sm">
            Receita: <strong>{formatarReal(payload[0].value)}</strong>
          </p>
          <p className="text-primary text-sm">
            Contratos: <strong>{(payload[1].value / 10000).toFixed(0)}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="name" 
          stroke="hsl(var(--foreground))"
          style={{ fontSize: '14px' }}
        />
        <YAxis 
          stroke="hsl(var(--foreground))"
          tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
          style={{ fontSize: '12px' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <ReferenceLine 
          y={metaMensal} 
          stroke="hsl(var(--destructive))" 
          strokeDasharray="5 5" 
          label={{ value: 'Meta', position: 'right', fill: 'hsl(var(--destructive))' }}
        />
        <Bar 
          dataKey="receita" 
          fill="hsl(var(--accent))" 
          name="Receita" 
          radius={[8, 8, 0, 0]}
        />
        <Bar 
          dataKey="contratos" 
          fill="hsl(var(--primary))" 
          name="Contratos (×R$10k)" 
          radius={[8, 8, 0, 0]}
          opacity={0.6}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
