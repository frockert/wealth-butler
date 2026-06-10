import clsx from 'clsx';
import { RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import Button from './ui/Button';

const dtFmt = new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium', timeStyle: 'short' });

export default function Header({ syncing, onSync, lastUpdated, errors = [] }) {
  return (
    <header className="bg-[#111111] h-12 px-6 flex items-center justify-between shrink-0">
      <h1 className="text-[14px] font-semibold text-white">Dashboard</h1>

      <div className="flex items-center gap-4">
        {errors.map((err) => (
          <span
            key={err.source}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#111111] bg-[#f5e642] border-2 border-[#111111] rounded-[4px] px-2 py-0.5 shadow-[3px_3px_0_#7a6e00]"
          >
            <AlertTriangle size={11} />
            {err.source}
          </span>
        ))}

        <span className="flex items-center gap-1 text-[12px] text-[#888888]">
          <Clock size={14} />
          {lastUpdated ? dtFmt.format(new Date(lastUpdated)) : 'Never synced'}
        </span>

        <Button onClick={onSync} disabled={syncing} variant="ghost">
          <RefreshCw size={16} className={clsx({ 'animate-spin': syncing })} />
          Sync
        </Button>
      </div>
    </header>
  );
}
