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
    <div className="bg-white rounded-[4px] border-2 border-[#111111] shadow-[4px_4px_0_#111111] p-6 overflow-x-auto">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#111111] mb-3">Holdings</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b-2 border-[#111111]">
            {COLS.map((col) => (
              <th key={col} className="px-4 py-2 text-[11px] font-normal uppercase tracking-[0.06em] text-[#888888]">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : sorted.length === 0 ? (
            <tr>
              <td colSpan={COLS.length} className="py-4">
                <div className="border-2 border-dashed border-[#bbbbbb] rounded-[4px] text-center text-[#888888] text-[13px] py-8 mx-2">
                  No holdings — sync to load
                </div>
              </td>
            </tr>
          ) : (
            sorted.map((h, i) => (
              <tr
                key={`${h.ticker}-${h.exchange}-${i}`}
                className="border-b border-[#f0ede6] hover:bg-[#f0ede6] transition-colors duration-150"
              >
                <td className="px-4 py-3 font-mono text-[13px] font-medium uppercase text-[#111111]">{h.ticker}</td>
                <td className="px-4 py-3 text-[13px] text-[#888888]">{h.exchange}</td>
                <td className="px-4 py-3 font-mono text-[13px] text-[#111111]">{h.qty}</td>
                <td className="px-4 py-3 font-mono text-[13px] text-[#111111]">{aud.format(h.price)}</td>
                <td className="px-4 py-3 font-mono text-[13px] text-[#111111]">{aud.format(h.valueAUD)}</td>
                <td className="px-4 py-3 font-mono text-[13px] text-[#111111]">{h.allocation.toFixed(1)}%</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
