const cpu = (duration, label) => ({ type: 'cpu', duration, label });

export const defaultSchedulingProcesses = [
  { id: 'P1', arrivalTime: 0, burstTime: 6, priority: 2 },
  { id: 'P2', arrivalTime: 1, burstTime: 4, priority: 1 },
  { id: 'P3', arrivalTime: 3, burstTime: 5, priority: 3 },
  { id: 'P4', arrivalTime: 5, burstTime: 2, priority: 2 },
];

export const createSchedulingScenario = (processes) => ({
  name: 'CPU Scheduling Lab',
  key: 'scheduling',
  description: 'Pure scheduling workload with dynamic arrivals and no resource blocking.',
  resources: {},
  sharedState: {},
  processes: processes.map((process) => ({
    id: process.id,
    arrivalTime: Number(process.arrivalTime),
    priority: Number(process.priority),
    instructions: [cpu(Number(process.burstTime), `Burst ${process.burstTime}`)],
  })),
});

export const scenarioCatalog = [
  {
    key: 'scheduling',
    label: 'Scheduling Analytics',
    description: 'Explore CPU scheduling algorithms and see dynamic execution summaries, without sync complexities.',
    build: () => createSchedulingScenario(defaultSchedulingProcesses),
  }
];
