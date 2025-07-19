import { EducationSection } from '@/components/sections/EducationSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Education - Kevin Geng',
  description: 'Education at Carleton University, certifications, and leadership experience in software engineering.',
};

export default function EducationPage() {
  return (
    <main className="pt-16">
      <EducationSection />
    </main>
  );
}