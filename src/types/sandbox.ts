export interface SandboxFrame {
  type: 'array' | 'node';
  description: string;
  
  // Allow strings so we can pass '-' for empty memory slots during shifting
  array?: (number | string)[];
  highlights?: number[]; 
  pointers?: Record<string, number>; 
  
  nodes?: { id: string; val: string | number; x: number; y: number; highlight?: boolean; pointer?: string }[];
  edges?: { source: string; target: string; highlight?: boolean; label?: string }[];
}