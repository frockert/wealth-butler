import Card from './ui/Card';
import Skeleton from './ui/Skeleton';

const fmt = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

export default function NetWorthCard({ netWorth, loading }) {
  return (
    <Card variant="mint-hero">
      <p className="text-[11px] font-normal uppercase tracking-[0.06em] text-[#888888] mb-3">Net worth</p>
      {loading ? (
        <Skeleton className="h-10 w-52" />
      ) : (
        <p className="font-mono text-[36px] font-bold text-[#111111] leading-none">{fmt.format(netWorth ?? 0)}</p>
      )}
    </Card>
  );
}
