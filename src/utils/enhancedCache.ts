import { CompanyModule } from '@/types/companyModules';

// Enhanced cache with multiple layers and automatic cleanup
export class EnhancedCache<T = any> {
  private memoryCache = new Map<string, { data: T; timestamp: number; accessCount: number; lastAccess: number }>();
  private compressionCache = new Map<string, string>();
  private readonly maxSize: number;
  private readonly defaultTtl: number;
  private readonly compressionThreshold: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxSize = 1000, defaultTtl = 5 * 60 * 1000, compressionThreshold = 10000) {
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
    this.compressionThreshold = compressionThreshold;
    this.startCleanupTimer();
  }

  private startCleanupTimer() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private cleanup() {
    const now = Date.now();
    const entries = Array.from(this.memoryCache.entries());
    
    // Remove expired entries
    entries.forEach(([key, value]) => {
      if (now - value.timestamp > this.defaultTtl) {
        this.memoryCache.delete(key);
        this.compressionCache.delete(key);
      }
    });

    // If still over capacity, remove least recently used entries
    if (this.memoryCache.size > this.maxSize) {
      const sortedEntries = entries
        .filter(([key]) => this.memoryCache.has(key))
        .sort((a, b) => a[1].lastAccess - b[1].lastAccess)
        .slice(0, this.memoryCache.size - this.maxSize + 100); // Remove extra 100 for buffer

      sortedEntries.forEach(([key]) => {
        this.memoryCache.delete(key);
        this.compressionCache.delete(key);
      });
    }
  }

  private compress(data: T): string {
    const jsonString = JSON.stringify(data);
    if (jsonString.length > this.compressionThreshold) {
      // Simple compression - in production, use a proper compression library
      return btoa(jsonString);
    }
    return jsonString;
  }

  private decompress(compressedData: string): T {
    try {
      // Try to parse as regular JSON first
      return JSON.parse(compressedData);
    } catch {
      // If that fails, try to decode from base64
      try {
        return JSON.parse(atob(compressedData));
      } catch {
        throw new Error('Failed to decompress cache data');
      }
    }
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const entry = {
      data,
      timestamp: now,
      accessCount: 0,
      lastAccess: now
    };

    this.memoryCache.set(key, entry);
    
    // Store compressed version for large data
    const compressed = this.compress(data);
    this.compressionCache.set(key, compressed);

    // Trigger cleanup if over capacity
    if (this.memoryCache.size > this.maxSize) {
      this.cleanup();
    }
  }

  get(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    const now = Date.now();
    const ttl = this.defaultTtl;

    // Check if expired
    if (now - entry.timestamp > ttl) {
      this.memoryCache.delete(key);
      this.compressionCache.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccess = now;

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.memoryCache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > this.defaultTtl) {
      this.memoryCache.delete(key);
      this.compressionCache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.memoryCache.delete(key);
    this.compressionCache.delete(key);
  }

  clear(): void {
    this.memoryCache.clear();
    this.compressionCache.clear();
  }

  // Get cache statistics for monitoring
  getStats() {
    const entries = Array.from(this.memoryCache.values());
    return {
      size: this.memoryCache.size,
      maxSize: this.maxSize,
      hitRate: entries.length > 0 ? entries.reduce((sum, e) => sum + e.accessCount, 0) / entries.length : 0,
      memoryUsage: JSON.stringify(Array.from(this.memoryCache.entries())).length,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : null
    };
  }

  // Prefetch data to warm the cache
  async prefetch(keys: string[], fetchFn: (key: string) => Promise<T>): Promise<void> {
    const promises = keys
      .filter(key => !this.has(key))
      .map(async key => {
        try {
          const data = await fetchFn(key);
          this.set(key, data);
        } catch (error) {
          console.warn(`Failed to prefetch data for key ${key}:`, error);
        }
      });

    await Promise.allSettled(promises);
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Global enhanced cache instances
export const moduleCache = new EnhancedCache<CompanyModule[]>(500, 5 * 60 * 1000);
export const queryCache = new EnhancedCache<any>(1000, 2 * 60 * 1000);
export const userCache = new EnhancedCache<any>(200, 10 * 60 * 1000);

// Cache key generators
export const createCacheKey = (...parts: (string | number)[]): string => {
  return parts.join(':');
};

// Background cache warming
export const warmCache = async (companyIds: string[], fetchFn: (companyId: string) => Promise<CompanyModule[]>) => {
  await moduleCache.prefetch(companyIds, fetchFn);
};