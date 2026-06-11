import Card from './ui/Card';
import Skeleton from './ui/Skeleton';
import TrendDelta from './ui/DeltaLine';

const fmt = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

export default function TotalAssetsCard({
  assetsTotal,
  delta1d,
  delta1dPct,
  delta1w,
  delta1wPct,
  loading,
}) {
  return (
    <Card>
      <p className="label-mono font-normal tracking-[0.06em] text-[#888888] mb-3">Total assets</p>
      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-32" />
        </div>
      ) : (
        <>
          <p className="font-sans text-[28px] font-bold text-[#111111] leading-none mb-3">
            {fmt.format(assetsTotal ?? 0)}
          </p>
          <div className="flex flex-col gap-1">
            <TrendDelta label="1d" delta={delta1d} deltaPct={delta1dPct} />
            <TrendDelta label="1w" delta={delta1w} deltaPct={delta1wPct} />
          </div>
        </>
      )}
    </Card>
  );
}
