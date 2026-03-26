import { ALGORITHMS, isPreemptive, selectNextProcessId, shouldKeepRunning, shouldRotateRoundRobin } from './scheduler';
import { ProcessModel, PROCESS_STATES } from './processModel';


const MAX_TICKS = 500;

const cloneSharedState = (sharedState) => JSON.parse(JSON.stringify(sharedState ?? {}));



export class SimulationEngine {
  constructor(config) {
    this.name = config.name;
    this.algorithm = config.algorithm ?? 'fcfs';
    this.timeQuantum = Number(config.timeQuantum ?? 2);
    this.time = 0;
    this.readyQueue = [];
    this.waitingQueue = [];
    this.currentProcessId = null;
    this.currentSlice = 0;
    this.gantt = [];
    this.events = [];
    this.finished = false;
    this.sharedState = cloneSharedState(config.sharedState);

    this.processes = (config.processes ?? []).map((process, index) => new ProcessModel(process, index));
    this.processMap = Object.fromEntries(this.processes.map((process) => [process.id, process]));
    this.algorithmCatalog = ALGORITHMS;
  }

  getProcessById(processId) {
    return this.processMap[processId];
  }

  addToReady(processId) {
    if (!processId || this.readyQueue.includes(processId)) {
      return;
    }

    this.readyQueue.push(processId);
  }

  removeFromReady(processId) {
    this.readyQueue = this.readyQueue.filter((id) => id !== processId);
  }

  addToWaiting(processId) {
    if (!processId || this.waitingQueue.includes(processId)) {
      return;
    }

    this.waitingQueue.push(processId);
  }

  removeFromWaiting(processId) {
    this.waitingQueue = this.waitingQueue.filter((id) => id !== processId);
  }

  wakeProcesses(processIds) {
    for (const processId of processIds) {
      const process = this.getProcessById(processId);
      if (!process || process.state === PROCESS_STATES.TERMINATED) {
        continue;
      }

      process.state = PROCESS_STATES.READY;
      process.blockedReason = '';
      this.removeFromWaiting(processId);
      this.addToReady(processId);
    }
  }

  handleArrivals() {
    for (const process of this.processes) {
      if (process.state === PROCESS_STATES.NEW && process.arrivalTime <= this.time) {
        process.state = PROCESS_STATES.READY;
        this.addToReady(process.id);
      }
    }
  }

  schedule() {
    if (
      shouldKeepRunning({
        algorithm: this.algorithm,
        currentProcessId: this.currentProcessId,
        processMap: this.processMap,
      })
    ) {
      return;
    }

    if (this.currentProcessId && isPreemptive(this.algorithm)) {
      const currentProcess = this.getProcessById(this.currentProcessId);
      if (currentProcess && currentProcess.state === PROCESS_STATES.RUNNING) {
        currentProcess.state = PROCESS_STATES.READY;
        this.addToReady(currentProcess.id);
      }
      this.currentProcessId = null;
    }

    const nextProcessId = selectNextProcessId({
      algorithm: this.algorithm,
      timeQuantum: this.timeQuantum,
      processMap: this.processMap,
      readyQueue: this.readyQueue,
    });

    if (!nextProcessId) {
      return;
    }

    this.removeFromReady(nextProcessId);
    this.currentProcessId = nextProcessId;
    this.currentSlice = 0;

    const nextProcess = this.getProcessById(nextProcessId);
    nextProcess.state = PROCESS_STATES.RUNNING;
  }



  blockProcess(process, reason) {
    process.state = PROCESS_STATES.WAITING;
    process.blockedReason = reason;
    this.currentProcessId = null;
    this.currentSlice = 0;
    this.addToWaiting(process.id);
  }

  terminateProcess(process, completedAt) {
    process.state = PROCESS_STATES.TERMINATED;
    process.completionTime = completedAt;
    process.blockedReason = '';
    this.currentProcessId = null;
    this.currentSlice = 0;
  }



  executeProcess(process) {
    let cpuConsumed = false;

    while (true) {
      const instruction = process.getCurrentInstruction();
      if (!instruction) {
        this.terminateProcess(process, this.time + (cpuConsumed ? 1 : 0));
        return cpuConsumed ? process.id : 'Idle';
      }

      if (instruction.type === 'cpu') {
        if (cpuConsumed) {
          return process.id;
        }

        instruction.remaining -= 1;
        process.executedCpuTime += 1;
        cpuConsumed = true;
        this.currentSlice += 1;

        if (instruction.remaining <= 0) {
          process.advance();
          continue;
        }

        return process.id;
      }

      process.advance();
      return cpuConsumed ? process.id : 'Idle';
    }
  }

  finalizeRoundRobin() {
    if (!this.currentProcessId) {
      return;
    }

    const currentProcess = this.getProcessById(this.currentProcessId);
    if (!currentProcess || currentProcess.state !== PROCESS_STATES.RUNNING) {
      return;
    }

    if (
      shouldRotateRoundRobin({
        algorithm: this.algorithm,
        currentSlice: this.currentSlice,
        timeQuantum: this.timeQuantum,
      }) &&
      this.readyQueue.length > 0
    ) {
      currentProcess.state = PROCESS_STATES.READY;
      this.addToReady(currentProcess.id);
      this.currentProcessId = null;
      this.currentSlice = 0;
    }
  }

  updateWaitingTimes() {
    for (const processId of this.readyQueue) {
      const process = this.getProcessById(processId);
      if (process) {
        process.waitingTime += 1;
      }
    }
  }

  tick() {
    if (this.finished) {
      return this.getSnapshot();
    }

    this.handleArrivals();
    this.schedule();

    let executedProcessId = 'Idle';
    if (this.currentProcessId) {
      const currentProcess = this.getProcessById(this.currentProcessId);
      executedProcessId = this.executeProcess(currentProcess);
    }

    this.updateWaitingTimes();
    this.finalizeRoundRobin();
    this.gantt.push({
      time: this.time,
      processId: executedProcessId,
    });

    if (this.currentProcessId) {
      const currentProcess = this.getProcessById(this.currentProcessId);
      if (currentProcess && currentProcess.state === PROCESS_STATES.RUNNING) {
        currentProcess.state = PROCESS_STATES.RUNNING;
      }
    }

    this.time += 1;

    if (
      this.processes.every((process) => process.state === PROCESS_STATES.TERMINATED) ||
      this.time >= MAX_TICKS
    ) {
      this.finished = true;
    }

    return this.getSnapshot();
  }

  runToCompletion() {
    while (!this.finished) {
      this.tick();
    }

    return this.getSnapshot();
  }

  getMetrics() {
    const rows = this.processes.map((process) => {
      const turnaroundTime =
        process.completionTime === null ? null : process.completionTime - process.arrivalTime;
      const burstTime = process.getTotalBurstTime();
      return {
        id: process.id,
        arrivalTime: process.arrivalTime,
        priority: process.priority,
        state: process.state,
        burstTime,
        remainingCpuTime: process.getRemainingCpuTime(),
        completionTime: process.completionTime,
        turnaroundTime,
        waitingTime: process.waitingTime,
        blockedReason: process.blockedReason,
      };
    });

    const terminatedRows = rows.filter((row) => row.completionTime !== null);
    const averageWaitingTime =
      terminatedRows.length > 0
        ? Number(
            (
              terminatedRows.reduce((total, row) => total + row.waitingTime, 0) /
              terminatedRows.length
            ).toFixed(2),
          )
        : 0;
    const averageTurnaroundTime =
      terminatedRows.length > 0
        ? Number(
            (
              terminatedRows.reduce((total, row) => total + row.turnaroundTime, 0) /
              terminatedRows.length
            ).toFixed(2),
          )
        : 0;

    return { rows, averageWaitingTime, averageTurnaroundTime };
  }

  getSnapshot() {
    return {
      name: this.name,
      algorithm: this.algorithm,
      time: this.time,
      readyQueue: [...this.readyQueue],
      waitingQueue: [...this.waitingQueue],
      currentProcessId: this.currentProcessId,
      gantt: [...this.gantt],
      processes: this.getMetrics().rows,
      metrics: this.getMetrics(),
      sharedState: cloneSharedState(this.sharedState),

      finished: this.finished,
    };
  }
}

export const buildEngine = (scenarioConfig, schedulerConfig) =>
  new SimulationEngine({
    ...scenarioConfig,
    algorithm: schedulerConfig.algorithm,
    timeQuantum: schedulerConfig.timeQuantum,
  });

export const runScenarioComparison = (scenarioConfig, schedulerConfig) =>
  Object.fromEntries(
    ALGORITHMS.map((algorithm) => {
      const engine = buildEngine(scenarioConfig, {
        ...schedulerConfig,
        algorithm: algorithm.key,
      });
      const snapshot = engine.runToCompletion();
      return [algorithm.key, snapshot.metrics];
    }),
  );
