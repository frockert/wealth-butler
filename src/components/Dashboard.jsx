import Header from './Header';
import NetWorthCard from './NetWorthCard';
import TotalAssetsCard from './TotalAssetsCard';
import CashOnHandCard from './CashOnHandCard';
import DebtsCard from './DebtsCard';
import TaxEstimateCard from './TaxEstimateCard';
import GoalProgressCard from './GoalProgressCard';
import AllocationChart from './AllocationChart';
import MarketSummaryCard from './MarketSummaryCard';
import Button from './ui/Button';

function readDebtsTotal() {
  try {
    const items = JSON.parse(localStorage.getItem('wb-liabilities') || '[]');
    return items.reduce((sum, l) => sum + (l.valueAUD ?? 0), 0);
  } catch {
    return 0;
  }
}

function deriveFromHoldings(holdings) {
  const assetsTotal = holdings.reduce((sum, h) => sum + (h.valueAUD ?? 0), 0);
  const cashOnHand = holdings
    .filter((h) => h.assetType === 'cash')
    .reduce((sum, h) => sum + (h.valueAUD ?? 0), 0);
  const investable = holdings
    .filter((h) => h.assetType !== 'cash')
    .reduce((sum, h) => sum + (h.valueAUD ?? 0), 0);
  return { assetsTotal, cashOnHand, investable };
}

export default function Dashboard({
  portfolio,
  loading,
  syncing,
  error,
  onErrorDismiss,
  onNavigate,
  onSync,
}) {
  const holdings = portfolio?.holdings ?? [];
  const aiSummary = portfolio?.aiSummary ?? null;
  const apiKeyMissing = portfolio?.apiKeyMissing ?? false;
  const lastUpdated = portfolio?.lastUpdated ?? null;
  const errors = portfolio?.errors ?? [];

  const debtsTotal = readDebtsTotal();
  const derived = deriveFromHoldings(holdings);
  const assetsTotal = portfolio?.assetsTotal ?? derived.assetsTotal;
  const cashOnHand = portfolio?.cashOnHand ?? derived.cashOnHand;
  const investable = derived.investable;
  const netWorth = assetsTotal - debtsTotal;
  const taxEstimate = portfolio?.taxEstimate ?? null;
  const adjustedNetWorth = taxEstimate != null ? netWorth - taxEstimate : null;

  const delta1d = portfolio?.delta?.assets1d ?? null;
  const delta1dPct = portfolio?.delta?.assets1dPct ?? null;
  const delta1w = portfolio?.delta?.assets1w ?? null;
  const delta1wPct = portfolio?.delta?.assets1wPct ?? null;

  return (
    <>
      <Header syncing={syncing} onSync={onSync} lastUpdated={lastUpdated} errors={errors} />

      <main className="flex-1 overflow-y-auto p-7">
        <div className="mx-auto w-full max-w-7xl">
        {error && (
          <div className="flex items-center justify-between bg-[#f7b3d1] border-2 border-[#111111] rounded-[4px] shadow-[4px_4px_0_#8a2050] px-4 py-3 mb-6">
            <span className="text-[13px] font-medium text-[#111111]">{error}</span>
            <button
              onClick={onErrorDismiss}
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
              <Button onClick={onSync} variant="accent">
                Sync to load your portfolio
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <NetWorthCard netWorth={netWorth} investable={investable} loading={loading} />
              <TotalAssetsCard
                assetsTotal={assetsTotal}
                delta1d={delta1d}
                delta1dPct={delta1dPct}
                delta1w={delta1w}
                delta1wPct={delta1wPct}
                loading={loading}
              />
              <CashOnHandCard cashOnHand={cashOnHand} loading={loading} />
              <DebtsCard debtsTotal={debtsTotal} loading={loading} />
              <TaxEstimateCard
                taxEstimate={taxEstimate}
                adjustedNetWorth={adjustedNetWorth}
                loading={loading}
              />
            </div>

            <GoalProgressCard netWorth={netWorth} onNavigate={onNavigate} />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-3">
                <AllocationChart holdings={holdings} loading={loading} />
              </div>
              <div className="lg:col-span-2">
                <MarketSummaryCard aiSummary={aiSummary} loading={loading} apiKeyMissing={apiKeyMissing} />
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
    </>
  );
}
