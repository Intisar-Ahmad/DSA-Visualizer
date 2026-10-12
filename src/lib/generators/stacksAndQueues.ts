import type { SandboxFrame } from '../../types/sandbox';

// --- STACKS ---
export const generateStackCreation = (arr: number[]): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ type: 'stack', array: [], highlights: [], pointers: {}, description: "Initializing empty Stack container..." }];
  const current: number[] = [];
  
  for (let i = 0; i < arr.length; i++) {
    current.push(arr[i]);
    frames.push({ 
      type: 'stack', 
      array: [...current], 
      highlights: [i], 
      pointers: { top: i }, 
      description: `Pushed ${arr[i]} onto the stack.` 
    });
  }
  
  frames.push({ 
    type: 'stack', 
    array: [...current], 
    highlights: [], 
    pointers: { top: current.length - 1 }, 
    description: "Stack Creation complete. LIFO behavior enforced." 
  });
  
  return frames;
};

export const generateStackPush = (arr: number[], insertVal: number): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ 
    type: 'stack', 
    array: [...arr], 
    highlights: [], 
    pointers: { top: arr.length - 1 }, 
    description: "Current Stack state." 
  }];
  
  const nextArr = [...arr, insertVal];
  const nextTop = nextArr.length - 1;

  frames.push({ 
    type: 'stack', 
    array: nextArr, 
    highlights: [nextTop], 
    pointers: { top: nextTop }, 
    description: `Pushed ${insertVal}. The 'top' pointer shifts up.` 
  });
  
  frames.push({ 
    type: 'stack', 
    array: nextArr, 
    highlights: [], 
    pointers: { top: nextTop }, 
    description: "Push complete." 
  });
  
  return frames;
};

export const generateStackPop = (arr: number[]): SandboxFrame[] => {
  if (arr.length === 0) {
    return [{ type: 'stack', array: [], highlights: [], pointers: {}, description: "Stack Underflow! Cannot pop from an empty stack." }];
  }

  const frames: SandboxFrame[] = [{ 
    type: 'stack', 
    array: [...arr], 
    highlights: [], 
    pointers: { top: arr.length - 1 }, 
    description: "Current Stack state." 
  }];
  
  const popTarget = arr.length - 1;
  
  frames.push({ 
    type: 'stack', 
    array: [...arr], 
    highlights: [popTarget], 
    pointers: { top: popTarget }, 
    description: `Targeting top element ${arr[popTarget]} for removal...` 
  });

  const nextArr = arr.slice(0, -1);
  const nextTop = nextArr.length - 1;

  frames.push({ 
    type: 'stack', 
    array: nextArr, 
    highlights: [], 
    pointers: nextTop >= 0 ? { top: nextTop } : {}, 
    description: `Popped! The 'top' pointer drops down.` 
  });
  
  return frames;
};

// --- QUEUES ---
export const generateQueueCreation = (arr: number[]): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ type: 'queue', array: [], highlights: [], pointers: {}, description: "Initializing empty Queue pipe..." }];
  const current: number[] = [];
  
  for (let i = 0; i < arr.length; i++) {
    current.push(arr[i]);
    frames.push({ 
      type: 'queue', 
      array: [...current], 
      highlights: [i], 
      pointers: { front: 0, rear: i }, 
      description: `Enqueued ${arr[i]} at the rear.` 
    });
  }
  
  frames.push({ 
    type: 'queue', 
    array: [...current], 
    highlights: [], 
    pointers: { front: 0, rear: current.length - 1 }, 
    description: "Queue Creation complete. FIFO behavior enforced." 
  });
  
  return frames;
};

export const generateQueueEnqueue = (arr: number[], insertVal: number): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ 
    type: 'queue', 
    array: [...arr], 
    highlights: [], 
    pointers: { front: 0, rear: arr.length - 1 }, 
    description: "Current Queue state." 
  }];
  
  const nextArr = [...arr, insertVal];
  const nextRear = nextArr.length - 1;

  frames.push({ 
    type: 'queue', 
    array: nextArr, 
    highlights: [nextRear], 
    pointers: { front: 0, rear: nextRear }, 
    description: `Enqueued ${insertVal}. The 'rear' pointer moves back.` 
  });
  
  frames.push({ 
    type: 'queue', 
    array: nextArr, 
    highlights: [], 
    pointers: { front: 0, rear: nextRear }, 
    description: "Enqueue complete." 
  });
  
  return frames;
};

export const generateQueueDequeue = (arr: number[]): SandboxFrame[] => {
  if (arr.length === 0) {
    return [{ type: 'queue', array: [], highlights: [], pointers: {}, description: "Queue is empty! Cannot dequeue." }];
  }

  const frames: SandboxFrame[] = [{ 
    type: 'queue', 
    array: [...arr], 
    highlights: [], 
    pointers: { front: 0, rear: arr.length - 1 }, 
    description: "Current Queue state." 
  }];
  
  frames.push({ 
    type: 'queue', 
    array: [...arr], 
    highlights: [0], 
    pointers: { front: 0, rear: arr.length - 1 }, 
    description: `Dequeuing front element ${arr[0]}...` 
  });

  const nextArr = arr.slice(1);

  if (nextArr.length > 0) {
    frames.push({ 
      type: 'queue', 
      array: nextArr, 
      highlights: [], 
      pointers: { front: 0, rear: nextArr.length - 1 }, 
      description: `Dequeued! The front element exits the queue.` 
    });
  } else {
    frames.push({ 
      type: 'queue', 
      array: nextArr, 
      highlights: [], 
      pointers: {}, 
      description: `Dequeued! The queue is now empty.` 
    });
  }
  
  return frames;
};