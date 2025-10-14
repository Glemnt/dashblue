import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

interface UseLeadsReturn {
  totalLeads: number;
  totalMQLs: number;
  totalDesqualificados: number;
  loading: boolean;
  error: string | null;
}

const LEADS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSMYk5K5k39Apo7zd4z5xhi3aS9C_YE5FGgGJfhcLaCSlfh4YZp1AlAyjPw8PQho9fDlUYHSgofKyuj/pub?gid=167032865&single=true&output=csv";

export const useGoogleSheetsLeads = (): UseLeadsReturn => {
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [totalMQLs, setTotalMQLs] = useState<number>(0);
  const [totalDesqualificados, setTotalDesqualificados] = useState<number>(0);
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
          
          // Contar MQLs (coluna J = "MQL")
          const mqls = leadsValidos.filter((row: any) => {
            const statusMql = row['MQL'] || row['mql'] || row['Status'] || row['STATUS'] || row['Qualificação'] || row['QUALIFICAÇÃO'];
            return statusMql && String(statusMql).trim().toUpperCase() === 'MQL';
          });
          
          // Contar Desqualificados (coluna J = "Desqualificado")
          const desqualificados = leadsValidos.filter((row: any) => {
            const statusMql = row['MQL'] || row['mql'] || row['Status'] || row['STATUS'] || row['Qualificação'] || row['QUALIFICAÇÃO'];
            return statusMql && String(statusMql).trim().toUpperCase().includes('DESQUALIFICADO');
          });
          
          console.log('📧 LEADS - Totais:');
          console.log('Total de leads:', leadsValidos.length);
          console.log('MQLs:', mqls.length);
          console.log('Desqualificados:', desqualificados.length);
          console.log('Sem classificação:', leadsValidos.length - mqls.length - desqualificados.length);
          
          setTotalLeads(leadsValidos.length);
          setTotalMQLs(mqls.length);
          setTotalDesqualificados(desqualificados.length);
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
    totalMQLs,
    totalDesqualificados,
    loading,
    error
  };
};
