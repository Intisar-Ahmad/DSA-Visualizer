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
};