import { SquadMetrics } from '@/utils/squadsMetricsCalculator';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';

interface SquadsGraficosProps {
  hotDogs: SquadMetrics;
  corvoAzul: SquadMetrics;
  isTVMode: boolean;
}

export const SquadsGraficos = ({ hotDogs, corvoAzul, isTVMode }: SquadsGraficosProps) => {
  // Dados para gráfico de barras
  const dadosBarras = [
    {
      metrica: 'Receita (k)',
      'Hot Dogs': Math.round(hotDogs.receitaTotal / 1000),
      'Corvo Azul': Math.round(corvoAzul.receitaTotal / 1000)
    },
    {
      metrica: 'Contratos',
      'Hot Dogs': hotDogs.contratos,
      'Corvo Azul': corvoAzul.contratos
    },
    {
      metrica: 'Calls',
      'Hot Dogs': hotDogs.callsRealizadas,
      'Corvo Azul': corvoAzul.callsRealizadas
    },
    {
      metrica: 'Taxa Conv. (%)',
      'Hot Dogs': Math.round(hotDogs.taxaConversao),
      'Corvo Azul': Math.round(corvoAzul.taxaConversao)
    }
  ];
  
  // Dados para gráfico radar
  const dadosRadar = [
    {
      metrica: 'Volume Calls',
      'Hot Dogs': Math.min((hotDogs.callsRealizadas / 100) * 100, 100),
      'Corvo Azul': Math.min((corvoAzul.callsRealizadas / 100) * 100, 100)
    },
    {
      metrica: 'Qualificação',
      'Hot Dogs': hotDogs.taxaQualificacao,
      'Corvo Azul': corvoAzul.taxaQualificacao
    },
    {
      metrica: 'Conversão',
      'Hot Dogs': hotDogs.taxaConversao,
      'Corvo Azul': corvoAzul.taxaConversao
    },
    {
      metrica: 'Ticket Médio',
      'Hot Dogs': Math.min((hotDogs.ticketMedio / 12000) * 100, 100),
      'Corvo Azul': Math.min((corvoAzul.ticketMedio / 12000) * 100, 100)
    },
    {
      metrica: 'Assinatura',
      'Hot Dogs': hotDogs.taxaAssinatura,
      'Corvo Azul': corvoAzul.taxaAssinatura
    },
    {
      metrica: 'Pagamento',
      'Hot Dogs': hotDogs.taxaPagamento,
      'Corvo Azul': corvoAzul.taxaPagamento
    }
  ];
  
  // Dados para gráfico de linha (simulado - evolução ao longo do mês)
  const diasDoMes = 30;
  const diaAtual = new Date().getDate();
  const dadosLinha = Array.from({ length: diaAtual }, (_, i) => {
    const dia = i + 1;
    const progressoHotDogs = (hotDogs.receitaTotal / diaAtual) * dia;
    const progressoCorvoAzul = (corvoAzul.receitaTotal / diaAtual) * dia;
    
    return {
      dia: `Dia ${dia}`,
      'Hot Dogs': Math.round(progressoHotDogs),
      'Corvo Azul': Math.round(progressoCorvoAzul)
    };
  });
  
  // Adicionar projeção (dias restantes)
  const diasRestantes = diasDoMes - diaAtual;
  if (diasRestantes > 0) {
    for (let i = 1; i <= diasRestantes; i++) {
      const dia = diaAtual + i;
      const projecaoHotDogs = hotDogs.receitaTotal + ((hotDogs.receitaTotal / diaAtual) * i);
      const projecaoCorvoAzul = corvoAzul.receitaTotal + ((corvoAzul.receitaTotal / diaAtual) * i);
      
      dadosLinha.push({
        dia: `Dia ${dia}`,
        'Hot Dogs': Math.round(projecaoHotDogs),
        'Corvo Azul': Math.round(projecaoCorvoAzul)
      });
    }
  }
  
  return (
    <div className="max-w-[1600px] mx-auto">
      <h2 className={`text-[#0B1120] font-black text-center mb-12 ${
        isTVMode ? 'text-5xl' : 'text-4xl'
      }`}>
        Análise Visual Comparativa
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* GRÁFICO 1: BARRAS COMPARATIVAS */}
        <Card className="bg-white p-6">
          <h3 className={`font-bold text-center mb-4 ${isTVMode ? 'text-2xl' : 'text-xl'}`}>
            Comparação de Métricas
          </h3>
          <ResponsiveContainer width="100%" height={isTVMode ? 450 : 350}>
            <BarChart data={dadosBarras}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="metrica" 
                tick={{ fontSize: isTVMode ? 14 : 12 }}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: isTVMode ? 14 : 12 }} />
              <Tooltip 
                contentStyle={{ fontSize: isTVMode ? 16 : 14 }}
              />
              <Legend 
                wrapperStyle={{ fontSize: isTVMode ? 16 : 14 }}
              />
              <Bar dataKey="Hot Dogs" fill="#FF4757" />
              <Bar dataKey="Corvo Azul" fill="#0066FF" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        {/* GRÁFICO 2: RADAR DE PERFIL */}
        <Card className="bg-white p-6">
          <h3 className={`font-bold text-center mb-4 ${isTVMode ? 'text-2xl' : 'text-xl'}`}>
            Perfil de Força
          </h3>
          <ResponsiveContainer width="100%" height={isTVMode ? 450 : 350}>
            <RadarChart data={dadosRadar}>
              <PolarGrid />
              <PolarAngleAxis 
                dataKey="metrica" 
                tick={{ fontSize: isTVMode ? 12 : 10 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]}
                tick={{ fontSize: isTVMode ? 12 : 10 }}
              />
              <Radar 
                name="Hot Dogs" 
                dataKey="Hot Dogs" 
                stroke="#FF4757" 
                fill="#FF4757" 
                fillOpacity={0.5}
                strokeWidth={2}
              />
              <Radar 
                name="Corvo Azul" 
                dataKey="Corvo Azul" 
                stroke="#0066FF" 
                fill="#0066FF" 
                fillOpacity={0.5}
                strokeWidth={2}
              />
              <Legend wrapperStyle={{ fontSize: isTVMode ? 16 : 14 }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
        
        {/* GRÁFICO 3: EVOLUÇÃO TEMPORAL */}
        <Card className="bg-white p-6">
          <h3 className={`font-bold text-center mb-4 ${isTVMode ? 'text-2xl' : 'text-xl'}`}>
            Evolução + Projeção
          </h3>
          <ResponsiveContainer width="100%" height={isTVMode ? 450 : 350}>
            <LineChart data={dadosLinha}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="dia" 
                tick={{ fontSize: isTVMode ? 12 : 10 }}
                interval={4}
              />
              <YAxis 
                tick={{ fontSize: isTVMode ? 12 : 10 }}
                tickFormatter={(value) => `${Math.round(value / 1000)}k`}
              />
              <Tooltip 
                contentStyle={{ fontSize: isTVMode ? 14 : 12 }}
                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
              />
              <Legend wrapperStyle={{ fontSize: isTVMode ? 16 : 14 }} />
              <Line 
                type="monotone" 
                dataKey="Hot Dogs" 
                stroke="#FF4757" 
                strokeWidth={3}
                dot={{ r: 0 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="Corvo Azul" 
                stroke="#0066FF" 
                strokeWidth={3}
                dot={{ r: 0 }}
                activeDot={{ r: 6 }}
              />
              {/* Linha vertical indicando hoje */}
              <line 
                x1={`${(diaAtual / diasDoMes) * 100}%`} 
                y1="0" 
                x2={`${(diaAtual / diasDoMes) * 100}%`} 
                y2="100%" 
                stroke="#94A3B8" 
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-center text-xs text-[#94A3B8] mt-2">
            Linha sólida: dados reais | Linha tracejada: projeção
          </p>
        </Card>
      </div>
    </div>
  );
};
