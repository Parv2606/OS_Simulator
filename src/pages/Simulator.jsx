import { useMemo } from 'react';
import Controls from '../components/Controls';
import QueueView from '../components/QueueView';
import GanttChart from '../components/GanttChart';
import ProcessTable from '../components/ProcessTable';
import { motion } from 'framer-motion';

const PROCESS_COLORS = ['#06b6d4', '#22c55e', '#f97316', '#f43f5e', '#8b5cf6', '#eab308', '#14b8a6'];

const buildColorMap = (rows) =>
  rows.reduce(
    (accumulator, row, index) => ({
      ...accumulator,
      [row.id]: PROCESS_COLORS[index % PROCESS_COLORS.length],
    }),
    { Idle: '#64748b' },
  );

export default function Simulator({
  snapshot,
  isRunning,
  speed,
  setSpeed,
  handleStart,
  handlePause,
  handleStep,
  handleReset,
}) {
  const colors = useMemo(() => buildColorMap(snapshot.processes), [snapshot.processes]);
  const metrics = snapshot.metrics;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Controls
          isRunning={isRunning}
          onStart={handleStart}
          onPause={handlePause}
          onStep={handleStep}
          onReset={handleReset}
          speed={speed}
          onSpeedChange={setSpeed}
          disabled={snapshot.finished}
        />
        <QueueView
          currentProcessId={snapshot.currentProcessId}
          readyQueue={snapshot.readyQueue}
          waitingQueue={snapshot.waitingQueue}
        />
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="glass rounded-3xl p-6 shadow-glow text-center transform transition hover:scale-105">
          <p className="text-sm uppercase tracking-[0.22em] text-teal-600 dark:text-teal-400 font-semibold">Current Time</p>
          <p className="mt-3 text-4xl font-black text-slate-800 dark:text-white drop-shadow-sm">{snapshot.time}</p>
        </div>
        <div className="glass rounded-3xl p-6 shadow-glow text-center transform transition hover:scale-105">
          <p className="text-sm uppercase tracking-[0.22em] text-teal-600 dark:text-teal-400 font-semibold">Avg Waiting Time</p>
          <p className="mt-3 text-4xl font-black text-slate-800 dark:text-white drop-shadow-sm">{metrics.averageWaitingTime}</p>
        </div>
        <div className="glass rounded-3xl p-6 shadow-glow text-center transform transition hover:scale-105">
          <p className="text-sm uppercase tracking-[0.22em] text-teal-600 dark:text-teal-400 font-semibold">Avg Turnaround Time</p>
          <p className="mt-3 text-4xl font-black text-slate-800 dark:text-white drop-shadow-sm">{metrics.averageTurnaroundTime}</p>
        </div>
      </section>

      <div className="glass rounded-[32px] p-6 shadow-glow">
        <h3 className="text-xl font-bold mb-4 ml-2">Execution Timeline</h3>
        <GanttChart timeline={snapshot.gantt} colors={colors} currentTime={snapshot.time} />
      </div>

      <div className="glass rounded-[32px] p-6 shadow-glow">
        <h3 className="text-xl font-bold mb-4 ml-2">Process State Table</h3>
        <ProcessTable rows={snapshot.processes} />
      </div>
    </motion.div>
  );
}
