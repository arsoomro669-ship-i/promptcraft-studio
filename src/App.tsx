/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { PromptTemplate, RolePreset } from './types/prompt';
import {
  ROLE_PRESETS,
  buildMarkdownPrompt,
  analyzeRawGoal,
  parseStructuredMarkdown,
} from './utils/promptBuilder';
import {
  getSavedTemplates,
  saveTemplateToStorage,
  deleteTemplateFromStorage,
  exportTemplatesJSON,
  importTemplatesFromJSON,
} from './utils/storage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { InputTerminal } from './components/InputTerminal';
import { StructuredOutput } from './components/StructuredOutput';
import { SaveModal } from './components/SaveModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState('New Custom Prompt');
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // Editor states
  const [rawGoal, setRawGoal] = useState('');
  const [selectedRolePresetId, setSelectedRolePresetId] = useState(ROLE_PRESETS[0].id);
  const [role, setRole] = useState(ROLE_PRESETS[0].role);
  const [objective, setObjective] = useState('');
  const [notes, setNotes] = useState<string[]>([...ROLE_PRESETS[0].defaultNotes]);
  const [formattedPrompt, setFormattedPrompt] = useState('');

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Show toast notification
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initialize templates from localStorage on startup
  useEffect(() => {
    const loaded = getSavedTemplates();
    setTemplates(loaded);

    if (loaded.length > 0) {
      // Load initial template into editor
      const initial = loaded[0];
      setActiveTemplateId(initial.id);
      setActiveTitle(initial.title);
      setActiveTags(initial.tags || []);
      setRawGoal(initial.rawGoal);
      setRole(initial.role);
      setObjective(initial.objective);
      setNotes(initial.notes);
      setFormattedPrompt(initial.formattedPrompt);

      // Match preset if possible
      const matched = ROLE_PRESETS.find((p) => p.role === initial.role);
      if (matched) setSelectedRolePresetId(matched.id);
    } else {
      // Default initial prompt
      const defaultGoal = 'Refactor an asynchronous data fetching service in React with TypeScript, error boundaries, and unit tests.';
      const initialFormatted = buildMarkdownPrompt(
        ROLE_PRESETS[0].role,
        defaultGoal,
        ROLE_PRESETS[0].defaultNotes
      );
      setRawGoal(defaultGoal);
      setObjective(defaultGoal);
      setFormattedPrompt(initialFormatted);
    }
  }, []);

  // Update formattedPrompt whenever role, objective, or notes change
  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    setFormattedPrompt(buildMarkdownPrompt(newRole, objective, notes));
  };

  const handleObjectiveChange = (newObjective: string) => {
    setObjective(newObjective);
    setFormattedPrompt(buildMarkdownPrompt(role, newObjective, notes));
  };

  const handleNotesChange = (newNotes: string[]) => {
    setNotes(newNotes);
    setFormattedPrompt(buildMarkdownPrompt(role, objective, newNotes));
  };

  // When user edits raw markdown directly, try to sync constituent parts
  const handleFormattedPromptChange = (newMarkdown: string) => {
    setFormattedPrompt(newMarkdown);
    const parsed = parseStructuredMarkdown(newMarkdown);
    if (parsed) {
      if (parsed.role) setRole(parsed.role);
      if (parsed.objective) setObjective(parsed.objective);
      if (parsed.notes.length > 0) setNotes(parsed.notes);
    }
  };

  // Role preset selection
  const handleSelectRolePreset = (preset: RolePreset) => {
    setSelectedRolePresetId(preset.id);
    setRole(preset.role);
    setNotes([...preset.defaultNotes]);
    setFormattedPrompt(buildMarkdownPrompt(preset.role, objective || rawGoal, preset.defaultNotes));
    addToast(`Adopted "${preset.label}" persona`, 'info');
  };

  // Core Requirement: Wrap raw goal input into structured Markdown block
  const handleStructurePrompt = () => {
    if (!rawGoal.trim()) {
      addToast('Please enter a raw goal first', 'error');
      return;
    }

    // Analyze raw goal to see if preset matches, or use current role
    const analysis = analyzeRawGoal(rawGoal);

    // Keep chosen role if customized, otherwise suggest from analysis
    const chosenRole = role || analysis.suggestedRole;
    const chosenNotes = notes.length > 0 ? notes : analysis.suggestedNotes;
    const newObjective = rawGoal.trim();

    setObjective(newObjective);
    setRole(chosenRole);
    setNotes(chosenNotes);

    const generated = buildMarkdownPrompt(chosenRole, newObjective, chosenNotes);
    setFormattedPrompt(generated);
    addToast('Prompt wrapped into structured Markdown schema', 'success');
  };

  // Clipboard copy handler with fallback
  const handleCopyPrompt = async (textToCopy: string) => {
    const text = textToCopy || formattedPrompt;
    if (!text) {
      addToast('No prompt content to copy', 'error');
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure / iframe environments
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      addToast('Copied prompt to clipboard!', 'success');
    } catch (err) {
      console.error('Clipboard copy error:', err);
      addToast('Failed to copy prompt to clipboard', 'error');
    }
  };

  // Save template into localStorage
  const handleSaveTemplate = (title: string, tags: string[]) => {
    const payload = {
      title,
      rawGoal,
      role,
      objective: objective || rawGoal,
      notes,
      formattedPrompt,
      tags,
    };

    const { updatedList, savedItem } = saveTemplateToStorage(payload, activeTemplateId || undefined);
    setTemplates(updatedList);
    setActiveTemplateId(savedItem.id);
    setActiveTitle(savedItem.title);
    setActiveTags(savedItem.tags || []);
    addToast(`Saved "${title}" to templates`, 'success');
  };

  // Load template from sidebar
  const handleSelectTemplate = (tpl: PromptTemplate) => {
    setActiveTemplateId(tpl.id);
    setActiveTitle(tpl.title);
    setActiveTags(tpl.tags || []);
    setRawGoal(tpl.rawGoal || '');
    setRole(tpl.role);
    setObjective(tpl.objective);
    setNotes(tpl.notes);
    setFormattedPrompt(tpl.formattedPrompt);

    const matched = ROLE_PRESETS.find((p) => p.role === tpl.role);
    setSelectedRolePresetId(matched ? matched.id : 'custom');

    addToast(`Loaded "${tpl.title}"`, 'info');
  };

  // Delete template
  const handleDeleteTemplate = (id: string) => {
    const updated = deleteTemplateFromStorage(id);
    setTemplates(updated);
    if (activeTemplateId === id) {
      setActiveTemplateId(null);
      setActiveTitle('New Custom Prompt');
      setActiveTags([]);
    }
    addToast('Template deleted from library', 'info');
  };

  // Duplicate template
  const handleDuplicateTemplate = (tpl: PromptTemplate) => {
    const dupTitle = `${tpl.title} (Copy)`;
    const { updatedList, savedItem } = saveTemplateToStorage(
      {
        title: dupTitle,
        rawGoal: tpl.rawGoal,
        role: tpl.role,
        objective: tpl.objective,
        notes: [...tpl.notes],
        formattedPrompt: tpl.formattedPrompt,
        tags: tpl.tags ? [...tpl.tags] : [],
      },
      undefined
    );

    setTemplates(updatedList);
    setActiveTemplateId(savedItem.id);
    setActiveTitle(savedItem.title);
    setActiveTags(savedItem.tags || []);
    addToast(`Duplicated as "${dupTitle}"`, 'success');
  };

  // Reset to initial blank prompt
  const handleNewPrompt = () => {
    setActiveTemplateId(null);
    setActiveTitle('New Custom Prompt');
    setActiveTags([]);
    setRawGoal('');
    setRole(ROLE_PRESETS[0].role);
    setObjective('');
    setNotes([...ROLE_PRESETS[0].defaultNotes]);
    setSelectedRolePresetId(ROLE_PRESETS[0].id);

    const initial = buildMarkdownPrompt(
      ROLE_PRESETS[0].role,
      '',
      ROLE_PRESETS[0].defaultNotes
    );
    setFormattedPrompt(initial);
    addToast('Initialized new empty prompt', 'info');
  };

  // Load sample goal into input
  const handleLoadSample = (sample: string) => {
    setRawGoal(sample);
    const analysis = analyzeRawGoal(sample);
    const matched = ROLE_PRESETS.find((p) => p.role === analysis.suggestedRole);
    if (matched) setSelectedRolePresetId(matched.id);
    setRole(analysis.suggestedRole);
    setObjective(sample);
    setNotes(analysis.suggestedNotes);
    setFormattedPrompt(buildMarkdownPrompt(analysis.suggestedRole, sample, analysis.suggestedNotes));
    addToast('Loaded sample and structured prompt', 'success');
  };

  // Export JSON file
  const handleExportJSON = () => {
    const json = exportTemplatesJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptcraft-templates-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Exported template backup JSON', 'success');
  };

  // Import JSON file
  const handleImportJSON = (jsonString: string) => {
    const res = importTemplatesFromJSON(jsonString);
    if (res.success && res.templates) {
      setTemplates(res.templates);
      addToast('Imported templates successfully!', 'success');
    } else {
      addToast(res.error || 'Failed to import JSON file', 'error');
    }
  };

  // Reset to default sample templates
  const handleResetDefaults = () => {
    localStorage.removeItem('promptcraft_templates_v1');
    const fresh = getSavedTemplates();
    setTemplates(fresh);
    if (fresh.length > 0) {
      handleSelectTemplate(fresh[0]);
    }
    addToast('Restored starter sample templates', 'info');
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E] text-slate-100 flex flex-col selection:bg-[#33C375]/30 selection:text-[#33C375]">
      {/* Top Header Contract */}
      <Header
        onNewPrompt={handleNewPrompt}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        savedCount={templates.length}
      />

      {/* Main Body with Sidebar + Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar for saved templates */}
        <Sidebar
          templates={templates}
          activeTemplateId={activeTemplateId}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelectTemplate={handleSelectTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          onDuplicateTemplate={handleDuplicateTemplate}
          onExport={handleExportJSON}
          onImport={handleImportJSON}
          onResetDefaults={handleResetDefaults}
          onCopyPrompt={handleCopyPrompt}
        />

        {/* Main Terminal Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Context breadcrumb & title banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#383852]/60">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <span>PromptCraft Studio</span>
                  <span aria-hidden="true" className="text-slate-600">/</span>
                  <span className="text-slate-200">
                    {activeTemplateId ? 'Saved Template' : 'Active Draft'}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                  {activeTitle}
                </h1>
              </div>

              {activeTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {activeTags.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2.5 py-1 rounded-md bg-[#2A2A3E] border border-[#383852] text-slate-300 font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Two-Column Responsive Workbench Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              {/* Left Column: Input Terminal */}
              <div className="space-y-4">
                <InputTerminal
                  rawGoal={rawGoal}
                  onRawGoalChange={setRawGoal}
                  selectedRolePresetId={selectedRolePresetId}
                  onSelectRolePreset={handleSelectRolePreset}
                  onStructurePrompt={handleStructurePrompt}
                  onClearInput={() => {
                    setRawGoal('');
                    addToast('Cleared input terminal', 'info');
                  }}
                  onLoadSample={handleLoadSample}
                />
              </div>

              {/* Right Column: Structured Output Terminal */}
              <div className="space-y-4">
                <StructuredOutput
                  role={role}
                  objective={objective}
                  notes={notes}
                  formattedPrompt={formattedPrompt}
                  onRoleChange={handleRoleChange}
                  onObjectiveChange={handleObjectiveChange}
                  onNotesChange={handleNotesChange}
                  onFormattedPromptChange={handleFormattedPromptChange}
                  onCopyPrompt={handleCopyPrompt}
                  onOpenSaveModal={() => setIsSaveModalOpen(true)}
                  isSaved={Boolean(activeTemplateId)}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Save Template Modal */}
      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveTemplate}
        defaultTitle={activeTitle === 'New Custom Prompt' ? (rawGoal ? rawGoal.slice(0, 40) + '...' : 'Custom Prompt') : activeTitle}
        defaultTags={activeTags}
        isUpdatingExisting={Boolean(activeTemplateId)}
      />

      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
