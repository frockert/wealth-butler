import clsx from 'clsx';
import { ArrowDown, ArrowUp } from 'lucide-react';

const fmt = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });
const pctFmt = new Intl.NumberFormat('en-AU', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export default function TrendDelta({ label, delta, deltaPct }) {
  if (delta == null) {
    return (
      <p className="text-[12px] font-medium text-[#888888] flex items-center gap-1">
        {label}: –
      </p>
    );
  }

  const isPositive = delta > 0;
  const isNegative = delta < 0;

  return (
    <p
      className={clsx(
        'text-[12px] font-semibold flex items-center gap-1',
        isPositive && 'text-[#00c48c]',
        isNegative && 'text-[#e63946]',
        !isPositive && !isNegative && 'text-[#888888]',
      )}
    >
      {isPositive && <ArrowUp size={13} strokeWidth={2.5} aria-hidden />}
      {isNegative && <ArrowDown size={13} strokeWidth={2.5} aria-hidden />}
      <span>
        {label}: {fmt.format(delta)}
        {deltaPct != null ? ` (${pctFmt.format(deltaPct / 100)})` : ''}
      </span>
    </p>
  );
}
