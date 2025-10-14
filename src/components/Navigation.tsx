import { NavLink } from 'react-router-dom';

const Navigation = () => {
  const menuItems = [
    { path: '/', label: 'Visão Geral', enabled: true },
    { path: '/sdr', label: 'SDR', enabled: true },
    { path: '/closer', label: 'Closer', enabled: false },
    { path: '/financeiro', label: 'Financeiro', enabled: false },
    { path: '/squads', label: 'Squads', enabled: false },
    { path: '/trafego', label: 'Tráfego', enabled: false }
  ];

  return (
    <nav className="bg-[#151E35] border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-[1920px] mx-auto px-12">
        <div className="flex gap-8 py-4">
          {menuItems.map((item) => (
            item.enabled ? (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `font-outfit text-base font-medium transition-all duration-200 pb-4 border-b-2 ${
                    isActive
                      ? 'text-[#0066FF] border-[#0066FF]'
                      : 'text-[#94A3B8] border-transparent hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ) : (
              <span
                key={item.path}
                className="font-outfit text-base font-medium text-[#64748B] cursor-not-allowed pb-4"
              >
                {item.label}
              </span>
            )
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
