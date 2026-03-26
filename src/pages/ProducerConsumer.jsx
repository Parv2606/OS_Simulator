import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ArrowRight, Lock, Unlock, Zap, MinusCircle } from 'lucide-react';

export default function ProducerConsumer() {
  const [bufferSize, setBufferSize] = useState(6);
  const [buffer, setBuffer] = useState([]);
  const [mutex, setMutex] = useState(1);
  const [logs, setLogs] = useState([]);

  const addLog = (msg, type) => {
    setLogs(prev => [{ id: Date.now(), msg, type }, ...prev].slice(0, 15));
  };

  const produce = () => {
    if (mutex === 0) {
      addLog('Cannot Produce: Mutex is locked by Consumer!', 'error');
      return;
    }
    if (buffer.length >= bufferSize) {
      addLog('Cannot Produce: Buffer is FULL (Empty = 0)', 'error');
      return;
    }
    setMutex(0); // Lock
    addLog('Producer acquired Mutex lock.', 'system');
    
    setTimeout(() => {
      setBuffer(prev => [...prev, `Item-${Math.floor(Math.random() * 1000)}`]);
      addLog('Producer pushed an item to the buffer.', 'success');
      setMutex(1); // Unlock
      addLog('Producer released Mutex.', 'system');
    }, 600);
  };

  const consume = () => {
    if (mutex === 0) {
      addLog('Cannot Consume: Mutex is locked by Producer!', 'error');
      return;
    }
    if (buffer.length === 0) {
      addLog('Cannot Consume: Buffer is EMPTY (Full = 0)', 'error');
      return;
    }
    setMutex(0); // Lock
    addLog('Consumer acquired Mutex lock.', 'system');
    
    setTimeout(() => {
      setBuffer(prev => {
        const item = prev[0];
        addLog(`Consumer popped ${item} from the buffer.`, 'warning');
        return prev.slice(1);
      });
      setMutex(1); // Unlock
      addLog('Consumer released Mutex.', 'system');
    }, 600);
  };

  const emptySlots = bufferSize - buffer.length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-12 pb-24 px-4 sm:px-6">
      <header className="space-y-4 pt-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
            <Package className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Producer-Consumer Sandbox</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">Visual Bounded Buffer Synchronization Tool</p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-8">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
             <div className="flex items-center gap-6">
                <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-4 transition-colors ${mutex === 1 ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'border-rose-400 bg-rose-50 dark:bg-rose-900/20 text-rose-600'}`}>
                    {mutex === 1 ? <Unlock className="w-8 h-8 mb-1" /> : <Lock className="w-8 h-8 mb-1" />}
                    <span className="font-bold text-lg">Mutex: {mutex}</span>
                </div>
                <div className="space-y-2">
                    <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <span className="font-bold text-slate-500 uppercase tracking-widest text-sm text-center">Empty Blocks<br/><span className="text-2xl text-slate-900 dark:text-white">{emptySlots}</span></span>
                        <div className="w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                        <span className="font-bold text-slate-500 uppercase tracking-widest text-sm text-center">Full Blocks<br/><span className="text-2xl text-slate-900 dark:text-white">{buffer.length}</span></span>
                    </div>
                </div>
             </div>
             
             <div className="flex gap-4">
                <button disabled={mutex === 0} onClick={produce} className="px-8 py-5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-[24px] font-black tracking-wide text-lg shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                    <Zap className="w-5 h-5" /> Produce
                </button>
                <button disabled={mutex === 0} onClick={consume} className="px-8 py-5 bg-amber-500 hover:bg-amber-400 text-white rounded-[24px] font-black tracking-wide text-lg shadow-lg shadow-amber-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                    <MinusCircle className="w-5 h-5" /> Consume
                </button>
             </div>
          </div>

          <div className="glass rounded-[40px] p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-glow min-h-[300px] relative overflow-hidden">
             
             <div className="flex items-center gap-4 h-full py-8 overflow-x-auto custom-scrollbar px-4 pt-12">
                {Array.from({ length: bufferSize }).map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-32 h-40 border-4 border-dashed border-slate-300 dark:border-slate-700 rounded-[28px] relative flex flex-col justify-end p-2 bg-slate-50/50 dark:bg-slate-800/20">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 font-bold text-slate-400">Idx {i}</div>
                        {buffer[i] && (
                            <motion.div
                                initial={{ opacity: 0, y: -40, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 40, scale: 0.8 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg flex items-center justify-center"
                            >
                                <Package className="w-10 h-10 text-white opacity-80" />
                            </motion.div>
                        )}
                    </div>
                ))}
             </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[32px] p-6 shadow-xl border border-slate-800 overflow-hidden flex flex-col h-[600px]">
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-emerald-400" /> Execution Log
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                <AnimatePresence>
                    {logs.map((log) => (
                        <motion.div 
                            key={log.id} 
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            className={`p-3 rounded-xl text-sm font-mono border-l-4 ${
                                log.type === 'error' ? 'bg-rose-950/40 text-rose-300 border-rose-500' :
                                log.type === 'success' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500' :
                                log.type === 'warning' ? 'bg-amber-950/40 text-amber-300 border-amber-500' :
                                'bg-indigo-950/40 text-indigo-300 border-indigo-500'
                            }`}
                        >
                            {log.msg}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
      </div>
    </motion.div>
  );
}
