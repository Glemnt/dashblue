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
      console.log('🔍 DEBUG useCloserKPIs - Iniciando processamento');
      console.log('📋 Total de linhas recebidas:', data.length);
      
      // Debug: Ver headers disponíveis
      if (data.length > 0) {
        console.log('📋 Colunas disponíveis:', Object.keys(data[0]));
        console.log('📋 Primeira linha completa:', data[0]);
      }

      // Função auxiliar para buscar valor de coluna com variações de nome
      const getColumnValue = (row: any, possibleNames: string[]) => {
        for (const name of possibleNames) {
          if (row[name] !== undefined && row[name] !== null && String(row[name]).trim() !== '') {
            return row[name];
          }
        }
        return null;
      };

      // Debug: Linhas que têm CLOSERS preenchido
      const linhasComClosers = data.filter(row => {
        const closerValue = getColumnValue(row, ['CLOSERS', 'Closers', 'closers']);
        return closerValue !== null;
      });
      console.log('📋 Linhas com coluna CLOSERS preenchida:', linhasComClosers.length);
      if (linhasComClosers.length > 0) {
        console.log('📋 Primeiras linhas com CLOSERS:', linhasComClosers.slice(0, 5));
      }

      // Filtrar apenas linhas com dados de KPI dos Closers
      // Identificar pela presença da coluna "CLOSERS" preenchida + campos de KPI
      // E EXCLUIR linhas que são calls (têm NOME DA CALL preenchido)
      const closersKPIs = data
        .filter(row => {
          const temCloserName = getColumnValue(row, ['CLOSERS', 'Closers', 'closers']);
          const temValorVendas = getColumnValue(row, ['Valor em Vendas', 'Valor em vendas', 'VALOR EM VENDAS']);
          const temTicketMedio = getColumnValue(row, ['Ticket médio', 'Ticket Médio', 'TICKET MÉDIO']);
          
          // IMPORTANTE: Garantir que NÃO é uma linha de call individual
          const nomeCall = getColumnValue(row, ['NOME DA CALL', 'Nome da Call', 'NOME']);
          const naoECall = nomeCall === null;
          
          const isKPI = temCloserName && temValorVendas && temTicketMedio && naoECall;
          
          if (isKPI) {
            console.log('✅ Linha identificada como KPI:', { nome: temCloserName, valor: temValorVendas, ticket: temTicketMedio });
          }
          
          return isKPI;
        })
        .map(row => {
          const nomeRaw = String(getColumnValue(row, ['CLOSERS', 'Closers', 'closers']) || '').trim();
          
          return {
            nome: nomeRaw,
            valorVendas: parseValor(getColumnValue(row, ['Valor em Vendas', 'Valor em vendas', 'VALOR EM VENDAS']) || '0'),
            percentualVendas: parsePercentual(getColumnValue(row, ['% das vendas', '% das Vendas', 'PERCENTUAL VENDAS']) || '0'),
            ticketMedio: parseValor(getColumnValue(row, ['Ticket médio', 'Ticket Médio', 'TICKET MÉDIO']) || '0'),
            callsRealizadas: parseInt(getColumnValue(row, ['Calls realizadas', 'Calls Realizadas', 'CALLS REALIZADAS']) || '0') || 0,
            callsQualificadas: parseInt(getColumnValue(row, ['Calls Qualificadas', 'Calls qualificadas', 'CALLS QUALIFICADAS']) || '0') || 0,
            numeroContratos: parseInt(getColumnValue(row, ['N. de contratos', 'N. de Contratos', 'NUMERO CONTRATOS']) || '0') || 0,
            taxaConversao: parsePercentual(getColumnValue(row, ['Tx. conversão', 'Tx. Conversão', 'TAXA CONVERSAO']) || '0')
          };
        });

      console.log('📊 Total de KPIs extraídos:', closersKPIs.length);
      console.log('📊 KPIs brutos:', closersKPIs);

      // Separar TOTAL dos closers individuais
      const totalRow = closersKPIs.find(k => normalizarNome(k.nome) === 'TOTAL');
      const closersOnly = closersKPIs.filter(k => normalizarNome(k.nome) !== 'TOTAL');

      console.log('📊 KPIs Closers extraídos (sem TOTAL):', closersOnly);
      console.log('📊 Total Closers:', totalRow);

      setKpis(closersOnly);
      setTotal(totalRow || null);
    } catch (err) {
      console.error('❌ Erro ao processar KPIs dos Closers:', err);
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
