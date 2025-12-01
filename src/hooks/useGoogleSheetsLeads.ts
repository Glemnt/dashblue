import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { getLeadSourceUrls, getTargetMonthNumber, parseLeadDate, LeadSource } from '@/utils/leadsSheetUrlManager';

interface UseLeadsReturn {
  totalLeads: number;
  totalMQLs: number;
  totalDesqualificados: number;
  leadsPorFonte: Record<string, number>;
  loading: boolean;
  error: string | null;
  isRefetching: boolean;
}

export const useGoogleSheetsLeads = (monthKey?: string): UseLeadsReturn => {
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [totalMQLs, setTotalMQLs] = useState<number>(0);
  const [totalDesqualificados, setTotalDesqualificados] = useState<number>(0);
  const [leadsPorFonte, setLeadsPorFonte] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSingleSheet = async (url: string, source: LeadSource): Promise<{ leads: any[]; source: LeadSource }> => {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar ${source.name}: ${response.status}`);
    }
    
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve({ leads: results.data, source });
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  };

  const fetchData = useCallback(async (isInitialLoad = false) => {
    try {
      setError(null);
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setIsRefetching(true);
      }
      
      const sourceUrls = getLeadSourceUrls(monthKey);
      const targetMonth = getTargetMonthNumber(monthKey);
      
      console.log(`📧 LEADS - Buscando ${sourceUrls.length} planilhas para mês ${targetMonth + 1}`);
      
      // Buscar todas as planilhas em paralelo
      const results = await Promise.all(
        sourceUrls.map(({ url, source }) => 
          fetchSingleSheet(url, source).catch(err => {
            console.warn(`⚠️ Erro ao buscar ${source.name}:`, err);
            return { leads: [], source };
          })
        )
      );
      
      // Processar e filtrar leads por mês
      let totalCount = 0;
      const countBySource: Record<string, number> = {};
      
      for (const { leads, source } of results) {
        // Filtrar leads válidos (com email ou nome)
        const leadsValidos = leads.filter((row: any) => {
          return row['Email'] || row['email'] || row['EMAIL'] || 
                 row['Nome'] || row['nome'] || row['NOME'] ||
                 row['full_name'] || row['phone_number'];
        });
        
        // Filtrar por mês
        const leadsDoMes = leadsValidos.filter((row: any) => {
          // Procurar coluna de data em vários formatos possíveis
          const dataStr = row['Data'] || row['DATA'] || row['data'] || 
                         row['created_time'] || row['Timestamp'] || row['timestamp'] ||
                         row['Data de Criação'] || row['Data_Criacao'] ||
                         row['submitted_at'] || row['date'];
          
          if (!dataStr) {
            // Se não tiver data, incluir o lead (pode ser um campo não mapeado)
            return true;
          }
          
          const date = parseLeadDate(dataStr);
          
          if (!date) {
            console.warn(`⚠️ Não foi possível parsear data: ${dataStr}`);
            return true; // Incluir se não conseguir parsear
          }
          
          return date.getMonth() === targetMonth;
        });
        
        console.log(`📧 ${source.name}: ${leadsDoMes.length}/${leadsValidos.length} leads no mês ${targetMonth + 1}`);
        
        countBySource[source.key] = leadsDoMes.length;
        totalCount += leadsDoMes.length;
      }
      
      console.log(`📧 LEADS - Total consolidado: ${totalCount} leads`);
      
      setTotalLeads(totalCount);
      setTotalMQLs(0); // Por enquanto zerado conforme solicitado
      setTotalDesqualificados(0);
      setLeadsPorFonte(countBySource);
      setLoading(false);
      setIsRefetching(false);
      
    } catch (err) {
      console.error('❌ Erro ao buscar leads:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLoading(false);
      setIsRefetching(false);
    }
  }, [monthKey]);

  useEffect(() => {
    fetchData(true);
    
    const interval = setInterval(() => {
      fetchData(false);
    }, 30000); // Refresh a cada 30 segundos
    
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    totalLeads,
    totalMQLs,
    totalDesqualificados,
    leadsPorFonte,
    loading,
    error,
    isRefetching
  };
};
