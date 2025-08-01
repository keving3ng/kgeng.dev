export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  size: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics: string[];
  private: boolean;
  fork: boolean;
  archived: boolean;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
  html_url: string;
}

export interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    id: number;
    login: string;
    display_login: string;
    gravatar_id: string;
    url: string;
    avatar_url: string;
  };
  repo: {
    id: number;
    name: string;
    url: string;
  };
  payload: {
    push_id?: number;
    size?: number;
    distinct_size?: number;
    ref?: string;
    head?: string;
    before?: string;
    commits?: Array<{
      sha: string;
      author: {
        email: string;
        name: string;
      };
      message: string;
      distinct: boolean;
      url: string;
    }>;
  };
  public: boolean;
  created_at: string;
}

export interface GitHubLanguageStats {
  [language: string]: number;
}

export interface GitHubActivity {
  user: GitHubUser;
  repositories: GitHubRepository[];
  recentCommits: GitHubCommit[];
  events: GitHubEvent[];
  languageStats: GitHubLanguageStats;
  totalStars: number;
  totalForks: number;
}

export interface CombinedGitHubActivity {
  personal: GitHubActivity;
  work: GitHubActivity;
  combined: {
    totalRepos: number;
    totalStars: number;
    totalForks: number;
    topLanguages: GitHubLanguageStats;
    recentActivity: GitHubEvent[];
    topRepositories: GitHubRepository[];
  };
}