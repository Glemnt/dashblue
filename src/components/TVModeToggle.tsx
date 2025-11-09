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
      className={`hidden md:flex bg-[#0066FF]/10 border-2 border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF] hover:text-white transition-all ${
        isTVMode ? 'px-8 py-6 text-2xl' : 'px-6 py-3 text-lg'
      }`}
    >
      {isTVMode ? (
        <MonitorOff className={`${isTVMode ? 'w-8 h-8 mr-4' : 'w-5 h-5 mr-2'}`} />
      ) : (
        <Monitor className={`${isTVMode ? 'w-8 h-8 mr-4' : 'w-5 h-5 mr-2'}`} />
      )}
      <span className="font-outfit font-semibold">
        {isTVMode ? 'Modo Normal' : 'Modo TV'}
      </span>
    </Button>
  );
};

export default TVModeToggle;
