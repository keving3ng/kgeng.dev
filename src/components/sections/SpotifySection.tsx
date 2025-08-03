'use client';

import { motion } from 'framer-motion';
import { Music, Play, Clock, Users, TrendingUp, Headphones, Disc, Heart } from 'lucide-react';
import { 
  spotifyProfile, 
  spotifyStats, 
  recentlyPlayed, 
  topTracks,
  topArtists,
  featuredPlaylists,
  genreDistribution,
  listeningHours,
  SpotifyTrack,
  SpotifyArtist,
  SpotifyPlaylist
} from '@/data/spotify';

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatPlaytime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${remainingMinutes}m`;
};

const TrackCard = ({ track, showPlayedAt = false }: { track: SpotifyTrack; showPlayedAt?: boolean }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
          <Music className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">
            {track.name}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {track.artist}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
            {track.album}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatDuration(track.duration_ms)}
          </p>
          {showPlayedAt && track.played_at && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {new Date(track.played_at).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <a
          href={track.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-green-600 dark:text-green-400 hover:underline text-sm"
        >
          <Play className="h-3 w-3" />
          <span>Play on Spotify</span>
        </a>
      </div>
    </motion.div>
  );
};

const ArtistCard = ({ artist }: { artist: SpotifyArtist }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700 text-center"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-3 flex items-center justify-center">
        <Users className="h-8 w-8 text-white" />
      </div>
      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
        {artist.name}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {artist.followers.toLocaleString()} followers
      </p>
      <div className="flex flex-wrap gap-1 justify-center mb-3">
        {artist.genres.slice(0, 2).map((genre) => (
          <span
            key={genre}
            className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-full text-xs"
          >
            {genre}
          </span>
        ))}
      </div>
      <a
        href={artist.external_urls.spotify}
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-600 dark:text-green-400 hover:underline text-sm"
      >
        View on Spotify
      </a>
    </motion.div>
  );
};

const PlaylistCard = ({ playlist }: { playlist: SpotifyPlaylist }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
          <Disc className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
            {playlist.name}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
            {playlist.description}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {playlist.tracks.total} tracks
          </p>
        </div>
      </div>
      <div className="mt-3">
        <a
          href={playlist.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-purple-600 dark:text-purple-400 hover:underline text-sm"
        >
          <Play className="h-3 w-3" />
          <span>Open Playlist</span>
        </a>
      </div>
    </motion.div>
  );
};

export function SpotifySection() {
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

  const maxGenreCount = Math.max(...Object.values(genreDistribution));
  const maxListeningHour = Math.max(...Object.values(listeningHours));

  return (
    <section id="spotify" className="py-20 bg-gray-50 dark:bg-gray-900/50">
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
              <Headphones className="h-8 w-8 text-gray-900 dark:text-white" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Music Taste
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
              My musical journey powered by Spotify. From coding playlists to workout beats, 
              exploring the soundtrack of productivity and passion.
            </p>
            
            {/* Profile Link */}
            <a
              href={spotifyProfile.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-100 text-green-800 rounded-full font-medium hover:bg-green-200 transition-colors dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
            >
              <Music className="h-5 w-5" />
              <span>@{spotifyProfile.displayName}</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </a>
          </motion.div>

          {/* Stats Overview */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPlaytime(spotifyStats.totalPlaytime)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Playtime</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {spotifyStats.discoveryScore}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Discovery</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Music className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(spotifyStats.averageTrackLength / 60)}m
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Length</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {spotifyStats.topGenres.length}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Top Genres</p>
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recently Played */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Recently Played
              </h3>
              <div className="space-y-4">
                {recentlyPlayed.slice(0, 5).map((track) => (
                  <TrackCard key={track.id} track={track} showPlayedAt />
                ))}
              </div>
            </motion.div>

            {/* Genre Distribution */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top Genres
                </h3>
                <div className="space-y-3">
                  {Object.entries(genreDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 6)
                    .map(([genre, count], index) => {
                      const percentage = (count / maxGenreCount) * 100;
                      
                      return (
                        <div key={genre} className="flex items-center space-x-3">
                          <div className="w-16 text-sm font-medium text-gray-900 dark:text-white">
                            {genre}
                          </div>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${percentage}%` }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="bg-green-500 h-2 rounded-full"
                              />
                            </div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                            {count}%
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Most Active Time */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Listening Pattern
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Most Active
                    </span>
                  </div>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    {spotifyStats.mostActiveTime}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Peak listening hours based on activity patterns
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Top Artists */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Top Artists
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {topArtists.slice(0, 5).map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </motion.div>

          {/* Featured Playlists */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Featured Playlists
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredPlaylists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Follow my musical journey on{' '}
              <a
                href={spotifyProfile.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 dark:text-green-400 hover:underline"
              >
                Spotify
              </a>
              {' '}for real-time listening activity and curated playlists.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Music data represents personal listening habits and preferences. 
              Connect with Spotify API for live updates.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}