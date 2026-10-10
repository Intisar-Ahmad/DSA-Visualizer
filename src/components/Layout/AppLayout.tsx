import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { EditorPanel } from '../Editor/EditorPanel';
import { CallStack } from '../Visualizer/CallStack';
import { ExecutionContext } from '../Visualizer/ExecutionContext';
import { HeapPanel } from '../Visualizer/HeapPanel';
import { ConsolePanel } from '../Visualizer/ConsolePanel';
import { Controls } from '../Controls/Controls';
import { AlgoVisualizer } from '../Visualizer/AlgoVisualizer';
import { useExecutionStore } from '../../store/executionStore';
import { Link } from 'react-router-dom';
import { Beaker } from 'lucide-react';

type ViewMode = 'memory' | 'visual';

export function AppLayout() {
  const { currentStep } = useExecutionStore();
  const headerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('memory');

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0a0c14] text-white overflow-hidden select-none">
      {/* Header */}
      <header
        ref={headerRef}
        className="shrink-0 flex items-center justify-between px-6 py-3 bg-[#0f1117] border-b border-white/8 z-10"
      >
       
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7">
              <div className="absolute inset-0 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 opacity-90" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M4 7V4h16v3M9 20h6M12 4v16" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">DSA Visualizer</h1>
              <p className="text-[9px] text-white/30 font-mono tracking-wider">STACK & HEAP TRACKER</p>
            </div>
          </div>
        </div>
 <Link
          to="/sandbox"
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-mono transition-all shadow-md active:scale-95"
        >
          <Beaker size={14} /> DSA Sandbox
        </Link>
        {/* View Toggle */}
        <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setViewMode('memory')}
            className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all duration-200 cursor-pointer ${viewMode === 'memory'
                ? 'bg-blue-500/20 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                : 'text-white/40 hover:text-white/70'
              }`}
          >
            Memory Grid
          </button>
          <button
            onClick={() => setViewMode('visual')}
            className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all duration-200 cursor-pointer ${viewMode === 'visual'
                ? 'bg-purple-500/20 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                : 'text-white/40 hover:text-white/70'
              }`}
          >
            AlgoCanvas
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Editor */}
        <div className="flex flex-col w-[42%] border-r border-white/8 min-h-0">
          <div className="flex-1 overflow-hidden p-4">
            <EditorPanel className="h-full" />
          </div>
          <Controls />
        </div>

        {/* Right: Visualizer panels */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#050608]">

          {/* Top row: Dynamic Toggle Area */}
          <div className="flex h-[70%] border-b border-white/8 min-h-0">
            {viewMode === 'memory' ? (
              <>
                <div className="w-1/3 border-r border-white/8 p-4 min-h-0 overflow-hidden">
                  <CallStack
                    entries={currentStep?.callStack ?? []}
                    isAnimating={!!currentStep}
                  />
                </div>
                <div className="w-1/3 border-r border-white/8 p-4 min-h-0 overflow-hidden">
                  <ExecutionContext frames={currentStep?.executionContext ?? []} />
                </div>
                <div className="w-1/3 p-4 min-h-0 overflow-hidden">
                  <HeapPanel heap={currentStep?.heap ?? {}} />
                </div>
              </>
            ) : (
              <div className="w-full p-4 min-h-0 overflow-hidden">
                <AlgoVisualizer heap={currentStep?.heap ?? {}} context={currentStep?.executionContext ?? []} />
              </div>
            )}
          </div>

          {/* Bottom row: Console remains intact */}
          <div className="flex h-[30%] min-h-0">
            <div className="flex-1 p-4 min-h-0 overflow-hidden">
              <ConsolePanel output={currentStep?.consoleOutput ?? []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}