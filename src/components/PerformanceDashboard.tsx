import React from 'react';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { moduleCache, queryCache, userCache } from '@/utils/enhancedCache';
import { backgroundProcessor } from '@/utils/backgroundProcessor';
import { queryOptimizer } from '@/utils/queryOptimizer';

export const PerformanceDashboard: React.FC = () => {
  const [stats, setStats] = React.useState<any>(null);
  const [refreshInterval, setRefreshInterval] = React.useState(5000);

  const refreshStats = React.useCallback(() => {
    const performanceStats = performanceMonitor.getStats();
    const moduleStats = moduleCache.getStats();
    const queryStats = queryCache.getStats();
    const userStats = userCache.getStats();
    const backgroundStatus = backgroundProcessor.getStatus();
    const queryOptimizerStats = queryOptimizer.getStats();

    setStats({
      performance: performanceStats,
      cache: {
        modules: moduleStats,
        queries: queryStats,
        users: userStats
      },
      background: backgroundStatus,
      optimizer: queryOptimizerStats
    });
  }, []);

  React.useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshStats, refreshInterval]);

  if (!stats) {
    return <div className="p-4">Loading performance data...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Performance Dashboard</h1>
        <div className="flex items-center gap-4">
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-3 py-1 border rounded"
          >
            <option value={1000}>1s</option>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
          </select>
          <button
            onClick={refreshStats}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-4 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
          <div className="space-y-2">
            {Object.entries(stats.performance.metrics).map(([key, data]: [string, any]) => (
              <div key={key} className="flex justify-between">
                <span className="text-sm text-muted-foreground">{key}:</span>
                <span className="font-mono text-sm">
                  {data.avg.toFixed(2)}ms (p95: {data.p95.toFixed(2)}ms)
                </span>
              </div>
            ))}
          </div>
          {stats.performance.alertCount > 0 && (
            <div className="mt-3 p-2 bg-destructive/10 text-destructive rounded text-sm">
              {stats.performance.alertCount} performance alerts
            </div>
          )}
        </div>

        {/* Cache Statistics */}
        <div className="p-4 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-3">Cache Performance</h3>
          <div className="space-y-3">
            {Object.entries(stats.cache).map(([type, cacheStats]: [string, any]) => (
              <div key={type}>
                <div className="font-medium text-sm capitalize mb-1">{type} Cache</div>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <div>Size: {cacheStats.size}/{cacheStats.maxSize}</div>
                  <div>Hit Rate: {cacheStats.hitRate.toFixed(2)}</div>
                  <div>Memory: {(cacheStats.memoryUsage / 1024).toFixed(2)}KB</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Background Processing */}
        <div className="p-4 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-3">Background Tasks</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Jobs:</span>
              <span className="font-mono text-sm">{stats.background.activeJobs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pending:</span>
              <span className="font-mono text-sm">{stats.background.pendingTasks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Scheduled:</span>
              <span className="font-mono text-sm">{stats.background.scheduledTasks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Concurrency:</span>
              <span className="font-mono text-sm">{stats.background.concurrency}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className={`text-xs px-2 py-1 rounded ${
                stats.background.running ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {stats.background.running ? 'Running' : 'Stopped'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Query Optimizer Stats */}
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="text-lg font-semibold mb-3">Query Optimization</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-2">Cache Statistics</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-xs">Cache Size:</span>
                <span className="font-mono text-xs">{stats.optimizer.cacheStats.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs">Hit Rate:</span>
                <span className="font-mono text-xs">{stats.optimizer.cacheStats.hitRate.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Active Requests</div>
            <div className="font-mono text-2xl">{stats.optimizer.pendingQueries}</div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="text-lg font-semibold mb-3">System Health</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.performance.alertCount === 0 ? '✓' : '!'}
            </div>
            <div className="text-sm text-muted-foreground">Performance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((stats.cache.modules.size / stats.cache.modules.maxSize) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Cache Usage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.background.activeJobs}
            </div>
            <div className="text-sm text-muted-foreground">Active Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.optimizer.pendingQueries}
            </div>
            <div className="text-sm text-muted-foreground">Pending Queries</div>
          </div>
        </div>
      </div>
    </div>
  );
};