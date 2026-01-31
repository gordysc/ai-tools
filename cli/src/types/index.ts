export interface StandardsManifest {
  version: string;
  owner: string;
  last_updated: string;
  phases: Record<string, PhaseConfig>;
  team_overlays?: Record<string, TeamOverlay>;
}

export interface PhaseConfig {
  description: string;
  includes: string[];
}

export interface TeamOverlay {
  extends?: string;
  adds?: string[];
  removes?: string[];
}

export interface AitState {
  project: string | null;
  phase: string | null;
  lastFile: string | null;
  created: string;
  updated: string;
}

export interface TaskParent {
  id: string;
  title: string;
  completed: boolean;
  subtasks: TaskItem[];
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  parentId?: string;
}

export interface ParsedTaskFile {
  name: string;
  parents: TaskParent[];
  relevantFiles: string[];
}

export type PhaseType =
  | 'research'
  | 'create-prd'
  | 'create-crd'
  | 'create-drd'
  | 'generate-tasks'
  | 'execute-tasks';

export interface AssembledPrompt {
  content: string;
  standardsCount: number;
  standardsVersion: string;
  appliedStandards: string[];
  suggestedFilename: string;
}
