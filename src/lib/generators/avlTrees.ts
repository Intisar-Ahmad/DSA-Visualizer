import type { SandboxFrame } from '../../types/sandbox';

class AVLNode {
  val: number; left: AVLNode | null; right: AVLNode | null; height: number; id: string;
  constructor(val: number, id: string) { this.val = val; this.left = null; this.right = null; this.height = 1; this.id = id; }
}

const getHeight = (node: AVLNode | null) => node ? node.height : 0;
const getBalance = (node: AVLNode | null) => node ? getHeight(node.left) - getHeight(node.right) : 0;
const updateHeight = (node: AVLNode) => { node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right)); };

const getDepth = (node: AVLNode | null): number => {
  if (!node) return 0;
  return 1 + Math.max(getDepth(node.left), getDepth(node.right));
};

const layoutTree = (node: AVLNode | null, depth = 0, x = 0, horizontalGap = 160): { nodes: any[], edges: any[] } => {
  if (!node) return { nodes: [] as any[], edges: [] as any[] };
  
  const y = (depth * 100) - 150; 
  const nodes: any[] = [{ id: node.id, val: node.val, x, y, height: node.height }];
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

const renderTree = (root: AVLNode | null): { nodes: any[], edges: any[] } => {
  const depth = getDepth(root);
  const initialGap = Math.max(100, Math.pow(2, Math.max(0, depth - 2)) * 50);
  return layoutTree(root, 0, 0, initialGap);
};

const pushFrame = (frames: SandboxFrame[], treeState: { root: AVLNode | null }, desc: string, highlightIds: string[] = [], pointerMap: Record<string, string> = {}) => {
  const { nodes, edges } = renderTree(treeState.root);
  highlightIds.forEach(id => { const n = nodes.find((x:any) => x.id === id); if (n) n.highlight = true; });
  Object.entries(pointerMap).forEach(([id, ptr]) => { const n = nodes.find((x:any) => x.id === id); if (n) n.pointer = ptr; });
  frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)), description: desc });
};

// Rotations
const rightRotate = (y: AVLNode, frames: SandboxFrame[], treeState: { root: AVLNode | null }): AVLNode => {
  pushFrame(frames, treeState, `Node ${y.val} is Left-heavy. Performing Right Rotation...`, [y.id]);
  const x = y.left!;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  updateHeight(y);
  updateHeight(x);
  return x;
};

const leftRotate = (x: AVLNode, frames: SandboxFrame[], treeState: { root: AVLNode | null }): AVLNode => {
  pushFrame(frames, treeState, `Node ${x.val} is Right-heavy. Performing Left Rotation...`, [x.id]);
  const y = x.right!;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  updateHeight(x);
  updateHeight(y);
  return y;
};

const insertAVL = (node: AVLNode | null, val: number, id: string, frames: SandboxFrame[], treeState: { root: AVLNode | null }): AVLNode => {
  if (!node) {
    const newNode = new AVLNode(val, id);
    return newNode;
  }

  pushFrame(frames, treeState, `Comparing ${val} with ${node.val}...`, [node.id], { [node.id]: 'curr' });

  if (val < node.val) {
    node.left = insertAVL(node.left, val, id, frames, treeState);
  } else if (val > node.val) {
    node.right = insertAVL(node.right, val, id, frames, treeState);
  } else {
    return node; // No duplicates allowed
  }

  updateHeight(node);
  const balance = getBalance(node);

  if (balance > 1 || balance < -1) {
    pushFrame(frames, treeState, `Imbalance detected at Node ${node.val}! Balance Factor: ${balance}`, [node.id], { [node.id]: 'unbalanced' });
  }

  // Left Left Case
  if (balance > 1 && val < node.left!.val) {
    return rightRotate(node, frames, treeState);
  }
  // Right Right Case
  if (balance < -1 && val > node.right!.val) {
    return leftRotate(node, frames, treeState);
  }
  // Left Right Case
  if (balance > 1 && val > node.left!.val) {
    pushFrame(frames, treeState, `Left-Right heavy at Node ${node.val}. Requires double rotation.`, [node.id]);
    node.left = leftRotate(node.left!, frames, treeState);
    treeState.root = node; // Temp sync for visualization
    return rightRotate(node, frames, treeState);
  }
  // Right Left Case
  if (balance < -1 && val < node.right!.val) {
    pushFrame(frames, treeState, `Right-Left heavy at Node ${node.val}. Requires double rotation.`, [node.id]);
    node.right = rightRotate(node.right!, frames, treeState);
    treeState.root = node; // Temp sync for visualization
    return leftRotate(node, frames, treeState);
  }

  return node;
};

export const generateAVLCreation = (arr: number[]): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ type: 'node', nodes: [] as any[], edges: [] as any[], description: "Initializing empty AVL Tree..." }];
  const treeState: { root: AVLNode | null } = { root: null };

  for (let i = 0; i < arr.length; i++) {
    const val = arr[i];
    if (!treeState.root) {
      treeState.root = new AVLNode(val, `n${i}`);
      pushFrame(frames, treeState, `Inserted ${val} as the Root node.`, [`n${i}`]);
    } else {
      treeState.root = insertAVL(treeState.root, val, `n${i}`, frames, treeState);
      pushFrame(frames, treeState, `Inserted ${val}. Tree is balanced.`);
    }
  }

  return frames;
};

export const generateAVLSearch = (arr: number[], target: number): SandboxFrame[] => {
  const treeState: { root: AVLNode | null } = { root: null };
  arr.forEach((val, i) => { treeState.root = insertAVL(treeState.root, val, `n${i}`, [], treeState); });

  const frames: SandboxFrame[] = [];
  pushFrame(frames, treeState, `Starting search for ${target}...`);

  let curr: AVLNode | null = treeState.root;
  while (curr) {
    pushFrame(frames, treeState, `Checking node ${curr.val}...`, [curr.id], { [curr.id]: 'curr' });
    if (curr.val === target) {
      pushFrame(frames, treeState, `Target ${target} found!`, [curr.id]);
      return frames;
    }
    if (target < curr.val) {
      pushFrame(frames, treeState, `${target} is smaller than ${curr.val}. Going left.`, [curr.id]);
      curr = curr.left;
    } else {
      pushFrame(frames, treeState, `${target} is larger than ${curr.val}. Going right.`, [curr.id]);
      curr = curr.right;
    }
  }
  
  pushFrame(frames, treeState, `Target ${target} not found in the AVL tree.`);
  return frames;
};

export const generateAVLInsertion = (arr: number[], insertVal: number): SandboxFrame[] => {
  const treeState: { root: AVLNode | null } = { root: null };
  arr.forEach((val, i) => { treeState.root = insertAVL(treeState.root, val, `n${i}`, [], treeState); });

  const frames: SandboxFrame[] = [];
  pushFrame(frames, treeState, `Initial AVL Tree built.`);
  
  treeState.root = insertAVL(treeState.root, insertVal, `n${arr.length}`, frames, treeState);
  pushFrame(frames, treeState, `Insertion of ${insertVal} complete. Tree is fully balanced.`);
  
  return frames;
};

const minValueNode = (node: AVLNode): AVLNode => {
  let current = node;
  while (current.left != null) current = current.left;
  return current;
};

const deleteAVL = (node: AVLNode | null, val: number, frames: SandboxFrame[], treeState: { root: AVLNode | null }): AVLNode | null => {
  if (!node) return node;

  pushFrame(frames, treeState, `Searching for ${val} to delete... currently at ${node.val}`, [node.id], { [node.id]: 'curr' });

  if (val < node.val) {
    node.left = deleteAVL(node.left, val, frames, treeState);
  } else if (val > node.val) {
    node.right = deleteAVL(node.right, val, frames, treeState);
  } else {
    pushFrame(frames, treeState, `Found target ${val}! Determining deletion case...`, [node.id], { [node.id]: 'target' });
    
    if (!node.left || !node.right) {
      const temp = node.left ? node.left : node.right;
      if (!temp) {
        pushFrame(frames, treeState, `Case 1: Leaf node. Deleting directly.`, [node.id]);
        return null; // No children
      } else {
        pushFrame(frames, treeState, `Case 2: One child. Bypassing target node.`, [node.id, temp.id]);
        return temp; // One child
      }
    } else {
      pushFrame(frames, treeState, `Case 3: Two children. Finding In-Order Successor...`, [node.id]);
      const temp = minValueNode(node.right);
      pushFrame(frames, treeState, `Found successor ${temp.val}. Swapping values...`, [node.id, temp.id], { [temp.id]: 'successor' });
      node.val = temp.val;
      node.right = deleteAVL(node.right, temp.val, frames, treeState);
    }
  }

  if (!node) return node;

  updateHeight(node);
  const balance = getBalance(node);

  if (balance > 1 || balance < -1) {
    pushFrame(frames, treeState, `Imbalance detected at Node ${node.val} after deletion! Balance Factor: ${balance}`, [node.id], { [node.id]: 'unbalanced' });
  }

  // LL Case
  if (balance > 1 && getBalance(node.left) >= 0) return rightRotate(node, frames, treeState);
  // LR Case
  if (balance > 1 && getBalance(node.left) < 0) {
    node.left = leftRotate(node.left!, frames, treeState);
    return rightRotate(node, frames, treeState);
  }
  // RR Case
  if (balance < -1 && getBalance(node.right) <= 0) return leftRotate(node, frames, treeState);
  // RL Case
  if (balance < -1 && getBalance(node.right) > 0) {
    node.right = rightRotate(node.right!, frames, treeState);
    return leftRotate(node, frames, treeState);
  }

  return node;
};

export const generateAVLDeletion = (arr: number[], target: number): SandboxFrame[] => {
  const treeState: { root: AVLNode | null } = { root: null };
  arr.forEach((val, i) => { treeState.root = insertAVL(treeState.root, val, `n${i}`, [], treeState); });

  const frames: SandboxFrame[] = [];
  pushFrame(frames, treeState, `Preparing to delete ${target} from AVL Tree...`);
  
  treeState.root = deleteAVL(treeState.root, target, frames, treeState);
  pushFrame(frames, treeState, `Deletion complete. AVL Tree constraints validated.`);
  
  return frames;
};