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
  joinDate: '2024', // 2024-12-29
  bio: 'Tracking my movie journey, one film at a time.',
};

export const letterboxdStats: LetterboxdStats = {
  totalFilmsWatched: 96,
  filmsThisYear: 51,
  averageRating: 3.7,
  favoriteGenres: ['Drama', 'Action', 'Comedy', 'Thriller'], // Based on top-rated films
  topRatedFilms: [], // Will populate below
};

export const recentFilms: LetterboxdFilm[] = [
  {
    id: 'superman-2025',
    title: 'Superman',
    year: 2025,
    rating: 4,
    watchedDate: '2025-07-20',
    letterboxdUrl: 'https://boxd.it/E9IU',
    review: 'Excellent film that exceeded expectations.'
  },
  {
    id: 'transformers-one-2024',
    title: 'Transformers One',
    year: 2024,
    rating: 3.5,
    watchedDate: '2025-07-06',
    letterboxdUrl: 'https://boxd.it/q7bc'
  },
  {
    id: 'thunderbolts-2025',
    title: 'Thunderbolts*',
    year: 2025,
    rating: 3.5,
    watchedDate: '2025-07-01',
    letterboxdUrl: 'https://boxd.it/BfbQ'
  },
  {
    id: 'sinners-2025',
    title: 'Sinners',
    year: 2025,
    rating: 4.5,
    watchedDate: '2025-06-07',
    letterboxdUrl: 'https://boxd.it/KQMM',
    review: 'Excellent film that exceeded expectations.'
  },
  {
    id: 'the-nice-guys-2016',
    title: 'The Nice Guys',
    year: 2016,
    rating: 4,
    watchedDate: '2025-06-01',
    letterboxdUrl: 'https://boxd.it/94Hg',
    review: 'Excellent film that exceeded expectations.'
  },
  {
    id: 'a-minecraft-movie-2025',
    title: 'A Minecraft Movie',
    year: 2025,
    rating: 3,
    watchedDate: '2025-05-27',
    letterboxdUrl: 'https://boxd.it/zRro'
  },
  {
    id: 'coneheads-1993',
    title: 'Coneheads',
    year: 1993,
    rating: 3,
    watchedDate: '2025-05-27',
    letterboxdUrl: 'https://boxd.it/1YeS'
  },
  {
    id: 'fantastic-mr-fox-2009',
    title: 'Fantastic Mr. Fox',
    year: 2009,
    rating: 4,
    watchedDate: '2025-05-21',
    letterboxdUrl: 'https://boxd.it/1WyQ',
    review: 'Excellent film that exceeded expectations.'
  },
  {
    id: 'sing-sing-2023',
    title: 'Sing Sing',
    year: 2023,
    rating: 4,
    watchedDate: '2025-05-17',
    letterboxdUrl: 'https://boxd.it/HIBA',
    review: 'Excellent film that exceeded expectations.'
  },
  {
    id: 'ford-v-ferrari-2019',
    title: 'Ford v Ferrari',
    year: 2019,
    rating: 4,
    watchedDate: '2025-05-05',
    letterboxdUrl: 'https://boxd.it/ce74',
    review: 'Excellent film that exceeded expectations.'
  }
];

// Set top rated films
letterboxdStats.topRatedFilms = [
  {
    id: 'parasite-2019',
    title: 'Parasite',
    year: 2019,
    rating: 5,
    watchedDate: '2025-01-06',
    letterboxdUrl: 'https://boxd.it/hTha',
    review: 'Outstanding film that deserves its high rating.'
  },
  {
    id: 'forrest-gump-1994',
    title: 'Forrest Gump',
    year: 1994,
    rating: 5,
    watchedDate: '2025-01-06',
    letterboxdUrl: 'https://boxd.it/728',
    review: 'Outstanding film that deserves its high rating.'
  },
  {
    id: 'spiderman-into-the-spiderverse-2018',
    title: 'Spider-Man: Into the Spider-Verse',
    year: 2018,
    rating: 5,
    watchedDate: '2025-01-06',
    letterboxdUrl: 'https://boxd.it/azpY',
    review: 'Outstanding film that deserves its high rating.'
  },
  {
    id: 'hacksaw-ridge-2016',
    title: 'Hacksaw Ridge',
    year: 2016,
    rating: 5,
    watchedDate: '2025-01-18',
    letterboxdUrl: 'https://boxd.it/azew',
    review: 'Outstanding film that deserves its high rating.'
  },
  {
    id: 'the-grand-budapest-hotel-2014',
    title: 'The Grand Budapest Hotel',
    year: 2014,
    rating: 4.5,
    watchedDate: '2025-01-06',
    letterboxdUrl: 'https://boxd.it/3ZqO',
    review: 'Outstanding film that deserves its high rating.'
  },
  {
    id: 'paddington-2-2017',
    title: 'Paddington 2',
    year: 2017,
    rating: 4.5,
    watchedDate: '2025-01-06',
    letterboxdUrl: 'https://boxd.it/bCF8',
    review: 'Outstanding film that deserves its high rating.'
  },
  {
    id: 'fight-club-1999',
    title: 'Fight Club',
    year: 1999,
    rating: 4.5,
    watchedDate: '2025-01-06',
    letterboxdUrl: 'https://boxd.it/2a9q',
    review: 'Outstanding film that deserves its high rating.'
  },
  {
    id: 'inglourious-basterds-2009',
    title: 'Inglourious Basterds',
    year: 2009,
    rating: 4.5,
    watchedDate: '2025-01-06',
    letterboxdUrl: 'https://boxd.it/1JzG',
    review: 'Outstanding film that deserves its high rating.'
  },
  {
    id: 'everything-everywhere-all-at-once-2022',
    title: 'Everything Everywhere All at Once',
    year: 2022,
    rating: 4.5,
    watchedDate: '2025-01-06',
    letterboxdUrl: 'https://boxd.it/jUk4',
    review: 'Outstanding film that deserves its high rating.'
  },
  {
    id: 'inception-2010',
    title: 'Inception',
    year: 2010,
    rating: 4.5,
    watchedDate: '2025-01-06',
    letterboxdUrl: 'https://boxd.it/1skk',
    review: 'Outstanding film that deserves its high rating.'
  }
];

export const ratingDistribution = {
  1: 1,   // ★
  1.5: 1, // ★½
  2: 3,   // ★★
  2.5: 1, // ★★½
  3: 8,   // ★★★
  3.5: 11, // ★★★½
  4: 21,   // ★★★★
  4.5: 13, // ★★★★½
  5: 4     // ★★★★★
};

export const watchlistHighlights = [
  'Jojo Rabbit',
  'Spotlight',
  'Whiplash',
  'The Pursuit of Happyness',
  'Spider-Man 2',
  'City of God',
  'Spirited Away',
  'Cast Away',
  'Eyes Wide Shut',
  'The Truman Show'
];
