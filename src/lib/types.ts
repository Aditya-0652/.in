export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  notes?: string;
  priority: Priority;
  dueDate?: string; // ISO date string
  completed: boolean;
  createdAt: number;
  completedAt?: number;
}

export type PromptCategory =
  | "content"
  | "coding"
  | "marketing"
  | "business"
  | "study"
  | "image"
  | "social";

export interface SavedPrompt {
  id: string;
  category: PromptCategory;
  topic: string;
  goal: string;
  audience: string;
  style: string;
  text: string;
  createdAt: number;
}
