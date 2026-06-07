import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import Card from './ui/Card';
import Skeleton from './ui/Skeleton';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

const aud = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

function groupBySector(holdings) {
  const map = {};
  for (const h of holdings) {
    const key = h.sector || 'Other';
    map[key] = (map[key] ?? 0) + h.valueAUD;
  }
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export default function AllocationChart({ holdings = [], loading = false }) {
  return (
    <Card>
      <p className="text-sm font-medium text-gray-500 mb-4">Allocation by Sector</p>
      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-48 w-48 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      ) : holdings.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data</div>
      ) : (
        <PieChart width={320} height={260}>
          <Pie data={groupBySector(holdings)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
            {groupBySector(holdings).map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => aud.format(value)} />
          <Legend />
        </PieChart>
      )}
    </Card>
  );
}
