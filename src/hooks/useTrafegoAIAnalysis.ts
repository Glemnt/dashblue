import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CampanhaData, TrafegoTotais, CanalMetrics } from '@/utils/trafegoMetricsCalculator';

interface Alerta {
  campanha: string;
  problema?: string;
  oportunidade?: string;
  acao: string;
  impacto?: string;
  potencial?: string;
  ganhoEstimado?: string;
}

interface Recomendacao {
  prioridade: number;
  titulo: string;
  descricao: string;
  ganhoEstimado: string;
}

interface AIAnalysis {
  executiveSummary: string;
  projecoes: {
    investimentoProjetado: number;
    leadsProjetados: number;
    fechamentosProjetados: number;
    roasProjetado: number;
    cacProjetado: number;
    conclusao: string;
  };
  alertas: {
    urgentes: Alerta[];
    atencao: Alerta[];
    oportunidades: Alerta[];
  };
  recomendacoes: Recomendacao[];
}

interface UseTrafegoAIAnalysisReturn {
  analysis: AIAnalysis | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  nextUpdate: Date | null;
  refetch: () => Promise<void>;
  isAnalyzing: boolean;
}

const CACHE_KEY = 'trafego_ai_analysis';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

const getCachedAnalysis = (): { analysis: AIAnalysis; timestamp: number } | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const parsed = JSON.parse(cached);
    const age = Date.now() - parsed.timestamp;
    
    if (age > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return parsed;
  } catch {
    return null;
  }
};

const setCachedAnalysis = (analysis: AIAnalysis) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    analysis,
    timestamp: Date.now()
  }));
};

export const useTrafegoAIAnalysis = (
  campanhas: CampanhaData[],
  totais: TrafegoTotais,
  canais: CanalMetrics[]
): UseTrafegoAIAnalysisReturn => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [nextUpdate, setNextUpdate] = useState<Date | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialized = useRef(false);

  const fetchAnalysis = useCallback(async (forceRefresh = false) => {
    // Verificar cache primeiro
    if (!forceRefresh) {
      const cached = getCachedAnalysis();
      if (cached) {
        console.log('[useTrafegoAIAnalysis] Usando dados do cache');
        setAnalysis(cached.analysis);
        setLastUpdate(new Date(cached.timestamp));
        setNextUpdate(new Date(cached.timestamp + CACHE_DURATION));
        setLoading(false);
        return;
      }
    }

    // Verificar se temos dados para analisar
    if (!campanhas.length || !totais || totais.investimento === 0) {
      console.log('[useTrafegoAIAnalysis] Dados insuficientes para análise');
      setLoading(false);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      console.log('[useTrafegoAIAnalysis] Iniciando análise da IA...');
      
      // Calcular dias do mês
      const now = new Date();
      const diasNoMes = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const diasDecorridos = now.getDate();

      const { data, error: fnError } = await supabase.functions.invoke('ai-trafego-analyst', {
        body: {
          campanhas,
          totais,
          canais,
          diasNoMes,
          diasDecorridos
        }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data?.success || !data?.analysis) {
        throw new Error(data?.error || 'Resposta inválida da IA');
      }

      console.log('[useTrafegoAIAnalysis] Análise recebida com sucesso');
      
      setAnalysis(data.analysis);
      setCachedAnalysis(data.analysis);
      
      const updateTime = new Date();
      setLastUpdate(updateTime);
      setNextUpdate(new Date(updateTime.getTime() + CACHE_DURATION));
      setError(null);

    } catch (err) {
      console.error('[useTrafegoAIAnalysis] Erro na análise:', err);
      setError(err instanceof Error ? err.message : 'Erro ao analisar dados');
    } finally {
      setLoading(false);
      setIsAnalyzing(false);
    }
  }, [campanhas, totais, canais]);

  // Inicialização
  useEffect(() => {
    if (!hasInitialized.current && campanhas.length > 0 && totais.investimento > 0) {
      hasInitialized.current = true;
      fetchAnalysis();
    }
  }, [campanhas, totais, fetchAnalysis]);

  // Auto-refresh a cada 30 minutos
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      // Só atualiza se a aba estiver ativa
      if (!document.hidden) {
        console.log('[useTrafegoAIAnalysis] Auto-refresh iniciado');
        fetchAnalysis(true);
      }
    }, CACHE_DURATION);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchAnalysis]);

  const refetch = useCallback(async () => {
    await fetchAnalysis(true);
  }, [fetchAnalysis]);

  return {
    analysis,
    loading,
    error,
    lastUpdate,
    nextUpdate,
    refetch,
    isAnalyzing
  };
};
