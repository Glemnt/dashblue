-- =============================================
-- PHASE 1.3: REPLACE WEAK RLS WITH REAL POLICIES
-- =============================================

-- 1. DROP old weak policies for colaboradores
DROP POLICY IF EXISTS "Allow public delete colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Allow public insert colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Allow public read colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Allow public update colaboradores" ON public.colaboradores;

-- 2. CREATE real policies for colaboradores
CREATE POLICY "Users can view workspace colaboradores"
ON public.colaboradores FOR SELECT
TO authenticated
USING (public.has_workspace_access(workspace_id));

CREATE POLICY "Admins can insert colaboradores"
ON public.colaboradores FOR INSERT
TO authenticated
WITH CHECK (public.has_workspace_access(workspace_id, 'admin'));

CREATE POLICY "Admins can update colaboradores"
ON public.colaboradores FOR UPDATE
TO authenticated
USING (public.has_workspace_access(workspace_id, 'admin'));

CREATE POLICY "Admins can delete colaboradores"
ON public.colaboradores FOR DELETE
TO authenticated
USING (public.has_workspace_access(workspace_id, 'admin'));

-- 3. DROP old weak policies for vendas
DROP POLICY IF EXISTS "Allow public delete vendas" ON public.vendas;
DROP POLICY IF EXISTS "Allow public insert vendas" ON public.vendas;
DROP POLICY IF EXISTS "Allow public read vendas" ON public.vendas;
DROP POLICY IF EXISTS "Allow public update vendas" ON public.vendas;

-- 4. CREATE real policies for vendas
CREATE POLICY "Users can view workspace vendas"
ON public.vendas FOR SELECT
TO authenticated
USING (public.has_workspace_access(workspace_id));

CREATE POLICY "Editors can insert vendas"
ON public.vendas FOR INSERT
TO authenticated
WITH CHECK (public.has_workspace_access(workspace_id, 'editor'));

CREATE POLICY "Editors can update vendas"
ON public.vendas FOR UPDATE
TO authenticated
USING (public.has_workspace_access(workspace_id, 'editor'));

CREATE POLICY "Admins can delete vendas"
ON public.vendas FOR DELETE
TO authenticated
USING (public.has_workspace_access(workspace_id, 'admin'));

-- 5. DROP old weak policies for agendamentos
DROP POLICY IF EXISTS "Allow public delete agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Allow public insert agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Allow public read agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Allow public update agendamentos" ON public.agendamentos;

-- 6. CREATE real policies for agendamentos
CREATE POLICY "Users can view workspace agendamentos"
ON public.agendamentos FOR SELECT
TO authenticated
USING (public.has_workspace_access(workspace_id));

CREATE POLICY "Editors can insert agendamentos"
ON public.agendamentos FOR INSERT
TO authenticated
WITH CHECK (public.has_workspace_access(workspace_id, 'editor'));

CREATE POLICY "Editors can update agendamentos"
ON public.agendamentos FOR UPDATE
TO authenticated
USING (public.has_workspace_access(workspace_id, 'editor'));

CREATE POLICY "Admins can delete agendamentos"
ON public.agendamentos FOR DELETE
TO authenticated
USING (public.has_workspace_access(workspace_id, 'admin'));

-- 7. DROP old weak policies for metas_mensais
DROP POLICY IF EXISTS "Allow public delete metas_mensais" ON public.metas_mensais;
DROP POLICY IF EXISTS "Allow public insert metas_mensais" ON public.metas_mensais;
DROP POLICY IF EXISTS "Allow public read metas_mensais" ON public.metas_mensais;
DROP POLICY IF EXISTS "Allow public update metas_mensais" ON public.metas_mensais;

-- 8. CREATE real policies for metas_mensais
CREATE POLICY "Users can view workspace metas"
ON public.metas_mensais FOR SELECT
TO authenticated
USING (public.has_workspace_access(workspace_id));

CREATE POLICY "Admins can insert metas"
ON public.metas_mensais FOR INSERT
TO authenticated
WITH CHECK (public.has_workspace_access(workspace_id, 'admin'));

CREATE POLICY "Admins can update metas"
ON public.metas_mensais FOR UPDATE
TO authenticated
USING (public.has_workspace_access(workspace_id, 'admin'));

CREATE POLICY "Admins can delete metas"
ON public.metas_mensais FOR DELETE
TO authenticated
USING (public.has_workspace_access(workspace_id, 'admin'));

-- 9. DROP old weak policies for leads_crm
DROP POLICY IF EXISTS "Service role full access leads_crm" ON public.leads_crm;

-- 10. CREATE real policies for leads_crm
CREATE POLICY "Users can view workspace leads"
ON public.leads_crm FOR SELECT
TO authenticated
USING (public.has_workspace_access(workspace_id));

CREATE POLICY "Service role full access leads_crm"
ON public.leads_crm FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 11. DROP old weak policies for leads_crm_historico
DROP POLICY IF EXISTS "Service role full access leads_crm_historico" ON public.leads_crm_historico;

-- 12. CREATE real policies for leads_crm_historico
CREATE POLICY "Users can view workspace lead history"
ON public.leads_crm_historico FOR SELECT
TO authenticated
USING (public.has_workspace_access(workspace_id));

CREATE POLICY "Service role full access leads_crm_historico"
ON public.leads_crm_historico FOR ALL
TO service_role
USING (true)
WITH CHECK (true);