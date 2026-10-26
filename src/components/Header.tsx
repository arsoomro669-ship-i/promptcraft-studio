import React from 'react';
import { Terminal, Plus, Menu } from 'lucide-react';

interface HeaderProps {
  onNewPrompt: () => void;
  onToggleSidebar: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onNewPrompt,
  onToggleSidebar,
  savedCount,
}) => {
  return (
    <header className="h-14 border-b border-[#383852] bg-[#1A1A2E]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 -ml-1 text-slate-400 hover:text-slate-100 hover:bg-[#2A2A3E] rounded-lg lg:hidden transition-colors"
          aria-label="Toggle saved templates"
        >
          <Menu className="w-5 h-5" />
        </button>

        <a href="/" className="flex items-center gap-2.5 text-base font-bold text-slate-100 whitespace-nowrap shrink-0 hover:text-white transition-colors">
          <div className="w-7 h-7 rounded-lg bg-[#2A2A3E] border border-[#383852] flex items-center justify-center text-[#33C375]">
            <Terminal className="w-4 h-4" />
          </div>
          <span>PromptCraft Studio</span>
        </a>
      </div>

      {/* Zone 2: Navigation Links (Clean single-line text links) */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
        <span className="text-slate-200">Terminal Workbench</span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <button
          onClick={onToggleSidebar}
          className="hover:text-slate-200 transition-colors flex items-center gap-1.5"
        >
          <span>Library</span>
          <span className="font-mono text-[10px] text-slate-400 tabular-nums">({savedCount})</span>
        </button>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span className="text-slate-400">Markdown Schema v1</span>
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onNewPrompt}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2A2A3E] hover:bg-[#32324A] text-slate-200 hover:text-white border border-[#383852] rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-[#33C375]" />
          <span>New Prompt</span>
        </button>
      </div>
    </header>
  );
};
