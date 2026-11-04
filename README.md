# Code Visualizer

> An interactive, dual-engine JavaScript execution visual debugger and algorithmic playground built with React 19, TypeScript, Acorn AST parsing, and Tailwind CSS.

Live Demo: [https://your-deployment-url.js.org](https://your-deployment-url.js.org)

---

## What Makes This Different?

Most algorithmic visualizers fall into one of two traps:
1. **Black-box animation toys:** You click "Sort" or "Insert", and hardcoded graphics move across the screen. You cannot write arbitrary code, inspect real memory addresses, or see what an interpreter is actually doing.
2. **Standard debuggers:** Breakpoints pause line-by-line, but you only get dense JSON watch trees with no spatial intuition of how pointers link together in memory.

This project bridges both worlds through a **Dual-Engine Architecture**:
- **Engine 1: The Sandboxed Runtime Engine.** Write raw, arbitrary JavaScript (classes, recursive algorithms, nested objects, references). The engine transpiles and instruments your code via an AST parser in real-time, mapping every variable, stack frame, and heap allocation to simulated hex addresses (`0x4F2A`) without running an unsafe `eval()`.
- **Engine 2: The Structural DSA Sandbox.** A dedicated playground for fundamental data structures and algorithmic routines. It features custom-designed visual topologies (e.g., dynamic open-ended vertical buckets for Stacks, infinite horizontal pipelines for Queues, circular trigonometry layouts for Graphs, and self-balancing tree node rotations).

---

## Architectural Breakdown

### 1. The Code Execution Engine (`/`)
When you run custom JavaScript:
1. **AST Transformation (`src/engine/instrumenter.ts`):** Acorn parses the input into an Abstract Syntax Tree. It normalizes single-line statements into full blocks, wraps function calls in tracking harnesses (`__pushFrame`, `__popFrame`), intercepts assignments (`__setVar`, `__trackAssign`), and monitors return values (`__trackReturn`).
2. **Deterministic Heap Emulation (`src/engine/ExecutionEngine.ts`):** As the code executes in an isolated scope, any object or array allocation is assigned a persistent virtual hex pointer. Nested objects are replaced with pointer references, creating an accurate model of heap allocations versus stack primitives.
3. **Multi-View Inspection:**
   - **Call Stack:** Displays active function frames, line numbers, and live argument bindings (e.g., `factorial(n=5)`).
   - **Execution Context:** Breaks down variable scopes across Global, Function, and Block contexts.
   - **Memory (Heap) Panel:** Lists live allocated addresses with deep inspection modals.
   - **AlgoCanvas:** Maps pointer references into directed SVG node graphs with drag-and-drop repositioning and smooth Bezier curve anchors.

### 2. The Algorithmic Sandbox (`/sandbox`)
A dedicated laboratory for running deterministic operations step-by-step:
- **Arrays & Matrices:** Contiguous memory block reallocation, element shifts, and access sweeps.
- **Linked Lists:** Singly, Doubly, Singly Circular, and Doubly Circular linked lists with pointer rewiring and garbage-collection orphaning states.
- **Stacks & Queues:** Custom renderers tailored to structure mechanics:
  - *Stack:* An open-ended vertical bucket that grows dynamically with input size, illustrating strict LIFO mechanics.
  - *Queue:* A horizontal, dual-open pipe illustrating FIFO enqueue/dequeue flows.
- **Trees:** Binary Search Trees (BST), AVL Trees (with automatic LL, RR, LR, RL balancing rotations), Red-Black Trees (recoloring and double-black fixup routines), and Min/Max Heaps (array-backed complete binary tree bubble-up/down).
- **Graphs:** Dynamic circular trigonometry layout (`Math.cos`/`Math.sin`) preventing node overlap, paired with a command-based modify engine (`+Node`, `-Node`, `+A-B`, `-A-B`).
- **Hash Maps:** Two-row key/value slot table displaying hashing mechanisms and collision handling.
- **Algorithms Suite:**
  - *Searching:* Linear Search, Binary Search with active window tracking.
  - *Sorting:* Bubble, Selection, Insertion, Merge Sort, and Quick Sort with recursive 2D branch-and-reconstruct animations.
  - *Traversals:* Pre-order, In-order, Post-order, BFS, and DFS for both Trees and Graphs.

---

## Visual & Animation Architecture

- **Predictable Coordinates:** Visualizations rely on deterministic mathematical layouts rather than unstable force-directed simulations. Nodes maintain fixed, readable offsets across frame transitions.
- **Decoupled Snapshots (`SandboxFrame`):** Generators emit immutable frame arrays containing current node coordinates, highlighted indices, active pointers, and descriptive narrative logs.
- **Frame-Accurate Controls:** Stepping forward, stepping backward, scrubbers, and variable playback speeds (0.5x to 4x) operate without race conditions or memory leaks.

---

## Sample Code for the Execution Engine

Test the live execution visualizer by pasting these examples into the code editor on the home page:

### Demo Code 1: Arrays, Matrices & Hash Table Chaining
```javascript
// 1. Standard Array & String (Array of chars)
const arr = [10, 20, 30, 40, 50];
const strArr = ['B', 'H', 'I', 'N', 'O'];

// 2. Matrix (2D Array)
const matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];

// 3. Hash Table (Chaining with Linked Lists)
class HashNode {
  constructor(key, val) {
    this.key = key;
    this.val = val;
    this.next = null;
  }
}

class HashTable {
  constructor(size) {
    this.buckets = new Array(size).fill(null);
  }
  
  insert(key, val) {
    const idx = key.length % this.buckets.length;
    const newNode = new HashNode(key, val);
    if (!this.buckets[idx]) {
      this.buckets[idx] = newNode;
    } else {
      let curr = this.buckets[idx];
      while (curr.next) curr = curr.next;
      curr.next = newNode;
    }
  }
}

const ht = new HashTable(3);
ht.insert("dev", "Intisar");
ht.insert("app", "Bevin");
ht.insert("chat", "BhinoChats"); // Collision chaining test
```

### Demo Code 2: Singly Linked List Implementation

```javascript

class ListNode {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

class SinglyLinkedList {
  constructor() {
    this.head = null;
  }
  
  append(val) {
    const newNode = new ListNode(val);
    if (!this.head) {
      this.head = newNode;
      return;
    }
    let curr = this.head;
    while (curr.next) {
      curr = curr.next;
    }
    curr.next = newNode;
  }
}

const list = new SinglyLinkedList();
list.append("Node A");
list.append("Node B");
list.append("Node C");
list.append("Node D");
```

### Roadmap
- Weighted & Directed Graph edge rendering

- Dijkstra's Algorithm & A* Pathfinding visualizers

- Automated Heap Memory Topology Detection (inferring Linked List vs. Tree vs. Graph structures directly from raw code)

- Trie (Prefix Tree) & Disjoint Set Union (DSU) modules

- Dynamic programming table progression visualizers