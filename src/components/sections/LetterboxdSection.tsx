'use client';

import { motion } from 'framer-motion';
import { Film, Star, Calendar, TrendingUp, Eye, Heart } from 'lucide-react';
import { 
  letterboxdProfile, 
  letterboxdStats, 
  recentFilms, 
  ratingDistribution,
  watchlistHighlights,
  LetterboxdFilm 
} from '@/data/letterboxd';

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 === 0.5;
  
  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < fullStars
              ? 'text-yellow-400 fill-current'
              : index === fullStars && hasHalfStar
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ))}
      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

const FilmCard = ({ film }: { film: LetterboxdFilm }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              {film.title}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {film.year}
            </p>
          </div>
          <div className="text-right">
            <StarRating rating={film.rating} />
          </div>
        </div>
        
        {film.review && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 italic">
            &ldquo;{film.review}&rdquo;
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(film.watchedDate).toLocaleDateString()}</span>
          </div>
          <a
            href={film.letterboxdUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View on Letterboxd
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export function LetterboxdSection() {
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

  const maxCount = Math.max(...Object.values(ratingDistribution));

  return (
    <section id="letterboxd" className="py-20 bg-white dark:bg-gray-900">
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
              <Film className="h-8 w-8 text-gray-900 dark:text-white" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Movie Reviews
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
              My cinematic journey tracked on Letterboxd. From blockbusters to hidden gems, 
              exploring stories that inspire and entertain.
            </p>
            
            {/* Profile Link */}
            <a
              href={letterboxdProfile.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-100 text-orange-800 rounded-full font-medium hover:bg-orange-200 transition-colors dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30"
            >
              <Film className="h-5 w-5" />
              <span>@{letterboxdProfile.username}</span>
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            </a>
          </motion.div>

          {/* Stats Overview */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {letterboxdStats.totalFilmsWatched}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Films</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {letterboxdStats.filmsThisYear}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Year</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {letterboxdStats.averageRating.toFixed(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {letterboxdStats.topRatedFilms.length}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Top Rated</p>
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Films */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Recent Watches
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentFilms.slice(0, 4).map((film) => (
                  <FilmCard key={film.id} film={film} />
                ))}
              </div>
            </motion.div>

            {/* Rating Distribution & Watchlist */}
            <motion.div variants={itemVariants} className="space-y-8">
              {/* Rating Distribution */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Rating Distribution
                </h3>
                <div className="space-y-3">
                  {Object.entries(ratingDistribution)
                    .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
                    .map(([rating, count]) => {
                      const percentage = (count / maxCount) * 100;
                      const numRating = parseFloat(rating);
                      
                      return (
                        <div key={rating} className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 w-20">
                            <StarRating rating={numRating} />
                          </div>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${percentage}%` }}
                                transition={{ duration: 0.5 }}
                                className="bg-yellow-500 h-2 rounded-full"
                              />
                            </div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Watchlist Highlights */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Watchlist Highlights
                </h3>
                <div className="space-y-2">
                  {watchlistHighlights.map((film, index) => (
                    <motion.div
                      key={film}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {film}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Follow my movie journey on{' '}
              <a
                href={letterboxdProfile.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 dark:text-orange-400 hover:underline"
              >
                Letterboxd
              </a>
              {' '}for real-time updates and reviews.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}