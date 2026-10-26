import React, { useState } from 'react';
import {
  Copy,
  Check,
  BookmarkPlus,
  Eye,
  Code2,
  Sliders,
  Plus,
  Trash2,
  FileCheck,
} from 'lucide-react';

interface StructuredOutputProps {
  role: string;
  objective: string;
  notes: string[];
  formattedPrompt: string;
  onRoleChange: (val: string) => void;
  onObjectiveChange: (val: string) => void;
  onNotesChange: (notes: string[]) => void;
  onFormattedPromptChange: (val: string) => void;
  onCopyPrompt: (text: string) => void;
  onOpenSaveModal: () => void;
  isSaved?: boolean;
}

type ViewMode = 'preview' | 'raw' | 'fields';

export const StructuredOutput: React.FC<StructuredOutputProps> = ({
  role,
  objective,
  notes,
  formattedPrompt,
  onRoleChange,
  onObjectiveChange,
  onNotesChange,
  onFormattedPromptChange,
  onCopyPrompt,
  onOpenSaveModal,
  isSaved = false,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [copied, setCopied] = useState(false);
  const [newNoteInput, setNewNoteInput] = useState('');

  const handleCopy = () => {
    onCopyPrompt(formattedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddNote = () => {
    if (!newNoteInput.trim()) return;
    onNotesChange([...notes, newNoteInput.trim()]);
    setNewNoteInput('');
  };

  const handleRemoveNote = (index: number) => {
    const updated = notes.filter((_, i) => i !== index);
    onNotesChange(updated);
  };

  const handleUpdateNote = (index: number, val: string) => {
    const updated = [...notes];
    updated[index] = val;
    onNotesChange(updated);
  };

  const charCount = formattedPrompt.length;
  const wordCount = formattedPrompt.trim() ? formattedPrompt.trim().split(/\s+/).length : 0;
  const tokenEstimate = Math.ceil(charCount / 4);

  return (
    <div className="bg-[#2A2A3E] border border-[#383852] rounded-xl flex flex-col shadow-lg overflow-hidden">
      {/* Title & Action Bar */}
      <div className="px-4 py-3 bg-[#242436] border-b border-[#383852] flex flex-wrap items-center justify-between gap-3">
        {/* Left: View mode segmented controls */}
        <div className="flex items-center gap-1 p-0.5 bg-[#1A1A2E] rounded-lg border border-[#383852]">
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'preview'
                ? 'bg-[#2A2A3E] text-[#33C375] shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Structured Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('raw')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'raw'
                ? 'bg-[#2A2A3E] text-[#33C375] shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Raw Markdown</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('fields')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'fields'
                ? 'bg-[#2A2A3E] text-[#33C375] shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Tweak Fields</span>
          </button>
        </div>

        {/* Right: Primary Output Actions (Copy & Save) */}
        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              copied
                ? 'bg-[#33C375]/20 border-[#33C375] text-[#33C375]'
                : 'bg-[#1A1A2E] hover:bg-[#32324A] text-slate-200 border-[#383852] hover:border-[#4E4E6E]'
            }`}
            title="Copy structured prompt to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#33C375]" />
                <span className="text-[#33C375]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Prompt</span>
              </>
            )}
          </button>

          {/* Save Template Button */}
          <button
            type="button"
            onClick={onOpenSaveModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#33C375] hover:bg-[#2bb268] text-slate-950 transition-colors shadow-xs"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Save As...' : 'Save Template'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 flex-1 overflow-y-auto min-h-[300px]">
        {/* Mode 1: Clean Structured Preview */}
        {viewMode === 'preview' && (
          <div className="space-y-4">
            {/* Role Card */}
            <div className="bg-[#1A1A2E] border border-[#383852] rounded-lg p-4">
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#383852]/60">
                <span className="text-xs font-bold text-[#33C375] font-mono uppercase tracking-wider">
                  # **Role:**
                </span>
                <span className="text-[11px] text-slate-400">System Persona</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">{role}</p>
            </div>

            {/* Objective Card */}
            <div className="bg-[#1A1A2E] border border-[#383852] rounded-lg p-4">
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#383852]/60">
                <span className="text-xs font-bold text-[#33C375] font-mono uppercase tracking-wider">
                  # **Objective:**
                </span>
                <span className="text-[11px] text-slate-400">Target Deliverable</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                {objective}
              </p>
            </div>

            {/* Notes Card */}
            <div className="bg-[#1A1A2E] border border-[#383852] rounded-lg p-4">
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#383852]/60">
                <span className="text-xs font-bold text-[#33C375] font-mono uppercase tracking-wider">
                  # **Notes:**
                </span>
                <span className="text-[11px] text-slate-400">{notes.length} constraints</span>
              </div>
              <ul className="space-y-2">
                {notes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-200">
                    <span className="text-[#33C375] font-bold shrink-0 mt-0.5">•</span>
                    <span className="leading-relaxed">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Mode 2: Raw Editable Markdown */}
        {viewMode === 'raw' && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-slate-300">Exact Markdown Payload</span>
              <span>Edit directly or copy</span>
            </div>
            <textarea
              value={formattedPrompt}
              onChange={(e) => onFormattedPromptChange(e.target.value)}
              rows={14}
              className="w-full h-full min-h-[300px] bg-[#1A1A2E] border border-[#383852] rounded-lg p-3 text-xs sm:text-sm text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-[#33C375] focus:ring-1 focus:ring-[#33C375] resize-y"
              placeholder="# **Role:** ... &#10;&#10;# **Objective:** ... &#10;&#10;# **Notes:** ..."
            />
          </div>
        )}

        {/* Mode 3: Interactive Field Controls */}
        {viewMode === 'fields' && (
          <div className="space-y-4">
            {/* Role input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Role Definition (# **Role:**)
              </label>
              <textarea
                value={role}
                onChange={(e) => onRoleChange(e.target.value)}
                rows={2}
                className="w-full bg-[#1A1A2E] border border-[#383852] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#33C375] focus:ring-1 focus:ring-[#33C375]"
              />
            </div>

            {/* Objective input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Objective Instructions (# **Objective:**)
              </label>
              <textarea
                value={objective}
                onChange={(e) => onObjectiveChange(e.target.value)}
                rows={3}
                className="w-full bg-[#1A1A2E] border border-[#383852] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#33C375] focus:ring-1 focus:ring-[#33C375]"
              />
            </div>

            {/* Notes list */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Notes & Constraints (# **Notes:**)
              </label>
              <div className="space-y-2 mb-3">
                {notes.map((note, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-[#33C375] font-mono text-xs">#{index + 1}</span>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => handleUpdateNote(index, e.target.value)}
                      className="flex-1 bg-[#1A1A2E] border border-[#383852] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#33C375]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNote(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-[#1A1A2E] transition-colors"
                      title="Remove note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Note Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNoteInput}
                  onChange={(e) => setNewNoteInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNote();
                    }
                  }}
                  placeholder="Add another constraint or guideline..."
                  className="flex-1 bg-[#1A1A2E] border border-[#383852] rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#33C375]"
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  disabled={!newNoteInput.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#1A1A2E] hover:bg-[#32324A] border border-[#383852] text-xs font-medium text-slate-200 disabled:opacity-40 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#33C375]" />
                  <span>Add Note</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info & Metrics Bar */}
      <div className="px-4 py-2.5 bg-[#242436] border-t border-[#383852] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#33C375]">
            <FileCheck className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-300">Standard Markdown Schema</span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono tabular-nums text-[11px] text-slate-400">
          <span>{wordCount} words</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{charCount} chars</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-300">~{tokenEstimate} tokens</span>
        </div>
      </div>
    </div>
  );
};
