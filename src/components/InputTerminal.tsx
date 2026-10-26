import React from 'react';
import { Sparkles, Trash2, Lightbulb, ArrowRight, Check } from 'lucide-react';
import { ROLE_PRESETS } from '../utils/promptBuilder';
import { RolePreset } from '../types/prompt';

interface InputTerminalProps {
  rawGoal: string;
  onRawGoalChange: (val: string) => void;
  selectedRolePresetId: string;
  onSelectRolePreset: (preset: RolePreset) => void;
  onStructurePrompt: () => void;
  onClearInput: () => void;
  onLoadSample: (sampleText: string) => void;
}

const SAMPLE_GOALS = [
  'Create a comprehensive unit test suite in TypeScript for an asynchronous user authentication service with edge cases, expired tokens, and network failures.',
  'Design a high-throughput event-driven microservices architecture RFC for real-time inventory management with Redis caching and Kafka streams.',
  'Draft a developer quickstart guide for integrating our RESTful Webhook API with payload verification and retry policies.',
  'Analyze a customer churn dataset to uncover early behavioral warning signals, calculate cohort retention, and recommend preventative product experiments.',
];

export const InputTerminal: React.FC<InputTerminalProps> = ({
  rawGoal,
  onRawGoalChange,
  selectedRolePresetId,
  onSelectRolePreset,
  onStructurePrompt,
  onClearInput,
  onLoadSample,
}) => {
  const charCount = rawGoal.length;
  const wordCount = rawGoal.trim() ? rawGoal.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-[#2A2A3E] border border-[#383852] rounded-xl flex flex-col shadow-lg overflow-hidden">
      {/* Terminal Title Bar */}
      <div className="px-4 py-3 bg-[#242436] border-b border-[#383852] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600/70" />
          </div>
          <span className="text-xs font-semibold text-slate-200 tracking-wide ml-1">
            Raw Goal & Objective Terminal
          </span>
        </div>

        <div className="flex items-center gap-2">
          {rawGoal && (
            <button
              onClick={onClearInput}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 px-2 py-0.5 rounded hover:bg-[#1A1A2E] transition-colors"
              title="Clear input"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}

          <div className="text-[11px] text-slate-400 font-mono tabular-nums">
            {wordCount} words · {charCount} chars
          </div>
        </div>
      </div>

      {/* Role Preset Selector Bar */}
      <div className="p-3 bg-[#222234] border-b border-[#383852] space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-300">Target Role Framing</span>
          <span className="text-[11px] text-slate-400">Select persona or auto-detect</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ROLE_PRESETS.map((preset) => {
            const isSelected = selectedRolePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectRolePreset(preset)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-[#33C375] text-slate-950 font-semibold shadow-xs'
                    : 'bg-[#1A1A2E] text-slate-300 hover:text-white hover:bg-[#2F2F45] border border-[#383852]'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 inline-block mr-1 -mt-0.5" />}
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Text Area Terminal */}
      <div className="p-4 flex-1 flex flex-col min-h-[220px]">
        <label htmlFor="raw-goal-input" className="sr-only">
          Input raw goal or task
        </label>
        <textarea
          id="raw-goal-input"
          value={rawGoal}
          onChange={(e) => onRawGoalChange(e.target.value)}
          placeholder="Enter raw goal, task instructions, or rough bullet points here...
e.g. 'Build an optimized SQL query for calculating monthly recurring revenue with churn analysis, and include indexes and explain plan notes.'"
          className="w-full flex-1 min-h-[160px] bg-[#1A1A2E] border border-[#383852] rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#33C375] focus:ring-1 focus:ring-[#33C375] resize-y font-mono leading-relaxed transition-colors"
        />

        {/* Quick Sample Suggestions if empty */}
        {!rawGoal && (
          <div className="mt-3 pt-3 border-t border-[#383852]/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-[#33C375]" />
              <span>Or click a sample goal to test formatting:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {SAMPLE_GOALS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onLoadSample(sample)}
                  className="text-left p-2 rounded bg-[#1A1A2E]/70 hover:bg-[#1A1A2E] border border-[#383852] text-xs text-slate-300 hover:text-white line-clamp-2 transition-colors"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Terminal Action Footer */}
      <div className="p-3.5 bg-[#242436] border-t border-[#383852] flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-400 text-center sm:text-left">
          Converts raw intent into standard <span className="font-mono text-slate-300"># **Role:**</span>,{' '}
          <span className="font-mono text-slate-300"># **Objective:**</span>, and{' '}
          <span className="font-mono text-slate-300"># **Notes:**</span> structure.
        </p>

        <button
          type="button"
          onClick={onStructurePrompt}
          disabled={!rawGoal.trim()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-xs text-slate-950 bg-[#33C375] hover:bg-[#2bb268] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Structure Prompt</span>
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
