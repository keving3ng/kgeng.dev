import { GitHubActivitySection } from '@/components/sections/GitHubActivitySection';

export const metadata = {
  title: 'GitHub Activity - Kevin Geng',
  description: 'Live GitHub activity from Kevin Geng\'s personal and work accounts, showcasing recent commits, repositories, and development statistics.',
};

export default function GitHubPage() {
  return (
    <main>
      <GitHubActivitySection />
    </main>
  );
}