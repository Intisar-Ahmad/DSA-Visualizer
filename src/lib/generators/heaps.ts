import type { SandboxFrame } from '../../types/sandbox';

// --- VISUALIZATION ENGINE ---
const renderHeap = (arr: number[], highlightIds: number[] = [], pointerMap: Record<number, string> = {}) => {
  const nodes: any[] = [];
  const edges: any[] = [];
  
  if (arr.length === 0) return { nodes, edges };

  // Calculate layout dynamically
  const maxDepth = Math.floor(Math.log2(arr.length));
  const initialGap = Math.max(100, Math.pow(2, Math.max(0, maxDepth - 1)) * 50);

  // Traverse virtual array-based tree
  const traverse = (idx: number, depth: number, x: number, gap: number) => {
    if (idx >= arr.length) return;
    
    nodes.push({
      id: `n${idx}`,
      val: arr[idx],
      x,
      y: (depth * 100) - 150,
      highlight: highlightIds.includes(idx),
      pointer: pointerMap[idx]
    });

    const leftIdx = 2 * idx + 1;
    const rightIdx = 2 * idx + 2;

    if (leftIdx < arr.length) {
      edges.push({ source: `n${idx}`, target: `n${leftIdx}` });
      traverse(leftIdx, depth + 1, x - gap, gap / 2);
    }
    if (rightIdx < arr.length) {
      edges.push({ source: `n${idx}`, target: `n${rightIdx}` });
      traverse(rightIdx, depth + 1, x + gap, gap / 2);
    }
  };

  traverse(0, 0, 0, initialGap);
  return { nodes, edges };
};

const pushFrame = (frames: SandboxFrame[], arr: number[], desc: string, highlightIds: number[] = [], pointerMap: Record<number, string> = {}) => {
  const { nodes, edges } = renderHeap(arr, highlightIds, pointerMap);
  frames.push({
    type: 'node',
    nodes: JSON.parse(JSON.stringify(nodes)),
    edges: JSON.parse(JSON.stringify(edges)),
    description: desc
  });
};

const swap = (arr: number[], i: number, j: number) => {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
};

// --- CORE HEAP LOGIC ---
const bubbleUp = (arr: number[], idx: number, isMax: boolean, frames: SandboxFrame[]) => {
  let curr = idx;
  while (curr > 0) {
    const parent = Math.floor((curr - 1) / 2);
    pushFrame(frames, arr, `Comparing child ${arr[curr]} with parent ${arr[parent]}...`, [curr, parent], { [curr]: 'curr', [parent]: 'parent' });
    
    const condition = isMax ? arr[curr] > arr[parent] : arr[curr] < arr[parent];
    
    if (condition) {
      pushFrame(frames, arr, `Condition met. Swapping ${arr[curr]} and ${arr[parent]}!`, [curr, parent]);
      swap(arr, curr, parent);
      pushFrame(frames, arr, `Swapped.`, [curr, parent], { [parent]: 'curr' });
      curr = parent;
    } else {
      pushFrame(frames, arr, `Heap property satisfied. Stopping bubble up.`, [curr]);
      break;
    }
  }
};

const bubbleDown = (arr: number[], idx: number, isMax: boolean, frames: SandboxFrame[]) => {
  let curr = idx;
  const n = arr.length;
  
  while (true) {
    const left = 2 * curr + 1;
    const right = 2 * curr + 2;
    let extreme = curr;

    if (left < n) {
      const leftCond = isMax ? arr[left] > arr[extreme] : arr[left] < arr[extreme];
      if (leftCond) extreme = left;
    }
    if (right < n) {
      const rightCond = isMax ? arr[right] > arr[extreme] : arr[right] < arr[extreme];
      if (rightCond) extreme = right;
    }

    if (extreme !== curr) {
      pushFrame(frames, arr, `Swapping ${arr[curr]} with extreme child ${arr[extreme]}...`, [curr, extreme]);
      swap(arr, curr, extreme);
      pushFrame(frames, arr, `Swapped.`, [curr, extreme], { [extreme]: 'curr' });
      curr = extreme;
    } else {
      pushFrame(frames, arr, `Heap property satisfied. Stopping bubble down.`, [curr]);
      break;
    }
  }
};

// --- GENERATORS ---
export const generateHeapCreation = (arr: number[], isMax: boolean): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ type: 'node', nodes: [] as any[], edges: [] as any[], description: `Initializing empty ${isMax ? 'Max' : 'Min'} Heap...` }];
  const currentHeap: number[] = [];

  for (let i = 0; i < arr.length; i++) {
    const val = arr[i];
    currentHeap.push(val);
    pushFrame(frames, currentHeap, `Inserted ${val} at the bottom of the tree.`, [currentHeap.length - 1]);
    bubbleUp(currentHeap, currentHeap.length - 1, isMax, frames);
  }

  pushFrame(frames, currentHeap, `Heap Creation Complete.`);
  return frames;
};

export const generateHeapSearch = (arr: number[], target: number, isMax: boolean): SandboxFrame[] => {
  // Silently build heap
  const heap: number[] = [];
  arr.forEach(val => { heap.push(val); bubbleUp(heap, heap.length - 1, isMax, []); });

  const frames: SandboxFrame[] = [];
  pushFrame(frames, heap, `Starting linear search for ${target} in the heap...`);

  for (let i = 0; i < heap.length; i++) {
    pushFrame(frames, heap, `Checking node ${heap[i]}...`, [i], { [i]: 'curr' });
    if (heap[i] === target) {
      pushFrame(frames, heap, `Target ${target} found!`, [i]);
      return frames;
    }
  }
  
  pushFrame(frames, heap, `Target ${target} not found.`);
  return frames;
};

export const generateHeapInsertion = (arr: number[], insertVal: number, isMax: boolean): SandboxFrame[] => {
  const heap: number[] = [];
  arr.forEach(val => { heap.push(val); bubbleUp(heap, heap.length - 1, isMax, []); });

  const frames: SandboxFrame[] = [];
  pushFrame(frames, heap, `Initial Heap built.`);
  
  heap.push(insertVal);
  pushFrame(frames, heap, `Inserted ${insertVal} at the next available leaf spot.`, [heap.length - 1]);
  bubbleUp(heap, heap.length - 1, isMax, frames);
  
  pushFrame(frames, heap, `Insertion of ${insertVal} complete.`);
  return frames;
};

export const generateHeapDeletion = (arr: number[], target: number, isMax: boolean): SandboxFrame[] => {
  const heap: number[] = [];
  arr.forEach(val => { heap.push(val); bubbleUp(heap, heap.length - 1, isMax, []); });

  const frames: SandboxFrame[] = [];
  pushFrame(frames, heap, `Preparing to delete ${target} from Heap...`);

  const targetIdx = heap.indexOf(target);
  if (targetIdx === -1) {
    pushFrame(frames, heap, `Target ${target} not found.`);
    return frames;
  }

  pushFrame(frames, heap, `Found target ${target}.`, [targetIdx], { [targetIdx]: 'target' });

  const lastIdx = heap.length - 1;
  if (targetIdx !== lastIdx) {
    pushFrame(frames, heap, `Swapping target with the last leaf node (${heap[lastIdx]}).`, [targetIdx, lastIdx]);
    swap(heap, targetIdx, lastIdx);
    pushFrame(frames, heap, `Swapped.`, [targetIdx, lastIdx], { [lastIdx]: 'target' });
  }

  heap.pop();
  pushFrame(frames, heap, `Removed target node from the bottom of the tree.`);

  if (targetIdx < heap.length) {
    pushFrame(frames, heap, `Checking if ${heap[targetIdx]} needs to bubble up or down...`, [targetIdx], { [targetIdx]: 'curr' });
    
    const parentIdx = Math.floor((targetIdx - 1) / 2);
    const cond = parentIdx >= 0 && (isMax ? heap[targetIdx] > heap[parentIdx] : heap[targetIdx] < heap[parentIdx]);
    
    if (cond) {
      bubbleUp(heap, targetIdx, isMax, frames);
    } else {
      bubbleDown(heap, targetIdx, isMax, frames);
    }
  }

  pushFrame(frames, heap, `Deletion complete.`);
  return frames;
};