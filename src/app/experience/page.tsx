import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Experience - Kevin Geng',
  description: 'Professional experience at Faire, QuarkSys, Amazon, and RBC. Full-stack development and SaaS product building.',
};

export default function ExperiencePage() {
  return (
    <main className="pt-16">
      <ExperienceSection />
    </main>
  );
}