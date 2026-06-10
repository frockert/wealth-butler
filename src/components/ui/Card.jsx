import clsx from 'clsx';

const VARIANTS = {
  default:     { bg: 'bg-white',     shadow: 'shadow-[4px_4px_0_#111111]' },
  'mint-hero': { bg: 'bg-[#c8f0d8]', shadow: 'shadow-[6px_6px_0_#1a6640]' },
  mint:        { bg: 'bg-[#c8f0d8]', shadow: 'shadow-[4px_4px_0_#1a6640]' },
  sand:        { bg: 'bg-[#f0e8c8]', shadow: 'shadow-[4px_4px_0_#7a6e00]' },
  pink:        { bg: 'bg-[#f7b3d1]', shadow: 'shadow-[4px_4px_0_#8a2050]' },
  purple:      { bg: 'bg-[#c9b8f0]', shadow: 'shadow-[4px_4px_0_#3d2880]' },
};

export default function Card({ children, className, variant = 'default' }) {
  const v = VARIANTS[variant] ?? VARIANTS.default;
  return (
    <div className={clsx('rounded-[4px] border-2 border-[#111111] p-7', v.bg, v.shadow, className)}>
      {children}
    </div>
  );
}
