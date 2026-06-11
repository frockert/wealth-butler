import { useState } from 'react';
import clsx from 'clsx';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import Card from './ui/Card';
import Skeleton from './ui/Skeleton';

const COLORS = ['#00c48c', '#f5e642', '#f7b3d1', '#c9b8f0', '#c8f0d8', '#f0e8c8', '#e63946', '#111111'];

const TABS = [
  { id: 'stock-sectors', label: 'Stock sectors' },
  { id: 'all-sectors', label: 'All sectors' },
  { id: 'crypto', label: 'Crypto distribution' },
  { id: 'investable', label: 'Investable ex-cash' },
];

const aud = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

function groupBySector(holdings) {
  const map = {};
  for (const h of holdings) {
    const key = h.sector || 'Other';
    map[key] = (map[key] ?? 0) + h.valueAUD;
  }
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function groupByTicker(holdings) {
  return holdings.map((h) => ({ name: h.ticker || 'Unknown', value: h.valueAUD }));
}

function filterHoldings(holdings, chartType) {
  switch (chartType) {
    case 'stock-sectors':
      return holdings.filter((h) => h.assetType === 'stock');
    case 'all-sectors':
      return holdings;
    case 'crypto':
      return holdings.filter((h) => h.assetType === 'crypto');
    case 'investable':
      return holdings.filter((h) => h.assetType !== 'cash');
    default:
      return holdings;
  }
}

function buildChartData(holdings, chartType) {
  const filtered = filterHoldings(holdings, chartType);
  if (chartType === 'crypto') return groupByTicker(filtered);
  return groupBySector(filtered);
}

export default function AllocationChart({ holdings = [], loading = false }) {
  const [chartType, setChartType] = useState('stock-sectors');
  const chartData = buildChartData(holdings, chartType);
  const filtered = filterHoldings(holdings, chartType);

  return (
    <Card>
      <p className="label-mono text-[#111111] mb-3">Allocation</p>

      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-48 w-48 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setChartType(id)}
                className={clsx(
                  'label-mono px-3 py-1 rounded-[4px] border-2 border-[#111111] transition-colors',
                  chartType === id
                    ? 'bg-[#111111] text-white shadow-[2px_2px_0_#888888]'
                    : 'bg-white text-[#111111] hover:bg-[#f0ede6]'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="border-2 border-dashed border-[#bbbbbb] rounded-[4px] flex items-center justify-center h-48 text-[#888888] text-[13px]">
              No data
            </div>
          ) : (
            <PieChart width={320} height={260}>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                stroke="#111111"
                strokeWidth={2}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => aud.format(value)} />
              <Legend />
            </PieChart>
          )}
        </>
      )}
    </Card>
  );
}
