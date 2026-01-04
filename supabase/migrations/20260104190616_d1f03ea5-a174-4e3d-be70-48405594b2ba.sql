-- =============================================
-- PHASE 1.2: ADD workspace_id TO EXISTING TABLES
-- =============================================

-- 1. Add workspace_id to colaboradores
ALTER TABLE public.colaboradores 
ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id);

-- 2. Add workspace_id to vendas
ALTER TABLE public.vendas 
ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id);

-- 3. Add workspace_id to agendamentos
ALTER TABLE public.agendamentos 
ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id);

-- 4. Add workspace_id to metas_mensais
ALTER TABLE public.metas_mensais 
ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id);

-- 5. Add workspace_id to leads_crm
ALTER TABLE public.leads_crm 
ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id);

-- 6. Add workspace_id to leads_crm_historico
ALTER TABLE public.leads_crm_historico 
ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id);

-- 7. Migrate existing data to default workspace
UPDATE public.colaboradores SET workspace_id = '00000000-0000-0000-0000-000000000001' WHERE workspace_id IS NULL;
UPDATE public.vendas SET workspace_id = '00000000-0000-0000-0000-000000000001' WHERE workspace_id IS NULL;
UPDATE public.agendamentos SET workspace_id = '00000000-0000-0000-0000-000000000001' WHERE workspace_id IS NULL;
UPDATE public.metas_mensais SET workspace_id = '00000000-0000-0000-0000-000000000001' WHERE workspace_id IS NULL;
UPDATE public.leads_crm SET workspace_id = '00000000-0000-0000-0000-000000000001' WHERE workspace_id IS NULL;
UPDATE public.leads_crm_historico SET workspace_id = '00000000-0000-0000-0000-000000000001' WHERE workspace_id IS NULL;

-- 8. Create indexes for workspace_id (performance)
CREATE INDEX idx_colaboradores_workspace ON public.colaboradores(workspace_id);
CREATE INDEX idx_vendas_workspace ON public.vendas(workspace_id);
CREATE INDEX idx_agendamentos_workspace ON public.agendamentos(workspace_id);
CREATE INDEX idx_metas_mensais_workspace ON public.metas_mensais(workspace_id);
CREATE INDEX idx_leads_crm_workspace ON public.leads_crm(workspace_id);
CREATE INDEX idx_leads_crm_historico_workspace ON public.leads_crm_historico(workspace_id);