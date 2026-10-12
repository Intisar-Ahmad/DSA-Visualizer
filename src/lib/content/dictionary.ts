export const CONTENT_DICTIONARY: Record<string, any> = {
  'arrays-Creation': {
    description: "Allocates a fixed, contiguous block of memory to store elements.",
    mechanism: "The operating system finds a continuous memory segment large enough for the requested capacity and assigns a base memory address. The array's variable points to this base address.",
    caveats: "In strict low-level languages (like C/C++), the size must be known at compile-time or allocated dynamically on the heap. Once allocated, its capacity cannot change.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(N)",
    pseudocode: `function createArray(size):
    memoryBlock = allocateMemory(size * elementSize)
    return memoryBlock`
  },

  'arrays-Traversal': {
    description: "Visits every single element in the array sequentially from the first index to the last.",
    mechanism: "Uses a loop to increment an index counter. The memory address of each element is calculated instantly using the formula: base_address + (index * element_size).",
    caveats: "Arrays have excellent spatial locality, meaning CPU caches can load contiguous chunks of memory at once, making array traversal extremely fast at the hardware level compared to linked lists.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    pseudocode: `function traverse(array):
    for index from 0 to array.length - 1:
        print array[index]`
  },

  'arrays-Insertion': {
    description: "Adds a new element at a specific index.",
    mechanism: "Because arrays are fixed-size in contiguous memory, inserting usually requires allocating a brand new, larger array, copying the old elements over, placing the new element, and then freeing the old array.",
    caveats: "Dynamic arrays (like JS arrays or C++ vectors) hide this. They pre-allocate extra capacity. If there is extra capacity, elements just shift right. If capacity is full, the expensive O(N) reallocation shown here occurs.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(N) (for reallocation)",
    pseudocode: `function insert(arr, index, value):
    newArr = allocate(arr.length + 1)
    
    for i from 0 to index - 1:
        newArr[i] = arr[i]
        
    newArr[index] = value
    
    for i from index to arr.length - 1:
        newArr[i + 1] = arr[i]
        
    return newArr`
  },

  'arrays-Deletion': {
    description: "Removes an element from a specific index and closes the gap.",
    mechanism: "The target element is overwritten, and every subsequent element to its right is shifted one position to the left to maintain contiguous memory without any empty holes.",
    caveats: "Deleting from the very end of an array is highly efficient O(1), but deleting from the beginning or middle is O(N) because of the cascading shift operations required.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    pseudocode: `function delete(arr, index):
    for i from index to arr.length - 2:
        arr[i] = arr[i + 1]
        
    decrease arr.size by 1`
  },

  'linked-lists-Creation': {
    description: "Builds a linked list node by node.",
    mechanism: "Memory is allocated for one node at a time. Each node contains data and a pointer (memory address) to the next node. Unlike arrays, these nodes are scattered randomly in the heap, not stored contiguously.",
    caveats: "Because memory isn't contiguous, you lose cache locality. The CPU has to jump around RAM to find the next node, which makes linked lists slower to traverse in practice than arrays, despite having the same O(N) theoretical complexity.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(N)",
    pseudocode: `function createList(values):
    head = new Node(values[0])
    curr = head
    
    for i from 1 to values.length - 1:
        curr.next = new Node(values[i])
        curr = curr.next
        
    return head`
  },

  'linked-lists-Traversal': {
    description: "Follows the pointers from the head node to the tail.",
    mechanism: "Starts at the head pointer and uses a temporary variable (often called 'curr') to jump from node to node until it hits 'null'.",
    caveats: "You cannot jump directly to an index (like arr[3]). To get to the 4th node, you must visit the 1st, 2nd, and 3rd nodes first.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    pseudocode: `function traverse(head):
    curr = head
    while curr is not null:
        print curr.val
        curr = curr.next`
  },

  'linked-lists-Insertion': {
    description: "Inserts a new node into the chain by rewiring pointers.",
    mechanism: "Traverses to the node right before the insertion point (prev). The new node points to prev.next, and then prev is updated to point to the new node.",
    caveats: "The insertion itself is instant O(1) because no elements need to be shifted! However, finding the insertion spot still takes O(N) time.",
    timeComplexity: "O(N) search + O(1) insert",
    spaceComplexity: "O(1)",
    pseudocode: `function insert(head, index, value):
    newNode = new Node(value)
    
    if index == 0:
        newNode.next = head
        return newNode
        
    prev = head
    for i from 0 to index - 2:
        prev = prev.next
        
    newNode.next = prev.next
    prev.next = newNode
    return head`
  },

  'linked-lists-Deletion': {
    description: "Removes a node by bypassing it.",
    mechanism: "Traverses to the node right before the target (prev). Updates prev.next to point directly to the target's next node, effectively 'orphaning' the target.",
    caveats: "Once bypassed, the unlinked node is automatically cleared from memory by the JavaScript Garbage Collector. Like insertion, no other nodes shift physically.",
    timeComplexity: "O(N) search + O(1) delete",
    spaceComplexity: "O(1)",
    pseudocode: `function delete(head, index):
    if index == 0:
        return head.next
        
    prev = head
    for i from 0 to index - 2:
        prev = prev.next
        
    curr = prev.next
    prev.next = curr.next
    
    return head`
  },
  // --- DOUBLY LINKED LISTS ---
  'linked-lists-Doubly-Creation': {
    description: "Builds a doubly linked list where each node tracks both its next and previous neighbors.",
    mechanism: "Memory is allocated node by node. Unlike a singly linked list, we store two memory addresses per node: one for the node ahead (.next) and one for the node behind (.prev).",
    caveats: "This takes up extra memory per node to store the backward pointer. However, it allows O(1) reverse traversal, which is impossible in a Singly Linked List.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(N)",
    pseudocode: `function createDoublyList(values):
    head = new Node(values[0])
    curr = head
    
    for i from 1 to values.length - 1:
        newNode = new Node(values[i])
        curr.next = newNode
        newNode.prev = curr
        curr = curr.next
        
    return head`
  },

  'linked-lists-Doubly-Traversal': {
    description: "Navigates the list. Because it's doubly linked, we can go forwards or backwards.",
    mechanism: "We use a 'curr' pointer to jump from node to node using the .next properties, exactly like a singly linked list.",
    caveats: "While standard forward traversal takes the exact same time as a Singly Linked List, if we needed to traverse from the tail to the head, we could do it instantly by following the .prev pointers.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    pseudocode: `function traverseForward(head):
    curr = head
    while curr is not null:
        print curr.val
        curr = curr.next`
  },

  'linked-lists-Doubly-Insertion': {
    description: "Inserts a node by rewiring 4 pointers instead of 2.",
    mechanism: "We find the insertion point, link the new node to its next and prev neighbors, and then update those neighbors to point back at the new node.",
    caveats: "This requires careful ordering of operations. If you overwrite a pointer too early, you lose the memory address of the rest of the list (a memory leak).",
    timeComplexity: "O(N) search + O(1) insert",
    spaceComplexity: "O(1)",
    pseudocode: `function insert(head, index, value):
    newNode = new Node(value)
    
    // ... traversal to 'prev' node ...
    
    target = prev.next
    
    // Wire new node
    newNode.next = target
    newNode.prev = prev
    
    // Wire surrounding nodes
    if target is not null:
        target.prev = newNode
    prev.next = newNode`
  },

  'linked-lists-Doubly-Deletion': {
    description: "Removes a node by connecting its previous and next neighbors directly to each other.",
    mechanism: "We find the node to delete, set its prev neighbor's .next to skip it, and its next neighbor's .prev to skip it.",
    caveats: "If we have a direct reference to the node we want to delete, deletion in a Doubly Linked List is O(1) because we instantly know its 'prev' node. In a Singly Linked List, we would still have to traverse from the head to find the 'prev' node (O(N)).",
    timeComplexity: "O(N) search + O(1) delete",
    spaceComplexity: "O(1)",
    pseudocode: `function delete(head, index):
    // ... traverse to 'target' node ...
    
    prevNode = target.prev
    nextNode = target.next
    
    if prevNode is not null:
        prevNode.next = nextNode
        
    if nextNode is not null:
        nextNode.prev = prevNode`
  },
  // --- SINGLY CIRCULAR LINKED LISTS ---

  'linked-lists-Singly Circular-Creation': {
    description: "Builds a linked list where the final node loops back to the beginning.",
    mechanism: "Memory is allocated node by node. The defining feature happens at the very end: instead of the tail pointing to 'null', its .next pointer is assigned the memory address of the head node.",
    caveats: "This forms an infinite loop! Algorithms like search or traversal must be carefully written to stop when they see the 'head' node again, otherwise they will crash the program with an infinite loop.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(N)",
    pseudocode: `function createCircular(values):
    head = new Node(values[0])
    curr = head
    
    for i from 1 to values.length - 1:
        curr.next = new Node(values[i])
        curr = curr.next
        
    curr.next = head // The Circular Link!
    return head`
  },

  'linked-lists-Singly Circular-Traversal': {
    description: "Navigates the list, proving that the tail connects back to the head.",
    mechanism: "Uses a 'curr' pointer. The loop condition is no longer 'while curr != null', but rather 'do { ... } while (curr != head)'.",
    caveats: "Circular lists are incredibly useful for applications that require constant cycling, like OS task scheduling, round-robin multiplayer turns, or media player playlists.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    pseudocode: `function traverse(head):
    if head is null: return
    
    curr = head
    do:
        print curr.val
        curr = curr.next
    while curr != head`
  },

  'linked-lists-Singly Circular-Insertion': {
    description: "Inserts a node. Inserting at the Head requires extra work.",
    mechanism: "If you insert a new Head node, you MUST traverse all the way to the Tail to update the backlink to point to the new Head. If you insert in the middle, it works exactly like a normal list.",
    caveats: "Because of the required tail update, inserting at the Head of a Singly Circular list degrades from O(1) time down to O(N) time (unless you specifically maintain a 'tail' pointer variable in your class).",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    pseudocode: `function insert(head, index, value):
    newNode = new Node(value)
    
    if index == 0:
        newNode.next = head
        // Must find tail to update the loop
        curr = head
        while curr.next != head:
            curr = curr.next
        curr.next = newNode
        return newNode
        
    // Standard insertion
    prev = head
    for i from 0 to index - 2:
        prev = prev.next
        
    newNode.next = prev.next
    prev.next = newNode
    return head`
  },

  'linked-lists-Singly Circular-Deletion': {
    description: "Removes a node from the circular list.",
    mechanism: "If deleting a middle node, it behaves like a normal singly linked list. If deleting the Head, we must traverse to the Tail to update the backlink to the new Head. If deleting the Tail, we must update the new Tail to point to the Head.",
    caveats: "Deleting the head node takes O(N) time because we have to traverse the entire list to find the tail and update its circular pointer.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    pseudocode: `function delete(head, index):
    if index == 0:
        // Must find tail to update backlink
        tail = head
        while tail.next != head:
            tail = tail.next
            
        newHead = head.next
        tail.next = newHead
        return newHead
        
    // Standard bypass deletion
    prev = head
    for i from 0 to index - 2:
        prev = prev.next
        
    prev.next = prev.next.next
    return head`
  },
  'linked-lists-Doubly Circular-Creation': { description: "Builds a circular list where nodes have both next and prev pointers.", mechanism: "Like a Doubly Linked List, but the tail's .next points to the head, and the head's .prev points to the tail.", caveats: "Maximum pointer complexity. You must manage 4 pointers per insertion/deletion and handle the infinite loop condition.", timeComplexity: "O(N)", spaceComplexity: "O(N)", pseudocode: "// DCLL Creation\ntail.next = head\nhead.prev = tail" },
  'linked-lists-Doubly Circular-Traversal': { description: "Navigates the loop in either direction.", mechanism: "You can continuously loop forward using .next, or backward using .prev.", caveats: "Always track the starting node so you know when you've completed a full revolution.", timeComplexity: "O(N)", spaceComplexity: "O(1)", pseudocode: "// DCLL Traversal\ncurr = head\ndo {\n  curr = curr.next\n} while (curr != head)" },
  'linked-lists-Doubly Circular-Insertion': { description: "Inserts a node, wiring 4 pointers.", mechanism: "If inserting at the head, you must traverse to the tail to update tail.next AND update head.prev.", caveats: "Head insertion is O(N) because we must find the tail to update its forward pointer.", timeComplexity: "O(N)", spaceComplexity: "O(1)", pseudocode: "// DCLL Head Insertion\nnewNode.next = head\nnewNode.prev = tail\ntail.next = newNode\nhead.prev = newNode" },
  'linked-lists-Doubly Circular-Deletion': { description: "Removes a node by directly connecting its prev and next neighbors.", mechanism: "target.prev.next = target.next, and target.next.prev = target.prev.", caveats: "Like insertion, deleting the head requires finding the tail to update the wrap-around pointer.", timeComplexity: "O(N)", spaceComplexity: "O(1)", pseudocode: "// DCLL Deletion\nprevNode.next = nextNode\nnextNode.prev = prevNode" },
  // --- TREES: BINARY SEARCH TREE (BST) ---
  'trees-BST-Creation': { 
    description: "Builds a Binary Search Tree node by node.", 
    mechanism: "For each value, starting from the root: if it's smaller, go left. If larger, go right. Insert when an empty spot is found.", 
    caveats: "If the input array is already sorted (e.g., 10, 20, 30), the BST degrades into a linear right-leaning Linked List. This is exactly why AVL and Red-Black trees were invented!", 
    timeComplexity: "O(N log N) avg, O(N²) worst", 
    spaceComplexity: "O(N)", 
    pseudocode: `function insert(root, val):\n  if root is null: return new Node(val)\n  if val < root.val:\n    root.left = insert(root.left, val)\n  else:\n    root.right = insert(root.right, val)\n  return root` 
  },
  'trees-BST-Search': { 
    description: "Finds a value in the tree using binary search logic.", 
    mechanism: "Compares target to current node. If smaller, go left. If larger, go right. Repeat until found or hit null.", 
    caveats: "Search speed is directly tied to the height of the tree. A perfectly balanced tree is lightning fast O(log N). A skewed tree is painfully slow O(N).", 
    timeComplexity: "O(log N) avg, O(N) worst", 
    spaceComplexity: "O(1)", 
    pseudocode: `function search(root, target):\n  if root is null or root.val == target:\n    return root\n  if target < root.val:\n    return search(root.left, target)\n  return search(root.right, target)` 
  },
  'trees-BST-Insertion': { 
    description: "Adds a single new value to the tree.", 
    mechanism: "Traverses down the tree following BST rules (left if smaller, right if larger) until it hits an empty leaf spot, then attaches the new node.", 
    caveats: "No restructuring happens in a standard BST. It just glues the new node to the bottom, which can unbalance the tree.", 
    timeComplexity: "O(log N) avg", 
    spaceComplexity: "O(1)", 
    pseudocode: `// Same recursive logic as Creation` 
  },
  'trees-BST-Deletion': { 
    description: "Removes a value while maintaining the Binary Search Tree rules.", 
    mechanism: "Case 1: Leaf node? Just delete it. Case 2: One child? Bypass the node and link the parent directly to the child. Case 3: Two children? Find the In-Order Successor (the smallest node in the right subtree), swap its value with the target, and delete the successor instead.", 
    caveats: "Case 3 is notoriously tricky. We don't physically move the nodes around; we just copy the successor's value into the target node, and then snip off the successor node.", 
    timeComplexity: "O(log N) avg", 
    spaceComplexity: "O(1)", 
    pseudocode: `function delete(root, val):\n  if root is null: return null\n  if val < root.val: root.left = delete(root.left, val)\n  else if val > root.val: root.right = delete(root.right, val)\n  else:\n    if root.left is null: return root.right\n    if root.right is null: return root.left\n    \n    // 2 Children Case\n    successor = findMin(root.right)\n    root.val = successor.val\n    root.right = delete(root.right, successor.val)\n  return root` 
  },
  // --- TREES: AVL TREE ---
  'trees-AVL-Creation': { 
    description: "Builds a strictly self-balancing Binary Search Tree.", 
    mechanism: "Every time a node is inserted, the tree traces back up to the root, updating heights. If any node's balance factor (left_height - right_height) becomes strictly greater than 1 or less than -1, it immediately performs structural rotations to fix it.", 
    caveats: "AVL trees are rigidly balanced. This guarantees lightning-fast O(log N) lookups, but the constant rotating makes insertion and deletion slightly slower in practice compared to Red-Black trees.", 
    timeComplexity: "O(log N) guaranteed", 
    spaceComplexity: "O(N)", 
    pseudocode: `function insert(node, val):
  // 1. Standard BST Insert
  if node is null: return new Node(val)
  if val < node.val: node.left = insert(node.left, val)
  else: node.right = insert(node.right, val)

  // 2. Update Height & Check Balance
  node.height = 1 + max(height(node.left), height(node.right))
  balance = height(node.left) - height(node.right)

  // 3. Perform Rotations if unbalanced
  if balance > 1 and val < node.left.val: return rightRotate(node) // LL Case
  if balance < -1 and val > node.right.val: return leftRotate(node) // RR Case
  if balance > 1 and val > node.left.val: // LR Case
      node.left = leftRotate(node.left)
      return rightRotate(node)
  if balance < -1 and val < node.right.val: // RL Case
      node.right = rightRotate(node.right)
      return leftRotate(node)

  return node` 
  },
  'trees-AVL-Search': { 
    description: "Finds a value in the tree using binary search logic.", 
    mechanism: "Identical to standard BST search. It traverses left if the target is smaller, right if larger.", 
    caveats: "Because the AVL tree guarantees a perfectly balanced structure, you will never encounter the O(N) 'linked list' worst-case scenario that plagues standard BSTs. Search is always brutally efficient.", 
    timeComplexity: "O(log N) guaranteed", 
    spaceComplexity: "O(1)", 
    pseudocode: `function search(root, target):
  if root is null or root.val == target:
    return root
  if target < root.val:
    return search(root.left, target)
  return search(root.right, target)` 
  },
  'trees-AVL-Insertion': { 
    description: "Inserts a new value and rebalances if necessary.", 
    mechanism: "It drops the node in like a standard BST, then walks back up its ancestral path. If an imbalance is detected, it applies one of four rotations (LL, RR, LR, RL) to restore the AVL property.", 
    caveats: "A single insertion can trigger a chain reaction requiring rotations higher up the tree.", 
    timeComplexity: "O(log N)", 
    spaceComplexity: "O(1)", 
    pseudocode: `// Same recursive logic as Creation` 
  },
  'trees-AVL-Deletion': { 
    description: "Removes a value and strictly rebalances the tree.", 
    mechanism: "First, it deletes the node using standard BST rules (leaf, one child, or two children using In-Order Successor). Then, it walks back up the tree, updating heights and rotating any node that falls out of balance.", 
    caveats: "Unlike insertion which usually requires at most one or two rotations to fix, deletion can cause a ripple effect that requires O(log N) rotations all the way up to the root.", 
    timeComplexity: "O(log N)", 
    spaceComplexity: "O(1)", 
    pseudocode: `// Standard BST delete, followed by AVL height updates and rotation checks on the return path.` 
  },
  // --- TREES: RED-BLACK TREE ---
  'trees-Red-Black-Creation': { 
    description: "Builds a self-balancing binary search tree using color rules.", 
    mechanism: "Nodes are colored Red or Black. The tree strictly enforces: 1) Root is Black. 2) Red nodes cannot have Red children. 3) Every path from a node to its descendant leaves contains the same number of Black nodes.", 
    caveats: "Red-Black trees are slightly less rigidly balanced than AVL trees. This means lookups might take fractionally longer, but insertions and deletions are significantly faster because they require fewer rotations.", 
    timeComplexity: "O(log N)", 
    spaceComplexity: "O(N)", 
    pseudocode: `// Standard BST insert, colored RED.
// Then fix violations:
function insertFixup(node):
  while node.parent.color == RED:
    uncle = getUncle(node)
    if uncle.color == RED:
      recolor(parent, uncle, BLACK)
      recolor(grandparent, RED)
      node = grandparent
    else:
      // Uncle is BLACK -> Requires Rotations
      if node is inner grandchild: rotate(parent)
      rotate(grandparent)
      recolor(...)` 
  },
  'trees-Red-Black-Search': { 
    description: "Finds a value using standard binary search logic.", 
    mechanism: "Traverses left if the target is smaller, right if larger. The colors are ignored during search operations.", 
    caveats: "Guaranteed O(log N) performance because the black-height rules mathematically prevent the tree from degrading into a linked list.", 
    timeComplexity: "O(log N)", 
    spaceComplexity: "O(1)", 
    pseudocode: `function search(root, target):
  if root is null or root.val == target: return root
  if target < root.val: return search(root.left, target)
  return search(root.right, target)` 
  },
  'trees-Red-Black-Insertion': { 
    description: "Inserts a new value and maintains Red-Black properties.", 
    mechanism: "New nodes are ALWAYS inserted as RED. If this connects a RED node to a RED parent, a violation occurs. The tree fixes this by either pushing the red color up the tree (recoloring) or performing rotations.", 
    caveats: "Because pushing colors up can cause violations higher up, insertion fixup can ripple all the way to the root.", 
    timeComplexity: "O(log N)", 
    spaceComplexity: "O(1)", 
    pseudocode: `// Inserts as RED, then calls insertFixup()` 
  },
  'trees-Red-Black-Deletion': { 
    description: "Removes a value and resolves any 'Double Black' violations.", 
    mechanism: "If a RED node is deleted, the rules remain intact. If a BLACK node is deleted, the path loses a black node, creating a violation. The algorithm pushes this 'extra blackness' up the tree or rotates siblings to absorb it.", 
    caveats: "RB Deletion is famously one of the most complex standard algorithms in computer science, featuring up to 6 distinct imbalance cases.", 
    timeComplexity: "O(log N)", 
    spaceComplexity: "O(1)", 
    pseudocode: `// Standard BST delete. 
// If deleted node was BLACK, call deleteFixup(node)
// Cases involve checking the color of the sibling and the sibling's children.` 
  },
  // --- TREES: HEAPS ---
  'trees-Min Heap-Creation': { 
    description: "Builds a complete binary tree where every parent is smaller than its children.", 
    mechanism: "Elements are inserted at the very bottom level, left-to-right. Then, the new element 'bubbles up' (swaps with its parent) until it is larger than its parent. This guarantees the smallest element is always at the root.", 
    caveats: "Heaps are actually just flattened arrays under the hood! The tree structure is purely mathematical: left child is at (2i + 1), right child is at (2i + 2).", 
    timeComplexity: "O(N log N)", 
    spaceComplexity: "O(N)", 
    pseudocode: `function insert(heap, val):
  heap.push(val)
  bubbleUp(heap, heap.length - 1)

function bubbleUp(heap, i):
  while i > 0:
    parent = floor((i - 1) / 2)
    if heap[i] < heap[parent]:
      swap(heap[i], heap[parent])
      i = parent
    else: break` 
  },
  'trees-Max Heap-Creation': { 
    description: "Builds a complete binary tree where every parent is larger than its children.", 
    mechanism: "Elements are inserted at the very bottom level, left-to-right. Then, the new element 'bubbles up' (swaps with its parent) until it is smaller than its parent. This guarantees the largest element is always at the root.", 
    caveats: "Heaps are actually just flattened arrays under the hood! The tree structure is purely mathematical: left child is at (2i + 1), right child is at (2i + 2).", 
    timeComplexity: "O(N log N)", 
    spaceComplexity: "O(N)", 
    pseudocode: `function insert(heap, val):
  heap.push(val)
  bubbleUp(heap, heap.length - 1)

function bubbleUp(heap, i):
  while i > 0:
    parent = floor((i - 1) / 2)
    if heap[i] > heap[parent]: // Only difference from Min Heap!
      swap(heap[i], heap[parent])
      i = parent
    else: break` 
  },
  'trees-Min Heap-Search': { 
    description: "Finds a value in the heap.", 
    mechanism: "Because a heap is only partially ordered (parents are smaller than children, but left/right siblings have no order), we cannot do a binary search. We have to check every node.", 
    caveats: "Heaps are NOT designed for searching. They are designed exclusively for O(1) access to the minimum (or maximum) element.", 
    timeComplexity: "O(N)", 
    spaceComplexity: "O(1)", 
    pseudocode: `function search(heap, target):
  for i from 0 to heap.length - 1:
    if heap[i] == target:
      return i
  return -1` 
  },
  'trees-Max Heap-Search': { 
    description: "Finds a value in the heap.", 
    mechanism: "Because a heap is only partially ordered (parents are larger than children, but left/right siblings have no order), we cannot do a binary search. We have to check every node.", 
    caveats: "Heaps are NOT designed for searching. They are designed exclusively for O(1) access to the maximum (or minimum) element.", 
    timeComplexity: "O(N)", 
    spaceComplexity: "O(1)", 
    pseudocode: `function search(heap, target):
  for i from 0 to heap.length - 1:
    if heap[i] == target:
      return i
  return -1` 
  },
  'trees-Min Heap-Insertion': { 
    description: "Adds a new value and restores the Min Heap property.", 
    mechanism: "Drops the node at the next available bottom-level spot (end of the array), then 'bubbles up' by comparing and swapping with its parent until it's no longer smaller than its parent.", 
    caveats: "Very efficient because the tree is guaranteed to be perfectly balanced, so it will never bubble up more than log(N) times.", 
    timeComplexity: "O(log N)", 
    spaceComplexity: "O(1)", 
    pseudocode: `// Push to end of array, then bubbleUp()` 
  },
  'trees-Max Heap-Insertion': { 
    description: "Adds a new value and restores the Max Heap property.", 
    mechanism: "Drops the node at the next available bottom-level spot (end of the array), then 'bubbles up' by comparing and swapping with its parent until it's no longer larger than its parent.", 
    caveats: "Very efficient because the tree is guaranteed to be perfectly balanced, so it will never bubble up more than log(N) times.", 
    timeComplexity: "O(log N)", 
    spaceComplexity: "O(1)", 
    pseudocode: `// Push to end of array, then bubbleUp()` 
  },
  'trees-Min Heap-Deletion': { 
    description: "Removes a node (usually the root/minimum) and restores the heap.", 
    mechanism: "Swaps the target node with the very last leaf node, deletes the leaf, and then 'bubbles down' the swapped node until it is smaller than both its children.", 
    caveats: "Standard heap deletion only removes the root (Extract-Min). If deleting a random inner node, it may need to bubble up OR bubble down depending on the value swapped into it.", 
    timeComplexity: "O(log N)", 
    spaceComplexity: "O(1)", 
    pseudocode: `function delete(heap, index):
  swap(heap[index], heap[heap.length - 1])
  heap.pop()
  bubbleDown(heap, index)` 
  },
  'trees-Max Heap-Deletion': { 
    description: "Removes a node (usually the root/maximum) and restores the heap.", 
    mechanism: "Swaps the target node with the very last leaf node, deletes the leaf, and then 'bubbles down' the swapped node until it is larger than both its children.", 
    caveats: "Standard heap deletion only removes the root (Extract-Max). If deleting a random inner node, it may need to bubble up OR bubble down depending on the value swapped into it.", 
    timeComplexity: "O(log N)", 
    spaceComplexity: "O(1)", 
    pseudocode: `function delete(heap, index):
  swap(heap[index], heap[heap.length - 1])
  heap.pop()
  bubbleDown(heap, index)` 
  },
  // --- GRAPHS ---
  'graphs-Creation': {
    description: "Builds an undirected graph from an Edge List.",
    mechanism: "Parses pairs of connected nodes (e.g., 'A-B') and builds an Adjacency List in memory. The visualizer calculates a perfect circular layout using trigonometry to ensure nodes never overlap.",
    caveats: "Graphs can be directed or undirected, weighted or unweighted. This visualizer defaults to an unweighted, undirected graph.",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V + E)",
    pseudocode: `function createGraph(edges):
  adjList = {}
  for each (u, v) in edges:
    if u not in adjList: adjList[u] = []
    if v not in adjList: adjList[v] = []
    
    adjList[u].push(v)
    adjList[v].push(u) // Because it's undirected
    
  return adjList`
  },
  'graphs-Modify': {
    description: "Dynamically adds or removes nodes and edges from the graph.",
    mechanism: "Adding an edge between new nodes automatically allocates them. Deleting a node requires iterating through its neighbors to severe all connecting edges before deallocating the node itself.",
    caveats: "Failing to remove connected edges before deleting a node results in memory leaks and 'ghost pointers' in low-level languages.",
    timeComplexity: "O(V) to delete node, O(1) to add edge",
    spaceComplexity: "O(1)",
    pseudocode: `function deleteNode(adjList, target):
  // 1. Remove edges from neighbors
  for neighbor in adjList[target]:
    adjList[neighbor].remove(target)
  
  // 2. Remove node itself
  delete adjList[target]`
  },
  'graphs-Traversal': {
    description: "Graph traversals (BFS & DFS) have been moved to the Algorithms section.",
    mechanism: "Because BFS and DFS are algorithmic strategies rather than inherent data structure mechanics, they are visualized in the Algorithms playground.",
    caveats: "Click the button in the visualizer view to switch to the Algorithm visualizer.",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    pseudocode: `// See Algorithms section for BFS and DFS implementations.`
  },
  // --- STACKS ---
  'stacks-Creation': { 
    description: "Builds a Last-In-First-Out (LIFO) data structure.", 
    mechanism: "Elements are added to the 'top' of the stack. When elements are removed, they are strictly taken from the 'top'. Think of it like a stack of plates in a cafeteria.", 
    caveats: "You cannot access elements in the middle of a stack without popping everything above them first.", 
    timeComplexity: "O(N)", 
    spaceComplexity: "O(N)", 
    pseudocode: `function createStack(values):
  stack = []
  for val in values:
    stack.push(val)
  return stack` 
  },
  'stacks-Push': { 
    description: "Adds an element to the top of the stack.", 
    mechanism: "The new element is placed at the highest available index, and the 'top' pointer is updated to point to it.", 
    caveats: "If a stack has a fixed memory size (like the Call Stack), pushing too many items will cause a Stack Overflow.", 
    timeComplexity: "O(1)", 
    spaceComplexity: "O(1)", 
    pseudocode: `function push(stack, val):
  stack.push(val)
  top = stack.length - 1` 
  },
  'stacks-Pop': { 
    description: "Removes the top element from the stack.", 
    mechanism: "Reads the element at the 'top' pointer, deletes it from memory, and moves the 'top' pointer down by one.", 
    caveats: "Attempting to pop from an empty stack causes a Stack Underflow error.", 
    timeComplexity: "O(1)", 
    spaceComplexity: "O(1)", 
    pseudocode: `function pop(stack):
  if stack.isEmpty(): return null
  val = stack[top]
  stack.pop()
  top = top - 1
  return val` 
  },

  // --- QUEUES ---
  'queues-Creation': { 
    description: "Builds a First-In-First-Out (FIFO) data structure.", 
    mechanism: "Elements enter at the 'rear' (enqueue) and leave from the 'front' (dequeue). Think of it exactly like waiting in line at a grocery store.", 
    caveats: "In a naive array implementation, dequeuing an element from the front requires shifting every other element forward, making it an O(N) operation. (Using a Linked List makes it O(1)).", 
    timeComplexity: "O(N)", 
    spaceComplexity: "O(N)", 
    pseudocode: `function createQueue(values):
  queue = []
  for val in values:
    queue.enqueue(val)
  return queue` 
  },
  'queues-Enqueue': { 
    description: "Adds an element to the back of the line.", 
    mechanism: "Places the new element at the 'rear' pointer and moves the rear pointer back by one.", 
    caveats: "Very fast O(1) operation regardless of how it is implemented under the hood.", 
    timeComplexity: "O(1)", 
    spaceComplexity: "O(1)", 
    pseudocode: `function enqueue(queue, val):
  queue.push(val)
  rear = queue.length - 1` 
  },
  'queues-Dequeue': { 
    description: "Removes the element at the front of the line.", 
    mechanism: "The element at the 'front' pointer is removed. If backed by an array, all subsequent elements must shift one step left.", 
    caveats: "In real-world systems, circular buffers or linked lists are used to prevent the expensive O(N) shift operation.", 
    timeComplexity: "O(N) for Arrays, O(1) for Linked Lists", 
    spaceComplexity: "O(1)", 
    pseudocode: `function dequeue(queue):
  if queue.isEmpty(): return null
  val = queue[0]
  queue.shift() // O(N) shift
  rear = queue.length - 1
  return val` 
  },
  // --- HASH MAPS ---
  'hash-maps-Creation': {
    description: "Builds a key-value store where data is accessed via unique keys instead of numerical indices.",
    mechanism: "Under the hood, a 'hash function' converts your string key into a numerical array index. This allows the computer to jump directly to the memory address where the value is stored without searching.",
    caveats: "Because we are visualizing the logical key-value pairings rather than the underlying memory buckets, you will see a clean table. In memory, however, Hash Maps deal with 'collisions' when two keys hash to the same index.",
    timeComplexity: "O(N) to build",
    spaceComplexity: "O(N)",
    pseudocode: `function createMap(entries):
  map = new HashMap()
  for (key, value) in entries:
    map.put(key, value)
  return map`
  },
  'hash-maps-Get': {
    description: "Retrieves a value based on its key in constant time.",
    mechanism: "Passes the target key through the hash function, instantly calculates the memory bucket index, and retrieves the value.",
    caveats: "This O(1) speed is what makes Hash Maps the most powerful and frequently used data structure in modern software engineering.",
    timeComplexity: "O(1) average",
    spaceComplexity: "O(1)",
    pseudocode: `function get(map, key):
  index = hashFunction(key)
  bucket = map.memory[index]
  
  for pair in bucket:
    if pair.key == key:
      return pair.value
      
  return null`
  },
  'hash-maps-Put': {
    description: "Inserts a new key-value pair, or updates an existing key.",
    mechanism: "Hashes the key to find the target bucket. If the key already exists, it overwrites the value. If it doesn't, it adds the new pair.",
    caveats: "If the internal array gets too full, the Hash Map must 'rehash'—allocating a larger array and recalculating the hashes for every single element (an O(N) operation).",
    timeComplexity: "O(1) average",
    spaceComplexity: "O(1)",
    pseudocode: `function put(map, key, value):
  index = hashFunction(key)
  bucket = map.memory[index]
  
  for pair in bucket:
    if pair.key == key:
      pair.value = value // Update
      return
      
  bucket.push({key, value}) // Insert`
  },
  'hash-maps-Remove': {
    description: "Deletes a key-value pair from the map.",
    mechanism: "Hashes the key, locates the bucket, and slices the pair out of memory.",
    caveats: "Like insertion and lookup, deletion is near-instantaneous.",
    timeComplexity: "O(1) average",
    spaceComplexity: "O(1)",
    pseudocode: `function remove(map, key):
  index = hashFunction(key)
  bucket = map.memory[index]
  
  for i from 0 to bucket.length:
    if bucket[i].key == key:
      bucket.splice(i, 1)
      return true
      
  return false`
  },
  // --- SEARCHING ALGORITHMS ---
  'searching-Linear Search': {
    description: "Finds a target value by checking every single element sequentially.",
    mechanism: "Starts at index 0 and inspects each element one by one. If it matches the target, it stops and returns the index. If it reaches the end without a match, it returns -1.",
    caveats: "Extremely slow for massive datasets, but it is the absolute only option if your array is completely unsorted.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    pseudocode: `function linearSearch(arr, target):
  for i from 0 to arr.length - 1:
    if arr[i] == target:
      return i // Target found
      
  return -1 // Target not found`
  },
  'searching-Binary Search': {
    description: "Lightning-fast search algorithm that repeatedly halves the search window.",
    mechanism: "Uses Left and Right pointers to define a window. It checks the middle element. If the target is smaller, it discards the right half (Right = Mid - 1). If larger, it discards the left half (Left = Mid + 1).",
    caveats: "The array MUST be sorted beforehand. If you run a Binary Search on an unsorted array, it will fail unpredictably.",
    timeComplexity: "O(log N)",
    spaceComplexity: "O(1)",
    pseudocode: `function binarySearch(arr, target):
  left = 0
  right = arr.length - 1
  
  while left <= right:
    mid = floor((left + right) / 2)
    
    if arr[mid] == target: 
      return mid
    else if arr[mid] < target: 
      left = mid + 1
    else: 
      right = mid - 1
      
  return -1`
  },
  // --- SORTING ALGORITHMS ---
  'sorting-Bubble Sort': {
    description: "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
    mechanism: "The pass through the list is repeated until the list is sorted. The largest elements 'bubble' up to the end of the array first.",
    caveats: "Horrendously inefficient for large datasets. Primarily used for educational purposes to introduce sorting algorithms.",
    timeComplexity: "O(N²)",
    spaceComplexity: "O(1)",
    pseudocode: `function bubbleSort(arr):
  for i from 0 to arr.length - 1:
    for j from 0 to arr.length - i - 1:
      if arr[j] > arr[j+1]:
        swap(arr[j], arr[j+1])`
  },
  'sorting-Selection Sort': {
    description: "Divides the array into a sorted and an unsorted region. Repeatedly selects the smallest element from the unsorted region and swaps it into the sorted region.",
    mechanism: "Scans the remaining unsorted elements to find the absolute minimum, then swaps it with the first unsorted element.",
    caveats: "Makes fewer swaps than Bubble Sort, but still requires scanning the remaining array every single time. Not suited for large datasets.",
    timeComplexity: "O(N²)",
    spaceComplexity: "O(1)",
    pseudocode: `function selectionSort(arr):
  for i from 0 to arr.length:
    minIdx = i
    for j from i + 1 to arr.length:
      if arr[j] < arr[minIdx]:
        minIdx = j
    swap(arr[i], arr[minIdx])`
  },
  'sorting-Insertion Sort': {
    description: "Builds the final sorted array one item at a time by shifting elements to the right to make room for the new item.",
    mechanism: "Takes the next unsorted element and compares it backwards against the sorted portion, shifting larger elements right until it finds the correct spot.",
    caveats: "Highly efficient for small data sets or arrays that are already mostly sorted (where it approaches O(N)).",
    timeComplexity: "O(N²) average, O(N) best case",
    spaceComplexity: "O(1)",
    pseudocode: `function insertionSort(arr):
  for i from 1 to arr.length:
    key = arr[i]
    j = i - 1
    while j >= 0 and arr[j] > key:
      arr[j+1] = arr[j]
      j = j - 1
    arr[j+1] = key`
  },
  'sorting-Merge Sort': {
    description: "A Divide and Conquer algorithm that splits the array in half, sorts the halves, and then merges them back together.",
    mechanism: "Recursively breaks the array down to single elements, then merges them back up by comparing the heads of the left and right halves.",
    caveats: "Extremely reliable O(N log N) performance regardless of the initial array state, but requires extra memory to hold the merged arrays.",
    timeComplexity: "O(N log N)",
    spaceComplexity: "O(N)",
    pseudocode: `function mergeSort(arr):
  if arr.length <= 1: return arr
  mid = arr.length / 2
  left = mergeSort(arr[0...mid])
  right = mergeSort(arr[mid...end])
  return merge(left, right)`
  },
  'sorting-Quick Sort': {
    description: "A fast Divide and Conquer algorithm that partitions the array around a 'pivot' element.",
    mechanism: "Selects a pivot, then moves all elements smaller than the pivot to its left, and all larger elements to its right. It then recursively sorts the left and right sub-arrays.",
    caveats: "The fastest general-purpose sorting algorithm in practice, but can degrade to O(N²) if you consistently pick a bad pivot (like picking the max value every time).",
    timeComplexity: "O(N log N) average, O(N²) worst",
    spaceComplexity: "O(log N)",
    pseudocode: `function quickSort(arr, low, high):
  if low < high:
    pi = partition(arr, low, high)
    quickSort(arr, low, pi - 1)
    quickSort(arr, pi + 1, high)

function partition(arr, low, high):
  pivot = arr[high]
  i = low - 1
  for j from low to high - 1:
    if arr[j] < pivot:
      i++
      swap(arr[i], arr[j])
  swap(arr[i + 1], arr[high])
  return i + 1`
  },
  // --- TREE ALGORITHMS ---
  'tree-algos-Pre-order': {
    description: "Visits the current node first, then recursively traverses the left subtree, then the right.",
    mechanism: "Root -> Left -> Right. This is useful for creating a copy of the tree or serializing it for storage.",
    caveats: "Pre-order traversal is essentially a Depth-First Search (DFS) on a binary tree.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(H) where H is tree height",
    pseudocode: `function preOrder(node):
  if node == null: return
  visit(node)
  preOrder(node.left)
  preOrder(node.right)`
  },
  'tree-algos-In-order': {
    description: "Recursively traverses the left subtree, visits the current node, then traverses the right subtree.",
    mechanism: "Left -> Root -> Right. In a Binary Search Tree (BST), this mathematically guarantees that you will visit the nodes in perfectly sorted ascending order.",
    caveats: "If you need to flatten a BST into a sorted array, In-order is the only way to do it.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(H)",
    pseudocode: `function inOrder(node):
  if node == null: return
  inOrder(node.left)
  visit(node)
  inOrder(node.right)`
  },
  'tree-algos-Post-order': {
    description: "Recursively traverses the left subtree, then the right subtree, and visits the current node last.",
    mechanism: "Left -> Right -> Root. This ensures a node is only processed AFTER all of its children have been processed.",
    caveats: "Used heavily for deleting a tree from memory (since you must delete children before the parent) or evaluating mathematical syntax trees.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(H)",
    pseudocode: `function postOrder(node):
  if node == null: return
  postOrder(node.left)
  postOrder(node.right)
  visit(node)`
  },
  'tree-algos-BFS': {
    description: "Breadth-First Search (Level-Order Traversal). Explores the tree level by level, from top to bottom, left to right.",
    mechanism: "Uses a Queue. It pushes the root, then enters a loop: dequeue a node, visit it, and enqueue its left and right children.",
    caveats: "Requires more memory than DFS for wide trees because the queue must hold an entire level of nodes at once.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(W) where W is max width",
    pseudocode: `function bfs(root):
  if root == null: return
  queue = [root]
  while queue is not empty:
    curr = queue.dequeue()
    visit(curr)
    if curr.left: queue.enqueue(curr.left)
    if curr.right: queue.enqueue(curr.right)`
  },
  'tree-algos-DFS': {
    description: "Depth-First Search. Plunges as deep as possible down a single branch before backtracking.",
    mechanism: "For binary trees, standard recursive DFS perfectly mirrors Pre-order traversal. It processes a node, then aggressively dives down the left side before touching the right.",
    caveats: "Uses a Stack under the hood (or the Call Stack via recursion). Highly memory efficient for deep, narrow trees.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(H) where H is tree height",
    pseudocode: `function dfs(node):
  // Identical to Pre-order for Trees
  if node == null: return
  visit(node)
  dfs(node.left)
  dfs(node.right)`
  },
// --- GRAPH ALGORITHMS ---
  'graph-algos-BFS': {
    description: "Explores a graph level by level, radiating outward from the starting node like a ripple in a pond.",
    mechanism: "Uses a Queue. It enqueues the starting node, marks it visited, and then enters a loop: dequeue a node, and enqueue all of its unvisited neighbors.",
    caveats: "BFS is perfectly suited for finding the shortest path on an unweighted graph (e.g., fewest number of hops between two friends on a social network).",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    pseudocode: `function graphBFS(adjList, startNode):
  queue = [startNode]
  visited = set(startNode)
  
  while queue is not empty:
    curr = queue.dequeue()
    visit(curr)
    
    for neighbor in adjList[curr]:
      if neighbor not in visited:
        visited.add(neighbor)
        queue.enqueue(neighbor)`
  },
  'graph-algos-DFS': {
    description: "Plunges as deep as possible along each branch before backtracking.",
    mechanism: "Uses a Stack (or the Call Stack via recursion). From the current node, it picks an unvisited neighbor and immediately dives into it, only returning when it hits a dead end.",
    caveats: "DFS is excellent for detecting cycles in a graph, topological sorting, and solving mazes.",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    pseudocode: `function graphDFS(adjList, startNode):
  visited = set()
  
  function explore(node):
    visited.add(node)
    visit(node)
    
    for neighbor in adjList[node]:
      if neighbor not in visited:
        explore(neighbor)
        
  explore(startNode)`
  }
};