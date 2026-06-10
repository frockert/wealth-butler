const NAV = [
  { label: 'Dashboard', accent: '#c8f0d8', border: '#1a6640', active: true },
  { label: 'Assets',    accent: '#f0e8c8', border: '#7a6e00', active: false },
  { label: 'Goals',     accent: '#c9b8f0', border: '#3d2880', active: false },
  { label: 'AI Advisor',accent: '#f7b3d1', border: '#8a2050', active: false },
  { label: 'Integrations', accent: '#f5e642', border: '#7a6e00', active: false },
];

export default function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-[#111111] flex flex-col shrink-0">
      <div className="px-4 pt-4 pb-5 border-b border-[#333333]">
        <span className="text-[#f0ede6] text-[15px] font-semibold tracking-[-0.02em]">Wealth Butler</span>
      </div>

      <nav className="flex-1 py-2">
        {NAV.map(({ label, accent, border, active }) =>
          active ? (
            <div
              key={label}
              className="px-4 py-[10px] text-[13px] font-semibold text-[#111111] tracking-[0.01em]"
              style={{ background: accent, borderLeft: `3px solid ${border}` }}
            >
              {label}
            </div>
          ) : (
            <div
              key={label}
              className="px-4 py-[10px] text-[13px] font-medium text-[#999999] tracking-[0.01em] border-l-[3px] border-transparent hover:bg-[#222222] hover:text-[#f0ede6] transition-colors duration-150 cursor-pointer"
            >
              {label}
            </div>
          )
        )}
      </nav>
    </aside>
  );
}
