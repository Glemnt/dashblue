import { Monitor, MonitorOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TVModeToggleProps {
  isTVMode: boolean;
  onToggle: () => void;
}

const TVModeToggle = ({ isTVMode, onToggle }: TVModeToggleProps) => {
  return (
    <Button
      onClick={onToggle}
      variant="outline"
      className="bg-[#0066FF]/10 border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF] hover:text-white"
    >
      {isTVMode ? <MonitorOff className="w-4 h-4 mr-2" /> : <Monitor className="w-4 h-4 mr-2" />}
      {isTVMode ? 'Modo Normal' : 'Modo TV'}
    </Button>
  );
};

export default TVModeToggle;
