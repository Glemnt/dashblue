import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

interface UseGoogleSheetsReturn {
  data: any[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refetch: () => void;
}

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSMYk5K5k39Apo7zd4z5xhi3aS9C_YE5FGgGJfhcLaCSlfh4YZp1AlAyjPw8PQho9fDlUYHSgofKyuj/pub?gid=2010777326&single=true&output=csv";

export const useGoogleSheets = (): UseGoogleSheetsReturn => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      const response = await fetch(CSV_URL);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
        complete: (results) => {
          console.log('📊 FETCH GOOGLE SHEETS:');
          console.log('✅ Total de linhas:', results.data.length);
          console.log('✅ CSV bruto (preview):', csvText.substring(0, 500));
          
          if (results.data.length > 0) {
            console.log('📋 Headers exatos:', Object.keys(results.data[0]));
            console.log('📋 Primeira linha completa:', results.data[0]);
            if (results.data[1]) {
              console.log('📋 Segunda linha completa:', results.data[1]);
            }
          }
          
          console.log('📊 Dados brutos do CSV:', results.data);
          setData(results.data);
          setLastUpdate(new Date());
          setLoading(false);
        },
        error: (err) => {
          console.error('❌ Erro no parsing CSV:', err);
          setError(`Erro ao processar CSV: ${err.message}`);
          setLoading(false);
        }
      });
    } catch (err) {
      console.error('❌ Erro no fetch:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao buscar dados');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh a cada 60 segundos
    const interval = setInterval(() => {
      fetchData();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchData]);

  const refetch = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refetch
  };
};
