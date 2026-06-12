import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
} from 'lucide-react';
import clsx from 'clsx';
import AddAssetModal from './AddAssetModal';
import Button from './ui/Button';
import Skeleton from './ui/Skeleton';

const LIABILITIES_STORAGE_KEY = 'wb-liabilities';
const CATEGORIES_STORAGE_KEY = 'wb-asset-categories';
const SECTIONS_STORAGE_KEY = 'wb-asset-sections';
const MANUAL_STORAGE_KEY = 'wb-manual-assets';

const FOOTER_BG = '#3a3a3a';

const BUILTIN_MATCHERS = {
  shares: (h) => h.assetType === 'stock',
  crypto: (h) => h.assetType === 'crypto',
  cash: (h) => h.assetType === 'cash' || (h.source === 'manual' && h.manualType === 'Cash'),
  'real-estate': (h) =>
    h.assetType === 'property' || (h.source === 'manual' && h.manualType === 'Property'),
  other: (h) =>
    h.source === 'manual' &&
    !['Cash', 'Property'].includes(h.manualType) &&
    !['stock', 'crypto', 'cash', 'property'].includes(h.assetType),
};

const DEFAULT_CATEGORIES = [
  { id: 'shares', label: 'Shares', builtin: 'shares', removable: false },
  { id: 'real-estate', label: 'Real Estate', builtin: 'real-estate', removable: false },
  { id: 'crypto', label: 'Crypto', builtin: 'crypto', removable: false },
  { id: 'cash', label: 'Cash', builtin: 'cash', removable: false },
];

const SECTION_PLACEHOLDERS = {
  shares: ['IBKR-BIZ', 'IBKR-PERSONAL'],
  crypto: ['COINSPOT'],
  cash: ['MANUAL'],
  'real-estate': ['MANUAL'],
};

const SECTION_LABELS = {
  'IBKR-BIZ': 'Interactive Brokers — Business',
  'IBKR-PERSONAL': 'Interactive Brokers — Personal',
  COINSPOT: 'Coinspot',
  MANUAL: 'Manual assets',
  OTHER: 'Other assets',
};

const PLATFORM_LABELS = {
  'ibkr-business': 'IBKR Business',
  'ibkr-personal': 'IBKR Personal',
  coinspot: 'Coinspot',
};

const DEFAULT_PLATFORMS = ['ibkr-business', 'ibkr-personal', 'coinspot'];
const LIABILITY_TYPES = ['Mortgage', 'Loan', 'Credit Card', 'Other'];

const aud = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });
const pctFmt = new Intl.NumberFormat('en-AU', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readLiabilities() {
  return readJson(LIABILITIES_STORAGE_KEY, []);
}

function writeLiabilities(items) {
  writeJson(LIABILITIES_STORAGE_KEY, items);
}

function readCategories() {
  const stored = readJson(CATEGORIES_STORAGE_KEY, null);
  if (!stored || stored.length === 0) return DEFAULT_CATEGORIES;
  return stored;
}

function writeCategories(categories) {
  writeJson(CATEGORIES_STORAGE_KEY, categories);
}

function readSections() {
  return readJson(SECTIONS_STORAGE_KEY, {});
}

function writeSections(sections) {
  writeJson(SECTIONS_STORAGE_KEY, sections);
}

function readManualAssets() {
  return readJson(MANUAL_STORAGE_KEY, []);
}

function manualToHolding(m) {
  const assetType =
    m.type === 'Property' ? 'property' : m.type === 'Cash' ? 'cash' : 'other';
  return {
    id: m.id,
    ticker: m.name,
    exchange: 'MANUAL',
    qty: 1,
    valueAUD: m.valueAUD,
    assetType,
    manualType: m.type,
    source: 'manual',
    costBasisAUD: null,
  };
}

function formatLastSync(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatAssetTotal(value) {
  if (value == null) return '–';
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(3)} Million`;
  }
  return aud.format(value);
}

function holdingGainPct(h) {
  if (h.costBasisAUD == null || h.costBasisAUD <= 0) return null;
  return ((h.valueAUD - h.costBasisAUD) / h.costBasisAUD) * 100;
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

function matchCategory(holding, category) {
  const matcher = category.builtin ? BUILTIN_MATCHERS[category.builtin] : null;
  if (matcher) return matcher(holding);
  if (category.id === holding.categoryId) return true;
  return false;
}

function groupByExchange(holdings) {
  const groups = new Map();
  for (const h of holdings) {
    const key = h.exchange || 'OTHER';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(h);
  }
  for (const items of groups.values()) {
    items.sort((a, b) => b.valueAUD - a.valueAUD);
  }
  return groups;
}

function sectionKeysForCategory(category, customSections) {
  const builtin = SECTION_PLACEHOLDERS[category.builtin ?? category.id] ?? [];
  const custom = (customSections[category.id] ?? []).map((s) => s.key);
  return [...builtin, ...custom];
}

function buildAccountGroups(category, holdings, customSections) {
  const placeholders = sectionKeysForCategory(category, customSections);
  const grouped = groupByExchange(holdings);
  const seen = new Set();

  const sections = placeholders.map((exchange) => {
    seen.add(exchange);
    return [exchange, grouped.get(exchange) ?? []];
  });

  for (const [exchange, items] of grouped.entries()) {
    if (!seen.has(exchange)) {
      sections.push([exchange, items]);
    }
  }

  return sections;
}

function sectionLabel(exchange, categoryId, customSections) {
  if (SECTION_LABELS[exchange]) return SECTION_LABELS[exchange];
  const custom = (customSections[categoryId] ?? []).find((s) => s.key === exchange);
  return custom?.label ?? exchange;
}

function CategoryMenu({ onRename, onRemove, removable, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-1 z-20 bg-white border border-[#111111] rounded-[4px] shadow-[3px_3px_0_#111111] min-w-[120px] py-1"
      role="menu"
    >
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onRename();
          onClose();
        }}
        className="w-full text-left px-3 py-2 text-[13px] text-[#111111] hover:bg-[#f0ede6] transition-colors"
      >
        Rename
      </button>
      {removable && (
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onRemove();
            onClose();
          }}
          className="w-full text-left px-3 py-2 text-[13px] text-[#e63946] hover:bg-[#f0ede6] transition-colors"
        >
          Remove
        </button>
      )}
    </div>
  );
}

function AssetTypeCard({
  category,
  total,
  active,
  onSelect,
  onRename,
  onRemove,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={clsx(
        'relative shrink-0 min-w-[120px] px-4 py-3 border rounded-[4px] transition-colors cursor-pointer',
        active
          ? 'border-[#111111] bg-white shadow-[2px_2px_0_#111111]'
          : 'border-[#dddddd] bg-white hover:border-[#888888]',
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        if (!menuOpen) setMenuOpen(false);
      }}
    >
      <button
        type="button"
        onClick={onSelect}
        className="w-full text-left"
      >
        <p
          className={clsx(
            'text-[13px] pr-5',
            active ? 'font-bold text-[#111111]' : 'font-medium text-[#888888]',
          )}
        >
          {category.label}
        </p>
        <p className="text-[13px] font-mono text-[#111111] mt-1">{aud.format(total)}</p>
      </button>

      {(hovered || menuOpen) && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className="absolute top-2 right-2 p-0.5 text-[#888888] hover:text-[#111111] transition-colors"
          aria-label={`Options for ${category.label}`}
        >
          <ChevronRight size={14} />
        </button>
      )}

      {menuOpen && (
        <CategoryMenu
          removable={category.removable}
          onRename={onRename}
          onRemove={onRemove}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}

function AssetTypeRow({
  categories,
  totalsById,
  activeCategoryId,
  onSelect,
  onRename,
  onRemove,
  onAdd,
  loading,
}) {
  return (
    <div className="flex items-stretch gap-3 overflow-x-auto pb-1">
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] w-[120px] shrink-0" />
        ))
      ) : (
        categories.map((cat) => (
          <AssetTypeCard
            key={cat.id}
            category={cat}
            total={totalsById[cat.id] ?? 0}
            active={activeCategoryId === cat.id}
            onSelect={() => onSelect(cat.id)}
            onRename={() => onRename(cat)}
            onRemove={() => onRemove(cat)}
          />
        ))
      )}
      {!loading && (
        <button
          type="button"
          onClick={onAdd}
          className="shrink-0 min-w-[48px] px-3 py-3 border border-dashed border-[#bbbbbb] rounded-[4px] flex items-center justify-center text-[#888888] hover:border-[#111111] hover:text-[#111111] transition-colors"
          aria-label="Add asset type"
        >
          <Plus size={18} />
        </button>
      )}
    </div>
  );
}

function NetWorthHeader({ assetsTotal, delta, deltaPct, loading }) {
  const isPositive = delta != null && delta > 0;
  const isNegative = delta != null && delta < 0;

  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-6">
      {loading ? (
        <>
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-5 w-32" />
        </>
      ) : (
        <>
          <h1 className="text-[32px] font-bold text-[#111111] leading-none tracking-tight">
            {formatAssetTotal(assetsTotal)}
          </h1>
          {delta != null && (
            <p
              className={clsx(
                'text-[14px] font-semibold flex items-center gap-1',
                isPositive && 'text-[#00c48c]',
                isNegative && 'text-[#e63946]',
                !isPositive && !isNegative && 'text-[#888888]',
              )}
            >
              {isPositive && <ArrowUp size={14} strokeWidth={2.5} aria-hidden />}
              {isNegative && <ArrowDown size={14} strokeWidth={2.5} aria-hidden />}
              {aud.format(delta)}
              {deltaPct != null ? ` (${pctFmt.format(deltaPct / 100)})` : ''}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function HoldingRow({ holding, showIrr }) {
  const gainPct = holdingGainPct(holding);
  const hasGain = gainPct != null;
  const isUp = hasGain && gainPct >= 0;

  return (
    <tr className="border-b border-[#eeeeee] hover:bg-[#faf9f7] transition-colors">
      <td className="py-3 pr-4">
        <p className="text-[13px] font-medium text-[#111111]">{holding.ticker}</p>
      </td>
      {showIrr && (
        <td className="py-3 pr-4 w-[140px]">
          {holding.costBasisAUD != null ? (
            <div>
              <p className="text-[11px] text-[#888888]">Cost {aud.format(holding.costBasisAUD)}</p>
              {hasGain && (
                <p
                  className={clsx(
                    'text-[12px] font-semibold mt-0.5',
                    isUp ? 'text-[#00c48c]' : 'text-[#e63946]',
                  )}
                >
                  {isUp ? '+' : ''}{gainPct.toFixed(0)}%
                </p>
              )}
            </div>
          ) : (
            <span className="text-[12px] text-[#bbbbbb]">–</span>
          )}
        </td>
      )}
      <td className="py-3 text-right">
        <p className="text-[13px] font-mono font-medium text-[#111111]">{aud.format(holding.valueAUD)}</p>
        <p className="text-[11px] text-[#888888] mt-0.5">
          {holding.ticker}{' '}
          {holding.source === 'manual'
            ? ''
            : Number(holding.qty).toLocaleString('en-AU', { maximumFractionDigits: 4 })}
        </p>
      </td>
    </tr>
  );
}

function ActionCard({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 bg-[#c8f0d8] text-[#111111] border border-[#1a6640] rounded-[4px] px-3 py-2 label-mono text-[10px] hover:bg-[#b5e8cc] transition-colors"
    >
      <Plus size={12} strokeWidth={2.5} />
      {label}
    </button>
  );
}

function AccountSection({ exchange, label, holdings, showIrr, expanded, onToggle }) {
  const total = holdings.reduce((s, h) => s + h.valueAUD, 0);
  const totalCost = holdings.reduce((s, h) => s + (h.costBasisAUD ?? 0), 0);
  const totalGainPct = totalCost > 0 ? ((total - totalCost) / totalCost) * 100 : null;

  return (
    <section className="mb-6">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 w-full text-left py-2 group"
      >
        {expanded ? (
          <ChevronDown size={16} className="text-[#888888] shrink-0" />
        ) : (
          <ChevronRight size={16} className="text-[#888888] shrink-0" />
        )}
        <span className="text-[14px] font-semibold text-[#111111] group-hover:text-[#555555] transition-colors">
          {label}
        </span>
      </button>

      {expanded && (
        <>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#dddddd]">
                <th className="py-2 pr-4 text-left label-mono font-normal text-[#888888] text-[10px]">Asset</th>
                {showIrr && (
                  <th className="py-2 pr-4 text-left label-mono font-normal text-[#888888] text-[10px] w-[140px]">
                    IRR
                  </th>
                )}
                <th className="py-2 text-right label-mono font-normal text-[#888888] text-[10px]">Value</th>
              </tr>
            </thead>
            <tbody>
              {holdings.length === 0 ? (
                <tr>
                  <td
                    colSpan={showIrr ? 3 : 2}
                    className="py-6 text-center text-[12px] text-[#bbbbbb]"
                  >
                    No assets in this section
                  </td>
                </tr>
              ) : (
                holdings.map((h, i) => (
                  <HoldingRow key={`${h.ticker}-${h.exchange}-${i}`} holding={h} showIrr={showIrr} />
                ))
              )}
            </tbody>
          </table>

          <div
            className="flex items-center justify-end text-[#f0ede6] px-4 py-2.5 mt-1 rounded-[2px]"
            style={{ backgroundColor: FOOTER_BG }}
          >
            <div className="flex items-center gap-4 text-[12px] font-mono">
              {showIrr && totalCost > 0 && (
                <>
                  <span className="text-[#aaaaaa]">Cost {aud.format(totalCost)}</span>
                  {totalGainPct != null && (
                    <span className={totalGainPct >= 0 ? 'text-[#6dd4ae]' : 'text-[#f08080]'}>
                      {totalGainPct >= 0 ? '+' : ''}{totalGainPct.toFixed(0)}%
                    </span>
                  )}
                </>
              )}
              <span className="font-semibold">{aud.format(total)}</span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function CategoryFooter({
  label,
  total,
  totalCost,
  showIrr,
  onAddSection,
  onAddAsset,
}) {
  const totalGainPct = totalCost > 0 ? ((total - totalCost) / totalCost) * 100 : null;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between border-t-2 border-[#111111] pt-4 mb-3">
        <span className="text-[14px] font-semibold text-[#111111]">{label}</span>
        <div className="flex items-center gap-4 text-[14px] font-mono font-semibold text-[#111111]">
          {showIrr && totalCost > 0 && (
            <>
              <span className="text-[12px] font-normal text-[#888888]">Cost {aud.format(totalCost)}</span>
              {totalGainPct != null && (
                <span
                  className={clsx(
                    'text-[12px] font-semibold',
                    totalGainPct >= 0 ? 'text-[#00c48c]' : 'text-[#e63946]',
                  )}
                >
                  {totalGainPct >= 0 ? '+' : ''}{totalGainPct.toFixed(0)}%
                </span>
              )}
            </>
          )}
          <span>{aud.format(total)}</span>
        </div>
      </div>

      <div
        className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-[2px]"
        style={{ backgroundColor: FOOTER_BG }}
      >
        <ActionCard label="New section" onClick={onAddSection} />
        <ActionCard label="Add asset" onClick={onAddAsset} />
      </div>
    </div>
  );
}

export default function AssetsPage({
  holdings = [],
  loading = false,
  connections = [],
  assetsTotal = 0,
  delta = null,
  deltaPct = null,
  onSync,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [liabilities, setLiabilities] = useState(readLiabilities);
  const [categories, setCategories] = useState(readCategories);
  const [customSections, setCustomSections] = useState(readSections);
  const [showManage, setShowManage] = useState(false);
  const [manualAssets, setManualAssets] = useState(readManualAssets);

  const [liabilityName, setLiabilityName] = useState('');
  const [liabilityType, setLiabilityType] = useState('Mortgage');
  const [liabilityValue, setLiabilityValue] = useState('');
  const [liabilityError, setLiabilityError] = useState(null);

  const [activeCategoryId, setActiveCategoryId] = useState('shares');
  const [expandedSections, setExpandedSections] = useState(new Set());

  const platformRows = buildPlatformRows(connections);
  const liabilitiesTotal = liabilities.reduce((s, l) => s + (l.valueAUD ?? 0), 0);
  const netAssets = assetsTotal - liabilitiesTotal;

  const allHoldings = useMemo(() => {
    const manual = manualAssets.map(manualToHolding);
    return [...holdings, ...manual];
  }, [holdings, manualAssets]);

  const totalsById = useMemo(() => {
    const totals = {};
    for (const cat of categories) {
      totals[cat.id] = allHoldings
        .filter((h) => matchCategory(h, cat))
        .reduce((s, h) => s + h.valueAUD, 0);
    }
    return totals;
  }, [allHoldings, categories]);

  const activeCategory = categories.find((c) => c.id === activeCategoryId) ?? categories[0];

  const filteredHoldings = useMemo(() => {
    if (!activeCategory) return [];
    return allHoldings.filter((h) => matchCategory(h, activeCategory));
  }, [allHoldings, activeCategory]);

  const categoryTotal = filteredHoldings.reduce((s, h) => s + h.valueAUD, 0);
  const categoryTotalCost = filteredHoldings.reduce((s, h) => s + (h.costBasisAUD ?? 0), 0);
  const accountGroups = useMemo(
    () =>
      activeCategory
        ? buildAccountGroups(activeCategory, filteredHoldings, customSections)
        : [],
    [activeCategory, filteredHoldings, customSections],
  );
  const showIrr = activeCategory?.builtin === 'shares';

  useEffect(() => {
    if (!categories.some((c) => c.id === activeCategoryId) && categories.length > 0) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  useEffect(() => {
    setExpandedSections(new Set(accountGroups.map(([exchange]) => exchange)));
  }, [accountGroups]);

  useEffect(() => {
    function refreshManual() {
      setManualAssets(readManualAssets());
    }
    window.addEventListener('storage', refreshManual);
    return () => window.removeEventListener('storage', refreshManual);
  }, []);

  function toggleSection(exchange) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(exchange)) next.delete(exchange);
      else next.add(exchange);
      return next;
    });
  }

  function persistCategories(updated) {
    writeCategories(updated);
    setCategories(updated);
  }

  function handleRenameCategory(category) {
    const name = window.prompt('Rename asset type', category.label);
    if (!name?.trim()) return;
    persistCategories(
      categories.map((c) => (c.id === category.id ? { ...c, label: name.trim() } : c)),
    );
  }

  function handleRemoveCategory(category) {
    if (!category.removable) return;
    persistCategories(categories.filter((c) => c.id !== category.id));
    if (activeCategoryId === category.id) {
      setActiveCategoryId(categories.find((c) => c.id !== category.id)?.id ?? 'shares');
    }
  }

  function handleAddCategory() {
    const name = window.prompt('New asset type name');
    if (!name?.trim()) return;
    const entry = {
      id: crypto.randomUUID(),
      label: name.trim(),
      builtin: null,
      removable: true,
    };
    persistCategories([...categories, entry]);
    setActiveCategoryId(entry.id);
  }

  function handleAddSection() {
    if (!activeCategory) return;
    const name = window.prompt('New section name');
    if (!name?.trim()) return;

    const key = `custom-${crypto.randomUUID()}`;
    const entry = { id: crypto.randomUUID(), label: name.trim(), key };
    const updated = {
      ...customSections,
      [activeCategory.id]: [...(customSections[activeCategory.id] ?? []), entry],
    };
    writeSections(updated);
    setCustomSections(updated);
    setExpandedSections((prev) => new Set([...prev, key]));
  }

  async function handleUploadSuccess() {
    setManualAssets(readManualAssets());
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

  const activeLabel = activeCategory?.label ?? 'Assets';

  return (
    <main className="flex-1 overflow-y-auto p-7">
      <div className="mx-auto w-full max-w-4xl">
        <NetWorthHeader
          assetsTotal={netAssets}
          delta={delta}
          deltaPct={deltaPct}
          loading={loading}
        />

        <AssetTypeRow
          categories={categories}
          totalsById={totalsById}
          activeCategoryId={activeCategoryId}
          onSelect={setActiveCategoryId}
          onRename={handleRenameCategory}
          onRemove={handleRemoveCategory}
          onAdd={handleAddCategory}
          loading={loading}
        />

        <div className="mt-8">
          {loading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <>
              {accountGroups.map(([exchange, sectionHoldings]) => (
                <AccountSection
                  key={`${activeCategoryId}-${exchange}`}
                  exchange={exchange}
                  label={sectionLabel(exchange, activeCategoryId, customSections)}
                  holdings={sectionHoldings}
                  showIrr={showIrr}
                  expanded={expandedSections.has(exchange)}
                  onToggle={() => toggleSection(exchange)}
                />
              ))}

              <CategoryFooter
                label={activeLabel}
                total={categoryTotal}
                totalCost={categoryTotalCost}
                showIrr={showIrr}
                onAddSection={handleAddSection}
                onAddAsset={() => setModalOpen(true)}
              />
            </>
          )}
        </div>

        <div className="mt-12 border-t border-[#dddddd] pt-6">
          <button
            type="button"
            onClick={() => setShowManage(!showManage)}
            className="flex items-center gap-2 text-[13px] text-[#888888] hover:text-[#111111] transition-colors mb-4"
          >
            {showManage ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <MoreHorizontal size={16} />
            Manage connections & liabilities
          </button>

          {showManage && (
            <div className="flex flex-col gap-6">
              <section>
                <h2 className="label-mono text-[#888888] mb-3">Connected platforms</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {platformRows.map((row) => (
                    <div key={row.platform} className="p-3 border border-[#dddddd] rounded-[4px]">
                      <p className="text-[13px] font-semibold text-[#111111] mb-1">{row.label}</p>
                      <span
                        className={clsx(
                          'text-[10px] font-bold uppercase tracking-[0.06em]',
                          row.status === 'connected' ? 'text-[#00c48c]' : 'text-[#888888]',
                        )}
                      >
                        {row.status === 'connected' ? 'Connected' : 'Not connected'}
                      </span>
                      <p className="text-[11px] text-[#888888] mt-1">
                        {row.lastSync ? `Last sync: ${formatLastSync(row.lastSync)}` : 'No sync yet'}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="label-mono text-[#888888] mb-3">Liabilities</h2>

                <form onSubmit={handleAddLiability} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
                  <input
                    type="text"
                    value={liabilityName}
                    onChange={(e) => setLiabilityName(e.target.value)}
                    placeholder="Name"
                    className="border border-[#111111] rounded-[4px] px-3 py-2 text-[13px] sm:col-span-1"
                  />
                  <select
                    value={liabilityType}
                    onChange={(e) => setLiabilityType(e.target.value)}
                    className="border border-[#111111] rounded-[4px] px-3 py-2 text-[13px] bg-white sm:col-span-1"
                  >
                    {LIABILITY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={liabilityValue}
                    onChange={(e) => setLiabilityValue(e.target.value)}
                    placeholder="Value (AUD)"
                    className="border border-[#111111] rounded-[4px] px-3 py-2 text-[13px] font-mono sm:col-span-1"
                  />
                  <Button type="submit" variant="accent" className="justify-center sm:col-span-1">
                    <Plus size={14} />
                    Add
                  </Button>
                </form>

                {liabilityError && (
                  <p className="text-[12px] text-[#111111] bg-[#f7b3d1] border border-[#111111] rounded-[4px] px-3 py-2 mb-3">
                    {liabilityError}
                  </p>
                )}

                {liabilities.length === 0 ? (
                  <p className="text-[13px] text-[#888888]">No liabilities yet</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {liabilities.map((l) => (
                      <li
                        key={l.id}
                        className="flex items-center justify-between gap-4 py-2 border-b border-[#eeeeee]"
                      >
                        <div>
                          <p className="text-[13px] font-medium text-[#111111]">{l.name}</p>
                          <span className="text-[11px] text-[#888888]">{l.type}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[13px]">{aud.format(l.valueAUD)}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteLiability(l.id)}
                            className="p-1.5 hover:bg-[#f7b3d1] rounded-[4px] transition-colors"
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
          )}
        </div>
      </div>

      <AddAssetModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setManualAssets(readManualAssets());
        }}
        onUploadSuccess={handleUploadSuccess}
        connections={connections}
      />
    </main>
  );
}
