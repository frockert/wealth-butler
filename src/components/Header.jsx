import clsx from 'clsx';
import { RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import Button from './ui/Button';

const dtFmt = new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium', timeStyle: 'short' });

export default function Header({ syncing, onSync, lastUpdated, errors = [] }) {
  return (
    <header className="mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Wealth Butler</h1>

        <div className="flex items-center gap-4">
          {errors.map((err) => (
            <span
              key={err.source}
              className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-1"
            >
              <AlertTriangle size={12} />
              {err.source}
            </span>
          ))}

          <span className="flex items-center gap-1 text-sm text-gray-500">
            <Clock size={14} />
            {lastUpdated ? dtFmt.format(new Date(lastUpdated)) : 'Never synced'}
          </span>

          <Button onClick={onSync} disabled={syncing}>
            <RefreshCw size={16} className={clsx({ 'animate-spin': syncing })} />
            Sync
          </Button>
        </div>
      </div>
    </header>
  );
}
