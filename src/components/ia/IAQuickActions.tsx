import { Button } from '@/components/ui/button';
import { MessageSquare, TrendingUp, FileText, RefreshCw } from 'lucide-react';

interface IAQuickActionsProps {
  isTVMode: boolean;
  onChatClick: () => void;
  onSimulatorClick: () => void;
  onReportClick: () => void;
  onAnalyzeClick: () => void;
  isAnalyzing?: boolean;
}

const IAQuickActions = ({ 
  isTVMode, 
  onChatClick, 
  onSimulatorClick, 
  onReportClick,
  onAnalyzeClick,
  isAnalyzing 
}: IAQuickActionsProps) => {
  const buttonSize = isTVMode ? 'px-8 py-6 text-xl' : 'px-6 py-3';
  const iconSize = isTVMode ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-lg border border-white/10">
      <h3 className={`font-bold mb-4 transition-all ${isTVMode ? 'text-3xl' : 'text-xl'}`}>
        🚀 Ações Rápidas
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
          onClick={onChatClick}
          className={`${buttonSize} bg-blue-600 hover:bg-blue-700 transition-all`}
        >
          <MessageSquare className={`${iconSize} mr-2`} />
          Chat IA
        </Button>
        
        <Button 
          onClick={onSimulatorClick}
          className={`${buttonSize} bg-purple-600 hover:bg-purple-700 transition-all`}
        >
          <TrendingUp className={`${iconSize} mr-2`} />
          Simular
        </Button>
        
        <Button 
          onClick={onReportClick}
          className={`${buttonSize} bg-green-600 hover:bg-green-700 transition-all`}
        >
          <FileText className={`${iconSize} mr-2`} />
          Relatório
        </Button>
        
        <Button 
          onClick={onAnalyzeClick}
          disabled={isAnalyzing}
          className={`${buttonSize} bg-orange-600 hover:bg-orange-700 transition-all`}
        >
          <RefreshCw className={`${iconSize} mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
          Analisar
        </Button>
      </div>
    </div>
  );
};

export default IAQuickActions;
