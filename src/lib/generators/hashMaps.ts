import type { SandboxFrame } from '../../types/sandbox';

type KVPair = { key: string; val: string; highlight?: boolean; pointer?: string };

export const generateHashmapCreation = (pairs: KVPair[]): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ type: 'hashmap', hashmap: [], description: "Initializing empty Hash Map..." }];
  const current: KVPair[] = [];

  for (const pair of pairs) {
    current.push({ ...pair, highlight: true });
    frames.push({
      type: 'hashmap',
      hashmap: JSON.parse(JSON.stringify(current)),
      description: `Hashing key '${pair.key}' and storing value '${pair.val}'.`
    });
    current[current.length - 1].highlight = false;
  }

  frames.push({ type: 'hashmap', hashmap: current, description: "Hash Map Creation complete." });
  return frames;
};

export const generateHashmapGet = (pairs: KVPair[], targetKey: string): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ type: 'hashmap', hashmap: JSON.parse(JSON.stringify(pairs)), description: `Hashing target key '${targetKey}' to locate memory bucket...` }];
  
  const stepPairs = JSON.parse(JSON.stringify(pairs));
  const targetIndex = stepPairs.findIndex((p: KVPair) => p.key === targetKey);

  if (targetIndex !== -1) {
    stepPairs[targetIndex].highlight = true;
    stepPairs[targetIndex].pointer = 'Found';
    frames.push({ type: 'hashmap', hashmap: stepPairs, description: `O(1) Lookup: Key '${targetKey}' maps to value '${stepPairs[targetIndex].val}'.` });
  } else {
    frames.push({ type: 'hashmap', hashmap: stepPairs, description: `Key '${targetKey}' does not exist in the Hash Map.` });
  }

  return frames;
};

export const generateHashmapPut = (pairs: KVPair[], insertKey: string, insertVal: string): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ type: 'hashmap', hashmap: JSON.parse(JSON.stringify(pairs)), description: `Hashing key '${insertKey}'...` }];
  
  const stepPairs: KVPair[] = JSON.parse(JSON.stringify(pairs));
  const existingIndex = stepPairs.findIndex((p) => p.key === insertKey);

  if (existingIndex !== -1) {
    stepPairs[existingIndex].highlight = true;
    frames.push({ type: 'hashmap', hashmap: JSON.parse(JSON.stringify(stepPairs)), description: `Key '${insertKey}' already exists. Preparing to update...` });
    
    stepPairs[existingIndex].val = insertVal;
    stepPairs[existingIndex].pointer = 'Updated';
    frames.push({ type: 'hashmap', hashmap: JSON.parse(JSON.stringify(stepPairs)), description: `Updated key '${insertKey}' with new value '${insertVal}'.` });
  } else {
    stepPairs.push({ key: insertKey, val: insertVal, highlight: true, pointer: 'Inserted' });
    frames.push({ type: 'hashmap', hashmap: JSON.parse(JSON.stringify(stepPairs)), description: `Key '${insertKey}' does not exist. Inserted new key-value pair.` });
  }

  stepPairs.forEach(p => { p.highlight = false; delete p.pointer; });
  frames.push({ type: 'hashmap', hashmap: stepPairs, description: `Put operation complete.` });
  return frames;
};

export const generateHashmapRemove = (pairs: KVPair[], deleteKey: string): SandboxFrame[] => {
  const frames: SandboxFrame[] = [{ type: 'hashmap', hashmap: JSON.parse(JSON.stringify(pairs)), description: `Hashing key '${deleteKey}' to locate for deletion...` }];
  
  let stepPairs: KVPair[] = JSON.parse(JSON.stringify(pairs));
  const targetIndex = stepPairs.findIndex((p) => p.key === deleteKey);

  if (targetIndex !== -1) {
    stepPairs[targetIndex].highlight = true;
    stepPairs[targetIndex].pointer = 'Deleting';
    frames.push({ type: 'hashmap', hashmap: JSON.parse(JSON.stringify(stepPairs)), description: `Located key '${deleteKey}'. Evicting from memory...` });
    
    stepPairs = stepPairs.filter(p => p.key !== deleteKey);
    frames.push({ type: 'hashmap', hashmap: stepPairs, description: `Successfully removed key '${deleteKey}'.` });
  } else {
    frames.push({ type: 'hashmap', hashmap: stepPairs, description: `Key '${deleteKey}' does not exist. Nothing to remove.` });
  }

  return frames;
};