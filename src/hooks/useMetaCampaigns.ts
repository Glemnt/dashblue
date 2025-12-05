import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from '@/utils/dateFilters';
import { 
  CampanhaData, 
  TrafegoTotais, 
  CanalMetrics,
  calcularTotaisTrafego,
  calcularMetricasPorCanal,
  campanhasMock 
} from '@/utils/trafegoMetricsCalculator';

interface UseMetaCampaignsReturn {
  campanhas: CampanhaData[];
  totais: TrafegoTotais;
  canais: CanalMetrics[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdate: Date | null;
  isFromMeta: boolean;
}

interface CacheData {
  campanhas: CampanhaData[];
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (monthKey: string) => `meta_campaigns_${monthKey}`;

const getCachedData = (monthKey: string): CampanhaData[] | null => {
  try {
    const cacheKey = getCacheKey(monthKey);
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;
    
    const data: CacheData = JSON.parse(cached);
    const now = Date.now();
    
    if (now - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return data.campanhas;
  } catch {
    return null;
  }
};

const setCachedData = (monthKey: string, campanhas: CampanhaData[]) => {
  try {
    const cacheKey = getCacheKey(monthKey);
    const data: CacheData = {
      campanhas,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(data));
  } catch {
    // Ignore cache errors
  }
};

export const useMetaCampaigns = (
  dateRange: DateRange,
  selectedMonthKey?: string
): UseMetaCampaignsReturn => {
  const [campanhas, setCampanhas] = useState<CampanhaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isFromMeta, setIsFromMeta] = useState(false);

  const monthKey = selectedMonthKey || format(dateRange.start, 'yyyy-MM');

  const fetchCampaigns = useCallback(async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (useCache) {
        const cached = getCachedData(monthKey);
        if (cached && cached.length > 0) {
          console.log(`Using cached Meta campaigns data for ${monthKey}`);
          setCampanhas(cached);
          setIsFromMeta(true);
          setLastUpdate(new Date());
          setLoading(false);
          return;
        }
      }

      // Format dates for the API
      const startDate = format(dateRange.start, 'yyyy-MM-dd');
      const endDate = format(dateRange.end, 'yyyy-MM-dd');

      console.log(`Fetching Meta campaigns from ${startDate} to ${endDate}...`);
      
      const { data, error: fetchError } = await supabase.functions.invoke('fetch-meta-campaigns', {
        body: { startDate, endDate }
      });

      if (fetchError) {
        console.error('Edge function error:', fetchError);
        throw new Error(fetchError.message || 'Erro ao conectar com a API da Meta');
      }

      if (data?.error) {
        console.error('Meta API error:', data.error, data.details);
        throw new Error(data.details || data.message || 'Erro na API da Meta');
      }

      if (data?.success && data?.campanhas && data.campanhas.length > 0) {
        console.log(`Received ${data.campanhas.length} campaigns from Meta for ${monthKey}`);
        setCampanhas(data.campanhas);
        setCachedData(monthKey, data.campanhas);
        setIsFromMeta(true);
        setLastUpdate(new Date(data.meta?.fetchedAt || Date.now()));
      } else {
        console.log(`No campaigns from Meta for ${monthKey}, using mock data`);
        setCampanhas(campanhasMock);
        setIsFromMeta(false);
        setLastUpdate(new Date());
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Error fetching Meta campaigns:', errorMessage);
      setError(errorMessage);
      
      // Fallback to mock data
      console.log('Falling back to mock data');
      setCampanhas(campanhasMock);
      setIsFromMeta(false);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, [dateRange.start, dateRange.end, monthKey]);

  const refetch = useCallback(async () => {
    await fetchCampaigns(false); // Force refresh, no cache
  }, [fetchCampaigns]);

  // Fetch when dateRange or monthKey changes
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCampaigns(false);
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [fetchCampaigns]);

  const totais = calcularTotaisTrafego(campanhas);
  const canais = calcularMetricasPorCanal(campanhas);

  return {
    campanhas,
    totais,
    canais,
    loading,
    error,
    refetch,
    lastUpdate,
    isFromMeta
  };
};
