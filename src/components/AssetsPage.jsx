import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import HoldingsTable from './HoldingsTable';
import AddAssetModal from './AddAssetModal';
import Button from './ui/Button';

const LIABILITIES_STORAGE_KEY = 'wb-liabilities';

const PLATFORM_LABELS = {
  'ibkr-business': 'IBKR Business',
  'ibkr-personal': 'IBKR Personal',
  coinspot: 'Coinspot',
};

const DEFAULT_PLATFORMS = ['ibkr-business', 'ibkr-personal', 'coinspot'];

const LIABILITY_TYPES = ['Mortgage', 'Loan', 'Credit Card', 'Other'];

const aud = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

function readLiabilities() {
  try {
    return JSON.parse(localStorage.getItem(LIABILITIES_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLiabilities(items) {
  localStorage.setItem(LIABILITIES_STORAGE_KEY, JSON.stringify(items));
}

function formatLastSync(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' });
}

function buildPlatformRows(connections) {
  const byPlatform = Object.fromEntries((connections ?? []).map((c) => [c.platform, c]));
  return DEFAULT_PLATFORMS.map((platform) => {
    const conn = byPlatform[platform];
    return {
      platform,
      label: PLATFORM_LABELS[platform],
      status: conn?.status === 'connected' ? 'connected' : 'disconnected',
      lastSync: conn?.lastSync ?? null,
    };
  });
}

export default function AssetsPage({ holdings = [], loading = false, connections = [], onSync }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [liabilities, setLiabilities] = useState(readLiabilities);

  const [liabilityName, setLiabilityName] = useState('');
  const [liabilityType, setLiabilityType] = useState('Mortgage');
  const [liabilityValue, setLiabilityValue] = useState('');
  const [liabilityError, setLiabilityError] = useState(null);

  const platformRows = buildPlatformRows(connections);

  async function handleUploadSuccess() {
    if (onSync) await onSync();
  }

  function handleAddLiability(e) {
    e.preventDefault();
    const name = liabilityName.trim();
    const value = Number(liabilityValue);

    if (!name) {
      setLiabilityError('Enter a liability name.');
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setLiabilityError('Enter a value greater than zero (AUD).');
      return;
    }

    const entry = {
      id: crypto.randomUUID(),
      name,
      type: liabilityType,
      valueAUD: value,
    };

    const updated = [...liabilities, entry];
    writeLiabilities(updated);
    setLiabilities(updated);
    setLiabilityName('');
    setLiabilityValue('');
    setLiabilityType('Mortgage');
    setLiabilityError(null);
  }

  function handleDeleteLiability(id) {
    const updated = liabilities.filter((l) => l.id !== id);
    writeLiabilities(updated);
    setLiabilities(updated);
  }

  return (
    <main className="flex-1 overflow-y-auto p-7">
      <div className="mx-auto w-full max-w-7xl flex flex-col gap-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#111111] mb-1">Assets</h1>
          <p className="text-[13px] text-[#888888]">Holdings, connected platforms, and liabilities</p>
        </div>

        <div className="relative">
          <div className="absolute top-6 right-6 z-10">
            <Button variant="accent" onClick={() => setModalOpen(true)} className="px-3 py-2">
              <Plus size={14} />
              Asset
            </Button>
          </div>
          <HoldingsTable holdings={holdings} loading={loading} />
          {!loading && holdings.length === 0 && (
            <div className="mt-3 flex justify-center">
              <Button variant="ghost" onClick={() => setModalOpen(true)}>
                <Plus size={14} />
                Add your first asset
              </Button>
            </div>
          )}
        </div>

        <section className="bg-white rounded-[4px] border-2 border-[#111111] shadow-[4px_4px_0_#111111] p-6">
          <h2 className="label-mono text-[#111111] mb-4">Connected platforms</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {platformRows.map((row) => (
              <div
                key={row.platform}
                className="p-4 border-2 border-[#111111] rounded-[4px] shadow-[3px_3px_0_#111111]"
              >
                <p className="text-[13px] font-semibold text-[#111111] mb-2">{row.label}</p>
                <span
                  className={clsx(
                    'inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] border border-[#111111] rounded-[2px]',
                    row.status === 'connected' ? 'bg-[#c8f0d8]' : 'bg-[#f0ede6] text-[#888888]',
                  )}
                >
                  {row.status === 'connected' ? 'Connected' : 'Not connected'}
                </span>
                <p className="text-[11px] text-[#888888] mt-2">
                  {row.lastSync ? `Last sync: ${formatLastSync(row.lastSync)}` : 'No sync yet'}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-[4px] border-2 border-[#111111] shadow-[4px_4px_0_#111111] p-6">
          <h2 className="label-mono text-[#111111] mb-4">Liabilities</h2>

          <form onSubmit={handleAddLiability} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
            <div className="sm:col-span-1">
              <label htmlFor="liability-name" className="label-mono text-[#888888] text-[11px] block mb-2">
                Name
              </label>
              <input
                id="liability-name"
                type="text"
                value={liabilityName}
                onChange={(e) => setLiabilityName(e.target.value)}
                placeholder="e.g. Home loan"
                className="w-full border-2 border-[#111111] rounded-[4px] px-3 py-2 text-[13px]"
              />
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="liability-type" className="label-mono text-[#888888] text-[11px] block mb-2">
                Type
              </label>
              <select
                id="liability-type"
                value={liabilityType}
                onChange={(e) => setLiabilityType(e.target.value)}
                className="w-full border-2 border-[#111111] rounded-[4px] px-3 py-2 text-[13px] bg-white"
              >
                {LIABILITY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="liability-value" className="label-mono text-[#888888] text-[11px] block mb-2">
                Value (AUD)
              </label>
              <input
                id="liability-value"
                type="number"
                min="0"
                step="0.01"
                value={liabilityValue}
                onChange={(e) => setLiabilityValue(e.target.value)}
                placeholder="0.00"
                className="w-full border-2 border-[#111111] rounded-[4px] px-3 py-2 text-[13px] font-mono"
              />
            </div>
            <div className="sm:col-span-1 flex items-end">
              <Button type="submit" variant="accent" className="w-full justify-center">
                <Plus size={14} />
                Add
              </Button>
            </div>
          </form>

          {liabilityError && (
            <p className="text-[12px] text-[#111111] bg-[#f7b3d1] border-2 border-[#111111] rounded-[4px] px-3 py-2 mb-4">
              {liabilityError}
            </p>
          )}

          {liabilities.length === 0 ? (
            <div className="border-2 border-dashed border-[#bbbbbb] rounded-[4px] text-center text-[#888888] text-[13px] py-10">
              No liabilities yet — add a mortgage, loan, or credit card above
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {liabilities.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-4 p-4 border-2 border-[#111111] rounded-[4px] hover:bg-[#f0ede6] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#111111] truncate">{l.name}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] border border-[#111111] rounded-[2px] bg-[#f0ede6] text-[#888888]">
                      {l.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-[13px] text-[#111111]">{aud.format(l.valueAUD)}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteLiability(l.id)}
                      className="p-2 border-2 border-[#111111] rounded-[4px] hover:bg-[#f7b3d1] transition-colors"
                      aria-label={`Delete ${l.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <AddAssetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        connections={connections}
      />
    </main>
  );
}
