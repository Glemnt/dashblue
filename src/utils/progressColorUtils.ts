import { THRESHOLDS_GLOBAIS } from './metasConfig';

type ColorType = 'hex' | 'class';
type ThresholdType = 'default' | 'performance';

/**
 * Retorna a cor baseada no percentual atingido
 * @param percentage - Percentual atual (0-100+)
 * @param type - 'hex' para cor hexadecimal, 'class' para classe Tailwind
 * @param thresholdType - 'default' (100/80) ou 'performance' (90/70)
 */
export const getProgressColor = (
  percentage: number,
  type: ColorType = 'hex',
  thresholdType: ThresholdType = 'default'
): string => {
  const { 
    progressoVerde, 
    progressoAmarelo, 
    progressoVerdePerformance, 
    progressoAmareloPerformance, 
    cores 
  } = THRESHOLDS_GLOBAIS;
  
  const verdeThreshold = thresholdType === 'performance' 
    ? progressoVerdePerformance 
    : progressoVerde;
  const amareloThreshold = thresholdType === 'performance' 
    ? progressoAmareloPerformance 
    : progressoAmarelo;
  
  if (type === 'class') {
    if (percentage >= verdeThreshold) return `bg-[${cores.verde}]`;
    if (percentage >= amareloThreshold) return `bg-[${cores.amarelo}]`;
    return `bg-[${cores.vermelho}]`;
  }
  
  // Default: hex
  if (percentage >= verdeThreshold) return cores.verde;
  if (percentage >= amareloThreshold) return cores.amarelo;
  return cores.vermelho;
};

/**
 * Verifica se o gap financeiro está em nível de alerta
 * @param gap - Valor do gap financeiro
 * @param total - Valor total de referência
 */
export const isGapFinanceiroAlerta = (gap: number, total: number): boolean => {
  if (total <= 0) return false;
  return (gap / total) > THRESHOLDS_GLOBAIS.alertaGapFinanceiro;
};

/**
 * Retorna a cor baseada no valor vs meta (shortcut)
 * @param value - Valor atual
 * @param meta - Meta esperada
 * @param type - 'hex' ou 'class'
 * @param thresholdType - 'default' ou 'performance'
 */
export const getProgressColorByValue = (
  value: number,
  meta: number,
  type: ColorType = 'hex',
  thresholdType: ThresholdType = 'default'
): string => {
  const percentage = meta > 0 ? (value / meta) * 100 : 0;
  return getProgressColor(percentage, type, thresholdType);
};
