import type { SandboxFrame } from '../../types/sandbox';

export const generateBubbleSort = (arr: number[]): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ type: 'array', array: [...arr], highlights: [], pointers: {}, description: "Initial Array" }];
  const a = [...arr];
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      frames.push({ type: 'array', array: [...a], highlights: [j, j + 1], pointers: { j, 'j+1': j+1 }, description: `Comparing ${a[j]} and ${a[j+1]}` });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        frames.push({ type: 'array', array: [...a], highlights: [j, j + 1], pointers: { j, 'j+1': j+1 }, description: `Swapped! ${a[j]} is now before ${a[j+1]}` });
      }
    }
  }
  frames.push({ type: 'array', array: [...a], highlights: [], pointers: {}, description: "Array is sorted!" });
  return frames;
};

export const generateSelectionSort = (arr: number[]): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ type: 'array', array: [...arr], highlights: [], pointers: {}, description: "Initial Array" }];
  const a = [...arr];
  for (let i = 0; i < a.length; i++) {
    let minIdx = i;
    frames.push({ type: 'array', array: [...a], highlights: [i], pointers: { i, min: minIdx }, description: `Assuming minimum is at index ${i} (${a[i]})` });
    for (let j = i + 1; j < a.length; j++) {
      frames.push({ type: 'array', array: [...a], highlights: [j, minIdx], pointers: { i, j, min: minIdx }, description: `Comparing ${a[j]} with current min ${a[minIdx]}` });
      if (a[j] < a[minIdx]) {
        minIdx = j;
        frames.push({ type: 'array', array: [...a], highlights: [minIdx], pointers: { i, j, min: minIdx }, description: `New minimum found at index ${minIdx} (${a[minIdx]})` });
      }
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      frames.push({ type: 'array', array: [...a], highlights: [i, minIdx], pointers: { i }, description: `Swapped minimum ${a[i]} to its sorted position.` });
    }
  }
  frames.push({ type: 'array', array: [...a], highlights: [], pointers: {}, description: "Array is sorted!" });
  return frames;
};

export const generateLinearSearch = (arr: number[], target: number): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ type: 'array', array: [...arr], highlights: [], pointers: {}, description: `Starting Linear Search for ${target}` }];
  for (let i = 0; i < arr.length; i++) {
    frames.push({ type: 'array', array: [...arr], highlights: [i], pointers: { i }, description: `Checking index ${i}. Is ${arr[i]} == ${target}?` });
    if (arr[i] === target) {
      frames.push({ type: 'array', array: [...arr], highlights: [i], pointers: { i }, description: `Target found at index ${i}!` });
      return frames;
    }
  }
  frames.push({ type: 'array', array: [...arr], highlights: [], pointers: {}, description: `Target ${target} not found in array.` });
  return frames;
};

export const generateBinarySearch = (arr: number[], target: number): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ type: 'array', array: [...arr], highlights: [], pointers: {}, description: `Starting Binary Search for ${target}. Array must be sorted.` }];
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    frames.push({ type: 'array', array: [...arr], highlights: [mid], pointers: { low, mid, high }, description: `Calculating mid = (${low} + ${high}) / 2 = ${mid}. Checking ${arr[mid]}.` });
    if (arr[mid] === target) {
      frames.push({ type: 'array', array: [...arr], highlights: [mid], pointers: { mid }, description: `Target found at index ${mid}!` });
      return frames;
    } else if (arr[mid] < target) {
      frames.push({ type: 'array', array: [...arr], highlights: [mid], pointers: { low, mid, high }, description: `${arr[mid]} < ${target}. Discarding left half.` });
      low = mid + 1;
    } else {
      frames.push({ type: 'array', array: [...arr], highlights: [mid], pointers: { low, mid, high }, description: `${arr[mid]} > ${target}. Discarding right half.` });
      high = mid - 1;
    }
  }
  frames.push({ type: 'array', array: [...arr], highlights: [], pointers: { low, high }, description: `Target ${target} not found.` });
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