export interface LetterboxdFilm {
  id: string;
  title: string;
  year: number;
  rating: number; // 1-5 scale (representing half-stars as 0.5 increments)
  posterUrl?: string;
  watchedDate: string; // ISO date string
  review?: string;
  letterboxdUrl: string;
}

export interface LetterboxdStats {
  totalFilmsWatched: number;
  filmsThisYear: number;
  averageRating: number;
  favoriteGenres: string[];
  topRatedFilms: LetterboxdFilm[];
}

export const letterboxdProfile = {
  username: 'kegk3g',
  profileUrl: 'https://letterboxd.com/kegk3g/',
  joinDate: '2024', // Approximate based on activity
  bio: 'Tracking my movie journey, one film at a time.',
};

export const letterboxdStats: LetterboxdStats = {
  totalFilmsWatched: 96,
  filmsThisYear: 29,
  averageRating: 3.7,
  favoriteGenres: ['Superhero', 'Action', 'Comedy', 'Drama'],
  topRatedFilms: [], // Will populate below
};

export const recentFilms: LetterboxdFilm[] = [
  {
    id: 'superman-2025',
    title: 'Superman',
    year: 2025,
    rating: 4.0,
    watchedDate: '2025-01-28',
    letterboxdUrl: 'https://letterboxd.com/film/superman-2025/',
    review: 'A fresh take on the Man of Steel that captures the hope and optimism of the character.'
  },
  {
    id: 'thunderbolts-2025',
    title: 'Thunderbolts*',
    year: 2025,
    rating: 3.5,
    watchedDate: '2025-01-25',
    letterboxdUrl: 'https://letterboxd.com/film/thunderbolts/',
    review: 'An interesting ensemble piece that explores redemption themes in the MCU.'
  },
  {
    id: 'minecraft-movie-2025',
    title: 'A Minecraft Movie',
    year: 2025,
    rating: 3.0,
    watchedDate: '2025-01-20',
    letterboxdUrl: 'https://letterboxd.com/film/a-minecraft-movie/',
    review: 'Surprisingly entertaining adaptation that captures the creativity of the game.'
  },
  {
    id: 'mufasa-2024',
    title: 'Mufasa: The Lion King',
    year: 2024,
    rating: 3.5,
    watchedDate: '2025-01-15',
    letterboxdUrl: 'https://letterboxd.com/film/mufasa-the-lion-king/',
    review: 'Beautiful animation and a compelling origin story for a beloved character.'
  },
  {
    id: 'sonic-3-2024',
    title: 'Sonic the Hedgehog 3',
    year: 2024,
    rating: 4.0,
    watchedDate: '2025-01-10',
    letterboxdUrl: 'https://letterboxd.com/film/sonic-the-hedgehog-3/',
    review: 'The best entry in the series so far, with great character development and action.'
  }
];

// Set top rated films from recent films for now
letterboxdStats.topRatedFilms = recentFilms
  .filter(film => film.rating >= 4.0)
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 5);

export const ratingDistribution = {
  5: 8,   // ★★★★★
  4.5: 12, // ★★★★½
  4: 32,   // ★★★★
  3.5: 20, // ★★★½
  3: 15,   // ★★★
  2.5: 6,  // ★★½
  2: 2,    // ★★
  1.5: 1,  // ★½
  1: 0     // ★
};

export const watchlistHighlights = [
  'Dune: Part Three',
  'The Batman Part II',
  'Blade Runner 2099',
  'Spider-Man 4',
  'Fantastic Four: First Steps'
];