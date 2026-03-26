import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, AlertCircle, Cpu, ShieldCheck, Code, List, CheckCircle2, XOctagon, BrainCircuit } from 'lucide-react';
import { osProblems } from '../data/theory';

export default function Encyclopedia() {
  const [activeId, setActiveId] = useState(osProblems[0].id);
  const activeProblem = osProblems.find(p => p.id === activeId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="grid gap-6 lg:grid-cols-[300px_1fr] h-[calc(100vh-140px)]"
    >
      {/* Sidebar Navigation */}
      <div className="glass rounded-[32px] overflow-hidden flex flex-col shadow-glow border border-slate-200/50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-900/40">
        <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-[32px] shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <BrainCircuit className="w-8 h-8 opacity-90" />
            <h2 className="text-xl font-black tracking-tight">OS Theory Vault</h2>
          </div>
          <p className="text-indigo-100 text-sm font-medium opacity-80">19 Core Problems Mastered</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-slim">
          {osProblems.map((problem) => {
            const isActive = activeId === problem.id;
            return (
              <button
                key={problem.id}
                onClick={() => setActiveId(problem.id)}
                className={`w-full text-left px-5 py-3.5 rounded-2xl transition-all duration-300 font-semibold text-sm ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 dark:text-purple-300 border-l-4 border-indigo-500 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white border-l-4 border-transparent'
                }`}
              >
                {problem.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass rounded-[32px] overflow-y-auto scrollbar-slim shadow-glow relative border border-slate-200/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeProblem.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-8 lg:p-12 space-y-12"
          >
            {/* Header section with gradient title */}
            <header className="border-b border-slate-200 dark:border-slate-800 pb-8">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 mb-6">
                Encyclopedia Entry
              </span>
              <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-6 leading-tight">
                {activeProblem.title}
              </h1>
              <p className="text-xl text-slate-700 dark:text-slate-300 font-medium leading-relaxed border-l-4 border-purple-400 pl-6 py-2 bg-gradient-to-r from-purple-500/5 to-transparent">
                {activeProblem.summary}
              </p>
            </header>

            <div className="grid gap-10 md:grid-cols-2">
              {/* Definition */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-6 h-6" />
                  <h3 className="text-2xl font-bold">Definition & Concept</h3>
                </div>
                <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-950/50 shadow-sm border border-slate-100 dark:border-slate-800">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                    {activeProblem.definition}
                  </p>
                </div>
              </section>

              {/* Working Scenario */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                  <Cpu className="w-6 h-6" />
                  <h3 className="text-2xl font-bold">Concept Working</h3>
                </div>
                <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 shadow-sm border border-emerald-100 dark:border-emerald-900/30">
                  <p className="text-emerald-800 dark:text-emerald-200/80 leading-relaxed text-lg italic">
                    "{activeProblem.working}"
                  </p>
                </div>
              </section>
            </div>

            {/* Reasons */}
            <section className="space-y-5">
              <div className="flex items-center gap-3 text-rose-500">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-2xl font-bold">Why it Occurs</h3>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {activeProblem.reasons.map((reason, idx) => (
                  <li key={idx} className="flex gap-4 p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 shadow-sm">
                    <XOctagon className="w-6 h-6 shrink-0 text-rose-400 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 block">{reason}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Solutions */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-teal-600 dark:text-teal-400">
                <ShieldCheck className="w-7 h-7" />
                <h3 className="text-3xl font-bold">Solutions</h3>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                {activeProblem.solutions.map((sol, idx) => (
                  <div key={idx} className="p-6 md:p-8 rounded-[28px] bg-gradient-to-br from-teal-500/10 to-transparent border border-teal-500/20 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-teal-500/10 transition-colors" />
                    <h4 className="text-xl font-bold text-teal-700 dark:text-teal-300 mb-3">{sol.method}</h4>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed relative z-10">{sol.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid gap-10 lg:grid-cols-2">
              {/* Algorithm */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-blue-500">
                  <List className="w-6 h-6" />
                  <h3 className="text-2xl font-bold">Algorithm Logic</h3>
                </div>
                <div className="p-6 rounded-3xl bg-slate-900 shadow-xl overflow-x-auto border border-slate-700">
                  <pre className="text-blue-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    <code>{activeProblem.algorithm}</code>
                  </pre>
                </div>
              </section>

              {/* Code */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-amber-500">
                  <Code className="w-6 h-6" />
                  <h3 className="text-2xl font-bold">Code Implementation</h3>
                </div>
                <div className="p-6 rounded-3xl bg-[#0d1117] shadow-xl overflow-x-auto border border-slate-800">
                  <pre className="text-amber-200/90 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    <code>{activeProblem.code}</code>
                  </pre>
                </div>
              </section>
            </div>

            {/* Pros and Cons */}
            <section className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" /> Advantages
                </h4>
                <ul className="space-y-3">
                  {activeProblem.pros.map((pro, idx) => (
                    <li key={idx} className="flex gap-3 text-slate-600 dark:text-slate-300 p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-xl font-bold text-rose-500">
                  <XOctagon className="w-5 h-5" /> Limitations
                </h4>
                <ul className="space-y-3">
                  {activeProblem.cons.map((con, idx) => (
                    <li key={idx} className="flex gap-3 text-slate-600 dark:text-slate-300 p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Viva Points */}
            <section className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 text-fuchsia-600 dark:text-fuchsia-400">
                <BrainCircuit className="w-7 h-7" />
                <h3 className="text-3xl font-black">Viva & Exam Points</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeProblem.vivaPoints.map((point, idx) => (
                  <div key={idx} className="p-5 bg-gradient-to-b from-fuchsia-500/10 to-transparent border border-fuchsia-500/20 rounded-[24px] shadow-sm transform transition hover:-translate-y-1 hover:shadow-md">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </section>

          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
