import { Target } from 'lucide-react';
import Card from './ui/Card';

const fmt = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

function readGoalConfig() {
  try {
    const raw = localStorage.getItem('wb-goal-config');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function GoalProgressCard({ netWorth, onNavigate }) {
  const goal = readGoalConfig();

  if (!goal?.targetAUD) {
    return (
      <Card variant="purple" className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Target size={24} className="text-[#3d2880] shrink-0" />
          <p className="text-[13px] font-medium text-[#111111]">Track your path to financial independence</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('goals')}
          className="text-[13px] font-semibold text-[#3d2880] hover:underline whitespace-nowrap"
        >
          Set up your FIRE goal →
        </button>
      </Card>
    );
  }

  const progress = Math.max(0, Math.min(((netWorth ?? 0) / goal.targetAUD) * 100, 100));

  return (
    <Card variant="purple">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="label-mono font-normal tracking-[0.06em] text-[#888888] mb-1">FIRE goal</p>
          <p className="font-sans text-[24px] font-bold text-[#111111]">{fmt.format(goal.targetAUD)}</p>
        </div>
        <div className="text-right">
          <p className="label-mono font-normal tracking-[0.06em] text-[#888888] mb-1">Target year</p>
          <p className="font-sans text-[18px] font-semibold text-[#111111]">{goal.targetYear}</p>
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between text-[12px]">
        <span className="text-[#888888]">Current net worth</span>
        <span className="font-sans font-semibold text-[#111111]">{fmt.format(netWorth ?? 0)}</span>
      </div>

      <div className="h-4 bg-white border-2 border-[#111111] rounded-[2px] overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${progress}%`, backgroundColor: '#00c48c' }}
        />
      </div>
      <p className="text-[11px] text-[#888888] mt-2 text-right">{progress.toFixed(1)}% of goal</p>
    </Card>
  );
}
