import { supabase } from '@/integrations/supabase/client';
import { queryCache, createCacheKey } from './enhancedCache';

export interface QueryOptions {
  cache?: boolean;
  cacheTtl?: number;
  timeout?: number;
  retries?: number;
  batchSize?: number;
}

export class QueryOptimizer {
  private pendingQueries = new Map<string, Promise<any>>();

  // Batch multiple queries together to reduce round trips
  async batchQuery<T>(
    queries: Array<{ table: string; query: string; key: string }>,
    options: QueryOptions = {}
  ): Promise<Record<string, T[]>> {
    const { cache = true, cacheTtl = 120000, batchSize = 10 } = options;
    const results: Record<string, T[]> = {};

    // Process queries in batches
    for (let i = 0; i < queries.length; i += batchSize) {
      const batch = queries.slice(i, i + batchSize);
      const batchPromises = batch.map(async ({ table, query, key }) => {
        const cacheKey = createCacheKey('batch', table, query);
        
        if (cache && queryCache.has(cacheKey)) {
          return { key, data: queryCache.get(cacheKey) };
        }

        const { data, error } = await (supabase as any).from(table).select(query);
        if (error) throw error;

        if (cache) {
          queryCache.set(cacheKey, data, cacheTtl);
        }

        return { key, data };
      });

      const batchResults = await Promise.allSettled(batchPromises);
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results[result.value.key] = result.value.data;
        }
      });
    }

    return results;
  }

  // Optimized query with automatic caching and deduplication
  async optimizedQuery<T>(
    table: string,
    queryBuilder: any,
    cacheKey: string,
    options: QueryOptions = {}
  ): Promise<T[]> {
    const { cache = true, cacheTtl = 120000, timeout = 30000, retries = 2 } = options;

    // Check cache first
    if (cache && queryCache.has(cacheKey)) {
      return queryCache.get(cacheKey);
    }

    // Check for pending query to avoid duplicate requests
    if (this.pendingQueries.has(cacheKey)) {
      return this.pendingQueries.get(cacheKey);
    }

    const queryPromise = this.executeWithRetry(
      () => this.executeQuery(table, queryBuilder, timeout),
      retries
    );

    this.pendingQueries.set(cacheKey, queryPromise);

    try {
      const result = await queryPromise;
      
      if (cache) {
        queryCache.set(cacheKey, result, cacheTtl);
      }

      return result;
    } finally {
      this.pendingQueries.delete(cacheKey);
    }
  }

  private async executeQuery(table: string, queryBuilder: any, timeout: number) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retries: number,
    delay = 1000
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  private isRetryableError(error: any): boolean {
    // Network errors, timeouts, and certain database errors are retryable
    return (
      error?.message?.includes('Failed to fetch') ||
      error?.message?.includes('timeout') ||
      error?.code === '08000' || // Connection exception
      error?.code === '08003' || // Connection does not exist
      error?.code === '08006'    // Connection failure
    );
  }

  // Preload related data to avoid N+1 queries
  async preloadRelatedData<T extends Record<string, any>>(
    mainData: T[],
    relations: Array<{
      field: keyof T;
      table: string;
      foreignKey: string;
      select: string;
    }>
  ): Promise<T[]> {
    const relationPromises = relations.map(async (relation) => {
      const ids = mainData
        .map(item => item[relation.field])
        .filter((id, index, arr) => id && arr.indexOf(id) === index); // Unique IDs

      if (ids.length === 0) return { field: relation.field, data: [] };

      const cacheKey = createCacheKey('preload', relation.table, ids.join(','));
      
      if (queryCache.has(cacheKey)) {
        return { field: relation.field, data: queryCache.get(cacheKey) };
      }

      const { data, error } = await (supabase as any)
        .from(relation.table)
        .select(relation.select)
        .in(relation.foreignKey, ids);

      if (error) throw error;

      queryCache.set(cacheKey, data);
      return { field: relation.field, data };
    });

    const relationResults = await Promise.allSettled(relationPromises);
    const relationMaps = new Map();

    relationResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        relationMaps.set(result.value.field, result.value.data);
      }
    });

    // Merge related data back into main data
    return mainData.map(item => ({
      ...item,
      ...Object.fromEntries(
        Array.from(relationMaps.entries()).map(([field, relatedData]) => [
          `${String(field)}_data`,
          relatedData.filter((rel: any) => rel.id === item[field])
        ])
      )
    }));
  }

  // Get query performance statistics
  getStats() {
    return {
      cacheStats: queryCache.getStats(),
      pendingQueries: this.pendingQueries.size
    };
  }
}

export const queryOptimizer = new QueryOptimizer();