import type { SandboxFrame } from '../../types/sandbox';

class BSTNode {
  val: number; left: BSTNode | null; right: BSTNode | null; id: string;
  constructor(val: number, id: string) { this.val = val; this.left = null; this.right = null; this.id = id; }
}

const getDepth = (node: BSTNode | null): number => {
  if (!node) return 0;
  return 1 + Math.max(getDepth(node.left), getDepth(node.right));
};

const layoutTree = (node: BSTNode | null, depth = 0, x = 0, horizontalGap = 160): { nodes: any[], edges: any[] } => {
  if (!node) return { nodes: [] as any[], edges: [] as any[] };
  
  const y = (depth * 100) - 150; 
  const nodes: any[] = [{ id: node.id, val: node.val, x, y }];
  const edges: any[] = [];

  if (node.left) {
    edges.push({ source: node.id, target: node.left.id });
    const leftLayout = layoutTree(node.left, depth + 1, x - horizontalGap, horizontalGap / 2);
    nodes.push(...leftLayout.nodes); edges.push(...leftLayout.edges);
  }
  if (node.right) {
    edges.push({ source: node.id, target: node.right.id });
    const rightLayout = layoutTree(node.right, depth + 1, x + horizontalGap, horizontalGap / 2);
    nodes.push(...rightLayout.nodes); edges.push(...rightLayout.edges);
  }
  return { nodes, edges };
};

const buildSilentTree = (arr: number[]): BSTNode | null => {
  let root: BSTNode | null = null;
  arr.forEach((val, i) => {
    const insert = (node: BSTNode | null, v: number, id: string): BSTNode => {
      if (!node) return new BSTNode(v, id);
      if (v < node.val) node.left = insert(node.left, v, id);
      else node.right = insert(node.right, v, id);
      return node;
    };
    root = insert(root, val, `n${i}`);
  });
  return root;
};

const pushFrame = (frames: SandboxFrame[], root: BSTNode | null, visitedArr: number[], desc: string, activeId: string | null = null) => {
  const depth = getDepth(root);
  const initialGap = Math.max(100, Math.pow(2, Math.max(0, depth - 2)) * 50);
  const { nodes, edges } = layoutTree(root, 0, 0, initialGap);
  
  if (activeId) {
    const activeNode = nodes.find(n => n.id === activeId);
    if (activeNode) {
      activeNode.highlight = true;
      activeNode.pointer = 'curr';
    }
  }

  // We use both 'node' type AND the 'array' property to show the visited list at the bottom!
  frames.push({
    type: 'node',
    nodes,
    edges,
    array: [...visitedArr], 
    description: desc
  });
};

export const generatePreOrder = (arr: number[]): SandboxFrame[] => {
  const root = buildSilentTree(arr);
  const frames: SandboxFrame[] = [];
  const visited: number[] = [];

  pushFrame(frames, root, visited, "Starting Pre-order Traversal (Root, Left, Right)...");

  const traverse = (node: BSTNode | null) => {
    if (!node) return;
    
    pushFrame(frames, root, visited, `Arrived at ${node.val}. (Root step). Adding to visited list.`, node.id);
    visited.push(node.val);
    pushFrame(frames, root, visited, `${node.val} visited. Now traversing left child...`, node.id);
    
    traverse(node.left);
    
    pushFrame(frames, root, visited, `Returned to ${node.val}. Now traversing right child...`, node.id);
    traverse(node.right);
  };

  traverse(root);
  pushFrame(frames, root, visited, "Pre-order Traversal Complete!");
  return frames;
};

export const generateInOrder = (arr: number[]): SandboxFrame[] => {
  const root = buildSilentTree(arr);
  const frames: SandboxFrame[] = [];
  const visited: number[] = [];

  pushFrame(frames, root, visited, "Starting In-order Traversal (Left, Root, Right)...");

  const traverse = (node: BSTNode | null) => {
    if (!node) return;
    
    pushFrame(frames, root, visited, `Arrived at ${node.val}. Traversing left child first...`, node.id);
    traverse(node.left);
    
    pushFrame(frames, root, visited, `Returned from left. Visiting ${node.val} (Root step). Adding to list.`, node.id);
    visited.push(node.val);
    
    pushFrame(frames, root, visited, `${node.val} visited. Now traversing right child...`, node.id);
    traverse(node.right);
  };

  traverse(root);
  pushFrame(frames, root, visited, "In-order Traversal Complete! Notice the array is perfectly sorted.");
  return frames;
};

export const generatePostOrder = (arr: number[]): SandboxFrame[] => {
  const root = buildSilentTree(arr);
  const frames: SandboxFrame[] = [];
  const visited: number[] = [];

  pushFrame(frames, root, visited, "Starting Post-order Traversal (Left, Right, Root)...");

  const traverse = (node: BSTNode | null) => {
    if (!node) return;
    
    pushFrame(frames, root, visited, `Arrived at ${node.val}. Traversing left child...`, node.id);
    traverse(node.left);
    
    pushFrame(frames, root, visited, `Returned to ${node.val}. Traversing right child...`, node.id);
    traverse(node.right);
    
    pushFrame(frames, root, visited, `Children of ${node.val} complete. Visiting ${node.val} (Root step). Adding to list.`, node.id);
    visited.push(node.val);
  };

  traverse(root);
  pushFrame(frames, root, visited, "Post-order Traversal Complete!");
  return frames;
};

export const generateBFS = (arr: number[]): SandboxFrame[] => {
  const root = buildSilentTree(arr);
  const frames: SandboxFrame[] = [];
  const visited: number[] = [];

  if (!root) return frames;

  pushFrame(frames, root, visited, "Starting Breadth-First Search (Level-Order)...");
  
  const queue: BSTNode[] = [root];
  
  while (queue.length > 0) {
    const curr = queue.shift()!;
    pushFrame(frames, root, visited, `Dequeued ${curr.val}. Adding to visited list.`, curr.id);
    visited.push(curr.val);
    
    if (curr.left) {
      queue.push(curr.left);
      pushFrame(frames, root, visited, `Enqueued left child ${curr.left.val}.`, curr.id);
    }
    if (curr.right) {
      queue.push(curr.right);
      pushFrame(frames, root, visited, `Enqueued right child ${curr.right.val}.`, curr.id);
    }
  }

  pushFrame(frames, root, visited, "BFS Complete! Traversed strictly level-by-level.");
  return frames;
};

export const generateDFS = (arr: number[]): SandboxFrame[] => {
  const root = buildSilentTree(arr);
  const frames: SandboxFrame[] = [];
  const visited: number[] = [];

  pushFrame(frames, root, visited, "Starting Depth-First Search...");

  const traverse = (node: BSTNode | null) => {
    if (!node) return;
    
    pushFrame(frames, root, visited, `Diving deep into ${node.val}. Adding to visited list.`, node.id);
    visited.push(node.val);
    
    if (node.left) pushFrame(frames, root, visited, `Going down left branch from ${node.val}...`, node.id);
    traverse(node.left);
    
    if (node.right) pushFrame(frames, root, visited, `Going down right branch from ${node.val}...`, node.id);
    traverse(node.right);
  };

  traverse(root);
  pushFrame(frames, root, visited, "DFS Complete! (Notice it mirrors Pre-order traversal).");
  return frames;
};