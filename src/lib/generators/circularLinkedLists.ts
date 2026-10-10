import type { SandboxFrame } from '../../types/sandbox';

const createCLLBaseState = (arr: number[]) => {
    const spacing = 160;
    const totalWidth = (arr.length - 1) * spacing;
    const startX = -(totalWidth / 2);

    const nodes: any[] = arr.map((val, idx) => ({ id: `n${idx}`, val, x: startX + (idx * spacing), y: 0 }));
    const edges: any[] = arr.slice(0, -1).map((_, idx) => ({ source: `n${idx}`, target: `n${idx + 1}` }));

    // The circular backlink!
    if (arr.length > 1) {
        edges.push({ source: `n${arr.length - 1}`, target: `n0`, curveOffset: 120 });
    }
    return { nodes, edges, startX, spacing };
};

export const generateCLLCreation = (arr: number[]): SandboxFrame[] => {
    const { nodes, edges } = createCLLBaseState(arr);
    const frames: SandboxFrame[] = [{ type: 'node', nodes: [], edges: [], description: "Allocating nodes dynamically in memory..." }];

    const currentNodes: any[] = [];
    const currentEdges: any[] = [];

    for (let i = 0; i < nodes.length; i++) {
        const newNode = JSON.parse(JSON.stringify(nodes[i]));
        newNode.highlight = true;
        newNode.pointer = i === 0 ? 'head' : 'curr';
        currentNodes.push(newNode);

        if (i > 0) {
            currentNodes[i - 1].pointer = undefined;
            currentNodes[i - 1].highlight = false;
            frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Allocated Node(${arr[i]}).` });

            currentEdges.push(edges[i - 1]);
            const activeEdges = JSON.parse(JSON.stringify(currentEdges));
            activeEdges[activeEdges.length - 1].highlight = true;
            frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: activeEdges, description: `Linked previous node to Node(${arr[i]}).` });
        } else {
            frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Allocated Head Node(${arr[i]}).` });
        }
    }

    // Final step: Circular link!
    if (arr.length > 1) {
        currentEdges.push(edges[edges.length - 1]);
        const finalEdges = JSON.parse(JSON.stringify(currentEdges));
        finalEdges[finalEdges.length - 1].highlight = true;
        frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: finalEdges, description: `CRITICAL STEP: Tail node points back to the Head node!` });
    }

    frames.push({ type: 'node', nodes, edges, description: "Singly Circular Linked List creation complete." });
    return frames;
};

export const generateCLLTraversal = (arr: number[]): SandboxFrame[] => {
    const { nodes, edges } = createCLLBaseState(arr);
    const frames: SandboxFrame[] = [{ type: 'node', nodes: JSON.parse(JSON.stringify(nodes)), edges, description: "Starting traversal from head..." }];

    for (let i = 0; i <= nodes.length; i++) {
        const actualIdx = i % nodes.length;
        const currentNodes = JSON.parse(JSON.stringify(nodes));
        currentNodes[actualIdx].highlight = true;
        currentNodes[actualIdx].pointer = 'curr';

        const currentEdges = JSON.parse(JSON.stringify(edges));
        if (i > 0) currentEdges[i - 1].highlight = true;

        if (i === nodes.length) {
            frames.push({ type: 'node', nodes: currentNodes, edges: currentEdges, description: `Traversed the curved backlink! curr has looped back to Head Node(${arr[actualIdx]}).` });
        } else {
            frames.push({ type: 'node', nodes: currentNodes, edges: currentEdges, description: `Traversing... curr is at Node(${arr[actualIdx]})` });
        }
    }
    frames.push({ type: 'node', nodes, edges, description: "Traversal complete." });
    return frames;
};

export const generateCLLInsertion = (arr: number[], insertVal: number, insertIdx: number): SandboxFrame[] => {
    const { nodes, edges, startX, spacing } = createCLLBaseState(arr);
    const frames: SandboxFrame[] = [];

    if (insertIdx < 0 || insertIdx > arr.length) throw new Error("Index out of bounds");
    frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)), description: `Ready to insert ${insertVal} at index ${insertIdx}` });

    const newNode = { id: 'new', val: insertVal, x: startX + (insertIdx * spacing) - (spacing / 2), y: -100, pointer: 'newNode', highlight: true };
    let currentNodes = JSON.parse(JSON.stringify(nodes));
    let currentEdges = JSON.parse(JSON.stringify(edges));

    for (let i = insertIdx; i < nodes.length; i++) currentNodes[i].x += spacing;
    currentNodes.push(newNode);

    const backlink = currentEdges.find((e: any) => e.curveOffset);
    if (backlink) backlink.curveOffset = 180;

    frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 1: Allocate newNode(${insertVal}).` });

    if (insertIdx === 0) {
        frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Inserting at Head. In a circular list, we MUST find the tail to update the loop.` });
        for (let i = 0; i < nodes.length; i++) {
            const stepNodes = JSON.parse(JSON.stringify(currentNodes));
            stepNodes[i].pointer = 'curr (finding tail)';
            frames.push({ type: 'node', nodes: stepNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Traversing to find tail...` });
        }
        const tailId = `n${arr.length - 1}`;
        const stepNodes = JSON.parse(JSON.stringify(currentNodes));
        stepNodes.find((n: any) => n.id === tailId).pointer = 'tail';
        frames.push({ type: 'node', nodes: stepNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Found tail Node(${arr[arr.length - 1]}).` });

        currentEdges.push({ source: 'new', target: 'n0', highlight: true });
        frames.push({ type: 'node', nodes: stepNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 2: newNode.next = head.` });

        currentEdges = currentEdges.filter((e: any) => !e.curveOffset);
        currentEdges.push({ source: tailId, target: 'new', curveOffset: 180, highlight: true });
        frames.push({ type: 'node', nodes: stepNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 3: tail.next = newNode.` });

        const finalNodes = JSON.parse(JSON.stringify(stepNodes));
        finalNodes.find((n: any) => n.id === 'new').y = 0;
        frames.push({ type: 'node', nodes: finalNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 4: Update head pointer. Insertion complete.` });
    } else {
        for (let i = 0; i < insertIdx - 1; i++) {
            const stepNodes = JSON.parse(JSON.stringify(currentNodes));
            stepNodes[i].pointer = 'curr';
            frames.push({ type: 'node', nodes: stepNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Traversing... searching for insertion point.` });
        }
        const prevId = `n${insertIdx - 1}`;
        const stepNodes = JSON.parse(JSON.stringify(currentNodes));
        stepNodes.find((n: any) => n.id === prevId).pointer = 'prev';
        frames.push({ type: 'node', nodes: stepNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Found prev Node(${arr[insertIdx - 1]}).` });

        if (insertIdx === arr.length) {
            currentEdges = currentEdges.filter((e: any) => !e.curveOffset);
            currentEdges.push({ source: 'new', target: 'n0', curveOffset: 180, highlight: true });
            frames.push({ type: 'node', nodes: stepNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 2: newNode.next = head (New backlink).` });
            currentEdges.push({ source: prevId, target: 'new', highlight: true });
            frames.push({ type: 'node', nodes: stepNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 3: prev.next = newNode.` });
        } else {
            const targetId = `n${insertIdx}`;
            currentEdges.push({ source: 'new', target: targetId, highlight: true });
            frames.push({ type: 'node', nodes: stepNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 2: Point newNode.next to prev.next.` });
            currentEdges = currentEdges.filter((e: any) => !(e.source === prevId && e.target === targetId));
            currentEdges.push({ source: prevId, target: 'new', highlight: true });
            frames.push({ type: 'node', nodes: stepNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 3: Point prev.next to newNode.` });
        }
        const finalNodes = JSON.parse(JSON.stringify(stepNodes));
        finalNodes.find((n: any) => n.id === 'new').y = 0;
        frames.push({ type: 'node', nodes: finalNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Insertion complete.` });
    }

    const cleanNodes = JSON.parse(JSON.stringify(frames[frames.length - 1].nodes));
    const cleanEdges = JSON.parse(JSON.stringify(frames[frames.length - 1].edges));
    cleanNodes.forEach((n: any) => { n.highlight = false; delete n.pointer; });
    cleanEdges.forEach((e: any) => e.highlight = false);
    frames.push({ type: 'node', nodes: cleanNodes, edges: cleanEdges, description: `Insertion complete!` });
    return frames;
};

export const generateCLLDeletion = (arr: number[], idx: number): SandboxFrame[] => {
    const { nodes, edges } = createCLLBaseState(arr);
    const frames: SandboxFrame[] = [];

    if (idx < 0 || idx >= arr.length) throw new Error("Index out of bounds");
    frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)), description: `Preparing to delete node at index ${idx}.` });

    let currentNodes = JSON.parse(JSON.stringify(nodes));
    let currentEdges = JSON.parse(JSON.stringify(edges));

    if (idx === 0) {
        frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Target is head. In a Circular list, we MUST find the tail to update the backlink.` });

        for (let i = 0; i < nodes.length; i++) {
            const stepNodes = JSON.parse(JSON.stringify(currentNodes));
            stepNodes[i].pointer = 'curr (finding tail)';
            frames.push({ type: 'node', nodes: stepNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Traversing to find tail...` });
        }

        const tailId = `n${arr.length - 1}`;
        currentNodes.find((n: any) => n.id === tailId).pointer = 'tail';
        currentNodes[0].pointer = 'target';
        currentNodes[0].highlight = true;
        frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Found tail. Ready to bypass head.` });

        currentNodes[0].y = 100;
        currentNodes[0].pointer = 'orphaned';
        currentEdges = currentEdges.filter((e: any) => e.source !== 'n0' && e.source !== tailId);

        if (currentNodes[1]) {
            currentNodes[1].pointer = 'new head';
            currentEdges.push({ source: tailId, target: 'n1', curveOffset: 180, highlight: true });
        }

        frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 2: tail.next points to new head. Old head is orphaned.` });

    } else {
        for (let i = 0; i < idx - 1; i++) {
            const stepNodes = JSON.parse(JSON.stringify(currentNodes));
            stepNodes[i].pointer = 'curr';
            frames.push({ type: 'node', nodes: stepNodes, edges: JSON.parse(JSON.stringify(currentEdges)), description: `Traversing... searching for node to delete.` });
        }

        const prevId = `n${idx - 1}`;
        const currId = `n${idx}`;
        const nextId = idx === arr.length - 1 ? 'n0' : `n${idx + 1}`;

        currentNodes.find((n: any) => n.id === prevId).pointer = 'prev';
        currentNodes.find((n: any) => n.id === currId).pointer = 'curr (target)';
        currentNodes.find((n: any) => n.id === currId).highlight = true;
        frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 1: Found prev Node and target Node.` });

        currentEdges = currentEdges.filter((e: any) => e.source !== prevId && e.source !== currId);
        const isTail = idx === arr.length - 1;
        currentEdges.push({
            source: prevId, target: nextId,
            curveOffset: isTail ? 180 : undefined,
            highlight: true
        });

        frames.push({ type: 'node', nodes: JSON.parse(JSON.stringify(currentNodes)), edges: JSON.parse(JSON.stringify(currentEdges)), description: `Step 2: Bypass target by pointing prev.next directly to curr.next.` });

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