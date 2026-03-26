import { useMemo } from 'react';

export default function AlgorithmLogic({ algorithm, snapshot }) {
  const explanation = useMemo(() => {
    let behavior = "";
    let context = "";

    switch (algorithm) {
      case 'fcfs':
        behavior = "First-Come, First-Served (FCFS) is a non-preemptive algorithm that simply queues processes in the exact order they arrive.";
        break;
      case 'sjf':
        behavior = "Shortest Job First (SJF) is non-preemptive and selects the process with the smallest total burst time. If a process arrives with a shorter burst time than what's currently running, it must wait until the running process finishes.";
        break;
      case 'srtf':
        behavior = "Shortest Remaining Time First (SRTF) is the preemptive version of SJF. The scheduler constantly evaluates the remaining CPU time for all processes. If a newly arrived process has a shorter remaining burst time, it immediately preempts the current process.";
        break;
      case 'rr':
        behavior = "Round Robin (RR) is a preemptive algorithm designed for time-sharing. It assigns a fixed time quantum to each process in turn. Once the quantum expires, the process is preempted and moved to the back of the ready queue.";
        break;
      case 'priority':
        behavior = "Priority Scheduling is a non-preemptive algorithm that selects the process with the highest priority (lowest numerical value). Higher priority jobs jump ahead of lower priority jobs in the queue.";
        break;
      case 'priority-preemptive':
        behavior = "Preemptive Priority Scheduling constantly evaluates the priority of the running process against the ready queue. If a newly arrived process has a higher priority (lower number), the current process is immediately preempted.";
        break;
      default:
        behavior = "Unknown scheduling algorithm behavior.";
    }

    if (!snapshot || snapshot.time === 0) {
      context = "Start the simulation to see real-time observations of how this algorithm behaves with your current process workload.";
    } else {
      if (snapshot.currentProcessId) {
        context = `At tick ${snapshot.time}, the scheduler selected **${snapshot.currentProcessId}** to run. This aligns with the ${algorithm.toUpperCase()} rules because it was deemed the best candidate out of the processes currently resting in the Ready Queue.`;
      } else {
        context = `Currently at tick ${snapshot.time}, the CPU is **Idle**. This means the scheduler evaluated the Ready Queue and found no available processes to dispatch based on its rules (or they haven't arrived yet).`;
      }
      
      const readyIds = snapshot.readyQueue;
      if (readyIds.length > 0) {
        context += `\nThere are currently **${readyIds.length} process(es)** (${readyIds.join(', ')}) waiting in the Ready Queue. Under ${algorithm.toUpperCase()}, the process chosen next from this queue will strictly depend on the algorithm's specific selection criteria.`;
      } else {
        context += `\nThe Ready Queue is empty right now.`;
      }
    }

    return { behavior, context };
  }, [algorithm, snapshot]);

  return (
    <div className="glass rounded-[32px] p-6 shadow-glow animate-fade-in">
      <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          🧠
        </span>
        Algorithm Intelligence
      </h3>
      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-base">
        <p className="mb-6 border-l-4 border-indigo-400 pl-4 py-1 italic bg-indigo-50/50 dark:bg-indigo-900/10 rounded-r-xl">
          {explanation.behavior}
        </p>

        <h4 className="text-lg font-bold text-indigo-700 dark:text-indigo-400 mb-2">Live Contextual Observation</h4>
        {explanation.context.split('\n').map((paragraph, idx) => {
          if (paragraph.includes('**')) {
            const parts = paragraph.split('**');
            return (
              <p key={idx} className="mb-4">
                {parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700 px-1 rounded">{part}</strong> : part))}
              </p>
            );
          }
          return <p key={idx} className="mb-4">{paragraph}</p>;
        })}
      </div>
    </div>
  );
}
