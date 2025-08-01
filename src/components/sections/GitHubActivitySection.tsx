'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, AlertCircle, RefreshCw } from 'lucide-react';
import { githubService } from '@/services/github';
import { CombinedGitHubActivity } from '@/types/github';
import { GitHubStats } from '@/components/ui/GitHubStats';
import { RecentCommits } from '@/components/ui/RecentCommits';
import { RepositoryList } from '@/components/ui/RepositoryList';

export function GitHubActivitySection() {
  const [data, setData] = useState<CombinedGitHubActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGitHubData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      if (forceRefresh) {
        githubService.clearCache();
      }
      const combinedData = await githubService.getCombinedActivity('keving3ng', 'kevingeng33', forceRefresh);
      setData(combinedData);
    } catch (err) {
      console.error('Failed to fetch GitHub data:', err);
      setError('Unable to load GitHub activity. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGitHubData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section id="github" className="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-12"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Github className="h-8 w-8 text-gray-900 dark:text-white" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                GitHub Activity
              </h2>
              <button
                onClick={() => fetchGitHubData(true)}
                disabled={loading}
                className="ml-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                title="Refresh GitHub data"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Live data from my personal and work GitHub accounts, showcasing recent commits, 
              top repositories, and development activity.
            </p>
            
            {/* Account badges */}
            <div className="flex items-center justify-center space-x-4 mt-6">
              <a
                href="https://github.com/keving3ng"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
              >
                <Github className="h-4 w-4" />
                <span>@keving3ng</span>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </a>
              
              <a
                href="https://github.com/kevingeng33"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium hover:bg-green-200 transition-colors dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
              >
                <Github className="h-4 w-4" />
                <span>@kevingeng33</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </a>
            </div>
          </motion.div>

          {/* Error State */}
          {error && (
            <motion.div
              variants={itemVariants}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center"
            >
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={() => fetchGitHubData(true)}
                disabled={loading}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Try Again</span>
              </button>
            </motion.div>
          )}

          {/* Stats Overview */}
          <motion.div variants={itemVariants}>
            <GitHubStats data={data} loading={loading} />
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Commits */}
            <motion.div variants={itemVariants}>
              <RecentCommits data={data} loading={loading} />
            </motion.div>

            {/* Language Chart Placeholder - Could add a language breakdown chart here */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Languages
              </h3>
              
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : data?.combined.topLanguages ? (
                <div className="space-y-3">
                  {Object.entries(data.combined.topLanguages)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 8)
                    .map(([language, count], index) => {
                      const maxCount = Math.max(...Object.values(data.combined.topLanguages));
                      const percentage = (count / maxCount) * 100;
                      
                      return (
                        <motion.div
                          key={language}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center space-x-3"
                        >
                          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {language}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {count} repos
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ delay: index * 0.05, duration: 0.5 }}
                                className="bg-blue-500 h-2 rounded-full"
                              />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No language data available</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Top Repositories */}
          <motion.div variants={itemVariants}>
            <RepositoryList data={data} loading={loading} />
          </motion.div>

          {/* Footer note */}
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Data is cached for 6 hours and updates automatically. Click the refresh icon to get the latest data.{' '}
              {data && (
                <>
                  Last updated: {new Date().toLocaleString()}
                </>
              )}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}