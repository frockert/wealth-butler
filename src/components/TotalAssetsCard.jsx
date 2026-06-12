import Card from './ui/Card';
import Skeleton from './ui/Skeleton';

const fmt = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

const SECTION_LABELS = {
  stock: 'Stocks',
  crypto: 'Crypto',
  cash: 'Cash',
  other: 'Other',
};

function groupBySection(holdings) {
  const map = {};
  for (const h of holdings) {
    const type = h.assetType || 'other';
    map[type] = (map[type] ?? 0) + (h.valueAUD ?? 0);
  }
  return Object.entries(map)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([type, value]) => ({ label: SECTION_LABELS[type] ?? type, value }));
}

export default function TotalAssetsCard({ assetsTotal, holdings = [], loading }) {
  const sections = groupBySection(holdings);

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
            {sections.length === 0 ? (
              <p className="text-[12px] font-medium text-[#888888]">No holdings</p>
            ) : (
              sections.map(({ label, value }) => (
                <p key={label} className="text-[12px] font-medium text-[#888888]">
                  {label}: {fmt.format(value)}
                </p>
              ))
            )}
          </div>
        </>
      )}
    </Card>
  );
}
