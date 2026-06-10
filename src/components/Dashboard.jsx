import { useEffect, useState } from 'react';
import { fetchPortfolio, syncPortfolio } from '../api/portfolio';
import Header from './Header';
import Sidebar from './Sidebar';
import NetWorthCard from './NetWorthCard';
import HoldingsTable from './HoldingsTable';
import AllocationChart from './AllocationChart';
import MarketSummaryCard from './MarketSummaryCard';
import Button from './ui/Button';

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

  async function handleSync() {
    setSyncing(true);
    setError(null);
    try {
      await syncPortfolio();
      const data = await fetchPortfolio();
      setPortfolio(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  }

  const netWorth = portfolio?.netWorth ?? null;
  const holdings = portfolio?.holdings ?? [];
  const aiSummary = portfolio?.aiSummary ?? null;
  const apiKeyMissing = portfolio?.apiKeyMissing ?? false;
  const lastUpdated = portfolio?.lastUpdated ?? null;
  const errors = portfolio?.errors ?? [];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0 bg-[#f0ede6]">
        <Header syncing={syncing} onSync={handleSync} lastUpdated={lastUpdated} errors={errors} />

        <main className="flex-1 overflow-y-auto p-7">
        {error && (
          <div className="flex items-center justify-between bg-[#f7b3d1] border-2 border-[#111111] rounded-[4px] shadow-[4px_4px_0_#8a2050] px-4 py-3 mb-6">
            <span className="text-[13px] font-medium text-[#111111]">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-[#111111] font-bold text-lg leading-none hover:opacity-70"
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </div>
        )}

        {portfolio === null && !loading ? (
          <div className="flex items-center justify-center mt-24">
            <div className="bg-white border-2 border-[#111111] rounded-[4px] shadow-[4px_4px_0_#111111] p-10 flex flex-col items-center gap-4 max-w-sm w-full">
              <p className="text-[13px] text-[#888888] text-center">No portfolio data yet. Sync to load your holdings.</p>
              <Button onClick={handleSync} variant="accent">
                Sync to load your portfolio
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              <NetWorthCard netWorth={netWorth} loading={loading} />
              <HoldingsTable holdings={holdings} loading={loading} />
            </div>

            <div className="flex flex-col gap-4">
              <AllocationChart holdings={holdings} loading={loading} />
              <MarketSummaryCard aiSummary={aiSummary} loading={loading} apiKeyMissing={apiKeyMissing} />
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
