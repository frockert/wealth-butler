import { useEffect, useState } from 'react';
import { fetchPortfolio, syncPortfolio } from './api/portfolio';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AssetsPage from './components/AssetsPage';
import GoalsPage from './components/GoalsPage';
import ComingSoonPage from './components/ComingSoonPage';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
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

  function deriveNetWorth(data) {
    if (!data) return null;
    let debtsTotal = 0;
    try {
      const items = JSON.parse(localStorage.getItem('wb-liabilities') || '[]');
      debtsTotal = items.reduce((sum, l) => sum + (l.valueAUD ?? 0), 0);
    } catch {
      /* ignore */
    }
    const assetsTotal =
      data.assetsTotal ??
      (data.holdings ?? []).reduce((sum, h) => sum + (h.valueAUD ?? 0), 0);
    return assetsTotal - debtsTotal;
  }

  function renderPage() {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            portfolio={portfolio}
            loading={loading}
            syncing={syncing}
            error={error}
            onErrorDismiss={() => setError(null)}
            onNavigate={setActivePage}
            onSync={handleSync}
          />
        );
      case 'assets':
        return (
          <AssetsPage
            holdings={portfolio?.holdings}
            loading={loading}
            connections={portfolio?.connections}
            onSync={handleSync}
          />
        );
      case 'goals':
        return <GoalsPage netWorth={deriveNetWorth(portfolio)} />;
      case 'ai-advisor':
        return <ComingSoonPage label="AI Advisor" />;
      case 'integrations':
        return <ComingSoonPage label="Integrations" />;
      default:
        return null;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="flex-1 flex flex-col min-h-0 bg-[#f0ede6] overflow-y-auto">
        {renderPage()}
      </div>
    </div>
  );
}
