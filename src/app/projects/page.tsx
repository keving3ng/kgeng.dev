import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects - Kevin Geng',
  description: 'Featured projects including React applications, machine learning projects, and web development work.',
};

export default function ProjectsPage() {
  return (
    <main className="pt-16">
      <ProjectsSection />
    </main>
  );
}