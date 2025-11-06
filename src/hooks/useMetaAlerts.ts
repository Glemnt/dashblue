import { useMemo } from 'react';

export type AlertSeverity = 'critical' | 'warning' | 'success';

export interface MetaAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  metric: string;
  progress: number;
  diasRestantes: number;
  meta: number;
  realizado: number;
}

interface UseMetaAlertsProps {
  metricas?: {
    progressoMetaMensal?: number;
    metaMensal?: number;
    receitaTotal?: number;
    closer?: Array<{
      nome: string;
      receitaTotal: number;
      progressoMeta: number;
    }>;
    sdr?: Array<{
      nome: string;
      totalCalls: number;
      progressoMeta?: number;
    }>;
  };
  diasUteisRestantes?: number;
}

export const useMetaAlerts = ({ metricas, diasUteisRestantes = 10 }: UseMetaAlertsProps) => {
  const alerts = useMemo(() => {
    if (!metricas) return [];
    
    const alertsList: MetaAlert[] = [];
    
    // Alerta Meta Geral
    if (metricas.progressoMetaMensal !== undefined && metricas.metaMensal && metricas.receitaTotal !== undefined) {
      const progresso = metricas.progressoMetaMensal;
      
      if (progresso >= 100) {
        alertsList.push({
          id: 'meta-geral-sucesso',
          severity: 'success',
          title: '🎉 Meta Atingida!',
          message: `Parabéns! A meta mensal de ${metricas.metaMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} foi alcançada.`,
          metric: 'Meta Geral',
          progress: progresso,
          diasRestantes: diasUteisRestantes,
          meta: metricas.metaMensal,
          realizado: metricas.receitaTotal
        });
      } else if (progresso < 50 && diasUteisRestantes <= 10) {
        alertsList.push({
          id: 'meta-geral-critico',
          severity: 'critical',
          title: '🚨 Meta em Risco Crítico',
          message: `Apenas ${progresso.toFixed(0)}% da meta atingida com ${diasUteisRestantes} dias úteis restantes. Ação urgente necessária!`,
          metric: 'Meta Geral',
          progress: progresso,
          diasRestantes: diasUteisRestantes,
          meta: metricas.metaMensal,
          realizado: metricas.receitaTotal
        });
      } else if (progresso < 70 && diasUteisRestantes <= 15) {
        alertsList.push({
          id: 'meta-geral-atencao',
          severity: 'warning',
          title: '⚠️ Meta Requer Atenção',
          message: `Progresso de ${progresso.toFixed(0)}% com ${diasUteisRestantes} dias úteis restantes. Intensificar esforços.`,
          metric: 'Meta Geral',
          progress: progresso,
          diasRestantes: diasUteisRestantes,
          meta: metricas.metaMensal,
          realizado: metricas.receitaTotal
        });
      }
    }
    
    // Alertas Individuais Closers
    if (metricas.closer) {
      metricas.closer.forEach((closer) => {
        if (closer.progressoMeta !== undefined) {
          if (closer.progressoMeta < 40 && diasUteisRestantes <= 10) {
            alertsList.push({
              id: `closer-${closer.nome}-critico`,
              severity: 'critical',
              title: `🔴 ${closer.nome} - Crítico`,
              message: `Apenas ${closer.progressoMeta.toFixed(0)}% da meta individual. Necessário suporte urgente.`,
              metric: `Closer: ${closer.nome}`,
              progress: closer.progressoMeta,
              diasRestantes: diasUteisRestantes,
              meta: 0,
              realizado: closer.receitaTotal
            });
          } else if (closer.progressoMeta < 60 && diasUteisRestantes <= 12) {
            alertsList.push({
              id: `closer-${closer.nome}-atencao`,
              severity: 'warning',
              title: `⚠️ ${closer.nome} - Atenção`,
              message: `Performance de ${closer.progressoMeta.toFixed(0)}%. Acompanhamento próximo recomendado.`,
              metric: `Closer: ${closer.nome}`,
              progress: closer.progressoMeta,
              diasRestantes: diasUteisRestantes,
              meta: 0,
              realizado: closer.receitaTotal
            });
          }
        }
      });
    }
    
    return alertsList.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, success: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [metricas, diasUteisRestantes]);
  
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const successCount = alerts.filter(a => a.severity === 'success').length;
  
  return {
    alerts,
    criticalCount,
    warningCount,
    successCount,
    totalAlerts: alerts.length,
    hasCritical: criticalCount > 0,
    hasWarning: warningCount > 0
  };
};
