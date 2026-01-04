-- =============================================
-- PHASE 1: MULTI-TENANT FOUNDATION
-- =============================================

-- 1. Create role enum for RBAC
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'editor', 'viewer');

-- 2. Create workspaces table (tenants)
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plano TEXT DEFAULT 'trial',
  ativo BOOLEAN DEFAULT true,
  configuracoes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create profiles table (additional user data)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create workspace_members table (roles stored here, NOT on profiles)
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- 5. Enable RLS on new tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- 6. Security definer function to check workspace access (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_workspace_access(
  _workspace_id UUID,
  _min_role app_role DEFAULT 'viewer'
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = _workspace_id
      AND user_id = auth.uid()
      AND (
        CASE role
          WHEN 'owner' THEN 4
          WHEN 'admin' THEN 3
          WHEN 'editor' THEN 2
          WHEN 'viewer' THEN 1
        END
      ) >= (
        CASE _min_role
          WHEN 'owner' THEN 4
          WHEN 'admin' THEN 3
          WHEN 'editor' THEN 2
          WHEN 'viewer' THEN 1
        END
      )
  )
$$;

-- 7. Security definer function to get user's workspaces
CREATE OR REPLACE FUNCTION public.get_user_workspaces()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
$$;

-- 8. Function to get user's role in a workspace
CREATE OR REPLACE FUNCTION public.get_user_role(_workspace_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM workspace_members 
  WHERE workspace_id = _workspace_id AND user_id = auth.uid()
$$;

-- 9. Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'nome');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 11. RLS Policies for workspaces
CREATE POLICY "Users can view their workspaces"
ON public.workspaces FOR SELECT
TO authenticated
USING (id IN (SELECT public.get_user_workspaces()));

CREATE POLICY "Owners can update their workspace"
ON public.workspaces FOR UPDATE
TO authenticated
USING (public.has_workspace_access(id, 'owner'));

-- 12. RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- 13. RLS Policies for workspace_members
CREATE POLICY "Users can view members of their workspaces"
ON public.workspace_members FOR SELECT
TO authenticated
USING (workspace_id IN (SELECT public.get_user_workspaces()));

CREATE POLICY "Admins can manage workspace members"
ON public.workspace_members FOR INSERT
TO authenticated
WITH CHECK (public.has_workspace_access(workspace_id, 'admin'));

CREATE POLICY "Admins can update workspace members"
ON public.workspace_members FOR UPDATE
TO authenticated
USING (public.has_workspace_access(workspace_id, 'admin'));

CREATE POLICY "Admins can delete workspace members"
ON public.workspace_members FOR DELETE
TO authenticated
USING (public.has_workspace_access(workspace_id, 'admin'));

-- 14. Create default workspace for existing data migration
INSERT INTO public.workspaces (id, nome, slug, plano)
VALUES ('00000000-0000-0000-0000-000000000001', 'Blue Ocean', 'blue-ocean', 'enterprise');