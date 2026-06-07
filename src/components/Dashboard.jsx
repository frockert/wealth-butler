import { useEffect, useState } from 'react';
import { fetchPortfolio } from '../api/portfolio';

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchPortfolio()
      .then((data) => setPortfolio(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const netWorth = portfolio?.netWorth ?? null;
  const holdings = portfolio?.holdings ?? [];
  const aiSummary = portfolio?.aiSummary ?? null;
  const apiKeyMissing = portfolio?.apiKeyMissing ?? false;
  const lastUpdated = portfolio?.lastUpdated ?? null;
  const errors = portfolio?.errors ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header placeholder — replaced by Header in T7 */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Wealth Butler</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* NetWorthCard placeholder — replaced in T3 */}
          <div data-slot="net-worth-card" />
          {/* HoldingsTable placeholder — replaced in T4 */}
          <div data-slot="holdings-table" />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* AllocationChart placeholder — replaced in T5 */}
          <div data-slot="allocation-chart" />
          {/* MarketSummaryCard placeholder — replaced in T6 */}
          <div data-slot="market-summary-card" />
        </div>
      </div>
    </div>
  );
}
