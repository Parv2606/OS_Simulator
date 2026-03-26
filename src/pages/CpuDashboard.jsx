import { useState, useEffect, useRef } from 'react';
import Home from './Home';
import Simulator from './Simulator';
import Analytics from './Analytics';
import { buildEngine, runScenarioComparison } from '../engine/simulationEngine';
import { createSchedulingScenario, defaultSchedulingProcesses, scenarioCatalog } from '../data/scenarios';
import { motion } from 'framer-motion';

const validateSchedulingInput = (processes, timeQuantum) => {
  for (const process of processes) {
    if (!process.id?.trim()) return 'Every process needs a Process ID.';
    if (Number(process.arrivalTime) < 0 || Number.isNaN(Number(process.arrivalTime))) return `Arrival time for ${process.id} must be 0 or greater.`;
    if (Number(process.burstTime) <= 0 || Number.isNaN(Number(process.burstTime))) return `Burst time for ${process.id} must be greater than 0.`;
  }
  if (Number(timeQuantum) <= 0 || Number.isNaN(Number(timeQuantum))) return 'Time quantum must be greater than 0.';
  return '';
};

export default function CpuDashboard() {
  const [scenarioKey, setScenarioKey] = useState('scheduling');
  const [algorithm, setAlgorithm] = useState('fcfs');
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [speed, setSpeed] = useState(500);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');
  const [processInputs, setProcessInputs] = useState(defaultSchedulingProcesses);
  const [snapshot, setSnapshot] = useState({
    time: 0, readyQueue: [], waitingQueue: [], currentProcessId: null, gantt: [], processes: [], metrics: { rows: [], averageWaitingTime: 0, averageTurnaroundTime: 0 }, sharedState: {}, finished: false,
  });
  const [comparisonResults, setComparisonResults] = useState({});
  const engineRef = useRef(null);

  const hasStarted = snapshot.gantt.length > 0 || snapshot.time > 0 || snapshot.finished;

  const resetSimulation = () => {
    const nextError = scenarioKey === 'scheduling' ? validateSchedulingInput(processInputs, timeQuantum) : '';
    if (nextError) { setError(nextError); return false; }
    const scenarioConfig = createSchedulingScenario(processInputs);
    const engine = buildEngine(scenarioConfig, { algorithm, timeQuantum });
    engineRef.current = engine;
    setSnapshot(engine.getSnapshot());
    setComparisonResults(runScenarioComparison(scenarioConfig, { algorithm, timeQuantum }));
    setError('');
    setIsRunning(false);
    return true;
  };

  useEffect(() => { if (!hasStarted) resetSimulation(); }, [scenarioKey, algorithm, timeQuantum, processInputs]);
  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setTimeout(() => {
      if (!engineRef.current) return;
      const nextSnapshot = engineRef.current.tick();
      setSnapshot(nextSnapshot);
      if (nextSnapshot.finished) setIsRunning(false);
    }, speed);
    return () => window.clearTimeout(timer);
  }, [isRunning, speed, snapshot.time]);

  const handleStart = () => {
    if (!engineRef.current && !resetSimulation()) return;
    if (snapshot.finished && !resetSimulation()) return;
    setIsRunning(true);
  };
  const handlePause = () => setIsRunning(false);
  const handleStep = () => {
    if (!engineRef.current && !resetSimulation()) return;
    setIsRunning(false);
    setSnapshot(engineRef.current.tick());
  };
  const handleReset = () => resetSimulation();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16 pb-24 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {error && (
        <div className="mb-6 rounded-3xl border border-rose-300 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      )}

      <section id="setup-section">
        <Home 
          scenarioKey={scenarioKey} setScenarioKey={setScenarioKey}
          algorithm={algorithm} setAlgorithm={setAlgorithm}
          timeQuantum={timeQuantum} setTimeQuantum={setTimeQuantum}
          processInputs={processInputs} setProcessInputs={setProcessInputs}
          hasStarted={hasStarted} scenarioCatalog={scenarioCatalog}
          onLaunch={() => {
              handleStart();
              setTimeout(() => document.getElementById('simulator-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
          }}
        />
      </section>

      {hasStarted && (
        <>
          <hr className="border-slate-200/60 dark:border-slate-800/60 shadow-sm" />
          <section id="simulator-section">
            <Simulator 
              snapshot={snapshot} isRunning={isRunning} speed={speed} setSpeed={setSpeed}
              handleStart={handleStart} handlePause={handlePause} handleStep={handleStep} handleReset={handleReset}
            />
          </section>
        </>
      )}

      {snapshot.finished && (
        <>
          <hr className="border-slate-200/60 dark:border-slate-800/60 shadow-sm" />
          <section id="analytics-section">
            <Analytics snapshot={snapshot} algorithm={algorithm} comparisonResults={comparisonResults} />
          </section>
        </>
      )}
    </motion.div>
  );
}
