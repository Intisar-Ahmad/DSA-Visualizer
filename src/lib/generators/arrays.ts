import type { SandboxFrame } from '../../types/sandbox';

// --- SORTING ALGORITHMS (Standard In-Place) ---

export const generateBubbleSort = (arr: number[]): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ type: 'array', array: [...arr], highlights: [], pointers: {}, description: "Initial Array for Bubble Sort." }];
  const a = [...arr];
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      frames.push({ type: 'array', array: [...a], highlights: [j, j + 1], pointers: { j, 'j+1': j+1 }, description: `Comparing ${a[j]} and ${a[j+1]}.` });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        frames.push({ type: 'array', array: [...a], highlights: [j, j + 1], pointers: { j, 'j+1': j+1 }, description: `Swapped! ${a[j]} is now before ${a[j+1]}.` });
      }
    }
  }
  frames.push({ type: 'array', array: [...a], highlights: [], pointers: {}, description: "Array is fully sorted!" });
  return frames;
};

export const generateSelectionSort = (arr: number[]): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ type: 'array', array: [...arr], highlights: [], pointers: {}, description: "Initial Array for Selection Sort." }];
  const a = [...arr];
  for (let i = 0; i < a.length; i++) {
    let minIdx = i;
    frames.push({ type: 'array', array: [...a], highlights: [i], pointers: { i, min: minIdx }, description: `Assuming minimum is at index ${i} (${a[i]}).` });
    for (let j = i + 1; j < a.length; j++) {
      frames.push({ type: 'array', array: [...a], highlights: [j, minIdx], pointers: { i, j, min: minIdx }, description: `Comparing ${a[j]} with current min ${a[minIdx]}.` });
      if (a[j] < a[minIdx]) {
        minIdx = j;
        frames.push({ type: 'array', array: [...a], highlights: [minIdx], pointers: { i, j, min: minIdx }, description: `New minimum found at index ${minIdx} (${a[minIdx]}).` });
      }
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      frames.push({ type: 'array', array: [...a], highlights: [i, minIdx], pointers: { i }, description: `Swapped absolute minimum ${a[i]} to its sorted position at index ${i}.` });
    }
  }
  frames.push({ type: 'array', array: [...a], highlights: [], pointers: {}, description: "Array is fully sorted!" });
  return frames;
};

export const generateInsertionSort = (arr: number[]): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ type: 'array', array: [...arr], highlights: [], pointers: {}, description: "Initial Array for Insertion Sort." }];
  const a = [...arr];
  
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    frames.push({ type: 'array', array: [...a], highlights: [i], pointers: { key: i }, description: `Selected key ${key} to be inserted into sorted portion.` });
    
    while (j >= 0 && a[j] > key) {
      frames.push({ type: 'array', array: [...a], highlights: [j], pointers: { j, key: j+1 }, description: `${a[j]} > ${key}. Shifting ${a[j]} right.` });
      a[j + 1] = a[j];
      j = j - 1;
      frames.push({ type: 'array', array: [...a], highlights: [j+1], pointers: {}, description: `Shift complete.` });
    }
    a[j + 1] = key;
    frames.push({ type: 'array', array: [...a], highlights: [j+1], pointers: { inserted: j+1 }, description: `Inserted key ${key} at index ${j+1}.` });
  }
  frames.push({ type: 'array', array: [...a], highlights: [], pointers: {}, description: "Array is fully sorted!" });
  return frames;
};

// --- SORTING ALGORITHMS (2D Tree-Splitting Visualization) ---

export const generateMergeSort = (arr: number[]): SandboxFrame[] => {
  const frames: SandboxFrame[] = [];
  const BLOCK_W = 56;
  const Y_STEP = 90;
  
  let blocks = arr.map((val, i) => ({
    id: `b${i}`, val, x: (i - arr.length / 2 + 0.5) * BLOCK_W, y: 0, highlight: false, sorted: false
  }));
  
  const push = (desc: string) => frames.push({ type: 'blocks', blocks: JSON.parse(JSON.stringify(blocks)), description: desc });
  push("Initial Array prepared for Merge Sort.");
  
  const sort = (segment: typeof blocks, depth: number, centerX: number): typeof blocks => {
    if (segment.length <= 1) {
      if (segment.length === 1) {
        segment[0].y = depth * Y_STEP;
        segment[0].x = centerX;
        segment[0].highlight = true;
        push(`Base case: [${segment[0].val}] is sorted by definition.`);
        segment[0].highlight = false;
        segment[0].sorted = true;
      }
      return segment;
    }
    
    const mid = Math.floor(segment.length / 2);
    const leftSeg = segment.slice(0, mid);
    const rightSeg = segment.slice(mid);
    
    const leftWidth = leftSeg.length * BLOCK_W;
    const rightWidth = rightSeg.length * BLOCK_W;
    const gap = Math.max(20, 100 - depth * 20); 
    
    const leftCenterX = centerX - rightWidth/2 - gap/2;
    const rightCenterX = centerX + leftWidth/2 + gap/2;
    
    leftSeg.forEach((b, i) => { b.y = depth * Y_STEP; b.x = leftCenterX + (i - leftSeg.length/2 + 0.5) * BLOCK_W; });
    rightSeg.forEach((b, i) => { b.y = depth * Y_STEP; b.x = rightCenterX + (i - rightSeg.length/2 + 0.5) * BLOCK_W; });
    
    push(`Dividing array into two sub-arrays.`);
    
    const sortedLeft = sort(leftSeg, depth + 1, leftCenterX);
    const sortedRight = sort(rightSeg, depth + 1, rightCenterX);
    
    push(`Merging left and right sub-arrays...`);
    
    const merged: typeof blocks = [];
    let i = 0, j = 0;
    const mergedY = (depth - 1) * Y_STEP;
    
    while (i < sortedLeft.length && j < sortedRight.length) {
      sortedLeft[i].highlight = true;
      sortedRight[j].highlight = true;
      push(`Comparing ${sortedLeft[i].val} and ${sortedRight[j].val}...`);
      
      if (sortedLeft[i].val <= sortedRight[j].val) {
        sortedLeft[i].highlight = false;
        const b = sortedLeft[i];
        b.y = mergedY;
        b.x = centerX + (merged.length - segment.length/2 + 0.5) * BLOCK_W;
        merged.push(b);
        push(`${b.val} is smaller. Placed into merged array.`);
        i++;
      } else {
        sortedRight[j].highlight = false;
        const b = sortedRight[j];
        b.y = mergedY;
        b.x = centerX + (merged.length - segment.length/2 + 0.5) * BLOCK_W;
        merged.push(b);
        push(`${b.val} is smaller. Placed into merged array.`);
        j++;
      }
    }
    
    while (i < sortedLeft.length) {
      const b = sortedLeft[i];
      b.y = mergedY;
      b.x = centerX + (merged.length - segment.length/2 + 0.5) * BLOCK_W;
      merged.push(b);
      push(`Flushing remaining left element ${b.val}.`);
      i++;
    }
    while (j < sortedRight.length) {
      const b = sortedRight[j];
      b.y = mergedY;
      b.x = centerX + (merged.length - segment.length/2 + 0.5) * BLOCK_W;
      merged.push(b);
      push(`Flushing remaining right element ${b.val}.`);
      j++;
    }
    
    merged.forEach(b => b.sorted = true);
    push(`Segment merge complete.`);
    return merged;
  };
  
  const finalSorted = sort(blocks, 1, 0);
  finalSorted.forEach(b => { b.y = 0; b.sorted = true; });
  push("Merge Sort Complete! Array fully reconstructed.");
  return frames;
};

export const generateQuickSort = (arr: number[]): SandboxFrame[] => {
  const frames: SandboxFrame[] = [];
  const BLOCK_W = 56;
  const Y_STEP = 90;
  
  let blocks = arr.map((val, i) => ({
    id: `b${i}`, val, x: (i - arr.length / 2 + 0.5) * BLOCK_W, y: 0, highlight: false, sorted: false, pointer: ''
  }));
  
  const push = (desc: string) => frames.push({ type: 'blocks', blocks: JSON.parse(JSON.stringify(blocks)), description: desc });
  push("Initial Array prepared for Quick Sort.");
  
  const sort = (segment: typeof blocks, depth: number, centerX: number): typeof blocks => {
    if (segment.length <= 1) {
      if (segment.length === 1) {
        segment[0].y = depth * Y_STEP;
        segment[0].x = centerX;
        segment[0].sorted = true;
        push(`Base case: [${segment[0].val}] is sorted.`);
      }
      return segment;
    }
    
    const pivotBlock = segment[segment.length - 1];
    pivotBlock.highlight = true;
    pivotBlock.pointer = 'Pivot';
    push(`Selected ${pivotBlock.val} as pivot.`);
    
    const leftSeg: typeof blocks = [];
    const rightSeg: typeof blocks = [];
    
    for (let i = 0; i < segment.length - 1; i++) {
      const b = segment[i];
      b.highlight = true;
      push(`Comparing ${b.val} with pivot ${pivotBlock.val}.`);
      if (b.val < pivotBlock.val) {
        leftSeg.push(b);
        b.pointer = 'Left';
        push(`${b.val} < ${pivotBlock.val}. Routing to left partition.`);
      } else {
        rightSeg.push(b);
        b.pointer = 'Right';
        push(`${b.val} >= ${pivotBlock.val}. Routing to right partition.`);
      }
      b.highlight = false;
    }
    
    const leftWidth = leftSeg.length * BLOCK_W;
    const rightWidth = rightSeg.length * BLOCK_W;
    const gap = 80;
    
    const leftCenterX = centerX - gap/2 - leftWidth/2 - BLOCK_W/2;
    const rightCenterX = centerX + gap/2 + rightWidth/2 + BLOCK_W/2;
    
    leftSeg.forEach((b, i) => { b.y = depth * Y_STEP; b.x = leftCenterX + (i - leftSeg.length/2 + 0.5) * BLOCK_W; b.pointer=''; });
    rightSeg.forEach((b, i) => { b.y = depth * Y_STEP; b.x = rightCenterX + (i - rightSeg.length/2 + 0.5) * BLOCK_W; b.pointer=''; });
    pivotBlock.y = depth * Y_STEP;
    pivotBlock.x = centerX;
    
    push(`Partitioning around pivot ${pivotBlock.val}.`);
    pivotBlock.highlight = false;
    pivotBlock.pointer = '';
    pivotBlock.sorted = true;
    
    const sortedLeft = sort(leftSeg, depth + 1, leftCenterX);
    const sortedRight = sort(rightSeg, depth + 1, rightCenterX);
    
    push(`Reconstructing array segment...`);
    
    const merged = [...sortedLeft, pivotBlock, ...sortedRight];
    const mergedY = (depth - 1) * Y_STEP;
    
    merged.forEach((b, i) => {
      b.y = mergedY;
      b.x = centerX + (i - merged.length/2 + 0.5) * BLOCK_W;
      b.sorted = true;
    });
    
    push(`Reconstruction complete for segment.`);
    return merged;
  };
  
  const finalSorted = sort(blocks, 1, 0);
  finalSorted.forEach(b => b.y = 0);
  push("Quick Sort Complete! Array fully reconstructed.");
  return frames;
};

// --- SEARCHING ALGORITHMS ---
export const generateLinearSearch = (arr: number[], target: number): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ type: 'array', array: [...arr], highlights: [], pointers: {}, description: `Starting Linear Search for target: ${target}` }];
  for (let i = 0; i < arr.length; i++) {
    frames.push({ type: 'array', array: [...arr], highlights: [i], pointers: { i }, description: `Checking index ${i}. Is ${arr[i]} == ${target}?` });
    if (arr[i] === target) {
      frames.push({ type: 'array', array: [...arr], highlights: [i], pointers: { match: i }, description: `Target found at index ${i}!` });
      return frames;
    }
  }
  frames.push({ type: 'array', array: [...arr], highlights: [], pointers: {}, description: `Reached end of array. Target ${target} not found.` });
  return frames;
};

export const generateBinarySearch = (arr: number[], target: number): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ type: 'array', array: [...arr], highlights: [], pointers: {}, description: `Starting Binary Search for ${target}. (Array must be sorted)` }];
  let low = 0, high = arr.length - 1;
  
  while (low <= high) {
    const window = [];
    for (let i = low; i <= high; i++) window.push(i);

    frames.push({ type: 'array', array: [...arr], highlights: window, pointers: { L: low, R: high }, description: `Active search window is [${low}..${high}]. Calculating Midpoint...` });

    const mid = Math.floor((low + high) / 2);
    frames.push({ type: 'array', array: [...arr], highlights: window, pointers: { L: low, mid, R: high }, description: `Midpoint is index ${mid}. Is arr[${mid}] (${arr[mid]}) == ${target}?` });

    if (arr[mid] === target) {
      frames.push({ type: 'array', array: [...arr], highlights: [mid], pointers: { match: mid }, description: `Target found at index ${mid}!` });
      return frames;
    } else if (arr[mid] < target) {
      frames.push({ type: 'array', array: [...arr], highlights: [mid], pointers: { L: low, mid, R: high }, description: `${arr[mid]} < ${target}. Discarding left half by moving L pointer to mid + 1.` });
      low = mid + 1;
    } else {
      frames.push({ type: 'array', array: [...arr], highlights: [mid], pointers: { L: low, mid, R: high }, description: `${arr[mid]} > ${target}. Discarding right half by moving R pointer to mid - 1.` });
      high = mid - 1;
    }
  }
  
  frames.push({ type: 'array', array: [...arr], highlights: [], pointers: { L: low, R: high }, description: `Left pointer crossed Right pointer! The search window is empty. Target ${target} not found.` });
  return frames;
};

// --- CORE ARRAYS ---
export const generateArrayCreation = (arr: number[]): SandboxFrame[] => {
  const frames: SandboxFrame[] = [];
  frames.push({ type: 'array', array: [], highlights: [], pointers: {}, description: "Allocating contiguous memory for array..." });
  const current: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    current.push(arr[i]);
    frames.push({ type: 'array', array: [...current], highlights: [i], pointers: { 'new': i }, description: `Inserted ${arr[i]} at index ${i}` });
  }
  frames.push({ type: 'array', array: [...current], highlights: [], pointers: {}, description: "Array creation complete." });
  return frames;
};

export const generateArrayTraversal = (arr: number[]): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ type: 'array', array: [...arr], highlights: [], pointers: {}, description: "Starting array traversal..." }];
  for (let i = 0; i < arr.length; i++) {
    frames.push({ type: 'array', array: [...arr], highlights: [i], pointers: { i }, description: `Accessing element at index ${i}: ${arr[i]}` });
  }
  frames.push({ type: 'array', array: [...arr], highlights: [], pointers: {}, description: "Traversal complete." });
  return frames;
};

export const generateArrayInsertion = (arr: number[], val: number, idx: number): SandboxFrame[] => {
  const frames: SandboxFrame[] = [];
  if (idx < 0 || idx > arr.length) throw new Error("Index out of bounds");
  frames.push({ type: 'array', array: [...arr], highlights: [], pointers: {}, description: `Preparing to insert ${val} at index ${idx}. Checking capacity...` });

  const newArr: (number | string)[] = new Array(arr.length + 1).fill('-');
  frames.push({ type: 'array', array: [...newArr], highlights: [], pointers: {}, description: `Capacity full! Allocating new contiguous memory block of size ${newArr.length}.` });

  for (let i = 0; i < idx; i++) {
    newArr[i] = arr[i];
    frames.push({ type: 'array', array: [...newArr], highlights: [i], pointers: { 'copied': i }, description: `Copying existing element ${arr[i]} into new array.` });
  }

  newArr[idx] = val;
  frames.push({ type: 'array', array: [...newArr], highlights: [idx], pointers: { 'inserted': idx }, description: `Inserting new value ${val} at target index ${idx}.` });

  for (let i = idx; i < arr.length; i++) {
    newArr[i + 1] = arr[i];
    frames.push({ type: 'array', array: [...newArr], highlights: [i + 1], pointers: { 'shifted': i + 1 }, description: `Copying remaining element ${arr[i]} into index ${i + 1}.` });
  }

  frames.push({ type: 'array', array: [...newArr], highlights: [], pointers: {}, description: `Insertion complete. Old array memory is freed.` });
  return frames;
};

export const generateArrayDeletion = (arr: number[], idx: number): SandboxFrame[] => {
  const frames: SandboxFrame[] = [];
  if (idx < 0 || idx >= arr.length) throw new Error("Index out of bounds");

  const a: (number | string)[] = [...arr];
  frames.push({ type: 'array', array: [...a], highlights: [idx], pointers: { 'target': idx }, description: `Preparing to delete element at index ${idx} (${a[idx]}).` });

  a[idx] = '-';
  frames.push({ type: 'array', array: [...a], highlights: [idx], pointers: {}, description: `Element removed. Memory slot is now empty.` });

  for (let i = idx; i < a.length - 1; i++) {
    frames.push({ type: 'array', array: [...a], highlights: [i, i + 1], pointers: { 'shift': i + 1 }, description: `Moving ${a[i + 1]} leftwards to index ${i} to close gap.` });
    a[i] = a[i + 1];
    a[i + 1] = '-';
    frames.push({ type: 'array', array: [...a], highlights: [i], pointers: { 'shifted': i }, description: `Moved.` });
  }

  a.pop();
  frames.push({ type: 'array', array: [...a], highlights: [], pointers: {}, description: `Decreased array capacity. Deletion complete.` });
  return frames;
};