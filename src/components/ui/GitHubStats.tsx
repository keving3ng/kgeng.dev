'use client';

import { motion } from 'framer-motion';
import { GitBranch, Star, GitFork, BookOpen } from 'lucide-react';
import { CombinedGitHubActivity } from '@/types/github';

interface GitHubStatsProps {
  data: CombinedGitHubActivity | null;
  loading?: boolean;
}

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  loading 
}: { 
  icon: any; 
  label: string; 
  value: number | string; 
  loading?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
        {loading ? (
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
        ) : (
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        )}
      </div>
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>
    </div>
  </motion.div>
);

export function GitHubStats({ data, loading = false }: GitHubStatsProps) {
  const stats = [
    {
      icon: BookOpen,
      label: 'Total Repositories',
      value: data?.combined.totalRepos || 0,
    },
    {
      icon: Star,
      label: 'Total Stars',
      value: data?.combined.totalStars || 0,
    },
    {
      icon: GitFork,
      label: 'Total Forks',
      value: data?.combined.totalForks || 0,
    },
    {
      icon: GitBranch,
      label: 'Active Accounts',
      value: 2,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StatCard {...stat} loading={loading} />
        </motion.div>
      ))}
    </div>
  );
}