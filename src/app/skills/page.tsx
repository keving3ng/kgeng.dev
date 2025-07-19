import { SkillsSection } from '@/components/sections/SkillsSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Skills - Kevin Geng',
  description: 'Technical skills and expertise in React, Java, TypeScript, AWS, and modern web development technologies.',
};

export default function SkillsPage() {
  return (
    <main className="pt-16">
      <SkillsSection />
    </main>
  );
}