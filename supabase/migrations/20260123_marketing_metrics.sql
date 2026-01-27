-- Tabela para armazenar métricas de marketing (Meta Ads)
CREATE TABLE marketing_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  campanha_id TEXT NOT NULL,
  campanha_nome TEXT,
  objetivo TEXT CHECK (objetivo IN ('WhatsApp', 'Formulário', 'Landing Page', 'VSL', 'Outros')),
  investimento NUMERIC DEFAULT 0,
  impressoes INTEGER DEFAULT 0,
  cliques INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  cpl NUMERIC DEFAULT 0,
  ctr NUMERIC DEFAULT 0,
  cpc NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint para evitar duplicatas
  UNIQUE(data, campanha_id)
);

-- Índices para performance
CREATE INDEX idx_marketing_metrics_data ON marketing_metrics(data);
CREATE INDEX idx_marketing_metrics_campanha_id ON marketing_metrics(campanha_id);
CREATE INDEX idx_marketing_metrics_objetivo ON marketing_metrics(objetivo);

-- Habilitar RLS
ALTER TABLE marketing_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Allow public read marketing_metrics" ON marketing_metrics FOR SELECT TO anon USING (true);
CREATE POLICY "Allow service role full access marketing_metrics" ON marketing_metrics FOR ALL USING (true) WITH CHECK (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_marketing_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_update_marketing_metrics_updated_at
  BEFORE UPDATE ON marketing_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_marketing_metrics_updated_at();
