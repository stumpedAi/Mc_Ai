export interface PlanStep {
  id: string;
  title: string;
  description: string;
}

export interface ExecutionStep extends PlanStep {
  status: 'pending' | 'running' | 'complete' | 'failed';
  result?: unknown;
  error?: string;
}

export interface GoalOutcome {
  goal: string;
  plan: PlanStep[];
  summary: string;
  executed: boolean;
  execution?: ExecutionStep[];
}

export interface McAiStatus {
  active: boolean;
  systemPrompt: string;
  soul: string;
  memorySize: number;
  proxies: Array<{ name: string; endpoint: string }>;
  tools: Array<{ name: string; description: string; category: string }>;
  connectors: Array<{ name: string; type: string; endpoint: string; description?: string }>;
  plugins: Array<{ name: string; description: string }>;
}

export interface MemoryEntry {
  id: string;
  topic: string;
  data: unknown;
  timestamp: string;
}
