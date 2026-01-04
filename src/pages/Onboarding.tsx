import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/integrations/supabase/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Waves, Building2 } from 'lucide-react';

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);

    try {
      const slug = generateSlug(workspaceName);
      
      // Create workspace
      const { data: workspace, error: wsError } = await db
        .from('workspaces')
        .insert({
          nome: workspaceName,
          slug: slug,
          plano: 'trial',
        })
        .select()
        .single();

      if (wsError) {
        if (wsError.message.includes('duplicate')) {
          toast({
            title: 'Erro',
            description: 'Já existe um workspace com este nome',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        throw wsError;
      }

      if (!workspace) {
        throw new Error('Workspace not created');
      }

      // Add user as owner
      const { error: memberError } = await db
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      // Save active workspace
      localStorage.setItem('activeWorkspaceId', workspace.id);

      toast({
        title: 'Workspace criado!',
        description: 'Seu workspace está pronto para uso',
      });

      // Redirect to dashboard
      navigate('/', { replace: true });
      
      // Force page reload to refresh workspace context
      window.location.reload();
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o workspace',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Waves className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Blue Ocean</h1>
            <p className="text-sm text-muted-foreground">Dashboard Comercial</p>
          </div>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Crie seu Workspace</CardTitle>
            <CardDescription>
              Um workspace é onde sua equipe vai gerenciar vendas, metas e métricas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Nome do Workspace</Label>
                <Input
                  id="workspace-name"
                  type="text"
                  placeholder="Ex: Minha Empresa"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={2}
                />
                <p className="text-xs text-muted-foreground">
                  Este será o nome da sua organização no sistema
                </p>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading || !workspaceName.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Workspace'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2025 Blue Ocean. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
