import { AlertCircle } from 'lucide-react';
import Card from './ui/Card';
import Skeleton from './ui/Skeleton';

export default function MarketSummaryCard({ aiSummary, loading, apiKeyMissing }) {
  return (
    <Card variant="sand">
      <h2 className="label-mono text-[#111111] mb-3">
        AI market summary
      </h2>

      {apiKeyMissing ? (
        <div className="flex items-center gap-2 text-[#888888]">
          <AlertCircle size={20} className="shrink-0" />
          <span className="text-[13px]">AI summary unavailable</span>
        </div>
      ) : loading || aiSummary === null ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
        </div>
      ) : (
        <p className="text-[13px] text-[#111111] leading-relaxed">{aiSummary}</p>
      )}
    </Card>
  );
}
