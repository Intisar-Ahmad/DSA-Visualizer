export type PhaseType =
  | 'init'
  | 'push_context'
  | 'pop_context'
  | 'push_stack'
  | 'pop_stack'
  | 'highlight_line'
  | 'log_output'
  | 'complete';

export interface ExecutionFrame {
  id: string;
  name: string;
  type: 'global' | 'function';
  variables: Record<string, string>;
  line: number;
}

export interface CallStackEntry {
  id: string;
  name: string;
  line: number;
}

// NEW: We will use this to track objects/arrays in memory
export interface HeapObject {
  address: string; // e.g., "0x7F4A"
  type: 'array' | 'object';
  data: string;
}

export interface ExecutionStep {
  id: string;
  stepIndex: number;
  description: string;
  phase: PhaseType;
  activeLine: number;
  callStack: CallStackEntry[];
  executionContext: ExecutionFrame[];
  heap: Record<string, HeapObject>; // Added the Heap!
  consoleOutput: string[];
  changes: StepChange[];
}

export interface StepChange {
  type:
    | 'stack_push'
    | 'stack_pop'
    | 'context_push'
    | 'context_pop'
    | 'console_log'
    | 'heap_allocate';
  target?: string;
  value?: string;
}