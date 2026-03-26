import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Play, RefreshCw, CheckCircle2, XOctagon } from 'lucide-react';

export default function BankersAlgorithm() {
  const [processes, setProcesses] = useState(5);
  const [resources, setResources] = useState(3); // A, B, C

  // Initialize Default State
  const [available, setAvailable] = useState([3, 3, 2]);
  const [allocation, setAllocation] = useState([
    [0, 1, 0], [2, 0, 0], [3, 0, 2], [2, 1, 1], [0, 0, 2]
  ]);
  const [max, setMax] = useState([
    [7, 5, 3], [3, 2, 2], [9, 0, 2], [2, 2, 2], [4, 3, 3]
  ]);

  const [simulationState, setSimulationState] = useState(null);

  const calculateNeed = () => {
    return max.map((row, i) => row.map((val, j) => val - allocation[i][j]));
  };

  const calculateSafeSequence = () => {
    let work = [...available];
    let finish = new Array(processes).fill(false);
    let safeSeq = [];
    let need = calculateNeed();
    let history = [];

    let count = 0;
    while (count < processes) {
      let found = false;
      for (let p = 0; p < processes; p++) {
        if (!finish[p]) {
          let canExecute = true;
          for (let j = 0; j < resources; j++) {
            if (need[p][j] > work[j]) {
              canExecute = false;
              break;
            }
          }
          if (canExecute) {
            for (let k = 0; k < resources; k++) {
              work[k] += allocation[p][k];
            }
            safeSeq.push(`P${p}`);
            finish[p] = true;
            found = true;
            history.push({ process: `P${p}`, workAfter: [...work] });
            count++;
          }
        }
      }
      if (!found) break; // Unsafe state
    }

    if (count < processes) {
      setSimulationState({ safe: false, safeSeq: [], history });
    } else {
      setSimulationState({ safe: true, safeSeq, history });
    }
  };

  const handleAllocationChange = (p, r, val) => {
    const newAlloc = [...allocation];
    newAlloc[p][r] = parseInt(val) || 0;
    setAllocation(newAlloc);
    setSimulationState(null);
  };

  const handleMaxChange = (p, r, val) => {
    const newMax = [...max];
    newMax[p][r] = parseInt(val) || 0;
    setMax(newMax);
    setSimulationState(null);
  };

  const need = calculateNeed();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-12 pb-24 px-4 sm:px-6">
      <header className="space-y-4 pt-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-rose-100 dark:bg-rose-900/30 rounded-2xl">
            <ShieldAlert className="w-8 h-8 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Banker's Algorithm</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">Interactive Deadlock Avoidance Matrix Visualizer</p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_350px] gap-8">
        <div className="glass rounded-[32px] p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-glow space-y-8 overflow-x-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-500">
              System State Matrix
            </h2>
            <div className="flex items-center gap-4">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Initial Available (A,B,C):</label>
              <div className="flex gap-2">
                {available.map((val, idx) => (
                  <input
                    key={idx} type="number" value={val}
                    onChange={(e) => {
                      const newAvail = [...available];
                      newAvail[idx] = parseInt(e.target.value) || 0;
                      setAvailable(newAvail);
                      setSimulationState(null);
                    }}
                    className="w-16 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-mono text-center focus:ring-2 focus:ring-rose-500"
                  />
                ))}
              </div>
            </div>
          </div>

          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase text-sm tracking-wider">
                <th className="pb-4 font-bold">Process</th>
                <th className="pb-4 font-bold">Allocation (A B C)</th>
                <th className="pb-4 font-bold">Max (A B C)</th>
                <th className="pb-4 font-bold">Need (A B C)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {Array.from({ length: processes }).map((_, p) => (
                <tr key={p} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 font-bold text-slate-700 dark:text-slate-300">P{p}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      {allocation[p]?.map((val, r) => (
                        <input
                          key={r} type="number" value={val} min="0" onChange={(e) => handleAllocationChange(p, r, e.target.value)}
                          className="w-14 p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 border-none font-mono text-center focus:ring-2 focus:ring-teal-500"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      {max[p]?.map((val, r) => (
                        <input
                          key={r} type="number" value={val} min="0" onChange={(e) => handleMaxChange(p, r, e.target.value)}
                          className="w-14 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border-none font-mono text-center focus:ring-2 focus:ring-indigo-500"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-3 text-rose-600 dark:text-rose-400 font-mono font-bold bg-rose-50 dark:bg-rose-900/10 inline-flex p-2 px-4 rounded-xl border border-rose-100 dark:border-rose-900/30">
                      {need[p]?.map((val, r) => <span key={r}>{val}</span>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-[32px] p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-glow flex flex-col gap-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Play className="w-5 h-5 text-rose-500" /> Control Engine
            </h3>
            
            <button
              onClick={calculateSafeSequence}
              className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              Calculate Sequence
            </button>
            <button
              onClick={() => setSimulationState(null)}
              className="w-full py-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RefreshCw className="w-5 h-5" /> Reset View
            </button>

            {simulationState && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className={`mt-4 p-6 rounded-3xl border-2 ${simulationState.safe ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}
              >
                {simulationState.safe ? (
                  <>
                    <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                      <h4 className="text-xl font-black">SYSTEM SAFE</h4>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Safe Sequence:</p>
                      <div className="flex flex-wrap gap-2 text-lg font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl">
                        {simulationState.safeSeq.join(' ➔ ')}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 text-red-600 dark:text-red-400">
                    <div className="flex items-center gap-3">
                      <XOctagon className="w-8 h-8" />
                      <h4 className="text-xl font-black">DEADLOCK IMMINENT</h4>
                    </div>
                    <p className="text-sm font-medium opacity-80 mt-2">Cannot satisfy system resource requests securely. Avoiding state.</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
