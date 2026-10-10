import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, SkipBack, SkipForward, 
  Settings, BookOpen, Activity, AlertCircle, HardHat, Code, Info, FileWarning
} from 'lucide-react';
import { usePlayback } from '../../hooks/usePlayback';
import type { SandboxFrame } from '../../types/sandbox';
import { CONTENT_DICTIONARY } from '../../lib/contents/dictionary';

// IMPORTS
import { 
  generateBubbleSort, generateSelectionSort, generateLinearSearch, generateBinarySearch,
  generateArrayCreation, generateArrayTraversal, generateArrayInsertion, generateArrayDeletion 
} from '../../lib/generators/arrays';
import { 
  generateLLCreation, generateLLTraversal, generateLLInsertion, generateLLDeletion 
} from '../../lib/generators/linkedlists';

const MODULES: Record<string, any> = {
  'arrays': {
    title: 'Arrays (Implementation)', 
    operations: ['Creation', 'Traversal', 'Insertion', 'Deletion'],
    inputs: [
      { id: 'array', label: 'Initial Array', default: '10, 20, 30, 40', showFor: ['Creation', 'Traversal', 'Insertion', 'Deletion'] },
      { id: 'insertVal', label: 'Value to Insert', default: '99', showFor: ['Insertion'] },
      { id: 'insertIdx', label: 'Index to Insert', default: '2', showFor: ['Insertion'] },
      { id: 'deleteIdx', label: 'Index to Delete', default: '2', showFor: ['Deletion'] }
    ]
  },
  'sorting': {
    title: 'Sorting Algorithms', operations: ['Bubble Sort', 'Selection Sort'],
    inputs: [{ id: 'array', label: 'Input Array', default: '45, 12, 89, 33, 5', showFor: ['Bubble Sort', 'Selection Sort'] }]
  },
  'searching': {
    title: 'Searching Algorithms', operations: ['Linear Search', 'Binary Search'],
    inputs: [
      { id: 'array', label: 'Array (Sorted for Binary)', default: '2, 5, 8, 12, 16, 23, 38, 56, 72, 91', showFor: ['Linear Search', 'Binary Search'] },
      { id: 'target', label: 'Target Value', default: '23', showFor: ['Linear Search', 'Binary Search'] }
    ]
  },
  'linked-lists': {
    title: 'Singly Linked List', operations: ['Creation', 'Traversal', 'Insertion', 'Deletion'],
    inputs: [
      { id: 'array', label: 'Initial List Values', default: '10, 20, 30, 40', showFor: ['Creation', 'Traversal', 'Insertion', 'Deletion'] },
      { id: 'insertVal', label: 'Value to Insert', default: '99', showFor: ['Insertion'] },
      { id: 'insertIdx', label: 'Index to Insert', default: '2', showFor: ['Insertion'] },
      { id: 'deleteIdx', label: 'Index to Delete', default: '2', showFor: ['Deletion'] }
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

  const {
    currentFrame, currentIndex, totalFrames, isPlaying,
    play, pause, stepForward, stepBackward, seek, loadFrames, speed, setSpeed
  } = usePlayback<SandboxFrame>([]);

  const contentKey = `${id}-${activeOperation}`;
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

  const handleRun = () => {
    setError(null);
    try {
      if (activeOperation === 'Coming Soon') throw new Error("This module is currently under construction.");
      
      const arrRaw = inputValues['array'] || '';
      const arr = arrRaw.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (arr.length === 0 && activeOperation !== 'Creation') throw new Error("Please enter a valid array of numbers.");
      
      // --- AUTO-ZOOM CALCULATION ---
      const containerWidth = containerRef.current?.clientWidth || 800;
      let expectedElementCount = arr.length;
      if (activeOperation === 'Insertion') expectedElementCount += 1;
      
      // Linked lists nodes take ~160px width. Arrays take ~70px.
      const expectedWidth = expectedElementCount * (id === 'linked-lists' ? 160 : 70) + 120; // 120px padding
      
      let optimalScale = 1;
      if (expectedWidth > containerWidth * 0.85) {
        optimalScale = (containerWidth * 0.85) / expectedWidth;
        optimalScale = Math.max(0.2, optimalScale); // Prevent microscopic zoom
      }
      setCamera({ x: 0, y: 0, scale: optimalScale });
      // -----------------------------

      let frames: SandboxFrame[] = [];
      
      switch (activeOperation) {
        case 'Creation': 
          if (id === 'arrays') frames = generateArrayCreation(arr);
          else if (id === 'linked-lists') frames = generateLLCreation(arr); 
          break;
        case 'Traversal': 
          if (id === 'arrays') frames = generateArrayTraversal(arr);
          else if (id === 'linked-lists') frames = generateLLTraversal(arr); 
          break;
        case 'Insertion': 
          const iVal = parseInt(inputValues['insertVal']);
          const iIdx = parseInt(inputValues['insertIdx']);
          if (isNaN(iVal) || isNaN(iIdx)) throw new Error("Insert fields must be valid numbers.");
          if (id === 'arrays') frames = generateArrayInsertion(arr, iVal, iIdx); 
          else if (id === 'linked-lists') frames = generateLLInsertion(arr, iVal, iIdx); 
          break;
        case 'Deletion': 
          const dIdx = parseInt(inputValues['deleteIdx']);
          if (isNaN(dIdx)) throw new Error("Delete index must be a valid number.");
          if (id === 'arrays') frames = generateArrayDeletion(arr, dIdx); 
          else if (id === 'linked-lists') frames = generateLLDeletion(arr, dIdx); 
          break;
        case 'Bubble Sort': frames = generateBubbleSort(arr); break;
        case 'Selection Sort': frames = generateSelectionSort(arr); break;
        case 'Linear Search': frames = generateLinearSearch(arr, parseInt(inputValues['target']||'0')); break;
        case 'Binary Search': 
          if ([...arr].sort((a,b)=>a-b).toString() !== arr.toString()) throw new Error("Binary Search requires a sorted array.");
          frames = generateBinarySearch(arr, parseInt(inputValues['target']||'0')); 
          break;
        default: throw new Error("Operation not yet implemented.");
      }
      
      if (frames.length === 0) throw new Error("Engine returned 0 frames. Check input parameters.");
      
      loadFrames(frames);
      play();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only block dragging if they manage to click a button (if we ever add them inside canvas)
    if ((e.target as HTMLElement).closest('button')) return;
    
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
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg min-h-20 flex items-center">
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
          </div>
        </aside>

        {/* --- CENTER PANEL (CANVAS) --- */}
        <section 
          ref={containerRef}
          className="flex-1 flex flex-col relative bg-[#0a0c14] overflow-hidden cursor-grab active:cursor-grabbing z-0"
          onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onWheel={handleWheel}
        >
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ 
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
            backgroundSize: `${20 * camera.scale}px ${20 * camera.scale}px`,
            backgroundPosition: `${camera.x}px ${camera.y}px`
          }} />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            
            {/* By conditionally removing the transition during drag, panning becomes instantly responsive! */}
            <div 
              style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`, transformOrigin: 'center' }} 
              className={`relative flex items-center justify-center ${activeDrag ? '' : 'transition-transform duration-75 ease-out'}`}
            >
              
              {config.title === 'Work in Progress' && (
                <div className="absolute flex flex-col items-center justify-center gap-4 opacity-50">
                  <HardHat size={48} className="text-yellow-500" />
                  <p className="font-mono text-sm">Module Construction Pending</p>
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
                 <svg 
                   className="overflow-visible pointer-events-none" 
                   width="1" height="1" viewBox="0 0 1 1"
                 >
                   <defs>
                     <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#4b5563" /></marker>
                     <marker id="arrowhead-highlight" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#ec4899" /></marker>
                   </defs>
                   
                   <g>
                     {currentFrame.edges!.map((edge, i) => {
                       const sourceNode = currentFrame.nodes!.find(n => n.id === edge.source);
                       const targetNode = currentFrame.nodes!.find(n => n.id === edge.target);
                       if (!sourceNode || !targetNode) return null;
                       return (
                         <line 
                           key={`${edge.source}-${edge.target}-${i}`} 
                           x1={sourceNode.x} y1={sourceNode.y} 
                           x2={targetNode.x} y2={targetNode.y}
                           stroke={edge.highlight ? '#ec4899' : '#4b5563'} strokeWidth={edge.highlight ? "3" : "2"}
                           markerEnd={`url(#${edge.highlight ? 'arrowhead-highlight' : 'arrowhead'})`}
                           className="transition-all duration-500 ease-out"
                         />
                       );
                     })}
                     
                     {currentFrame.nodes!.map((node) => (
                       <g key={node.id} style={{ transform: `translate(${node.x}px, ${node.y}px)` }} className="transition-all duration-500 ease-out pointer-events-auto">
                         <circle r="22" fill={node.highlight ? '#ec4899' : '#1e1b4b'} stroke={node.highlight ? '#fbcfe8' : '#6366f1'} strokeWidth="3" className={node.highlight ? 'shadow-[0_0_20px_rgba(236,72,153,0.8)]' : ''}/>
                         <text textAnchor="middle" dy=".3em" fill="white" className="font-mono font-bold text-sm pointer-events-none">{node.val}</text>
                         {node.pointer && (
                           <g style={{ transform: 'translate(0, 45px)' }}>
                             <rect x="-20" y="-10" width="40" height="20" rx="4" fill="rgba(59,130,246,0.2)" stroke="rgba(59,130,246,0.5)" />
                             <text textAnchor="middle" dy=".3em" fill="#60a5fa" className="font-mono text-[10px] font-bold tracking-widest uppercase">{node.pointer}</text>
                           </g>
                         )}
                       </g>
                     ))}
                   </g>
                 </svg>
              )}
            </div>
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
            
            {config.inputs.filter((inp:any) => inp.showFor.includes(activeOperation)).map((inp: any) => (
              <div key={inp.id} className="space-y-2">
                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{inp.label}</label>
                <input type="text" value={inputValues[inp.id] || ''} onChange={(e) => setInputValues({...inputValues, [inp.id]: e.target.value})} className="w-full bg-[#05060a] border border-white/10 rounded-md p-2.5 text-sm text-gray-200 outline-none focus:border-blue-500 transition-colors font-mono focus:shadow-[0_0_10px_rgba(59,130,246,0.2)]" />
              </div>
            ))}
            
            {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md flex items-start gap-2 text-red-400 text-xs"><AlertCircle size={14} className="shrink-0 mt-0.5" /> <p>{error}</p></div>}
            <button onClick={handleRun} disabled={config.title === 'Work in Progress'} className="w-full py-3 bg-white text-black font-bold rounded-md hover:bg-gray-200 transition-colors active:scale-95 text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed">Visualize Execution</button>
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
          <span className="text-xs font-mono text-gray-500 min-w-10 text-right">{totalFrames > 0 ? currentIndex + 1 : 0} / {totalFrames}</span>
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