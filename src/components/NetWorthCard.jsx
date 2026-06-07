import Card from './ui/Card';
import Skeleton from './ui/Skeleton';

const fmt = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

export default function NetWorthCard({ netWorth, loading }) {
  return (
    <Card>
      <p className="text-sm font-medium text-gray-500 mb-1">Net Worth</p>
      {loading ? (
        <Skeleton className="h-9 w-48" />
      ) : (
        <p className="text-3xl font-bold text-gray-900">{fmt.format(netWorth ?? 0)}</p>
      )}
    </Card>
  );
}
