import { useEffect, useState } from 'react';
import { fetchPortfolio } from '../api/portfolio';
import Header from './Header';
import NetWorthCard from './NetWorthCard';
import HoldingsTable from './HoldingsTable';
import AllocationChart from './AllocationChart';
import MarketSummaryCard from './MarketSummaryCard';

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing] = useState(false);
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
      <Header syncing={syncing} onSync={() => {}} lastUpdated={lastUpdated} errors={errors} />

      {error && (
        <div className="flex items-center justify-between bg-red-50 border border-red-300 text-red-800 rounded-lg px-4 py-3 mb-6">
          <span className="text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-500 hover:text-red-700 font-bold text-lg leading-none"
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      {portfolio === null && !loading ? (
        <div className="flex items-center justify-center mt-24">
          <div className="bg-white rounded-xl shadow p-10 flex flex-col items-center gap-4 max-w-sm w-full">
            <p className="text-gray-600 text-center">No portfolio data yet. Sync to load your holdings.</p>
            <button
              onClick={() => {}}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Sync to load your portfolio
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-6">
            <NetWorthCard netWorth={netWorth} loading={loading} />
            <HoldingsTable holdings={holdings} loading={loading} />
          </div>

          <div className="flex flex-col gap-6">
            <AllocationChart holdings={holdings} loading={loading} />
            <MarketSummaryCard aiSummary={aiSummary} loading={loading} apiKeyMissing={apiKeyMissing} />
          </div>
        </div>
      )}
    </div>
  );
}
