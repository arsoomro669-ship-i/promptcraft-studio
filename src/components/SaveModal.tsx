import React, { useState, useEffect } from 'react';
import { X, BookmarkPlus, Tag } from 'lucide-react';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, tags: string[]) => void;
  defaultTitle: string;
  defaultTags?: string[];
  isUpdatingExisting?: boolean;
}

export const SaveModal: React.FC<SaveModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultTitle,
  defaultTags = [],
  isUpdatingExisting = false,
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(defaultTags);

  useEffect(() => {
    if (isOpen) {
      setTitle(defaultTitle || 'My Custom Prompt');
      setTags(defaultTags || []);
      setTagInput('');
    }
  }, [isOpen, defaultTitle, defaultTags]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim(), tags);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-[#2A2A3E] border border-[#383852] rounded-xl p-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-modal-title"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#383852]">
          <div className="flex items-center gap-2">
            <BookmarkPlus className="w-5 h-5 text-[#33C375]" />
            <h3 id="save-modal-title" className="text-base font-semibold text-slate-100">
              {isUpdatingExisting ? 'Update Template' : 'Save to Templates'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="template-title" className="block text-xs font-medium text-slate-300 mb-1.5">
              Template Title <span className="text-rose-400">*</span>
            </label>
            <input
              id="template-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Vitest Unit Test Generator"
              className="w-full px-3 py-2 bg-[#1A1A2E] border border-[#383852] rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#33C375] focus:ring-1 focus:ring-[#33C375] text-sm"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="template-tag-input" className="block text-xs font-medium text-slate-300 mb-1.5">
              Tags (optional)
            </label>
            <div className="flex gap-2">
              <input
                id="template-tag-input"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag and press Enter"
                className="flex-1 px-3 py-1.5 bg-[#1A1A2E] border border-[#383852] rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#33C375] text-xs"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-[#1A1A2E] hover:bg-[#383852] border border-[#383852] rounded-lg text-xs font-medium text-slate-200 transition-colors"
              >
                Add
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#1A1A2E] border border-[#383852] text-xs text-slate-300"
                  >
                    <Tag className="w-2.5 h-2.5 text-[#33C375]" />
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-rose-400 transition-colors ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 pt-1">
            Persisted securely to your browser's localStorage as a structured JSON object.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#383852]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-[#383852]/50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-[#33C375] hover:bg-[#2bb268] disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-sm transition-colors"
            >
              {isUpdatingExisting ? 'Update Template' : 'Commit & Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
