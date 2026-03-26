import { useMemo } from 'react';

export default function DynamicSummary({ snapshot }) {
  const summary = useMemo(() => {
    if (!snapshot || snapshot.time === 0) {
      return "The simulation hasn't started yet. Run the simulation to view a dynamic summary of execution events.";
    }

    const { gantt, processes, metrics } = snapshot;

    let text = [];
    
    // 1. Initial State
    text.push(`The simulation ran for a total of **${snapshot.time} ticks**. `);

    // 2. Process count
    const totalProcesses = processes.length;
    const completedProcesses = processes.filter(p => p.state === 'TERMINATED').length;
    text.push(`Out of **${totalProcesses}** total processes, **${completedProcesses}** have completed. `);

    if (completedProcesses > 0) {
      text.push(`The average waiting time was **${metrics.averageWaitingTime} ticks**, and the average turnaround time was **${metrics.averageTurnaroundTime} ticks**. `);
    }

    // 3. Gantt Chart Breakdown (Contextual transitions)
    if (gantt.length > 0) {
      let currentProc = gantt[0].processId;
      let duration = 1;
      let transitions = [];

      for (let i = 1; i <= gantt.length; i++) {
        if (i < gantt.length && gantt[i].processId === currentProc) {
          duration++;
        } else {
          transitions.push({ process: currentProc, duration });
          if (i < gantt.length) {
            currentProc = gantt[i].processId;
            duration = 1;
          }
        }
      }

      // Simplify transitions for readability
      if (transitions.length > 0) {
        text.push(`\n\n### Execution Timeline Summary\n`);
        const first = transitions[0];
        text.push(`The CPU began by executing **${first.process === 'Idle' ? 'nothing (Idle)' : first.process}** for ${first.duration} tick(s). `);
        
        let contextCount = 0;
        let idleCount = 0;
        
        transitions.forEach(curr => {
          if (curr.process === 'Idle') idleCount += curr.duration;
        });

        if (transitions.length > 3) {
          text.push(`There were multiple context switches as the scheduler cycled through the ready processes. `);
          const last = transitions[transitions.length - 1];
          text.push(`Finally, it executed **${last.process}** for ${last.duration} tick(s) before stopping.`);
        } else if (transitions.length > 1) {
          transitions.slice(1).forEach(t => {
            text.push(`Then, the CPU switched to **${t.process === 'Idle' ? 'Idle' : t.process}** for ${t.duration} tick(s). `);
          });
        }

        if (idleCount > 0) {
          text.push(`\n\n**Note:** The processor was Idle for a total of ${idleCount} tick(s), which implies a period where no processes were ready to execute.`);
        }
      }
    }

    return text.join('');
  }, [snapshot]);

  return (
    <div className="glass rounded-[32px] p-6 shadow-glow animate-fade-in">
      <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
          📊
        </span>
        Dynamic Execution Summary
      </h3>
      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-base">
        {summary.split('\n').map((paragraph, idx) => {
          if (paragraph.startsWith('###')) {
            return <h4 key={idx} className="text-xl font-bold mt-4 mb-2 text-teal-700 dark:text-teal-400">{paragraph.replace('### ', '')}</h4>;
          }
          if (paragraph.includes('**')) {
            // Very simple pseudo-markdown bold parser for the summary text
            const parts = paragraph.split('**');
            return (
              <p key={idx} className="mb-4">
                {parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-slate-900 dark:text-white">{part}</strong> : part))}
              </p>
            );
          }
          return <p key={idx} className="mb-4">{paragraph}</p>;
        })}
      </div>
    </div>
  );
}
