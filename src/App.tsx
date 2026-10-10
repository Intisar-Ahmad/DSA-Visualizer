import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppLayout } from './components/Layout/AppLayout';
import { MobileBlock } from './components/Layout/MobileBlock';
import { SandboxHub } from './components/Sandbox/SandboxHub';
import { SandboxWorkspace } from './components/Sandbox/SandboxWorkspace'; // <-- IMPORT HERE

export default function App() {
  return (
    <BrowserRouter>
      <MobileBlock />
      <div className="hidden md:block h-screen w-screen overflow-hidden bg-[#0a0c14]">
        <Routes>
          <Route path="/" element={<AppLayout />} />
          <Route path="/sandbox" element={<SandboxHub />} />
          
          {/* Both paths use the same universal shell, adapting based on the URL parameter */}
          <Route path="/sandbox/structure/:id" element={<SandboxWorkspace />} />
          <Route path="/sandbox/algo/:id" element={<SandboxWorkspace />} />
        </Routes>
      </div>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}