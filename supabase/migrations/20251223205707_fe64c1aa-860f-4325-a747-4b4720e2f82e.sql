-- Tabela principal de leads sincronizados do Kommo CRM
CREATE TABLE public.leads_crm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kommo_id BIGINT UNIQUE NOT NULL,
  
  -- Dados do Lead
  nome TEXT,
  email TEXT,
  telefone TEXT,
  empresa TEXT,
  
  -- Status e Pipeline
  status TEXT NOT NULL DEFAULT 'NOVO',
  pipeline_nome TEXT,
  stage_nome TEXT,
  
  -- Responsáveis
  sdr_nome TEXT,
  closer_nome TEXT,
  responsavel_id BIGINT,
  responsavel_nome TEXT,
  
  -- Qualificação
  is_mql BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  
  -- Valores
  valor_contrato DECIMAL(12,2),
  motivo_perda TEXT,
  
  -- Timestamps
  data_entrada TIMESTAMPTZ DEFAULT NOW(),
  data_mql TIMESTAMPTZ,
  data_reuniao TIMESTAMPTZ,
  data_closer TIMESTAMPTZ,
  data_ganho TIMESTAMPTZ,
  data_perdido TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadados Kommo
  kommo_payload JSONB
);

-- Tabela de histórico de mudanças dos leads
CREATE TABLE public.leads_crm_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads_crm(id) ON DELETE CASCADE,
  kommo_id BIGINT,
  status_anterior TEXT,
  status_novo TEXT,
  campo_alterado TEXT,
  valor_anterior TEXT,
  valor_novo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_leads_crm_kommo_id ON public.leads_crm(kommo_id);
CREATE INDEX idx_leads_crm_status ON public.leads_crm(status);
CREATE INDEX idx_leads_crm_sdr_nome ON public.leads_crm(sdr_nome);
CREATE INDEX idx_leads_crm_closer_nome ON public.leads_crm(closer_nome);
CREATE INDEX idx_leads_crm_is_mql ON public.leads_crm(is_mql);
CREATE INDEX idx_leads_crm_data_entrada ON public.leads_crm(data_entrada);
CREATE INDEX idx_leads_crm_historico_lead_id ON public.leads_crm_historico(lead_id);
CREATE INDEX idx_leads_crm_historico_kommo_id ON public.leads_crm_historico(kommo_id);

-- Habilitar RLS (tabelas internas, apenas acesso via service role)
ALTER TABLE public.leads_crm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads_crm_historico ENABLE ROW LEVEL SECURITY;

-- Políticas para service role (webhooks)
CREATE POLICY "Service role full access leads_crm" ON public.leads_crm
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access leads_crm_historico" ON public.leads_crm_historico
  FOR ALL USING (true) WITH CHECK (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_leads_crm_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_update_leads_crm_updated_at
  BEFORE UPDATE ON public.leads_crm
  FOR EACH ROW
  EXECUTE FUNCTION public.update_leads_crm_updated_at();