import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, SkipBack, SkipForward, 
  Settings, BookOpen, Activity, AlertCircle, HardHat, Code, Info, FileWarning, ExternalLink
} from 'lucide-react';
import { usePlayback } from '../../hooks/usePlayback';
import type { SandboxFrame } from '../../types/sandbox';
import { CONTENT_DICTIONARY } from '../../lib/content/dictionary';

// --- IMPORTS ---
import { 
  generateBubbleSort, generateSelectionSort, generateInsertionSort, generateMergeSort, generateQuickSort,
  generateLinearSearch, generateBinarySearch,
  generateArrayCreation, generateArrayTraversal, generateArrayInsertion, generateArrayDeletion 
} from '../../lib/generators/arrays.ts';
import { generateLLCreation, generateLLTraversal, generateLLInsertion, generateLLDeletion } from '../../lib/generators/linkedLists.ts';
import { generateDLLCreation, generateDLLTraversal, generateDLLInsertion, generateDLLDeletion } from '../../lib/generators/doublyLinkedLists.ts';
import { generateCLLCreation, generateCLLTraversal, generateCLLInsertion, generateCLLDeletion } from '../../lib/generators/circularLinkedLists.ts';
import { generateDCLLCreation, generateDCLLTraversal, generateDCLLInsertion, generateDCLLDeletion } from '../../lib/generators/doublyCircularLinkedLists.ts';
import { generateBSTCreation, generateBSTSearch, generateBSTInsertion, generateBSTDeletion } from '../../lib/generators/trees.ts';
import { generateAVLCreation, generateAVLSearch, generateAVLInsertion, generateAVLDeletion } from '../../lib/generators/avlTrees.ts';
import { generateRBCreation, generateRBSearch, generateRBInsertion, generateRBDeletion } from '../../lib/generators/redBlackTrees.ts';
import { generateHeapCreation, generateHeapSearch, generateHeapInsertion, generateHeapDeletion } from '../../lib/generators/heaps.ts';
import { generateGraphCreation, generateGraphModify, generateGraphTraversalDummy } from '../../lib/generators/graphs.ts';
import { generateGraphBFS, generateGraphDFS } from '../../lib/generators/graphAlgos.ts';
import { generateStackCreation, generateStackPush, generateStackPop, generateQueueCreation, generateQueueEnqueue, generateQueueDequeue } from '../../lib/generators/stacksAndQueues.ts';
import { generateHashmapCreation, generateHashmapGet, generateHashmapPut, generateHashmapRemove } from '../../lib/generators/hashMaps.ts';
import { generatePreOrder, generateInOrder, generatePostOrder, generateBFS, generateDFS } from '../../lib/generators/treeAlgos.ts';

const MODULES: Record<string, any> = {
  'arrays': {
    title: 'Arrays (Implementation)', operations: ['Creation', 'Traversal', 'Insertion', 'Deletion'],
    inputs: [
      { id: 'array', type: 'text', label: 'Initial Array', default: '10, 20, 30, 40', showFor: ['Creation', 'Traversal', 'Insertion', 'Deletion'] },
      { id: 'insertVal', type: 'text', label: 'Value to Insert', default: '99', showFor: ['Insertion'] },
      { id: 'insertIdx', type: 'text', label: 'Index to Insert', default: '2', showFor: ['Insertion'] },
      { id: 'deleteIdx', type: 'text', label: 'Index to Delete', default: '2', showFor: ['Deletion'] }
    ]
  },
  'stacks': {
    title: 'Stacks (LIFO)', operations: ['Creation', 'Push', 'Pop'],
    inputs: [
      { id: 'array', type: 'text', label: 'Initial Stack', default: '10, 20, 30', showFor: ['Creation', 'Push', 'Pop'] },
      { id: 'insertVal', type: 'text', label: 'Value to Push', default: '99', showFor: ['Push'] }
    ]
  },
  'stack': {
    title: 'Stacks (LIFO)', operations: ['Creation', 'Push', 'Pop'],
    inputs: [
      { id: 'array', type: 'text', label: 'Initial Stack', default: '10, 20, 30', showFor: ['Creation', 'Push', 'Pop'] },
      { id: 'insertVal', type: 'text', label: 'Value to Push', default: '99', showFor: ['Push'] }
    ]
  },
  'queues': {
    title: 'Queues (FIFO)', operations: ['Creation', 'Enqueue', 'Dequeue'],
    inputs: [
      { id: 'array', type: 'text', label: 'Initial Queue', default: '10, 20, 30', showFor: ['Creation', 'Enqueue', 'Dequeue'] },
      { id: 'insertVal', type: 'text', label: 'Value to Enqueue', default: '99', showFor: ['Enqueue'] }
    ]
  },
  'queue': {
    title: 'Queues (FIFO)', operations: ['Creation', 'Enqueue', 'Dequeue'],
    inputs: [
      { id: 'array', type: 'text', label: 'Initial Queue', default: '10, 20, 30', showFor: ['Creation', 'Enqueue', 'Dequeue'] },
      { id: 'insertVal', type: 'text', label: 'Value to Enqueue', default: '99', showFor: ['Enqueue'] }
    ]
  },
  'sorting': {
    title: 'Sorting Algorithms', operations: ['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort', 'Quick Sort'],
    inputs: [{ id: 'array', type: 'text', label: 'Input Array', default: '45, 12, 89, 33, 5', showFor: ['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort', 'Quick Sort'] }]
  },
  'searching': {
    title: 'Searching Algorithms', operations: ['Linear Search', 'Binary Search'],
    inputs: [
      { id: 'array', type: 'text', label: 'Array (Sorted for Binary)', default: '2, 5, 8, 12, 16, 23, 38, 56, 72, 91', showFor: ['Linear Search', 'Binary Search'] },
      { id: 'target', type: 'text', label: 'Target Value', default: '23', showFor: ['Linear Search', 'Binary Search'] }
    ]
  },
  'tree-algos': {
    title: 'Tree Traversals', operations: ['Pre-order', 'In-order', 'Post-order', 'BFS', 'DFS'],
    inputs: [
      { id: 'array', type: 'text', label: 'Initial Tree Nodes', default: '50, 30, 70, 20, 40, 60, 80', showFor: ['Pre-order', 'In-order', 'Post-order', 'BFS', 'DFS'] }
    ]
  },
  'graph-algos': {
    title: 'Graph Traversals', operations: ['BFS', 'DFS'],
    inputs: [
      { id: 'edges', type: 'text', label: 'Graph Edge List', default: 'A-B, A-C, B-D, C-D, D-E', showFor: ['BFS', 'DFS'] },
      { id: 'startNode', type: 'text', label: 'Starting Node', default: 'A', showFor: ['BFS', 'DFS'] }
    ]
  },
  'linked-lists': {
    title: 'Linked Lists', operations: ['Creation', 'Traversal', 'Insertion', 'Deletion'],
    inputs: [
      { id: 'listType', type: 'select', label: 'Linked List Type', options: ['Singly', 'Doubly', 'Singly Circular', 'Doubly Circular'], default: 'Singly', showFor: ['Creation', 'Traversal', 'Insertion', 'Deletion'] },
      { id: 'array', type: 'text', label: 'Initial List Values', default: '10, 20, 30, 40', showFor: ['Creation', 'Traversal', 'Insertion', 'Deletion'] },
      { id: 'insertVal', type: 'text', label: 'Value to Insert', default: '99', showFor: ['Insertion'] },
      { id: 'insertIdx', type: 'text', label: 'Index to Insert', default: '2', showFor: ['Insertion'] },
      { id: 'deleteIdx', type: 'text', label: 'Index to Delete', default: '2', showFor: ['Deletion'] }
    ]
  },
  'trees': {
    title: 'Trees (BST, AVL, Heap)', operations: ['Creation', 'Search', 'Insertion', 'Deletion'],
    inputs: [
      { id: 'treeType', type: 'select', label: 'Tree Type', options: ['BST', 'AVL', 'Red-Black', 'Min Heap', 'Max Heap'], default: 'BST', showFor: ['Creation', 'Search', 'Insertion', 'Deletion'] },
      { id: 'array', type: 'text', label: 'Initial Tree Nodes', default: '10, 20, 30, 40, 50, 60, 70', showFor: ['Creation', 'Search', 'Insertion', 'Deletion'] },
      { id: 'target', type: 'text', label: 'Target Value', default: '40', showFor: ['Search'] },
      { id: 'insertVal', type: 'text', label: 'Value to Insert', default: '45', showFor: ['Insertion'] },
      { id: 'deleteVal', type: 'text', label: 'Value to Delete', default: '50', showFor: ['Deletion'] }
    ]
  },
  'graphs': {
    title: 'Graphs (Adjacency List)', operations: ['Creation', 'Modify', 'Traversal'],
    inputs: [
      { id: 'edges', type: 'text', label: 'Initial Edge List', default: 'A-B, A-C, B-D, C-D', showFor: ['Creation', 'Modify', 'Traversal'] },
      { id: 'modifyCmd', type: 'text', label: 'Modify Command (+E, -A, +A-E, -A-B)', default: '+E, +A-E, -C, -B-D', showFor: ['Modify'] }
    ]
  },
  'hash-maps': {
    title: 'Hash Maps (Key-Value)', operations: ['Creation', 'Get', 'Put', 'Remove'],
    inputs: [
      { id: 'object', type: 'text', label: 'Initial Object {key: value}', default: '{ id: 1, name: 20, rank: 5 }', showFor: ['Creation', 'Get', 'Put', 'Remove'] },
      { id: 'getKey', type: 'text', label: 'Target Key', default: 'name', showFor: ['Get'] },
      { id: 'putKey', type: 'text', label: 'Insert Key', default: 'score', showFor: ['Put'] },
      { id: 'putVal', type: 'text', label: 'Insert Value', default: '99', showFor: ['Put'] },
      { id: 'removeKey', type: 'text', label: 'Key to Remove', default: 'rank', showFor: ['Remove'] }
    ]
  }
};

export function SandboxWorkspace() {
  const { id } = useParams();
  const location = useLocation();
  const isAlgo = location.pathname.includes('/algo/');
  
  const config = MODULES[id || ''] || { title: 'Work in Progress', operations: ['Coming Soon'], inputs: [] };
  
  const [activeOperation, setActiveOperation] = useState(config.operations[0]);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });
  const [activeDrag, setActiveDrag] = useState<{ startX: number, startY: number, initX: number, initY: number } | null>(null);

  const { currentFrame, currentIndex, totalFrames, isPlaying, play, pause, stepForward, stepBackward, seek, loadFrames, speed, setSpeed } = usePlayback<SandboxFrame>([]);

  let contentKey = `${id}-${activeOperation}`;
  if (id === 'linked-lists') {
    contentKey = `${id}-${inputValues['listType'] || 'Singly'}-${activeOperation}`;
  } else if (id === 'trees') {
    contentKey = `${id}-${inputValues['treeType'] || 'BST'}-${activeOperation}`;
  } else if (id === 'stack') {
    contentKey = `stacks-${activeOperation}`;
  } else if (id === 'queue') {
    contentKey = `queues-${activeOperation}`;
  }

  const content = CONTENT_DICTIONARY[contentKey] || {
    description: "Documentation pending for this operation.", mechanism: "N/A", caveats: "N/A", timeComplexity: "?", spaceComplexity: "?", pseudocode: "// Code pending"
  };

  useEffect(() => {
    setActiveOperation(config.operations[0]);
    const defaults: Record<string, string> = {};
    config.inputs.forEach((inp: any) => defaults[inp.id] = inp.default);
    setInputValues(defaults);
    loadFrames([]); 
    setCamera({ x: 0, y: 0, scale: 1 });
  }, [id, config]);

  // --- MODULAR EXECUTORS ---
  const runArrays = (arr: number[]) => {
    switch (activeOperation) {
      case 'Creation': return generateArrayCreation(arr);
      case 'Traversal': return generateArrayTraversal(arr);
      case 'Insertion':
        const iVal = parseInt(inputValues['insertVal']); const iIdx = parseInt(inputValues['insertIdx']);
        if (isNaN(iVal) || isNaN(iIdx)) throw new Error("Insert fields must be valid numbers.");
        return generateArrayInsertion(arr, iVal, iIdx);
      case 'Deletion':
        const dIdx = parseInt(inputValues['deleteIdx']);
        if (isNaN(dIdx)) throw new Error("Delete index must be a valid number.");
        return generateArrayDeletion(arr, dIdx);
      default: throw new Error("Operation not implemented.");
    }
  };

  const runStacks = (arr: number[]) => {
    switch (activeOperation) {
      case 'Creation': return generateStackCreation(arr);
      case 'Push':
        const iVal = parseInt(inputValues['insertVal']);
        if (isNaN(iVal)) throw new Error("Push value must be a valid number.");
        return generateStackPush(arr, iVal);
      case 'Pop': return generateStackPop(arr);
      default: throw new Error("Operation not implemented.");
    }
  };

  const runQueues = (arr: number[]) => {
    switch (activeOperation) {
      case 'Creation': return generateQueueCreation(arr);
      case 'Enqueue':
        const iVal = parseInt(inputValues['insertVal']);
        if (isNaN(iVal)) throw new Error("Enqueue value must be a valid number.");
        return generateQueueEnqueue(arr, iVal);
      case 'Dequeue': return generateQueueDequeue(arr);
      default: throw new Error("Operation not implemented.");
    }
  };

  const runLinkedLists = (arr: number[]) => {
    const type = inputValues['listType'] || 'Singly';
    switch (activeOperation) {
      case 'Creation':
        if (type === 'Doubly') return generateDLLCreation(arr);
        if (type === 'Singly Circular') return generateCLLCreation(arr);
        if (type === 'Doubly Circular') return generateDCLLCreation(arr);
        return generateLLCreation(arr);
      case 'Traversal':
        if (type === 'Doubly') return generateDLLTraversal(arr);
        if (type === 'Singly Circular') return generateCLLTraversal(arr);
        if (type === 'Doubly Circular') return generateDCLLTraversal(arr);
        return generateLLTraversal(arr);
      case 'Insertion':
        const iVal = parseInt(inputValues['insertVal']); const iIdx = parseInt(inputValues['insertIdx']);
        if (isNaN(iVal) || isNaN(iIdx)) throw new Error("Insert fields must be valid numbers.");
        if (type === 'Doubly') return generateDLLInsertion(arr, iVal, iIdx);
        if (type === 'Singly Circular') return generateCLLInsertion(arr, iVal, iIdx);
        if (type === 'Doubly Circular') return generateDCLLInsertion(arr, iVal, iIdx);
        return generateLLInsertion(arr, iVal, iIdx);
      case 'Deletion':
        const dIdx = parseInt(inputValues['deleteIdx']);
        if (isNaN(dIdx)) throw new Error("Delete index must be a valid number.");
        if (type === 'Doubly') return generateDLLDeletion(arr, dIdx);
        if (type === 'Singly Circular') return generateCLLDeletion(arr, dIdx);
        if (type === 'Doubly Circular') return generateDCLLDeletion(arr, dIdx);
        return generateLLDeletion(arr, dIdx);
      default: throw new Error("Operation not implemented.");
    }
  };

  const runTrees = (arr: number[]) => {
    const type = inputValues['treeType'] || 'BST';
    const isMax = type === 'Max Heap';
    switch (activeOperation) {
      case 'Creation':
        if (type === 'BST') return generateBSTCreation(arr);
        if (type === 'AVL') return generateAVLCreation(arr);
        if (type === 'Red-Black') return generateRBCreation(arr);
        if (type === 'Min Heap' || type === 'Max Heap') return generateHeapCreation(arr, isMax);
        throw new Error(`${type} Creation coming soon!`);
      case 'Search':
        const target = parseInt(inputValues['target']);
        if (isNaN(target)) throw new Error("Target value must be a valid number.");
        if (type === 'BST') return generateBSTSearch(arr, target);
        if (type === 'AVL') return generateAVLSearch(arr, target);
        if (type === 'Red-Black') return generateRBSearch(arr, target);
        if (type === 'Min Heap' || type === 'Max Heap') return generateHeapSearch(arr, target, isMax);
        throw new Error(`${type} Search coming soon!`);
      case 'Insertion':
        const iVal = parseInt(inputValues['insertVal']);
        if (isNaN(iVal)) throw new Error("Insert value must be a valid number.");
        if (type === 'BST') return generateBSTInsertion(arr, iVal);
        if (type === 'AVL') return generateAVLInsertion(arr, iVal);
        if (type === 'Red-Black') return generateRBInsertion(arr, iVal);
        if (type === 'Min Heap' || type === 'Max Heap') return generateHeapInsertion(arr, iVal, isMax);
        throw new Error(`${type} Insertion coming soon!`);
      case 'Deletion':
        const dVal = parseInt(inputValues['deleteVal']);
        if (isNaN(dVal)) throw new Error("Delete value must be a valid number.");
        if (type === 'BST') return generateBSTDeletion(arr, dVal);
        if (type === 'AVL') return generateAVLDeletion(arr, dVal);
        if (type === 'Red-Black') return generateRBDeletion(arr, dVal);
        if (type === 'Min Heap' || type === 'Max Heap') return generateHeapDeletion(arr, dVal, isMax);
        throw new Error(`${type} Deletion coming soon!`);
      default: throw new Error("Operation not implemented.");
    }
  };
  
  const runTreeAlgos = (arr: number[]) => {
    switch (activeOperation) {
      case 'Pre-order': return generatePreOrder(arr);
      case 'In-order': return generateInOrder(arr);
      case 'Post-order': return generatePostOrder(arr);
      case 'BFS': return generateBFS(arr);
      case 'DFS': return generateDFS(arr);
      default: throw new Error("Operation not implemented.");
    }
  };

  const runGraphs = (edgeStrs: string[]) => {
    switch (activeOperation) {
      case 'Creation': return generateGraphCreation(edgeStrs);
      case 'Modify':
        const cmd = inputValues['modifyCmd'] || '';
        if (!cmd) throw new Error("Please enter a modify command.");
        return generateGraphModify(edgeStrs, cmd);
      case 'Traversal': return generateGraphTraversalDummy();
      default: throw new Error("Operation not implemented.");
    }
  };

  const runGraphAlgos = (edgeStrs: string[]) => {
    const sNode = inputValues['startNode'] || '';
    if (!sNode) throw new Error("Please enter a starting node.");
    switch (activeOperation) {
      case 'BFS': return generateGraphBFS(edgeStrs, sNode);
      case 'DFS': return generateGraphDFS(edgeStrs, sNode);
      default: throw new Error("Operation not implemented.");
    }
  };

  const runHashMaps = (kvPairs: {key: string, val: string}[]) => {
    switch (activeOperation) {
      case 'Creation': return generateHashmapCreation(kvPairs);
      case 'Get':
        const gKey = inputValues['getKey'] || '';
        if (!gKey) throw new Error("Please enter a target key.");
        return generateHashmapGet(kvPairs, gKey);
      case 'Put':
        const pKey = inputValues['putKey'] || '';
        const pVal = inputValues['putVal'] || '';
        if (!pKey) throw new Error("Please enter a valid key to insert.");
        return generateHashmapPut(kvPairs, pKey, pVal);
      case 'Remove':
        const rKey = inputValues['removeKey'] || '';
        if (!rKey) throw new Error("Please enter a target key to remove.");
        return generateHashmapRemove(kvPairs, rKey);
      default: throw new Error("Operation not implemented.");
    }
  };

  const runSorting = (arr: number[]) => {
    if (activeOperation === 'Bubble Sort') return generateBubbleSort(arr);
    if (activeOperation === 'Selection Sort') return generateSelectionSort(arr);
    if (activeOperation === 'Insertion Sort') return generateInsertionSort(arr);
    if (activeOperation === 'Merge Sort') return generateMergeSort(arr);
    if (activeOperation === 'Quick Sort') return generateQuickSort(arr);
    throw new Error("Operation not implemented.");
  };

  const runSearching = (arr: number[]) => {
    const target = parseInt(inputValues['target'] || '0');
    if (isNaN(target)) throw new Error("Target must be a number.");
    if (activeOperation === 'Linear Search') return generateLinearSearch(arr, target);
    if (activeOperation === 'Binary Search') {
      if ([...arr].sort((a,b)=>a-b).toString() !== arr.toString()) throw new Error("Binary Search requires a sorted array.");
      return generateBinarySearch(arr, target);
    }
    throw new Error("Operation not implemented.");
  };

  // --- CORE EXECUTION ---
  const handleRun = () => {
    setError(null);
    try {
      if (activeOperation === 'Coming Soon') throw new Error("This module is currently under construction.");
      
      const rawInput = inputValues['array'] || inputValues['edges'] || inputValues['object'] || '';
      let parsedData: any;
      
      if (id === 'graphs' || id === 'graph-algos') {
        parsedData = rawInput.split(',').map(s => s.trim()).filter(s => s);
        if (parsedData.length === 0 && activeOperation !== 'Modify') throw new Error("Please enter valid edges (e.g., 'A-B, B-C').");
      } else if (id === 'hash-maps') {
        const clean = rawInput.replace(/[{}]/g, '').trim();
        parsedData = clean ? clean.split(',').map(pair => {
          const [k, v] = pair.split(':');
          if (!k || !v) throw new Error("Invalid object format. Use { key: value, key2: value2 }");
          return { key: k.trim(), val: v.trim() };
        }) : [];
        if (parsedData.length === 0 && activeOperation !== 'Creation' && activeOperation !== 'Put') throw new Error("Please enter a valid key-value object.");
      } else {
        parsedData = rawInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        if (parsedData.length === 0 && activeOperation !== 'Creation' && activeOperation !== 'Pop' && activeOperation !== 'Dequeue') throw new Error("Please enter a valid array of numbers.");
      }
      
      const containerWidth = containerRef.current?.clientWidth || 800;
      const expectedWidth = parsedData.length * (id === 'linked-lists' ? 160 : id === 'hash-maps' ? 120 : 70) + 120; 
      let optimalScale = 1;
      if (expectedWidth > containerWidth * 0.85) {
        optimalScale = Math.max(0.2, (containerWidth * 0.85) / expectedWidth);
      }
      setCamera({ x: 0, y: 0, scale: optimalScale });

      let frames: SandboxFrame[] = [];
      if (id === 'arrays') frames = runArrays(parsedData);
      else if (id === 'stacks' || id === 'stack') frames = runStacks(parsedData);
      else if (id === 'queues' || id === 'queue') frames = runQueues(parsedData);
      else if (id === 'linked-lists') frames = runLinkedLists(parsedData);
      else if (id === 'trees') frames = runTrees(parsedData);
      else if (id === 'tree-algos') frames = runTreeAlgos(parsedData);
      else if (id === 'graphs') frames = runGraphs(parsedData);
      else if (id === 'graph-algos') frames = runGraphAlgos(parsedData);
      else if (id === 'hash-maps') frames = runHashMaps(parsedData);
      else if (id === 'sorting') frames = runSorting(parsedData);
      else if (id === 'searching') frames = runSearching(parsedData);
      else throw new Error("Unknown module ID.");
      
      if (!frames || frames.length === 0) throw new Error("Engine returned 0 frames.");
      loadFrames(frames);
      play();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setActiveDrag({ startX: e.clientX, startY: e.clientY, initX: camera.x, initY: camera.y });
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDrag) return;
    setCamera(prev => ({ ...prev, x: activeDrag.initX + (e.clientX - activeDrag.startX), y: activeDrag.initY + (e.clientY - activeDrag.startY) }));
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setActiveDrag(null);
  };
  const handleWheel = (e: React.WheelEvent) => {
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setCamera(prev => ({ ...prev, scale: Math.max(0.2, Math.min(prev.scale * zoomFactor, 3)) }));
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0a0c14] text-gray-200 font-georama overflow-hidden">
      <header className="h-14 flex items-center justify-between px-6 border-b border-white/10 bg-[#0d0f18] shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link to="/sandbox" className="p-2 hover:bg-white/10 rounded-md transition-colors"><ArrowLeft size={18} className="text-gray-400 hover:text-white" /></Link>
          <div className="flex items-center gap-2">
            <Activity size={18} className={isAlgo ? "text-purple-500" : "text-blue-500"} />
            <h1 className="font-bold text-lg tracking-wide text-white">{config.title}</h1>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        <aside className="w-[30%] flex flex-col border-r border-white/10 bg-[#0d0f18] overflow-y-auto custom-scrollbar z-10">
          <div className="p-6 space-y-8">
            <section>
              <h2 className="flex items-center gap-2 text-sm font-bold text-white mb-3 uppercase tracking-wider"><Activity size={16} className="text-blue-400" /> State Inspector</h2>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg min-h-[80px] flex items-center">
                <p className="text-sm text-blue-200 font-mono leading-relaxed">{currentFrame ? currentFrame.description : `Configure inputs and run ${activeOperation} to visualize the steps.`}</p>
              </div>
            </section>
            <section className="space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-widest"><Info size={14} /> What it does</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{content.description}</p>
              </div>
              <div>
                <h3 className="flex items-center gap-2 text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-widest"><Settings size={14} /> How it works</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{content.mechanism}</p>
              </div>
              <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
                <h3 className="flex items-center gap-2 text-[11px] font-bold text-yellow-500/70 mb-2 uppercase tracking-widest"><FileWarning size={14} /> Important Caveat</h3>
                <p className="text-sm text-yellow-500/70 leading-relaxed">{content.caveats}</p>
              </div>
            </section>
            <section>
              <h2 className="flex items-center gap-2 text-sm font-bold text-white mb-3 uppercase tracking-wider"><Activity size={16} className="text-pink-400" /> Complexity</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 font-mono uppercase mb-1">Time</p>
                  <p className="font-mono text-sm text-green-400">{content.timeComplexity}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 font-mono uppercase mb-1">Space</p>
                  <p className="font-mono text-sm text-purple-400">{content.spaceComplexity}</p>
                </div>
              </div>
            </section>
            <section>
              <h2 className="flex items-center gap-2 text-sm font-bold text-white mb-3 uppercase tracking-wider"><Code size={16} className="text-emerald-400" /> Pseudocode</h2>
              <div className="bg-[#05060a] border border-white/10 rounded-lg p-4 overflow-x-auto">
                <pre className="font-mono text-xs text-gray-300 leading-loose">{content.pseudocode}</pre>
              </div>
            </section>
          </div>
        </aside>

        <section ref={containerRef} className="flex-1 flex flex-col relative bg-[#0a0c14] overflow-hidden cursor-grab active:cursor-grabbing z-0" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onWheel={handleWheel}>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: `${20 * camera.scale}px ${20 * camera.scale}px`, backgroundPosition: `${camera.x}px ${camera.y}px` }} />

          {id === 'graphs' && activeOperation === 'Traversal' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-[#0a0c14]/80 backdrop-blur-md pointer-events-auto">
              <ExternalLink size={48} className="text-blue-500 mb-6" />
              <h2 className="text-2xl font-bold text-white mb-3 tracking-wide">Traversals are Algorithms</h2>
              <p className="text-gray-400 mb-8 max-w-md text-center leading-relaxed">BFS and DFS are algorithmic strategies rather than inherent data structure mechanics. They have been moved to the Algorithms playground.</p>
              <Link to="/algo/graph-algos" className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:scale-105 active:scale-95 flex items-center gap-2">
                Launch Graph Algorithms <ArrowLeft size={18} className="rotate-180" />
              </Link>
            </div>
          )}

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none overflow-hidden">
            <div style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`, transformOrigin: 'center' }} className={`relative flex items-center justify-center ${activeDrag ? '' : 'transition-transform duration-75 ease-out'}`}>
              
              {currentFrame?.type === 'blocks' && (
                <div className="relative pointer-events-auto" style={{ width: '0px', height: '0px' }}>
                  {currentFrame.blocks!.map((block) => (
                    <div 
                      key={block.id} 
                      className={`absolute flex items-center justify-center font-bold font-mono text-lg rounded-md transition-all duration-[600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${block.highlight ? 'bg-pink-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.8)] z-10 scale-110' : block.sorted ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-indigo-600/80 text-gray-100 border border-indigo-400/30'}`}
                      style={{ 
                        width: '48px', height: '48px',
                        left: `${block.x}px`, top: `${block.y}px`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      {block.val}
                      {block.pointer && (
                        <div className="absolute -bottom-8 flex justify-center w-full">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono border border-blue-500/40 uppercase tracking-widest whitespace-nowrap shadow-[0_0_10px_rgba(59,130,246,0.3)]">{block.pointer}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {currentFrame?.type === 'hashmap' && (
                <div className="pointer-events-auto flex items-end justify-center gap-3">
                   {currentFrame.hashmap!.map((pair, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2">
                          <div className={`flex flex-col border-2 rounded-lg overflow-hidden transition-all duration-300 min-w-[100px] ${pair.highlight ? 'border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.6)] scale-105' : 'border-indigo-500/30 shadow-lg'}`}>
                              <div className={`px-4 py-2 text-center border-b font-bold tracking-widest text-xs transition-colors duration-300 ${pair.highlight ? 'bg-pink-600 border-pink-400 text-white' : 'bg-indigo-900/80 border-indigo-500/30 text-indigo-300'}`}>
                                  {pair.key}
                              </div>
                              <div className={`px-4 py-4 text-center font-mono font-bold text-xl transition-colors duration-300 ${pair.highlight ? 'bg-pink-500 text-white' : 'bg-slate-800 text-gray-100'}`}>
                                  {pair.val}
                              </div>
                          </div>
                          {pair.pointer && (
                              <div className="h-10 flex flex-col items-center justify-start gap-1">
                                  <span className="text-[10px] px-2 py-1 rounded bg-blue-500/20 text-blue-400 font-mono border border-blue-500/40 uppercase tracking-widest font-bold">{pair.pointer}</span>
                              </div>
                          )}
                      </div>
                   ))}
                   {currentFrame.hashmap!.length === 0 && (
                     <div className="px-8 py-4 border-2 border-dashed border-gray-600 text-gray-500 rounded-lg font-mono font-bold">Empty Hash Map</div>
                   )}
                </div>
              )}

              {currentFrame?.type === 'queue' && (
                <div className="pointer-events-auto flex items-center justify-center">
                  <div 
                    className="relative flex flex-row items-center justify-start border-t-[6px] border-b-[6px] border-slate-600 px-6 py-4 bg-slate-800/30 transition-all duration-500 gap-3 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]"
                    style={{ minWidth: '300px', width: `${Math.max(currentFrame.array!.length, 3) * 70 + 48}px` }}
                  >
                    <div className="absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-[#0a0c14] to-transparent pointer-events-none -ml-1" />
                    <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-[#0a0c14] to-transparent pointer-events-none -mr-1" />

                    {currentFrame.array!.map((val, idx) => {
                      const isHighlighted = currentFrame.highlights!.includes(idx);
                      const activePointers = Object.entries(currentFrame.pointers!).filter(([_, ptrIdx]) => ptrIdx === idx).map(([key]) => key);
                      
                      return (
                        <div key={idx} className="relative shrink-0 flex flex-col items-center gap-2">
                          <div className="h-10 flex flex-col items-center justify-end gap-1 absolute -top-12">
                            {activePointers.map(ptr => <span key={ptr} className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono border border-orange-500/40 uppercase tracking-widest font-bold shadow-[0_0_10px_rgba(249,115,22,0.3)]">{ptr}</span>)}
                          </div>
                          <div className={`w-14 h-14 flex items-center justify-center font-bold font-mono text-lg rounded-md transition-all duration-300 ${isHighlighted ? 'bg-pink-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.6)] scale-105' : 'bg-indigo-600/80 text-gray-100 border border-indigo-400/30 shadow-lg'}`}>
                            {val}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentFrame?.type === 'stack' && (
                <div className="pointer-events-auto flex items-end justify-center">
                  <div 
                    className="relative flex flex-col-reverse items-center justify-start border-l-[6px] border-r-[6px] border-b-[6px] border-slate-600 rounded-b-2xl p-4 w-56 bg-slate-800/30 transition-all duration-500 gap-3 shadow-[inset_0_-20px_30px_rgba(0,0,0,0.5)]"
                    style={{ height: `${Math.max(currentFrame.array!.length + 1.5, 4) * 60 + 32}px`, minHeight: '250px' }}
                  >
                    <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-[#0a0c14] to-transparent pointer-events-none -mt-1" />

                    {currentFrame.array!.map((val, idx) => {
                      const isHighlighted = currentFrame.highlights!.includes(idx);
                      const activePointers = Object.entries(currentFrame.pointers!).filter(([_, ptrIdx]) => ptrIdx === idx).map(([key]) => key);
                      
                      return (
                        <div key={idx} className="relative w-full shrink-0">
                          <div className={`w-full h-12 flex items-center justify-center font-bold font-mono text-lg rounded-md transition-all duration-300 ${isHighlighted ? 'bg-pink-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.6)] scale-105' : 'bg-indigo-600/80 text-gray-100 border border-indigo-400/30 shadow-lg'}`}>
                            {val}
                          </div>
                          {activePointers.length > 0 && (
                            <div className="absolute -right-[120px] top-1/2 -translate-y-1/2 flex items-center gap-2">
                              <ArrowLeft size={20} className="text-blue-500" />
                              <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 font-mono border border-blue-500/40 uppercase tracking-widest font-bold shadow-[0_0_10px_rgba(59,130,246,0.3)]">{activePointers.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentFrame?.type === 'array' && (
                <div className="flex items-end gap-3 pointer-events-auto">
                  {currentFrame.array!.map((val, idx) => {
                    const isHighlighted = currentFrame.highlights!.includes(idx);
                    const activePointers = Object.entries(currentFrame.pointers!).filter(([_, ptrIdx]) => ptrIdx === idx).map(([key]) => key);
                    
                    if (val === '-') {
                      return (
                        <div key={idx} className="flex flex-col items-center gap-2 transition-all duration-300">
                          <div className="w-14 flex items-center justify-center font-bold font-mono text-lg rounded-t-md transition-all duration-300 bg-transparent border-2 border-dashed border-gray-600 text-gray-600 shadow-inner" style={{ height: `40px` }}>-</div>
                          <span className="text-xs font-mono text-gray-500">{idx}</span>
                        </div>
                      );
                    }
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 transition-all duration-300">
                        <div className={`w-14 flex items-center justify-center font-bold font-mono text-lg rounded-t-md transition-all duration-300 ${isHighlighted ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.6)]' : 'bg-[#1e1b4b] text-gray-200 border border-indigo-500/30'}`} style={{ height: `${Math.max((typeof val === 'number' ? val : 0) * 2.5, 40)}px` }}>{val}</div>
                        <span className="text-xs font-mono text-gray-500">{idx}</span>
                        <div className="h-10 flex flex-col items-center justify-start gap-1">
                          {activePointers.map(ptr => <span key={ptr} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono border border-blue-500/40 uppercase tracking-widest">{ptr}</span>)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {currentFrame?.type === 'node' && (
                 <svg className="overflow-visible pointer-events-none" width="1" height="1" viewBox="0 0 1 1">
                   <defs>
                     <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#4b5563" /></marker>
                     <marker id="arrowhead-highlight" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#ec4899" /></marker>
                     <marker id="arrowhead-reverse" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto-start-reverse"><polygon points="0 0, 10 3.5, 0 7" fill="#4b5563" /></marker>
                     <marker id="arrowhead-reverse-highlight" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto-start-reverse"><polygon points="0 0, 10 3.5, 0 7" fill="#ec4899" /></marker>
                   </defs>
                   
                   <g>
                     {currentFrame.edges!.map((edge, i) => {
                       const sourceNode = currentFrame.nodes!.find(n => n.id === edge.source);
                       const targetNode = currentFrame.nodes!.find(n => n.id === edge.target);
                       if (!sourceNode || !targetNode) return null;
                       
                       const markerEndProp = edge.undirected ? undefined : `url(#${edge.highlight ? 'arrowhead-highlight' : 'arrowhead'})`;
                       const markerStartProp = edge.bidirectional && !edge.undirected ? `url(#${edge.highlight ? 'arrowhead-reverse-highlight' : 'arrowhead-reverse'})` : undefined;

                       if (edge.curveOffset) {
                         const cx = (sourceNode.x + targetNode.x) / 2;
                         const cy = sourceNode.y + edge.curveOffset;
                         return (
                           <path 
                             key={`${edge.source}-${edge.target}-${i}`} 
                             d={`M ${sourceNode.x} ${sourceNode.y + 22} Q ${cx} ${cy} ${targetNode.x} ${targetNode.y + 22}`}
                             fill="transparent"
                             stroke={edge.highlight ? '#ec4899' : '#4b5563'} strokeWidth={edge.highlight ? "3" : "2"}
                             markerEnd={markerEndProp}
                             markerStart={markerStartProp}
                             className="transition-all duration-500 ease-out"
                           />
                         );
                       }
                       
                       return (
                         <line 
                           key={`${edge.source}-${edge.target}-${i}`} 
                           x1={sourceNode.x} y1={sourceNode.y} 
                           x2={targetNode.x} y2={targetNode.y}
                           stroke={edge.highlight ? '#ec4899' : '#4b5563'} strokeWidth={edge.highlight ? "3" : "2"}
                           markerEnd={markerEndProp}
                           markerStart={markerStartProp}
                           className="transition-all duration-500 ease-out"
                         />
                       );
                     })}
                     
                     {currentFrame.nodes!.map((node) => {
                       let fillColor = node.highlight ? '#ec4899' : '#1e1b4b'; 
                       if (node.color === 'RED') fillColor = '#ef4444'; 
                       else if (node.color === 'BLACK') fillColor = '#111827'; 
                       if (node.highlight) fillColor = '#ec4899'; 

                       return (
                         <g key={node.id} style={{ transform: `translate(${node.x}px, ${node.y}px)` }} className="transition-all duration-500 ease-out pointer-events-auto">
                           <circle r="22" fill={fillColor} stroke={node.highlight ? '#fbcfe8' : '#6366f1'} strokeWidth="3" className={node.highlight ? 'shadow-[0_0_20px_rgba(236,72,153,0.8)]' : ''}/>
                           <text textAnchor="middle" dy=".3em" fill="white" className="font-mono font-bold text-sm pointer-events-none">{node.val}</text>
                           {node.pointer && (
                             <g style={{ transform: 'translate(0, 45px)' }}>
                               <rect x="-20" y="-10" width="40" height="20" rx="4" fill="rgba(59,130,246,0.2)" stroke="rgba(59,130,246,0.5)" />
                               <text textAnchor="middle" dy=".3em" fill="#60a5fa" className="font-mono text-[10px] font-bold tracking-widest uppercase">{node.pointer}</text>
                             </g>
                           )}
                         </g>
                       );
                     })}
                   </g>
                 </svg>
              )}
            </div>
            
            {/* VISITED ARRAY RENDERER FOR TREE & GRAPH TRAVERSALS */}
            {currentFrame?.type === 'node' && currentFrame.array && currentFrame.array.length > 0 && (
              <div className="absolute bottom-10 flex flex-col items-center pointer-events-auto bg-[#0a0c14]/80 backdrop-blur px-6 py-4 rounded-xl border border-white/10 shadow-2xl">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">Visited Nodes Order</span>
                <div className="flex gap-2 flex-wrap justify-center max-w-2xl">
                  {currentFrame.array.map((val, idx) => (
                    <div key={idx} className="w-10 h-10 flex items-center justify-center font-bold font-mono text-sm rounded bg-emerald-600/80 text-white border border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] transform transition-all duration-300 animate-[pop_0.3s_ease-out]">
                      {val}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
          {!currentFrame && config.title !== 'Work in Progress' && <p className="text-gray-600 font-mono text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">Waiting for execution...</p>}
        </section>

        <aside className="w-[22%] flex flex-col border-l border-white/10 bg-[#0d0f18] z-10">
          <div className="p-6 border-b border-white/10">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider"><Settings size={16} className="text-gray-400" /> Configuration</h2>
          </div>
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Select Operation</label>
              <select value={activeOperation} onChange={(e) => setActiveOperation(e.target.value)} className="w-full bg-[#05060a] border border-white/10 rounded-md p-2.5 text-sm text-gray-200 outline-none focus:border-blue-500 transition-colors cursor-pointer">
                {config.operations.map((op: string) => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
            
            {/* Dynamic UI Render Logic */}
            {config.inputs.filter((inp:any) => inp.showFor.includes(activeOperation)).map((inp: any) => (
              <div key={inp.id} className="space-y-2">
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{inp.label}</label>
                {inp.type === 'select' ? (
                  <select value={inputValues[inp.id] || inp.default} onChange={(e) => setInputValues({...inputValues, [inp.id]: e.target.value})} className="w-full bg-[#05060a] border border-white/10 rounded-md p-2.5 text-sm text-gray-200 outline-none focus:border-blue-500 transition-colors cursor-pointer">
                    {inp.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input type="text" value={inputValues[inp.id] || ''} onChange={(e) => setInputValues({...inputValues, [inp.id]: e.target.value})} className="w-full bg-[#05060a] border border-white/10 rounded-md p-2.5 text-sm text-gray-200 outline-none focus:border-blue-500 transition-colors font-mono focus:shadow-[0_0_10px_rgba(59,130,246,0.2)]" />
                )}
              </div>
            ))}
            
            {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md flex items-start gap-2 text-red-400 text-xs"><AlertCircle size={14} className="shrink-0 mt-0.5" /> <p>{error}</p></div>}
            <button onClick={handleRun} disabled={config.title === 'Work in Progress'} className="w-full py-3 bg-white text-black font-bold rounded-md hover:bg-gray-200 transition-colors active:scale-95 text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed">Visualize Execution</button>

            {id === 'graphs' && activeOperation === 'Modify' && (
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-200 space-y-3">
                <h4 className="font-bold flex items-center gap-1.5 text-blue-400 uppercase tracking-widest"><Info size={14}/> Command Guide</h4>
                <p className="leading-relaxed">Chain multiple modifications together by separating them with commas (e.g., <code className="bg-black/40 px-1.5 py-0.5 rounded text-gray-300 font-mono">+Z, -A, +B-Z</code>).</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2"><code className="bg-pink-500/20 text-pink-400 border border-pink-500/30 px-1.5 py-0.5 rounded font-mono">+A</code> <span>Add standalone node A</span></li>
                  <li className="flex items-center gap-2"><code className="bg-pink-500/20 text-pink-400 border border-pink-500/30 px-1.5 py-0.5 rounded font-mono">-A</code> <span>Delete node A & its edges</span></li>
                  <li className="flex items-center gap-2"><code className="bg-pink-500/20 text-pink-400 border border-pink-500/30 px-1.5 py-0.5 rounded font-mono">+A-B</code> <span>Add edge between A and B</span></li>
                  <li className="flex items-center gap-2"><code className="bg-pink-500/20 text-pink-400 border border-pink-500/30 px-1.5 py-0.5 rounded font-mono">-A-B</code> <span>Remove edge between A and B</span></li>
                </ul>
              </div>
            )}
          </div>
        </aside>
      </main>
      
      <div className="h-16 shrink-0 bg-[#0d0f18] border-t border-white/10 flex items-center px-6 gap-6 z-20 relative">
        <div className="flex items-center gap-2">
          <button onClick={stepBackward} disabled={currentIndex === 0} className="p-2 hover:bg-white/10 rounded-full text-gray-400 disabled:opacity-50"><SkipBack size={18} /></button>
          <button onClick={isPlaying ? pause : play} disabled={totalFrames === 0} className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white shadow-lg disabled:opacity-50 active:scale-95 transition-all">{isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}</button>
          <button onClick={stepForward} disabled={currentIndex === totalFrames - 1} className="p-2 hover:bg-white/10 rounded-full text-gray-400 disabled:opacity-50"><SkipForward size={18} /></button>
        </div>
        
        <div className="flex-1 flex items-center gap-4">
          <span className="text-xs font-mono text-gray-500 min-w-[40px] text-right">{totalFrames > 0 ? currentIndex + 1 : 0} / {totalFrames}</span>
          <input type="range" min="0" max={Math.max(0, totalFrames - 1)} value={currentIndex} onChange={(e) => seek(Number(e.target.value))} disabled={totalFrames === 0} className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-gray-500 uppercase">Speed</span>
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="bg-[#05060a] border border-white/10 rounded px-2 py-1 text-xs font-mono text-gray-300 outline-none cursor-pointer hover:border-white/30 transition-colors">
            <option value={1000}>0.5x</option>
            <option value={500}>1x</option>
            <option value={250}>2x</option>
            <option value={125}>4x</option>
          </select>
        </div>
      </div>
    </div>
  );
}