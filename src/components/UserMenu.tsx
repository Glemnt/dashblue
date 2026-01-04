import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Settings, Building2, ChevronDown, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { workspace, workspaces, role, setActiveWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/auth', { replace: true });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível sair da conta',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'admin':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'editor':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'owner':
        return 'Proprietário';
      case 'admin':
        return 'Admin';
      case 'editor':
        return 'Editor';
      case 'viewer':
        return 'Visualizador';
      default:
        return 'Membro';
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      {/* Workspace Selector */}
      {workspaces.length > 1 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
              <Building2 className="w-4 h-4 mr-2" />
              <span className="max-w-[120px] truncate">{workspace?.nome}</span>
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => setActiveWorkspace(ws.id)}
                className={ws.id === workspace?.id ? 'bg-accent' : ''}
              >
                <Building2 className="w-4 h-4 mr-2" />
                {ws.nome}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border-2 border-primary/30">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {getInitials(user.email || 'U')}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium truncate">{user.email}</p>
              </div>
              {workspace && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{workspace.nome}</span>
                  <Badge variant="outline" className={`text-xs ${getRoleBadgeColor(role)}`}>
                    {getRoleLabel(role)}
                  </Badge>
                </div>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleSignOut} 
            disabled={isLoggingOut}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isLoggingOut ? 'Saindo...' : 'Sair'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;
