import type { SandboxFrame } from '../../types/sandbox';

const parseGraph = (edgeStrs: string[]) => {
  const edgesList = edgeStrs.map(s => {
    const parts = s.split('-');
    if (parts.length === 2) return { u: parts[0].trim(), v: parts[1].trim() };
    return null;
  }).filter(e => e !== null) as {u: string, v: string}[];
  
  const nodesSet = new Set<string>();
  edgesList.forEach(e => { nodesSet.add(e.u); nodesSet.add(e.v); });
  edgeStrs.forEach(s => { if (!s.includes('-')) nodesSet.add(s.trim()); });
  
  const nodesList = Array.from(nodesSet).sort();
  
  // Build Adjacency List for traversal
  const adjList: Record<string, string[]> = {};
  nodesList.forEach(n => adjList[n] = []);
  edgesList.forEach(e => {
    adjList[e.u].push(e.v);
    adjList[e.v].push(e.u); // Undirected
  });

  // Sort neighbors alphabetically for predictable traversal
  Object.keys(adjList).forEach(k => adjList[k].sort());

  return { nodesList, edgesList, adjList };
};

const layoutGraph = (nodesList: string[], edgesList: {u: string, v: string}[]): { nodes: any[], edges: any[] } => {
  const radius = Math.max(140, nodesList.length * 25);
  const nodes = nodesList.map((id, i) => {
    const theta = (i / nodesList.length) * 2 * Math.PI - Math.PI / 2;
    return { id, val: id, x: radius * Math.cos(theta), y: radius * Math.sin(theta) };
  });
  
  const edges = edgesList.map(e => ({ source: e.u, target: e.v, undirected: true }));
  return { nodes, edges };
};

export const generateGraphBFS = (edgeStrs: string[], startNode: string): SandboxFrame[] => {
  const { nodesList, edgesList, adjList } = parseGraph(edgeStrs);
  const frames: SandboxFrame[] = [];
  const visitedArr: string[] = [];

  const pushFrame = (desc: string, hNodes: string[] = [], hEdges: {u: string, v: string}[] = [], ptrs: Record<string, string> = {}) => {
    const layout = layoutGraph(nodesList, edgesList);
    hNodes.forEach(id => { const n = layout.nodes.find(x => x.id === id); if (n) n.highlight = true; });
    Object.entries(ptrs).forEach(([id, ptr]) => { const n = layout.nodes.find(x => x.id === id); if (n) n.pointer = ptr; });
    hEdges.forEach(e => { const edge = layout.edges.find(x => (x.source === e.u && x.target === e.v) || (x.source === e.v && x.target === e.u)); if (edge) edge.highlight = true; });
    
    frames.push({ type: 'node', nodes: layout.nodes, edges: layout.edges, array: [...visitedArr], description: desc });
  };

  if (!nodesList.includes(startNode)) {
    pushFrame(`Error: Start node '${startNode}' does not exist in the graph.`);
    return frames;
  }

  pushFrame(`Starting BFS from node ${startNode}...`, [startNode], [], { [startNode]: 'start' });

  const queue: string[] = [startNode];
  const visitedSet = new Set<string>([startNode]);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    visitedArr.push(curr);
    pushFrame(`Dequeued ${curr}. Exploring neighbors...`, [curr], [], { [curr]: 'curr' });

    for (const neighbor of adjList[curr]) {
      pushFrame(`Checking neighbor ${neighbor} of ${curr}...`, [curr, neighbor], [{u: curr, v: neighbor}], { [curr]: 'curr', [neighbor]: 'neighbor' });
      
      if (!visitedSet.has(neighbor)) {
        visitedSet.add(neighbor);
        queue.push(neighbor);
        pushFrame(`${neighbor} is unvisited! Marked as visited and enqueued.`, [neighbor], [{u: curr, v: neighbor}], { [neighbor]: 'enqueued' });
      } else {
        pushFrame(`${neighbor} is already visited. Skipping.`, [neighbor], [{u: curr, v: neighbor}]);
      }
    }
  }

  pushFrame(`BFS complete. Explored all reachable nodes from ${startNode}.`);
  return frames;
};

export const generateGraphDFS = (edgeStrs: string[], startNode: string): SandboxFrame[] => {
  const { nodesList, edgesList, adjList } = parseGraph(edgeStrs);
  const frames: SandboxFrame[] = [];
  const visitedArr: string[] = [];

  const pushFrame = (desc: string, hNodes: string[] = [], hEdges: {u: string, v: string}[] = [], ptrs: Record<string, string> = {}) => {
    const layout = layoutGraph(nodesList, edgesList);
    hNodes.forEach(id => { const n = layout.nodes.find(x => x.id === id); if (n) n.highlight = true; });
    Object.entries(ptrs).forEach(([id, ptr]) => { const n = layout.nodes.find(x => x.id === id); if (n) n.pointer = ptr; });
    hEdges.forEach(e => { const edge = layout.edges.find(x => (x.source === e.u && x.target === e.v) || (x.source === e.v && x.target === e.u)); if (edge) edge.highlight = true; });
    
    frames.push({ type: 'node', nodes: layout.nodes, edges: layout.edges, array: [...visitedArr], description: desc });
  };

  if (!nodesList.includes(startNode)) {
    pushFrame(`Error: Start node '${startNode}' does not exist in the graph.`);
    return frames;
  }

  pushFrame(`Starting DFS from node ${startNode}...`);
  const visitedSet = new Set<string>();

  const explore = (node: string, parent: string | null) => {
    visitedSet.add(node);
    visitedArr.push(node);
    
    const edgeHighlight = parent ? [{u: parent, v: node}] : [];
    pushFrame(`Diving into ${node}. Marked as visited.`, [node], edgeHighlight, { [node]: 'curr' });

    for (const neighbor of adjList[node]) {
      pushFrame(`Checking neighbor ${neighbor} from ${node}...`, [node, neighbor], [{u: node, v: neighbor}], { [node]: 'curr', [neighbor]: 'neighbor' });
      
      if (!visitedSet.has(neighbor)) {
        explore(neighbor, node);
        pushFrame(`Backtracked to ${node} from ${neighbor}.`, [node], [{u: node, v: neighbor}], { [node]: 'curr' });
      } else {
        pushFrame(`${neighbor} is already visited. Skipping.`, [node, neighbor], [{u: node, v: neighbor}], { [node]: 'curr' });
      }
    }
  };

  explore(startNode, null);
  pushFrame(`DFS complete. All recursive calls have resolved.`);
  return frames;
};