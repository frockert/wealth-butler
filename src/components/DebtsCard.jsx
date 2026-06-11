import Card from './ui/Card';
import Skeleton from './ui/Skeleton';

const fmt = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

export default function DebtsCard({ debtsTotal, loading }) {
  return (
    <Card>
      <p className="label-mono font-normal tracking-[0.06em] text-[#888888] mb-3">Debts</p>
      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-24" />
        </div>
      ) : (
        <>
          <p className="font-sans text-[28px] font-bold text-[#111111] leading-none mb-3">{fmt.format(debtsTotal)}</p>
          <div className="flex flex-col gap-1">
            <p className="text-[12px] font-medium text-[#888888]">1d: {fmt.format(0)}</p>
            <p className="text-[12px] font-medium text-[#888888]">1w: {fmt.format(0)}</p>
          </div>
        </>
      )}
    </Card>
  );
}
