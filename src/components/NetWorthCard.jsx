import Card from './ui/Card';
import Skeleton from './ui/Skeleton';
import TrendDelta from './ui/DeltaLine';

const fmt = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

export default function NetWorthCard({
  netWorth,
  investable,
  delta1d,
  delta1dPct,
  delta1w,
  delta1wPct,
  loading,
}) {
  return (
    <Card variant="mint-hero">
      <p className="label-mono font-normal tracking-[0.06em] text-[#888888] mb-3">Net worth</p>
      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-52" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-4 w-36" />
        </div>
      ) : (
        <>
          <p className="font-sans text-[36px] font-bold text-[#111111] leading-none">{fmt.format(netWorth ?? 0)}</p>
          <div className="flex flex-col gap-1 mt-3">
            <TrendDelta label="1d" delta={delta1d} deltaPct={delta1dPct} />
            <TrendDelta label="1w" delta={delta1w} deltaPct={delta1wPct} />
          </div>
          <div className="mt-4 pt-3 border-t border-[#1a6640]/30">
            <p className="label-mono font-normal tracking-[0.06em] text-[#888888] mb-1">Investable</p>
            <p className="font-sans text-[18px] font-semibold text-[#111111]">{fmt.format(investable ?? 0)}</p>
          </div>
        </>
      )}
    </Card>
  );
}
