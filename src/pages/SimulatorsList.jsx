import { motion } from 'framer-motion';
import { Activity, ShieldAlert, Package, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const simulators = [
  {
    id: 'cpu',
    path: '/cpu',
    title: 'CPU Scheduling',
    description: 'Explore Preemptive and Non-Preemptive process execution including FCFS, SRTF, and Round Robin natively.',
    icon: Activity,
    color: 'emerald',
  },
  {
    id: 'bankers',
    path: '/bankers',
    title: "Banker's Algorithm",
    description: 'An interactive mathematical matrix simulation visually calculating Deadlock Avoidance safe states dynamically.',
    icon: ShieldAlert,
    color: 'rose',
  },
  {
    id: 'producer-consumer',
    path: '/producer-consumer',
    title: 'Producer-Consumer',
    description: 'A visual sandbox demonstrating Bounded Buffer synchronization utilizing Semaphores and Mutexes.',
    icon: Package,
    color: 'amber',
  },
];

const colorVariants = {
    emerald: 'from-emerald-500 to-teal-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500',
    rose: 'from-rose-500 to-pink-500 text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 focus:ring-rose-500',
    amber: 'from-amber-500 to-orange-500 text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 focus:ring-amber-500',
};

const textVariants = {
    emerald: 'text-emerald-700 dark:text-emerald-300',
    rose: 'text-rose-700 dark:text-rose-300',
    amber: 'text-amber-700 dark:text-amber-300',
};

export default function SimulatorsList() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="max-w-7xl mx-auto space-y-12"
    >
      <header className="text-center space-y-4 pt-8">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
          Interactive <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">Concurrency</span> Lab
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
          Select an interactive architectural engine to visualize advanced Operating System paradigms.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-3 pt-6">
        {simulators.map((sim, i) => {
          const Icon = sim.icon;
          return (
            <motion.button
              key={sim.id}
              onClick={() => navigate(sim.path)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className={`text-left relative overflow-hidden group p-8 rounded-[32px] glass border transition-all duration-300 shadow-glow focus:outline-none focus:ring-4 ${colorVariants[sim.color]}`}
            >
              <div className="absolute top-0 right-0 w-40 h-40 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="mb-6 relative z-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-900 shadow-md ${textVariants[sim.color]}`}>
                  <Icon className="w-8 h-8" />
                </div>
              </div>

              <h2 className={`text-2xl font-bold mb-3 ${textVariants[sim.color]}`}>
                {sim.title}
              </h2>
              
              <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-8">
                {sim.description}
              </p>

              <div className={`mt-auto flex items-center gap-2 font-bold ${textVariants[sim.color]}`}>
                Launch Engine
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
