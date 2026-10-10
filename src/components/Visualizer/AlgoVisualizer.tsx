import { useMemo, useState, useEffect, useRef } from 'react';
import type { HeapObject, ExecutionFrame } from '../../types/execution';

const COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'
];

const getColor = (addr: string) => {
  const intVal = parseInt(addr.replace('0x', ''), 16) || 0;
  return COLORS[intVal % COLORS.length];
};

const formatValue = (val: any) => {
  const str = String(val);
  return str.length > 8 ? str.substring(0, 7) + '…' : str;
};

interface AlgoVisualizerProps {
  heap: Record<string, HeapObject>;
  context: ExecutionFrame[];
}

export function AlgoVisualizer({ heap, context }: AlgoVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // --- CAMERA & STATE ---
  const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });
  const [dragOffsets, setDragOffsets] = useState<Record<string, { x: number; y: number }>>({});
  
  const [activeDrag, setActiveDrag] = useState<{ 
    id: string; startX: number; startY: number; initObjX: number; initObjY: number;
  } | null>(null);

  // Reset view on new code execution
  useEffect(() => {
    if (Object.keys(heap).length === 0) {
      setCamera({ x: 0, y: 0, scale: 1 });
      setDragOffsets({});
    }
  }, [heap]);

  // --- LAYOUT ENGINE ---
  const { nodes, edges } = useMemo(() => {
    const nodeCoords = new Map<string, any>();
    const edgeList: Array<any> = [];
    const parsedHeap = new Map<string, any>();

    Object.entries(heap).forEach(([addr, obj]) => {
      try { parsedHeap.set(addr, JSON.parse(obj.data)); } 
      catch { parsedHeap.set(addr, {}); }
    });

    if (parsedHeap.size === 0) return { nodes: [], edges: [] };

    const incomingEdges = new Set<string>();
    parsedHeap.forEach((data) => {
      Object.values(data).forEach(val => {
        if (typeof val === 'string' && val.startsWith('0x') && parsedHeap.has(val)) {
          incomingEdges.add(val);
        }
      });
    });

    const rootIds = Array.from(parsedHeap.keys()).filter(addr => !incomingEdges.has(addr));
    rootIds.sort();

    let xCounter = 0;
    const X_SPACING = 200;
    const Y_SPACING = 140;
    const visited = new Set<string>();

    function calculateLayout(nodeId: string, depth: number) {
      if (!parsedHeap.has(nodeId) || visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const obj = parsedHeap.get(nodeId);
      const color = getColor(nodeId);
      const isArray = Array.isArray(obj);
      
      let keys = Object.keys(obj);
      if (keys.length === 0) keys = ['empty']; 

      const CELL_WIDTH = isArray ? 50 : 85; 
      const totalWidth = keys.length * CELL_WIDTH;
      const centerX = xCounter * X_SPACING + (totalWidth / 2);

      const cells = keys.map((key, idx) => {
        const val = obj[key];
        const isPointer = typeof val === 'string' && val.startsWith('0x') && parsedHeap.has(val);
        return {
          key,
          val: isPointer ? '•' : formatValue(val),
          isPointer,
          target: isPointer ? val : null,
          offsetX: (idx * CELL_WIDTH) - (totalWidth / 2) + (CELL_WIDTH / 2)
        };
      });

      nodeCoords.set(nodeId, {
        id: nodeId, x: centerX, y: depth * Y_SPACING + 80,
        cells, totalWidth, cellWidth: CELL_WIDTH, color, isArray
      });

      const startXCounter = xCounter;
      
      cells.forEach((cell, idx) => {
        if (cell.isPointer) {
          edgeList.push({ 
            source: nodeId, target: cell.target, label: cell.key, color, 
            sourceAnchor: cell.offsetX 
          });
          xCounter = startXCounter + (idx * CELL_WIDTH) / X_SPACING;
          calculateLayout(cell.target as string, depth + 1);
        }
      });
      
      xCounter = Math.max(xCounter, startXCounter + (totalWidth / X_SPACING) + 0.5);
    }

    rootIds.forEach(rootId => {
      if (visited.has(rootId)) return;
      const rootObj = parsedHeap.get(rootId);
      let startId = rootId;
      if (rootObj && !Array.isArray(rootObj)) {
        if (rootObj.root && typeof rootObj.root === 'string') startId = rootObj.root;
        else if (rootObj.head && typeof rootObj.head === 'string') startId = rootObj.head;
        else if (rootObj.buckets && typeof rootObj.buckets === 'string') startId = rootObj.buckets;
      }
      calculateLayout(startId, 0);
      xCounter += 0.5; 
    });

    parsedHeap.forEach((_, id) => {
      if (!visited.has(id)) {
        calculateLayout(id, 0);
        xCounter += 0.5;
      }
    });

    const treeWidth = (xCounter > 0 ? xCounter - 1 : 0) * X_SPACING;
    const offsetX = (800 / 2) - (treeWidth / 2) + 50;

    const finalNodes = Array.from(nodeCoords.entries()).map(([id, pos]) => ({
      ...pos, 
      x: pos.x + offsetX + (dragOffsets[id]?.x || 0),
      y: pos.y + (dragOffsets[id]?.y || 0)
    }));

    const finalEdges = edgeList.map((edge) => {
      const source = nodeCoords.get(edge.source);
      const target = nodeCoords.get(edge.target);
      if (!source || !target) return null;

      const sDrag = dragOffsets[edge.source] || { x: 0, y: 0 };
      const tDrag = dragOffsets[edge.target] || { x: 0, y: 0 };

      const sx = source.x + offsetX + edge.sourceAnchor + sDrag.x;
      const sy = source.y + 25 + sDrag.y;
      const tx = target.x + offsetX + tDrag.x;
      const ty = target.y - 25 + tDrag.y;

      let cx1 = sx, cy1 = sy + 60, cx2 = tx, cy2 = ty - 60;

      if (tx < sx && ty === sy) { cy1 = sy + 80; cy2 = ty + 80; } 
      else if (tx < sx && Math.abs(tx - sx) > X_SPACING) { cy1 = sy - 120; cy2 = ty - 120; } 
      else if (tx < sx) { cy1 = sy + 80; cx2 = tx + 80; }

      return { id: `${edge.source}-${edge.target}-${edge.label}`, sx, sy, tx, ty, cx1, cy1, cx2, cy2, color: edge.color, label: edge.label };
    }).filter(Boolean) as any[];

    return { nodes: finalNodes, edges: finalEdges };
  }, [heap, context, dragOffsets]);

  // --- NODE DRAGGING ---
  const handleNodePointerDown = (e: React.PointerEvent<SVGGElement>, id: string) => {
    e.stopPropagation(); 
    e.currentTarget.setPointerCapture(e.pointerId);
    setActiveDrag({ 
      id, startX: e.clientX, startY: e.clientY,
      initObjX: dragOffsets[id]?.x || 0,
      initObjY: dragOffsets[id]?.y || 0
    });
  };

  const handleNodePointerMove = (e: React.PointerEvent<SVGGElement>, id: string) => {
    if (activeDrag?.id !== id) return;
    // Divide by scale so the node moves perfectly with the mouse when zoomed out/in
    const dx = (e.clientX - activeDrag.startX) / camera.scale;
    const dy = (e.clientY - activeDrag.startY) / camera.scale;
    setDragOffsets(prev => ({
      ...prev, [id]: { x: activeDrag.initObjX + dx, y: activeDrag.initObjY + dy }
    }));
  };

  const handleNodePointerUp = (e: React.PointerEvent<SVGGElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setActiveDrag(null);
  };

  // --- CANVAS PANNING ---
  const handleCanvasPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setActiveDrag({ 
      id: 'canvas', startX: e.clientX, startY: e.clientY,
      initObjX: camera.x, initObjY: camera.y
    });
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (activeDrag?.id !== 'canvas') return;
    const dx = e.clientX - activeDrag.startX;
    const dy = e.clientY - activeDrag.startY;
    setCamera(prev => ({ ...prev, x: activeDrag.initObjX + dx, y: activeDrag.initObjY + dy }));
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setActiveDrag(null);
  };

  // --- CANVAS ZOOM (MOUSE WHEEL) ---
  const handleWheel = (e: React.WheelEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    
    setCamera(prev => {
      const newScale = Math.max(0.2, Math.min(prev.scale * zoomFactor, 3));
      // Point-centered zooming math
      const newX = mouseX - ((mouseX - prev.x) / prev.scale) * newScale;
      const newY = mouseY - ((mouseY - prev.y) / prev.scale) * newScale;
      return { x: newX, y: newY, scale: newScale };
    });
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-[#0a0c14] relative rounded-lg border border-white/10 overflow-hidden shadow-inner select-none cursor-grab active:cursor-grabbing">
      
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
          backgroundSize: `${20 * camera.scale}px ${20 * camera.scale}px`,
          backgroundPosition: `${camera.x}px ${camera.y}px` 
        }} 
      />
      
      <svg 
        className="w-full h-full relative z-10 touch-none overflow-visible"
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerCancel={handleCanvasPointerUp}
        onWheel={handleWheel}
      >
        <defs>
          {COLORS.map(color => (
            <marker key={color} id={`arrow-${color.replace('#', '')}`} viewBox="0 -5 10 10" refX="8" refY="0" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,-5L10,0L0,5" fill={color} opacity="0.8" />
            </marker>
          ))}
        </defs>

        <g style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`, transformOrigin: '0 0' }}>
          
          {edges.map((edge) => (
            <g key={edge.id}>
              <path
                d={`M ${edge.sx} ${edge.sy} C ${edge.cx1} ${edge.cy1}, ${edge.cx2} ${edge.cy2}, ${edge.tx} ${edge.ty}`}
                fill="none" stroke={edge.color} strokeWidth="2.5" strokeOpacity="0.7"
                markerEnd={`url(#arrow-${edge.color.replace('#', '')})`}
                className={activeDrag ? '' : 'transition-all duration-500 ease-out'}
              />
            </g>
          ))}

          {nodes.map((node) => (
            <g 
              key={node.id} 
              style={{ transform: `translate(${node.x}px, ${node.y}px)` }} 
              className={activeDrag?.id === node.id ? 'cursor-grabbing' : 'transition-all duration-500 ease-out cursor-grab'}
              onPointerDown={(e) => handleNodePointerDown(e, node.id)}
              onPointerMove={(e) => handleNodePointerMove(e, node.id)}
              onPointerUp={handleNodePointerUp}
              onPointerCancel={handleNodePointerUp}
            >
              <rect x={-node.totalWidth / 2} y="-25" width={node.totalWidth} height="50" rx="6" fill="#111827" stroke={node.color} strokeWidth="2" className="shadow-lg shadow-black/50" />
              
              {node.cells.map((cell: any, idx: number) => (
                <g key={cell.key} style={{ transform: `translate(${cell.offsetX}px, 0)` }}>
                  {idx > 0 && <line x1={-node.cellWidth / 2} y1="-25" x2={-node.cellWidth / 2} y2="25" stroke={node.color} strokeOpacity="0.4" strokeWidth="1" />}
                  <text y="-2" fill={cell.isPointer ? node.color : '#ffffff'} fontSize={cell.isPointer ? 22 : 14} fontWeight="bold" textAnchor="middle" className="font-mono pointer-events-none">{cell.val}</text>
                  <text y="16" fill="#9ca3af" fontSize="10" textAnchor="middle" className="font-mono pointer-events-none uppercase tracking-wider">{cell.key}</text>
                </g>
              ))}

              <rect x="-24" y="-38" width="48" height="12" rx="2" fill={node.color} fillOpacity="0.2" className="pointer-events-none" />
              <text x="0" y="-29" fill={node.color} fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono pointer-events-none">{node.id}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}