import { Link } from 'react-router-dom';
import { ArrowLeft, Box, Braces, GitBranch, Layers, ListTree, Search, ArrowDownUp, Network } from 'lucide-react';

const DATA_STRUCTURES = [
  { id: 'arrays', name: 'Arrays', icon: <Box size={24} />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'linked-lists', name: 'Linked Lists', icon: <GitBranch size={24} />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'trees', name: 'Trees', icon: <ListTree size={24} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'graphs', name: 'Graphs', icon: <Network size={24} />, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { id: 'stacks-queues', name: 'Stacks & Queues', icon: <Layers size={24} />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'hash-maps', name: 'Hash Maps', icon: <Braces size={24} />, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
];

const ALGORITHMS = [
  { id: 'searching', name: 'Searching Algos', icon: <Search size={24} />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'sorting', name: 'Sorting Algos', icon: <ArrowDownUp size={24} />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'tree-algos', name: 'Tree Traversals', icon: <ListTree size={24} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'graph-algos', name: 'Graph Traversals', icon: <Network size={24} />, color: 'text-pink-500', bg: 'bg-pink-500/10' },
];

export function SandboxHub() {
  return (
    <main className="h-full w-full bg-[#0a0c14] text-gray-200 p-8 overflow-y-auto">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between max-w-7xl mx-auto mb-16">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            Bh
          </div>
          <h1 className="text-2xl font-bold tracking-wide text-white">Algorithm Sandbox</h1>
        </div>
        
        <Link 
          to="/" 
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-mono text-sm"
        >
          <ArrowLeft size={16} /> Back to Execution Engine
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto space-y-16 pb-20">
        
        {/* Data Structures Section */}
        <section>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Layers className="text-gray-400" /> Data Structures
          </h2>
          <p className="text-gray-400 text-sm mb-6 font-mono">Abstract implementations, creation, and mutation visualizations.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DATA_STRUCTURES.map((ds) => (
              <Link key={ds.id} to={`/sandbox/structure/${ds.id}`}>
                <div className="group p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all cursor-pointer flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${ds.bg} ${ds.color} transition-transform group-hover:scale-110`}>
                    {ds.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-200 group-hover:text-white">{ds.name}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-1">Explore implementation →</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Algorithms Section */}
        <section>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Braces className="text-gray-400" /> Algorithms
          </h2>
          <p className="text-gray-400 text-sm mb-6 font-mono">Step-by-step state visualization of standard algorithmic logic.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALGORITHMS.map((algo) => (
              <Link key={algo.id} to={`/sandbox/algo/${algo.id}`}>
                <div className="group p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all cursor-pointer flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${algo.bg} ${algo.color} transition-transform group-hover:scale-110`}>
                    {algo.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-200 group-hover:text-white">{algo.name}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-1">Visualize logic →</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}