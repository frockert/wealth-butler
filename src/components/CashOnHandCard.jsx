import Card from './ui/Card';
import Skeleton from './ui/Skeleton';

const fmt = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

export default function CashOnHandCard({ cashOnHand, loading }) {
  return (
    <Card>
      <p className="label-mono font-normal tracking-[0.06em] text-[#888888] mb-3">Cash on hand</p>
      {loading ? (
        <Skeleton className="h-8 w-36" />
      ) : (
        <p className="font-sans text-[28px] font-bold text-[#111111] leading-none">{fmt.format(cashOnHand ?? 0)}</p>
      )}
    </Card>
  );
}
