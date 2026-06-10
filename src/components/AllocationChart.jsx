import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import Card from './ui/Card';
import Skeleton from './ui/Skeleton';

const COLORS = ['#00c48c', '#f5e642', '#f7b3d1', '#c9b8f0', '#c8f0d8', '#f0e8c8', '#e63946', '#111111'];

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
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#111111] mb-3">Allocation by sector</p>
      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-48 w-48 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      ) : holdings.length === 0 ? (
        <div className="border-2 border-dashed border-[#bbbbbb] rounded-[4px] flex items-center justify-center h-48 text-[#888888] text-[13px]">
          No data
        </div>
      ) : (
        <PieChart width={320} height={260}>
          <Pie
            data={groupBySector(holdings)}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            stroke="#111111"
            strokeWidth={2}
          >
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
