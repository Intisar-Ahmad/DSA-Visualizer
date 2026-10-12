import type { SandboxFrame } from '../../types/sandbox';

// --- CIRCULAR LAYOUT ENGINE ---
const layoutGraph = (nodesList: string[], edgesList: {u: string, v: string}[]): { nodes: any[], edges: any[] } => {
  const radius = Math.max(140, nodesList.length * 25);
  
  // Arrange nodes in a perfect circle using trigonometry
  const nodes = nodesList.map((id, i) => {
    const theta = (i / nodesList.length) * 2 * Math.PI - Math.PI / 2; // Start at top
    return {
      id, 
      val: id,
      x: radius * Math.cos(theta),
      y: radius * Math.sin(theta)
    };
  });
  
  // Create undirected edges
  const edges = edgesList.map(e => ({
    source: e.u, 
    target: e.v, 
    undirected: true 
  }));
  
  return { nodes, edges };
};

const parseInitialEdges = (edgeStrs: string[]) => {
  const edges = edgeStrs.map(s => {
    const parts = s.split('-');
    if (parts.length === 2) return { u: parts[0].trim(), v: parts[1].trim() };
    return null;
  }).filter(e => e !== null) as {u: string, v: string}[];
  
  const nodesSet = new Set<string>();
  edges.forEach(e => { nodesSet.add(e.u); nodesSet.add(e.v); });
  // Allow standalone nodes if the user types just "A"
  edgeStrs.forEach(s => { if (!s.includes('-')) nodesSet.add(s.trim()); });
  
  return { nodesList: Array.from(nodesSet).sort(), edgesList: edges };
};

// --- GENERATORS ---
export const generateGraphCreation = (edgeStrs: string[]): SandboxFrame[] => {
  const { nodesList, edgesList } = parseInitialEdges(edgeStrs);
  const frames: SandboxFrame[] = [{ type: 'node', nodes: [] as any[], edges: [] as any[], description: "Initializing empty Adjacency List..." }];
  
  const currentNodes: string[] = [];
  const currentEdges: {u: string, v: string}[] = [];

  // Step 1: Allocate all nodes
  for (const node of nodesList) {
    currentNodes.push(node);
    const layout = layoutGraph(currentNodes, currentEdges);
    layout.nodes.find(n => n.id === node)!.highlight = true;
    frames.push({ type: 'node', nodes: layout.nodes, edges: layout.edges, description: `Allocated Node ${node} in memory.` });
  }

  // Step 2: Wire all edges
  for (const edge of edgesList) {
    currentEdges.push(edge);
    const layout = layoutGraph(currentNodes, currentEdges);
    layout.edges.find(e => e.source === edge.u && e.target === edge.v)!.highlight = true;
    frames.push({ type: 'node', nodes: layout.nodes, edges: layout.edges, description: `Wired edge between ${edge.u} and ${edge.v}.` });
  }

  const finalLayout = layoutGraph(nodesList, edgesList);
  frames.push({ type: 'node', nodes: finalLayout.nodes, edges: finalLayout.edges, description: "Graph Creation complete." });
  return frames;
};

export const generateGraphModify = (edgeStrs: string[], cmdStr: string): SandboxFrame[] => {
  let { nodesList, edgesList } = parseInitialEdges(edgeStrs);
  const frames: SandboxFrame[] = [];
  
  const pushFrame = (desc: string, hNodes: string[] = [], hEdges: {u: string, v: string}[] = []) => {
    const layout = layoutGraph(nodesList, edgesList);
    hNodes.forEach(id => { const n = layout.nodes.find(x => x.id === id); if (n) n.highlight = true; });
    hEdges.forEach(e => { const edge = layout.edges.find(x => (x.source === e.u && x.target === e.v) || (x.source === e.v && x.target === e.u)); if (edge) edge.highlight = true; });
    frames.push({ type: 'node', nodes: layout.nodes, edges: layout.edges, description: desc });
  };

  pushFrame(`Initial Graph State.`);
  
  // Split commands by comma and clean them up
  const commands = cmdStr.split(',').map(c => c.trim()).filter(c => c);

  for (const cmd of commands) {
    if (cmd.startsWith('+')) {
      const body = cmd.slice(1).trim();
      if (body.includes('-')) {
        // Add Edge
        const [u, v] = body.split('-').map(s => s.trim());
        if (!nodesList.includes(u)) { nodesList.push(u); pushFrame(`Node ${u} did not exist. Allocated ${u}.`, [u]); }
        if (!nodesList.includes(v)) { nodesList.push(v); pushFrame(`Node ${v} did not exist. Allocated ${v}.`, [v]); }
        
        const exists = edgesList.some(e => (e.u === u && e.v === v) || (e.u === v && e.v === u));
        if (!exists) {
          edgesList.push({u, v});
          pushFrame(`Added edge between ${u} and ${v}.`, [u, v], [{u, v}]);
        } else {
          pushFrame(`Edge ${u}-${v} already exists.`, [u, v], [{u, v}]);
        }
      } else {
        // Add Node
        if (!nodesList.includes(body)) {
          nodesList.push(body);
          pushFrame(`Added standalone Node ${body}.`, [body]);
        } else {
          pushFrame(`Node ${body} already exists.`, [body]);
        }
      }
    } else if (cmd.startsWith('-')) {
      const body = cmd.slice(1).trim();
      if (body.includes('-')) {
        // Remove Edge
        const [u, v] = body.split('-').map(s => s.trim());
        const eIndex = edgesList.findIndex(e => (e.u === u && e.v === v) || (e.u === v && e.v === u));
        if (eIndex !== -1) {
          pushFrame(`Targeting edge ${u}-${v} for deletion...`, [], [{u, v}]);
          edgesList.splice(eIndex, 1);
          pushFrame(`Removed edge ${u}-${v}.`);
        } else {
          pushFrame(`Edge ${u}-${v} does not exist.`);
        }
      } else {
        // Remove Node
        if (nodesList.includes(body)) {
          pushFrame(`Targeting Node ${body} for deletion. Must remove all connected edges first!`, [body]);
          
          const connectedEdges = edgesList.filter(e => e.u === body || e.v === body);
          for (const e of connectedEdges) {
            pushFrame(`Severing edge connected to neighbor...`, [body], [e]);
            edgesList = edgesList.filter(x => x !== e);
            pushFrame(`Edge severed.`, [body]);
          }
          
          nodesList = nodesList.filter(n => n !== body);
          pushFrame(`All edges removed. Node ${body} successfully deallocated.`);
        } else {
          pushFrame(`Node ${body} does not exist.`);
        }
      }
    } else {
      pushFrame(`Unknown command format: '${cmd}'. Use +A, -A, +A-B, or -A-B.`);
    }
  }

  pushFrame(`All modifications complete.`);
  return frames;
};

// Dummy generator for Traversal so it doesn't crash before the UI intercept
export const generateGraphTraversalDummy = (): SandboxFrame[] => {
  return [{ type: 'node', nodes: [], edges: [], description: "Redirecting..." }];
};