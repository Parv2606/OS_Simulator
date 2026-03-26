export const osProblems = [
  {
    id: 'producer-consumer',
    title: 'Producer–Consumer Problem',
    definition: 'The Producer-Consumer problem is a classic synchronization problem involving two entities: a Producer that generates data and places it in a shared buffer, and a Consumer that takes data out of the buffer to process it. The core concept revolves around ensuring both entities coordinate safely so data is neither lost nor read multiple times.',
    reasons: [
      'The buffer is of a finite, bounded size.',
      'A Producer might try to insert data into a completely full buffer.',
      'A Consumer might try to remove data from an entirely empty buffer.',
      'Concurrent access to the shared buffer array without locks causes data corruption.',
    ],
    working: 'Imagine a bakery (Producer) placing fresh bread on a display shelf (Buffer) and customers (Consumers) taking the bread. If the shelf is full, the baker must wait (sleep) until a customer buys some. If the shelf is empty, customers must wait until the baker bakes more. Without protection, a baker and customer might reach for the exact same slot simultaneously.',
    solutions: [
      {
        method: 'Semaphores',
        description: 'Use three semaphores: "empty" (counts available slots), "full" (counts filled slots), and a "mutex" (binary semaphore) to protect the critical section (buffer manipulation).',
      },
    ],
    algorithm: `// Semaphore Initialization
semaphore mutex = 1;
semaphore empty = N; // N is buffer size
semaphore full = 0;

Producer() {
  while(true) {
    item = produce();
    wait(empty);
    wait(mutex);
    insert_into_buffer(item);
    signal(mutex);
    signal(full);
  }
}

Consumer() {
  while(true) {
    wait(full);
    wait(mutex);
    item = remove_from_buffer();
    signal(mutex);
    signal(empty);
    consume(item);
  }
}`,
    pros: ['Ensures absolute data integrity.', 'Prevents buffer overflow and underflow.', 'Highly scalable standard mechanism.'],
    cons: ['Complex to implement correctly natively.', 'A single improper wait/signal order can immediately cause deadlock.'],
    vivaPoints: [
      'It perfectly demonstrates the Bounded-Buffer synchronization issue.',
      'The mutex semaphore strictly prevents race conditions on the shared array index.',
      'Swapping wait(empty) and wait(mutex) in the producer completely deadlocks the system.',
    ],
    code: `// C-style pseudo implementation using Pthreads
#include <pthread.h>
#include <semaphore.h>

int buffer[10], count = 0;
sem_t empty, full;
pthread_mutex_t mutex;

void* producer(void* arg) {
    sem_wait(&empty);
    pthread_mutex_lock(&mutex);
    buffer[count++] = 1; // Produce item
    pthread_mutex_unlock(&mutex);
    sem_post(&full);
}

void* consumer(void* arg) {
    sem_wait(&full);
    pthread_mutex_lock(&mutex);
    int item = buffer[--count]; // Consume item
    pthread_mutex_unlock(&mutex);
    sem_post(&empty);
}`,
    summary: 'The Producer-Consumer problem strictly prevents a producer from adding to a full buffer and a consumer from reading from an empty buffer by utilizing counting semaphores and a mutual exclusion lock to coordinate safe, shared access.',
  },
  {
    id: 'readers-writers',
    title: 'Readers–Writers Problem',
    definition: 'A synchronization problem where a shared data resource (like a file or database) is accessed by multiple processes. Some processes only read the data (Readers), while others both read and modify the data (Writers). The issue is allowing multiple concurrent readers safely, but ensuring a writer has exclusive access.',
    reasons: [
      'Multiple readers viewing data simultaneously is completely safe and increases throughput.',
      'If a writer modifies data while a reader reads it, the reader will pull corrupted, inconsistent data.',
      'If two writers edit simultaneously, the file becomes permanently corrupted.',
      'Giving writers absolute priority might starve readers, and vice versa.',
    ],
    working: 'Imagine a digital bulletin board. 100 people can stand and read the board at the exact same time without issue. However, if an admin (Writer) approaches to erase or rewrite a message, all readers must step back. No one can read while the admin writes, and two admins cannot write at the same time.',
    solutions: [
      {
        method: 'Mutex and Read Count',
        description: 'Use a mutex to protect a "read_count" variable. The first reader blocks writers, and the last reader unblocks writers. Writers use a global "wrt" semaphore.',
      },
    ],
    algorithm: `// Semaphore Initialization
semaphore rw_mutex = 1; // controls access to resource
semaphore mutex = 1;    // controls access to read_count
int read_count = 0;

Reader() {
  wait(mutex);
  read_count++;
  if (read_count == 1) wait(rw_mutex); // First reader locks writer
  signal(mutex);

  // Perform reading

  wait(mutex);
  read_count--;
  if (read_count == 0) signal(rw_mutex); // Last reader unlocks
  signal(mutex);
}

Writer() {
  wait(rw_mutex);
  // Perform writing
  signal(rw_mutex);
}`,
    pros: ['Maximizes concurrency by allowing infinite simultaneous readers.', 'Ensures strict mutual exclusion for writers.'],
    cons: ['First Readers-Writers implementation often leads to Writer Starvation (readers keep pouring in and the writer never gets a turn).'],
    vivaPoints: [
      'Multiple readers can execute in the critical section concurrently.',
      'Writers require absolute strict mutual exclusion.',
      'Understand the difference between Reader-Preference (writers starve) vs Writer-Preference (readers starve).',
    ],
    code: `// Java snippet for Readers-Writers logic
import java.util.concurrent.Semaphore;

class ReadWriteLock {
    int readCount = 0;
    Semaphore mutex = new Semaphore(1);
    Semaphore rw_mutex = new Semaphore(1);

    void startRead() throws InterruptedException {
        mutex.acquire();
        readCount++;
        if (readCount == 1) rw_mutex.acquire(); // block writers
        mutex.release();
    }
    void endRead() throws InterruptedException {
        mutex.acquire();
        readCount--;
        if (readCount == 0) rw_mutex.release(); // allow writers
        mutex.release();
    }
    void write() throws InterruptedException {
        rw_mutex.acquire();
        // Modify data inside
        rw_mutex.release();
    }
}`,
    summary: 'The Readers-Writers problem efficiently manages a shared database by allowing multiple concurrent readers to access data simultaneously, while mathematically enforcing that any active writer receives absolute, exclusive access to prevent data corruption.',
  },
  {
    id: 'dining-philosophers',
    title: 'Dining Philosophers Problem',
    definition: 'A classical synchronization puzzle formulated by Dijkstra. Five philosophers sit around a circular table. Between each philosopher is a single chopstick. A philosopher needs two chopsticks (left and right) to eat. The problem represents resource allocation and deadlock avoidance in operating systems.',
    reasons: [
      'Resources (chopsticks) are heavily restricted and non-shareable.',
      'A process (philosopher) fundamentally requires multiple specific resources simultaneously to progress.',
      'Circular wait condition can occur easily if all independently grab their left resource.',
      'Uncontrolled allocation directly manifests into total system deadlock.',
    ],
    working: 'Five philosophers alternate between thinking and eating. When hungry, a philosopher reaches for their left chopstick, then their right. If all 5 become hungry simultaneously and grab their left chopstick, they will all wait forever for the right chopstick. Total deadlock.',
    solutions: [
      {
        method: 'Asymmetric Acquisition (Resource Hierarchy)',
        description: 'Rule breaking: Make the last philosopher (or all even-numbered ones) pick up their right chopstick first. This destroys the circular wait condition necessary for deadlock.',
      },
      {
        method: 'Monitor/State Array',
        description: 'Track the state of each philosopher (Thinking, Hungry, Eating), ensuring a philosopher only transitions to Eating if both immediate neighbors are NOT eating.',
      }
    ],
    algorithm: `// Array of semaphores for chopsticks
semaphore chopstick[5] = {1, 1, 1, 1, 1};

Philosopher(int i) {
  while(true) {
    think();
    // Asymmetric solution to prevent deadlock
    if (i % 2 == 0) {
      wait(chopstick[i]);                 // left
      wait(chopstick[(i+1) % 5]);         // right
    } else {
      wait(chopstick[(i+1) % 5]);         // right
      wait(chopstick[i]);                 // left
    }
    eat();
    signal(chopstick[i]);
    signal(chopstick[(i+1) % 5]);
  }
}`,
    pros: ['Beautifully illustrates the four Coffman conditions for deadlock.', 'Asymmetric solution completely guarantees deadlock freedom.'],
    cons: ['Starvation is still technically possible theoretically if a philosopher gets perfectly out-paced by neighbors.'],
    vivaPoints: [
      'It models the "Circular Wait" deadlock condition perfectly.',
      'If every philosopher picks up their left chopstick simultaneously, deadlock occurs instantly.',
      'The best practical solution is resource hierarchy (picking up odd/even chopsticks differently).'
    ],
    code: `// Python example showcasing asymmetric solution
import threading, time

def philosopher(index, left_chopstick, right_chopstick):
    while True:
        # Avoid circular wait: odd index grabs right first
        first = right_chopstick if index % 2 != 0 else left_chopstick
        second = left_chopstick if index % 2 != 0 else right_chopstick
        
        with first:
            with second:
                print(f"Philosopher {index} is Eating")
                time.sleep(1)
        print(f"Philosopher {index} is Thinking")
        time.sleep(1)`,
    summary: 'Dining Philosophers brilliantly demonstrates the dangers of circular wait and system resource deadlocks. Solving it requires strategic asymmetric resource allocation protocols to ensure that concurrent processes do not eternally block each other.',
  },
  {
    id: 'critical-section',
    title: 'Critical Section Problem',
    definition: 'The Critical Section problem refers to designing a protocol that allows cooperative processes to safely execute segments of code where they access and modify strictly shared data. The protocol must guarantee that no two processes execute their critical sections simultaneously.',
    reasons: [
      'Processes utilize inherently shared variables, memory spaces, or hardware resources.',
      'Without coordination, concurrent writes overlap and overwrite each other at the hardware execution level.',
      'Preemptive scheduling can pause a process right in the middle of a variable update.',
      'Lack of atomic operations leads to fragmented logic sequences.',
    ],
    working: 'Consider a bank account variable `Balance = $100`. Process A attempts to deposit $50, and Process B attempts to withdraw $20 simultaneously. If A reads 100, B reads 100, A writes 150, and then B writes 80, the $50 deposit is permanently lost. The updating code block is the Critical Section.',
    solutions: [
      {
        method: 'Petersons Solution',
        description: 'A software-based algorithm for exactly 2 processes using a `turn` integer and `flag` boolean array.',
      },
      {
        method: 'Hardware Synchronization (Test-and-Set)',
        description: 'Using atomic CPU assembly instructions (like TestAndSet or CompareAndSwap) to instantly lock a boolean without interruption.',
      }
    ],
    algorithm: `// General architecture of a Critical Section environment
do {
  Entry_Section();
  
    // Critical Section
    balance = balance + X; 

  Exit_Section();
  
    // Remainder Section
} while (true);`,
    pros: ['Proper implementations ensure 100% data consistency.', 'Prevents silent state corruption in highly threaded systems.'],
    cons: ['Software solutions (like Peterson) do not scale well beyond 2 processes.', 'Incorrect entry/exit sections can lead to deadlock or starvation.'],
    vivaPoints: [
      'A valid solution MUST satisfy 3 conditions: Mutual Exclusion, Progress, and Bounded Waiting.',
      'Progress means if no one is in the critical section, a process wanting to enter cannot be blocked indefinitely.',
      'Bounded Waiting guarantees a process will eventually get its turn.',
    ],
    code: `// Simulation of standard locking mechanism
boolean lock = false;

void enterRegion() {
    // Spinlock (Busy wait) until lock is acquired
    while (TestAndSet(&lock) == true) {
        // do nothing, just wait CPU cycles
    }
}

void leaveRegion() {
    lock = false; // release for other threads
}`,
    summary: 'The Critical Section problem dictates the fundamental necessity of designing entry and exit protocols for concurrent code blocks so that shared variables are mathematically protected against simultaneous, corrupting overlapping operations.',
  },
  {
    id: 'mutual-exclusion',
    title: 'Mutual Exclusion Problem',
    definition: 'Mutual Exclusion (Mutex) is a fundamental concurrent programming requirement ensuring that if a process is actively executing within its critical section, absolutely no other process can be allowed to execute within that same critical section.',
    reasons: [
      'Processes run asynchronously and can be preempted at microscopic intervals.',
      'Hardware registers load, increment, and store variables in separate discrete cycles.',
      'A complete failure to enforce it leads directly to Race Conditions.',
      'It is the foundational axiom required for data structure integrity in OS kernels.',
    ],
    working: 'If a printer (shared resource) is currently printing Document A for User 1, User 2 must not be able to send Document B to print on the exact same pages simultaneously. The printer enforces mutual exclusion; User 2 is queued until User 1 gracefully exits.',
    solutions: [
      {
        method: 'Mutex Locks',
        description: 'An OS-provided object with `acquire()` and `release()` primitive methods. Also called a binary semaphore.',
      },
      {
        method: 'Disabling Interrupts',
        description: 'In single-processor systems, simply turn off CPU interrupts during the critical section. (Dangerous and not used by user software).',
      }
    ],
    algorithm: `// standard Mutex object usage
Mutex lock;

acquire(lock) {
   while(!lock.available) sleep();
   lock.available = false;
}

release(lock) {
   lock.available = true;
   wakeup_next_process();
}`,
    pros: ['Complete elimination of race conditions.', 'Standard Mutex locks are highly optimized in modern OS kernels.'],
    cons: ['Can easily cause Deadlocks if locks are heavily nested and acquired out of order.', 'Forces sequential execution, hurting raw parallel processing speed.'],
    vivaPoints: [
      'Mutual exclusion is Condition #1 for solving the Critical Section problem.',
      'A `Mutex` differs from a `Semaphore` as a Mutex has ownership (only the locking thread can unlock it).',
      'Spinlocks provide mutual exclusion but waste CPU cycles via busy waiting.',
    ],
    code: `// C++ std::mutex implementation pattern
#include <mutex>
#include <iostream>

std::mutex mtx;
int shared_data = 0;

void safe_increment() {
    mtx.lock();       // Enforce mutual exclusion
    shared_data++;    // Safely edit
    mtx.unlock();     // Release exclusion
}`,
    summary: 'Mutual Exclusion is the strict and unyielding programmatic guarantee that shared resources or specific logic blocks are engaged by only one thread or process at any given temporal moment to prevent structural collapse.',
  },
  {
    id: 'race-condition',
    title: 'Race Condition',
    definition: 'A Race Condition is an extremely dangerous software flaw that occurs when the behavior of a system heavily depends on the sequence or specific microsecond timing of uncontrollable events (like thread scheduling). When threads "race" to modify data, the outcome depends on who finishes last.',
    reasons: [
      'Complete absence of Mutual Exclusion protocols.',
      'High-level language statements (like count++) actually execute as multiple machine code assembly instructions.',
      'Threads are silently paused (content switched) exactly between reading a variable and storing the updated version.',
    ],
    working: 'You and a friend share a joint bank account of $1000. You both use ATMs in different cities simultaneously to withdraw $100. ATM A reads $1000. ATM B reads $1000. A calculates 900 and saves it. B calculates 900 and saves it. The final balance is $900 despite $200 being withdrawn. This is a severe race condition loss.',
    solutions: [
      {
        method: 'Atomic Operations',
        description: 'Utilize specialized CPU instructions that execute entirely in one unbreakable clock cycle.',
      },
      {
        method: 'Synchronization Primitives',
        description: 'Implement heavily guarded Semaphores, Monitors, or Mutexes around the variables in question.',
      }
    ],
    algorithm: `// Example of Race Condition manifestation
int tickets = 1;

Thread A:
1. read(tickets) -> gets 1
2. Context Switch to B!

Thread B:
3. read(tickets) -> gets 1
4. tickets = 1 - 1 -> saves 0
5. return "Success!"

Thread A resumes:
6. tickets = 1 - 1 -> saves 0
7. return "Success!"
// Result: 2 users got the same single ticket!`,
    pros: ['Understanding race conditions allows engineers to design thread-safe, resilient backend servers.', 'Atomic solutions are extremely fast.'],
    cons: ['Race conditions are notoriously difficult to reproduce, debug, or log because they depend on micro-second coincidences.'],
    vivaPoints: [
      'Race conditions ONLY occur if variables are shared AND mutable (modifiable).',
      'They represent a non-deterministic bug (the code works 99% of the time, fails randomly).',
      'The ultimate cure for a race condition is strict Critical Section regulation.',
    ],
    code: `// Java AtomicInteger prevents race conditions natively
import java.util.concurrent.atomic.AtomicInteger;

class Counter {
    private AtomicInteger count = new AtomicInteger(0);

    // This operation is unbreakable and completely immune to race conditions
    public void increment() {
        count.incrementAndGet(); 
    }
}`,
    summary: 'A Race Condition is a catastrophic timing anomaly where concurrent threads execute read/write operations simultaneously without synchronization, resulting in random, silently corrupted data values dictated purely by OS scheduling luck.',
  },
  {
    id: 'deadlock-problem',
    title: 'Deadlock Problem',
    definition: 'Deadlock is a severe system state where a set of processes are permanently blocked because each process is holding a resource while simultaneously waiting to acquire a resource held by another process in that exact same set.',
    reasons: [
      'Mutual Exclusion: Resources cannot be shared.',
      'Hold and Wait: Processes hold acquired resources while demanding new ones.',
      'No Preemption: The OS cannot forcefully take the resource away from a holding process.',
      'Circular Wait: A chain of two or more processes each waiting for a resource held by the next member in the chain.',
    ],
    working: 'Think of a narrow bridge where only one car can cross at a time. Car A enters from the Left, and Car B enters from the Right. They meet perfectly in the exact middle. Neither can go forward (Mutual Exclusion). Neither will reverse (Hold and Wait/No Preemption). They are perpetually stuck forming a Deadlock.',
    solutions: [
      {
        method: 'Deadlock Prevention',
        description: 'Structurally break at least one of the 4 Coffman conditions before execution even begins.',
      },
      {
        method: 'Deadlock Avoidance',
        description: 'Use intelligent OS allocation algorithms (like Bankers Algorithm) to actively monitor states and deny unsafe requests.',
      },
      {
        method: 'Ostrich Algorithm',
        description: 'Simply ignore the problem entirely. Standard UNIX/Windows approach. When it freezes, the user reboots the app.',
      }
    ],
    algorithm: `// Demonstrating Circular Wait (Deadlock Mechanism)
Process P1:
  wait(Mutex_A);
  wait(Mutex_B); // Gets stuck here waiting for P2
  
Process P2:
  wait(Mutex_B);
  wait(Mutex_A); // Gets stuck here waiting for P1`,
    pros: ['Deadlock algorithms ensure ultra-high stability systems (Mars rovers, pacemakers) absolutely never freeze.'],
    cons: ['Avoidance algorithms (Bankers) are massively CPU intensive and require knowing exact resource needs in advance.'],
    vivaPoints: [
      'Coffman stated exactly 4 conditions MUST hold simultaneously for a deadlock to exist.',
      'The Ostrich algorithm is the most common OS response because mathematical deadlock prevention is too expensive performance-wise.',
      'Circular wait is mathematically identical to finding a cycle in a Resource Allocation Graph (RAG).',
    ],
    code: `// Python threading deadlock scenario (DO NOT RUN unless testing)
import threading
lock1 = threading.Lock()
lock2 = threading.Lock()

def thread_1():
    lock1.acquire()
    # Context switch happens here!
    lock2.acquire() # Boom, deadlock

def thread_2():
    lock2.acquire()
    lock1.acquire() # Boom, deadlock`,
    summary: 'Deadlock is an inescapable system paralysis that violently occurs when multiple processes hold isolated resources aggressively while eternally demanding complementary resources held by their peers, satisfying the four Coffman conditions.',
  },
  {
    id: 'starvation-problem',
    title: 'Starvation (Indefinite Blocking)',
    definition: 'Starvation occurs when a process is perpetually denied the basic resources (like CPU time) it requires to progress because the OS allocator or scheduling algorithm continuously favors other processes over it.',
    reasons: [
      'Aggressive Priority Scheduling: Low priority tasks get ignored if high priority tasks constantly arrive.',
      'Shortest Job First (SJF): A steady stream of short tasks will eternally starve one massive, long calculation task.',
      'Biased resource allocation logic (e.g., locking writers out because readers keep flooding in).',
    ],
    working: 'Imagine a heavily crowded hospital ER using strict Priority triage. You enter with a sprained ankle (Low Priority). However, ambulances keep continuously arriving with severe heart attack patients (High Priority). Because the high priority stream never strictly stops, the doctor never sees you, causing you to "starve" in the waiting room.',
    solutions: [
      {
        method: 'Aging',
        description: 'A dynamic scheduling adjustment where the OS systematically increases the priority of a process the longer it stays waiting in the system queue.',
      },
      {
        method: 'Round Robin / First-Come-First-Serve',
        description: 'Fallback algorithms that forcefully strip priority and enforce mathematical fairness through time-boxing.',
      }
    ],
    algorithm: `// Basic Aging Algorithm logic inside scheduler loop
function calculatePriority() {
  for (process in ready_queue) {
    process.waiting_time++;
    
    // Every 10 min, boost priority
    if (process.waiting_time > threshold) {
      process.priority = process.priority + 1;
      process.waiting_time = 0; // reset
    }
  }
}`,
    pros: ['Aging guarantees that all processes mathematically will eventually execute (Bounded Waiting is achieved).'],
    cons: ['Starvation prevention hurts system metrics by inevitably forcing the system to temporarily run "unimportant" tasks over optimized ones.'],
    vivaPoints: [
      'Starvation is NOT a Deadlock. In starvation, the system is actively working, but your specific program is being ignored. Deadlock means the whole system is frozen.',
      'Aging is the universally accepted canonical cure for Starvation.',
      'SJF and Priority Scheduling are highly vulnerable to this.',
    ],
    code: `// Simple visual logic showing starvation bypass via aging
class Process {
    int id;
    int priority;
    int waitCounter;

    void tickEvent() {
        waitCounter++;
        if (waitCounter > 100) {
            priority++; // Aging process
            waitCounter = 0;
            System.out.println("Process " + id + " aged up!");
        }
    }
}`,
    summary: 'Starvation is the tragic condition where a valid computer process remains infinitely queued, capable of running but systematically ignored by aggressive scheduling algorithms biased toward faster or higher-priority tasks, requiring Aging to cure.',
  },
  {
    id: 'busy-waiting',
    title: 'Busy Waiting Problem',
    definition: 'Busy waiting (or spinning) is a performance-draining technique where a process repeatedly and rapidly checks a condition (like a lock status) in a tight loop to see if it is true, rather than going to sleep and waiting for a system wakeup call.',
    reasons: [
      'Implementation of pure Software locks (Peterson\'s solution).',
      'Using Spinlocks on single-core systems.',
      'Poorly coded multi-threading applications relying on arbitrary boolean flags instead of proper Semaphores.',
    ],
    working: 'Imagine waiting for your friend to finish using a bathroom. Busy Waiting is mathematically equivalent to knocking on the door every 0.1 seconds asking "Are you done yet?". You are exhausting enormous amounts of physical energy (CPU) achieving nothing but aggressive polling.',
    solutions: [
      {
        method: 'Sleep and Wakeup Primitives',
        description: 'Use OS level blocking mechanisms `sleep()` and `wakeup()` or Semaphore `block()` queues. The OS deschedules the process immediately.',
      },
      {
        method: 'Hardware Handled Interrupts',
        description: 'Utilize specialized hardware buses that throw interrupts to awaken threads instantly without loops.',
      }
    ],
    algorithm: `// Bad: Busy Waiting (Spinlock)
while (lock_status == BLOCKED) {
   // doing nothing, but burning 100% CPU core
}

// Good: Sleep/Wake (Semaphore)
if (lock_status == BLOCKED) {
   sleep(); // OS puts this thread completely to sleep! 0% CPU
}`,
    pros: ['Spinlocks are incredibly useful in specific multi-core kernel level tasks where the lock is only explicitly held for a few nanoseconds (saves context switch time).'],
    cons: ['In user-space or single-core execution, busy waiting wastes massive CPU cycles, drains batteries rapidly, and causes system extreme sluggishness.'],
    vivaPoints: [
      'Busy waiting directly wastes CPU time that could be dedicated to another active algorithm.',
      'A `Spinlock` is the literal definition of a busy-waiting lock.',
      'Standard Mutexes use block-queues to bypass busy waiting entirely.',
    ],
    code: `// The exact difference in C/Linux
#include <pthread.h>
pthread_mutex_t mtx;
pthread_spinlock_t spinlock;

// Wastes CPU polling
void process_spin() {
    pthread_spin_lock(&spinlock);
    // critical section
    pthread_spin_unlock(&spinlock);
}

// OS puts thread to sleep, 0 CPU wasted
void process_sleep() {
    pthread_mutex_lock(&mtx);
    // critical section
    pthread_mutex_unlock(&mtx);
}`,
    summary: 'Busy Waiting is an inefficient polling flaw where a process continuously burns crucial CPU cycles rapidly re-checking a locked threshold, rather than utilizing OS sleeper queues, generating artificial bottlenecks.',
  },
  {
    id: 'priority-inversion',
    title: 'Priority Inversion Problem',
    definition: 'Priority Inversion is an insidious scheduling anomaly where a high-priority task is indirectly blocked and forced to wait for a remarkably lower-priority task to finish, because the low-priority task holds a heavily guarded shared resource.',
    reasons: [
      'A Low Priority (LP) task locks a Mutex on a shared resource.',
      'A High Priority (HP) task preempts LP, but violently blocks on that exact Mutex.',
      'A Medium Priority (MP) task arrives, preempts the LP task (since MP > LP), and runs forever.',
      'HP is now completely starved by MP, breaking fundamental priority rules.',
    ],
    working: 'The CEO (High Priority) needs a specific boardroom but heavily delays because the Janitor (Low Priority) locked it to clean. The Janitor is about to efficiently finish and unlock it, but a middle-manager (Medium Priority) grabs the Janitor for a totally different task. Now the CEO is waiting on the middle-manager. Complete logic breakdown!',
    solutions: [
      {
        method: 'Priority Inheritance Protocol (PIP)',
        description: 'If a High Priority task blocks on a Mutex held by a Low Priority task, the Low Priority task instantly "inherits" the High Priority status until it unlocks the Mutex. No Medium task can interrupt it now.',
      },
      {
        method: 'Priority Ceiling Protocol',
        description: 'Assigns an artificial global priority ceiling to the shared mutex itself equal to the highest priority task that might ever use it.',
      }
    ],
    algorithm: `// Priority Inheritance simplified logic
if (HighTask.requests(Mutex) && Mutex.isHeldBy(LowTask)) {
   // Temporarily boost the low task to finish fast!
   LowTask.inherited_priority = HighTask.priority;
   
   // LowTask rapidly finishes without interruption
   Mutex.unlock();
   
   // Restore original
   LowTask.priority = LowTask.base_priority;
}`,
    pros: ['PIP perfectly resolves the catastrophic inversion bug without rewriting the actual program architecture.', 'Prevented the historic near-loss of a NASA Mars Pathfinder rover.'],
    cons: ['Priority Inheritance requires massive restructuring of the underlying OS scheduler overhead to track complex dependency graphs dynamically.'],
    vivaPoints: [
      'Priority Inversion caused the famous 1997 NASA Mars Pathfinder software reset anomaly.',
      'It requires exactly 3 priority levels to manifest fatally (High, Medium, Low).',
      'Inheritance temporarily "boosts" lower classes to ensure they drop the lock fast.',
    ],
    code: `// Conceptual pseudo-code for Mutex with PIP support
class PIPMutex {
    Thread owner;
    
    void acquire() {
        if (owner != null && Thread.currentThread().priority > owner.priority) {
            // Trigger Priority Inheritance
            owner.tempPriority = Thread.currentThread().priority;
            scheduler.updateThread(owner);
        }
        // ... proceed with lock wait mechanics ...
    }
}`,
    summary: 'Priority Inversion is a catastrophic scheduling paradox where low-tier processes inadvertently chain-block absolute highest-tier critical processes via shared Mutex holds, requiring Priority Inheritance OS protocols to forcefully resolve.',
  },
  {
    id: 'lost-wakeup-problem',
    title: 'Lost Wake-up Problem',
    definition: 'The Lost Wake-Up problem is an synchronization failure where a process sends a "wakeup" signal (like a semaphore signal) to another process exactly while the other process is in transit to, but hasn\'t completely entered, its sleeping state. The signal drops into the void, resulting in permanent sleep.',
    reasons: [
      'Non-atomic checking logic against OS sleep calls.',
      'Context switching triggering in the exact gap between an `if(empty)` check and a `sleep()` command.',
      'Signals or notifications are not buffered or queued; they are instantly discarded if no one is explicitly waiting.',
    ],
    working: 'You check your mailbox. Empty. You turn around to walk heavily back to your house to sleep until mail arrives. In those exact 3 seconds you have your back turned, the postman drops a letter, shouts "Mail is here!" and leaves. You go into your house, go to sleep forever waiting for a shout you structurally missed. You are deadlocked.',
    solutions: [
      {
        method: 'Semaphores (Counting)',
        description: 'Unlike primitive boolean tests, counting semaphores "remember" the signal. The mathematical counter goes up, so the delayed sleep immediately bypasses itself upon returning.',
      },
      {
        method: 'Monitor Condition Variables',
        description: 'Conditions tied exclusively to absolute Mutex locks ensure the evaluation of the variable and the deployment of the sleep happen atomically.',
      }
    ],
    algorithm: `// Without Semaphores (Error Prone)
if (count == 0) {
  // CONTEXT SWITCH HERE! 
  // Producer produces, sends Wakeup (Lost!)
  sleep(); // Consumer sleeps forever.
}

// With Semaphores (Protected)
wait(empty_semaphore); // Memory safely holds value
// Context switches do not destroy mathematical values`,
    pros: ['Condition variables natively ensure atomic transition into blocking sleep states.', 'Semaphores act as a flawless integer memory for wakeups.'],
    cons: ['Native signals (like UNIX SIGWAIT) are notoriously tricky to code flawlessly manually without high-level wrappers.'],
    vivaPoints: [
      'It stems entirely from the gap between the conditional check and the action of sleeping.',
      'Counting semaphores specifically resolve this by storing the wakeup as a +1 value.',
      'It is a microscopic variant of a Race Condition involving OS thread-state logic.',
    ],
    code: `// C++ Condition Variables inherently prevent lost wakeups
#include <mutex>
#include <condition_variable>

std::mutex mtx;
std::condition_variable cv;
bool ready = false;

// Safe atomic wait
void wait_thread() {
    std::unique_lock<std::mutex> lck(mtx);
    // Predicate 'ready' evaluation is locked tightly to the wait execution!
    cv.wait(lck, []{ return ready; }); 
}`,
    summary: 'The Lost Wake-up Problem is an atomic routing failure dictating that bare-metal sleep commands invoked without strict semaphoric or monitor locks can mathematically miss system wakeups sent milliseconds prior, generating infinite blocking.',
  },
  {
    id: 'lock-variable-problem',
    title: 'Lock Variable Problem',
    definition: 'The Lock Variable problem refers to the failed, primitive attempt at implementing mutual exclusion purely by checking and setting an uncontrolled global integer variable (lock 0 for open, lock 1 for closed). It completely fails under concurrent loads.',
    reasons: [
      'Checking the lock `if(lock == 0)` and setting the lock `lock = 1` are two completely separate CPU instructions.',
      'A context switch heavily interjects directly between the read and the write execution.',
      'Lack of hardware support (atomic test-and-set instructions).',
    ],
    working: 'Two people want to use a fitting room with a manual "Vacant/In Use" sign on the front desk. Bob looks at the sign, reads "Vacant". Before Bob changes the sign to "In Use", he sneezes. Alice walks up, reads the sign as "Vacant", changes it to "In Use" and goes in. Bob finishes sneezing, changes it to "In Use", and walks in on Alice. Disastrous failure of lock implementation.',
    solutions: [
      {
        method: 'Hardware Test-and-Set (TSL)',
        description: 'CPU chips provide heavily wired assembly instructions `TSL RX, LOCK` that read the memory location and lock the bus simultaneously in ONE clock pulse.',
      },
      {
        method: 'Petersons Algorithm / Dekkers Algorithm',
        description: 'Strictly software-oriented algorithms utilizing dual intent arrays to manage transitions mathematically without hardware atomic support.',
      }
    ],
    algorithm: `// Flawed Implementation
while(lock != 0) { /* wait */ }
// INTERRUPT: Context switch to Thread B
lock = 1;
// Thread B also broke in! Mutual exclusion fails!`,
    pros: ['Recognizing this flaw introduces computer scientists directly to the need for atomic primitives and hardware-level locks.'],
    cons: ['Pure software implementations are extremely slow. Hardware Test-and-Set relies heavily on CPU cache invalidation.'],
    vivaPoints: [
      'The naive lock variable is the most common failing answer given by novices designing thread locks.',
      'It violently violates Mutual Exclusion.',
      'The key failure is that Read-Modify-Write is not atomic in high level languages.',
    ],
    code: `// How CPUs fix this: Simulated C implementation of hardware lock
int TestAndSet(int *old_ptr, int new_val) {
    int old = *old_ptr;  // Read
    *old_ptr = new_val;  // Write
    return old;          // ALL EXECUTED IN ONE UNBREAKABLE HARDWARE STEP
}

void lock_mutex(int *lock) {
    while(TestAndSet(lock, 1) == 1); // Safe busy wait logic
}`,
    summary: 'The Lock Variable Problem highlights that utilizing naked global booleans as multi-threading access gates structurally collapses into race conditions due to the non-atomic separation between CPU instruction reads and writes.',
  },
  {
    id: 'strict-alternation',
    title: 'Strict Alternation Problem',
    definition: 'Strict Alternation (Turn Variable) is a rudimentary synchronization construct for two processes utilizing a single shared variable `turn`. It strictly forces processes to infinitely ping-pong execution between each other sequentially.',
    reasons: [
      'To ensure absolute mutual exclusion without hardware locks.',
      'Each process enters, executes, then manually flips the logical boolean turn counter directly pointing at the opponent.',
    ],
    working: 'Imagine a tennis match where you MUST hit the ball exactly once, then wait. Process 0 executes its critical block and sets `turn = 1`. Process 0 suddenly wants to execute again, but heavily stalls because it MUST mathematically wait for Process 1 to execute and set `turn = 0`, even if Process 1 has absolutely no desire to ever execute right now.',
    solutions: [
      {
        method: 'Petersons Algorithm',
        description: 'Combines the `turn` variable of strict alternation with an `interested[2]` boolean array to completely satisfy Mutual Exclusion while completely bypassing strict alternating dependency restrictions.',
      }
    ],
    algorithm: `// Strict Alternation Logic
int turn = 0;

Process 0:
  while(turn != 0); // busy wait
  // critical section
  turn = 1;

Process 1:
  while(turn != 1); // busy wait
  // critical section
  turn = 0;`,
    pros: ['Successfully and fully maintains raw Mutual Exclusion across exactly two isolated processes.'],
    cons: ['Violates the "Progress" requirement. A slow process heavily dictates the maximum speed of a fast process. If P1 dies in remainder section, P0 starves forever.'],
    vivaPoints: [
      'Strict Alternation satisfies Mutual Exclusion but catastrophically fails Progress condition.',
      'It creates an immensely tight CPU-cycle burning spinlock.',
      'It ONLY functions strictly for 2 absolute processes, nothing more.',
    ],
    code: `// Peterson's Solution (fixing strict alternation)
boolean flag[2] = {false, false};
int turn = 0;

void process_0() {
    flag[0] = true;
    turn = 1;
    while(flag[1] && turn == 1); // wait smartly
    // Critical section
    flag[0] = false;
}`,
    summary: 'Strict Alternation is a fatally flawed dual-process synchronization algorithm that strictly enforces back-and-forth execution, entirely freezing the system if one process decides it no longer wishes to enter its critical sector.',
  },
  {
    id: 'deadlock-prevention',
    title: 'Deadlock Prevention',
    definition: 'Deadlock Prevention focuses entirely on system design structure. It algorithmically ensures that it is mathematically impossible for a deadlock to occur by forcing the system to strategically violate at least one of the exact four Coffman conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait).',
    reasons: [
      'Highly critical systems (Aerospace, defense, hypervisors) require 100.0% zero-chance of system lockups.',
      'It avoids runtime overhead completely by solving the problem strictly at compile/design time.',
    ],
    working: 'You structurally ban "Hold and Wait". Before launching a process, it must aggressively declare and grab every single USB drive, Database, and Memory chunk it will ever need all at once. If it needs 5 things and only 4 are available, it grabs absolutely nothing and waits. This completely shatters any chance of deadlock.',
    solutions: [
      {
        method: 'Break Hold and Wait',
        description: 'Require all processes to request absolute total resource quotas heavily upfront before entering execution state.',
      },
      {
        method: 'Break Circular Wait',
        description: 'Assign a global, numeric system index to all resources. Processes can ONLY request resources in strictly increasing numerical order. Circular chains become mathematically impossible.',
      }
    ],
    algorithm: `// Breaking Circular Wait by Ordering
Resource Tape_Drive = 1;
Resource Printer = 2;
Resource Plotter = 3;

// Process A valid execution
request(Tape_Drive); 
request(Printer); // 2 > 1 (VALID)

// Process B INVALID execution
request(Plotter);
request(Printer); // ERROR: 2 is not > 3. Request Denied!`,
    pros: ['Absolute, flawless 100% mathematical guarantee against any deadlocking anomalies.', 'Zero requirement for runtime graphical analysis or algorithm loops.'],
    cons: ['Cripples severe system efficiency. Upfront requesting causes immense resource underutilization and severe starvation for massive processes.'],
    vivaPoints: [
      'Prevention implies breaking Coffee conditions by design BEFORE the code actually runs.',
      'Breaking Mutual Exclusion is fundamentally impossible for non-shareable things (like Printers).',
      'Breaking Circular Wait via strict numeric ordering is the most practical standard prevention logic.',
    ],
    code: `// Python example: Locking strictly by memory address prevents circular wait
def safe_double_lock(lock_a, lock_b):
    # Always lock the lower ID address first!
    first = lock_a if id(lock_a) < id(lock_b) else lock_b
    second = lock_b if id(lock_a) < id(lock_b) else lock_a
    
    with first:
        with second:
            print("Executing safely without circular wait!")`,
    summary: 'Deadlock Prevention aggressively restructures the fundamental operating principles of an OS by brutally crippling its allocation freedom, guaranteeing one of the four Coffman conditions is intrinsically impossible to execute.',
  },
  {
    id: 'deadlock-avoidance',
    title: 'Deadlock Avoidance',
    definition: 'Deadlock Avoidance is a dynamic runtime OS mechanism. Unlike Prevention, it allows all four Coffman conditions to natively exist. However, the OS actively inspects every single resource request globally at runtime. If granting a request could potentially construct a future deadlock sequence, the OS explicitly denies or delays the request.',
    reasons: [
      'Prevention causes immense system slowdown due to resource hoarding.',
      'Avoidance allows maximum raw system utilization while preserving total safety.',
      'Requires processes to purely declare their "Maximum Potential Need" upfront.',
    ],
    working: 'A real-estate bank (OS) has $10 million safely in the vault. A builder asks for $8 million. The bank calculates: "If I give $8M, I have $2M left. Can I safely fulfill other builders\' future needs with $2M to get my money back?" If yes => State is SAFE. Request granted. If no => State is UNSAFE. Request delayed.',
    solutions: [
      {
        method: 'Banker\'s Algorithm (Dijkstra)',
        description: 'Uses mathematical matrices (Allocation, Max, Available, Need) to simulate the distribution of resources and verify if a "Safe Sequence" intrinsically exists.',
      },
      {
        method: 'Resource-Allocation Graph (RAG) Algorithm',
        description: 'Maintains claim edges for single-instance resources. Converts claim edges to active request edges only if no cycles are structurally produced.',
      }
    ],
    algorithm: `// Banker's Algorithm Safety Check Core
Work = Available;
Finish[n] = false;

while (there_is_an_index_i) {
  if (Finish[i] == false && Need[i] <= Work) {
     Work = Work + Allocation[i]; // Simulate finishing process i
     Finish[i] = true;
  }
}

if (all Finish[i] == true) 
   return SAFE; // Grant the request!
else 
   return UNSAFE; // Block the process`,
    pros: ['Yields drastically better runtime resource utilization compared to heavy Prevention laws.', 'Provides a mathematically guaranteed dynamic safety net.'],
    cons: ['Requires absolute advance knowledge of exactly how many resources each process will maximally demand.', 'Extremely heavy algorithmic O(m*n^2) computational overhead per transaction.'],
    vivaPoints: [
      'An "Unsafe State" does NOT absolutely mean a deadlock exists—it means a deadlock is mathematically POSSIBLE.',
      'Bankers algorithm explicitly deals natively with Multiple-Instance resources.',
      'The overarching goal is navigating the system globally across a Safe Sequence.',
    ],
    code: `// Validation of safe state snapshot
bool isSafeState(int[] available, int[][] max, int[][] allocated) {
   // Complex matrix analysis mimicking the algorithm structure above
   // Evaluates if OS can satisfy all future matrices
   // Must be executed on literally every variable request!
   return true;
}`,
    summary: 'Deadlock Avoidance deploys dynamic, matrix-based OS inspection algorithms, such as the Banker\'s Algorithm, at runtime to mathematically simulate futuristic resource allocations, fiercely protecting the system from traversing into Unsafe states.',
  },
  {
    id: 'deadlock-detection',
    title: 'Deadlock Detection & Recovery',
    definition: 'Deadlock Detection is an optimistic OS architectural stance. The OS implements absolutely zero prevention or avoidance algorithms. It lets the system run freely, heavily allocating resources. Occasionally, the OS explicitly pauses to run an intensive diagnostic scan to detect if a deadlock has organically formed, then drastically forces recovery.',
    reasons: [
      'Avoidance algorithm overhead (like Bankers) is absurdly expensive on modern multitasking arrays.',
      'Most standard user applications natively rarely deadlock.',
      'It is vastly cheaper linearly to let the bug occur and violently terminate it, rather than scanning 1,000 requests per second.',
    ],
    working: 'Think of an intersection without stoplights. Cars drive smoothly. Occasionally, a massive traffic jam (deadlock) occurs in the center. A police helicopter (Detection process) flies over every 30 minutes, sees the gridlock, and orders a tow-truck (Recovery) to forcibly remove one specific car to unblock the entire grid.',
    solutions: [
      {
        method: 'Wait-For Graphs',
        description: 'Single Instance resources: The OS actively draws a directed network graph of who waits for who. If the graph contains a cyclic loop, deadlock is detected.',
      },
      {
        method: 'Victim Preemption (Recovery)',
        description: 'Once explicitly detected, the OS aggressively terminates a "Victim Process" (usually lowest priority or most recently started) and violently reclaims its resources.',
      }
    ],
    algorithm: `// Wait-For Graph Cycle Detection loop
boolean detected = false;
Graph G = constructWaitGraph(processes, locks);

for (Node n in G) {
   if (performDFS(G, n, visited).hasCycle()) {
      detected = true;
      break;
   }
}

if (detected) {
   Process victim = selectVictim();
   abort(victim); // Recovery!
}`,
    pros: ['Provides absolute maximum raw performance during standard, non-deadlocked execution.', 'Zero upfront declarations needed from user code.'],
    cons: ['Violent process execution abortions (killing tasks) results in heavy unrecoverable data loss for users.', 'Cycle detection algorithms themselves consume vast CPU payloads if launched too often.'],
    vivaPoints: [
      'Wait-For Graphs are exclusively isolated for Single-Instance resource systems.',
      'Victim selection parameters heavily include: process age, priority level, and remaining execution compute time.',
      'Rolling back a process to a "Check-pointed State" is heavily preferred over violent permanent termination.',
    ],
    code: `// Simple visual representation of recovery termination
void SystemDiagnosticScanner() {
    if (CycleFound_In_RAG()) {
        System.err.println("CRITICAL DEADLOCK DETECTED.");
        Process victim = findTaskWithLeastProgress();
        System.out.println("Terminating PID: " + victim.pid);
        victim.killAndDeallocateAll(); // Hard recovery
    }
}`,
    summary: 'Deadlock Detection natively permits complete structural freedom, relying on periodic cyclic-graph surveillance algorithms to precisely identify internal system gridlocks and resolve them entirely through lethal victim process abortion cascades.',
  },
  {
    id: 'convoy-effect',
    title: 'Convoy Effect',
    definition: 'The Convoy Effect is an immense performance degradation specifically tied to First-Come-First-Serve (FCFS) CPU scheduling. It occurs when one massive, heavily CPU-bound process captures the entire CPU for an extended duration, radically forcing dozens of microscopic I/O-bound processes to wait indefinitely behind it.',
    reasons: [
      'FCFS scheduling is strictly Non-Preemptive.',
      'A multi-second CPU burst monopolizes raw execution pipelines.',
      'I/O bound processes finish their disk tasks rapidly, but pile up endlessly in the Ready Queue.',
    ],
    working: 'Imagine a supermarket express checkout lane (Ready Queue). You have 1 item: a bottle of water. Unfortunately, the person standing directly in front of you has 300 heavily barcoded items and 5 bags of loose coins. You and 20 other people behind you (Short tasks) are heavily stalled for 15 minutes by one giant transaction (CPU Bound Task). This is a Convoy.',
    solutions: [
      {
        method: 'Round Robin (RR) Scheduling',
        description: 'Forces dynamic Preemption. The OS sets a strict Time Quantum (e.g., 10ms). The massive process is violently paused, thrown to the back, and the small tasks run instantly.',
      },
      {
        method: 'Shortest Job First (SJF)',
        description: 'Aggressively re-sorts the queue so the 1-item customers mathematically bypass the 300-item customer entirely.',
      }
    ],
    algorithm: `// FCFS Pipeline demonstrating the delay (Convoy)
Execution Timeline:
[======== P1 (CPU Heavy, 100ms) ========] [P2 (1ms)] [P3 (1ms)]

// P2 and P3 average wait time is heavily skewed to ~100ms.
// Very poor system metric!`,
    pros: ['Analyzing the Convoy effect specifically led computer scientists to invent the Time Quantum preemption logic used uniformly inside Windows and Linux today.'],
    cons: ['Fixing the convoy effect entirely with SJF introduces the opposite problem: Heavy Starvation for large computations.'],
    vivaPoints: [
      'The Convoy Effect proves mathematically why First-Come-First-Serve is catastrophic for OS performance.',
      'It heavily drops Device Utilization globally (I/O disks sit totally idle while everyone waits for the CPU).',
      'It is instantly resolved by switching to preemptive Time-Sliced algorithms.',
    ],
    code: `// Metric analysis showing the wait time explosion
int[] burst_time = {100, 1, 1}; // P1, P2, P3
int[] wait_time = {0, 100, 101}; // FCFS wait matrix
double avg_wait = (0 + 100 + 101) / 3.0; // 67ms! A disaster 

// Contrast with SJF:
// order: 1, 1, 100
// wait: 0, 1, 2 = avg wait 1ms!`,
    summary: 'The Convoy Effect identifies a severe computational traffic jam wherein non-preemptive algorithms like FCFS disastrously paralyze dozens of hyper-fast I/O dependent threads because of a singular executing monolithic CPU-bound titan.',
  },
  {
    id: 'context-switching',
    title: 'Context Switching Overhead',
    definition: 'Context Switching is the core procedural mechanism an OS uses to pause Thread A, save absolute state, and actively resume Thread B. The "Overhead" refers to the massive amount of pure, wasted CPU time fundamentally lost doing administrative register/cache swapping instead of executing user logic.',
    reasons: [
      'The CPU strictly cannot multi-task; it must dump its entire L1/L2 hardware cache and variable registers into the RAM PCB (Process Control Block) layout.',
      'Round Robin time quantums configured significantly too small cause aggressive, unyielding switching.',
      'Pipeline flushing invalidates branch predictions on Intel/AMD chips dynamically.',
    ],
    working: 'You are studying Math (Task A). Suddenly your boss demands you work on an English essay (Task B). You must close the math book, note exactly what page you were on, put it away, find the English folder, find the pen, and remember the paragraph. This "swapping" takes 5 minutes of absolutely zero productive labor. That completely wasted transition delta is the Context Switch Overhead.',
    solutions: [
      {
        method: 'Optimized Time Quantum',
        description: 'Fine-tune the scheduler. Maintain quantum significantly higher than switch-time delta (e.g., Switch takes 0.1ms, set Quantum to 10ms for 99% raw efficiency).',
      },
      {
        method: 'Hardware Multi-Threading (Hyper-Threading)',
        description: 'Processors with multiple hard-coded register sets that can instantly flip logical states in exactly 1 hardware cycle.',
      }
    ],
    algorithm: `// Context Switch Kernel Delta Simulation
function Switch(Process P_old, Process P_new) {
   System.Timer.Pause(); // User logic stops entirely
   
   Save(P_old.Registers, P_old.PCB);
   Save(P_old.ProgramCounter, P_old.PCB);
   
   Flush_TLB_Cache(); // Huge cycle penalty!
   
   Load(P_new.Registers, P_new.PCB);
   Load(P_new.ProgramCounter, P_new.PCB);
   
   System.Timer.Resume(); // User logic resumes
}`,
    pros: ['The overhead is a mandatory, unavoidable cost to achieve seemingly instantaneous parallel multitasking for human interactive responses.'],
    cons: ['Misconfigured systems can easily spend 40% of their actual compute capability doing absolutely nothing but swapping data arrays aggressively.'],
    vivaPoints: [
      'Context Switch time is fundamentally considered pure OS overhead (0% useful computational execution).',
      'The physical size of the PCB (Process Control Block) heavily dictates switch speed delays.',
      'Thread switching is exponentially faster than Process switching because threads share the massive Memory Address space.',
    ],
    code: `// Analogy representing time decay in Round Robin
int execute_time = 1000;
int quantum = 10;
int switch_time = 2; // 2ms wasted per swap
int total_switches = execute_time / quantum; // 100 switches
int wasted_time = total_switches * switch_time; // 200 ms!
System.out.println("Efficiency: " + ((1000.0/1200.0)*100) + "%");`,
    summary: 'Context Switching Overhead exposes the hidden, pure-waste administrative temporal cost incurred universally by the CPU Kernel when unloading and reloading heavy architectural Process Control Blocks to seamlessly simulate graphical multitasking.',
  },
  {
    id: 'time-quantum-problem',
    title: 'Time Quantum Selection Problem',
    definition: 'In preemptive scheduling architectures like Round Robin, the Time Quantum (or Time Slice) is the absolute strict maximum time a process can execute before being violently evicted. Selecting the mathematically perfect size for this variable is extremely critical software optimization.',
    reasons: [
      'If the Quantum is far too INFINITELY LARGE, Round Robin degrades catastrophically into strict FCFS (Wait times skyrocket).',
      'If the Quantum is far too MICROSCOPICALLY SMALL, Context Switching Overhead violently consumes massive CPU percentages and stalls metrics.',
      'A wildly diverse system has drastically different burst requirements dynamically.',
    ],
    working: 'You give every child 10 seconds to play a video game (Quantum). 10 seconds is too small; they spend more time passing the controller back and forth than actually playing (Context Overhead). If you give them 1 hour, the last child in the line cries out of extremely frustrated starvation. Finding 5 minutes to be the perfect human balance is the Quantum problem.',
    solutions: [
      {
        method: 'Statistical Rule of Thumb',
        description: 'Set exactly such that 80% of all process CPU bursts globally finish within ONE single time quantum. This mathematically optimizes interactivity vs overhead metrics.',
      },
      {
        method: 'Multilevel Feedback Queue (MLFQ)',
        description: 'Auto-dynamic shifting grids. High priority queues utilize explicitly short quantums for snappy keyboard actions. Heavy computation queues utilize massively long quantums.',
      }
    ],
    algorithm: `// Logic of MLFQ resolving the static quantum problem
function DynamicDispatcher(Process P) {
   if (P.type == INTERACTIVE) {
      Queue_Layer_1.enqueue(P); 
      // Quantum = 2ms (Fast, responsive UI)
   } else if (P.type == CPU_HEAVY_RENDER) {
      Queue_Layer_3.enqueue(P); 
      // Quantum = 50ms (Low overhead for math)
   }
}`,
    pros: ['Proper quantum tuning yields a seamless, fluid operating system that feels perfectly alive and responsive to human click interactivity.'],
    cons: ['There is absolutely no single "Correct Answer". The quantum mathematically must globally fluctuate based on hardware speed and software type payloads.'],
    vivaPoints: [
      'The Time Quantum size uniquely and precisely dictates the absolute interactivity bounds of a Time-Sharing system.',
      'Quantum approaching infinity = First Come First Serve parameters.',
      'Quantum approaching zero = Processor Sharing (with a functional speed approaching infinite 0% efficiency).',
    ],
    code: `// Simulation of adjusting Quantum logic
int processBurst = 25;

int quantumA = 50; // Switches: 0. Fast but FCFS style.
int quantumB = 2;  // Switches: 12. Extremely slow due to overhead.
int quantumIdeal = 30; // Switches: 0. Covers 100% burst efficiently.

void calculateMetrics(int q) {
    int switches = processBurst / q;
    System.out.println("Context switches incurred: " + switches);
}`,
    summary: 'The Time Quantum Selection Problem fundamentally revolves around mathematically balancing absolute micro-response UI fluidity against the catastrophic CPU efficiency destruction caused by massive Context Switch volume overhead cascades.',
  }
];
