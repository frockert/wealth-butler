import Skeleton from './ui/Skeleton';

const aud = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

const COLS = ['Ticker/Coin', 'Exchange', 'Qty', 'Price (AUD)', 'Value (AUD)', 'Allocation %'];

function SkeletonRow() {
  return (
    <tr>
      {COLS.map((col) => (
        <td key={col} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export default function HoldingsTable({ holdings = [], loading = false }) {
  const sorted = [...holdings].sort((a, b) => b.valueAUD - a.valueAUD);

  return (
    <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Holdings</h2>
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-gray-100">
            {COLS.map((col) => (
              <th key={col} className="px-4 py-2 font-medium text-gray-500">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : sorted.length === 0 ? (
            <tr>
              <td colSpan={COLS.length} className="px-4 py-6 text-center text-gray-400">
                No holdings — sync to load
              </td>
            </tr>
          ) : (
            sorted.map((h, i) => (
              <tr key={`${h.ticker}-${h.exchange}-${i}`} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{h.ticker}</td>
                <td className="px-4 py-3 text-gray-600">{h.exchange}</td>
                <td className="px-4 py-3 text-gray-700">{h.qty}</td>
                <td className="px-4 py-3 text-gray-700">{aud.format(h.price)}</td>
                <td className="px-4 py-3 text-gray-700">{aud.format(h.valueAUD)}</td>
                <td className="px-4 py-3 text-gray-700">{h.allocation.toFixed(1)}%</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
