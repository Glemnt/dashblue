import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

const CACHE_KEY = 'meta_campaigns_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheData {
  campanhas: CampanhaData[];
  timestamp: number;
}

const getCachedData = (): CampanhaData[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: CacheData = JSON.parse(cached);
    const now = Date.now();
    
    if (now - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data.campanhas;
  } catch {
    return null;
  }
};

const setCachedData = (campanhas: CampanhaData[]) => {
  try {
    const data: CacheData = {
      campanhas,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore cache errors
  }
};

export const useMetaCampaigns = (): UseMetaCampaignsReturn => {
  const [campanhas, setCampanhas] = useState<CampanhaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isFromMeta, setIsFromMeta] = useState(false);

  const fetchCampaigns = useCallback(async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (useCache) {
        const cached = getCachedData();
        if (cached && cached.length > 0) {
          console.log('Using cached Meta campaigns data');
          setCampanhas(cached);
          setIsFromMeta(true);
          setLastUpdate(new Date());
          setLoading(false);
          return;
        }
      }

      console.log('Fetching Meta campaigns from Edge Function...');
      
      const { data, error: fetchError } = await supabase.functions.invoke('fetch-meta-campaigns');

      if (fetchError) {
        console.error('Edge function error:', fetchError);
        throw new Error(fetchError.message || 'Erro ao conectar com a API da Meta');
      }

      if (data?.error) {
        console.error('Meta API error:', data.error, data.details);
        throw new Error(data.details || data.message || 'Erro na API da Meta');
      }

      if (data?.success && data?.campanhas && data.campanhas.length > 0) {
        console.log(`Received ${data.campanhas.length} campaigns from Meta`);
        setCampanhas(data.campanhas);
        setCachedData(data.campanhas);
        setIsFromMeta(true);
        setLastUpdate(new Date(data.meta?.fetchedAt || Date.now()));
      } else {
        console.log('No campaigns from Meta, using mock data');
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
  }, []);

  const refetch = useCallback(async () => {
    await fetchCampaigns(false); // Force refresh, no cache
  }, [fetchCampaigns]);

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
