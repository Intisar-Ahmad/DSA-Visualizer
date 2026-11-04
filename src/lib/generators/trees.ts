import type { SandboxFrame } from '../../types/sandbox';

export class BSTNode {
  val: number; 
  left: BSTNode | null; 
  right: BSTNode | null; 
  id: string;
  constructor(val: number, id: string) { 
    this.val = val; 
    this.left = null; 
    this.right = null; 
    this.id = id; 
  }
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

const renderTree = (root: BSTNode | null): { nodes: any[], edges: any[] } => {
  const depth = getDepth(root);
  const initialGap = Math.max(100, Math.pow(2, Math.max(0, depth - 2)) * 50);
  return layoutTree(root, 0, 0, initialGap);
};

const insertNode = (node: BSTNode | null, v: number, id: string): BSTNode => {
  if (!node) return new BSTNode(v, id);
  if (v < node.val) node.left = insertNode(node.left, v, id);
  else node.right = insertNode(node.right, v, id);
  return node;
};

export const generateBSTCreation = (arr: number[]): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ type: 'node', nodes: [] as any[], edges: [] as any[], description: "Initializing empty BST..." }];
  let root: BSTNode | null = null;

  for (let i = 0; i < arr.length; i++) {
    const val = arr[i];
    const newNodeId = `n${i}`;
    
    if (!root) {
      root = new BSTNode(val, newNodeId);
      const { nodes, edges } = renderTree(root);
      if (nodes[0]) nodes[0].highlight = true;
      frames.push({ type: 'node', nodes, edges, description: `Inserted ${val} as the Root node.` });
      continue;
    }

    let curr: BSTNode = root;
    while (true) {
      const { nodes: stepNodes, edges: stepEdges } = renderTree(root);
      const targetNode = stepNodes.find((n: any) => n.id === curr.id);
      if (targetNode) {
        targetNode.highlight = true;
        targetNode.pointer = 'curr';
      }
      frames.push({ type: 'node', nodes: stepNodes, edges: stepEdges, description: `Comparing ${val} with ${curr.val}...` });

      if (val < curr.val) {
        if (!curr.left) {
          curr.left = new BSTNode(val, newNodeId);
          const { nodes: finalNodes, edges: finalEdges } = renderTree(root);
          const n = finalNodes.find((n: any) => n.id === newNodeId);
          if (n) n.highlight = true;
          const e = finalEdges.find((e: any) => e.source === curr.id && e.target === newNodeId);
          if (e) e.highlight = true;
          frames.push({ type: 'node', nodes: finalNodes, edges: finalEdges, description: `${val} is smaller. Inserted left.` });
          break;
        }
        curr = curr.left;
      } else {
        if (!curr.right) {
          curr.right = new BSTNode(val, newNodeId);
          const { nodes: finalNodes, edges: finalEdges } = renderTree(root);
          const n = finalNodes.find((n: any) => n.id === newNodeId);
          if (n) n.highlight = true;
          const e = finalEdges.find((e: any) => e.source === curr.id && e.target === newNodeId);
          if (e) e.highlight = true;
          frames.push({ type: 'node', nodes: finalNodes, edges: finalEdges, description: `${val} is larger. Inserted right.` });
          break;
        }
        curr = curr.right;
      }
    }
  }

  const { nodes, edges } = renderTree(root);
  frames.push({ type: 'node', nodes, edges, description: "BST Creation complete." });
  return frames;
};

export const generateBSTSearch = (arr: number[], target: number): SandboxFrame[] => {
  let root: BSTNode | null = null;
  for (let i = 0; i < arr.length; i++) {
    root = insertNode(root, arr[i], `n${i}`);
  }

  const frames: SandboxFrame[] = [];
  const { nodes: baseNodes, edges: baseEdges } = renderTree(root);
  frames.push({ type: 'node', nodes: baseNodes, edges: baseEdges, description: `Starting search for ${target}...` });

  let curr: BSTNode | null = root;
  while (curr !== null) {
    const stepNodes = JSON.parse(JSON.stringify(baseNodes));
    const targetNode = stepNodes.find((n: any) => n.id === (curr as BSTNode).id);
    if (targetNode) {
      targetNode.highlight = true;
      targetNode.pointer = 'curr';
    }
    frames.push({ type: 'node', nodes: stepNodes, edges: baseEdges, description: `Checking node ${curr.val}...` });

    if (curr.val === target) {
      frames.push({ type: 'node', nodes: stepNodes, edges: baseEdges, description: `Target ${target} found!` });
      return frames;
    }
    
    if (target < curr.val) {
      frames.push({ type: 'node', nodes: stepNodes, edges: baseEdges, description: `${target} is smaller than ${curr.val}. Going left.` });
      curr = curr.left;
    } else {
      frames.push({ type: 'node', nodes: stepNodes, edges: baseEdges, description: `${target} is larger than ${curr.val}. Going right.` });
      curr = curr.right;
    }
  }
  
  frames.push({ type: 'node', nodes: baseNodes, edges: baseEdges, description: `Target ${target} not found in the tree.` });
  return frames;
};

export const generateBSTInsertion = (arr: number[], insertVal: number): SandboxFrame[] => {
  let root: BSTNode | null = null;
  for (let i = 0; i < arr.length; i++) {
    root = insertNode(root, arr[i], `n${i}`);
  }

  const frames: SandboxFrame[] = [];
  const newNodeId = `n${arr.length}`;

  if (!root) {
    root = new BSTNode(insertVal, newNodeId);
    const { nodes, edges } = renderTree(root);
    const n = nodes.find((n: any) => n.id === newNodeId);
    if (n) n.highlight = true;
    frames.push({ type: 'node', nodes, edges, description: `Inserted ${insertVal} as the Root node.` });
    return frames;
  }

  let curr: BSTNode = root;
  while (true) {
    const { nodes: stepNodes, edges: stepEdges } = renderTree(root);
    const targetNode = stepNodes.find((n: any) => n.id === curr.id);
    if (targetNode) {
      targetNode.highlight = true;
      targetNode.pointer = 'curr';
    }
    frames.push({ type: 'node', nodes: stepNodes, edges: stepEdges, description: `Comparing ${insertVal} with ${curr.val}...` });

    if (insertVal < curr.val) {
      if (!curr.left) {
        curr.left = new BSTNode(insertVal, newNodeId);
        const { nodes: finalNodes, edges: finalEdges } = renderTree(root);
        const n = finalNodes.find((n: any) => n.id === newNodeId);
        if (n) n.highlight = true;
        const e = finalEdges.find((e: any) => e.source === curr.id && e.target === newNodeId);
        if (e) e.highlight = true;
        frames.push({ type: 'node', nodes: finalNodes, edges: finalEdges, description: `${insertVal} is smaller. Inserted left.` });
        break;
      }
      curr = curr.left;
    } else {
      if (!curr.right) {
        curr.right = new BSTNode(insertVal, newNodeId);
        const { nodes: finalNodes, edges: finalEdges } = renderTree(root);
        const n = finalNodes.find((n: any) => n.id === newNodeId);
        if (n) n.highlight = true;
        const e = finalEdges.find((e: any) => e.source === curr.id && e.target === newNodeId);
        if (e) e.highlight = true;
        frames.push({ type: 'node', nodes: finalNodes, edges: finalEdges, description: `${insertVal} is larger. Inserted right.` });
        break;
      }
      curr = curr.right;
    }
  }

  return frames;
};

export const generateBSTDeletion = (arr: number[], target: number): SandboxFrame[] => {
  let root: BSTNode | null = null;
  for (let i = 0; i < arr.length; i++) {
    root = insertNode(root, arr[i], `n${i}`);
  }

  const frames: SandboxFrame[] = [];
  
  const pushFrame = (desc: string, highlightIds: string[] = [], pointerMap: Record<string, string> = {}) => {
    const { nodes, edges } = renderTree(root);
    highlightIds.forEach(id => { const n = nodes.find((x: any) => x.id === id); if (n) n.highlight = true; });
    Object.entries(pointerMap).forEach(([id, ptr]) => { const n = nodes.find((x: any) => x.id === id); if (n) n.pointer = ptr; });
    frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)), description: desc });
  };

  pushFrame(`Preparing to delete ${target} from BST...`);

  let curr: BSTNode | null = root;
  let parent: BSTNode | null = null;
  let isLeftChild = false;

  while (curr !== null && curr.val !== target) {
    pushFrame(`Searching for ${target}... currently at ${curr.val}`, [curr.id], { [curr.id]: 'curr' });
    parent = curr;
    if (target < curr.val) { 
      isLeftChild = true; 
      curr = curr.left; 
    } else { 
      isLeftChild = false; 
      curr = curr.right; 
    }
  }

  if (curr === null) {
    pushFrame(`Target ${target} not found in tree.`);
    return frames;
  }

  const targetNode: BSTNode = curr;
  pushFrame(`Found target ${target}! Checking children to determine deletion case...`, [targetNode.id], { [targetNode.id]: 'target' });

  if (targetNode.left === null && targetNode.right === null) {
    pushFrame(`Case 1: Node is a leaf. Removing directly.`, [targetNode.id]);
    if (parent === null) {
      root = null;
    } else if (isLeftChild) {
      parent.left = null;
    } else {
      parent.right = null;
    }
  } else if (targetNode.left === null || targetNode.right === null) {
    const child: BSTNode = targetNode.left !== null ? targetNode.left : (targetNode.right as BSTNode);
    pushFrame(`Case 2: Node has one child. Bypassing target to connect parent directly to child.`, [targetNode.id, child.id]);
    if (parent === null) {
      root = child;
    } else if (isLeftChild) {
      parent.left = child;
    } else {
      parent.right = child;
    }
  } else {
    pushFrame(`Case 3: Node has two children. Finding In-Order Successor...`, [targetNode.id]);
    
    let successorParent: BSTNode = targetNode;
    let successor: BSTNode = targetNode.right as BSTNode;
    pushFrame(`Going right once...`, [successor.id], { [successor.id]: 'successor' });

    while (successor.left !== null) {
      successorParent = successor;
      successor = successor.left;
      pushFrame(`Going left...`, [successor.id], { [successor.id]: 'successor' });
    }

    pushFrame(`Found successor ${successor.val}. Swapping values...`, [targetNode.id, successor.id], { [targetNode.id]: 'target', [successor.id]: 'successor' });
    targetNode.val = successor.val;
    
    pushFrame(`Values swapped. Now removing the original successor node.`, [targetNode.id, successor.id]);
    if (successorParent === targetNode) {
      successorParent.right = successor.right;
    } else {
      successorParent.left = successor.right;
    }
  }

  pushFrame(`Deletion of ${target} complete.`);
  return frames;
};