import type { SandboxFrame } from '../../types/sandbox';

type Color = 'RED' | 'BLACK';

class RBNode {
  val: number; 
  left: RBNode | null; 
  right: RBNode | null; 
  parent: RBNode | null;
  color: Color; 
  id: string;
  constructor(val: number, id: string, color: Color = 'RED') { 
    this.val = val; this.left = null; this.right = null; this.parent = null; this.color = color; this.id = id; 
  }
}

const getDepth = (node: RBNode | null): number => {
  if (!node) return 0;
  return 1 + Math.max(getDepth(node.left), getDepth(node.right));
};

const layoutTree = (node: RBNode | null, depth = 0, x = 0, horizontalGap = 160): { nodes: any[], edges: any[] } => {
  if (!node) return { nodes: [] as any[], edges: [] as any[] };
  
  const y = (depth * 100) - 150; 
  const nodes: any[] = [{ id: node.id, val: node.val, x, y, color: node.color }];
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

const renderTree = (root: RBNode | null): { nodes: any[], edges: any[] } => {
  const depth = getDepth(root);
  const initialGap = Math.max(100, Math.pow(2, Math.max(0, depth - 2)) * 50);
  return layoutTree(root, 0, 0, initialGap);
};

const pushFrame = (frames: SandboxFrame[], treeState: { root: RBNode | null }, desc: string, highlightIds: string[] = [], pointerMap: Record<string, string> = {}) => {
  const { nodes, edges } = renderTree(treeState.root);
  highlightIds.forEach(id => { const n = nodes.find((x:any) => x.id === id); if (n) n.highlight = true; });
  Object.entries(pointerMap).forEach(([id, ptr]) => { const n = nodes.find((x:any) => x.id === id); if (n) n.pointer = ptr; });
  frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)), description: desc });
};

// --- ROTATIONS ---
const leftRotate = (treeState: { root: RBNode | null }, x: RBNode, frames: SandboxFrame[]) => {
  pushFrame(frames, treeState, `Left rotating around ${x.val}...`, [x.id]);
  const y = x.right!;
  x.right = y.left;
  if (y.left) y.left.parent = x;
  y.parent = x.parent;
  if (!x.parent) treeState.root = y;
  else if (x === x.parent.left) x.parent.left = y;
  else x.parent.right = y;
  y.left = x;
  x.parent = y;
};

const rightRotate = (treeState: { root: RBNode | null }, x: RBNode, frames: SandboxFrame[]) => {
  pushFrame(frames, treeState, `Right rotating around ${x.val}...`, [x.id]);
  const y = x.left!;
  x.left = y.right;
  if (y.right) y.right.parent = x;
  y.parent = x.parent;
  if (!x.parent) treeState.root = y;
  else if (x === x.parent.right) x.parent.right = y;
  else x.parent.left = y;
  y.right = x;
  x.parent = y;
};

// --- INSERTION LOGIC ---
const insertFixup = (treeState: { root: RBNode | null }, z: RBNode, frames: SandboxFrame[]) => {
  while (z.parent && z.parent.color === 'RED') {
    pushFrame(frames, treeState, `Red-Red Violation at ${z.val} and parent ${z.parent.val}! Fixing...`, [z.id, z.parent.id]);
    if (z.parent === z.parent.parent!.left) {
      const y = z.parent.parent!.right; // Uncle
      if (y && y.color === 'RED') {
        pushFrame(frames, treeState, `Uncle ${y.val} is RED. Recoloring parent, uncle, and grandparent...`);
        z.parent.color = 'BLACK';
        y.color = 'BLACK';
        z.parent.parent!.color = 'RED';
        z = z.parent.parent!;
      } else {
        if (z === z.parent.right) {
          z = z.parent;
          leftRotate(treeState, z, frames);
        }
        pushFrame(frames, treeState, `Uncle is BLACK. Recoloring and rotating...`);
        z.parent!.color = 'BLACK';
        z.parent!.parent!.color = 'RED';
        rightRotate(treeState, z.parent!.parent!, frames);
      }
    } else {
      const y = z.parent.parent!.left; // Uncle
      if (y && y.color === 'RED') {
        pushFrame(frames, treeState, `Uncle ${y.val} is RED. Recoloring parent, uncle, and grandparent...`);
        z.parent.color = 'BLACK';
        y.color = 'BLACK';
        z.parent.parent!.color = 'RED';
        z = z.parent.parent!;
      } else {
        if (z === z.parent.left) {
          z = z.parent;
          rightRotate(treeState, z, frames);
        }
        pushFrame(frames, treeState, `Uncle is BLACK. Recoloring and rotating...`);
        z.parent!.color = 'BLACK';
        z.parent!.parent!.color = 'RED';
        leftRotate(treeState, z.parent!.parent!, frames);
      }
    }
  }
  if (treeState.root!.color === 'RED') {
    treeState.root!.color = 'BLACK';
    pushFrame(frames, treeState, `Root must be BLACK. Recolored root.`, [treeState.root!.id]);
  }
};

const insertRB = (treeState: { root: RBNode | null }, val: number, id: string, frames: SandboxFrame[]) => {
  const z = new RBNode(val, id);
  let y: RBNode | null = null;
  let x = treeState.root;

  while (x !== null) {
    y = x;
    if (frames.length > 0) pushFrame(frames, treeState, `Comparing ${val} with ${x.val}...`, [x.id], { [x.id]: 'curr' });
    if (z.val < x.val) x = x.left;
    else x = x.right;
  }

  z.parent = y;
  if (!y) treeState.root = z;
  else if (z.val < y.val) y.left = z;
  else y.right = z;

  if (frames.length > 0) pushFrame(frames, treeState, `${val} inserted as RED.`, [z.id]);

  if (!z.parent) {
    z.color = 'BLACK';
    if (frames.length > 0) pushFrame(frames, treeState, `Root inserted. Colored BLACK.`, [z.id]);
    return;
  }
  if (!z.parent.parent) return;

  if (frames.length > 0) insertFixup(treeState, z, frames);
  else insertFixup(treeState, z, []);
};

// --- DELETION LOGIC ---
const rbTransplant = (treeState: { root: RBNode | null }, u: RBNode, v: RBNode | null) => {
  if (!u.parent) treeState.root = v;
  else if (u === u.parent.left) u.parent.left = v;
  else u.parent.right = v;
  if (v) v.parent = u.parent;
};

const treeMinimum = (node: RBNode): RBNode => {
  while (node.left) node = node.left;
  return node;
};

const deleteFixup = (treeState: { root: RBNode | null }, x: RBNode | null, xParent: RBNode | null, frames: SandboxFrame[]) => {
  pushFrame(frames, treeState, `Deleted node was BLACK. Double-Black violation occurred. Commencing Fixup...`);
  
  while (x !== treeState.root && (x === null || x.color === 'BLACK')) {
    if (x === xParent?.left) {
      let w = xParent.right; // Sibling
      if (w && w.color === 'RED') {
        pushFrame(frames, treeState, `Case 1: Sibling is RED. Recoloring sibling and parent, then rotating.`);
        w.color = 'BLACK';
        xParent.color = 'RED';
        leftRotate(treeState, xParent, frames);
        w = xParent.right;
      }
      if ((!w?.left || w.left.color === 'BLACK') && (!w?.right || w.right.color === 'BLACK')) {
        pushFrame(frames, treeState, `Case 2: Sibling's children are both BLACK. Pushing double-blackness up to parent.`);
        if (w) w.color = 'RED';
        x = xParent;
        xParent = x?.parent || null;
      } else {
        if (!w?.right || w.right.color === 'BLACK') {
          pushFrame(frames, treeState, `Case 3: Sibling's left child is RED, right is BLACK. Recoloring and rotating right.`);
          if (w?.left) w.left.color = 'BLACK';
          if (w) w.color = 'RED';
          rightRotate(treeState, w!, frames);
          w = xParent.right;
        }
        pushFrame(frames, treeState, `Case 4: Sibling's right child is RED. Recoloring and rotating left to resolve.`);
        if (w) w.color = xParent.color;
        xParent.color = 'BLACK';
        if (w?.right) w.right.color = 'BLACK';
        leftRotate(treeState, xParent, frames);
        x = treeState.root; // Fix is complete
      }
    } else {
      // Symmetric cases for right child
      let w = xParent?.left;
      if (w && w.color === 'RED') {
        pushFrame(frames, treeState, `Case 1: Sibling is RED. Recoloring sibling and parent, then rotating.`);
        w.color = 'BLACK';
        xParent!.color = 'RED';
        rightRotate(treeState, xParent!, frames);
        w = xParent!.left;
      }
      if ((!w?.right || w.right.color === 'BLACK') && (!w?.left || w.left.color === 'BLACK')) {
        pushFrame(frames, treeState, `Case 2: Sibling's children are both BLACK. Pushing double-blackness up to parent.`);
        if (w) w.color = 'RED';
        x = xParent;
        xParent = x?.parent || null;
      } else {
        if (!w?.left || w.left.color === 'BLACK') {
          pushFrame(frames, treeState, `Case 3: Sibling's right child is RED, left is BLACK. Recoloring and rotating left.`);
          if (w?.right) w.right.color = 'BLACK';
          if (w) w.color = 'RED';
          leftRotate(treeState, w!, frames);
          w = xParent!.left;
        }
        pushFrame(frames, treeState, `Case 4: Sibling's left child is RED. Recoloring and rotating right to resolve.`);
        if (w) w.color = xParent!.color;
        xParent!.color = 'BLACK';
        if (w?.left) w.left.color = 'BLACK';
        rightRotate(treeState, xParent!, frames);
        x = treeState.root; // Fix is complete
      }
    }
  }
  if (x) {
    x.color = 'BLACK';
    pushFrame(frames, treeState, `Finalizing fixup. Target node colored BLACK.`);
  }
};

const deleteRB = (treeState: { root: RBNode | null }, target: number, frames: SandboxFrame[]) => {
  let z = treeState.root;
  while (z && z.val !== target) {
    pushFrame(frames, treeState, `Searching for ${target}...`, [z.id], { [z.id]: 'curr' });
    if (target < z.val) z = z.left;
    else z = z.right;
  }

  if (!z) {
    pushFrame(frames, treeState, `Target ${target} not found.`);
    return;
  }

  pushFrame(frames, treeState, `Found target ${target} to delete.`, [z.id], { [z.id]: 'target' });

  let y = z;
  let yOriginalColor = y.color;
  let x: RBNode | null = null;
  let xParent: RBNode | null = null;

  if (!z.left) {
    x = z.right;
    xParent = z.parent;
    pushFrame(frames, treeState, `Node has at most one child (right). Bypassing...`);
    rbTransplant(treeState, z, z.right);
  } else if (!z.right) {
    x = z.left;
    xParent = z.parent;
    pushFrame(frames, treeState, `Node has at most one child (left). Bypassing...`);
    rbTransplant(treeState, z, z.left);
  } else {
    y = treeMinimum(z.right);
    yOriginalColor = y.color;
    x = y.right;
    
    pushFrame(frames, treeState, `Node has two children. Found In-Order Successor ${y.val}.`, [y.id]);

    if (y.parent === z) {
      xParent = y; // y is sliding up to z's spot
    } else {
      xParent = y.parent;
      rbTransplant(treeState, y, y.right);
      y.right = z.right;
      y.right.parent = y;
    }
    rbTransplant(treeState, z, y);
    y.left = z.left;
    y.left.parent = y;
    y.color = z.color;
    pushFrame(frames, treeState, `Swapped target with successor. Removed original successor node.`);
  }

  if (yOriginalColor === 'BLACK') {
    deleteFixup(treeState, x, xParent, frames);
  } else {
    pushFrame(frames, treeState, `Deleted node was RED. No properties violated. Deletion complete.`);
  }
};

// --- EXPORTED GENERATORS ---
export const generateRBCreation = (arr: number[]): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ type: 'node', nodes: [] as any[], edges: [] as any[], description: "Initializing empty Red-Black Tree..." }];
  const treeState: { root: RBNode | null } = { root: null };
  arr.forEach((val, i) => insertRB(treeState, val, `n${i}`, frames));
  pushFrame(frames, treeState, "Red-Black Tree Creation complete.");
  return frames;
};

export const generateRBSearch = (arr: number[], target: number): SandboxFrame[] => {
  const treeState: { root: RBNode | null } = { root: null };
  arr.forEach((val, i) => insertRB(treeState, val, `n${i}`, [])); 

  const frames: SandboxFrame[] = [];
  pushFrame(frames, treeState, `Starting search for ${target}...`);

  let curr = treeState.root;
  while (curr) {
    pushFrame(frames, treeState, `Checking node ${curr.val}...`, [curr.id], { [curr.id]: 'curr' });
    if (curr.val === target) {
      pushFrame(frames, treeState, `Target ${target} found!`, [curr.id]);
      return frames;
    }
    if (target < curr.val) {
      pushFrame(frames, treeState, `${target} is smaller. Going left.`, [curr.id]);
      curr = curr.left;
    } else {
      pushFrame(frames, treeState, `${target} is larger. Going right.`, [curr.id]);
      curr = curr.right;
    }
  }
  pushFrame(frames, treeState, `Target ${target} not found.`);
  return frames;
};

export const generateRBInsertion = (arr: number[], insertVal: number): SandboxFrame[] => {
  const treeState: { root: RBNode | null } = { root: null };
  arr.forEach((val, i) => insertRB(treeState, val, `n${i}`, []));

  const frames: SandboxFrame[] = [];
  pushFrame(frames, treeState, `Initial Red-Black Tree built.`);
  
  insertRB(treeState, insertVal, `n${arr.length}`, frames);
  pushFrame(frames, treeState, `Insertion of ${insertVal} complete and properties restored.`);
  return frames;
};

export const generateRBDeletion = (arr: number[], target: number): SandboxFrame[] => {
  const treeState: { root: RBNode | null } = { root: null };
  arr.forEach((val, i) => insertRB(treeState, val, `n${i}`, []));

  const frames: SandboxFrame[] = [];
  pushFrame(frames, treeState, `Preparing to delete ${target} from Red-Black Tree...`);
  
  deleteRB(treeState, target, frames);
  pushFrame(frames, treeState, `Red-Black Tree constraints validated. Deletion fully complete.`);
  return frames;
};