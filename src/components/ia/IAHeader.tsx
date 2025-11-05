import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TVModeToggle from '@/components/TVModeToggle';
import logoWhite from '@/assets/logo-white.png';

interface IAHeaderProps {
  isTVMode: boolean;
  onToggleTVMode: () => void;
  onRefresh: () => void;
  status: 'healthy' | 'warning' | 'critical';
  diasUteisRestantes: number;
  isLoading?: boolean;
}

const IAHeader = ({ 
  isTVMode, 
  onToggleTVMode, 
  onRefresh, 
  status,
  diasUteisRestantes,
  isLoading 
}: IAHeaderProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">🟢 Saudável</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">🟡 Atenção</Badge>;
      case 'critical':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">🔴 Crítico</Badge>;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B1120]/95 border-b-2 border-white/15 backdrop-blur-lg">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <img 
            src={logoWhite} 
            alt="Logo" 
            className={`${isTVMode ? 'h-16' : 'h-10'} transition-all`} 
          />
          <div>
            <h1 className={`font-bold font-outfit transition-all ${isTVMode ? 'text-4xl' : 'text-2xl'}`}>
              🤖 Assistente IA
            </h1>
            <p className={`text-gray-400 transition-all ${isTVMode ? 'text-xl' : 'text-sm'}`}>
              Insights em tempo real
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            {getStatusBadge()}
            <p className={`text-gray-400 mt-1 transition-all ${isTVMode ? 'text-lg' : 'text-xs'}`}>
              {diasUteisRestantes} dias úteis restantes
            </p>
          </div>
          
          <TVModeToggle isTVMode={isTVMode} onToggle={onToggleTVMode} />
          
          <Button 
            variant="outline" 
            onClick={onRefresh}
            disabled={isLoading}
            className={`${isTVMode ? 'px-8 py-6' : 'px-4 py-2'} transition-all`}
          >
            <RefreshCw className={`${isTVMode ? 'w-6 h-6' : 'w-4 h-4'} ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default IAHeader;
