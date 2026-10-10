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
  }
};