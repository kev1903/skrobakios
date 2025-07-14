interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceAlert {
  metric: string;
  threshold: number;
  value: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private thresholds: Record<string, number> = {
    'query.fetch': 2000,        // 2 seconds
    'cache.miss': 0.3,          // 30% miss rate
    'api.response': 5000,       // 5 seconds
    'render.component': 100,    // 100ms
    'memory.usage': 100 * 1024 * 1024 // 100MB
  };
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.initializeObservers();
    this.startMemoryMonitoring();
  }

  private initializeObservers() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Monitor navigation timing
      try {
        const navObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordMetric('navigation', entry.duration, {
              type: entry.entryType,
              name: entry.name
            });
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navObserver);
      } catch (error) {
        console.warn('Failed to setup navigation observer:', error);
      }

      // Monitor resource loading
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordMetric('resource', entry.duration, {
              name: entry.name,
              type: (entry as any).initiatorType
            });
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (error) {
        console.warn('Failed to setup resource observer:', error);
      }
    }
  }

  private startMemoryMonitoring() {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
      setInterval(() => {
        const memory = (window.performance as any).memory;
        this.recordMetric('memory.used', memory.usedJSHeapSize, {
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        });
        
        if (memory.usedJSHeapSize > this.thresholds['memory.usage']) {
          this.addAlert('memory.usage', this.thresholds['memory.usage'], memory.usedJSHeapSize);
        }
      }, 30000); // Check every 30 seconds
    }
  }

  // Record a custom performance metric
  recordMetric(name: string, duration: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics to prevent memory bloat
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Check for threshold violations
    if (this.thresholds[name] && duration > this.thresholds[name]) {
      this.addAlert(name, this.thresholds[name], duration);
    }
  }

  // Measure execution time of a function
  async measureAsync<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration, { ...metadata, success: true });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(name, duration, { ...metadata, success: false, error: (error as Error).message });
      throw error;
    }
  }

  measureSync<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration, { ...metadata, success: true });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(name, duration, { ...metadata, success: false, error: (error as Error).message });
      throw error;
    }
  }

  private addAlert(metric: string, threshold: number, value: number) {
    const alert: PerformanceAlert = {
      metric,
      threshold,
      value,
      timestamp: Date.now()
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Log critical alerts
    console.warn(`Performance Alert: ${metric} exceeded threshold`, alert);
  }

  // Get performance statistics
  getStats(timeWindow = 300000) { // Default: last 5 minutes
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp <= timeWindow);
    const recentAlerts = this.alerts.filter(a => now - a.timestamp <= timeWindow);

    const metricsByName = recentMetrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric.duration);
      return acc;
    }, {} as Record<string, number[]>);

    const stats = Object.entries(metricsByName).reduce((acc, [name, durations]) => {
      durations.sort((a, b) => a - b);
      acc[name] = {
        count: durations.length,
        min: durations[0] || 0,
        max: durations[durations.length - 1] || 0,
        avg: durations.reduce((sum, d) => sum + d, 0) / durations.length || 0,
        p50: durations[Math.floor(durations.length * 0.5)] || 0,
        p95: durations[Math.floor(durations.length * 0.95)] || 0,
        p99: durations[Math.floor(durations.length * 0.99)] || 0
      };
      return acc;
    }, {} as Record<string, any>);

    return {
      timeWindow,
      metrics: stats,
      alertCount: recentAlerts.length,
      alerts: recentAlerts
    };
  }

  // Set custom performance thresholds
  setThreshold(metric: string, threshold: number) {
    this.thresholds[metric] = threshold;
  }

  // Get current thresholds
  getThresholds() {
    return { ...this.thresholds };
  }

  // Clear old data
  cleanup(maxAge = 3600000) { // Default: 1 hour
    const cutoff = Date.now() - maxAge;
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    this.alerts = this.alerts.filter(a => a.timestamp > cutoff);
  }

  // Export data for analysis
  export() {
    return {
      metrics: this.metrics,
      alerts: this.alerts,
      thresholds: this.thresholds
    };
  }

  // Destroy observers
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Convenience functions for common use cases
export const measureQuery = async <T>(name: string, queryFn: () => Promise<T>): Promise<T> => {
  return performanceMonitor.measureAsync(`query.${name}`, queryFn);
};

export const measureRender = <T>(componentName: string, renderFn: () => T): T => {
  return performanceMonitor.measureSync(`render.${componentName}`, renderFn);
};

export const measureAPI = async <T>(endpoint: string, apiFn: () => Promise<T>): Promise<T> => {
  return performanceMonitor.measureAsync(`api.${endpoint}`, apiFn);
};
