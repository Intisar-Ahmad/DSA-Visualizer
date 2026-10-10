export interface SandboxFrame {
  type: 'array' | 'node';
  description: string;
  
  array?: (number | string)[];
  highlights?: number[]; 
  pointers?: Record<string, number>; 
  
  nodes?: { id: string; val: string | number; x: number; y: number; highlight?: boolean; pointer?: string }[];
  
  // Make sure curveOffset?: number is at the very end of this line!
  edges?: { source: string; target: string; highlight?: boolean; label?: string; bidirectional?: boolean; curveOffset?: number }[];
}