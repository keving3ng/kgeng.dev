import { 
  GitHubUser, 
  GitHubRepository, 
  GitHubCommit, 
  GitHubEvent, 
  GitHubActivity, 
  CombinedGitHubActivity,
  GitHubLanguageStats 
} from '@/types/github';

const GITHUB_API_BASE = 'https://api.github.com';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class GitHubService {
  private cache = new Map<string, CacheEntry<any>>();

  private async fetchWithCache<T>(url: string, cacheKey: string): Promise<T> {
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error);
      
      // Return cached data if available, even if stale
      if (cached) {
        return cached.data;
      }
      
      throw error;
    }
  }

  async getUser(username: string): Promise<GitHubUser> {
    return this.fetchWithCache<GitHubUser>(
      `${GITHUB_API_BASE}/users/${username}`,
      `user_${username}`
    );
  }

  async getUserRepositories(username: string, limit = 100): Promise<GitHubRepository[]> {
    const repos = await this.fetchWithCache<GitHubRepository[]>(
      `${GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=${limit}`,
      `repos_${username}_${limit}`
    );
    
    // Filter out forks and archived repos for cleaner display
    return repos.filter(repo => !repo.fork && !repo.archived);
  }

  async getRecentCommits(username: string, limit = 10): Promise<GitHubCommit[]> {
    try {
      const repos = await this.getUserRepositories(username, 10);
      const commitPromises = repos.slice(0, 5).map(async (repo) => {
        try {
          const commits = await this.fetchWithCache<GitHubCommit[]>(
            `${GITHUB_API_BASE}/repos/${repo.full_name}/commits?author=${username}&per_page=3`,
            `commits_${repo.full_name}_${username}`
          );
          return commits.map(commit => ({ ...commit, repo: repo.name }));
        } catch {
          return [];
        }
      });

      const allCommits = (await Promise.all(commitPromises)).flat();
      
      // Sort by date and return most recent
      return allCommits
        .sort((a, b) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error(`Failed to fetch recent commits for ${username}:`, error);
      return [];
    }
  }

  async getUserEvents(username: string, limit = 30): Promise<GitHubEvent[]> {
    try {
      const events = await this.fetchWithCache<GitHubEvent[]>(
        `${GITHUB_API_BASE}/users/${username}/events/public?per_page=${limit}`,
        `events_${username}_${limit}`
      );
      
      // Filter for push events and other interesting activities
      return events.filter(event => 
        ['PushEvent', 'CreateEvent', 'ReleaseEvent', 'PublicEvent'].includes(event.type)
      );
    } catch (error) {
      console.error(`Failed to fetch events for ${username}:`, error);
      return [];
    }
  }

  private calculateLanguageStats(repositories: GitHubRepository[]): GitHubLanguageStats {
    const languageCount: GitHubLanguageStats = {};
    
    repositories.forEach(repo => {
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
      }
    });

    return languageCount;
  }

  async getUserActivity(username: string): Promise<GitHubActivity> {
    try {
      const [user, repositories, recentCommits, events] = await Promise.all([
        this.getUser(username),
        this.getUserRepositories(username),
        this.getRecentCommits(username),
        this.getUserEvents(username),
      ]);

      const languageStats = this.calculateLanguageStats(repositories);
      const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);

      return {
        user,
        repositories,
        recentCommits,
        events,
        languageStats,
        totalStars,
        totalForks,
      };
    } catch (error) {
      console.error(`Failed to fetch activity for ${username}:`, error);
      throw error;
    }
  }

  async getCombinedActivity(personalUsername: string, workUsername: string): Promise<CombinedGitHubActivity> {
    try {
      const [personal, work] = await Promise.all([
        this.getUserActivity(personalUsername),
        this.getUserActivity(workUsername),
      ]);

      // Combine statistics
      const totalRepos = personal.repositories.length + work.repositories.length;
      const totalStars = personal.totalStars + work.totalStars;
      const totalForks = personal.totalForks + work.totalForks;

      // Combine language stats
      const topLanguages: GitHubLanguageStats = {};
      [personal.languageStats, work.languageStats].forEach(stats => {
        Object.entries(stats).forEach(([lang, count]) => {
          topLanguages[lang] = (topLanguages[lang] || 0) + count;
        });
      });

      // Combine and sort recent activity
      const recentActivity = [...personal.events, ...work.events]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20);

      // Get top repositories across both accounts
      const topRepositories = [...personal.repositories, ...work.repositories]
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 6);

      return {
        personal,
        work,
        combined: {
          totalRepos,
          totalStars,
          totalForks,
          topLanguages,
          recentActivity,
          topRepositories,
        },
      };
    } catch (error) {
      console.error('Failed to fetch combined GitHub activity:', error);
      throw error;
    }
  }
}

export const githubService = new GitHubService();