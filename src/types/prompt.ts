export interface PromptTemplate {
  id: string;
  title: string;
  rawGoal: string;
  role: string;
  objective: string;
  notes: string[];
  formattedPrompt: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type RolePreset = {
  id: string;
  label: string;
  role: string;
  defaultNotes: string[];
};
