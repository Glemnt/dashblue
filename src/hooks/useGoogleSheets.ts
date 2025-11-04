import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { getCurrentMonthSheetUrl, getSheetUrlForPeriod, getSheetUrlByMonthKey } from '@/utils/sheetUrlManager';
import { DateRange } from '@/utils/dateFilters';

interface UseGoogleSheetsReturn {
  data: any[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refetch: () => void;
  isRefetching: boolean;
}

export const useGoogleSheets = (dateRange?: DateRange, monthKey?: string): UseGoogleSheetsReturn => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async (isInitialLoad = false) => {
    try {
      setError(null);
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setIsRefetching(true);
      }
      
      // URL dinâmica: priorizar monthKey, depois dateRange, depois mês atual
      let csvUrl: string;
      if (monthKey) {
        csvUrl = getSheetUrlByMonthKey(monthKey);
        console.log('📊 Buscando planilha por monthKey:', monthKey, csvUrl);
      } else if (dateRange) {
        csvUrl = getSheetUrlForPeriod(dateRange);
        console.log('📊 Buscando planilha por dateRange:', csvUrl);
      } else {
        csvUrl = getCurrentMonthSheetUrl();
        console.log('📊 Buscando planilha do mês atual:', csvUrl);
      }
      
      const response = await fetch(csvUrl);
      
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
          setIsRefetching(false);
        },
        error: (err) => {
          console.error('❌ Erro no parsing CSV:', err);
          setError(`Erro ao processar CSV: ${err.message}`);
          setLoading(false);
          setIsRefetching(false);
        }
      });
    } catch (err) {
      console.error('❌ Erro no fetch:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao buscar dados');
      setLoading(false);
      setIsRefetching(false);
    }
  }, [dateRange, monthKey]);

  useEffect(() => {
    fetchData(true); // Carregamento inicial
    
    // Auto-refresh a cada 10 segundos (silencioso)
    const interval = setInterval(() => {
      fetchData(false); // Refresh sem loading completo
    }, 10000);
    
    return () => clearInterval(interval);
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData(false); // Refresh manual também é silencioso
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refetch,
    isRefetching
  };
};
