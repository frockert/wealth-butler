import Card from './ui/Card';
import Skeleton from './ui/Skeleton';

const fmt = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

export default function TaxEstimateCard({ taxEstimate, adjustedNetWorth, loading }) {
  const noData = taxEstimate == null && !loading;

  return (
    <Card className={noData ? 'border-dashed' : undefined}>
      <p className="label-mono font-normal tracking-[0.06em] text-[#888888] mb-3">Tax estimate</p>
      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-3 w-44" />
        </div>
      ) : noData ? (
        <p className="text-[13px] text-[#888888]">No cost basis data</p>
      ) : (
        <>
          <p className="font-sans text-[28px] font-bold text-[#111111] leading-none mb-3">{fmt.format(taxEstimate)}</p>
          {adjustedNetWorth != null && (
            <p className="text-[12px] text-[#888888]">
              Adjusted net worth:{' '}
              <span className="font-sans font-semibold text-[#111111]">{fmt.format(adjustedNetWorth)}</span>
            </p>
          )}
        </>
      )}
    </Card>
  );
}
