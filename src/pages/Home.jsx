import { ALGORITHMS } from '../engine/scheduler';
import ProcessEditor from '../components/ProcessEditor';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const createProcess = (index) => ({
  id: `P${index + 1}`,
  arrivalTime: 0,
  burstTime: 3,
  priority: 1,
});

export default function Home({
  scenarioKey,
  setScenarioKey,
  algorithm,
  setAlgorithm,
  timeQuantum,
  setTimeQuantum,
  processInputs,
  setProcessInputs,
  hasStarted,
  scenarioCatalog,
  onLaunch,
}) {
  const selectedScenario = scenarioCatalog.find((scenario) => scenario.key === scenarioKey);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      <header className="glass rounded-[32px] p-8 shadow-glow text-center md:text-left">
        <p className="text-sm uppercase tracking-[0.32em] text-teal-600 dark:text-teal-400 font-semibold mb-3">Operating System Simulator</p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-400">
          Interactive CPU Scheduling CPU Lab
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-7 text-slate-600 dark:text-slate-300 mx-auto md:mx-0">
          Configure a CPU scheduling scenario, choose your preferred algorithm, and watch state updates in real-time. Gain deep insights through dynamic analytics and execution summaries.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="glass rounded-[28px] p-6 shadow-glow flex flex-col h-full transform transition hover:scale-[1.01]">
          <p className="text-sm uppercase tracking-[0.28em] text-teal-600 dark:text-teal-400 font-medium">Scenario</p>
          <h2 className="mt-2 text-2xl font-bold mb-4">Select Lab Scenario</h2>
          <div className="grid gap-3 flex-grow">
            {scenarioCatalog.map((scenario) => (
              <button
                key={scenario.key}
                type="button"
                disabled={hasStarted}
                onClick={() => setScenarioKey(scenario.key)}
                className={`rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
                  scenario.key === scenarioKey
                    ? 'border-teal-500 bg-teal-500/10 text-slate-900 shadow-[0_0_15px_rgba(20,184,166,0.3)] dark:text-white dark:bg-teal-900/40'
                    : 'border-slate-200/70 text-slate-600 hover:border-teal-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <div className="text-base font-semibold">{scenario.label}</div>
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400 italic">
            {selectedScenario?.description}
          </p>
        </div>

        <div className="glass rounded-[28px] p-6 shadow-glow flex flex-col h-full transform transition hover:scale-[1.01]">
          <p className="text-sm uppercase tracking-[0.28em] text-teal-600 dark:text-teal-400 font-medium">Scheduler</p>
          <h2 className="mt-2 text-2xl font-bold mb-4">Pick Dispatch Strategy</h2>
          <div className="grid grid-cols-2 gap-3 flex-grow">
            {ALGORITHMS.map((item) => (
              <button
                key={item.key}
                type="button"
                disabled={hasStarted}
                onClick={() => setAlgorithm(item.key)}
                className={`rounded-2xl border px-4 py-3 text-center transition-all duration-200 ${
                  item.key === algorithm
                    ? 'border-teal-500 bg-teal-500/10 shadow-[0_0_15px_rgba(20,184,166,0.3)] text-slate-900 dark:text-white dark:bg-teal-900/40'
                    : 'border-slate-200/70 text-slate-600 hover:border-teal-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <div className="text-sm font-semibold">{item.label}</div>
              </button>
            ))}
          </div>

          <label className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Round Robin Time Quantum
            <input
              type="number"
              min="1"
              disabled={hasStarted}
              value={timeQuantum}
              onChange={(event) => setTimeQuantum(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-base shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
            />
          </label>
        </div>
      </div>

      <div className="glass rounded-[32px] p-6 shadow-glow">
        <ProcessEditor
          processes={processInputs}
          disabled={hasStarted}
          onAdd={() => setProcessInputs((current) => [...current, createProcess(current.length)])}
          onRemove={(index) =>
            setProcessInputs((current) =>
              current.length === 1 ? current : current.filter((_, currentIndex) => currentIndex !== index),
            )
          }
          onChange={(index, field, value) =>
            setProcessInputs((current) =>
              current.map((process, currentIndex) =>
                currentIndex === index ? { ...process, [field]: value } : process,
              ),
            )
          }
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onLaunch}
          className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-teal-500 px-8 py-4 font-semibold text-white shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all duration-300 hover:bg-teal-400 hover:shadow-[0_0_30px_rgba(20,184,166,0.6)] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:bg-teal-600 dark:hover:bg-teal-500"
        >
          <span className="relative z-10 text-lg">Launch Simulation Dashboard</span>
          <ArrowRight className="z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </button>
      </div>
    </motion.div>
  );
}
