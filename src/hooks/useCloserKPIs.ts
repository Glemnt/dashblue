import { useState, useEffect } from 'react';
import { useGoogleSheets } from './useGoogleSheets';

export interface CloserKPI {
  nome: string;
  valorVendas: number;
  percentualVendas: number;
  ticketMedio: number;
  callsRealizadas: number;
  callsQualificadas: number;
  numeroContratos: number;
  taxaConversao: number;
}

interface UseCloserKPIsReturn {
  kpis: CloserKPI[];
  total: CloserKPI | null;
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

export const useCloserKPIs = (): UseCloserKPIsReturn => {
  const { data, loading, error, lastUpdate, refetch } = useGoogleSheets();
  const [kpis, setKpis] = useState<CloserKPI[]>([]);
  const [total, setTotal] = useState<CloserKPI | null>(null);

  useEffect(() => {
    if (data.length === 0) return;

    try {
      // Filtrar apenas linhas com dados de KPI dos Closers
      // Identificar pela presença da coluna "CLOSERS" preenchida + campos de KPI
      const closersKPIs = data
        .filter(row => {
          const temCloserName = row['CLOSERS'];
          const temValorVendas = row['Valor em Vendas'] || row['Valor em vendas'];
          const temTicketMedio = row['Ticket médio'];
          
          return temCloserName && temValorVendas && temTicketMedio;
        })
        .map(row => {
          const nomeRaw = String(row['CLOSERS'] || '').trim();
          
          return {
            nome: nomeRaw,
            valorVendas: parseValor(row['Valor em Vendas'] || row['Valor em vendas'] || '0'),
            percentualVendas: parsePercentual(row['% das vendas'] || '0'),
            ticketMedio: parseValor(row['Ticket médio'] || '0'),
            callsRealizadas: parseInt(row['Calls realizadas'] || '0') || 0,
            callsQualificadas: parseInt(row['Calls Qualificadas'] || '0') || 0,
            numeroContratos: parseInt(row['N. de contratos'] || '0') || 0,
            taxaConversao: parsePercentual(row['Tx. conversão'] || '0')
          };
        });

      // Separar TOTAL dos closers individuais
      const totalRow = closersKPIs.find(k => normalizarNome(k.nome) === 'TOTAL');
      const closersOnly = closersKPIs.filter(k => normalizarNome(k.nome) !== 'TOTAL');

      console.log('📊 KPIs Closers extraídos:', closersOnly);
      console.log('📊 Total Closers:', totalRow);

      setKpis(closersOnly);
      setTotal(totalRow || null);
    } catch (err) {
      console.error('Erro ao processar KPIs dos Closers:', err);
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
