import type { SandboxFrame } from '../../types/sandbox';

const createDCLLBaseState = (arr: number[]) => {
  const spacing = 160;
  const startX = -((arr.length - 1) * spacing) / 2; 
  const nodes: any[] = arr.map((val, idx) => ({ id: `n${idx}`, val, x: startX + (idx * spacing), y: 0 }));
  const edges: any[] = arr.slice(0, -1).map((_, idx) => ({ source: `n${idx}`, target: `n${idx + 1}`, bidirectional: true }));
  if (arr.length > 1) edges.push({ source: `n${arr.length - 1}`, target: `n0`, curveOffset: 120, bidirectional: true });
  return { nodes, edges, startX, spacing };
};

export const generateDCLLCreation = (arr: number[]): SandboxFrame[] => {
  const { nodes, edges } = createDCLLBaseState(arr);
  const frames: SandboxFrame[] = [{ type: 'node', nodes: [], edges: [], description: "Allocating nodes dynamically..." }];
  const currentNodes: any[] = []; const currentEdges: any[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const newNode = { ...nodes[i], highlight: true, pointer: i === 0 ? 'head' : 'curr' };
    currentNodes.push(newNode);
    if (i > 0) {
      currentNodes[i-1].pointer = undefined; currentNodes[i-1].highlight = false;
      frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Allocated Node(${arr[i]}).` });
      currentEdges.push(edges[i-1]); 
      currentEdges[currentEdges.length - 1].highlight = true;
      frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Wired curr.next and newNode.prev.` });
    } else {
      frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Allocated Head Node.` });
    }
  }
  if (arr.length > 1) {
    currentEdges.push(edges[edges.length - 1]);
    currentEdges[currentEdges.length - 1].highlight = true;
    frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Wired tail.next to head, and head.prev to tail!` });
  }
  frames.push({ type: 'node', nodes, edges, description: "Doubly Circular Linked List creation complete." });
  return frames;
};

export const generateDCLLTraversal = (arr: number[]): SandboxFrame[] => {
  const { nodes, edges } = createDCLLBaseState(arr);
  const frames: SandboxFrame[] = [{ type: 'node', nodes: JSON.parse(JSON.stringify(nodes)), edges, description: "Starting traversal..." }];
  for (let i = 0; i <= nodes.length; i++) {
    const act = i % nodes.length;
    const curNodes = JSON.parse(JSON.stringify(nodes));
    curNodes[act].highlight = true; curNodes[act].pointer = 'curr';
    const curEdges = JSON.parse(JSON.stringify(edges));
    if (i > 0) curEdges[i - 1].highlight = true;
    frames.push({ type: 'node', nodes: curNodes, edges: curEdges, description: i === nodes.length ? `Traversed backlink! curr is back at Head.` : `Traversing... curr is at Node(${arr[act]})` });
  }
  frames.push({ type: 'node', nodes, edges, description: "Traversal complete." });
  return frames;
};

export const generateDCLLInsertion = (arr: number[], insertVal: number, insertIdx: number): SandboxFrame[] => {
  const { nodes, edges, startX, spacing } = createDCLLBaseState(arr);
  const frames: SandboxFrame[] = [];
  const newNode = { id: 'new', val: insertVal, x: startX + (insertIdx * spacing) - (spacing / 2), y: -100, pointer: 'newNode', highlight: true };
  let currentNodes = JSON.parse(JSON.stringify(nodes)); let currentEdges = JSON.parse(JSON.stringify(edges));
  
  for (let i = insertIdx; i < nodes.length; i++) currentNodes[i].x += spacing; 
  currentNodes.push(newNode);
  const backlink = currentEdges.find((e: any) => e.curveOffset);
  if (backlink) backlink.curveOffset = 180;

  frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 1: Allocate newNode(${insertVal}).` });

  if (insertIdx === 0) {
    for (let i = 0; i < nodes.length; i++) {
      const stepNodes = JSON.parse(JSON.stringify(currentNodes)); stepNodes[i].pointer = 'curr (finding tail)';
      frames.push({ type: 'node', nodes: stepNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Traversing to find tail...` });
    }
    const tailId = `n${arr.length - 1}`;
    currentNodes.find((n: any) => n.id === tailId).pointer = 'tail';
    currentEdges.push({ source: 'new', target: 'n0', bidirectional: true, highlight: true });
    frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 2: Wire newNode <-> head.` });
    
    currentEdges = currentEdges.filter((e: any) => !e.curveOffset);
    currentEdges.push({ source: tailId, target: 'new', curveOffset: 180, bidirectional: true, highlight: true });
    frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 3: Wire tail <-> newNode.` });
  } else {
    for (let i = 0; i < insertIdx - 1; i++) {
      const stepNodes = JSON.parse(JSON.stringify(currentNodes)); stepNodes[i].pointer = 'curr';
      frames.push({ type: 'node', nodes: stepNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Searching for insertion point...` });
    }
    const prevId = `n${insertIdx - 1}`;
    currentNodes.find((n: any) => n.id === prevId).pointer = 'prev';
    
    if (insertIdx === arr.length) {
      currentEdges = currentEdges.filter((e: any) => !e.curveOffset);
      currentEdges.push({ source: 'new', target: 'n0', curveOffset: 180, bidirectional: true, highlight: true });
      frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 2: Wire newNode <-> head (Backlink).` });
      currentEdges.push({ source: prevId, target: 'new', bidirectional: true, highlight: true });
    } else {
      const targetId = `n${insertIdx}`;
      currentEdges.push({ source: 'new', target: targetId, bidirectional: true, highlight: true });
      frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 2: Wire newNode <-> nextNode.` });
      currentEdges = currentEdges.filter((e: any) => !(e.source === prevId && e.target === targetId));
      currentEdges.push({ source: prevId, target: 'new', bidirectional: true, highlight: true });
    }
    frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 3: Wire prevNode <-> newNode.` });
  }

  currentNodes.find((n:any) => n.id === 'new').y = 0; 
  const cleanNodes = JSON.parse(JSON.stringify(currentNodes)); const cleanEdges = JSON.parse(JSON.stringify(currentEdges));
  cleanNodes.forEach((n: any) => { n.highlight = false; delete n.pointer; }); cleanEdges.forEach((e: any) => e.highlight = false);
  frames.push({ type: 'node', nodes: cleanNodes, edges: cleanEdges, description: `Insertion complete!` });
  return frames;
};

export const generateDCLLDeletion = (arr: number[], idx: number): SandboxFrame[] => {
  const { nodes, edges } = createDCLLBaseState(arr);
  const frames: SandboxFrame[] = [];
  if (idx < 0 || idx >= arr.length) throw new Error("Index out of bounds");
  let currentNodes = JSON.parse(JSON.stringify(nodes)); let currentEdges = JSON.parse(JSON.stringify(edges));

  if (idx === 0) {
    for (let i = 0; i < nodes.length; i++) {
      const stepNodes = JSON.parse(JSON.stringify(currentNodes)); stepNodes[i].pointer = 'curr (finding tail)';
      frames.push({ type: 'node', nodes: stepNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Traversing to find tail...` });
    }
    const tailId = `n${arr.length - 1}`;
    currentNodes.find((n: any) => n.id === tailId).pointer = 'tail';
    currentNodes[0].pointer = 'target'; currentNodes[0].highlight = true; currentNodes[0].y = 100;
    currentEdges = currentEdges.filter((e: any) => e.source !== 'n0' && e.source !== tailId);
    if (currentNodes[1]) {
        currentNodes[1].pointer = 'new head';
        currentEdges.push({ source: tailId, target: 'n1', curveOffset: 180, bidirectional: true, highlight: true });
    }
    frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Wired tail <-> newHead. Old head bypassed.` });
  } else {
    for (let i = 0; i < idx - 1; i++) {
      const stepNodes = JSON.parse(JSON.stringify(currentNodes)); stepNodes[i].pointer = 'curr';
      frames.push({ type: 'node', nodes: stepNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Searching for node to delete...` });
    }
    const prevId = `n${idx - 1}`; const currId = `n${idx}`; const nextId = idx === arr.length - 1 ? 'n0' : `n${idx + 1}`; 
    currentNodes.find((n: any) => n.id === prevId).pointer = 'prev';
    currentNodes.find((n: any) => n.id === currId).pointer = 'target'; currentNodes.find((n: any) => n.id === currId).highlight = true;

    currentEdges = currentEdges.filter((e: any) => e.source !== prevId && e.source !== currId);
    currentEdges.push({ source: prevId, target: nextId, curveOffset: idx === arr.length - 1 ? 180 : undefined, bidirectional: true, highlight: true });
    currentNodes.find((n: any) => n.id === currId).y = 100; currentNodes.find((n: any) => n.id === currId).pointer = 'orphaned';
    frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Wired prev <-> next, bypassing target.` });
  }

  const finalNodes = currentNodes.filter((n: any) => n.pointer !== 'orphaned');
  finalNodes.forEach((n: any) => { n.highlight = false; delete n.pointer; }); currentEdges.forEach((e: any) => e.highlight = false);
  frames.push({ type: 'node', nodes: finalNodes, edges: currentEdges, description: `Deletion complete!` });
  return frames;
};