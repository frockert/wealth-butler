import { useEffect, useState } from 'react';
import { Sparkles, Edit2, Target, Loader2 } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';

const GOAL_KEY = 'wb-goal-config';
const fmt = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

function readGoalConfig() {
  try {
    const raw = localStorage.getItem(GOAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveGoalConfig(config) {
  localStorage.setItem(GOAL_KEY, JSON.stringify(config));
}
function monthsUntilTargetYear(targetYear) {
  const now = new Date();
  const months = (targetYear - now.getFullYear()) * 12 - now.getMonth();
  return Math.max(1, months);
}

function calculateManualConfig(targetAUD, targetYear, annualSavings) {
  const months = monthsUntilTargetYear(Number(targetYear));
  const monthlySavingsRequired = Number(targetAUD) / months - Number(annualSavings) / 12;
  return {
    targetAUD: Number(targetAUD),
    targetYear: Number(targetYear),
    annualSavings: Number(annualSavings),
    monthlySavingsRequired: Math.max(0, monthlySavingsRequired),
    notes: 'Manually calculated',
  };
}

async function generateGoalWithAI({ targetAUD, targetYear, annualSavings }) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `You are a FIRE planning assistant for an Australian investor.

Inputs:
- FIRE target: A$${targetAUD}
- Target year: ${targetYear}
- Current annual savings: A$${annualSavings}

Return ONLY valid JSON (no markdown fences) with this exact shape:
{
  "targetAUD": number,
  "targetYear": number,
  "annualSavings": number,
  "monthlySavingsRequired": number,
  "notes": "2-3 sentence encouraging narrative with specific numbers"
}`,
      },
    ],
  });

  const text = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI response was not valid JSON');
  return JSON.parse(jsonMatch[0]);
}

const SETUP_STEPS = [
  {
    label: "What's your FIRE target?",
    hint: 'Total AUD you need to retire',
    field: 'targetAUD',
  },
  {
    label: 'By what year do you want to reach FIRE?',
    hint: 'Target year',
    field: 'targetYear',
  },
  {
    label: 'What are your current annual savings (AUD)?',
    hint: 'Annual savings',
    field: 'annualSavings',
  },
];

const CONFIG_FIELDS = [
  { key: 'targetAUD', label: 'FIRE target', format: (v) => fmt.format(v) },
  { key: 'targetYear', label: 'Target year', format: (v) => String(v) },
  { key: 'annualSavings', label: 'Annual savings', format: (v) => fmt.format(v) },
  {
    key: 'monthlySavingsRequired',
    label: 'Monthly savings required',
    format: (v) => fmt.format(v),
  },
];

function EditableField({ label, value, displayValue, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ''));

  useEffect(() => {
    if (!editing) setDraft(String(value ?? ''));
  }, [value, editing]);

  function commit() {
    const parsed = Number(draft);
    if (!Number.isFinite(parsed)) return;
    onSave(parsed);
    setEditing(false);
  }

  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b-2 border-[#3d2880]/20 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="label-mono font-normal tracking-[0.06em] text-[#888888] mb-1">{label}</p>
        {editing ? (
          <input
            type="number"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') setEditing(false);
            }}
            autoFocus
            className="w-full font-sans text-[18px] font-semibold text-[#111111] bg-white border-2 border-[#111111] rounded-[4px] px-2 py-1"
          />
        ) : (
          <p className="font-sans text-[18px] font-semibold text-[#111111]">{displayValue}</p>
        )}
      </div>
      {!editing && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="shrink-0 p-1 text-[#3d2880] hover:opacity-70"
          aria-label={`Edit ${label}`}
        >
          <Edit2 size={16} />
        </button>
      )}
    </div>
  );
}

export default function GoalsPage({ netWorth: netWorthProp }) {
  const [goal, setGoal] = useState(null);
  const [setupStep, setSetupStep] = useState(1);
  const [answers, setAnswers] = useState({ targetAUD: '', targetYear: '', annualSavings: '' });
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState(null);

  useEffect(() => {
    setGoal(readGoalConfig());
  }, []);

  const netWorth = netWorthProp ?? null;

  function updateAnswer(field, value) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }

  function currentFieldValue() {
    const field = SETUP_STEPS[setupStep - 1].field;
    return answers[field];
  }

  function canAdvance() {
    const val = Number(currentFieldValue());
    return Number.isFinite(val) && val > 0;
  }

  async function calculatePlan() {
    setCalcError(null);
    setCalculating(true);

    try {
      const inputs = {
        targetAUD: Number(answers.targetAUD),
        targetYear: Number(answers.targetYear),
        annualSavings: Number(answers.annualSavings),
      };

      let config;
      if (import.meta.env.VITE_ANTHROPIC_API_KEY) {
        config = await generateGoalWithAI(inputs);
      } else {
        config = calculateManualConfig(inputs.targetAUD, inputs.targetYear, inputs.annualSavings);
      }

      saveGoalConfig(config);
      setGoal(config);
    } catch (err) {
      setCalcError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setCalculating(false);
    }
  }

  function handleReset() {
    localStorage.removeItem(GOAL_KEY);
    setGoal(null);
    setSetupStep(1);
    setAnswers({ targetAUD: '', targetYear: '', annualSavings: '' });
    setCalcError(null);
  }

  function handleFieldSave(key, value) {
    const updated = { ...goal, [key]: value };
    saveGoalConfig(updated);
    setGoal(updated);
  }

  const progress =
    goal?.targetAUD && netWorth != null
      ? Math.max(0, Math.min((netWorth / goal.targetAUD) * 100, 100))
      : null;

  return (
    <main className="flex-1 overflow-y-auto p-7">
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Target size={28} className="text-[#3d2880] shrink-0" />
          <h1 className="font-sans text-[28px] font-bold text-[#111111]">Goals</h1>
        </div>

        {!goal ? (
          <Card variant="purple">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={20} className="text-[#3d2880]" />
              <h2 className="font-sans text-[18px] font-semibold text-[#111111]">
                Set up your FIRE goal
              </h2>
            </div>

            <p className="label-mono text-[12px] text-[#888888] mb-6">
              Step {setupStep} of {SETUP_STEPS.length}
            </p>

            {calculating ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 size={32} className="text-[#3d2880] animate-spin" />
                <p className="text-[15px] font-medium text-[#111111]">Crunching your numbers...</p>
              </div>
            ) : (
              <>
                <label className="block mb-6">
                  <span className="block font-sans text-[15px] font-semibold text-[#111111] mb-1">
                    {SETUP_STEPS[setupStep - 1].label}
                  </span>
                  <span className="block text-[13px] text-[#888888] mb-3">
                    {SETUP_STEPS[setupStep - 1].hint}
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={currentFieldValue()}
                    onChange={(e) =>
                      updateAnswer(SETUP_STEPS[setupStep - 1].field, e.target.value)
                    }
                    className="w-full font-sans text-[18px] font-semibold text-[#111111] bg-white border-2 border-[#111111] rounded-[4px] px-3 py-2 shadow-[3px_3px_0_#3d2880]"
                  />
                </label>

                {calcError && (
                  <div className="mb-4 p-3 bg-[#f7b3d1] border-2 border-[#111111] rounded-[4px]">
                    <p className="text-[13px] font-medium text-[#111111] mb-2">{calcError}</p>
                    <button
                      type="button"
                      onClick={calculatePlan}
                      className="text-[13px] font-semibold text-[#111111] underline hover:opacity-70"
                    >
                      Retry
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  {setupStep > 1 ? (
                    <Button variant="ghost" onClick={() => setSetupStep((s) => s - 1)}>
                      Back
                    </Button>
                  ) : (
                    <span />
                  )}

                  {setupStep < SETUP_STEPS.length ? (
                    <Button
                      onClick={() => setSetupStep((s) => s + 1)}
                      disabled={!canAdvance()}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button onClick={calculatePlan} disabled={!canAdvance()}>
                      Calculate my FIRE plan
                    </Button>
                  )}
                </div>
              </>
            )}
          </Card>
        ) : (
          <>
            <Card variant="purple" className="mb-6">
              {CONFIG_FIELDS.map(({ key, label, format }) => (
                <EditableField
                  key={key}
                  label={label}
                  value={goal[key]}
                  displayValue={format(goal[key])}
                  onSave={(value) => handleFieldSave(key, value)}
                />
              ))}

              {progress != null && (
                <div className="pt-4 mt-2">
                  <div className="flex items-center justify-between text-[12px] mb-2">
                    <span className="text-[#888888]">Progress</span>
                    <span className="font-sans font-semibold text-[#111111]">
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-4 bg-white border-2 border-[#111111] rounded-[2px] overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{ width: `${progress}%`, backgroundColor: '#00c48c' }}
                    />
                  </div>
                </div>
              )}

              {goal.notes && (
                <p className="text-[13px] text-[#111111] mt-4 leading-relaxed border-t-2 border-[#3d2880]/20 pt-4">
                  {goal.notes}
                </p>
              )}
            </Card>

            <Button variant="ghost" onClick={handleReset}>
              Reset goal
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
