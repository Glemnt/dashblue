import { NavLink } from 'react-router-dom';
import AlertsBadge from '@/components/AlertsBadge';

interface NavigationProps {
  isTVMode?: boolean;
  criticalCount?: number;
  warningCount?: number;
}

const Navigation = ({ isTVMode = false, criticalCount = 0, warningCount = 0 }: NavigationProps) => {
  const menuItems = [
    { path: '/', label: 'Visão Geral', enabled: true },
    { path: '/sdr', label: 'SDR', enabled: true },
    { path: '/closer', label: 'Closer', enabled: true },
    { path: '/financeiro', label: 'Financeiro', enabled: true },
    { path: '/squads', label: 'Squads', enabled: true },
    { path: '/ia', label: 'IA 🤖', enabled: true },
    { path: '/trafego', label: 'Tráfego', enabled: false }
  ];

  return (
    <nav className={`bg-[#151E35] border-b-2 border-white/15 sticky top-0 z-40 ${
      isTVMode ? 'py-8' : 'py-0'
    }`}>
      <div className="max-w-[1920px] mx-auto px-12">
        <div className={`flex items-center ${isTVMode ? 'gap-12 justify-center' : 'gap-8 justify-between'} ${
          isTVMode ? 'py-0' : 'py-4'
        }`}>
          <div className={`flex ${isTVMode ? 'gap-12' : 'gap-8'}`}>
            {menuItems.map((item) => (
              item.enabled ? (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `font-outfit font-semibold transition-all duration-200 border-b-4 ${
                      isTVMode 
                        ? 'text-2xl px-8 py-6 rounded-lg' 
                        : 'text-base pb-4'
                    } ${
                      isActive
                        ? isTVMode
                          ? 'text-white bg-[#0066FF] border-[#0066FF] scale-110'
                          : 'text-[#0066FF] border-[#0066FF]'
                        : isTVMode
                          ? 'text-[#94A3B8] border-transparent hover:text-white hover:bg-[#0066FF]/20'
                          : 'text-[#94A3B8] border-transparent hover:text-white'
                    }`
                  }
                  aria-label={`Navegar para ${item.label}`}
                >
                  {({ isActive }) => (
                    <span aria-current={isActive ? 'page' : undefined}>
                      {item.label}
                    </span>
                  )}
                </NavLink>
              ) : (
                <span
                  key={item.path}
                  className={`font-outfit font-medium cursor-not-allowed ${
                    isTVMode 
                      ? 'text-2xl text-[#64748B]/50 px-8 py-6' 
                      : 'text-base text-[#64748B] pb-4'
                  }`}
                  aria-disabled="true"
                >
                  {item.label}
                </span>
              )
            ))}
          </div>
          {!isTVMode && (
            <AlertsBadge 
              criticalCount={criticalCount} 
              warningCount={warningCount} 
              isTVMode={isTVMode} 
            />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
