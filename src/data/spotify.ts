export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
  preview_url?: string;
  played_at?: string;
  image?: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  external_urls: {
    spotify: string;
  };
  followers: number;
  image?: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  external_urls: {
    spotify: string;
  };
  tracks: {
    total: number;
  };
  image?: string;
}

export interface SpotifyStats {
  totalPlaytime: number; // in minutes
  topGenres: string[];
  averageTrackLength: number; // in seconds
  mostActiveTime: string; // e.g., "Evening (6-10 PM)"
  discoveryScore: number; // percentage of new artists discovered
}

export const spotifyProfile = {
  userId: '12158895052',
  displayName: 'Kevin Geng',
  profileUrl: 'https://open.spotify.com/user/12158895052',
  profileImage: '',
  followers: 0,
  following: 19, // Approximate based on typical usage
  country: 'CA',
};

export const spotifyStats: SpotifyStats = {
  totalPlaytime: 12450, // ~207 hours
  topGenres: ['Hip-Hop', 'Pop', 'Electronic', 'R&B', 'Rock'],
  averageTrackLength: 210, // ~3.5 minutes
  mostActiveTime: 'Evening (6-10 PM)',
  discoveryScore: 23, // 23% new artists discovered
};

export const recentlyPlayed: SpotifyTrack[] = [
  {
    id: 'track-1',
    name: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration_ms: 200040,
    external_urls: {
      spotify: 'https://open.spotify.com/track/0VjIjW4GlULA7a6AjQOHe8',
    },
    played_at: '2025-01-31T23:45:00Z',
  },
  {
    id: 'track-2',
    name: 'Good 4 U',
    artist: 'Olivia Rodrigo',
    album: 'SOUR',
    duration_ms: 178147,
    external_urls: {
      spotify: 'https://open.spotify.com/track/4ZtFanR9U6ndgddUvNcjcG',
    },
    played_at: '2025-01-31T23:20:00Z',
  },
  {
    id: 'track-3',
    name: 'Heat Waves',
    artist: 'Glass Animals',
    album: 'Dreamland',
    duration_ms: 238805,
    external_urls: {
      spotify: 'https://open.spotify.com/track/02MWAaffLxlfxAUY7c5dvx',
    },
    played_at: '2025-01-31T22:55:00Z',
  },
  {
    id: 'track-4',
    name: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration_ms: 203064,
    external_urls: {
      spotify: 'https://open.spotify.com/track/463CkQjx2Zk1yXoBuierM9',
    },
    played_at: '2025-01-31T22:30:00Z',
  },
  {
    id: 'track-5',
    name: 'Stay',
    artist: 'The Kid LAROI & Justin Bieber',
    album: 'Stay',
    duration_ms: 141806,
    external_urls: {
      spotify: 'https://open.spotify.com/track/5PjdY0CKGZdEuoNab3yDmX',
    },
    played_at: '2025-01-31T22:05:00Z',
  },
];

export const topTracks: SpotifyTrack[] = [
  {
    id: 'top-track-1',
    name: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration_ms: 200040,
    external_urls: {
      spotify: 'https://open.spotify.com/track/0VjIjW4GlULA7a6AjQOHe8',
    },
  },
  {
    id: 'top-track-2',
    name: 'Watermelon Sugar',
    artist: 'Harry Styles',
    album: 'Fine Line',
    duration_ms: 174000,
    external_urls: {
      spotify: 'https://open.spotify.com/track/6UelLqGlWMcVH1E5c4H7lY',
    },
  },
  {
    id: 'top-track-3',
    name: 'Good 4 U',
    artist: 'Olivia Rodrigo',
    album: 'SOUR',
    duration_ms: 178147,
    external_urls: {
      spotify: 'https://open.spotify.com/track/4ZtFanR9U6ndgddUvNcjcG',
    },
  },
  {
    id: 'top-track-4',
    name: 'Peaches',
    artist: 'Justin Bieber ft. Daniel Caesar & Giveon',
    album: 'Justice',
    duration_ms: 198040,
    external_urls: {
      spotify: 'https://open.spotify.com/track/4iJyoBOLtHqaGxP12qzhQI',
    },
  },
  {
    id: 'top-track-5',
    name: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration_ms: 203064,
    external_urls: {
      spotify: 'https://open.spotify.com/track/463CkQjx2Zk1yXoBuierM9',
    },
  },
];

export const topArtists: SpotifyArtist[] = [
  {
    id: 'artist-1',
    name: 'The Weeknd',
    genres: ['canadian contemporary r&b', 'canadian pop', 'pop'],
    external_urls: {
      spotify: 'https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpatF05PJ',
    },
    followers: 87654321,
  },
  {
    id: 'artist-2',
    name: 'Dua Lipa',
    genres: ['dance pop', 'pop', 'uk pop'],
    external_urls: {
      spotify: 'https://open.spotify.com/artist/6M2wZ9GZgrQXHCFfjv46we',
    },
    followers: 45678901,
  },
  {
    id: 'artist-3',
    name: 'Harry Styles',
    genres: ['pop', 'british invasion'],
    external_urls: {
      spotify: 'https://open.spotify.com/artist/6KImCVD70vtIoJWnq6nGn3',
    },
    followers: 54321098,
  },
  {
    id: 'artist-4',
    name: 'Olivia Rodrigo',
    genres: ['pop', 'teen pop'],
    external_urls: {
      spotify: 'https://open.spotify.com/artist/1McMsnEElThX1knmY4oliG',
    },
    followers: 32109876,
  },
  {
    id: 'artist-5',
    name: 'Post Malone',
    genres: ['dfw rap', 'melodic rap', 'pop rap'],
    external_urls: {
      spotify: 'https://open.spotify.com/artist/246dkjvS1zLTtiykXe5h60',
    },
    followers: 43210987,
  },
];

export const featuredPlaylists: SpotifyPlaylist[] = [
  {
    id: 'playlist-1',
    name: 'Coding Focus',
    description: 'Instrumental and ambient tracks perfect for deep focus sessions',
    external_urls: {
      spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd',
    },
    tracks: {
      total: 89,
    },
  },
  {
    id: 'playlist-2',
    name: 'Workout Motivation',
    description: 'High-energy tracks to power through workouts',
    external_urls: {
      spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd',
    },
    tracks: {
      total: 67,
    },
  },
  {
    id: 'playlist-3',
    name: 'Chill Vibes',
    description: 'Relaxing tunes for unwinding after a long day',
    external_urls: {
      spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd',
    },
    tracks: {
      total: 124,
    },
  },
  {
    id: 'playlist-4',
    name: 'Throwback Hits',
    description: 'Nostalgic tracks from the 2000s and 2010s',
    external_urls: {
      spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd',
    },
    tracks: {
      total: 156,
    },
  },
];

// Genre distribution for visualization
export const genreDistribution = {
  'Hip-Hop': 28,
  'Pop': 24,
  'Electronic': 18,
  'R&B': 15,
  'Rock': 12,
  'Alternative': 8,
  'Jazz': 5,
  'Classical': 3,
};

// Listening time distribution by hour (0-23)
export const listeningHours = {
  0: 2, 1: 1, 2: 0, 3: 0, 4: 0, 5: 1,
  6: 3, 7: 8, 8: 12, 9: 15, 10: 18, 11: 22,
  12: 25, 13: 28, 14: 30, 15: 32, 16: 35, 17: 40,
  18: 45, 19: 50, 20: 48, 21: 42, 22: 35, 23: 15,
};