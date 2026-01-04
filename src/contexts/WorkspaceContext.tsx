import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, type Workspace, type AppRole } from '@/integrations/supabase/db';
import { useAuth } from './AuthContext';

interface WorkspaceContextType {
  workspace: Workspace | null;
  workspaces: Workspace[];
  role: AppRole | null;
  loading: boolean;
  setActiveWorkspace: (workspaceId: string) => void;
  hasPermission: (minRole: AppRole) => boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const ROLE_HIERARCHY: Record<AppRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWorkspaces();
    } else {
      setWorkspace(null);
      setWorkspaces([]);
      setRole(null);
      setLoading(false);
    }
  }, [user]);

  const loadWorkspaces = async () => {
    if (!user) return;

    try {
      // Get user's workspace memberships
      const { data: memberships, error: memberError } = await db
        .from('workspace_members')
        .select('workspace_id, role')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (!memberships || memberships.length === 0) {
        setWorkspaces([]);
        setWorkspace(null);
        setRole(null);
        setLoading(false);
        return;
      }

      // Get workspace details
      const workspaceIds = memberships.map(m => m.workspace_id);
      const { data: workspaceData, error: wsError } = await db
        .from('workspaces')
        .select('*')
        .in('id', workspaceIds);

      if (wsError) throw wsError;

      const typedWorkspaces = workspaceData || [];
      setWorkspaces(typedWorkspaces);

      // Set active workspace (from localStorage or first one)
      const savedWorkspaceId = localStorage.getItem('activeWorkspaceId');
      const activeWs = typedWorkspaces.find(w => w.id === savedWorkspaceId) || typedWorkspaces[0];
      
      if (activeWs) {
        setWorkspace(activeWs);
        const membership = memberships.find(m => m.workspace_id === activeWs.id);
        setRole(membership?.role || null);
        localStorage.setItem('activeWorkspaceId', activeWs.id);
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const setActiveWorkspace = (workspaceId: string) => {
    const ws = workspaces.find(w => w.id === workspaceId);
    if (ws) {
      setWorkspace(ws);
      localStorage.setItem('activeWorkspaceId', workspaceId);
      
      // Update role for new workspace
      db
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user?.id || '')
        .single()
        .then(({ data }) => {
          if (data) {
            setRole(data.role);
          }
        });
    }
  };

  const hasPermission = (minRole: AppRole): boolean => {
    if (!role) return false;
    return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole];
  };

  return (
    <WorkspaceContext.Provider value={{ 
      workspace, 
      workspaces, 
      role, 
      loading, 
      setActiveWorkspace,
      hasPermission 
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

// Re-export AppRole type for use in other components
export type { AppRole };
