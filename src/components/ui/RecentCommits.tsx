'use client';

import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { GitCommit, ExternalLink } from 'lucide-react';
import { CombinedGitHubActivity } from '@/types/github';

interface RecentCommitsProps {
  data: CombinedGitHubActivity | null;
  loading?: boolean;
}

const CommitItem = ({ commit, index, accountType }: { 
  commit: any; 
  index: number; 
  accountType: 'personal' | 'work';
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
  >
    <div className={`p-2 rounded-full ${
      accountType === 'personal' 
        ? 'bg-blue-100 dark:bg-blue-900/20' 
        : 'bg-green-100 dark:bg-green-900/20'
    }`}>
      <GitCommit className={`h-4 w-4 ${
        accountType === 'personal'
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-green-600 dark:text-green-400'
      }`} />
    </div>
    
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {commit.commit.message.split('\n')[0]}
        </p>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          accountType === 'personal'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        }`}>
          {accountType}
        </span>
      </div>
      
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {commit.repo && `${commit.repo} • `}
          {formatDistanceToNow(new Date(commit.commit.author.date), { addSuffix: true })}
        </p>
        
        {commit.html_url && (
          <a
            href={commit.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  </motion.div>
);

const SkeletonCommit = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
  >
    <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse">
      <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
    </div>
    
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
    </div>
  </motion.div>
);

export function RecentCommits({ data, loading = false }: RecentCommitsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Commits
        </h3>
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCommit key={index} index={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <GitCommit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Unable to load recent commits</p>
      </div>
    );
  }

  // Combine commits from both accounts with account type info
  const allCommits = [
    ...data.personal.recentCommits.map(commit => ({ ...commit, accountType: 'personal' as const })),
    ...data.work.recentCommits.map(commit => ({ ...commit, accountType: 'work' as const })),
  ]
    .sort((a, b) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime())
    .slice(0, 10);

  if (allCommits.length === 0) {
    return (
      <div className="text-center py-8">
        <GitCommit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No recent commits found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Commits
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
      
      <div className="space-y-3">
        {allCommits.map((commit, index) => (
          <CommitItem
            key={`${commit.sha}-${commit.accountType}`}
            commit={commit}
            index={index}
            accountType={commit.accountType}
          />
        ))}
      </div>
    </div>
  );
}