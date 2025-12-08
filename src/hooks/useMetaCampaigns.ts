import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from '@/utils/dateFilters';
import { 
  CampanhaData, 
  TrafegoTotais, 
  CanalMetrics,
  calcularMetricasPorCanal,
  campanhasMock 
} from '@/utils/trafegoMetricsCalculator';
import { RealFinancialsData } from './useRealFinancials';

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
const TAXA_QUALIFICACAO_MERCADO = 0.60; // 60% - média de mercado

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

const clearCache = (monthKey?: string) => {
  try {
    if (monthKey) {
      localStorage.removeItem(getCacheKey(monthKey));
      console.log(`Cache cleared for ${monthKey}`);
    } else {
      // Clear all meta campaigns cache
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('meta_campaigns_')) {
          localStorage.removeItem(key);
        }
      });
      console.log('All Meta campaigns cache cleared');
    }
  } catch {
    // Ignore cache errors
  }
};

// Calcula totais com dados financeiros reais
const calcularTotaisComDadosReais = (
  campanhas: CampanhaData[],
  realFinancials: RealFinancialsData
): TrafegoTotais => {
  // Totais dos dados da Meta (investimento, leads, cliques, etc.)
  const totaisBase = campanhas.reduce((acc, c) => ({
    investimento: acc.investimento + c.investimento,
    impressoes: acc.impressoes + c.impressoes,
    cliques: acc.cliques + c.cliques,
    leads: acc.leads + c.leadsGerados,
  }), {
    investimento: 0,
    impressoes: 0,
    cliques: 0,
    leads: 0,
  });

  // Métricas derivadas dos dados da Meta
  const ctr = totaisBase.impressoes > 0 ? (totaisBase.cliques / totaisBase.impressoes) * 100 : 0;
  const cpc = totaisBase.cliques > 0 ? totaisBase.investimento / totaisBase.cliques : 0;
  const cpl = totaisBase.leads > 0 ? totaisBase.investimento / totaisBase.leads : 0;

  // DADOS REAIS da planilha financeira
  const fechamentos = realFinancials.totalFechamentos;
  const receita = realFinancials.receitaTotal;

  // Leads qualificados estimados (usando taxa de mercado)
  const leadsQualificados = Math.round(totaisBase.leads * TAXA_QUALIFICACAO_MERCADO);
  const taxaQualificacao = totaisBase.leads > 0 ? (leadsQualificados / totaisBase.leads) * 100 : 0;

  // Calls estimadas (baseadas nos fechamentos reais)
  // Se temos X fechamentos e taxa de conversão ~20%, temos ~5X calls realizadas
  const callsRealizadas = fechamentos > 0 ? Math.round(fechamentos / 0.2) : 0;
  const callsAgendadas = callsRealizadas > 0 ? Math.round(callsRealizadas / 0.85) : 0;

  // Métricas financeiras REAIS
  const roas = totaisBase.investimento > 0 ? receita / totaisBase.investimento : 0;
  const roi = totaisBase.investimento > 0 ? ((receita - totaisBase.investimento) / totaisBase.investimento) * 100 : 0;
  const cac = fechamentos > 0 ? totaisBase.investimento / fechamentos : 0;

  console.log('📊 TOTAIS CALCULADOS COM DADOS REAIS:');
  console.log('  - Investimento (Meta):', totaisBase.investimento);
  console.log('  - Leads (Meta):', totaisBase.leads);
  console.log('  - Fechamentos (Real):', fechamentos);
  console.log('  - Receita (Real):', receita);
  console.log('  - ROAS (Real):', roas.toFixed(2));
  console.log('  - ROI (Real):', roi.toFixed(2) + '%');
  console.log('  - CAC (Real):', cac.toFixed(2));

  return {
    investimento: totaisBase.investimento,
    impressoes: totaisBase.impressoes,
    cliques: totaisBase.cliques,
    ctr,
    cpc,
    leads: totaisBase.leads,
    cpl,
    leadsQualificados,
    taxaQualificacao,
    callsAgendadas,
    callsRealizadas,
    fechamentos,
    receita,
    roas,
    roi,
    cac
  };
};

// Distribui dados financeiros reais proporcionalmente para cada campanha
const distribuirDadosReaisParaCampanhas = (
  campanhas: CampanhaData[],
  realFinancials: RealFinancialsData
): CampanhaData[] => {
  const totalInvestimento = campanhas.reduce((sum, c) => sum + c.investimento, 0);
  
  if (totalInvestimento === 0) return campanhas;

  return campanhas.map(campanha => {
    // Proporção desta campanha no investimento total
    const proporcao = campanha.investimento / totalInvestimento;
    
    // Leads qualificados (taxa de mercado)
    const leadsQualificados = Math.round(campanha.leadsGerados * TAXA_QUALIFICACAO_MERCADO);
    const taxaQualificacao = campanha.leadsGerados > 0 
      ? (leadsQualificados / campanha.leadsGerados) * 100 
      : 0;

    // Distribuir fechamentos e receita proporcionalmente
    const fechamentos = Math.round(realFinancials.totalFechamentos * proporcao);
    const valorFechado = realFinancials.receitaTotal * proporcao;
    const ticketMedio = fechamentos > 0 ? valorFechado / fechamentos : realFinancials.ticketMedio;

    // Calls estimadas baseadas nos fechamentos
    const callsRealizadas = fechamentos > 0 ? Math.round(fechamentos / 0.2) : 0;
    const callsAgendadas = callsRealizadas > 0 ? Math.round(callsRealizadas / 0.85) : 0;

    // Métricas financeiras baseadas nos valores proporcionais
    const roas = campanha.investimento > 0 ? valorFechado / campanha.investimento : 0;
    const roi = campanha.investimento > 0 
      ? ((valorFechado - campanha.investimento) / campanha.investimento) * 100 
      : 0;
    const cac = fechamentos > 0 ? campanha.investimento / fechamentos : 0;

    return {
      ...campanha,
      leadsQualificados,
      taxaQualificacao,
      callsAgendadas,
      callsRealizadas,
      fechamentos,
      valorFechado,
      roas,
      roi,
      cac,
      ticketMedio
    };
  });
};

export const useMetaCampaigns = (
  dateRange: DateRange,
  selectedMonthKey?: string,
  realFinancials?: RealFinancialsData
): UseMetaCampaignsReturn => {
  const [rawCampanhas, setRawCampanhas] = useState<CampanhaData[]>([]);
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
          setRawCampanhas(cached);
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
        setRawCampanhas(data.campanhas);
        setCachedData(monthKey, data.campanhas);
        setIsFromMeta(true);
        setLastUpdate(new Date(data.meta?.fetchedAt || Date.now()));
      } else {
        console.log(`No campaigns from Meta for ${monthKey}, using mock data`);
        setRawCampanhas(campanhasMock);
        setIsFromMeta(false);
        setLastUpdate(new Date());
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Error fetching Meta campaigns:', errorMessage);
      setError(errorMessage);
      
      // Fallback to mock data
      console.log('Falling back to mock data');
      setRawCampanhas(campanhasMock);
      setIsFromMeta(false);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, [dateRange.start, dateRange.end, monthKey]);

  const refetch = useCallback(async () => {
    // Clear cache before refetching
    clearCache(monthKey);
    await fetchCampaigns(false); // Force refresh, no cache
  }, [fetchCampaigns, monthKey]);

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

  // Campanhas com dados reais distribuídos
  const campanhas = useMemo(() => {
    if (!realFinancials || realFinancials.loading || realFinancials.totalFechamentos === 0) {
      return rawCampanhas;
    }
    return distribuirDadosReaisParaCampanhas(rawCampanhas, realFinancials);
  }, [rawCampanhas, realFinancials]);

  // Totais com dados reais
  const totais = useMemo(() => {
    if (!realFinancials || realFinancials.loading) {
      // Fallback: calcular normalmente sem dados reais
      return campanhas.reduce((acc, c) => ({
        investimento: acc.investimento + c.investimento,
        impressoes: acc.impressoes + c.impressoes,
        cliques: acc.cliques + c.cliques,
        ctr: 0,
        cpc: 0,
        leads: acc.leads + c.leadsGerados,
        cpl: 0,
        leadsQualificados: acc.leadsQualificados + c.leadsQualificados,
        taxaQualificacao: 0,
        callsAgendadas: acc.callsAgendadas + c.callsAgendadas,
        callsRealizadas: acc.callsRealizadas + c.callsRealizadas,
        fechamentos: acc.fechamentos + c.fechamentos,
        receita: acc.receita + c.valorFechado,
        roas: 0,
        roi: 0,
        cac: 0
      }), {
        investimento: 0,
        impressoes: 0,
        cliques: 0,
        ctr: 0,
        cpc: 0,
        leads: 0,
        cpl: 0,
        leadsQualificados: 0,
        taxaQualificacao: 0,
        callsAgendadas: 0,
        callsRealizadas: 0,
        fechamentos: 0,
        receita: 0,
        roas: 0,
        roi: 0,
        cac: 0
      });
    }
    return calcularTotaisComDadosReais(rawCampanhas, realFinancials);
  }, [rawCampanhas, campanhas, realFinancials]);

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
