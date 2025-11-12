import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

interface UseLeadsReturn {
  totalLeads: number;
  totalMQLs: number;
  totalDesqualificados: number;
  loading: boolean;
  error: string | null;
  isRefetching: boolean;
}

const LEADS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTiBWb4KkxNxK-WwtnetmSBqedeaGkJ1zyjJf1xd07v_v9LevCbDMX2rSttHCbcWz2dU3ce3JO7lDWv/pub?gid=1680388014&single=true&output=csv";

export const useGoogleSheetsLeads = (): UseLeadsReturn => {
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [totalMQLs, setTotalMQLs] = useState<number>(0);
  const [totalDesqualificados, setTotalDesqualificados] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (isInitialLoad = false) => {
    try {
      setError(null);
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setIsRefetching(true);
      }
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
          
          // Debug: Verificar colunas disponíveis
          console.log('📧 LEADS - Headers disponíveis:', Object.keys(leadsValidos[0] || {}));
          console.log('📧 LEADS - Primeira linha:', leadsValidos[0]);
          
          // Verificar se a coluna Status_Lead existe
          const temStatusLead = leadsValidos[0] && leadsValidos[0].hasOwnProperty('Status_Lead');
          console.log('📧 LEADS - Coluna Status_Lead existe?', temStatusLead);
          
          if (temStatusLead) {
            const valoresUnicos = [...new Set(leadsValidos.map(row => row['Status_Lead']))].filter(v => v);
            console.log('📧 LEADS - Valores únicos em Status_Lead:', valoresUnicos);
          }
          
          // Contar MQLs (coluna Status_Lead = "MQL")
          const mqls = leadsValidos.filter((row: any) => {
            const statusLead = row['Status_Lead'] || row['STATUS_LEAD'] || row['status_lead'];
            
            if (!statusLead) return false;
            
            const valor = String(statusLead).trim().toUpperCase();
            return valor === 'MQL';
          });
          
          // Contar Desqualificados (coluna Status_Lead = "Desqualificado")
          const desqualificados = leadsValidos.filter((row: any) => {
            const statusLead = row['Status_Lead'] || row['STATUS_LEAD'] || row['status_lead'];
            
            if (!statusLead) return false;
            
            const valor = String(statusLead).trim().toUpperCase();
            return valor === 'DESQUALIFICADO';
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
          setIsRefetching(false);
        },
        error: (err) => {
          console.error('❌ Erro no parsing CSV leads:', err);
          setError(`Erro ao processar CSV: ${err.message}`);
          setLoading(false);
          setIsRefetching(false);
        }
      });
    } catch (err) {
      console.error('❌ Erro no fetch leads:', err);
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

  return {
    totalLeads,
    totalMQLs,
    totalDesqualificados,
    loading,
    error,
    isRefetching
  };
};
