'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Award,
  Bell,
  BookOpen,
  Clock3,
  Download,
  ExternalLink,
  Flame,
  FolderDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Share2,
  Star,
  Target,
  Trophy,
} from 'lucide-react';
import { DashboardPageSkeleton } from '@/components/skeletons';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type Category = 'Web Development' | 'React' | 'Design';

type Course = {
  id: string;
  shortCode: string;
  title: string;
  instructor: string;
  category: Category;
  rating: number;
  reviews: number;
  progress: number;
  lessons: number;
  completedLessons: number;
  lastWatched: string;
};

type WishlistCourse = {
  id: string;
  title: string;
  instructor: string;
  price: string;
  rating: number;
};

const USER_PROFILE = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'JD',
  joinedDate: 'January 2024',
  streak: 7,
  totalHours: 42.5,
  certificates: 2,
  enrolledCourses: 3,
  level: 'Intermediate',
};

const ENROLLED_COURSES: Course[] = [
  {
    id: 'web-dev-fundamentals',
    shortCode: 'WD',
    title: 'Web Development Fundamentals',
    instructor: 'John Smith',
    category: 'Web Development',
    rating: 4.8,
    reviews: 342,
    progress: 65,
    lessons: 24,
    completedLessons: 16,
    lastWatched: '2 hours ago',
  },
  {
    id: 'advanced-react-patterns',
    shortCode: 'AR',
    title: 'Advanced React Patterns',
    instructor: 'Sarah Johnson',
    category: 'React',
    rating: 4.9,
    reviews: 416,
    progress: 30,
    lessons: 18,
    completedLessons: 5,
    lastWatched: 'Yesterday at 9:40 PM',
  },
  {
    id: 'ui-ux-design-masterclass',
    shortCode: 'UI',
    title: 'UI/UX Design Masterclass',
    instructor: 'Emma Wilson',
    category: 'Design',
    rating: 4.7,
    reviews: 289,
    progress: 85,
    lessons: 16,
    completedLessons: 13,
    lastWatched: '4 hours ago',
  },
];

const ACHIEVEMENTS = [
  { id: 'a1', icon: '🔥', title: '7-Day Streak', date: 'February 24, 2026' },
  { id: 'a2', icon: '🎓', title: 'Course Completed: Web Dev', date: 'February 21, 2026' },
  { id: 'a3', icon: '⏱️', title: '25 Hours Learned', date: 'February 17, 2026' },
  { id: 'a4', icon: '🏆', title: 'Top 10% Weekly Learners', date: 'February 10, 2026' },
];

const RECOMMENDATIONS = [
  { id: 'nextjs-architecture', title: 'Next.js Architecture Patterns', instructor: 'Aarav Gupta', category: 'Web Development', rating: 4.9, price: '$79' },
  { id: 'react-performance', title: 'React Performance Deep Dive', instructor: 'Liam Perez', category: 'React', rating: 4.8, price: '$69' },
  { id: 'design-systems', title: 'Design Systems from Scratch', instructor: 'Mia Walker', category: 'Design', rating: 4.8, price: '$74' },
  { id: 'full-stack-testing', title: 'Full Stack Testing Mastery', instructor: 'Noah Kim', category: 'Web Development', rating: 4.7, price: '$65' },
] as const;

const LEARNING_PATH = [
  { id: 'lp1', label: 'HTML and CSS Foundations', status: 'completed' },
  { id: 'lp2', label: 'JavaScript Core Concepts', status: 'completed' },
  { id: 'lp3', label: 'React Application Development', status: 'current' },
  { id: 'lp4', label: 'Backend APIs with Node.js', status: 'upcoming' },
  { id: 'lp5', label: 'Deployment and DevOps Basics', status: 'upcoming' },
] as const;

const CERTIFICATES = [
  { id: 'cert1', courseName: 'JavaScript Foundations', completionDate: 'January 18, 2026', grade: 'A (94%)' },
  { id: 'cert2', courseName: 'Responsive Web Design', completionDate: 'February 3, 2026', grade: 'A+ (97%)' },
];

const RECENT_ACTIVITY = [
  { id: 'act1', time: 'Today, 9:15 AM', icon: BookOpen, description: 'Completed lesson: Introduction to HTML5', href: '/courses/web-dev-fundamentals/learn' },
  { id: 'act2', time: 'Yesterday, 8:02 PM', icon: Award, description: 'Earned certificate in Web Development', href: '#certificates' },
  { id: 'act3', time: 'Yesterday, 6:40 PM', icon: Trophy, description: 'Achievement unlocked: 7-Day Streak', href: '#achievements' },
  { id: 'act4', time: 'February 25, 2026', icon: Heart, description: 'Added Design Systems from Scratch to wishlist', href: '#wishlist' },
  { id: 'act5', time: 'February 24, 2026', icon: Target, description: 'Reached 85% in UI/UX Design Masterclass', href: '/courses/ui-ux-design-masterclass/learn' },
];

const STATS = [
  { key: 'hours', title: 'Total Learning Hours', value: '42.5h', change: '↑ 12% from last month', gradient: 'from-blue-500/20 to-blue-400/5', icon: Clock3 },
  { key: 'streak', title: 'Current Streak', value: '7 days', change: '↑ 5% from last month', gradient: 'from-cyan-500/25 to-cyan-400/5', icon: Flame },
  { key: 'certificates', title: 'Certificates Earned', value: '2', change: '↑ 18% from last month', gradient: 'from-amber-500/20 to-amber-400/5', icon: Award },
  { key: 'saved', title: 'Saved Courses', value: '1', change: '↓ 3% from last month', gradient: 'from-red-500/20 to-red-400/5', icon: Heart },
] as const;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function categoryClass(category: Category) {
  if (category === 'Web Development') return 'bg-blue-500/15 text-blue-300 border-blue-500/40';
  if (category === 'React') return 'bg-purple-500/15 text-purple-300 border-purple-500/40';
  return 'bg-pink-500/15 text-pink-300 border-pink-500/40';
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, userData, loading, signOut } = useAuth();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [savedCourseIds, setSavedCourseIds] = useState<string[]>(['advanced-react-patterns']);
  const [wishlist, setWishlist] = useState<WishlistCourse[]>([
    { id: 'design-systems', title: 'Design Systems from Scratch', instructor: 'Mia Walker', price: '$74', rating: 4.8 },
  ]);
  const [animateAchievements, setAnimateAchievements] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, router, user]);

  useEffect(() => {
    const id = setTimeout(() => setAnimateAchievements(true), 120);
    return () => clearTimeout(id);
  }, []);

  const name = userData?.displayName || user?.displayName || USER_PROFILE.name;
  const email = userData?.email || user?.email || USER_PROFILE.email;
  const firstName = name.split(' ')[0] || 'John';

  const filteredCourses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return ENROLLED_COURSES;
    return ENROLLED_COURSES.filter((course) =>
      `${course.title} ${course.category} ${course.instructor}`.toLowerCase().includes(term),
    );
  }, [searchTerm]);

  const averageProgress = useMemo(
    () => ENROLLED_COURSES.reduce((sum, c) => sum + c.progress, 0) / ENROLLED_COURSES.length,
    [],
  );

  const recommendedCourses = useMemo(() => {
    const threshold = averageProgress / 20;
    const categories = new Set(ENROLLED_COURSES.map((c) => c.category));
    return RECOMMENDATIONS.filter((course) => categories.has(course.category as Category) && course.rating > threshold).slice(0, 4);
  }, [averageProgress]);

  const completedByCategory = useMemo(
    () => ENROLLED_COURSES.reduce<Record<string, number>>((acc, c) => {
      if (c.progress >= 80) acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {}),
    [],
  );

  const pathProgress = useMemo(() => {
    const done = LEARNING_PATH.filter((s) => s.status === 'completed').length;
    return Math.round(((done + 0.5) / LEARNING_PATH.length) * 100);
  }, []);

  const jumpToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileSidebarOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleSave = (courseId: string) => {
    const isSaving = !savedCourseIds.includes(courseId);
    setSavedCourseIds((current) =>
      current.includes(courseId) ? current.filter((id) => id !== courseId) : [...current, courseId],
    );
    toast({
      variant: 'success',
      title: isSaving ? 'Course added to wishlist!' : 'Course removed from wishlist',
      description: isSaving ? 'You can view it in your wishlist section anytime.' : 'Wishlist updated successfully.',
    });
  };

  const addToWishlist = (course: (typeof RECOMMENDATIONS)[number]) => {
    setWishlist((current) => {
      if (current.some((item) => item.id === course.id)) return current;
      toast({
        variant: 'success',
        title: 'Course added to wishlist!',
        description: `${course.title} is now in your wishlist.`,
      });
      return [...current, { id: course.id, title: course.title, instructor: course.instructor, price: course.price, rating: course.rating }];
    });
  };

  const removeFromWishlist = (courseId: string) => {
    setWishlist((current) => current.filter((course) => course.id !== courseId));
    toast({
      variant: 'success',
      title: 'Course removed from wishlist',
    });
  };

  if (loading) {
    return <DashboardPageSkeleton />;
  }

  if (!user) return null;

  const sidebar = (
    <div className="flex h-full flex-col gap-4">
      <Card className="border-border/70 bg-card/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-12 border border-border/70">
              <AvatarImage src={userData?.avatar || user.photoURL || undefined} alt={name} />
              <AvatarFallback className="bg-primary/20 text-primary">{USER_PROFILE.avatar}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-semibold">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
              <p className="text-xs text-muted-foreground">Joined {USER_PROFILE.joinedDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Quick Stats</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"><span className="text-muted-foreground">Streak</span><span className="font-semibold">{USER_PROFILE.streak} days</span></div>
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"><span className="text-muted-foreground">Hours</span><span className="font-semibold">{USER_PROFILE.totalHours}h</span></div>
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"><span className="text-muted-foreground">Certificates</span><span className="font-semibold">{USER_PROFILE.certificates}</span></div>
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"><span className="text-muted-foreground">Saved Courses</span><span className="font-semibold">{wishlist.length}</span></div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/50">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Navigation</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'browse', label: 'Browse Courses', icon: BookOpen, href: '/courses' },
            { id: 'wishlist', label: 'Wishlist', icon: Heart },
            { id: 'certificates', label: 'Certificates', icon: Award },
            { id: 'downloads', label: 'Downloads', icon: FolderDown },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            if (item.href) {
              return (
                <Button key={item.id} asChild variant="ghost" className="w-full justify-start h-11">
                  <Link href={item.href} onClick={() => setMobileSidebarOpen(false)}>
                    <Icon className="size-4" />{item.label}
                  </Link>
                </Button>
              );
            }
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn('w-full justify-start h-11', activeSection === item.id && 'bg-primary/15 text-primary')}
                onClick={() => jumpToSection(item.id)}
              >
                <Icon className="size-4" />{item.label}
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10 text-foreground">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 overflow-y-auto lg:block">{sidebar}</aside>
        <main className="min-w-0 flex-1 space-y-6">
          <header className="sticky top-4 z-20 rounded-2xl border border-border/70 bg-background/85 px-3 py-3 backdrop-blur sm:px-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="lg:hidden h-11 w-11" onClick={() => setMobileSidebarOpen(true)} aria-label="Open Menu">
                <Menu className="size-5" />
              </Button>
              <Link href="/" className="mr-2 text-xl font-bold tracking-tight text-primary">SkillForge</Link>
              <div className="relative hidden flex-1 sm:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search enrolled courses" className="pl-9 h-11" />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative h-11 w-11" aria-label="Notifications"><Bell className="size-5" /><span className="absolute right-2 top-2 inline-flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">4</span></Button>
                <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => jumpToSection('settings')} aria-label="Settings"><Settings className="size-5" /></Button>
                <Button variant="outline" className="hidden md:inline-flex h-11" onClick={handleSignOut}><LogOut className="size-4" />Sign out</Button>
              </div>
            </div>
            {/* Mobile Search - shown only on very small screens */}
            <div className="relative mt-3 sm:hidden">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search enrolled courses" className="pl-9 h-11" />
            </div>
          </header>

          {/* Mobile Sidebar Sheet */}
          <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
            <SheetContent side="left" className="w-[280px] p-0 border-r-border/70 bg-background">
              <SheetHeader className="p-6 border-b border-border/70">
                <SheetTitle className="text-left text-primary font-bold text-xl">SkillForge Dashboard</SheetTitle>
              </SheetHeader>
              <div className="p-4 overflow-y-auto h-[calc(100vh-80px)]">
                {sidebar}
                <div className="mt-4 pt-4 border-t border-border/70">
                  <Button variant="outline" className="w-full h-11 justify-start text-destructive hover:text-destructive" onClick={handleSignOut}>
                    <LogOut className="size-4" />Sign out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <section id="dashboard" className="rounded-2xl border border-border/70 bg-card/50 p-5 sm:p-6">
            <p className="text-sm text-muted-foreground">{getGreeting()}</p>
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Welcome back, {firstName}!</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Flame className="size-4 text-orange-400" />You are on a {USER_PROFILE.streak}-day streak! Keep going.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild><Link href="/courses">Browse New Courses</Link></Button>
              <Button variant="outline" onClick={() => jumpToSection('certificates')}>View All Certificates</Button>
              <Button variant="outline" onClick={() => jumpToSection('continue-learning')}>Check Progress</Button>
            </div>
          </section>

          <section id="progress" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.key} className={cn('group border-border/70 bg-gradient-to-br transition-all duration-300 hover:scale-[1.02] hover:shadow-xl', stat.gradient)}>
                  <CardHeader className="pb-2"><CardDescription className="text-muted-foreground/90">{stat.title}</CardDescription><CardTitle className="text-2xl">{stat.value}</CardTitle></CardHeader>
                  <CardContent className="flex items-center justify-between pt-0 h-11">
                    <span className="text-xs font-medium text-muted-foreground">{stat.change}</span>
                    <Icon className="size-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <section id="achievements" className="space-y-4">
            <div><h2 className="text-xl font-semibold">Recent Achievements</h2><p className="text-sm text-muted-foreground">Your latest learning wins.</p></div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {ACHIEVEMENTS.map((achievement, index) => (
                <Card key={achievement.id} className={cn('border-border/70 bg-card/50 transition-all duration-300 hover:scale-[1.02] hover:border-primary/60 hover:shadow-lg', animateAchievements ? 'animate-in zoom-in-95 fade-in slide-in-from-bottom-2' : 'opacity-0')} style={{ animationDelay: `${index * 110}ms` }}>
                  <CardContent className="p-4"><div className="text-xl">{achievement.icon}</div><p className="mt-2 font-medium">{achievement.title}</p><p className="text-xs text-muted-foreground">{achievement.date}</p></CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section id="continue-learning" className="space-y-4">
            <div><h2 className="text-xl font-semibold">Continue Learning</h2><p className="text-sm text-muted-foreground">All enrolled courses with live progress.</p></div>
            <div className="space-y-4">
              {filteredCourses.map((course) => {
                const isSaved = savedCourseIds.includes(course.id);
                return (
                  <Card key={course.id} className="border-border/70 bg-card/50 transition-all duration-300 hover:scale-[1.01] hover:border-cyan-400/60 hover:shadow-xl">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-secondary/60 font-semibold text-primary">{course.shortCode}</div>
                          <div>
                            <Link href={`/courses/${course.id}`} className="font-semibold hover:text-primary">{course.title}</Link>
                            <p className="text-sm text-muted-foreground">{course.instructor}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <Badge className={cn('border', categoryClass(course.category))}>{course.category}</Badge>
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Star className="size-3.5 fill-amber-400 text-amber-400" />{course.rating} ({course.reviews} reviews)</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => toggleSave(course.id)}><Heart className={cn('size-4', isSaved && 'fill-rose-500 text-rose-500')} />{isSaved ? 'Unsave' : 'Save'}</Button>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Progress</span><span className="font-medium">{course.progress}%</span></div>
                        <Progress value={course.progress} className="h-2" />
                        <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground"><span>{course.completedLessons} of {course.lessons} lessons</span><span>Last watched: {course.lastWatched}</span></div>
                      </div>

                      <Button asChild className="mt-4 w-full bg-cyan-500 text-cyan-950 hover:bg-cyan-400"><Link href={`/courses/${course.id}/learn`}>Continue Learning</Link></Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <section id="recommended" className="space-y-4">
            <div><h2 className="text-xl font-semibold">Recommended for You</h2><p className="text-sm text-muted-foreground">Based on your enrolled categories and average progress ({averageProgress.toFixed(0)}%).</p></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {recommendedCourses.map((course) => (
                <Card key={course.id} className="border-border/70 bg-card/50">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{course.title}</h3><p className="text-sm text-muted-foreground">{course.instructor}</p></div><Badge variant="outline" className="font-semibold">{course.price}</Badge></div>
                    <p className="text-sm text-muted-foreground"><span className="inline-flex items-center gap-1"><Star className="size-3.5 fill-amber-400 text-amber-400" /> {course.rating}</span> in {course.category}</p>
                    <p className="rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">Why recommended: You have completed {completedByCategory[course.category] || 0} courses in {course.category}.</p>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm"><Link href={`/courses/${course.id}`}>Enroll Now</Link></Button>
                      <Button size="sm" variant="outline" onClick={() => addToWishlist(course)}><Heart className="size-4" />Add to Wishlist</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section id="learning-path" className="space-y-4">
            <div><h2 className="text-xl font-semibold">Your Learning Path</h2><p className="text-sm text-muted-foreground">Full Stack Developer journey - {pathProgress}% complete</p></div>
            <Card className="border-border/70 bg-card/50">
              <CardContent className="p-5">
                <Progress value={pathProgress} className="mb-5 h-2" />
                <div className="space-y-4">
                  {LEARNING_PATH.map((step, index) => {
                    const done = step.status === 'completed';
                    const current = step.status === 'current';
                    return (
                      <div key={step.id} className="flex items-start gap-3">
                        <div className={cn('mt-0.5 flex size-7 items-center justify-center rounded-full border text-xs font-bold', done && 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300', current && 'border-cyan-500/60 bg-cyan-500/15 text-cyan-300', step.status === 'upcoming' && 'border-border/70 bg-secondary/40 text-muted-foreground')}>{done ? 'OK' : current ? 'GO' : '...'}</div>
                        <div className="flex-1">
                          <p className={cn('font-medium', done && 'text-emerald-300', current && 'text-cyan-300', step.status === 'upcoming' && 'text-muted-foreground')}>{step.label}</p>
                          <p className="text-xs text-muted-foreground">{done && 'Completed'}{current && 'Current focus'}{step.status === 'upcoming' && 'Upcoming'}</p>
                        </div>
                        {current && <Button asChild size="sm" variant="outline"><Link href="/courses">Continue</Link></Button>}
                        {!done && !current && index === LEARNING_PATH.findIndex((i) => i.status === 'upcoming') && <Button asChild size="sm"><Link href="/courses">Enroll</Link></Button>}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="certificates" className="space-y-4">
            <div><h2 className="text-xl font-semibold">Certificates</h2><p className="text-sm text-muted-foreground">Your completed course certificates.</p></div>
            {CERTIFICATES.length === 0 ? (
              <Card className="border-border/70 bg-card/50">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-7 h-7 opacity-50" />
                  </div>
                  <p className="text-lg font-semibold mb-2">No certificates yet</p>
                  <p className="text-sm">Complete your first course to earn a certificate.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {CERTIFICATES.map((certificate) => (
                  <Card key={certificate.id} className="border-border/70 bg-card/50">
                    <CardContent className="space-y-4 p-4">
                      <div className="rounded-xl border border-border/70 bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Certificate Preview</p><p className="mt-2 font-semibold">{certificate.courseName}</p></div>
                      <div className="text-sm"><p>Completion Date: <span className="text-muted-foreground">{certificate.completionDate}</span></p><p>Grade/Score: <span className="text-muted-foreground">{certificate.grade}</span></p></div>
                      <div className="flex flex-wrap gap-2" id="downloads">
                        <Button size="sm" variant="outline"><ExternalLink className="size-4" />View Full Certificate</Button>
                        <Button size="sm" variant="outline"><Download className="size-4" />Download PDF</Button>
                        <Button size="sm" variant="outline"><Share2 className="size-4" />Share Certificate</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section id="activity" className="space-y-4">
            <div><h2 className="text-xl font-semibold">Recent Activity Timeline</h2><p className="text-sm text-muted-foreground">Last 5 activities from your learning account.</p></div>
            <Card className="border-border/70 bg-card/50">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {RECENT_ACTIVITY.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <Link key={activity.id} href={activity.href} className="group flex items-start gap-3 rounded-lg border border-border/50 bg-background/20 p-3 transition hover:border-primary/50 hover:bg-background/35">
                        <div className="mt-0.5 rounded-md bg-secondary/60 p-2"><Icon className="size-4 text-primary" /></div>
                        <div className="flex-1"><p className="text-xs text-muted-foreground">{activity.time}</p><p className="text-sm font-medium group-hover:text-primary">{activity.description}</p></div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="wishlist" className="space-y-4 pb-8">
            <div><h2 className="text-xl font-semibold">Wishlist</h2><p className="text-sm text-muted-foreground">Saved/bookmarked courses.</p></div>
            {wishlist.length === 0 ? (
              <Card className="border-border/70 bg-card/50">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-7 h-7 opacity-50" />
                  </div>
                  <p className="text-lg font-semibold mb-2">Your wishlist is empty</p>
                  <p className="text-sm mb-6">No saved courses yet. Browse courses to add them!</p>
                  <Button asChild variant="outline" className="border-border text-foreground hover:bg-secondary">
                    <Link href="/courses">Browse Courses</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {wishlist.map((course) => (
                  <Card key={course.id} className="border-border/70 bg-card/50">
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div><p className="font-medium">{course.title}</p><p className="text-sm text-muted-foreground">{course.instructor}</p><p className="text-xs text-muted-foreground">{course.price} | <Star className="mb-0.5 inline size-3 fill-amber-400 text-amber-400" /> {course.rating}</p></div>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="outline"><Link href={`/courses/${course.id}`}>View Course</Link></Button>
                        <Button size="sm" variant="outline" onClick={() => removeFromWishlist(course.id)}>Remove from Wishlist</Button>
                        <Button asChild size="sm"><Link href={`/courses/${course.id}`}>Enroll Now</Link></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section id="settings">
            <Card className="border-border/70 bg-card/50">
              <CardHeader><CardTitle>Settings</CardTitle><CardDescription>Account overview and current level.</CardDescription></CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border/70 bg-background/20 p-3"><p className="text-xs uppercase text-muted-foreground">Name</p><p className="font-medium">{name}</p></div>
                <div className="rounded-lg border border-border/70 bg-background/20 p-3"><p className="text-xs uppercase text-muted-foreground">Email</p><p className="font-medium">{email}</p></div>
                <div className="rounded-lg border border-border/70 bg-background/20 p-3"><p className="text-xs uppercase text-muted-foreground">Joined</p><p className="font-medium">{USER_PROFILE.joinedDate}</p></div>
                <div className="rounded-lg border border-border/70 bg-background/20 p-3"><p className="text-xs uppercase text-muted-foreground">Level</p><p className="font-medium">{USER_PROFILE.level}</p></div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-[86%] overflow-y-auto p-4">
          <SheetTitle className="sr-only">Dashboard Navigation</SheetTitle>
          {sidebar}
        </SheetContent>
      </Sheet>
    </div>
  );
}
