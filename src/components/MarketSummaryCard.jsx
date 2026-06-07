import { AlertCircle } from 'lucide-react';
import Card from './ui/Card';
import Skeleton from './ui/Skeleton';

export default function MarketSummaryCard({ aiSummary, loading, apiKeyMissing }) {
  return (
    <Card className="rounded-2xl">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        AI Market Summary
      </h2>

      {apiKeyMissing ? (
        <div className="flex items-center gap-2 text-gray-400">
          <AlertCircle size={20} className="shrink-0" />
          <span className="text-sm">AI summary unavailable</span>
        </div>
      ) : loading || aiSummary === null ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
        </div>
      ) : (
        <p className="text-sm text-gray-700 leading-relaxed">{aiSummary}</p>
      )}
    </Card>
  );
}
