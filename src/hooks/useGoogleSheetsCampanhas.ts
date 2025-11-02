import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

interface UseCampanhasReturn {
  totalInvestimento: number;
  totalMQLs: number;
  totalLeads: number;
  cplMedio: number;
  cacMedio: number;
  loading: boolean;
  error: string | null;
  isRefetching: boolean;
}

const CAMPANHAS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSMYk5K5k39Apo7zd4z5xhi3aS9C_YE5FGgGJfhcLaCSlfh4YZp1AlAyjPw8PQho9fDlUYHSgofKyuj/pub?gid=1359887700&single=true&output=csv";

export const useGoogleSheetsCampanhas = (): UseCampanhasReturn => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const parseValor = (valor: any): number => {
    if (!valor) return 0;
    if (typeof valor === 'number') return valor;
    
    const cleanValue = String(valor)
      .replace(/R\$/g, '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  const fetchData = useCallback(async (isInitialLoad = false) => {
    try {
      setError(null);
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setIsRefetching(true);
      }
      const response = await fetch(CAMPANHAS_CSV_URL);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar campanhas: ${response.status}`);
      }
      
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
        complete: (results) => {
          console.log('📊 CAMPANHAS: Total de linhas:', results.data.length);
          setData(results.data);
          setLoading(false);
          setIsRefetching(false);
        },
        error: (err) => {
          console.error('❌ Erro no parsing CSV campanhas:', err);
          setError(`Erro ao processar CSV: ${err.message}`);
          setLoading(false);
          setIsRefetching(false);
        }
      });
    } catch (err) {
      console.error('❌ Erro no fetch campanhas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLoading(false);
      setIsRefetching(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
    
    const interval = setInterval(() => {
      fetchData(false);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [fetchData]);

  // Calcular totais
  const totalMQLs = data.reduce((acc, row) => {
    return acc + parseValor(row['MQL'] || row['mql']);
  }, 0);

  const totalInvestimento = data.reduce((acc, row) => {
    return acc + parseValor(row['Investimento utilizado'] || row['INVESTIMENTO UTILIZADO']);
  }, 0);

  const totalFechamentos = data.reduce((acc, row) => {
    return acc + parseValor(row['Fechamentos'] || row['FECHAMENTOS']);
  }, 0);

  const totalResultadoPrincipal = data.reduce((acc, row) => {
    return acc + parseValor(row['Resultado Principal'] || row['RESULTADO PRINCIPAL']);
  }, 0);

  const totalLeads = data.reduce((acc, row) => {
    return acc + parseValor(row['Conversoes_Dia'] || row['CONVERSOES_DIA'] || row['conversoes_dia']);
  }, 0);

  const cplMedio = totalResultadoPrincipal > 0 ? totalInvestimento / totalResultadoPrincipal : 0;
  const cacMedio = totalFechamentos > 0 ? totalInvestimento / totalFechamentos : 0;

  console.log('💰 CAMPANHAS - Totais:');
  console.log('MQLs:', totalMQLs);
  console.log('Investimento:', totalInvestimento);
  console.log('Leads (Conversoes_Dia):', totalLeads);
  console.log('CPL Médio:', cplMedio.toFixed(2));
  console.log('CAC Médio:', cacMedio.toFixed(2));

  return {
    totalInvestimento,
    totalMQLs,
    totalLeads,
    cplMedio,
    cacMedio,
    loading,
    error,
    isRefetching
  };
};
