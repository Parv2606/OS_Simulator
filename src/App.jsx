import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Encyclopedia from './pages/Encyclopedia';
import SimulatorsList from './pages/SimulatorsList';
import CpuDashboard from './pages/CpuDashboard';
// Placeholders for the upcoming pages
import BankersAlgorithm from './pages/BankersAlgorithm';
import ProducerConsumer from './pages/ProducerConsumer';

function App() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <div className="pointer-events-none fixed inset-0 grid-fade opacity-30 z-0" />
      
      {/* Modern Colorful Glowing Orbs */}
      <div className="pointer-events-none fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-teal-500/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen transition-all duration-1000" />
      <div className="pointer-events-none fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen transition-all duration-1000" />
      <div className="pointer-events-none fixed top-[30%] left-[50%] w-[40%] h-[40%] rounded-full bg-pink-500/15 blur-[100px] mix-blend-multiply dark:mix-blend-screen transition-all duration-1000" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar darkMode={darkMode} setDarkMode={setDarkMode} />
        
        <main className="flex-grow mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<SimulatorsList />} />
            <Route path="/cpu" element={<CpuDashboard />} />
            <Route path="/bankers" element={<BankersAlgorithm />} />
            <Route path="/producer-consumer" element={<ProducerConsumer />} />
            <Route path="/learn" element={<Encyclopedia />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
