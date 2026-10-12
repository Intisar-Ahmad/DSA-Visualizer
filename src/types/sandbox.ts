export interface SandboxFrame {
  type: 'array' | 'node' | 'stack' | 'queue' | 'hashmap' | 'blocks';
  description: string;
  
  array?: (number | string)[];
  highlights?: number[]; 
  pointers?: Record<string, number>; 
  
  nodes?: { id: string; val: string | number; x: number; y: number; highlight?: boolean; pointer?: string; color?: 'RED' | 'BLACK' }[];
  edges?: { source: string; target: string; highlight?: boolean; label?: string; bidirectional?: boolean; curveOffset?: number; undirected?: boolean }[];
  hashmap?: { key: string; val: string; highlight?: boolean; pointer?: string }[];
  
  // ADDED: For physical 2D array animations (Merge/Quick Sort)
  blocks?: { id: string; val: number | string; x: number; y: number; highlight?: boolean; pointer?: string; sorted?: boolean }[];
}