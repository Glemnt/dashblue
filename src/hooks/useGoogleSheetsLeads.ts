import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

interface UseLeadsReturn {
  totalLeads: number;
  loading: boolean;
  error: string | null;
}

const LEADS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSMYk5K5k39Apo7zd4z5xhi3aS9C_YE5FGgGJfhcLaCSlfh4YZp1AlAyjPw8PQho9fDlUYHSgofKyuj/pub?gid=167032865&single=true&output=csv";

export const useGoogleSheetsLeads = (): UseLeadsReturn => {
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(LEADS_CSV_URL);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar leads: ${response.status}`);
      }
      
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const leadsValidos = results.data.filter((row: any) => {
            // Filtrar linhas válidas (com email ou nome preenchido)
            return row['Email'] || row['Nome'] || row['EMAIL'] || row['NOME'];
          });
          
          console.log('📧 LEADS: Total de leads:', leadsValidos.length);
          setTotalLeads(leadsValidos.length);
          setLoading(false);
        },
        error: (err) => {
          console.error('❌ Erro no parsing CSV leads:', err);
          setError(`Erro ao processar CSV: ${err.message}`);
          setLoading(false);
        }
      });
    } catch (err) {
      console.error('❌ Erro no fetch leads:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(() => {
      fetchData();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    totalLeads,
    loading,
    error
  };
};
