import { useEffect, useState } from 'react';
import { Link, Plus, Trash2, Upload } from 'lucide-react';
import clsx from 'clsx';
import Button from './ui/Button';
import {
  uploadCsv,
  connectIbkrBusiness,
  connectIbkrPersonal,
  connectCoinspot,
} from '../api/portfolio';

const MANUAL_STORAGE_KEY = 'wb-manual-assets';

const PLATFORMS = [
  { id: 'ibkr-business', label: 'IBKR Business', needsKeys: false },
  { id: 'ibkr-personal', label: 'IBKR Personal', needsKeys: false },
  { id: 'coinspot', label: 'Coinspot', needsKeys: true },
];

const CONNECT_FNS = {
  'ibkr-business': connectIbkrBusiness,
  'ibkr-personal': connectIbkrPersonal,
};

const MANUAL_TYPES = ['Cash', 'Property', 'Super', 'Other'];

const TABS = [
  { id: 'connect', label: 'Connect broker' },
  { id: 'csv', label: 'Upload CSV' },
  { id: 'manual', label: 'Add manual asset' },
];

const aud = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

function readManualAssets() {
  try {
    return JSON.parse(localStorage.getItem(MANUAL_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeManualAssets(items) {
  localStorage.setItem(MANUAL_STORAGE_KEY, JSON.stringify(items));
}

export default function AddAssetModal({ open, onClose, onUploadSuccess, connections = [] }) {
  const [tab, setTab] = useState('connect');
  const [connectMessage, setConnectMessage] = useState(null);
  const [connectError, setConnectError] = useState(null);
  const [connectingId, setConnectingId] = useState(null);

  const [coinspotKey, setCoinspotKey] = useState('');
  const [coinspotSecret, setCoinspotSecret] = useState('');

  const [csvPlatform, setCsvPlatform] = useState('ibkr-business');
  const [csvFile, setCsvFile] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvError, setCsvError] = useState(null);
  const [csvSuccess, setCsvSuccess] = useState(null);

  const [manualName, setManualName] = useState('');
  const [manualType, setManualType] = useState('Cash');
  const [manualValue, setManualValue] = useState('');
  const [manualError, setManualError] = useState(null);
  const [manualAssets, setManualAssets] = useState([]);

  useEffect(() => {
    if (open) {
      setManualAssets(readManualAssets());
      setTab('connect');
      setConnectMessage(null);
      setConnectError(null);
      setConnectingId(null);
      setCoinspotKey('');
      setCoinspotSecret('');
      setCsvError(null);
      setCsvSuccess(null);
      setCsvFile(null);
      setManualError(null);
    }
  }, [open]);

  if (!open) return null;

  function connectionFor(platformId) {
    return connections.find((c) => c.platform === platformId);
  }

  async function handleConnect(platformId) {
    const platform = PLATFORMS.find((p) => p.id === platformId);
    const conn = connectionFor(platformId);

    if (platformId === 'coinspot') {
      if (!coinspotKey.trim() || !coinspotSecret.trim()) {
        setConnectError('Enter your Coinspot API key and secret.');
        return;
      }
    }

    setConnectingId(platformId);
    setConnectMessage(null);
    setConnectError(null);

    try {
      let result;
      if (platformId === 'coinspot') {
        result = await connectCoinspot(coinspotKey.trim(), coinspotSecret.trim());
      } else {
        result = await CONNECT_FNS[platformId]();
      }

      const count = result.holdingsCount;
      const syncNote =
        count != null
          ? ` Pulled ${count} holding${count === 1 ? '' : 's'}.`
          : '';
      const warn = result.warning ? ` (${result.warning})` : '';

      setConnectMessage(
        `${platform?.label} connected.${syncNote}${warn}`,
      );
      setCoinspotKey('');
      setCoinspotSecret('');
      onUploadSuccess?.();
    } catch (err) {
      setConnectError(
        conn?.status === 'connected'
          ? `${err.message} Existing CSV data is still available — try Upload CSV or fix credentials in server .env.`
          : `${err.message} Use Upload CSV instead if live connection is unavailable.`,
      );
    } finally {
      setConnectingId(null);
    }
  }

  async function handleCsvUpload() {
    if (!csvFile) {
      setCsvError('Choose a CSV file to upload.');
      return;
    }

    setCsvUploading(true);
    setCsvError(null);
    setCsvSuccess(null);

    try {
      const result = await uploadCsv(csvPlatform, csvFile);
      setCsvSuccess(`Imported ${result.holdingsCount} holding${result.holdingsCount === 1 ? '' : 's'} from ${PLATFORMS.find((p) => p.id === csvPlatform)?.label}.`);
      setCsvFile(null);
      onUploadSuccess?.();
    } catch (err) {
      setCsvError(err.message);
    } finally {
      setCsvUploading(false);
    }
  }

  function handleManualAdd(e) {
    e.preventDefault();
    const name = manualName.trim();
    const value = Number(manualValue);

    if (!name) {
      setManualError('Enter an asset name.');
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setManualError('Enter a value greater than zero (AUD).');
      return;
    }

    const entry = {
      id: crypto.randomUUID(),
      name,
      type: manualType,
      valueAUD: value,
    };

    const updated = [...manualAssets, entry];
    writeManualAssets(updated);
    setManualAssets(updated);
    setManualName('');
    setManualValue('');
    setManualType('Cash');
    setManualError(null);
  }

  function handleManualDelete(id) {
    const updated = manualAssets.filter((a) => a.id !== id);
    writeManualAssets(updated);
    setManualAssets(updated);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/40"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white border-2 border-[#111111] rounded-[4px] shadow-[6px_6px_0_#111111] w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-asset-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#111111]">
          <h2 id="add-asset-title" className="text-[15px] font-bold text-[#111111]">+ Asset</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#111111] font-bold text-xl leading-none hover:opacity-70"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="flex border-b-2 border-[#111111]">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={clsx(
                'flex-1 px-3 py-3 text-[11px] font-bold uppercase tracking-[0.04em] transition-colors',
                tab === t.id
                  ? 'bg-[#111111] text-white'
                  : 'bg-white text-[#888888] hover:bg-[#f0ede6]',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'connect' && (
            <div className="flex flex-col gap-4">
              {PLATFORMS.map((p) => {
                const conn = connectionFor(p.id);
                const connected = conn?.status === 'connected';
                const isConnecting = connectingId === p.id;
                return (
                  <div
                    key={p.id}
                    className="flex flex-col gap-3 p-4 border-2 border-[#111111] rounded-[4px] shadow-[3px_3px_0_#111111]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[13px] font-semibold text-[#111111]">{p.label}</p>
                        <span
                          className={clsx(
                            'inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] border border-[#111111] rounded-[2px]',
                            connected ? 'bg-[#c8f0d8]' : 'bg-[#f0ede6] text-[#888888]',
                          )}
                        >
                          {connected ? 'Connected' : 'Not connected'}
                        </span>
                        {conn?.lastSync && (
                          <p className="text-[10px] text-[#888888] mt-1">
                            Last sync: {new Intl.DateTimeFormat('en-AU').format(new Date(conn.lastSync))}
                          </p>
                        )}
                      </div>
                      {!p.needsKeys && (
                        <Button
                          variant="ghost"
                          onClick={() => handleConnect(p.id)}
                          disabled={isConnecting}
                          className="shrink-0 px-3 py-2"
                        >
                          <Link size={14} />
                          {isConnecting ? 'Connecting…' : connected ? 'Reconnect' : 'Connect'}
                        </Button>
                      )}
                    </div>

                    {p.needsKeys && (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={coinspotKey}
                          onChange={(e) => setCoinspotKey(e.target.value)}
                          placeholder="API key"
                          autoComplete="off"
                          className="w-full border-2 border-[#111111] rounded-[4px] px-3 py-2 text-[13px]"
                        />
                        <input
                          type="password"
                          value={coinspotSecret}
                          onChange={(e) => setCoinspotSecret(e.target.value)}
                          placeholder="API secret"
                          autoComplete="off"
                          className="w-full border-2 border-[#111111] rounded-[4px] px-3 py-2 text-[13px]"
                        />
                        <Button
                          variant="ghost"
                          onClick={() => handleConnect(p.id)}
                          disabled={isConnecting}
                          className="self-start px-3 py-2"
                        >
                          <Link size={14} />
                          {isConnecting ? 'Connecting…' : connected ? 'Reconnect' : 'Connect'}
                        </Button>
                      </div>
                    )}

                    {!p.needsKeys && (
                      <p className="text-[11px] text-[#888888]">
                        Uses server .env credentials (IBKR Flex Query or Client Portal Gateway).
                      </p>
                    )}
                  </div>
                );
              })}
              {connectError && (
                <p className="text-[12px] text-[#111111] bg-[#f7b3d1] border-2 border-[#111111] rounded-[4px] px-3 py-2">
                  {connectError}
                </p>
              )}
              {connectMessage && (
                <p className="text-[12px] text-[#111111] bg-[#c8f0d8] border-2 border-[#111111] rounded-[4px] px-3 py-2">
                  {connectMessage}
                </p>
              )}
              <button
                type="button"
                onClick={() => setTab('csv')}
                className="text-[12px] font-medium text-[#111111] underline hover:opacity-70 self-start"
              >
                Upload CSV instead
              </button>
            </div>
          )}

          {tab === 'csv' && (
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="csv-platform" className="label-mono text-[#888888] text-[11px] block mb-2">
                  Platform
                </label>
                <select
                  id="csv-platform"
                  value={csvPlatform}
                  onChange={(e) => setCsvPlatform(e.target.value)}
                  className="w-full border-2 border-[#111111] rounded-[4px] px-3 py-2 text-[13px] bg-white"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="csv-file" className="label-mono text-[#888888] text-[11px] block mb-2">
                  CSV file
                </label>
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
                  className="w-full border-2 border-[#111111] rounded-[4px] px-3 py-2 text-[13px] bg-white file:mr-3 file:border-0 file:bg-[#f0ede6] file:px-2 file:py-1 file:text-[12px] file:font-medium"
                />
              </div>
              {csvError && (
                <p className="text-[12px] text-[#111111] bg-[#f7b3d1] border-2 border-[#111111] rounded-[4px] px-3 py-2">
                  {csvError}
                </p>
              )}
              {csvSuccess && (
                <p className="text-[12px] text-[#111111] bg-[#c8f0d8] border-2 border-[#111111] rounded-[4px] px-3 py-2">
                  {csvSuccess}
                </p>
              )}
              <Button onClick={handleCsvUpload} disabled={csvUploading} variant="accent">
                <Upload size={14} />
                {csvUploading ? 'Parsing…' : 'Upload CSV'}
              </Button>
            </div>
          )}

          {tab === 'manual' && (
            <div className="flex flex-col gap-4">
              <form onSubmit={handleManualAdd} className="flex flex-col gap-3">
                <div>
                  <label htmlFor="manual-name" className="label-mono text-[#888888] text-[11px] block mb-2">
                    Name
                  </label>
                  <input
                    id="manual-name"
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="e.g. Savings account"
                    className="w-full border-2 border-[#111111] rounded-[4px] px-3 py-2 text-[13px]"
                  />
                </div>
                <div>
                  <label htmlFor="manual-type" className="label-mono text-[#888888] text-[11px] block mb-2">
                    Type
                  </label>
                  <select
                    id="manual-type"
                    value={manualType}
                    onChange={(e) => setManualType(e.target.value)}
                    className="w-full border-2 border-[#111111] rounded-[4px] px-3 py-2 text-[13px] bg-white"
                  >
                    {MANUAL_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="manual-value" className="label-mono text-[#888888] text-[11px] block mb-2">
                    Value (AUD)
                  </label>
                  <input
                    id="manual-value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualValue}
                    onChange={(e) => setManualValue(e.target.value)}
                    placeholder="0.00"
                    className="w-full border-2 border-[#111111] rounded-[4px] px-3 py-2 text-[13px] font-mono"
                  />
                </div>
                {manualError && (
                  <p className="text-[12px] text-[#111111] bg-[#f7b3d1] border-2 border-[#111111] rounded-[4px] px-3 py-2">
                    {manualError}
                  </p>
                )}
                <Button type="submit" variant="accent">
                  <Plus size={14} />
                  Add asset
                </Button>
              </form>

              {manualAssets.length > 0 && (
                <div className="border-t-2 border-[#f0ede6] pt-4">
                  <p className="label-mono text-[#888888] text-[11px] mb-2">Saved manual assets</p>
                  <ul className="flex flex-col gap-2">
                    {manualAssets.map((a) => (
                      <li
                        key={a.id}
                        className="flex items-center justify-between gap-2 p-3 border border-[#111111] rounded-[4px] text-[13px]"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-[#111111] truncate">{a.name}</p>
                          <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#888888]">{a.type}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-[13px]">{aud.format(a.valueAUD)}</span>
                          <button
                            type="button"
                            onClick={() => handleManualDelete(a.id)}
                            className="p-1 hover:bg-[#f7b3d1] rounded-[2px] border border-transparent hover:border-[#111111]"
                            aria-label={`Delete ${a.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
