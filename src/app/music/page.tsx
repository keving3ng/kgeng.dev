import { SpotifySection } from '@/components/sections/SpotifySection';

export default function MusicPage() {
  return (
    <main className="pt-16">
      <SpotifySection />
    </main>
  );
}

export const metadata = {
  title: 'Music | Kevin Geng - Spotify Listening Activity & Musical Taste',
  description: 'Explore my musical journey powered by Spotify. From coding playlists to workout beats, discover my listening habits, top artists, and curated playlists.',
};