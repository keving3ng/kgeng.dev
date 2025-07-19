import { AboutSection } from '@/components/sections/AboutSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - Kevin Geng',
  description: 'Learn more about Kevin Geng, Full-stack Software Engineer with 3+ years of experience building SaaS products.',
};

export default function AboutPage() {
  return (
    <main className="pt-16">
      <AboutSection />
    </main>
  );
}