import React, { useState, useMemo, useRef } from 'react';
import { PromptTemplate } from '../types/prompt';
import {
  Search,
  Copy,
  Check,
  Trash2,
  CopyPlus,
  Download,
  Upload,
  RotateCcw,
  BookOpen,
  X,
  FileText,
  Clock,
} from 'lucide-react';

interface SidebarProps {
  templates: PromptTemplate[];
  activeTemplateId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: PromptTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onDuplicateTemplate: (template: PromptTemplate) => void;
  onExport: () => void;
  onImport: (jsonString: string) => void;
  onResetDefaults: () => void;
  onCopyPrompt: (text: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  templates,
  activeTemplateId,
  isOpen,
  onClose,
  onSelectTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
  onExport,
  onImport,
  onResetDefaults,
  onCopyPrompt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    const query = searchQuery.toLowerCase();
    return templates.filter((tpl) => {
      const matchTitle = tpl.title.toLowerCase().includes(query);
      const matchRole = tpl.role.toLowerCase().includes(query);
      const matchGoal = tpl.rawGoal.toLowerCase().includes(query);
      const matchTags = tpl.tags?.some((t) => t.toLowerCase().includes(query));
      return matchTitle || matchRole || matchGoal || matchTags;
    });
  }, [templates, searchQuery]);

  const handleCopyCard = (e: React.MouseEvent, tpl: PromptTemplate) => {
    e.stopPropagation();
    onCopyPrompt(tpl.formattedPrompt);
    setCopiedId(tpl.id);
    setTimeout(() => {
      setCopiedId((curr) => (curr === tpl.id ? null : curr));
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImport(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-80 bg-[#1A1A2E] border-r border-[#383852] flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#383852] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#33C375]" />
            <h2 className="text-sm font-bold text-slate-100 tracking-tight">Saved Templates</h2>
            <span className="text-xs text-slate-400 font-mono tabular-nums ml-1 px-1.5 py-0.5 rounded bg-[#2A2A3E] border border-[#383852]">
              {templates.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-200 rounded-md transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-[#383852]/60">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates or tags..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#2A2A3E] border border-[#383852] rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#33C375] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredTemplates.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-400">No templates found</p>
              <p className="text-[11px] text-slate-500 mt-1">
                {searchQuery ? 'Try matching another search term' : 'Generate and save a prompt to start building your library.'}
              </p>
            </div>
          ) : (
            filteredTemplates.map((tpl) => {
              const isActive = activeTemplateId === tpl.id;
              const isDeleting = deleteConfirmId === tpl.id;
              const isCopied = copiedId === tpl.id;

              return (
                <div
                  key={tpl.id}
                  onClick={() => {
                    onSelectTemplate(tpl);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`group relative p-3 rounded-lg border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#2A2A3E] border-[#33C375] shadow-sm'
                      : 'bg-[#2A2A3E]/60 hover:bg-[#2A2A3E] border-[#383852] hover:border-[#4E4E6E]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4
                        className={`text-xs font-semibold truncate ${
                          isActive ? 'text-[#33C375]' : 'text-slate-100 group-hover:text-white'
                        }`}
                      >
                        {tpl.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{tpl.rawGoal || tpl.objective}</p>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleCopyCard(e, tpl)}
                        title="Copy prompt"
                        className="p-1 rounded text-slate-400 hover:text-[#33C375] hover:bg-[#1A1A2E] transition-colors"
                        aria-label="Copy prompt"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-[#33C375]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateTemplate(tpl);
                        }}
                        title="Duplicate template"
                        className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1A1A2E] transition-colors"
                        aria-label="Duplicate template"
                      >
                        <CopyPlus className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isDeleting) {
                            onDeleteTemplate(tpl.id);
                            setDeleteConfirmId(null);
                          } else {
                            setDeleteConfirmId(tpl.id);
                            setTimeout(() => {
                              setDeleteConfirmId((curr) => (curr === tpl.id ? null : curr));
                            }, 3500);
                          }
                        }}
                        title={isDeleting ? 'Click again to confirm delete' : 'Delete template'}
                        className={`p-1 rounded transition-colors ${
                          isDeleting
                            ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                            : 'text-slate-400 hover:text-rose-400 hover:bg-[#1A1A2E]'
                        }`}
                        aria-label={isDeleting ? 'Confirm delete' : 'Delete template'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Clean unboxed metadata footer */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-[#383852]/50">
                    <div className="flex items-center gap-1.5 truncate">
                      {tpl.tags && tpl.tags.length > 0 ? (
                        <span>{tpl.tags.slice(0, 2).join(' · ')}</span>
                      ) : (
                        <span>Custom Prompt</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 font-mono">
                      <Clock className="w-2.5 h-2.5 text-slate-500" />
                      <span>{formatDate(tpl.updatedAt || tpl.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#383852] bg-[#1A1A2E] space-y-1.5">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onExport}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2A2A3E] hover:bg-[#32324A] border border-[#383852] text-xs font-medium text-slate-200 transition-colors"
            >
              <Download className="w-3 h-3 text-[#33C375]" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2A2A3E] hover:bg-[#32324A] border border-[#383852] text-xs font-medium text-slate-200 transition-colors"
            >
              <Upload className="w-3 h-3 text-[#33C375]" />
              <span>Import JSON</span>
            </button>
          </div>

          <button
            onClick={onResetDefaults}
            className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1 rounded text-[11px] text-slate-400 hover:text-slate-200 hover:bg-[#2A2A3E] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Load Sample Templates</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </aside>
    </>
  );
};
