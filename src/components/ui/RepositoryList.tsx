'use client';

import { motion } from 'framer-motion';
import { Star, GitFork, Eye, ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { CombinedGitHubActivity } from '@/types/github';

interface RepositoryListProps {
  data: CombinedGitHubActivity | null;
  loading?: boolean;
}

const getLanguageColor = (language: string): string => {
  const colors: { [key: string]: string } = {
    JavaScript: 'bg-yellow-400',
    TypeScript: 'bg-blue-500',
    React: 'bg-cyan-400',
    Python: 'bg-green-500',
    Java: 'bg-orange-500',
    Kotlin: 'bg-purple-500',
    Go: 'bg-cyan-500',
    Rust: 'bg-orange-600',
    HTML: 'bg-orange-400',
    CSS: 'bg-blue-400',
    'C++': 'bg-pink-500',
    C: 'bg-gray-600',
    PHP: 'bg-indigo-500',
    Ruby: 'bg-red-500',
  };
  return colors[language] || 'bg-gray-400';
};

const RepositoryCard = ({ repo, index, accountType }: { 
  repo: any; 
  index: number; 
  accountType: 'personal' | 'work';
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {repo.name}
          </h4>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            accountType === 'personal'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
          }`}>
            {accountType}
          </span>
        </div>
        
        {repo.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {repo.description}
          </p>
        )}
      </div>
      
      <a
        href={repo.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-2"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>

    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
        {repo.language && (
          <div className="flex items-center space-x-1">
            <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`}></div>
            <span>{repo.language}</span>
          </div>
        )}
        
        {repo.stargazers_count > 0 && (
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3" />
            <span>{repo.stargazers_count}</span>
          </div>
        )}
        
        {repo.forks_count > 0 && (
          <div className="flex items-center space-x-1">
            <GitFork className="h-3 w-3" />
            <span>{repo.forks_count}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-1 text-xs text-gray-400">
        <Calendar className="h-3 w-3" />
        <span>Updated {format(new Date(repo.updated_at), 'MMM d')}</span>
      </div>
    </div>

    {repo.topics && repo.topics.length > 0 && (
      <div className="flex flex-wrap gap-1 mt-3">
        {repo.topics.slice(0, 3).map((topic: string) => (
          <span
            key={topic}
            className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          >
            {topic}
          </span>
        ))}
        {repo.topics.length > 3 && (
          <span className="text-xs text-gray-400">+{repo.topics.length - 3} more</span>
        )}
      </div>
    )}
  </motion.div>
);

const SkeletonCard = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
        </div>
        <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-8"></div>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
      </div>
    </div>
  </motion.div>
);

export function RepositoryList({ data, loading = false }: RepositoryListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Top Repositories
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} index={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.combined.topRepositories.length === 0) {
    return (
      <div className="text-center py-8">
        <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No repositories found</p>
      </div>
    );
  }

  // Add account type to repositories for display
  const repositoriesWithAccount = data.combined.topRepositories.map(repo => {
    const isPersonal = data.personal.repositories.some(pRepo => pRepo.id === repo.id);
    return {
      ...repo,
      accountType: isPersonal ? 'personal' as const : 'work' as const
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Top Repositories
        </h3>
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-500 dark:text-gray-400">Personal</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-500 dark:text-gray-400">Work</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {repositoriesWithAccount.map((repo, index) => (
          <RepositoryCard
            key={repo.id}
            repo={repo}
            index={index}
            accountType={repo.accountType}
          />
        ))}
      </div>
    </div>
  );
}