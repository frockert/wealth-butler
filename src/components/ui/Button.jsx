import clsx from 'clsx';

const VARIANTS = {
  primary: [
    'bg-[#111111] text-white border-2 border-[#111111]',
    'shadow-[4px_4px_0_#111111]',
    'hover:shadow-[2px_2px_0_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5',
    'active:shadow-none active:translate-x-1 active:translate-y-1',
  ],
  accent: [
    'bg-[#00c48c] text-[#111111] border-2 border-[#111111]',
    'shadow-[4px_4px_0_#111111]',
    'hover:shadow-[2px_2px_0_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5',
    'active:shadow-none active:translate-x-1 active:translate-y-1',
  ],
  ghost: [
    'bg-white text-[#111111] border-2 border-[#111111]',
    'shadow-none hover:shadow-[3px_3px_0_#111111]',
    'active:shadow-none',
  ],
};

export default function Button({ children, onClick, disabled, className, variant = 'primary' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'flex items-center gap-2 px-5 py-[10px] text-[13px] font-bold uppercase tracking-[0.04em] rounded-[4px]',
        'transition-all duration-150 cursor-pointer',
        VARIANTS[variant] ?? VARIANTS.primary,
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
}
