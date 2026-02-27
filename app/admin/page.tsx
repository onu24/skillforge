'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Activity,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Download,
  FileText,
  Filter,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Percent,
  Search,
  Settings,
  Shield,
  Trash2,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';

type AdminRole = 'Super Admin' | 'Admin' | 'Moderator';
type SectionKey = 'dashboard' | 'courses' | 'users' | 'blog' | 'instructors' | 'categories' | 'payments' | 'reports' | 'settings';

type CourseStatus = 'Draft' | 'Published' | 'Featured';
type PostStatus = 'Draft' | 'Published';
type UserStatus = 'Active' | 'Banned';

type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  price: number;
  status: CourseStatus;
  rating: number;
  enrollments: number;
  revenue: number;
  thumbnail?: string;
};

type BlogPost = {
  id: string;
  title: string;
  category: string;
  status: PostStatus;
  author: string;
  createdAt: string;
  seoTitle: string;
  seoDescription: string;
  body: string;
  featuredImage?: string;
};

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminRole | 'Student' | 'Instructor';
  status: UserStatus;
  registeredAt: string;
  purchases: number;
  enrolled: number;
};

type InstructorRequest = {
  id: string;
  name: string;
  email: string;
  qualifications: string;
  verification: 'Pending' | 'Verified' | 'Rejected';
  earnings: number;
};

type Category = {
  id: string;
  name: string;
  description: string;
  courseCount: number;
};

type Transaction = {
  id: string;
  user: string;
  course: string;
  amount: number;
  method: 'Stripe' | 'PayPal';
  date: string;
  status: 'Paid' | 'Refunded';
};

type ActivityLog = {
  id: string;
  actor: string;
  action: string;
  at: string;
};

const STORAGE_KEY = 'skillforge_admin_state_v1';

const NAV_ITEMS: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'courses', label: 'Courses', icon: BookOpen },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'blog', label: 'Blog', icon: FileText },
  { key: 'instructors', label: 'Instructors', icon: GraduationCap },
  { key: 'categories', label: 'Categories', icon: Filter },
  { key: 'payments', label: 'Payments', icon: DollarSign },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
  { key: 'settings', label: 'Settings', icon: Settings },
];

const DEFAULT_COURSES: Course[] = [
  { id: 'c1', title: 'Web Development Fundamentals', description: 'HTML, CSS, JS basics.', category: 'Web Development', instructor: 'John Smith', price: 59, status: 'Published', rating: 4.8, enrollments: 920, revenue: 54280 },
  { id: 'c2', title: 'Advanced React Patterns', description: 'Performance and architecture.', category: 'React', instructor: 'Sarah Johnson', price: 79, status: 'Featured', rating: 4.9, enrollments: 660, revenue: 52140 },
  { id: 'c3', title: 'UI/UX Design Masterclass', description: 'Research to high-fidelity design.', category: 'Design', instructor: 'Emma Wilson', price: 69, status: 'Draft', rating: 4.7, enrollments: 410, revenue: 28290 },
  { id: 'c4', title: 'Node.js APIs in Production', description: 'Scale secure backends.', category: 'Backend', instructor: 'David Park', price: 89, status: 'Published', rating: 4.6, enrollments: 375, revenue: 33375 },
];

const DEFAULT_USERS: ManagedUser[] = [
  { id: 'u1', name: 'John Doe', email: 'john@example.com', phone: '+1-555-0101', role: 'Student', status: 'Active', registeredAt: '2026-02-01', purchases: 3, enrolled: 3 },
  { id: 'u2', name: 'Ava Martinez', email: 'ava@skillforge.com', phone: '+1-555-0102', role: 'Instructor', status: 'Active', registeredAt: '2026-01-14', purchases: 0, enrolled: 0 },
  { id: 'u3', name: 'Noah Cooper', email: 'noah@domain.com', phone: '+1-555-0103', role: 'Student', status: 'Banned', registeredAt: '2025-12-11', purchases: 1, enrolled: 1 },
  { id: 'u4', name: 'Olivia Hill', email: 'olivia@domain.com', phone: '+1-555-0104', role: 'Student', status: 'Active', registeredAt: '2026-02-18', purchases: 2, enrolled: 2 },
];

const DEFAULT_POSTS: BlogPost[] = [
  { id: 'b1', title: 'Top 10 React Performance Tips', category: 'React', status: 'Published', author: 'Admin', createdAt: '2026-02-20', seoTitle: 'React Performance Tips 2026', seoDescription: 'Boost app speed with these practical tips.', body: 'Start by profiling your components...', featuredImage: '' },
  { id: 'b2', title: 'How to Build Your Learning Habit', category: 'Career', status: 'Draft', author: 'Admin', createdAt: '2026-02-22', seoTitle: 'Build Learning Habit', seoDescription: 'Consistency strategies for learners.', body: 'Habits are built with repetition...', featuredImage: '' },
];

const DEFAULT_INSTRUCTORS: InstructorRequest[] = [
  { id: 'i1', name: 'Priya Sharma', email: 'priya@mentor.com', qualifications: 'Ex-Amazon SWE, 8 years, published educator', verification: 'Pending', earnings: 0 },
  { id: 'i2', name: 'Liam Walker', email: 'liam@mentor.com', qualifications: 'Design lead, 1200+ students taught', verification: 'Verified', earnings: 12400 },
  { id: 'i3', name: 'Emma Brown', email: 'emma@mentor.com', qualifications: 'Data science consultant, PhD', verification: 'Rejected', earnings: 0 },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Web Development', description: 'Frontend and full-stack fundamentals', courseCount: 12 },
  { id: 'cat2', name: 'React', description: 'React ecosystem and advanced patterns', courseCount: 7 },
  { id: 'cat3', name: 'Design', description: 'UI, UX, and design systems', courseCount: 8 },
  { id: 'cat4', name: 'Backend', description: 'APIs, architecture, and databases', courseCount: 9 },
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 't1', user: 'John Doe', course: 'Advanced React Patterns', amount: 79, method: 'Stripe', date: '2026-02-25', status: 'Paid' },
  { id: 't2', user: 'Olivia Hill', course: 'Web Development Fundamentals', amount: 59, method: 'PayPal', date: '2026-02-24', status: 'Paid' },
  { id: 't3', user: 'Noah Cooper', course: 'UI/UX Design Masterclass', amount: 69, method: 'Stripe', date: '2026-02-22', status: 'Refunded' },
  { id: 't4', user: 'Mia Clark', course: 'Node.js APIs in Production', amount: 89, method: 'Stripe', date: '2026-02-21', status: 'Paid' },
];

const DEFAULT_ACTIVITY: ActivityLog[] = [
  { id: 'a1', actor: 'System', action: 'Daily analytics refresh completed', at: '2026-02-27 09:00' },
  { id: 'a2', actor: 'Admin', action: 'Published course: Advanced React Patterns', at: '2026-02-26 18:12' },
  { id: 'a3', actor: 'Moderator', action: 'Rejected instructor request: Emma Brown', at: '2026-02-26 15:03' },
  { id: 'a4', actor: 'Admin', action: 'Updated payment commission to 18%', at: '2026-02-25 11:20' },
];

const REVENUE_30_DAYS = [320, 420, 390, 560, 610, 520, 750, 810, 740, 760, 830, 890, 940, 980, 920, 910, 1020, 1070, 1130, 1180, 1090, 1150, 1210, 1300, 1270, 1330, 1400, 1380, 1460, 1520];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function paginate<T>(items: T[], page: number, perPage = 5) {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
}

function downloadCsv(filename: string, rows: Record<string, string | number>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => `"${String(row[h]).replaceAll('"', '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>('dashboard');
  const [adminRole, setAdminRole] = useState<AdminRole>('Admin');
  const [busy, setBusy] = useState(false);

  const [courses, setCourses] = useState<Course[]>(DEFAULT_COURSES);
  const [users, setUsers] = useState<ManagedUser[]>(DEFAULT_USERS);
  const [posts, setPosts] = useState<BlogPost[]>(DEFAULT_POSTS);
  const [instructors, setInstructors] = useState<InstructorRequest[]>(DEFAULT_INSTRUCTORS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>(DEFAULT_TRANSACTIONS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(DEFAULT_ACTIVITY);

  const [query, setQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState({ category: 'all', status: 'all', instructor: 'all' });
  const [userFilter, setUserFilter] = useState({ status: 'all', role: 'all' });
  const [paymentFilter, setPaymentFilter] = useState({ method: 'all', status: 'all' });

  const [coursePage, setCoursePage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [blogPage, setBlogPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);

  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'course' | 'post' | 'user' | 'category'; id: string; title: string } | null>(null);

  const [courseDraft, setCourseDraft] = useState<Course>({ id: '', title: '', description: '', category: 'Web Development', instructor: '', price: 0, status: 'Draft', rating: 0, enrollments: 0, revenue: 0 });
  const [postDraft, setPostDraft] = useState<BlogPost>({ id: '', title: '', category: 'General', status: 'Draft', author: 'Admin', createdAt: new Date().toISOString().slice(0, 10), seoTitle: '', seoDescription: '', body: '', featuredImage: '' });

  const [settingsDraft, setSettingsDraft] = useState({
    siteTitle: 'SkillForge',
    tagline: 'Master premium skills online',
    stripeKey: 'pk_live_xxx',
    paypalClientId: 'paypal_xxx',
    commissionPercent: '18',
    taxPercent: '8',
    supportEmail: 'support@skillforge.com',
    notifications: true,
  });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, router, user]);

  useEffect(() => {
    if (!user?.email) return;
    if (user.email.includes('super')) setAdminRole('Super Admin');
    else if (user.email.includes('mod')) setAdminRole('Moderator');
    else setAdminRole('Admin');
  }, [user?.email]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setCourses(parsed.courses ?? DEFAULT_COURSES);
      setUsers(parsed.users ?? DEFAULT_USERS);
      setPosts(parsed.posts ?? DEFAULT_POSTS);
      setInstructors(parsed.instructors ?? DEFAULT_INSTRUCTORS);
      setCategories(parsed.categories ?? DEFAULT_CATEGORIES);
      setTransactions(parsed.transactions ?? DEFAULT_TRANSACTIONS);
      setActivityLogs(parsed.activityLogs ?? DEFAULT_ACTIVITY);
    } catch {
      toast({ variant: 'destructive', title: 'State load failed', description: 'Using defaults.' });
    }
  }, [toast]);

  useEffect(() => {
    const payload = { courses, users, posts, instructors, categories, transactions, activityLogs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [courses, users, posts, instructors, categories, transactions, activityLogs]);

  const addActivity = (action: string) => {
    const actor = user?.displayName || user?.email || 'Admin';
    setActivityLogs((prev) => [{ id: crypto.randomUUID(), actor, action, at: new Date().toLocaleString('en-US') }, ...prev].slice(0, 50));
  };

  const simulateApi = async (task: () => void | Promise<void>) => {
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    await task();
    setBusy(false);
  };

  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => (courseFilter.category === 'all' ? true : course.category === courseFilter.category))
      .filter((course) => (courseFilter.status === 'all' ? true : course.status === courseFilter.status))
      .filter((course) => (courseFilter.instructor === 'all' ? true : course.instructor === courseFilter.instructor))
      .filter((course) => `${course.title} ${course.description} ${course.category}`.toLowerCase().includes(query.toLowerCase()));
  }, [courses, courseFilter, query]);

  const filteredUsers = useMemo(() => {
    return users
      .filter((item) => (userFilter.status === 'all' ? true : item.status === userFilter.status))
      .filter((item) => (userFilter.role === 'all' ? true : item.role === userFilter.role))
      .filter((item) => `${item.name} ${item.email} ${item.phone}`.toLowerCase().includes(query.toLowerCase()));
  }, [users, userFilter, query]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => `${post.title} ${post.category} ${post.author}`.toLowerCase().includes(query.toLowerCase()));
  }, [posts, query]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => (paymentFilter.method === 'all' ? true : tx.method === paymentFilter.method))
      .filter((tx) => (paymentFilter.status === 'all' ? true : tx.status === paymentFilter.status))
      .filter((tx) => `${tx.user} ${tx.course}`.toLowerCase().includes(query.toLowerCase()));
  }, [transactions, paymentFilter, query]);

  const totalRevenue = useMemo(() => transactions.filter((t) => t.status === 'Paid').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const activeStudents = useMemo(() => users.filter((u) => u.status === 'Active' && u.role === 'Student').length, [users]);
  const recentSignups = useMemo(() => users.filter((u) => new Date(u.registeredAt) >= new Date(Date.now() - 7 * 24 * 3600 * 1000)), [users]);
  const popularCourses = useMemo(() => [...courses].sort((a, b) => b.enrollments - a.enrollments).slice(0, 5), [courses]);

  const currentRows = useMemo(() => {
    if (activeSection === 'courses') return paginate(filteredCourses, coursePage);
    if (activeSection === 'users') return paginate(filteredUsers, userPage);
    if (activeSection === 'blog') return paginate(filteredPosts, blogPage);
    if (activeSection === 'payments') return paginate(filteredTransactions, paymentPage);
    return [];
  }, [activeSection, filteredCourses, filteredUsers, filteredPosts, filteredTransactions, coursePage, userPage, blogPage, paymentPage]);

  const resetSearchAndPages = (section: SectionKey) => {
    setActiveSection(section);
    setQuery('');
    setCoursePage(1);
    setUserPage(1);
    setBlogPage(1);
    setPaymentPage(1);
    setMobileNavOpen(false);
  };

  const handleCreateOrUpdateCourse = async () => {
    if (!courseDraft.title || !courseDraft.description || !courseDraft.instructor) {
      toast({ variant: 'destructive', title: 'Validation failed', description: 'Title, description and instructor are required.' });
      return;
    }

    await simulateApi(() => {
      if (courseDraft.id) {
        setCourses((prev) => prev.map((c) => (c.id === courseDraft.id ? courseDraft : c)));
        addActivity(`Updated course: ${courseDraft.title}`);
        toast({ variant: 'success', title: 'Course updated' });
      } else {
        const newCourse = { ...courseDraft, id: `c_${crypto.randomUUID().slice(0, 8)}` };
        setCourses((prev) => [newCourse, ...prev]);
        addActivity(`Created course: ${newCourse.title}`);
        toast({ variant: 'success', title: 'Course created' });
      }
    });

    setCourseDialogOpen(false);
    setCourseDraft({ id: '', title: '', description: '', category: 'Web Development', instructor: '', price: 0, status: 'Draft', rating: 0, enrollments: 0, revenue: 0 });
  };

  const handleCreateOrUpdatePost = async () => {
    if (!postDraft.title || !postDraft.body) {
      toast({ variant: 'destructive', title: 'Validation failed', description: 'Post title and body are required.' });
      return;
    }

    await simulateApi(() => {
      if (postDraft.id) {
        setPosts((prev) => prev.map((p) => (p.id === postDraft.id ? postDraft : p)));
        addActivity(`Updated blog post: ${postDraft.title}`);
        toast({ variant: 'success', title: 'Post updated' });
      } else {
        const newPost = { ...postDraft, id: `p_${crypto.randomUUID().slice(0, 8)}`, createdAt: new Date().toISOString().slice(0, 10) };
        setPosts((prev) => [newPost, ...prev]);
        addActivity(`Created blog post: ${newPost.title}`);
        toast({ variant: 'success', title: 'Post created' });
      }
    });

    setBlogDialogOpen(false);
    setPostDraft({ id: '', title: '', category: 'General', status: 'Draft', author: 'Admin', createdAt: new Date().toISOString().slice(0, 10), seoTitle: '', seoDescription: '', body: '', featuredImage: '' });
  };

  const openDelete = (target: { type: 'course' | 'post' | 'user' | 'category'; id: string; title: string }) => {
    setDeleteTarget(target);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await simulateApi(() => {
      if (deleteTarget.type === 'course') setCourses((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      if (deleteTarget.type === 'post') setPosts((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      if (deleteTarget.type === 'user') setUsers((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      if (deleteTarget.type === 'category') setCategories((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      addActivity(`Deleted ${deleteTarget.type}: ${deleteTarget.title}`);
      toast({ variant: 'success', title: 'Deleted successfully' });
    });

    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const updateUserRole = (id: string, role: ManagedUser['role']) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    addActivity(`Changed role for user ${id} to ${role}`);
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: u.status === 'Active' ? 'Banned' : 'Active' } : u)));
    addActivity(`Updated user status for ${id}`);
  };

  const processInstructor = (id: string, verification: InstructorRequest['verification']) => {
    setInstructors((prev) => prev.map((i) => (i.id === id ? { ...i, verification } : i)));
    addActivity(`Instructor ${id} set to ${verification}`);
    toast({ variant: 'success', title: `Instructor ${verification.toLowerCase()}` });
  };

  const handleExport = (name: string, data: Record<string, string | number>[]) => {
    downloadCsv(name, data);
    toast({ variant: 'success', title: 'Export completed', description: `${name} downloaded.` });
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) return <div className="min-h-screen bg-background" />;
  if (!user) return null;

  const isAllowed = ['Super Admin', 'Admin', 'Moderator'].includes(adminRole);

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 grid place-items-center p-6">
        <Card className="max-w-md border-cyan-600/30 bg-slate-900/70"><CardContent className="p-6"><h1 className="text-xl font-semibold mb-2">Access denied</h1><p className="text-slate-300">Admin login required.</p></CardContent></Card>
      </div>
    );
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-xl border border-cyan-500/20 bg-slate-900/60 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-12 border border-cyan-500/40">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'Admin'} />
            <AvatarFallback className="bg-cyan-500/20 text-cyan-300">{(user.displayName || user.email || 'A').slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-100">{user.displayName || user.email}</p>
            <p className="truncate text-xs text-slate-400">{adminRole}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Button key={item.key} variant="ghost" onClick={() => resetSearchAndPages(item.key)} className={cn('mb-1 w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-cyan-300', activeSection === item.key && 'bg-cyan-500/15 text-cyan-300')}>
              <Icon className="size-4" />
              {item.label}
            </Button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100">
      <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 overflow-y-auto lg:block">{sidebar}</aside>

        <main className="min-w-0 flex-1 space-y-5">
          <header className="sticky top-4 z-10 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-3 backdrop-blur sm:px-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" size="icon" className="border-slate-700 bg-slate-800 text-slate-300 lg:hidden" onClick={() => setMobileNavOpen(true)}><Menu className="size-4" /></Button>
              <h1 className="text-xl font-semibold text-cyan-300">SkillForge Admin</h1>

              <div className="relative min-w-[240px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search current section..." className="border-slate-700 bg-slate-800 pl-9 text-slate-100" />
              </div>

              <Select value={adminRole} onValueChange={(val: AdminRole) => setAdminRole(val)}>
                <SelectTrigger className="border-slate-700 bg-slate-800 text-slate-100"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="border-slate-700 bg-slate-800 text-slate-100" onClick={handleSignOut}>Logout</Button>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbPage>{NAV_ITEMS.find((n) => n.key === activeSection)?.label}</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              {busy && <span className="text-xs text-cyan-300">Processing...</span>}
            </div>
          </header>

          {activeSection === 'dashboard' && (
            <section className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card className="border-slate-800 bg-slate-900/70"><CardHeader><CardDescription>Total Users</CardDescription><CardTitle>{users.length}</CardTitle></CardHeader></Card>
                <Card className="border-slate-800 bg-slate-900/70"><CardHeader><CardDescription>Total Courses</CardDescription><CardTitle>{courses.length}</CardTitle></CardHeader></Card>
                <Card className="border-slate-800 bg-slate-900/70"><CardHeader><CardDescription>Total Revenue</CardDescription><CardTitle>{formatCurrency(totalRevenue)}</CardTitle></CardHeader></Card>
                <Card className="border-slate-800 bg-slate-900/70"><CardHeader><CardDescription>Active Students</CardDescription><CardTitle>{activeStudents}</CardTitle></CardHeader></Card>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <Card className="border-slate-800 bg-slate-900/70 xl:col-span-2">
                  <CardHeader><CardTitle>Revenue Chart (Last 30 Days)</CardTitle><CardDescription>Daily revenue trend</CardDescription></CardHeader>
                  <CardContent>
                    <div className="grid h-48 grid-cols-30 items-end gap-1">
                      {REVENUE_30_DAYS.map((value, idx) => (
                        <div key={idx} className="rounded-t bg-cyan-500/70" style={{ height: `${(value / 1600) * 100}%` }} />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/70">
                  <CardHeader><CardTitle>Recent Signups (7 days)</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {recentSignups.map((u) => <div key={u.id} className="rounded-md bg-slate-800/70 p-2 text-sm"><p className="font-medium">{u.name}</p><p className="text-slate-400">{u.email}</p></div>)}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <Card className="border-slate-800 bg-slate-900/70">
                  <CardHeader><CardTitle>Most Popular Courses</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {popularCourses.map((course) => (
                      <div key={course.id} className="rounded-md bg-slate-800/70 p-3">
                        <div className="flex items-center justify-between"><p className="font-medium">{course.title}</p><Badge>{course.enrollments} enrolled</Badge></div>
                        <Progress value={(course.enrollments / 1000) * 100} className="mt-2 h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/70">
                  <CardHeader><CardTitle>Recent Activities</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {activityLogs.slice(0, 8).map((log) => (
                      <div key={log.id} className="rounded-md border border-slate-800 bg-slate-800/50 p-3 text-sm">
                        <p className="font-medium text-slate-200">{log.action}</p>
                        <p className="text-xs text-slate-400">{log.actor} - {log.at}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {activeSection === 'courses' && (
            <section className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Select value={courseFilter.category} onValueChange={(v) => setCourseFilter((f) => ({ ...f, category: v }))}><SelectTrigger className="border-slate-700 bg-slate-800"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{[...new Set(courses.map((c) => c.category))].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                <Select value={courseFilter.status} onValueChange={(v) => setCourseFilter((f) => ({ ...f, status: v }))}><SelectTrigger className="border-slate-700 bg-slate-800"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="Draft">Draft</SelectItem><SelectItem value="Published">Published</SelectItem><SelectItem value="Featured">Featured</SelectItem></SelectContent></Select>
                <Select value={courseFilter.instructor} onValueChange={(v) => setCourseFilter((f) => ({ ...f, instructor: v }))}><SelectTrigger className="border-slate-700 bg-slate-800"><SelectValue placeholder="Instructor" /></SelectTrigger><SelectContent><SelectItem value="all">All Instructors</SelectItem>{[...new Set(courses.map((c) => c.instructor))].map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select>
                <Button onClick={() => { setCourseDraft({ id: '', title: '', description: '', category: 'Web Development', instructor: '', price: 0, status: 'Draft', rating: 0, enrollments: 0, revenue: 0 }); setCourseDialogOpen(true); }}>Create Course</Button>
              </div>

              <Card className="border-slate-800 bg-slate-900/70">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Instructor</TableHead><TableHead>Stats</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {(currentRows as Course[]).map((course) => (
                        <TableRow key={course.id}>
                          <TableCell><p className="font-medium">{course.title}</p><p className="text-xs text-slate-400">{formatCurrency(course.price)}</p></TableCell>
                          <TableCell>{course.category}</TableCell>
                          <TableCell><Badge variant="outline">{course.status}</Badge></TableCell>
                          <TableCell>{course.instructor}</TableCell>
                          <TableCell className="text-xs text-slate-400">{course.enrollments} enrollments | {formatCurrency(course.revenue)} | {course.rating}</TableCell>
                          <TableCell className="space-x-1">
                            <Button size="sm" variant="outline" onClick={() => { setCourseDraft(course); setCourseDialogOpen(true); }}>Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => openDelete({ type: 'course', id: course.id, title: course.title })}><Trash2 className="size-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="flex items-center justify-end gap-2"><Button variant="outline" disabled={coursePage <= 1} onClick={() => setCoursePage((p) => p - 1)}>Prev</Button><span className="text-sm text-slate-400">Page {coursePage}</span><Button variant="outline" disabled={coursePage * 5 >= filteredCourses.length} onClick={() => setCoursePage((p) => p + 1)}>Next</Button></div>
            </section>
          )}

          {activeSection === 'users' && (
            <section className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Select value={userFilter.status} onValueChange={(v) => setUserFilter((f) => ({ ...f, status: v }))}><SelectTrigger className="border-slate-700 bg-slate-800"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="Active">Active</SelectItem><SelectItem value="Banned">Banned</SelectItem></SelectContent></Select>
                <Select value={userFilter.role} onValueChange={(v) => setUserFilter((f) => ({ ...f, role: v }))}><SelectTrigger className="border-slate-700 bg-slate-800"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Roles</SelectItem><SelectItem value="Student">Student</SelectItem><SelectItem value="Instructor">Instructor</SelectItem><SelectItem value="Admin">Admin</SelectItem><SelectItem value="Moderator">Moderator</SelectItem><SelectItem value="Super Admin">Super Admin</SelectItem></SelectContent></Select>
              </div>
              <Card className="border-slate-800 bg-slate-900/70"><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Status</TableHead><TableHead>Role</TableHead><TableHead>Registration</TableHead><TableHead>History</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{(currentRows as ManagedUser[]).map((u) => <TableRow key={u.id}><TableCell><p className="font-medium">{u.name}</p><p className="text-xs text-slate-400">{u.email} | {u.phone}</p></TableCell><TableCell><Badge variant="outline">{u.status}</Badge></TableCell><TableCell><Select value={u.role} onValueChange={(r: ManagedUser['role']) => updateUserRole(u.id, r)}><SelectTrigger className="h-8 border-slate-700 bg-slate-800"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Student">Student</SelectItem><SelectItem value="Instructor">Instructor</SelectItem><SelectItem value="Moderator">Moderator</SelectItem><SelectItem value="Admin">Admin</SelectItem><SelectItem value="Super Admin">Super Admin</SelectItem></SelectContent></Select></TableCell><TableCell>{u.registeredAt}</TableCell><TableCell className="text-xs text-slate-400">Purchases: {u.purchases} | Enrolled: {u.enrolled}</TableCell><TableCell className="space-x-1"><Button size="sm" variant="outline" onClick={() => toggleUserStatus(u.id)}>{u.status === 'Active' ? 'Ban' : 'Activate'}</Button><Button size="sm" variant="outline" onClick={() => openDelete({ type: 'user', id: u.id, title: u.name })}>Delete</Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
              <div className="flex items-center justify-end gap-2"><Button variant="outline" disabled={userPage <= 1} onClick={() => setUserPage((p) => p - 1)}>Prev</Button><span className="text-sm text-slate-400">Page {userPage}</span><Button variant="outline" disabled={userPage * 5 >= filteredUsers.length} onClick={() => setUserPage((p) => p + 1)}>Next</Button></div>
            </section>
          )}

          {activeSection === 'blog' && (
            <section className="space-y-4">
              <div className="flex flex-wrap gap-2"><Button onClick={() => { setPostDraft({ id: '', title: '', category: 'General', status: 'Draft', author: 'Admin', createdAt: new Date().toISOString().slice(0, 10), seoTitle: '', seoDescription: '', body: '', featuredImage: '' }); setBlogDialogOpen(true); }}>Create Blog Post</Button></div>
              <Card className="border-slate-800 bg-slate-900/70"><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Author</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{(currentRows as BlogPost[]).map((post) => <TableRow key={post.id}><TableCell><p className="font-medium">{post.title}</p><p className="text-xs text-slate-400">SEO: {post.seoTitle || 'Not set'}</p></TableCell><TableCell>{post.category}</TableCell><TableCell><Badge variant="outline">{post.status}</Badge></TableCell><TableCell>{post.author}</TableCell><TableCell>{post.createdAt}</TableCell><TableCell className="space-x-1"><Button size="sm" variant="outline" onClick={() => { setPostDraft(post); setBlogDialogOpen(true); }}>Edit</Button><Button size="sm" variant="outline" onClick={() => openDelete({ type: 'post', id: post.id, title: post.title })}><Trash2 className="size-4" /></Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
              <div className="flex items-center justify-end gap-2"><Button variant="outline" disabled={blogPage <= 1} onClick={() => setBlogPage((p) => p - 1)}>Prev</Button><span className="text-sm text-slate-400">Page {blogPage}</span><Button variant="outline" disabled={blogPage * 5 >= filteredPosts.length} onClick={() => setBlogPage((p) => p + 1)}>Next</Button></div>
            </section>
          )}

          {activeSection === 'instructors' && (
            <section className="space-y-4">
              <Card className="border-slate-800 bg-slate-900/70"><CardHeader><CardTitle>Instructor Requests</CardTitle></CardHeader><CardContent className="space-y-3">{instructors.map((ins) => <div key={ins.id} className="rounded-md border border-slate-800 bg-slate-800/60 p-3"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-medium">{ins.name}</p><p className="text-sm text-slate-400">{ins.email}</p><p className="text-xs text-slate-500">{ins.qualifications}</p><p className="text-xs text-slate-500">Earnings: {formatCurrency(ins.earnings)}</p></div><div className="space-x-1"><Badge variant="outline">{ins.verification}</Badge><Button size="sm" variant="outline" onClick={() => processInstructor(ins.id, 'Verified')}><CheckCircle2 className="size-4" />Approve</Button><Button size="sm" variant="outline" onClick={() => processInstructor(ins.id, 'Rejected')}><XCircle className="size-4" />Reject</Button><Button size="sm" variant="outline"><MessageSquare className="size-4" />Message</Button></div></div></div>)}</CardContent></Card>
            </section>
          )}

          {activeSection === 'categories' && (
            <section className="space-y-4">
              <Card className="border-slate-800 bg-slate-900/70"><CardHeader><CardTitle>Category Management</CardTitle></CardHeader><CardContent className="space-y-3">{categories.map((cat) => <div key={cat.id} className="rounded-md border border-slate-800 bg-slate-800/60 p-3"><div className="flex items-center justify-between"><div><p className="font-medium">{cat.name}</p><p className="text-xs text-slate-400">{cat.description}</p><p className="text-xs text-slate-500">Courses: {cat.courseCount}</p></div><div className="space-x-1"><Button size="sm" variant="outline" onClick={() => setCategories((prev) => prev.map((x) => x.id === cat.id ? { ...x, courseCount: x.courseCount + 1 } : x))}>Assign Course</Button><Button size="sm" variant="outline" onClick={() => openDelete({ type: 'category', id: cat.id, title: cat.name })}>Delete</Button></div></div></div>)}</CardContent></Card>
            </section>
          )}

          {activeSection === 'payments' && (
            <section className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><Card className="border-slate-800 bg-slate-900/70"><CardHeader><CardDescription>Total Revenue</CardDescription><CardTitle>{formatCurrency(totalRevenue)}</CardTitle></CardHeader></Card><Card className="border-slate-800 bg-slate-900/70"><CardHeader><CardDescription>Stripe</CardDescription><CardTitle>{formatCurrency(transactions.filter((t) => t.method === 'Stripe' && t.status === 'Paid').reduce((s, t) => s + t.amount, 0))}</CardTitle></CardHeader></Card><Card className="border-slate-800 bg-slate-900/70"><CardHeader><CardDescription>PayPal</CardDescription><CardTitle>{formatCurrency(transactions.filter((t) => t.method === 'PayPal' && t.status === 'Paid').reduce((s, t) => s + t.amount, 0))}</CardTitle></CardHeader></Card></div>
              <div className="flex flex-wrap gap-2"><Select value={paymentFilter.method} onValueChange={(v) => setPaymentFilter((f) => ({ ...f, method: v }))}><SelectTrigger className="border-slate-700 bg-slate-800"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Methods</SelectItem><SelectItem value="Stripe">Stripe</SelectItem><SelectItem value="PayPal">PayPal</SelectItem></SelectContent></Select><Select value={paymentFilter.status} onValueChange={(v) => setPaymentFilter((f) => ({ ...f, status: v }))}><SelectTrigger className="border-slate-700 bg-slate-800"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="Paid">Paid</SelectItem><SelectItem value="Refunded">Refunded</SelectItem></SelectContent></Select></div>
              <Card className="border-slate-800 bg-slate-900/70"><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>User</TableHead><TableHead>Course</TableHead><TableHead>Method</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader><TableBody>{(currentRows as Transaction[]).map((tx) => <TableRow key={tx.id}><TableCell>{tx.id}</TableCell><TableCell>{tx.user}</TableCell><TableCell>{tx.course}</TableCell><TableCell>{tx.method}</TableCell><TableCell>{formatCurrency(tx.amount)}</TableCell><TableCell><Badge variant="outline">{tx.status}</Badge></TableCell><TableCell><Button size="sm" variant="outline" onClick={() => { setTransactions((prev) => prev.map((item) => item.id === tx.id ? { ...item, status: item.status === 'Paid' ? 'Refunded' : 'Paid' } : item)); addActivity(`Toggled refund status for ${tx.id}`); }}>Toggle Refund</Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
              <div className="flex items-center justify-end gap-2"><Button variant="outline" disabled={paymentPage <= 1} onClick={() => setPaymentPage((p) => p - 1)}>Prev</Button><span className="text-sm text-slate-400">Page {paymentPage}</span><Button variant="outline" disabled={paymentPage * 5 >= filteredTransactions.length} onClick={() => setPaymentPage((p) => p + 1)}>Next</Button></div>
            </section>
          )}

          {activeSection === 'reports' && (
            <section className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Card className="border-slate-800 bg-slate-900/70"><CardHeader><CardTitle>Course Performance</CardTitle><CardDescription>Top performers by revenue.</CardDescription></CardHeader><CardContent className="space-y-2">{popularCourses.map((c) => <div key={c.id} className="text-sm"><div className="flex items-center justify-between"><span>{c.title}</span><span>{formatCurrency(c.revenue)}</span></div><Progress value={(c.rating / 5) * 100} className="mt-1 h-2" /></div>)}</CardContent></Card>
                <Card className="border-slate-800 bg-slate-900/70"><CardHeader><CardTitle>Completion Rates</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold text-cyan-300">78%</p><p className="text-sm text-slate-400">Average student completion rate</p></CardContent></Card>
                <Card className="border-slate-800 bg-slate-900/70"><CardHeader><CardTitle>Top Instructors</CardTitle></CardHeader><CardContent className="space-y-2">{instructors.filter((i) => i.verification === 'Verified').map((i) => <div key={i.id} className="flex items-center justify-between text-sm"><span>{i.name}</span><span>{formatCurrency(i.earnings)}</span></div>)}</CardContent></Card>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => handleExport('course-report.csv', courses.map((c) => ({ title: c.title, category: c.category, enrollments: c.enrollments, revenue: c.revenue, rating: c.rating })))}><Download className="size-4" />Export Course Report</Button>
                <Button variant="outline" onClick={() => handleExport('instructor-report.csv', instructors.map((i) => ({ name: i.name, verification: i.verification, earnings: i.earnings })))}><Download className="size-4" />Export Instructor Report</Button>
                <Button variant="outline" onClick={() => handleExport('user-demographics.csv', users.map((u) => ({ name: u.name, role: u.role, status: u.status, registered: u.registeredAt })))}><Download className="size-4" />Export User Demographics</Button>
              </div>
            </section>
          )}

          {activeSection === 'settings' && (
            <section className="space-y-4">
              <Card className="border-slate-800 bg-slate-900/70"><CardHeader><CardTitle>Admin Settings</CardTitle><CardDescription>General, email, payment, commission, tax, notifications.</CardDescription></CardHeader><CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Site Title</Label><Input className="border-slate-700 bg-slate-800" value={settingsDraft.siteTitle} onChange={(e) => setSettingsDraft((s) => ({ ...s, siteTitle: e.target.value }))} /></div><div className="space-y-2"><Label>Tagline</Label><Input className="border-slate-700 bg-slate-800" value={settingsDraft.tagline} onChange={(e) => setSettingsDraft((s) => ({ ...s, tagline: e.target.value }))} /></div><div className="space-y-2"><Label>Support Email</Label><Input className="border-slate-700 bg-slate-800" value={settingsDraft.supportEmail} onChange={(e) => setSettingsDraft((s) => ({ ...s, supportEmail: e.target.value }))} /></div><div className="space-y-2"><Label>Stripe Key</Label><Input className="border-slate-700 bg-slate-800" value={settingsDraft.stripeKey} onChange={(e) => setSettingsDraft((s) => ({ ...s, stripeKey: e.target.value }))} /></div><div className="space-y-2"><Label>PayPal Client ID</Label><Input className="border-slate-700 bg-slate-800" value={settingsDraft.paypalClientId} onChange={(e) => setSettingsDraft((s) => ({ ...s, paypalClientId: e.target.value }))} /></div><div className="space-y-2"><Label>Commission %</Label><Input className="border-slate-700 bg-slate-800" value={settingsDraft.commissionPercent} onChange={(e) => setSettingsDraft((s) => ({ ...s, commissionPercent: e.target.value }))} /></div><div className="space-y-2"><Label>Tax %</Label><Input className="border-slate-700 bg-slate-800" value={settingsDraft.taxPercent} onChange={(e) => setSettingsDraft((s) => ({ ...s, taxPercent: e.target.value }))} /></div><div className="flex items-end"><Button onClick={() => { addActivity('Saved admin settings'); toast({ variant: 'success', title: 'Settings saved' }); }}>Save Settings</Button></div></CardContent></Card>
            </section>
          )}
        </main>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}><SheetContent side="left" className="w-[85%] bg-[#0f172a] p-4"><SheetTitle className="sr-only">Admin Navigation</SheetTitle>{sidebar}</SheetContent></Sheet>

      <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{courseDraft.id ? 'Edit Course' : 'Create Course'}</DialogTitle><DialogDescription>Manage title, description, price, category, thumbnail and status.</DialogDescription></DialogHeader><div className="grid grid-cols-1 gap-3 md:grid-cols-2"><div className="space-y-2 md:col-span-2"><Label>Title</Label><Input value={courseDraft.title} onChange={(e) => setCourseDraft((d) => ({ ...d, title: e.target.value }))} /></div><div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea value={courseDraft.description} onChange={(e) => setCourseDraft((d) => ({ ...d, description: e.target.value }))} /></div><div className="space-y-2"><Label>Category</Label><Input value={courseDraft.category} onChange={(e) => setCourseDraft((d) => ({ ...d, category: e.target.value }))} /></div><div className="space-y-2"><Label>Instructor</Label><Input value={courseDraft.instructor} onChange={(e) => setCourseDraft((d) => ({ ...d, instructor: e.target.value }))} /></div><div className="space-y-2"><Label>Price</Label><Input type="number" value={courseDraft.price} onChange={(e) => setCourseDraft((d) => ({ ...d, price: Number(e.target.value || 0) }))} /></div><div className="space-y-2"><Label>Status</Label><Select value={courseDraft.status} onValueChange={(v: CourseStatus) => setCourseDraft((d) => ({ ...d, status: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Draft">Draft</SelectItem><SelectItem value="Published">Published</SelectItem><SelectItem value="Featured">Featured</SelectItem></SelectContent></Select></div><div className="space-y-2 md:col-span-2"><Label>Thumbnail Upload</Label><Input type="file" onChange={(e) => setCourseDraft((d) => ({ ...d, thumbnail: e.target.files?.[0]?.name || d.thumbnail }))} /></div><div className="md:col-span-2 flex justify-end"><Button onClick={handleCreateOrUpdateCourse}>{courseDraft.id ? 'Update Course' : 'Create Course'}</Button></div></div></DialogContent></Dialog>

      <Dialog open={blogDialogOpen} onOpenChange={setBlogDialogOpen}><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>{postDraft.id ? 'Edit Blog Post' : 'Create Blog Post'}</DialogTitle><DialogDescription>Rich text, SEO metadata and featured image.</DialogDescription></DialogHeader><div className="space-y-3"><div className="grid grid-cols-1 gap-3 md:grid-cols-2"><div className="space-y-2 md:col-span-2"><Label>Title</Label><Input value={postDraft.title} onChange={(e) => setPostDraft((p) => ({ ...p, title: e.target.value }))} /></div><div className="space-y-2"><Label>Category</Label><Input value={postDraft.category} onChange={(e) => setPostDraft((p) => ({ ...p, category: e.target.value }))} /></div><div className="space-y-2"><Label>Status</Label><Select value={postDraft.status} onValueChange={(v: PostStatus) => setPostDraft((p) => ({ ...p, status: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Draft">Draft</SelectItem><SelectItem value="Published">Published</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>SEO Title</Label><Input value={postDraft.seoTitle} onChange={(e) => setPostDraft((p) => ({ ...p, seoTitle: e.target.value }))} /></div><div className="space-y-2"><Label>SEO Description</Label><Input value={postDraft.seoDescription} onChange={(e) => setPostDraft((p) => ({ ...p, seoDescription: e.target.value }))} /></div></div><div className="space-y-2"><Label>Rich Text Editor (basic)</Label><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setPostDraft((p) => ({ ...p, body: `${p.body}\n**Bold text**` }))}>Bold</Button><Button size="sm" variant="outline" onClick={() => setPostDraft((p) => ({ ...p, body: `${p.body}\n## Heading` }))}>Heading</Button><Button size="sm" variant="outline" onClick={() => setPostDraft((p) => ({ ...p, body: `${p.body}\n- List item` }))}>List</Button></div><Textarea rows={8} value={postDraft.body} onChange={(e) => setPostDraft((p) => ({ ...p, body: e.target.value }))} /></div><div className="space-y-2"><Label>Featured Image Upload</Label><Input type="file" onChange={(e) => setPostDraft((p) => ({ ...p, featuredImage: e.target.files?.[0]?.name || p.featuredImage }))} /></div><div className="flex justify-end"><Button onClick={handleCreateOrUpdatePost}>{postDraft.id ? 'Update Post' : 'Create Post'}</Button></div></div></DialogContent></Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete confirmation</AlertDialogTitle><AlertDialogDescription>Delete {deleteTarget?.type}: {deleteTarget?.title}? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}
