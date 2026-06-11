import { LayoutDashboard, Wallet, Target, Sparkles, Plug } from 'lucide-react';

const NAV = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, accent: '#c8f0d8', border: '#1a6640' },
  { page: 'assets', label: 'Assets', icon: Wallet, accent: '#f0e8c8', border: '#7a6e00' },
  { page: 'goals', label: 'Goals', icon: Target, accent: '#c9b8f0', border: '#3d2880' },
  { page: 'ai-advisor', label: 'AI Advisor', icon: Sparkles, accent: '#f7b3d1', border: '#8a2050' },
  { page: 'integrations', label: 'Integrations', icon: Plug, accent: '#f5e642', border: '#7a6e00' },
];

function NavItem({ icon: Icon, label, active, accent, border, onClick }) {
  const content = (
    <>
      <Icon size={16} strokeWidth={2} className="shrink-0" />
      {label}
    </>
  );

  if (active) {
    return (
      <div
        className="px-4 py-[10px] text-[13px] font-semibold text-[#111111] tracking-[0.01em] flex items-center gap-2.5"
        style={{ background: accent, borderLeft: `3px solid ${border}` }}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-4 py-[10px] text-[13px] font-medium text-[#999999] tracking-[0.01em] border-l-[3px] border-transparent hover:bg-[#222222] hover:text-[#f0ede6] transition-colors duration-150 cursor-pointer flex items-center gap-2.5"
    >
      {content}
    </button>
  );
}

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="w-60 min-h-screen bg-[#111111] flex flex-col shrink-0">
      <div className="px-4 pt-4 pb-5 border-b border-[#333333]">
        <span className="text-[#f0ede6] text-[15px] font-semibold tracking-[-0.02em]">Wealth Butler</span>
      </div>

      <nav className="flex-1 py-2">
        {NAV.map(({ page, label, icon, accent, border }) => (
          <NavItem
            key={page}
            icon={icon}
            label={label}
            accent={accent}
            border={border}
            active={activePage === page}
            onClick={() => onNavigate(page)}
          />
        ))}
      </nav>
    </aside>
  );
}
