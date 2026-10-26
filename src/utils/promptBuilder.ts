import { RolePreset } from '../types/prompt';

export const ROLE_PRESETS: RolePreset[] = [
  {
    id: 'software-engineer',
    label: 'Senior Software Engineer',
    role: 'You are an expert Senior Full-Stack Software Engineer with deep expertise in modern TypeScript, scalable architectures, and clean code principles.',
    defaultNotes: [
      'Write clean, modular, and strongly-typed code adhering to production standards.',
      'Handle edge cases, invalid inputs, and error states gracefully.',
      'Include brief inline explanations only where architectural context is non-obvious.',
    ],
  },
  {
    id: 'system-architect',
    label: 'System Architect',
    role: 'You are a Principal Cloud & Distributed Systems Architect specializing in high-throughput, low-latency, and fault-tolerant cloud infrastructures.',
    defaultNotes: [
      'Detail trade-offs between consistency, availability, and partition tolerance.',
      'Specify security best practices, caching layers, and database partitioning.',
      'Present component interactions with clear interface definitions.',
    ],
  },
  {
    id: 'tech-writer',
    label: 'Technical Writer',
    role: 'You are a Senior Technical Communicator specializing in creating crisp, exhaustive API documentation, developer guides, and architectural blueprints.',
    defaultNotes: [
      'Use active voice, precise terminology, and minimal fluff.',
      'Structure instructions into logical sequential steps with prerequisites.',
      'Provide realistic code samples and output schemas.',
    ],
  },
  {
    id: 'product-manager',
    label: 'Product Manager',
    role: 'You are a Principal Product Manager experienced in user research synthesis, PRD authoring, and feature prioritization frameworks.',
    defaultNotes: [
      'Define quantifiable success metrics (KPIs) and target audience personas.',
      'Map user journey flows and call out edge constraints or non-goals.',
      'Organize requirements into MVP phase versus subsequent fast-follow iterations.',
    ],
  },
  {
    id: 'data-scientist',
    label: 'Data Scientist',
    role: 'You are a Senior Machine Learning Engineer and Data Scientist specializing in statistical modeling, feature engineering, and production ML pipelines.',
    defaultNotes: [
      'Explain assumptions regarding data distributions and sampling bias.',
      'Recommend appropriate validation schemes and evaluation metrics.',
      'Highlight computational complexity and inference latency implications.',
    ],
  },
  {
    id: 'general-assistant',
    label: 'General AI Expert',
    role: 'You are a highly capable, rigorous, and versatile AI specialist committed to delivering actionable, well-reasoned, and error-free solutions.',
    defaultNotes: [
      'Prioritize direct, actionable answers with zero unnecessary preambles.',
      'Structure complex reasoning with clear headings and bulleted items.',
      'Highlight critical caveats or alternative perspectives when relevant.',
    ],
  },
];

/**
 * Wraps raw inputs into the strict markdown block requested:
 * # **Role:**
 * ...
 * # **Objective:**
 * ...
 * # **Notes:**
 * ...
 */
export function buildMarkdownPrompt(role: string, objective: string, notes: string[]): string {
  const cleanRole = role.trim() || 'You are an expert AI assistant dedicated to high precision and clarity.';
  const cleanObjective = objective.trim() || 'Fulfill the user task completely and rigorously.';

  const cleanNotes = notes
    .map((n) => n.trim())
    .filter(Boolean)
    .map((n) => (n.startsWith('-') ? n : `- ${n}`))
    .join('\n');

  const notesSection = cleanNotes.length > 0 ? cleanNotes : '- Ensure output is accurate, clear, and directly usable.';

  return `# **Role:**\n${cleanRole}\n\n# **Objective:**\n${cleanObjective}\n\n# **Notes:**\n${notesSection}`;
}

/**
 * Intelligently analyzes raw user input to suggest a preset or build initial structured blocks
 */
export function analyzeRawGoal(rawGoal: string): {
  suggestedRole: string;
  suggestedObjective: string;
  suggestedNotes: string[];
} {
  const lower = rawGoal.toLowerCase();

  let matchedPreset = ROLE_PRESETS[ROLE_PRESETS.length - 1]; // general default

  if (
    lower.includes('code') ||
    lower.includes('react') ||
    lower.includes('typescript') ||
    lower.includes('bug') ||
    lower.includes('refactor') ||
    lower.includes('component') ||
    lower.includes('test') ||
    lower.includes('api') ||
    lower.includes('function')
  ) {
    matchedPreset = ROLE_PRESETS[0]; // software engineer
  } else if (
    lower.includes('architecture') ||
    lower.includes('scalable') ||
    lower.includes('microservice') ||
    lower.includes('database') ||
    lower.includes('cloud') ||
    lower.includes('infra')
  ) {
    matchedPreset = ROLE_PRESETS[1]; // system architect
  } else if (
    lower.includes('document') ||
    lower.includes('write guide') ||
    lower.includes('readme') ||
    lower.includes('tutorial') ||
    lower.includes('manual')
  ) {
    matchedPreset = ROLE_PRESETS[2]; // tech writer
  } else if (
    lower.includes('prd') ||
    lower.includes('product') ||
    lower.includes('feature') ||
    lower.includes('roadmap') ||
    lower.includes('metric')
  ) {
    matchedPreset = ROLE_PRESETS[3]; // product manager
  } else if (
    lower.includes('model') ||
    lower.includes('dataset') ||
    lower.includes('data') ||
    lower.includes('machine learning') ||
    lower.includes('prediction') ||
    lower.includes('analysis')
  ) {
    matchedPreset = ROLE_PRESETS[4]; // data scientist
  }

  // Objective is derived directly from raw input
  const cleanObjective = rawGoal.trim();

  return {
    suggestedRole: matchedPreset.role,
    suggestedObjective: cleanObjective,
    suggestedNotes: [...matchedPreset.defaultNotes],
  };
}

/**
 * Parses a structured markdown prompt back into its constituent parts
 */
export function parseStructuredMarkdown(markdown: string): {
  role: string;
  objective: string;
  notes: string[];
} | null {
  const roleRegex = /#\s*\*\*Role:\*\*\s*\n([\s\S]*?)(?=\n#\s*\*\*Objective:\*\*|$)/i;
  const objectiveRegex = /#\s*\*\*Objective:\*\*\s*\n([\s\S]*?)(?=\n#\s*\*\*Notes:\*\*|$)/i;
  const notesRegex = /#\s*\*\*Notes:\*\*\s*\n([\s\S]*?)$/i;

  const roleMatch = markdown.match(roleRegex);
  const objectiveMatch = markdown.match(objectiveRegex);
  const notesMatch = markdown.match(notesRegex);

  if (!roleMatch && !objectiveMatch && !notesMatch) {
    return null;
  }

  const role = roleMatch ? roleMatch[1].trim() : '';
  const objective = objectiveMatch ? objectiveMatch[1].trim() : '';

  const rawNotes = notesMatch ? notesMatch[1].trim() : '';
  const notes = rawNotes
    .split('\n')
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);

  return {
    role,
    objective,
    notes: notes.length > 0 ? notes : ['Provide concise, actionable results.'],
  };
}
