import { PromptTemplate } from '../types/prompt';
import { buildMarkdownPrompt } from './promptBuilder';

const STORAGE_KEY = 'promptcraft_templates_v1';

const INITIAL_STARTER_TEMPLATES: PromptTemplate[] = [
  {
    id: 'tpl-starter-1',
    title: 'TypeScript Refactor & Unit Test Suite',
    rawGoal: 'Refactor complex asynchronous business logic into pure composable functions and generate full unit test coverage using Vitest including edge cases.',
    role: 'You are an expert Senior Full-Stack Software Engineer with deep expertise in modern TypeScript, scalable architectures, and clean code principles.',
    objective: 'Refactor complex asynchronous business logic into pure composable functions and generate full unit test coverage using Vitest including edge cases.',
    notes: [
      'Write clean, modular, and strongly-typed code adhering to production standards.',
      'Handle edge cases, invalid inputs, and error states gracefully.',
      'Include brief inline explanations only where architectural context is non-obvious.',
    ],
    formattedPrompt: buildMarkdownPrompt(
      'You are an expert Senior Full-Stack Software Engineer with deep expertise in modern TypeScript, scalable architectures, and clean code principles.',
      'Refactor complex asynchronous business logic into pure composable functions and generate full unit test coverage using Vitest including edge cases.',
      [
        'Write clean, modular, and strongly-typed code adhering to production standards.',
        'Handle edge cases, invalid inputs, and error states gracefully.',
        'Include brief inline explanations only where architectural context is non-obvious.',
      ]
    ),
    tags: ['Engineering', 'TypeScript', 'Testing'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'tpl-starter-2',
    title: 'Distributed System Architecture RFC',
    rawGoal: 'Author a high-level Request for Comments (RFC) document for migrating a monolithic payment processor into event-driven microservices.',
    role: 'You are a Principal Cloud & Distributed Systems Architect specializing in high-throughput, low-latency, and fault-tolerant cloud infrastructures.',
    objective: 'Author a high-level Request for Comments (RFC) document for migrating a monolithic payment processor into event-driven microservices.',
    notes: [
      'Detail trade-offs between consistency, availability, and partition tolerance.',
      'Specify security best practices, caching layers, and database partitioning.',
      'Present component interactions with clear interface definitions.',
    ],
    formattedPrompt: buildMarkdownPrompt(
      'You are a Principal Cloud & Distributed Systems Architect specializing in high-throughput, low-latency, and fault-tolerant cloud infrastructures.',
      'Author a high-level Request for Comments (RFC) document for migrating a monolithic payment processor into event-driven microservices.',
      [
        'Detail trade-offs between consistency, availability, and partition tolerance.',
        'Specify security best practices, caching layers, and database partitioning.',
        'Present component interactions with clear interface definitions.',
      ]
    ),
    tags: ['Architecture', 'System Design', 'Cloud'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'tpl-starter-3',
    title: 'Executive Product Requirements Document (PRD)',
    rawGoal: 'Draft a comprehensive PRD for an in-app real-time notification engine with user preference controls and quiet hour scheduling.',
    role: 'You are a Principal Product Manager experienced in user research synthesis, PRD authoring, and feature prioritization frameworks.',
    objective: 'Draft a comprehensive PRD for an in-app real-time notification engine with user preference controls and quiet hour scheduling.',
    notes: [
      'Define quantifiable success metrics (KPIs) and target audience personas.',
      'Map user journey flows and call out edge constraints or non-goals.',
      'Organize requirements into MVP phase versus subsequent fast-follow iterations.',
    ],
    formattedPrompt: buildMarkdownPrompt(
      'You are a Principal Product Manager experienced in user research synthesis, PRD authoring, and feature prioritization frameworks.',
      'Draft a comprehensive PRD for an in-app real-time notification engine with user preference controls and quiet hour scheduling.',
      [
        'Define quantifiable success metrics (KPIs) and target audience personas.',
        'Map user journey flows and call out edge constraints or non-goals.',
        'Organize requirements into MVP phase versus subsequent fast-follow iterations.',
      ]
    ),
    tags: ['Product', 'PRD', 'Strategy'],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

export function getSavedTemplates(): PromptTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed initial templates so user has immediate samples
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STARTER_TEMPLATES));
      return INITIAL_STARTER_TEMPLATES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_STARTER_TEMPLATES;
  } catch (err) {
    console.error('Failed to parse templates from localStorage:', err);
    return INITIAL_STARTER_TEMPLATES;
  }
}

export function saveTemplateToStorage(
  templateData: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): { updatedList: PromptTemplate[]; savedItem: PromptTemplate } {
  const currentList = getSavedTemplates();
  const now = new Date().toISOString();

  let savedItem: PromptTemplate;

  if (existingId) {
    const existingIndex = currentList.findIndex((t) => t.id === existingId);
    if (existingIndex >= 0) {
      savedItem = {
        ...currentList[existingIndex],
        ...templateData,
        updatedAt: now,
      };
      currentList[existingIndex] = savedItem;
    } else {
      savedItem = {
        id: `tpl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...templateData,
        createdAt: now,
        updatedAt: now,
      };
      currentList.unshift(savedItem);
    }
  } else {
    savedItem = {
      id: `tpl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...templateData,
      createdAt: now,
      updatedAt: now,
    };
    currentList.unshift(savedItem);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentList));
  return { updatedList: currentList, savedItem };
}

export function deleteTemplateFromStorage(id: string): PromptTemplate[] {
  const currentList = getSavedTemplates();
  const filtered = currentList.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
}

export function exportTemplatesJSON(): string {
  const templates = getSavedTemplates();
  return JSON.stringify(templates, null, 2);
}

export function importTemplatesFromJSON(jsonString: string): {
  success: boolean;
  templates?: PromptTemplate[];
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { success: false, error: 'Imported file must contain a JSON array of templates.' };
    }

    // Validate and clean
    const current = getSavedTemplates();
    const importedTemplates: PromptTemplate[] = [];

    for (const item of parsed) {
      if (item && typeof item === 'object' && item.title && item.formattedPrompt) {
        importedTemplates.push({
          id: item.id || `tpl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title: item.title,
          rawGoal: item.rawGoal || '',
          role: item.role || '',
          objective: item.objective || '',
          notes: Array.isArray(item.notes) ? item.notes : [],
          formattedPrompt: item.formattedPrompt,
          tags: Array.isArray(item.tags) ? item.tags : [],
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        });
      }
    }

    if (importedTemplates.length === 0) {
      return { success: false, error: 'No valid prompt templates found in file.' };
    }

    // Merge without duplicates by ID
    const merged = [...importedTemplates];
    for (const cur of current) {
      if (!merged.some((m) => m.id === cur.id)) {
        merged.push(cur);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return { success: true, templates: merged };
  } catch (err) {
    return { success: false, error: 'Invalid JSON format: ' + (err instanceof Error ? err.message : String(err)) };
  }
}
