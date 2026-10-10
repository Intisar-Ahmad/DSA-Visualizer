import type { SandboxFrame } from '../../types/sandbox';

const createDLLBaseState = (arr: number[]) => {
  const spacing = 160;
  const totalWidth = (arr.length - 1) * spacing;
  const startX = -(totalWidth / 2); 
  
  const nodes = arr.map((val, idx) => ({ 
    id: `n${idx}`, val, x: startX + (idx * spacing), y: 0 
  }));
  // Bidirectional edges for Doubly Linked Lists!
  const edges = arr.slice(0, -1).map((_, idx) => ({ 
    source: `n${idx}`, target: `n${idx + 1}`, bidirectional: true 
  }));
  return { nodes, edges, startX, spacing };
};

export const generateDLLCreation = (arr: number[]): SandboxFrame[] => {
  const { nodes, edges } = createDLLBaseState(arr);
  const frames: SandboxFrame[] = [];
  
  frames.push({ type: 'node', nodes: [], edges: [], description: "Allocating doubly linked nodes..." });
  
  const currentNodes: any[] = [];
  const currentEdges: any[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const newNode = JSON.parse(JSON.stringify(nodes[i]));
    newNode.highlight = true;
    newNode.pointer = i === 0 ? 'head' : 'curr';
    currentNodes.push(newNode);
    
    if (i > 0) {
      currentNodes[i-1].pointer = undefined;
      currentNodes[i-1].highlight = false;
      frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Allocated Node(${arr[i]}).` });
      
      currentEdges.push(edges[i-1]);
      const activeEdges = JSON.parse(JSON.stringify(currentEdges));
      activeEdges[activeEdges.length - 1].highlight = true;
      
      frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: activeEdges, description: `Wired curr.next and newNode.prev.` });
    } else {
      frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Allocated Head Node(${arr[i]}).` });
    }
  }
  frames.push({ type: 'node', nodes, edges, description: "Doubly Linked List creation complete." });
  return frames;
};

export const generateDLLTraversal = (arr: number[]): SandboxFrame[] => {
  const { nodes, edges } = createDLLBaseState(arr);
  const frames: SandboxFrame[] = [{ type: 'node', nodes: JSON.parse(JSON.stringify(nodes)), edges, description: "Starting forward traversal..." }];
  
  for (let i = 0; i < nodes.length; i++) {
    const currentNodes = JSON.parse(JSON.stringify(nodes));
    currentNodes[i].highlight = true;
    currentNodes[i].pointer = 'curr';
    
    const currentEdges = JSON.parse(JSON.stringify(edges));
    if (i > 0) currentEdges[i - 1].highlight = true;
    
    frames.push({ type: 'node', nodes: currentNodes, edges: currentEdges, description: `Traversing... curr is at Node(${arr[i]})` });
  }
  frames.push({ type: 'node', nodes, edges, description: "Traversal complete." });
  return frames;
};

export const generateDLLInsertion = (arr: number[], insertVal: number, insertIdx: number): SandboxFrame[] => {
  const { nodes, edges, startX, spacing } = createDLLBaseState(arr);
  const frames: SandboxFrame[] = [];
  
  if (insertIdx < 0 || insertIdx > arr.length) throw new Error("Index out of bounds");
  frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)), description: `Ready to insert ${insertVal} at index ${insertIdx}` });
  
  const newNode = { id: 'new', val: insertVal, x: startX + (insertIdx * spacing) - (spacing / 2), y: -100, pointer: 'newNode', highlight: true };
  let currentNodes = JSON.parse(JSON.stringify(nodes));
  let currentEdges = JSON.parse(JSON.stringify(edges));
  
  for (let i = insertIdx; i < nodes.length; i++) currentNodes[i].x += spacing; 
  currentNodes.push(newNode);
  frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 1: Allocate newNode(${insertVal}).` });

  if (insertIdx === 0) {
    currentEdges.push({ source: 'new', target: 'n0', bidirectional: true, highlight: true });
    frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 2: Wire newNode.next and oldHead.prev.` });
    const finalNodes = JSON.parse(JSON.stringify(currentNodes));
    finalNodes.find((n:any) => n.id === 'new').y = 0; 
    frames.push({ type: 'node', nodes: finalNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 3: Update head pointer. Insertion complete.` });
  } else {
    for (let i = 0; i < insertIdx - 1; i++) {
      const stepNodes = JSON.parse(JSON.stringify(currentNodes));
      stepNodes[i].pointer = 'curr';
      frames.push({ type: 'node', nodes: stepNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Traversing... searching for insertion point.` });
    }
    const prevId = `n${insertIdx - 1}`;
    const targetId = insertIdx === arr.length ? null : `n${insertIdx}`;
    
    const stepNodes = JSON.parse(JSON.stringify(currentNodes));
    stepNodes.find((n: any) => n.id === prevId).pointer = 'prev';
    frames.push({ type: 'node', nodes: stepNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 2: Found prev Node(${arr[insertIdx-1]}).` });

    if (targetId) {
      currentEdges.push({ source: 'new', target: targetId, bidirectional: true, highlight: true });
      frames.push({ type: 'node', nodes: stepNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 3: Wire newNode <-> target node.` });
      currentEdges = currentEdges.filter((e: any) => !(e.source === prevId && e.target === targetId));
    }
    
    currentEdges.push({ source: prevId, target: 'new', bidirectional: true, highlight: true });
    frames.push({ type: 'node', nodes: stepNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 4: Wire prev <-> newNode.` });
    
    const finalNodes = JSON.parse(JSON.stringify(stepNodes));
    finalNodes.find((n:any) => n.id === 'new').y = 0; 
    frames.push({ type: 'node', nodes: finalNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 5: Node successfully inserted.` });
  }

  const cleanNodes = JSON.parse(JSON.stringify(frames[frames.length - 1].nodes));
  const cleanEdges = JSON.parse(JSON.stringify(frames[frames.length - 1].edges));
  cleanNodes.forEach((n: any) => { n.highlight = false; delete n.pointer; });
  cleanEdges.forEach((e: any) => e.highlight = false);
  frames.push({ type: 'node', nodes: cleanNodes, edges: cleanEdges, description: `Insertion complete!` });
  return frames;
};

export const generateDLLDeletion = (arr: number[], idx: number): SandboxFrame[] => {
  const { nodes, edges } = createDLLBaseState(arr);
  const frames: SandboxFrame[] = [];
  
  if (idx < 0 || idx >= arr.length) throw new Error("Index out of bounds");
  frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)), description: `Preparing to delete node at index ${idx}.` });
  
  let currentNodes = JSON.parse(JSON.stringify(nodes));
  let currentEdges = JSON.parse(JSON.stringify(edges));

  if (idx === 0) {
    currentNodes[0].highlight = true;
    currentNodes[0].pointer = 'head';
    frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 1: Target is head Node(${arr[0]}).` });
    currentNodes[0].y = 100;
    currentNodes[0].pointer = 'orphaned';
    currentEdges = currentEdges.filter((e: any) => e.source !== 'n0');
    if (currentNodes[1]) currentNodes[1].pointer = 'new head';
    frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 2: Head updated. Old head is orphaned.` });
  } else {
    for (let i = 0; i < idx - 1; i++) {
      const stepNodes = JSON.parse(JSON.stringify(currentNodes));
      stepNodes[i].pointer = 'curr';
      frames.push({ type: 'node', nodes: stepNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Traversing... searching for node to delete.` });
    }
    const prevId = `n${idx - 1}`;
    const currId = `n${idx}`;
    const nextId = idx === arr.length - 1 ? null : `n${idx + 1}`;
    
    currentNodes.find((n: any) => n.id === prevId).pointer = 'prev';
    currentNodes.find((n: any) => n.id === currId).pointer = 'curr (target)';
    currentNodes.find((n: any) => n.id === currId).highlight = true;
    frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 1: Found prev Node and target Node.` });

    currentEdges = currentEdges.filter((e: any) => e.source !== prevId && e.source !== currId && e.target !== currId);
    if (nextId) {
      currentEdges.push({ source: prevId, target: nextId, bidirectional: true, highlight: true });
      frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 2: Wire prev.next and next.prev directly to each other, bypassing target.` });
    } else {
      frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 2: Target is tail. prev.next becomes null.` });
    }

    currentNodes.find((n: any) => n.id === currId).y = 100;
    currentNodes.find((n: any) => n.id === currId).pointer = 'orphaned';
    frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 3: Target node is fully detached and awaits Garbage Collection.` });
  }

  const finalNodes = currentNodes.filter((n: any) => n.pointer !== 'orphaned');
  finalNodes.forEach((n: any) => { n.highlight = false; delete n.pointer; });
  currentEdges.forEach((e: any) => e.highlight = false);
  frames.push({ type: 'node', nodes: finalNodes, edges: currentEdges, description: `Deletion complete!` });
  return frames;
};