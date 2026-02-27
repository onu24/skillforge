'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Toaster } from '@/components/ui/toaster';
import { EmptyState } from '@/components/empty-state';
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Award,
  Bell,
  BookOpen,
  Bookmark,
  Clock,
  Download,
  ExternalLink,
  Flame,
  FolderDown,
  Heart,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Search,
  Settings,
  Share2,
  Star,
  Target,
  Trophy,
  X,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { DashboardPageSkeleton } from '@/components/skeletons';
import { useToast } from '@/hooks/use-toast';
import { useSearchHistory } from '@/hooks/use-search-history';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuth } from "@/lib/auth-context"
import { getDashboardStats, toggleWishlist, getWishlist, getActivityLogs, getCertificates } from "@/lib/firestore-helpers"

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

const RECENT_ACTIVITY_MOCK = [
  { id: 'act1', time: 'Today, 9:15 AM', icon: BookOpen, description: 'Completed lesson: Introduction to HTML5', href: '/courses/web-dev-fundamentals/learn' },
  { id: 'act2', time: 'Yesterday, 8:02 PM', icon: Award, description: 'Earned certificate in Web Development', href: '#certificates' },
  { id: 'act3', time: 'Yesterday, 6:40 PM', icon: Trophy, description: 'Achievement unlocked: 7-Day Streak', href: '#achievements' },
  { id: 'act4', time: 'February 25, 2026', icon: Heart, description: 'Added Design Systems from Scratch to wishlist', href: '#wishlist' },
  { id: 'act5', time: 'February 24, 2026', icon: Target, description: 'Reached 85% in UI/UX Design Masterclass', href: '/courses/ui-ux-design-masterclass/learn' },
];

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
  const { history, addToHistory } = useSearchHistory();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [savedCourseIds, setSavedCourseIds] = useState<string[]>(['advanced-react-patterns']);
  const [wishlist, setWishlist] = useState<WishlistCourse[]>([
    { id: 'design-systems', title: 'Design Systems from Scratch', instructor: 'Mia Walker', price: '$74', rating: 4.8 },
  ]);
  const [animateAchievements, setAnimateAchievements] = useState(false);
  const [stats, setStats] = useState<any>({
    hours: 0,
    streak: 0,
    certificates: 0,
    saved: 0,
    growth: { hours: 0, streak: 0, certificates: 0, saved: 0 }
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [dbActivities, setDbActivities] = useState<any[]>([]);
  const [dbCertificates, setDbCertificates] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      if (user) {
        setStatsLoading(true);
        try {
          const [s, w, a, c] = await Promise.all([
            getDashboardStats(user.uid),
            getWishlist(user.uid),
            getActivityLogs(user.uid),
            getCertificates(user.uid)
          ]);
          setStats(s);
          setWishlist(w as any);
          setDbActivities(a);
          setDbCertificates(c);
        } catch (error) {
          console.error("Error loading dashboard data:", error);
        } finally {
          setStatsLoading(false);
        }
      }
    }
    loadData();
  }, [user]);

  const STATS = [
    {
      title: "Total Learning Hours",
      value: stats.hours.toFixed(1) + "h",
      trend: "up",
      icon: Clock,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
    },
    {
      title: "Current Learning Streak",
      value: stats.streak + " days",
      trend: "up",
      icon: Flame,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
    {
      title: "Certificates Earned",
      value: stats.certificates.toString(),
      trend: "up",
      icon: Award,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      title: "Saved Courses",
      value: stats.saved.toString(),
      trend: stats.growth.saved >= 0 ? "up" : "down",
      icon: Bookmark,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

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

  useEffect(() => {
    setIsSearching(true);
    const id = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      setIsSearching(false);
      if (searchTerm.trim()) addToHistory(searchTerm);
    }, 300);
    return () => clearTimeout(id);
  }, [searchTerm, addToHistory]);

  const filteredCourses = useMemo(() => {
    const term = debouncedTerm.trim().toLowerCase();
    if (!term) return ENROLLED_COURSES;
    return ENROLLED_COURSES.filter((course) =>
      `${course.title} ${course.category} ${course.instructor}`.toLowerCase().includes(term),
    );
  }, [debouncedTerm]);

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
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"><span className="text-muted-foreground">Streak</span><span className="font-semibold">{stats.streak} days</span></div>
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"><span className="text-muted-foreground">Hours</span><span className="font-semibold">{stats.hours.toFixed(1)}h</span></div>
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"><span className="text-muted-foreground">Certificates</span><span className="font-semibold">{stats.certificates}</span></div>
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
      <Breadcrumbs />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 overflow-y-auto lg:block">{sidebar}</aside>
        <main className="min-w-0 flex-1 space-y-6">
          <header className="sticky top-4 z-20 rounded-2xl border border-border/70 bg-background/85 px-3 py-3 backdrop-blur sm:px-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="lg:hidden h-11 w-11" onClick={() => setMobileSidebarOpen(true)} aria-label="Open Menu">
                <Menu className="size-5" />
              </Button>
              <Link href="/" className="mr-2 text-xl font-bold tracking-tight text-primary">SkillForge</Link>
              <div className="relative hidden flex-1 sm:block group">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowHistory(searchTerm.length === 0 && history.length > 0)}
                  onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                  placeholder="Search enrolled courses"
                  className="pl-9 h-11"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {isSearching && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="text-muted-foreground hover:text-foreground">
                      <X className="size-4" />
                    </button>
                  )}
                </div>

                {/* Search History Suggestions */}
                {showHistory && history.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-card border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
                    {history.map((query, i) => (
                      <button
                        key={i}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between"
                        onClick={() => { setSearchTerm(query); setShowHistory(false); }}
                      >
                        <span>{query}</span>
                        <Search className="w-3 h-3 opacity-30" />
                      </button>
                    ))}
                  </div>
                )}
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
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search enrolled courses"
                className="pl-9 h-11"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              )}
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
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Welcome back, {user?.displayName?.split(' ')[0] || 'Learner'}!</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Flame className="size-4 text-orange-400" />You are on a {stats.streak}-day streak! Keep going.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild><Link href="/courses">Browse New Courses</Link></Button>
              <Button variant="outline" onClick={() => jumpToSection('certificates')}>View All Certificates</Button>
              <Button variant="outline" onClick={() => jumpToSection('continue-learning')}>Check Progress</Button>
            </div>
          </section>

          <section id="progress" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            {STATS.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className={cn('group border-border/70 bg-card/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl overflow-hidden relative')}>
                  <div className={cn("absolute top-0 right-0 w-24 h-24 blur-3xl rounded-full translate-x-12 -translate-y-12 opacity-20", stat.bg)} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-muted-foreground/90 font-medium">{stat.title}</CardDescription>
                      <div className={cn("p-2 rounded-lg", stat.bg)}>
                        <Icon className={cn("size-4", stat.color)} />
                      </div>
                    </div>
                    <CardTitle className="text-3xl font-bold mt-2 tracking-tight">{stat.value}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between pt-0 h-10">
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5",
                        stat.trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {stat.trend === "up" ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                        {Math.abs(stats.growth[stat.title.toLowerCase().includes('hour') ? 'hours' : stat.title.toLowerCase().includes('streak') ? 'streak' : stat.title.toLowerCase().includes('certificate') ? 'certificates' : 'saved'])}%
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">vs last month</span>
                    </div>
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
                <EmptyState
                  icon={Trophy}
                  title="No Certificates Yet"
                  message="Complete courses to earn certificates"
                  ctaText="Start Learning"
                  ctaAction={() => jumpToSection('continue-learning')}
                />
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
              <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Activity</CardTitle></CardHeader>
              <CardContent className="p-0">
                {(dbActivities.length > 0 ? dbActivities : RECENT_ACTIVITY_MOCK).slice(0, 5).map((activity: any) => {
                  const Icon = activity.icon || (activity.type === 'completion' ? Award : activity.type === 'login' ? Flame : BookOpen);
                  return (
                    <Link
                      key={activity.id}
                      href={activity.href || '#'}
                      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors border-b border-border/40 last:border-0"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary/60">
                        <Icon className="size-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{activity.description || `${activity.type} activity`}</p>
                        <p className="text-[10px] text-muted-foreground">{activity.time || new Date(activity.timestamp?.seconds * 1000).toLocaleString()}</p>
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </section>

          <section id="wishlist" className="space-y-4 pb-8">
            <div><h2 className="text-xl font-semibold">Wishlist</h2><p className="text-sm text-muted-foreground">Saved/bookmarked courses.</p></div>
            {wishlist.length === 0 ? (
              <Card className="border-border/70 bg-card/50">
                <EmptyState
                  icon={Heart}
                  title="Your Wishlist is Empty"
                  message="Save courses to learn later"
                  ctaText="Browse Courses"
                  ctaAction={() => router.push('/courses')}
                />
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
