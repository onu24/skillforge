import { Metadata } from 'next';
import { Header } from '@/components/header';
import { CourseBrowse } from '@/components/course-browse';
import { Breadcrumbs } from '@/components/breadcrumbs';

export const metadata: Metadata = {
  title: 'Courses - SkillForge',
  description: 'Browse all SkillForge courses. Find the perfect course to advance your skills.',
};

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Breadcrumbs />

      <section className="py-12 md:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Explore Our Courses</h1>
          <p className="text-lg text-muted-foreground">
            Choose from hundreds of courses taught by industry experts
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CourseBrowse />
        </div>
      </section>
    </div>
  );
}
