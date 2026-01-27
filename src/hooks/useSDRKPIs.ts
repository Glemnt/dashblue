import { useState, useEffect } from 'react';
import { useDashboardData } from './useDashboardData';
import { DateRange } from '@/utils/dateFilters';

export interface SDRKPI {
  nome: string;
  valorVendas: number;
  percentualVendas: number;
  callsAgendadas: number;
  callsQualificadas: number;
  noShow: number;
  txNoShow: number;
  txComparecimento: number;
}

interface UseSDRKPIsReturn {
  kpis: SDRKPI[];
  total: SDRKPI | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refetch: () => void;
}

const parseValor = (valorStr: string): number => {
  if (!valorStr) return 0;
  const cleanValue = String(valorStr).replace(/[R$\s.]/g, '').replace(',', '.');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

const parsePercentual = (percentStr: string): number => {
  if (!percentStr) return 0;
  const cleanValue = String(percentStr).replace(/[%\s]/g, '').replace(',', '.');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

const normalizarNome = (nome: string): string => {
  return nome.toUpperCase().trim();
};

export const useSDRKPIs = (dateRange?: DateRange, monthKey?: string): UseSDRKPIsReturn => {
  const { data, loading, error, lastUpdate, refetch } = useDashboardData(dateRange, monthKey);
  const [kpis, setKpis] = useState<SDRKPI[]>([]);
  const [total, setTotal] = useState<SDRKPI | null>(null);

  useEffect(() => {
    if (data.length === 0) return;

    try {
      // Filtrar apenas linhas com dados de KPI dos SDRs
      // Identificar pela presença da coluna "SDR" (ou "SDRS") preenchida + campos de KPI específicos de SDR
      const sdrsKPIs = data
        .filter(row => {
          const temSDRName = row['SDR'] || row['SDRS'] || row['SDRs'];
          const temCallsAgendadas = row['Calls agendadas'];
          const temNoShow = row['No-show'] !== undefined;
          
          return temSDRName && temCallsAgendadas && temNoShow;
        })
        .map(row => {
          const nomeRaw = String(row['SDR'] || row['SDRS'] || row['SDRs'] || '').trim();
          
          return {
            nome: nomeRaw,
            valorVendas: parseValor(row['Valor em Vendas'] || row['Valor em vendas'] || '0'),
            percentualVendas: parsePercentual(row['% das vendas'] || '0'),
            callsAgendadas: parseInt(row['Calls agendadas'] || '0') || 0,
            callsQualificadas: parseInt(row['Calls qualificadas'] || row['Calls Qualificadas'] || '0') || 0,
            noShow: parseInt(row['No-show'] || '0') || 0,
            txNoShow: parsePercentual(row['Tx. No-show'] || '0'),
            txComparecimento: parsePercentual(row['Tx. Comparecimento'] || '0')
          };
        });

      // Separar TOTAL dos SDRs individuais
      const totalRow = sdrsKPIs.find(k => normalizarNome(k.nome) === 'TOTAL');
      const sdrsOnly = sdrsKPIs.filter(k => normalizarNome(k.nome) !== 'TOTAL');

      console.log('📊 KPIs SDRs extraídos:', sdrsOnly);
      console.log('📊 Total SDRs:', totalRow);

      setKpis(sdrsOnly);
      setTotal(totalRow || null);
    } catch (err) {
      console.error('Erro ao processar KPIs dos SDRs:', err);
    }
  }, [data]);

  return { 
    kpis, 
    total, 
    loading, 
    error, 
    lastUpdate, 
    refetch 
  };
};
