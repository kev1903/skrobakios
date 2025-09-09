// Simple project cache to prevent redundant API calls during navigation
interface CachedProject {
  id: string;
  name: string;
  project_id: string;
  company_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

class ProjectCache {
  private cache = new Map<string, CachedProject>();
  private timestamps = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  set(projectId: string, project: CachedProject) {
    this.cache.set(projectId, project);
    this.timestamps.set(projectId, Date.now());
  }

  get(projectId: string): CachedProject | null {
    const timestamp = this.timestamps.get(projectId);
    if (!timestamp || Date.now() - timestamp > this.CACHE_DURATION) {
      // Cache expired
      this.cache.delete(projectId);
      this.timestamps.delete(projectId);
      return null;
    }
    return this.cache.get(projectId) || null;
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  has(projectId: string): boolean {
    const timestamp = this.timestamps.get(projectId);
    return !!(timestamp && Date.now() - timestamp <= this.CACHE_DURATION && this.cache.has(projectId));
  }
}

export const projectCache = new ProjectCache();