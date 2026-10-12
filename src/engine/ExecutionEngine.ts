import { instrumentCode } from './instrumenter';
import type {
  ExecutionStep,
  CallStackEntry,
  ExecutionFrame,
  HeapObject,
  StepChange,
} from '../types/execution';

let stepIdCounter = 0;
const nextId = () => `id_${stepIdCounter++}`;

export class ExecutionEngine {
  private steps: ExecutionStep[] = [];
  private callStack: CallStackEntry[] = [];
  private executionContext: ExecutionFrame[] = [];
  private heap: Record<string, HeapObject> = {};
  private consoleOutput: string[] = [];
  private code = '';
  private codeLines: string[] = [];

  // THE MEMORY REGISTRY: Maps real JS objects to their hex address
  private trackedObjects = new Map<any, string>();

  constructor() {
    stepIdCounter = 0;
  }

  analyze(code: string): ExecutionStep[] {
    this.code = code;
    this.codeLines = code.split('\n');
    this.steps = [];
    this.callStack = [];
    this.executionContext = [];
    this.heap = {};
    this.consoleOutput = [];
    this.trackedObjects.clear();

    this.simulateExecution();
    return this.steps;
  }

  private generateHexAddress(): string {
    return '0x' + Math.floor(Math.random() * 65536).toString(16).padStart(4, '0').toUpperCase();
  }

  private registerObject(obj: any): string {
    if (this.trackedObjects.has(obj)) {
      return this.trackedObjects.get(obj)!;
    }
    const address = this.generateHexAddress();
    this.trackedObjects.set(obj, address);
    return address;
  }

  private syncHeap() {
    this.heap = {};
    for (const [obj, address] of this.trackedObjects.entries()) {
      let objType = Array.isArray(obj) ? 'Array' : 'Object';
      if (!Array.isArray(obj) && obj.constructor && obj.constructor.name !== 'Object') {
        objType = obj.constructor.name;
      }

      const safeData = JSON.stringify(obj, (key, val) => {
        if (key === '') return val; 
        if (val !== null && typeof val === 'object') {
          return this.registerObject(val); 
        }
        return val;
      });

      this.heap[address] = { address, type: objType as any, data: safeData };
    }
  }

  private snapshot(
    description: string,
    activeLine: number,
    changes: StepChange[] = []
  ): void {
    this.syncHeap();

    this.steps.push({
      id: nextId(),
      stepIndex: this.steps.length,
      description,
      phase: changes[0]?.type?.startsWith('stack') ? (changes[0].type as any) : 'highlight_line',
      activeLine,
      callStack: this.callStack.map((e) => ({ ...e })),
      executionContext: this.executionContext.map((f) => ({
        ...f,
        variables: { ...f.variables },
      })),
      heap: JSON.parse(JSON.stringify(this.heap)), 
      consoleOutput: [...this.consoleOutput],
      changes,
    });
  }

  private formatValue(val: any): string {
    if (val === null) return 'null';
    if (typeof val === 'undefined') return 'undefined';
    if (typeof val === 'object') return Array.isArray(val) ? '[Array]' : `{${val.constructor?.name || 'Object'}}`;
    if (typeof val === 'string') return `"${val}"`;
    return String(val);
  }

  private simulateExecution() {
    this.executionContext.push({
      id: nextId(),
      name: 'Global Scope',
      type: 'global',
      variables: {},
      line: 0
    });
    
    this.snapshot('Program starts. Global scope initialized.', 0, []);

    try {
      const instrumentedCode = instrumentCode(this.code);

      const sandboxEnv = {
        __step: (lineNum: number) => {
          if (lineNum > 0) {
            const codeText = this.codeLines[lineNum - 1]?.trim() || '';
            this.snapshot(`[Line ${lineNum}] Executing: ${codeText}`, lineNum, []);
          }
        },
        
        __pushFrame: (name: string, lineNum: number, paramPairs: [string, any][] = []) => {
          // Format parameters to display `factorial(n=5)`
          const formattedArgs = paramPairs.map(([pName, pVal]) => {
            return `${pName}=${this.formatValue(pVal)}`;
          }).join(', ');

          const frameName = `${name}(${formattedArgs})`;
          this.callStack.push({ id: nextId(), name: frameName, line:lineNum });
          this.executionContext.push({ id: nextId(), name: frameName, type: 'function', variables: {}, line: lineNum });
          
          this.snapshot(`${frameName} added to Call Stack.`, lineNum, [{ type: 'stack_push' }]);
        },

        __popFrame: (name: string, lineNum: number) => {
          const popped = this.callStack.pop();
          this.executionContext.pop();
          // We only take a snapshot here if the stack isn't already empty (prevents double logging on returns)
          if (popped) {
            this.snapshot(`${popped.name} popped off Call Stack.`, lineNum, [{ type: 'stack_pop' }]);
          }
        },

        __setVar: (name: string, value: any, lineNum: number) => {
          const frame = this.executionContext[this.executionContext.length - 1];
          if (!frame) return value;

          if (value !== null && typeof value === 'object') {
            const address = this.registerObject(value);
            frame.variables[name] = address;
            this.snapshot(`[Line ${lineNum}] Allocated ${name} in heap at ${address}`, lineNum, [{ type: 'heap_allocate' }]);
          } else {
            frame.variables[name] = String(value);
            this.snapshot(`[Line ${lineNum}] Assigned ${name} = ${value}`, lineNum, []);
          }
          return value;
        },

        __trackAssign: (value: any, lineNum: number) => {
          const codeText = this.codeLines[lineNum - 1]?.trim() || '';
          this.snapshot(`[Line ${lineNum}] Property mutated: ${codeText}`, lineNum, []);
          return value;
        },

        __trackReturn: (value: any, lineNum: number) => {
          this.snapshot(`[Line ${lineNum}] Returning value: ${this.formatValue(value)}`, lineNum, []);
          return value;
        },

        console: {
          log: (...args: any[]) => {
            const output = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
            this.consoleOutput.push(`> ${output}`);
            const currentLine = this.steps[this.steps.length - 1]?.activeLine || 0;
            this.snapshot(`[Line ${currentLine}] Console log: ${output}`, currentLine, [{ type: 'console_log', value: output }]);
          }
        }
      };

      const executor = new Function('sandbox', `
        with (sandbox) {
          ${instrumentedCode}
        }
      `);

      executor(sandboxEnv);

    } catch (error: any) {
      this.consoleOutput.push(`> Error: ${error.message}`);
      this.snapshot('Execution terminated due to an error.', -1, []);
    }
  }
}