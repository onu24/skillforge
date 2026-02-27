'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCourseById } from '@/lib/firestore-helpers';
import { Course } from '@/lib/firestore-schemas';
import { sampleCourses } from '@/lib/sample-courses';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CheckoutModal } from '@/components/checkout-modal';
import { CourseCard } from '@/components/course-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ArrowLeft, Clock, Users, Award, PlayCircle, Infinity, MessageCircle, ChevronDown, ChevronUp, Star } from 'lucide-react';

// ── Sample reviews keyed by course id ──
const sampleReviews = [
  { id: 'r1', name: 'Arjun Mehta', rating: 5, date: 'Jan 2025', comment: 'Incredible depth of content. The projects were challenging and the instructor explained complex topics with clarity. Highly recommend for anyone serious about leveling up.' },
  { id: 'r2', name: 'Sophie Laurent', rating: 4, date: 'Feb 2025', comment: 'Great course overall. Some sections could use more exercises, but the theory and real-world examples are top-notch. Well worth the investment.' },
  { id: 'r3', name: 'Carlos Rivera', rating: 5, date: 'Mar 2025', comment: 'This course transformed my career. I went from junior to senior in under a year by applying the patterns taught here. The community support is amazing too.' },
];

// ── Instructor bios ──
const instructorBios: Record<string, string> = {
  'Alex Rivera': 'Senior Frontend Engineer at a Fortune 500 company with 10+ years of React experience. Has mentored over 5,000 students and contributed to major open-source projects.',
  'Sarah Chen': 'Full-stack architect specializing in Next.js and serverless. Former engineering lead at a YC-backed startup. Speaker at React Conf and Next.js Conf.',
  'Marcus Johnson': 'Web development educator and content creator with a passion for teaching beginners. Has built 50+ production websites and authored two bestselling web development books.',
  'David Park': 'Backend engineer with expertise in Node.js, microservices, and cloud infrastructure. Previously at AWS and Google Cloud. Certified Kubernetes administrator.',
  'Emma Wilson': 'Lead Product Designer with experience at Spotify and Airbnb. Specializes in design systems, user research, and accessibility. Google UX Design certificate instructor.',
  'Lisa Chang': 'Figma expert and design systems architect. Has built design systems used by teams of 100+ designers. Regular speaker at Config and Into Design conferences.',
  'Ryan Foster': 'Motion designer and creative director with 8 years in advertising and film. Has created campaigns for Nike, Apple, and Netflix. After Effects certified expert.',
  'Michael Torres': 'Serial entrepreneur who has founded three startups, raising over $15M in venture funding. Now teaches aspiring founders the lessons he learned the hard way.',
  'Jennifer Adams': 'Former VP of Finance at Goldman Sachs with 15 years of investment banking experience. CFA charterholder and financial modeling expert.',
  'Robert Kim': 'PMP-certified project manager with 12 years leading Agile teams. Has managed $50M+ budgets across tech, healthcare, and fintech sectors.',
  'Amanda Brooks': 'Digital marketing strategist who has managed $10M+ in ad spend. Former Head of Growth at a SaaS unicorn. Google Ads and Meta certified.',
  'Daniel Wright': 'Award-winning copywriter and content strategist. Has written for brands like HubSpot, Shopify, and Salesforce. Bestselling author on content marketing.',
  'Dr. Priya Sharma': 'Data scientist with a PhD in Machine Learning from MIT. Published 20+ research papers. Previously at DeepMind. Passionate about making AI accessible.',
  'Dr. James Liu': 'ML Engineering lead at a top AI research lab. Built production ML systems serving millions of users. Stanford CS adjunct faculty.',
  'Kevin Mueller': 'Database architect with expertise in PostgreSQL and distributed systems. Former DBA lead at Stripe. Has optimized queries serving billions of rows.',
  'Natalie Green': 'TypeScript evangelist and open-source contributor. Core team member of a popular React component library. Has spoken at TSConf and React Summit.',
};

// ── "What you will learn" per category ──
const learningOutcomes: Record<string, string[]> = {
  'Web Development': [
    'Build production-grade web applications from scratch',
    'Master modern frameworks and tooling',
    'Implement authentication, APIs, and database integration',
    'Write clean, maintainable, and performant code',
    'Deploy applications to production with CI/CD',
    'Follow industry-standard coding practices and patterns',
  ],
  'Design': [
    'Apply design thinking to solve real user problems',
    'Create stunning visual designs with modern tools',
    'Build reusable component libraries and design systems',
    'Master prototyping and interactive animations',
    'Conduct effective user research and usability testing',
    'Build a professional portfolio of design case studies',
  ],
  'Business': [
    'Develop strategic business and financial thinking',
    'Build and validate business models',
    'Create professional presentations and reports',
    'Master project planning and risk management',
    'Communicate effectively with stakeholders and investors',
    'Apply frameworks used by top consulting firms',
  ],
  'Marketing': [
    'Build full-funnel digital marketing strategies',
    'Master SEO, paid ads, and content marketing',
    'Write high-converting copy for landing pages and emails',
    'Measure and optimize campaign ROI with analytics',
    'Create data-driven marketing plans',
    'Build and nurture engaged online communities',
  ],
  'Data Science': [
    'Analyze and visualize data to extract actionable insights',
    'Build machine learning models for real-world problems',
    'Master Python, SQL, and essential data libraries',
    'Design robust data pipelines and ETL workflows',
    'Communicate findings effectively to non-technical stakeholders',
    'Deploy models to production environments',
  ],
};

// ── Syllabus modules per category ──
const syllabusModules: Record<string, { title: string; lessons: string[] }[]> = {
  'Web Development': [
    { title: 'Module 1: Foundation', lessons: ['Environment Setup & Tooling', 'Core Language Fundamentals', 'Version Control with Git'] },
    { title: 'Module 2: Building Blocks', lessons: ['Component Architecture', 'State Management Patterns', 'Styling & Responsive Design', 'Routing & Navigation', 'Forms & Validation'] },
    { title: 'Module 3: Advanced Patterns', lessons: ['API Integration & Data Fetching', 'Authentication & Authorization', 'Performance Optimization', 'Testing Strategies'] },
    { title: 'Module 4: Production', lessons: ['Deployment & CI/CD', 'Monitoring & Analytics', 'Capstone Project'] },
  ],
  'Design': [
    { title: 'Module 1: Design Foundations', lessons: ['Design Principles & Theory', 'Color Theory & Typography', 'Layout & Composition'] },
    { title: 'Module 2: User Experience', lessons: ['User Research Methods', 'Information Architecture', 'Wireframing & Lo-Fi Prototyping', 'Usability Testing', 'Accessibility Standards'] },
    { title: 'Module 3: Visual Design', lessons: ['Hi-Fi Mockups', 'Design Systems & Tokens', 'Interactive Prototyping', 'Motion & Micro-interactions'] },
  ],
  'Business': [
    { title: 'Module 1: Fundamentals', lessons: ['Business Model Canvas', 'Market Analysis & Research', 'Financial Literacy'] },
    { title: 'Module 2: Strategy', lessons: ['Competitive Analysis', 'Growth Strategies', 'Product-Market Fit', 'Stakeholder Management', 'Risk Assessment'] },
    { title: 'Module 3: Execution', lessons: ['Project Planning', 'Team Leadership', 'Fundraising & Pitching', 'Capstone Project'] },
  ],
  'Marketing': [
    { title: 'Module 1: Strategy', lessons: ['Marketing Funnel Design', 'Target Audience & Personas', 'Channel Selection'] },
    { title: 'Module 2: Channels', lessons: ['SEO & Content Marketing', 'Social Media Advertising', 'Email Marketing & Automation', 'Paid Search (Google Ads)', 'Analytics & Attribution'] },
    { title: 'Module 3: Conversion', lessons: ['Landing Page Optimization', 'A/B Testing', 'Copywriting Frameworks', 'Campaign Review'] },
  ],
  'Data Science': [
    { title: 'Module 1: Foundations', lessons: ['Python Essentials', 'Statistics & Probability', 'Data Wrangling with Pandas'] },
    { title: 'Module 2: Analysis & Visualization', lessons: ['Exploratory Data Analysis', 'Data Visualization (Matplotlib, Seaborn)', 'SQL for Data Analysis', 'Dashboard Design', 'Storytelling with Data'] },
    { title: 'Module 3: Machine Learning', lessons: ['Supervised Learning', 'Unsupervised Learning', 'Model Evaluation & Tuning', 'Deployment & MLOps'] },
  ],
};

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`${cls} ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : i < rating ? 'text-yellow-400 fill-yellow-400 opacity-50' : 'text-muted-foreground/30'}`}
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true });

  const courseId = params.id as string;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getCourseById(courseId);
        if (data) {
          setCourse(data);
        } else {
          // Fallback to sample courses
          const sample = sampleCourses.find((c) => c.id === courseId);
          setCourse(sample || null);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        const sample = sampleCourses.find((c) => c.id === courseId);
        setCourse(sample || null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const toggleModule = (idx: number) => {
    setExpandedModules((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-6 bg-card rounded w-1/3" />
            <div className="h-48 bg-card rounded-lg" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-card rounded w-3/4" />
                <div className="h-4 bg-card rounded w-1/2" />
                <div className="h-64 bg-card rounded-lg" />
              </div>
              <div className="h-96 bg-card rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 404 ──
  if (!course) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
          <p className="text-muted-foreground mb-8">The course you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/courses">Browse All Courses</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleEnroll = () => {
    if (!user) { router.push('/login'); return; }
    setCheckoutOpen(true);
  };

  const handlePaymentSuccess = () => {
    router.push(`/dashboard?enrolled=${courseId}`);
  };

  const hours = Math.floor(course.duration / 60);
  const weeks = Math.max(4, Math.ceil(hours / 4));
  const bio = instructorBios[course.instructorName] || 'Experienced instructor passionate about teaching and mentoring the next generation of professionals.';
  const outcomes = learningOutcomes[course.category] || learningOutcomes['Web Development'];
  const modules = syllabusModules[course.category] || syllabusModules['Web Development'];

  // Related courses: same category, different id
  const relatedCourses = sampleCourses.filter((c) => c.category === course.category && c.id !== course.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Breadcrumbs courseName={course.title} />

      {/* ── Hero Section ── */}
      <section className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-background to-background" />
        <div className="absolute inset-0">
          <div className="absolute -top-40 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
          <Button asChild variant="ghost" size="sm" className="mb-6 text-muted-foreground hover:text-foreground">
            <Link href="/courses"><ArrowLeft className="w-4 h-4 mr-2" />Back to Courses</Link>
          </Button>

          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">{course.category}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{course.title}</h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-3xl leading-relaxed">{course.description}</p>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            {/* Instructor */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {course.instructorName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold">{course.instructorName}</p>
                <p className="text-xs text-muted-foreground">Instructor</p>
              </div>
            </div>
            {/* Rating */}
            <div className="flex items-center gap-2">
              <StarRating rating={course.rating} size="lg" />
              <span className="font-semibold">{course.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({course.reviewCount} reviews)</span>
            </div>
            {/* Students */}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{course.enrollmentCount.toLocaleString()} students</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Two Column Layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">

          {/* ── LEFT COLUMN (70%) ── */}
          <div className="lg:col-span-7 space-y-10">

            {/* What you'll learn */}
            <div className="p-6 rounded-lg border border-border bg-card/50">
              <h2 className="text-2xl font-bold mb-6">What you&apos;ll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {outcomes.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Syllabus */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Course Syllabus</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {modules.reduce((a, m) => a + m.lessons.length, 0)} lessons • {hours} hours total
              </p>
              <div className="space-y-3">
                {modules.map((mod, idx) => (
                  <div key={idx} className="rounded-lg border border-border bg-card/50 overflow-hidden">
                    <button
                      onClick={() => toggleModule(idx)}
                      className="w-full flex items-center justify-between p-4 hover:bg-card transition-colors text-left"
                    >
                      <div>
                        <p className="font-semibold">{mod.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{mod.lessons.length} lessons</p>
                      </div>
                      {expandedModules[idx] ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                    </button>
                    {expandedModules[idx] && (
                      <div className="border-t border-border">
                        {mod.lessons.map((lesson, li) => (
                          <div key={li} className="flex items-center gap-3 px-4 py-3 text-sm border-b border-border last:border-0">
                            <PlayCircle className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{lesson}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor Profile */}
            <div className="p-6 rounded-lg border border-border bg-card/50">
              <h2 className="text-2xl font-bold mb-6">Your Instructor</h2>
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0">
                  {course.instructorName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{course.instructorName}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{course.category} Expert</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400" /> {course.rating.toFixed(1)} rating</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {course.enrollmentCount.toLocaleString()} students</span>
                    <span className="flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5" /> {course.lessons.length} lessons</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Reviews */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>
              <div className="space-y-4">
                {sampleReviews.map((review) => (
                  <div key={review.id} className="p-5 rounded-lg border border-border bg-card/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{review.name}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Courses */}
            {relatedCourses.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Related Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedCourses.map((c) => (
                    <CourseCard key={c.id} course={c} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN (30%) ── */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              {/* Price card */}
              <div className="p-6 rounded-lg border border-border bg-card/50">
                <div className="text-4xl font-bold text-primary mb-2">${course.price}</div>
                <p className="text-xs text-muted-foreground mb-6">One-time payment • Lifetime access</p>

                <Button
                  onClick={handleEnroll}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold mb-4"
                >
                  {user ? 'Enroll Now' : 'Sign In to Enroll'}
                </Button>

                <p className="text-center text-xs text-muted-foreground mb-6">30-day money-back guarantee</p>

                {/* Course details */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level</span>
                    <Badge variant="secondary" className="capitalize">{course.level}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-semibold">{weeks} weeks, {hours} hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Students</span>
                    <span className="font-semibold">{course.enrollmentCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-semibold">{course.category}</span>
                  </div>
                </div>
              </div>

              {/* Course includes */}
              <div className="p-6 rounded-lg border border-border bg-card/50">
                <h3 className="font-semibold mb-4">This course includes</h3>
                <div className="space-y-3 text-sm">
                  {[
                    { icon: <PlayCircle className="w-4 h-4" />, text: `${hours} hours of on-demand video` },
                    { icon: <Infinity className="w-4 h-4" />, text: 'Lifetime access' },
                    { icon: <Award className="w-4 h-4" />, text: 'Certificate of completion' },
                    { icon: <MessageCircle className="w-4 h-4" />, text: 'Q&A instructor support' },
                    { icon: <Clock className="w-4 h-4" />, text: 'Self-paced learning' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-muted-foreground">
                      <span className="text-primary">{item.icon}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
