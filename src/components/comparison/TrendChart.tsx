import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MetricComparison } from '@/hooks/useTemporalComparison';

interface ComparisonPeriod {
  label: string;
  dateRange: any;
  monthKey?: string;
}

interface Props {
  currentPeriod: ComparisonPeriod;
  previousPeriod: ComparisonPeriod;
  metrics: MetricComparison[];
}

export const TrendChart = ({ currentPeriod, previousPeriod, metrics }: Props) => {
  const chartData = [
    {
      periodo: previousPeriod.label,
      ...metrics.reduce((acc, m) => ({
        ...acc,
        [m.metricName]: m.previousValue
      }), {})
    },
    {
      periodo: currentPeriod.label,
      ...metrics.reduce((acc, m) => ({
        ...acc,
        [m.metricName]: m.currentValue
      }), {})
    }
  ];
  
  const mainMetrics = metrics.filter(m => 
    ['Receita Total', 'Contratos', 'Taxa de Conversão', 'Calls Realizadas'].includes(m.metricName)
  );
  
  const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];
  
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Tendência de Métricas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="periodo" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem'
              }}
            />
            <Legend />
            {mainMetrics.map((metric, idx) => (
              <Line
                key={metric.metricName}
                type="monotone"
                dataKey={metric.metricName}
                stroke={colors[idx]}
                strokeWidth={2}
                dot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
