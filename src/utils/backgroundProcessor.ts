interface BackgroundTask {
  id: string;
  type: string;
  payload: any;
  priority: number;
  retries: number;
  maxRetries: number;
  scheduledAt: number;
  attempts: Array<{ timestamp: number; error?: string }>;
}

export class BackgroundProcessor {
  private queue: BackgroundTask[] = [];
  private running = false;
  private processInterval: NodeJS.Timeout | null = null;
  private processors: Map<string, (payload: any) => Promise<void>> = new Map();
  private concurrency = 3;
  private activeJobs = 0;

  constructor() {
    this.registerDefaultProcessors();
    this.start();
  }

  private registerDefaultProcessors() {
    // Cache warming processor
    this.registerProcessor('cache-warm', async (payload) => {
      const { cacheKey, fetchFn } = payload;
      try {
        await fetchFn();
        console.log(`Cache warmed for key: ${cacheKey}`);
      } catch (error) {
        console.warn(`Failed to warm cache for key: ${cacheKey}`, error);
        throw error;
      }
    });

    // Data prefetch processor
    this.registerProcessor('data-prefetch', async (payload) => {
      const { companyIds, dataType } = payload;
      // Implementation depends on data type
      console.log(`Prefetching ${dataType} data for companies:`, companyIds);
    });

    // Analytics processor
    this.registerProcessor('analytics', async (payload) => {
      const { event, data } = payload;
      // Send analytics data to tracking service
      console.log(`Analytics event: ${event}`, data);
    });

    // Cleanup processor
    this.registerProcessor('cleanup', async (payload) => {
      const { type, olderThan } = payload;
      // Perform cleanup operations
      console.log(`Cleanup task: ${type}, older than: ${olderThan}`);
    });
  }

  registerProcessor(type: string, processor: (payload: any) => Promise<void>) {
    this.processors.set(type, processor);
  }

  // Add a task to the background queue
  enqueue(
    type: string,
    payload: any,
    options: {
      priority?: number;
      maxRetries?: number;
      delay?: number;
    } = {}
  ): string {
    const task: BackgroundTask = {
      id: this.generateId(),
      type,
      payload,
      priority: options.priority ?? 1,
      retries: 0,
      maxRetries: options.maxRetries ?? 3,
      scheduledAt: Date.now() + (options.delay ?? 0),
      attempts: []
    };

    this.queue.push(task);
    this.sortQueue();

    return task.id;
  }

  // High-level convenience methods
  warmCache(cacheKey: string, fetchFn: () => Promise<any>, priority = 2) {
    return this.enqueue('cache-warm', { cacheKey, fetchFn }, { priority });
  }

  prefetchData(companyIds: string[], dataType: string, priority = 3) {
    return this.enqueue('data-prefetch', { companyIds, dataType }, { priority });
  }

  trackAnalytics(event: string, data: any, priority = 5) {
    return this.enqueue('analytics', { event, data }, { priority });
  }

  scheduleCleanup(type: string, olderThan: number, delay = 60000) {
    return this.enqueue('cleanup', { type, olderThan }, { priority: 1, delay });
  }

  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sortQueue() {
    this.queue.sort((a, b) => {
      // First by scheduled time
      if (a.scheduledAt !== b.scheduledAt) {
        return a.scheduledAt - b.scheduledAt;
      }
      // Then by priority (lower number = higher priority)
      return a.priority - b.priority;
    });
  }

  private start() {
    if (this.running) return;
    
    this.running = true;
    this.processInterval = setInterval(() => {
      this.processQueue();
    }, 1000); // Check every second
  }

  stop() {
    this.running = false;
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }
  }

  private async processQueue() {
    if (!this.running || this.activeJobs >= this.concurrency) {
      return;
    }

    const now = Date.now();
    const readyTasks = this.queue.filter(task => task.scheduledAt <= now);

    if (readyTasks.length === 0) {
      return;
    }

    const task = readyTasks[0];
    this.queue = this.queue.filter(t => t.id !== task.id);

    this.activeJobs++;
    this.processTask(task).finally(() => {
      this.activeJobs--;
    });
  }

  private async processTask(task: BackgroundTask) {
    const processor = this.processors.get(task.type);
    if (!processor) {
      console.warn(`No processor found for task type: ${task.type}`);
      return;
    }

    const attempt: { timestamp: number; error?: string } = { timestamp: Date.now() };
    task.attempts.push(attempt);

    try {
      await processor(task.payload);
      console.log(`Background task completed: ${task.type}`, { id: task.id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      attempt.error = errorMessage;
      
      console.warn(`Background task failed: ${task.type}`, {
        id: task.id,
        attempt: task.retries + 1,
        error: errorMessage
      });

      task.retries++;

      // Retry with exponential backoff if not exceeded max retries
      if (task.retries < task.maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, task.retries), 30000); // Max 30 seconds
        task.scheduledAt = Date.now() + delay;
        this.queue.push(task);
        this.sortQueue();
      } else {
        console.error(`Background task permanently failed: ${task.type}`, {
          id: task.id,
          attempts: task.attempts
        });
      }
    }
  }

  // Get queue status
  getStatus() {
    const now = Date.now();
    const pending = this.queue.filter(t => t.scheduledAt <= now).length;
    const scheduled = this.queue.filter(t => t.scheduledAt > now).length;
    
    return {
      activeJobs: this.activeJobs,
      pendingTasks: pending,
      scheduledTasks: scheduled,
      totalTasks: this.queue.length,
      concurrency: this.concurrency,
      running: this.running
    };
  }

  // Clear the queue
  clear() {
    this.queue = [];
  }

  // Get tasks by type
  getTasksByType(type: string): BackgroundTask[] {
    return this.queue.filter(task => task.type === type);
  }

  // Remove a specific task
  removeTask(taskId: string): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(task => task.id !== taskId);
    return this.queue.length < initialLength;
  }

  // Update concurrency
  setConcurrency(concurrency: number) {
    this.concurrency = Math.max(1, concurrency);
  }
}

export const backgroundProcessor = new BackgroundProcessor();

// Convenience function to schedule cache warming
export const scheduleWarmCache = (cacheKey: string, fetchFn: () => Promise<any>) => {
  return backgroundProcessor.warmCache(cacheKey, fetchFn);
};

// Convenience function to prefetch company data
export const schedulePrefetchCompanyData = (companyIds: string[], dataType = 'modules') => {
  return backgroundProcessor.prefetchData(companyIds, dataType);
};