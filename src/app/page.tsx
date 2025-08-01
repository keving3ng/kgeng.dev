import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { GitHubActivitySection } from '@/components/sections/GitHubActivitySection';
import { EducationSection } from '@/components/sections/EducationSection';
import { LetterboxdSection } from '@/components/sections/LetterboxdSection';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <ExperienceSection />
      <SkillsSection />
      <ProjectsSection />
      <LetterboxdSection />
      <GitHubActivitySection />
      <EducationSection />
    </main>
  );
}