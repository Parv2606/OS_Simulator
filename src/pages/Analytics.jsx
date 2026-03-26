import ComparisonChart from '../components/ComparisonChart';
import DynamicSummary from '../components/DynamicSummary';
import AlgorithmLogic from '../components/AlgorithmLogic';
import { motion } from 'framer-motion';

export default function Analytics({ snapshot, algorithm, comparisonResults }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Execution Analytics & Reasoning</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Deep dive into the problem statement analysis, timeline summaries, and performance comparisons.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <DynamicSummary snapshot={snapshot} />
        <AlgorithmLogic algorithm={algorithm} snapshot={snapshot} />
      </div>

      <div className="glass rounded-[32px] p-6 shadow-glow mt-8">
        <h3 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">Algorithm Performance Comparison</h3>
        <ComparisonChart allResults={comparisonResults} />
      </div>
    </motion.div>
  );
}
