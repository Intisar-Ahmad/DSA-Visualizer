import { useState } from 'react';
import type { HeapObject } from '../../types/execution';

interface HeapPanelProps {
  heap: Record<string, HeapObject>;
}

export function HeapPanel({ heap }: HeapPanelProps) {
  const [selectedObj, setSelectedObj] = useState<HeapObject | null>(null);
  const entries = Object.values(heap);

  // Helper to format a short preview (e.g., { val: 5, next: "0x..." })
  const getPreview = (dataStr: string) => {
    try {
      const obj = JSON.parse(dataStr);
      if (Array.isArray(obj)) {
        return `[ ${obj.slice(0, 3).join(', ')}${obj.length > 3 ? ', ...' : ''} ]`;
      }
      const keys = Object.keys(obj);
      const previewKeys = keys.slice(0, 2).map(k => `${k}: ${obj[k]}`);
      return `{ ${previewKeys.join(', ')}${keys.length > 2 ? ', ...' : ''} }`;
    } catch {
      return dataStr;
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest">Memory (Heap)</h3>
        <span className="ml-auto text-xs bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full font-mono">
          {entries.length}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-2 overflow-auto min-h-0 pb-2">
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs text-white/20 font-mono italic">no allocations</span>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.address}
              onClick={() => setSelectedObj(entry)}
              className="group cursor-pointer rounded-lg border bg-white/3 border-white/8 p-3 hover:bg-pink-500/10 hover:border-pink-400/30 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-pink-300 font-mono">
                  {entry.address}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono uppercase bg-pink-500/20 text-pink-300 truncate max-w-20">
                  {entry.type}
                </span>
              </div>
              <div className="text-[10px] font-mono text-white/50 truncate">
                {getPreview(entry.data)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pop-up Modal for Deep Inspection */}
      {selectedObj && (
        <div 
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl border border-white/10"
          onClick={() => setSelectedObj(null)}
        >
          <div 
            className="bg-[#1a1d2e] border border-pink-500/30 rounded-lg shadow-2xl shadow-pink-500/10 w-[90%] max-h-[90%] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing it
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-black/20">
              <span className="text-xs font-mono font-bold text-pink-300">
                {selectedObj.address} <span className="text-white/40 text-[10px] ml-1">({selectedObj.type})</span>
              </span>
              <button 
                onClick={() => setSelectedObj(null)}
                className="text-white/40 hover:text-white transition-colors p-1 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-3 overflow-auto text-[11px] font-mono text-white/80">
              <pre className="whitespace-pre-wrap wrap-break-word">
                {JSON.stringify(JSON.parse(selectedObj.data), null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}