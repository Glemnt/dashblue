// Helper file to provide properly typed Supabase queries
// This works around the auto-generated types.generated.ts not being synced yet
import { supabase } from './client';
import type { Database } from './types';

// Re-export supabase with correct types
// This is a type-safe wrapper that uses the manually defined Database type
export const db = supabase as unknown as ReturnType<
  typeof import('@supabase/supabase-js').createClient<Database>
>;

// Export commonly used types
export type Tables = Database['public']['Tables'];
export type AppRole = Database['public']['Enums']['app_role'];

// Workspace types
export type Workspace = Tables['workspaces']['Row'];
export type WorkspaceInsert = Tables['workspaces']['Insert'];
export type WorkspaceMember = Tables['workspace_members']['Row'];
export type WorkspaceMemberInsert = Tables['workspace_members']['Insert'];

// Profile types  
export type Profile = Tables['profiles']['Row'];
export type ProfileInsert = Tables['profiles']['Insert'];

// Business types
export type Colaborador = Tables['colaboradores']['Row'];
export type Venda = Tables['vendas']['Row'];
export type Agendamento = Tables['agendamentos']['Row'];
export type MetaMensal = Tables['metas_mensais']['Row'];
export type LeadCrm = Tables['leads_crm']['Row'];
