import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Home, Users, Target, DollarSign, Trophy, Sparkles, TrendingUp } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface MobileMenuProps {
  isTVMode?: boolean;
}

const MobileMenu = ({ isTVMode = false }: MobileMenuProps) => {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { path: '/', label: 'Visão Geral', icon: Home, enabled: true },
    { path: '/closer', label: 'Closer', icon: Target, enabled: true },
    { path: '/sdr', label: 'SDR', icon: Users, enabled: true },
    { path: '/squads', label: 'Squads', icon: Trophy, enabled: true },
    { path: '/financeiro', label: 'Financeiro', icon: DollarSign, enabled: true },
    { path: '/trafego', label: 'Tráfego', icon: TrendingUp, enabled: true },
    { path: '/ia', label: 'IA 🤖', icon: Sparkles, enabled: false }
  ];

  // Não mostrar no TV Mode
  if (isTVMode) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* BOTÃO HAMBURGUER (visível apenas em mobile) */}
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white hover:bg-white/10 h-11 w-11 rounded-lg shrink-0"
          aria-label="Abrir menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>

      {/* DRAWER LATERAL */}
      <SheetContent 
        side="left" 
        className="w-[280px] bg-[#0B1120] border-r border-white/10 p-0"
      >
        {/* HEADER DO DRAWER */}
        <SheetHeader className="px-6 py-4 border-b border-white/10">
          <SheetTitle className="text-white text-xl font-bold text-left">
            Menu
          </SheetTitle>
        </SheetHeader>

        {/* LISTA DE NAVEGAÇÃO */}
        <nav className="px-4 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return item.enabled ? (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg font-outfit font-semibold text-base transition-all duration-200 min-h-[48px] ${
                        isActive
                          ? 'bg-[#0066FF] text-white'
                          : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ) : (
                <li key={item.path}>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg font-outfit font-medium text-base text-[#64748B]/50 cursor-not-allowed min-h-[48px]">
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
