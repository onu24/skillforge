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
import { Checkbox } from '@/components/ui/checkbox';
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
  Bell,
  BookOpen,
  CheckCircle2,
  Copy,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Download,
  FileText,
  Filter,
  GraduationCap,
  Grip,
  History,
  LayoutDashboard,
  Mail,
  Menu,
  MessageSquare,
  Plus,
  Percent,
  Search,
  Send,
  Settings,
  Shield,
  Trash2,
  UserCheck,
  UserX,
  Users,
  XCircle,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type AdminRole = 'Super Admin' | 'Admin' | 'Moderator';
type SectionKey = 'dashboard' | 'courseAnalytics' | 'instructorAnalytics' | 'emailTemplates' | 'courses' | 'users' | 'blog' | 'instructors' | 'categories' | 'payments' | 'reports' | 'settings';

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
type InstructorAnalyticsRow = {
  id: string;
  name: string;
  status: 'Active' | 'Pending' | 'Inactive';
  courseCount: number;
  students: number;
  avgRating: number;
  totalRevenue: number;
  earningsMonth: number;
  earningsYtd: number;
  completionRate: number;
  refundRate: number;
  signupDate: string;
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
type EmailTemplateStatus = 'Active' | 'Inactive' | 'Draft';
type EmailBlockType = 'header' | 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'footer';
type EmailTemplateBlock = {
  id: string;
  type: EmailBlockType;
  content: string;
  meta?: string;
};
type EmailTemplate = {
  id: string;
  name: string;
  category: string;
  subject: string;
  status: EmailTemplateStatus;
  html: string;
  blocks: EmailTemplateBlock[];
  createdAt: string;
  updatedAt: string;
  version: number;
  history: string[];
};

const STORAGE_KEY = 'skillforge_admin_state_v1';

const NAV_ITEMS: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'courseAnalytics', label: 'Course Analytics', icon: BarChart3 },
  { key: 'instructorAnalytics', label: 'Instructor Analytics', icon: GraduationCap },
  { key: 'emailTemplates', label: 'Email Templates', icon: Mail },
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
const EMAIL_TEMPLATE_CATEGORIES = [
  'Welcome Email',
  'Course Enrollment Confirmation',
  'Course Completion Certificate',
  'Instructor Application Decision',
  'Payment Receipt',
  'Refund Notification',
  'Course Update Notification',
  'Promotional Emails',
  'Password Reset',
  'Account Suspended Warning',
  'Custom Templates',
] as const;
const EMAIL_MERGE_TAGS = [
  '{{USER_NAME}}',
  '{{COURSE_NAME}}',
  '{{INSTRUCTOR_NAME}}',
  '{{ENROLLMENT_DATE}}',
  '{{COMPLETION_DATE}}',
  '{{AMOUNT}}',
  '{{COMPANY_NAME}}',
  '{{SUPPORT_EMAIL}}',
] as const;
const EMAIL_SNIPPETS: { label: string; type: EmailBlockType; content: string; meta?: string }[] = [
  { label: 'Header', type: 'header', content: 'SkillForge Updates' },
  { label: 'Text Block', type: 'text', content: 'Write your message here...' },
  { label: 'Image Block', type: 'image', content: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200' },
  { label: 'Button', type: 'button', content: 'View Course', meta: 'https://skillforge.example.com' },
  { label: 'Divider', type: 'divider', content: '' },
  { label: 'Spacer', type: 'spacer', content: '24' },
  { label: 'Footer', type: 'footer', content: 'Need help? Reply to this email or contact {{SUPPORT_EMAIL}}' },
];
const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'et1',
    name: 'Welcome to SkillForge',
    category: 'Welcome Email',
    subject: 'Welcome {{USER_NAME}} - start learning today',
    status: 'Active',
    html: '<h1>Welcome {{USER_NAME}}</h1><p>Start your first course on SkillForge.</p>',
    blocks: [
      { id: 'b1', type: 'header', content: 'Welcome to SkillForge' },
      { id: 'b2', type: 'text', content: 'Hi {{USER_NAME}}, we are excited to have you.' },
      { id: 'b3', type: 'button', content: 'Browse Courses', meta: 'https://skillforge.example.com/courses' },
      { id: 'b4', type: 'footer', content: 'Need help? Email {{SUPPORT_EMAIL}}' },
    ],
    createdAt: '2026-01-10',
    updatedAt: '2026-02-26',
    version: 3,
    history: ['v1 created on 2026-01-10', 'v2 subject update on 2026-01-18', 'v3 CTA update on 2026-02-26'],
  },
  {
    id: 'et2',
    name: 'Course Enrollment Confirmation',
    category: 'Course Enrollment Confirmation',
    subject: 'You are enrolled in {{COURSE_NAME}}',
    status: 'Draft',
    html: '<h2>Enrollment confirmed</h2><p>You joined {{COURSE_NAME}} on {{ENROLLMENT_DATE}}.</p>',
    blocks: [
      { id: 'b21', type: 'header', content: 'Enrollment Confirmed' },
      { id: 'b22', type: 'text', content: 'You joined {{COURSE_NAME}} on {{ENROLLMENT_DATE}}.' },
    ],
    createdAt: '2026-02-02',
    updatedAt: '2026-02-20',
    version: 2,
    history: ['v1 created on 2026-02-02', 'v2 body update on 2026-02-20'],
  },
];

const REVENUE_30_DAYS = [320, 420, 390, 560, 610, 520, 750, 810, 740, 760, 830, 890, 940, 980, 920, 910, 1020, 1070, 1130, 1180, 1090, 1150, 1210, 1300, 1270, 1330, 1400, 1380, 1460, 1520];
const ANALYTICS_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

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

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildRevenueSeries(days: number) {
  return Array.from({ length: days }).map((_, index) => {
    const baseline = REVENUE_30_DAYS[index % REVENUE_30_DAYS.length];
    const seasonal = Math.round(Math.sin(index / 6) * 90);
    const total = Math.max(220, baseline + seasonal + Math.floor(index / 9) * 10);
    const stripe = Math.round(total * 0.68);
    const paypal = total - stripe;
    return {
      day: `D${index + 1}`,
      total,
      stripe,
      paypal,
    };
  });
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
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkUserBanDialogOpen, setBulkUserBanDialogOpen] = useState(false);
  const [bulkBlogDeleteDialogOpen, setBulkBlogDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'course' | 'post' | 'user' | 'category' | 'template'; id: string; title: string } | null>(null);
  const [bulkSelectedCourseIds, setBulkSelectedCourseIds] = useState<string[]>([]);
  const [bulkSelectedUserIds, setBulkSelectedUserIds] = useState<string[]>([]);
  const [bulkSelectedPostIds, setBulkSelectedPostIds] = useState<string[]>([]);
  const [showUserRolePicker, setShowUserRolePicker] = useState(false);
  const [bulkRoleTarget, setBulkRoleTarget] = useState<'Student' | 'Instructor'>('Student');
  const [showBlogCategoryPicker, setShowBlogCategoryPicker] = useState(false);
  const [bulkBlogCategoryTag, setBulkBlogCategoryTag] = useState('General');

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
  const [analyticsRange, setAnalyticsRange] = useState<'7' | '30' | '90' | '365'>('30');
  const [courseAnalyticsFrom, setCourseAnalyticsFrom] = useState('');
  const [courseAnalyticsTo, setCourseAnalyticsTo] = useState('');
  const [comparePreviousPeriod, setComparePreviousPeriod] = useState(false);
  const [performanceTargets, setPerformanceTargets] = useState({
    completionRate: 82,
    engagementScore: 88,
    monthlyRevenue: 120000,
  });
  const [growthSeriesVisible, setGrowthSeriesVisible] = useState({
    students: true,
    instructors: true,
    admins: true,
  });
  const [instructorAnalyticsQuery, setInstructorAnalyticsQuery] = useState('');
  const [instructorStatusFilter, setInstructorStatusFilter] = useState<'all' | 'Active' | 'Pending' | 'Inactive'>('all');
  const [instructorSortBy, setInstructorSortBy] = useState<'revenue' | 'rating' | 'students' | 'courses'>('revenue');
  const [selectedInstructorDetail, setSelectedInstructorDetail] = useState<InstructorAnalyticsRow | null>(null);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(DEFAULT_EMAIL_TEMPLATES);
  const [emailTemplateView, setEmailTemplateView] = useState<'list' | 'editor'>('list');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('all');
  const [templateEditorMode, setTemplateEditorMode] = useState<'visual' | 'html'>('visual');
  const [templatePreviewMode, setTemplatePreviewMode] = useState<'desktop' | 'mobile' | 'html'>('desktop');
  const [testEmail, setTestEmail] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

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
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 29);
    setCourseAnalyticsFrom(start.toISOString().slice(0, 10));
    setCourseAnalyticsTo(end.toISOString().slice(0, 10));
  }, []);

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
      setEmailTemplates(parsed.emailTemplates ?? DEFAULT_EMAIL_TEMPLATES);
    } catch {
      toast({ variant: 'destructive', title: 'State load failed', description: 'Using defaults.' });
    }
  }, [toast]);

  useEffect(() => {
    const payload = { courses, users, posts, instructors, categories, transactions, activityLogs, emailTemplates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [courses, users, posts, instructors, categories, transactions, activityLogs, emailTemplates]);

  useEffect(() => {
    setBulkSelectedCourseIds((current) => current.filter((id) => courses.some((course) => course.id === id)));
  }, [courses]);
  useEffect(() => {
    setBulkSelectedUserIds((current) => current.filter((id) => users.some((userItem) => userItem.id === id)));
  }, [users]);
  useEffect(() => {
    setBulkSelectedPostIds((current) => current.filter((id) => posts.some((post) => post.id === id)));
  }, [posts]);

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
  const filteredTemplates = useMemo(() => {
    return emailTemplates
      .filter((t) => (templateCategoryFilter === 'all' ? true : t.category === templateCategoryFilter))
      .filter((t) => `${t.name} ${t.category} ${t.subject}`.toLowerCase().includes(query.toLowerCase()));
  }, [emailTemplates, templateCategoryFilter, query]);

  const totalRevenue = useMemo(() => transactions.filter((t) => t.status === 'Paid').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const activeStudents = useMemo(() => users.filter((u) => u.status === 'Active' && u.role === 'Student').length, [users]);
  const recentSignups = useMemo(() => users.filter((u) => new Date(u.registeredAt) >= new Date(Date.now() - 7 * 24 * 3600 * 1000)), [users]);
  const popularCourses = useMemo(() => [...courses].sort((a, b) => b.enrollments - a.enrollments).slice(0, 5), [courses]);
  const revenueSeries = useMemo(() => buildRevenueSeries(Number(analyticsRange)), [analyticsRange]);
  const revenueStats = useMemo(() => {
    const values = revenueSeries.map((point) => point.total);
    const avg = Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1));
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { avg, min, max };
  }, [revenueSeries]);
  const enrollmentSeries = useMemo(
    () =>
      courses.map((course) => {
        const completed = Math.round(course.enrollments * (0.45 + (course.rating - 4.5) * 0.12));
        const dropped = Math.round(course.enrollments * 0.12);
        const active = Math.max(course.enrollments - completed - dropped, 0);
        return {
          course: course.title.length > 16 ? `${course.title.slice(0, 16)}...` : course.title,
          fullTitle: course.title,
          active,
          completed,
          dropped,
          enrollments: course.enrollments,
          revenue: course.revenue,
          rating: course.rating,
        };
      }),
    [courses],
  );
  const userGrowthSeries = useMemo(() => {
    const months = Number(analyticsRange) >= 90 ? 6 : 4;
    return Array.from({ length: months }).map((_, idx) => {
      const base = 80 + idx * 18 + (Number(analyticsRange) / 12);
      return {
        label: ANALYTICS_MONTHS[(ANALYTICS_MONTHS.length - months + idx + ANALYTICS_MONTHS.length) % ANALYTICS_MONTHS.length],
        students: Math.round(base + idx * 14),
        instructors: Math.round(14 + idx * 4 + Number(analyticsRange) / 90),
        admins: Math.round(4 + idx * 1.2),
      };
    });
  }, [analyticsRange]);
  const heatmapData = useMemo(() => {
    return courses.map((course, rowIndex) => ({
      course: course.title,
      values: ANALYTICS_MONTHS.map((month, colIndex) => ({
        month,
        revenue: Math.max(2200, Math.round(course.revenue / 6 + (colIndex - 2) * 530 + rowIndex * 160)),
      })),
    }));
  }, [courses]);
  const heatmapRange = useMemo(() => {
    const all = heatmapData.flatMap((item) => item.values.map((v) => v.revenue));
    return { min: Math.min(...all), max: Math.max(...all) };
  }, [heatmapData]);
  const topMetricCards = useMemo(() => {
    const avgRating = (courses.reduce((sum, course) => sum + course.rating, 0) / Math.max(courses.length, 1)).toFixed(2);
    const completionRate = Math.round((enrollmentSeries.reduce((sum, i) => sum + i.completed, 0) / Math.max(enrollmentSeries.reduce((sum, i) => sum + i.enrollments, 0), 1)) * 100);
    const satisfaction = Math.round((Number(avgRating) / 5) * 100 - 4);
    const avgRevenuePerCourse = Math.round(courses.reduce((sum, course) => sum + course.revenue, 0) / Math.max(courses.length, 1));
    return [
      { label: 'Avg Course Rating', value: avgRating, trend: '+2.4%', up: true },
      { label: 'Avg Completion Rate', value: `${completionRate}%`, trend: '+1.3%', up: true },
      { label: 'Student Satisfaction', value: `${satisfaction}%`, trend: '-0.6%', up: false },
      { label: 'Revenue / Course', value: formatCurrency(avgRevenuePerCourse), trend: '+3.1%', up: true },
    ];
  }, [courses, enrollmentSeries]);
  const courseAnalyticsDays = useMemo(() => {
    if (!courseAnalyticsFrom || !courseAnalyticsTo) return 30;
    const from = new Date(courseAnalyticsFrom);
    const to = new Date(courseAnalyticsTo);
    const diff = Math.max(1, Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    return Math.min(diff, 365);
  }, [courseAnalyticsFrom, courseAnalyticsTo]);
  const previousPeriodRevenueSeries = useMemo(() => buildRevenueSeries(courseAnalyticsDays).map((point) => ({ ...point, total: Math.round(point.total * 0.93), stripe: Math.round(point.stripe * 0.93), paypal: Math.round(point.paypal * 0.93) })), [courseAnalyticsDays]);
  const enrollmentStatusData = useMemo(() => {
    const totals = courses.reduce(
      (acc, course) => {
        const completed = Math.round(course.enrollments * 0.46);
        const dropped = Math.round(course.enrollments * 0.11);
        const active = Math.max(course.enrollments - completed - dropped, 0);
        acc.active += active;
        acc.completed += completed;
        acc.dropped += dropped;
        return acc;
      },
      { active: 0, completed: 0, dropped: 0 },
    );
    return [
      { name: 'Active', value: totals.active, color: '#06b6d4' },
      { name: 'Completed', value: totals.completed, color: '#67e8f9' },
      { name: 'Dropped', value: totals.dropped, color: '#0e7490' },
    ];
  }, [courses]);
  const dailyEnrollmentTrend = useMemo(
    () =>
      Array.from({ length: courseAnalyticsDays }).map((_, index) => {
        const base = 16 + (index % 9) * 2;
        const newEnrollments = base + Math.round(Math.sin(index / 4) * 4);
        const completions = Math.max(2, Math.round(newEnrollments * 0.62));
        const prevEnrollments = Math.max(1, Math.round(newEnrollments * 0.9));
        const prevCompletions = Math.max(1, Math.round(completions * 0.9));
        const date = new Date(courseAnalyticsFrom || new Date().toISOString().slice(0, 10));
        date.setDate(date.getDate() + index);
        return {
          date: date.toISOString().slice(0, 10),
          newEnrollments,
          completions,
          prevEnrollments,
          prevCompletions,
        };
      }),
    [courseAnalyticsDays, courseAnalyticsFrom],
  );
  const lessonCompletionSeries = useMemo(
    () =>
      Array.from({ length: courseAnalyticsDays }).map((_, index) => {
        const completionRate = 58 + (index % 10) * 2 + Math.round(Math.sin(index / 5) * 5);
        const previousRate = Math.max(35, completionRate - 5);
        return { point: `D${index + 1}`, completionRate, previousRate };
      }),
    [courseAnalyticsDays],
  );
  const mostWatchedLessons = useMemo(
    () =>
      courses.slice(0, 5).map((course, idx) => ({
        lesson: `${course.title} - Lesson ${idx + 2}`,
        watchCount: Math.round(course.enrollments * (0.75 - idx * 0.08)),
        avgMinutes: 11 + idx * 2,
      })),
    [courses],
  );
  const avgLessonCompletionTime = useMemo(
    () => Math.round(mostWatchedLessons.reduce((sum, lesson) => sum + lesson.avgMinutes, 0) / Math.max(mostWatchedLessons.length, 1)),
    [mostWatchedLessons],
  );
  const studentEngagementScore = useMemo(() => {
    const meanCompletion = lessonCompletionSeries.reduce((sum, p) => sum + p.completionRate, 0) / Math.max(lessonCompletionSeries.length, 1);
    return Math.round(meanCompletion * 1.2);
  }, [lessonCompletionSeries]);
  const revenuePerCourseSeries = useMemo(
    () =>
      courses.map((course) => ({
        course: course.title.length > 14 ? `${course.title.slice(0, 14)}...` : course.title,
        stripe: Math.round(course.revenue * 0.68),
        paypal: Math.round(course.revenue * 0.32),
        total: course.revenue,
      })),
    [courses],
  );
  const paymentMethodRevenue = useMemo(() => {
    const stripe = transactions.filter((t) => t.status === 'Paid' && t.method === 'Stripe').reduce((sum, t) => sum + t.amount, 0);
    const paypal = transactions.filter((t) => t.status === 'Paid' && t.method === 'PayPal').reduce((sum, t) => sum + t.amount, 0);
    return [
      { method: 'Stripe', value: stripe, color: '#22d3ee' },
      { method: 'PayPal', value: paypal, color: '#0e7490' },
    ];
  }, [transactions]);
  const topRevenuePeriods = useMemo(() => {
    const topDays = [...revenueSeries]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((item) => ({ period: item.day, type: 'Day', revenue: item.total }));
    const weekly = Array.from({ length: Math.max(1, Math.floor(revenueSeries.length / 7)) }).map((_, index) => {
      const segment = revenueSeries.slice(index * 7, index * 7 + 7);
      const revenue = segment.reduce((sum, item) => sum + item.total, 0);
      return { period: `Week ${index + 1}`, type: 'Week', revenue };
    });
    return [...topDays, ...weekly.sort((a, b) => b.revenue - a.revenue).slice(0, 3)];
  }, [revenueSeries]);
  const cohortRetention = useMemo(() => {
    const cohorts = ['2025-11', '2025-12', '2026-01', '2026-02'];
    return cohorts.map((cohort, idx) => ({
      cohort,
      month1: 88 - idx * 3,
      month2: 74 - idx * 3,
      month3: 62 - idx * 2,
      performance: `${82 - idx * 3}%`,
    }));
  }, []);
  const instructorAnalyticsRows = useMemo<InstructorAnalyticsRow[]>(() => {
    const verifiedMap = new Map(
      instructors
        .filter((item) => item.verification === 'Verified')
        .map((item) => [item.name.toLowerCase(), item]),
    );
    const rows = Array.from({ length: 10 }).map((_, idx) => {
      const seedCourse = courses[idx % courses.length];
      const baseName = ['Ava Martinez', 'Liam Walker', 'Priya Sharma', 'Emma Brown', 'Noah Kim', 'Sofia Chen', 'Marcus Lee', 'Nina Patel', 'Elena Vega', 'David Park'][idx];
      const status: InstructorAnalyticsRow['status'] = idx % 5 === 0 ? 'Pending' : idx % 4 === 0 ? 'Inactive' : 'Active';
      const courseCount = 2 + (idx % 6);
      const students = 180 + idx * 94;
      const avgRating = Number((4.2 + (idx % 5) * 0.14).toFixed(2));
      const totalRevenue = Math.round(seedCourse.revenue * (0.6 + idx * 0.12));
      const earningsMonth = Math.round(totalRevenue * 0.11);
      const earningsYtd = Math.round(totalRevenue * 0.72);
      const completionRate = 62 + (idx % 5) * 5;
      const refundRate = Number((2.1 + (idx % 4) * 0.8).toFixed(1));
      const signupDate = new Date(2025, 10 + (idx % 4), 3 + idx).toISOString().slice(0, 10);
      return {
        id: `ia_${idx + 1}`,
        name: baseName,
        status: verifiedMap.has(baseName.toLowerCase()) ? 'Active' : status,
        courseCount,
        students,
        avgRating,
        totalRevenue,
        earningsMonth,
        earningsYtd,
        completionRate,
        refundRate,
        signupDate,
      };
    });
    return rows;
  }, [courses, instructors]);
  const filteredInstructorRows = useMemo(() => {
    const searched = instructorAnalyticsRows
      .filter((row) => (instructorStatusFilter === 'all' ? true : row.status === instructorStatusFilter))
      .filter((row) => row.name.toLowerCase().includes(instructorAnalyticsQuery.toLowerCase()));
    const sorted = [...searched].sort((a, b) => {
      if (instructorSortBy === 'revenue') return b.totalRevenue - a.totalRevenue;
      if (instructorSortBy === 'rating') return b.avgRating - a.avgRating;
      if (instructorSortBy === 'students') return b.students - a.students;
      return b.courseCount - a.courseCount;
    });
    return sorted;
  }, [instructorAnalyticsRows, instructorStatusFilter, instructorAnalyticsQuery, instructorSortBy]);
  const topInstructorRevenue = useMemo(
    () => [...instructorAnalyticsRows].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10),
    [instructorAnalyticsRows],
  );
  const newInstructorTrend = useMemo(() => {
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
    return months.map((month, idx) => ({
      month,
      newInstructors: 4 + idx * 2 + (idx % 2),
    }));
  }, []);
  const recentInstructorSignups = useMemo(
    () => [...instructorAnalyticsRows].sort((a, b) => b.signupDate.localeCompare(a.signupDate)).slice(0, 6),
    [instructorAnalyticsRows],
  );

  const currentRows = useMemo(() => {
    if (activeSection === 'courses') return paginate(filteredCourses, coursePage);
    if (activeSection === 'users') return paginate(filteredUsers, userPage);
    if (activeSection === 'blog') return paginate(filteredPosts, blogPage);
    if (activeSection === 'payments') return paginate(filteredTransactions, paymentPage);
    return [];
  }, [activeSection, filteredCourses, filteredUsers, filteredPosts, filteredTransactions, coursePage, userPage, blogPage, paymentPage]);
  const currentCourseRows = useMemo(() => paginate(filteredCourses, coursePage), [filteredCourses, coursePage]);
  const currentCourseRowIds = useMemo(() => currentCourseRows.map((course) => course.id), [currentCourseRows]);
  const selectedInCurrentPageCount = useMemo(
    () => currentCourseRowIds.filter((id) => bulkSelectedCourseIds.includes(id)).length,
    [currentCourseRowIds, bulkSelectedCourseIds],
  );
  const allCurrentPageSelected = currentCourseRowIds.length > 0 && selectedInCurrentPageCount === currentCourseRowIds.length;
  const currentUserRows = useMemo(() => paginate(filteredUsers, userPage), [filteredUsers, userPage]);
  const currentUserRowIds = useMemo(() => currentUserRows.map((userItem) => userItem.id), [currentUserRows]);
  const selectedUsersInCurrentPageCount = useMemo(
    () => currentUserRowIds.filter((id) => bulkSelectedUserIds.includes(id)).length,
    [currentUserRowIds, bulkSelectedUserIds],
  );
  const allCurrentUserPageSelected =
    currentUserRowIds.length > 0 && selectedUsersInCurrentPageCount === currentUserRowIds.length;
  const currentBlogRows = useMemo(() => paginate(filteredPosts, blogPage), [filteredPosts, blogPage]);
  const currentBlogRowIds = useMemo(() => currentBlogRows.map((post) => post.id), [currentBlogRows]);
  const selectedPostsInCurrentPageCount = useMemo(
    () => currentBlogRowIds.filter((id) => bulkSelectedPostIds.includes(id)).length,
    [currentBlogRowIds, bulkSelectedPostIds],
  );
  const allCurrentBlogPageSelected =
    currentBlogRowIds.length > 0 && selectedPostsInCurrentPageCount === currentBlogRowIds.length;

  const resetSearchAndPages = (section: SectionKey) => {
    setActiveSection(section);
    setQuery('');
    setCoursePage(1);
    setUserPage(1);
    setBlogPage(1);
    setPaymentPage(1);
    setMobileNavOpen(false);
  };
  const createNewTemplate = () => {
    const now = new Date().toISOString().slice(0, 10);
    setEditingTemplate({
      id: `et_${crypto.randomUUID().slice(0, 8)}`,
      name: 'New Template',
      category: 'Custom Templates',
      subject: '',
      status: 'Draft',
      html: '<p>Your email content</p>',
      blocks: [{ id: `tb_${crypto.randomUUID().slice(0, 8)}`, type: 'text', content: 'Your email content' }],
      createdAt: now,
      updatedAt: now,
      version: 1,
      history: ['v1 created'],
    });
    setTemplateEditorMode('visual');
    setTemplatePreviewMode('desktop');
    setEmailTemplateView('editor');
  };
  const openTemplateEditor = (template: EmailTemplate) => {
    setEditingTemplate({ ...template, blocks: [...template.blocks], history: [...template.history] });
    setEmailTemplateView('editor');
  };
  const saveTemplate = async () => {
    if (!editingTemplate) return;
    if (!editingTemplate.name || !editingTemplate.subject) {
      toast({ variant: 'destructive', title: 'Template name and subject are required' });
      return;
    }
    await simulateApi(() => {
      const updated = {
        ...editingTemplate,
        updatedAt: new Date().toISOString().slice(0, 10),
        version: editingTemplate.version + 1,
        history: [`v${editingTemplate.version + 1} updated on ${new Date().toISOString().slice(0, 10)}`, ...editingTemplate.history],
      };
      setEmailTemplates((prev) => {
        const exists = prev.some((t) => t.id === updated.id);
        if (exists) return prev.map((t) => (t.id === updated.id ? updated : t));
        return [updated, ...prev];
      });
      setEditingTemplate(updated);
      addActivity(`Saved email template: ${updated.name}`);
      toast({ variant: 'success', title: 'Template saved' });
    });
  };
  const duplicateTemplate = (template: EmailTemplate) => {
    const copy: EmailTemplate = {
      ...template,
      id: `et_${crypto.randomUUID().slice(0, 8)}`,
      name: `${template.name} (Copy)`,
      status: 'Draft',
      version: 1,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      history: ['v1 duplicated'],
      blocks: template.blocks.map((block) => ({ ...block, id: `tb_${crypto.randomUUID().slice(0, 8)}` })),
    };
    setEmailTemplates((prev) => [copy, ...prev]);
    addActivity(`Duplicated email template: ${template.name}`);
    toast({ variant: 'success', title: 'Template duplicated' });
  };
  const sendTemplateTest = (template: EmailTemplate) => {
    if (!testEmail || !testEmail.includes('@')) {
      toast({ variant: 'destructive', title: 'Enter a valid test email' });
      return;
    }
    addActivity(`Sent test email for template ${template.name} to ${testEmail}`);
    toast({ variant: 'success', title: 'Test email sent', description: `Sent to ${testEmail}` });
  };
  const setTemplateStatus = (id: string, status: EmailTemplateStatus) => {
    setEmailTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, status, updatedAt: new Date().toISOString().slice(0, 10) } : t)));
    addActivity(`Template ${id} status changed to ${status}`);
    toast({ variant: 'success', title: `Template ${status.toLowerCase()}` });
  };
  const insertTagInTemplate = (tag: string) => {
    if (!editingTemplate) return;
    setEditingTemplate((prev) => (prev ? { ...prev, html: `${prev.html}${tag}` } : prev));
  };
  const addSnippetBlock = (snippet: { label: string; type: EmailBlockType; content: string; meta?: string }) => {
    if (!editingTemplate) return;
    setEditingTemplate((prev) =>
      prev
        ? {
            ...prev,
            blocks: [...prev.blocks, { id: `tb_${crypto.randomUUID().slice(0, 8)}`, type: snippet.type, content: snippet.content, meta: snippet.meta }],
          }
        : prev,
    );
  };
  const updateBlock = (blockId: string, content: string) => {
    setEditingTemplate((prev) =>
      prev ? { ...prev, blocks: prev.blocks.map((block) => (block.id === blockId ? { ...block, content } : block)) } : prev,
    );
  };
  const updateBlockMeta = (blockId: string, meta: string) => {
    setEditingTemplate((prev) =>
      prev ? { ...prev, blocks: prev.blocks.map((block) => (block.id === blockId ? { ...block, meta } : block)) } : prev,
    );
  };

  const clearCourseSelection = () => {
    setBulkSelectedCourseIds([]);
  };
  const clearUserSelection = () => {
    setBulkSelectedUserIds([]);
    setShowUserRolePicker(false);
  };
  const clearBlogSelection = () => {
    setBulkSelectedPostIds([]);
    setShowBlogCategoryPicker(false);
  };

  const toggleCourseSelection = (courseId: string, checked: boolean) => {
    setBulkSelectedCourseIds((current) =>
      checked ? (current.includes(courseId) ? current : [...current, courseId]) : current.filter((id) => id !== courseId),
    );
  };

  const toggleSelectAllCurrentPage = (checked: boolean) => {
    if (!currentCourseRowIds.length) return;
    setBulkSelectedCourseIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, ...currentCourseRowIds]));
      }
      return current.filter((id) => !currentCourseRowIds.includes(id));
    });
  };
  const toggleUserSelection = (userId: string, checked: boolean) => {
    setBulkSelectedUserIds((current) =>
      checked ? (current.includes(userId) ? current : [...current, userId]) : current.filter((id) => id !== userId),
    );
  };
  const toggleSelectAllCurrentUserPage = (checked: boolean) => {
    if (!currentUserRowIds.length) return;
    setBulkSelectedUserIds((current) => {
      if (checked) return Array.from(new Set([...current, ...currentUserRowIds]));
      return current.filter((id) => !currentUserRowIds.includes(id));
    });
  };
  const toggleBlogSelection = (postId: string, checked: boolean) => {
    setBulkSelectedPostIds((current) =>
      checked ? (current.includes(postId) ? current : [...current, postId]) : current.filter((id) => id !== postId),
    );
  };
  const toggleSelectAllCurrentBlogPage = (checked: boolean) => {
    if (!currentBlogRowIds.length) return;
    setBulkSelectedPostIds((current) => {
      if (checked) return Array.from(new Set([...current, ...currentBlogRowIds]));
      return current.filter((id) => !currentBlogRowIds.includes(id));
    });
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

  const openDelete = (target: { type: 'course' | 'post' | 'user' | 'category' | 'template'; id: string; title: string }) => {
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
      if (deleteTarget.type === 'template') setEmailTemplates((prev) => prev.filter((item) => item.id !== deleteTarget.id));
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
  const exportAllCourseAnalytics = () => {
    const payload = {
      range: { from: courseAnalyticsFrom, to: courseAnalyticsTo, comparePreviousPeriod },
      enrollmentStatusData,
      dailyEnrollmentTrend,
      lessonCompletionSeries,
      mostWatchedLessons,
      revenuePerCourseSeries,
      paymentMethodRevenue,
      topRevenuePeriods,
      cohortRetention,
      performanceTargets,
    };
    downloadJson('course-analytics-export.json', payload);
    toast({ variant: 'success', title: 'Course analytics exported' });
  };
  const heatmapCellColor = (value: number) => {
    const ratio = (value - heatmapRange.min) / Math.max(heatmapRange.max - heatmapRange.min, 1);
    const red = Math.round(220 - ratio * 120);
    const green = Math.round(85 + ratio * 130);
    return `rgba(${red}, ${green}, 115, 0.75)`;
  };

  const runBulkCourseAction = async (action: 'publish' | 'archive' | 'export' | 'delete') => {
    if (!bulkSelectedCourseIds.length) {
      toast({ variant: 'destructive', title: 'No courses selected' });
      return;
    }

    if (action === 'delete') {
      setBulkDeleteDialogOpen(true);
      return;
    }

    await simulateApi(() => {
      if (action === 'publish') {
        setCourses((prev) =>
          prev.map((course) => (bulkSelectedCourseIds.includes(course.id) ? { ...course, status: 'Published' } : course)),
        );
        addActivity(`Bulk published ${bulkSelectedCourseIds.length} courses`);
        toast({ variant: 'success', title: `Published ${bulkSelectedCourseIds.length} courses` });
      }

      if (action === 'archive') {
        setCourses((prev) =>
          prev.map((course) => (bulkSelectedCourseIds.includes(course.id) ? { ...course, status: 'Draft' } : course)),
        );
        addActivity(`Bulk archived ${bulkSelectedCourseIds.length} courses`);
        toast({ variant: 'success', title: `Archived ${bulkSelectedCourseIds.length} courses` });
      }

      if (action === 'export') {
        const rows = courses
          .filter((course) => bulkSelectedCourseIds.includes(course.id))
          .map((course) => ({
            title: course.title,
            category: course.category,
            status: course.status,
            instructor: course.instructor,
            price: course.price,
            enrollments: course.enrollments,
            revenue: course.revenue,
            rating: course.rating,
          }));
        downloadCsv('selected-courses.csv', rows);
        addActivity(`Bulk exported ${bulkSelectedCourseIds.length} courses`);
        toast({ variant: 'success', title: 'Export completed', description: 'selected-courses.csv downloaded.' });
      }
    });

    clearCourseSelection();
  };

  const confirmBulkDelete = async () => {
    if (!bulkSelectedCourseIds.length) return;
    const count = bulkSelectedCourseIds.length;
    await simulateApi(() => {
      setCourses((prev) => prev.filter((course) => !bulkSelectedCourseIds.includes(course.id)));
      addActivity(`Bulk deleted ${count} courses`);
      toast({ variant: 'success', title: `Deleted ${count} courses` });
    });
    clearCourseSelection();
    setBulkDeleteDialogOpen(false);
  };
  const runBulkUserAction = async (action: 'activate' | 'notify' | 'export' | 'changeRole' | 'ban') => {
    if (!bulkSelectedUserIds.length) {
      toast({ variant: 'destructive', title: 'No users selected' });
      return;
    }

    if (action === 'ban') {
      setBulkUserBanDialogOpen(true);
      return;
    }

    await simulateApi(() => {
      if (action === 'activate') {
        setUsers((prev) =>
          prev.map((userItem) =>
            bulkSelectedUserIds.includes(userItem.id) ? { ...userItem, status: 'Active' } : userItem,
          ),
        );
        addActivity(`Bulk activated ${bulkSelectedUserIds.length} users`);
        toast({ variant: 'success', title: `Activated ${bulkSelectedUserIds.length} users` });
      }

      if (action === 'changeRole') {
        setUsers((prev) =>
          prev.map((userItem) =>
            bulkSelectedUserIds.includes(userItem.id) ? { ...userItem, role: bulkRoleTarget } : userItem,
          ),
        );
        addActivity(`Bulk changed role to ${bulkRoleTarget} for ${bulkSelectedUserIds.length} users`);
        toast({ variant: 'success', title: `Changed role to ${bulkRoleTarget}` });
      }

      if (action === 'notify') {
        addActivity(`Sent notification to ${bulkSelectedUserIds.length} users`);
        toast({
          variant: 'success',
          title: 'Notification sent',
          description: `Delivered to ${bulkSelectedUserIds.length} selected users.`,
        });
      }

      if (action === 'export') {
        const rows = users
          .filter((userItem) => bulkSelectedUserIds.includes(userItem.id))
          .map((userItem) => ({
            name: userItem.name,
            email: userItem.email,
            phone: userItem.phone,
            role: userItem.role,
            status: userItem.status,
            registeredAt: userItem.registeredAt,
            purchases: userItem.purchases,
            enrolled: userItem.enrolled,
          }));
        downloadCsv('selected-users.csv', rows);
        addActivity(`Exported ${bulkSelectedUserIds.length} selected users`);
        toast({ variant: 'success', title: 'Export completed', description: 'selected-users.csv downloaded.' });
      }
    });

    clearUserSelection();
  };
  const confirmBulkBanUsers = async () => {
    if (!bulkSelectedUserIds.length) return;
    const count = bulkSelectedUserIds.length;
    await simulateApi(() => {
      setUsers((prev) =>
        prev.map((userItem) => (bulkSelectedUserIds.includes(userItem.id) ? { ...userItem, status: 'Banned' } : userItem)),
      );
      addActivity(`Bulk banned ${count} users`);
      toast({ variant: 'success', title: `Banned ${count} users` });
    });
    clearUserSelection();
    setBulkUserBanDialogOpen(false);
  };
  const runBulkBlogAction = async (action: 'publish' | 'draft' | 'tag' | 'delete' | 'csv' | 'pdf') => {
    if (!bulkSelectedPostIds.length) {
      toast({ variant: 'destructive', title: 'No blog posts selected' });
      return;
    }

    if (action === 'delete') {
      setBulkBlogDeleteDialogOpen(true);
      return;
    }

    await simulateApi(() => {
      if (action === 'publish') {
        setPosts((prev) =>
          prev.map((post) => (bulkSelectedPostIds.includes(post.id) ? { ...post, status: 'Published' } : post)),
        );
        addActivity(`Bulk published ${bulkSelectedPostIds.length} blog posts`);
        toast({ variant: 'success', title: `Published ${bulkSelectedPostIds.length} posts` });
      }

      if (action === 'draft') {
        setPosts((prev) =>
          prev.map((post) => (bulkSelectedPostIds.includes(post.id) ? { ...post, status: 'Draft' } : post)),
        );
        addActivity(`Bulk set ${bulkSelectedPostIds.length} blog posts to draft`);
        toast({ variant: 'success', title: `Moved ${bulkSelectedPostIds.length} posts to draft` });
      }

      if (action === 'tag') {
        setPosts((prev) =>
          prev.map((post) => (bulkSelectedPostIds.includes(post.id) ? { ...post, category: bulkBlogCategoryTag } : post)),
        );
        addActivity(`Bulk tagged ${bulkSelectedPostIds.length} posts as ${bulkBlogCategoryTag}`);
        toast({ variant: 'success', title: `Tagged selected posts as ${bulkBlogCategoryTag}` });
      }

      if (action === 'csv') {
        const rows = posts
          .filter((post) => bulkSelectedPostIds.includes(post.id))
          .map((post) => ({
            title: post.title,
            category: post.category,
            status: post.status,
            author: post.author,
            createdAt: post.createdAt,
          }));
        downloadCsv('selected-blog-posts.csv', rows);
        addActivity(`Exported ${bulkSelectedPostIds.length} selected blog posts to CSV`);
        toast({ variant: 'success', title: 'CSV export completed' });
      }

      if (action === 'pdf') {
        const selectedPosts = posts.filter((post) => bulkSelectedPostIds.includes(post.id));
        const html = `
          <html><head><title>Selected Blog Posts</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>Selected Blog Posts</h1>
            ${selectedPosts
              .map(
                (post) => `
                  <div style="margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #ddd;">
                    <h2>${post.title}</h2>
                    <p><strong>Category:</strong> ${post.category}</p>
                    <p><strong>Status:</strong> ${post.status}</p>
                    <p><strong>Author:</strong> ${post.author}</p>
                    <p><strong>Date:</strong> ${post.createdAt}</p>
                  </div>
                `,
              )
              .join('')}
          </body></html>
        `;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        }
        addActivity(`Exported ${bulkSelectedPostIds.length} selected blog posts to PDF`);
        toast({ variant: 'success', title: 'PDF export opened', description: 'Use Save as PDF in print dialog.' });
      }
    });

    clearBlogSelection();
  };
  const confirmBulkDeletePosts = async () => {
    if (!bulkSelectedPostIds.length) return;
    const count = bulkSelectedPostIds.length;
    await simulateApi(() => {
      setPosts((prev) => prev.filter((post) => !bulkSelectedPostIds.includes(post.id)));
      addActivity(`Bulk deleted ${count} blog posts`);
      toast({ variant: 'success', title: `Deleted ${count} blog posts` });
    });
    clearBlogSelection();
    setBulkBlogDeleteDialogOpen(false);
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {topMetricCards.map((metric) => (
                  <Card key={metric.label} className="border-slate-800 bg-slate-900/70">
                    <CardHeader className="pb-2">
                      <CardDescription>{metric.label}</CardDescription>
                      <CardTitle>{metric.value}</CardTitle>
                    </CardHeader>
                    <CardContent className={cn('text-xs font-medium', metric.up ? 'text-emerald-400' : 'text-rose-400')}>
                      {metric.up ? '↑' : '↓'} {metric.trend}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-slate-800 bg-slate-900/70">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <CardTitle>Revenue Trend</CardTitle>
                      <CardDescription>Total, Stripe and PayPal revenue</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Select value={analyticsRange} onValueChange={(v: '7' | '30' | '90' | '365') => setAnalyticsRange(v)}>
                        <SelectTrigger className="h-8 border-slate-700 bg-slate-800"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">Last 7 days</SelectItem>
                          <SelectItem value="30">Last 30 days</SelectItem>
                          <SelectItem value="90">Last 90 days</SelectItem>
                          <SelectItem value="365">Last 1 year</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" onClick={() => handleExport('revenue-series.csv', revenueSeries)}>
                        <Download className="size-4" />CSV
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { downloadJson('revenue-series.json', revenueSeries); toast({ variant: 'success', title: 'JSON export completed' }); }}>
                        JSON
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueSeries} onClick={(state) => { const payload = state?.activePayload?.[0]?.payload; if (payload) toast({ variant: 'info', title: `Drill-down ${payload.day}`, description: `Total ${formatCurrency(payload.total)} | Stripe ${formatCurrency(payload.stripe)} | PayPal ${formatCurrency(payload.paypal)}` }); }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #155e75', color: '#e2e8f0' }} />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke="#06b6d4" strokeWidth={2.5} dot={false} name="Total Revenue" />
                        <Line type="monotone" dataKey="stripe" stroke="#67e8f9" strokeWidth={2} dot={false} name="Stripe Revenue" />
                        <Line type="monotone" dataKey="paypal" stroke="#0891b2" strokeWidth={2} dot={false} name="PayPal Revenue" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs">
                    <div className="rounded-md bg-slate-800/60 px-3 py-2">Average: <span className="font-semibold text-cyan-300">{formatCurrency(revenueStats.avg)}</span></div>
                    <div className="rounded-md bg-slate-800/60 px-3 py-2">Min: <span className="font-semibold text-cyan-300">{formatCurrency(revenueStats.min)}</span></div>
                    <div className="rounded-md bg-slate-800/60 px-3 py-2">Max: <span className="font-semibold text-cyan-300">{formatCurrency(revenueStats.max)}</span></div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <Card className="border-slate-800 bg-slate-900/70">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <div><CardTitle>Student Enrollments by Course</CardTitle><CardDescription>Active vs Completed vs Dropped</CardDescription></div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleExport('enrollment-chart.csv', enrollmentSeries)}><Download className="size-4" />CSV</Button>
                        <Button size="sm" variant="outline" onClick={() => { downloadJson('enrollment-chart.json', enrollmentSeries); toast({ variant: 'success', title: 'JSON export completed' }); }}>JSON</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={enrollmentSeries} onClick={(state) => { const payload = state?.activePayload?.[0]?.payload; if (payload) toast({ variant: 'info', title: payload.fullTitle, description: `Enrollments: ${payload.enrollments} | Revenue: ${formatCurrency(payload.revenue)} | Rating: ${payload.rating}` }); }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="course" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #155e75', color: '#e2e8f0' }} />
                        <Legend />
                        <Bar dataKey="active" stackId="a" fill="#06b6d4" name="Active" />
                        <Bar dataKey="completed" stackId="a" fill="#22d3ee" name="Completed" />
                        <Bar dataKey="dropped" stackId="a" fill="#0e7490" name="Dropped" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/70">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <div><CardTitle>User Growth</CardTitle><CardDescription>Students, Instructors, Admins</CardDescription></div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleExport('user-growth.csv', userGrowthSeries)}><Download className="size-4" />CSV</Button>
                        <Button size="sm" variant="outline" onClick={() => { downloadJson('user-growth.json', userGrowthSeries); toast({ variant: 'success', title: 'JSON export completed' }); }}>JSON</Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Button size="sm" variant={growthSeriesVisible.students ? 'default' : 'outline'} onClick={() => setGrowthSeriesVisible((prev) => ({ ...prev, students: !prev.students }))}>Students</Button>
                      <Button size="sm" variant={growthSeriesVisible.instructors ? 'default' : 'outline'} onClick={() => setGrowthSeriesVisible((prev) => ({ ...prev, instructors: !prev.instructors }))}>Instructors</Button>
                      <Button size="sm" variant={growthSeriesVisible.admins ? 'default' : 'outline'} onClick={() => setGrowthSeriesVisible((prev) => ({ ...prev, admins: !prev.admins }))}>Admins</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={userGrowthSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #155e75', color: '#e2e8f0' }} />
                        <Legend />
                        {growthSeriesVisible.students && <Area type="monotone" dataKey="students" stackId="1" stroke="#06b6d4" fill="#0891b2" fillOpacity={0.35} />}
                        {growthSeriesVisible.instructors && <Area type="monotone" dataKey="instructors" stackId="2" stroke="#67e8f9" fill="#22d3ee" fillOpacity={0.25} />}
                        {growthSeriesVisible.admins && <Area type="monotone" dataKey="admins" stackId="3" stroke="#0e7490" fill="#155e75" fillOpacity={0.2} />}
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-slate-800 bg-slate-900/70">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <div><CardTitle>Course Performance Heatmap</CardTitle><CardDescription>Courses vs months by revenue</CardDescription></div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleExport('course-heatmap.csv', heatmapData.flatMap((row) => row.values.map((v) => ({ course: row.course, month: v.month, revenue: v.revenue }))))}><Download className="size-4" />CSV</Button>
                      <Button size="sm" variant="outline" onClick={() => { downloadJson('course-heatmap.json', heatmapData); toast({ variant: 'success', title: 'JSON export completed' }); }}>JSON</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="min-w-[720px]">
                    <div className="grid grid-cols-[220px_repeat(6,minmax(0,1fr))] gap-2 text-xs text-slate-300">
                      <div className="font-semibold">Course</div>
                      {ANALYTICS_MONTHS.map((month) => <div key={month} className="text-center font-semibold">{month}</div>)}
                      {heatmapData.map((row) => (
                        <div key={row.course} className="contents">
                          <div className="rounded-md bg-slate-800/60 px-2 py-2 text-xs">{row.course}</div>
                          {row.values.map((cell) => (
                            <button
                              key={`${row.course}-${cell.month}`}
                              title={`${row.course} / ${cell.month}: ${formatCurrency(cell.revenue)}`}
                              onClick={() => toast({ variant: 'info', title: `${row.course} - ${cell.month}`, description: `Revenue ${formatCurrency(cell.revenue)}` })}
                              className="rounded-md py-2 text-center text-[11px] text-slate-100 transition-transform hover:scale-[1.03]"
                              style={{ backgroundColor: heatmapCellColor(cell.revenue) }}
                            >
                              {Math.round(cell.revenue / 1000)}k
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <Card className="border-slate-800 bg-slate-900/70">
                  <CardHeader><CardTitle>Recent Signups (7 days)</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {recentSignups.map((u) => <div key={u.id} className="rounded-md bg-slate-800/70 p-2 text-sm"><p className="font-medium">{u.name}</p><p className="text-slate-400">{u.email}</p></div>)}
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

          {activeSection === 'courseAnalytics' && (
            <section className="space-y-4">
              <Card className="border-slate-800 bg-slate-900/70">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle>Course Analytics</CardTitle>
                      <CardDescription>Date-range analytics with comparison and targets</CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Input type="date" className="h-8 border-slate-700 bg-slate-800 text-slate-100" value={courseAnalyticsFrom} onChange={(e) => setCourseAnalyticsFrom(e.target.value)} />
                      <Input type="date" className="h-8 border-slate-700 bg-slate-800 text-slate-100" value={courseAnalyticsTo} onChange={(e) => setCourseAnalyticsTo(e.target.value)} />
                      <label className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs">
                        <Checkbox checked={comparePreviousPeriod} onCheckedChange={(checked) => setComparePreviousPeriod(Boolean(checked))} />
                        Compare with previous period
                      </label>
                      <Button size="sm" onClick={exportAllCourseAnalytics}><Download className="size-4" />Export All Data</Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <Card className="border-slate-800 bg-slate-900/70">
                  <CardHeader><CardTitle>Enrollment Analytics</CardTitle><CardDescription>Status mix and daily trend</CardDescription></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={enrollmentStatusData} dataKey="value" nameKey="name" outerRadius={90} label>
                            {enrollmentStatusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #155e75', color: '#e2e8f0' }} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>New Enrollments</TableHead><TableHead>Completions</TableHead>{comparePreviousPeriod && <TableHead>Prev Enrollments</TableHead>}</TableRow></TableHeader>
                        <TableBody>
                          {dailyEnrollmentTrend.slice(0, 10).map((item) => (
                            <TableRow key={item.date}>
                              <TableCell>{item.date}</TableCell>
                              <TableCell>{item.newEnrollments}</TableCell>
                              <TableCell>{item.completions}</TableCell>
                              {comparePreviousPeriod && <TableCell>{item.prevEnrollments}</TableCell>}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/70">
                  <CardHeader><CardTitle>Student Engagement</CardTitle><CardDescription>Completion rate and lesson behavior</CardDescription></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lessonCompletionSeries}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="point" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                          <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #155e75', color: '#e2e8f0' }} />
                          <Legend />
                          <Line type="monotone" dataKey="completionRate" stroke="#06b6d4" strokeWidth={2.5} dot={false} name="Completion Rate" />
                          {comparePreviousPeriod && <Line type="monotone" dataKey="previousRate" stroke="#67e8f9" strokeDasharray="5 5" dot={false} name="Previous Period" />}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
                      <div className="rounded-md bg-slate-800/60 px-3 py-2">Avg lesson completion time: <span className="font-semibold text-cyan-300">{avgLessonCompletionTime} min</span></div>
                      <div className="rounded-md bg-slate-800/60 px-3 py-2">Engagement score: <span className="font-semibold text-cyan-300">{studentEngagementScore}</span></div>
                    </div>
                    <Table>
                      <TableHeader><TableRow><TableHead>Most Watched Lesson</TableHead><TableHead>Watch Count</TableHead><TableHead>Avg Minutes</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {mostWatchedLessons.map((lesson) => (
                          <TableRow key={lesson.lesson}>
                            <TableCell>{lesson.lesson}</TableCell>
                            <TableCell>{lesson.watchCount}</TableCell>
                            <TableCell>{lesson.avgMinutes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <Card className="border-slate-800 bg-slate-900/70">
                  <CardHeader><CardTitle>Revenue Breakdown</CardTitle><CardDescription>Per-course stacked revenue and payment method split</CardDescription></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenuePerCourseSeries} onClick={(state) => { const payload = state?.activePayload?.[0]?.payload; if (payload) toast({ variant: 'info', title: payload.course, description: `Total: ${formatCurrency(payload.total)}` }); }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="course" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                          <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #155e75', color: '#e2e8f0' }} />
                          <Legend />
                          <Bar dataKey="stripe" stackId="r" fill="#22d3ee" name="Stripe" />
                          <Bar dataKey="paypal" stackId="r" fill="#0e7490" name="PayPal" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={paymentMethodRevenue} dataKey="value" nameKey="method" outerRadius={75} label>
                            {paymentMethodRevenue.map((entry) => <Cell key={entry.method} fill={entry.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #155e75', color: '#e2e8f0' }} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <Table>
                      <TableHeader><TableRow><TableHead>Period</TableHead><TableHead>Type</TableHead><TableHead>Revenue</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {topRevenuePeriods.map((item) => (
                          <TableRow key={`${item.type}-${item.period}`}>
                            <TableCell>{item.period}</TableCell>
                            <TableCell>{item.type}</TableCell>
                            <TableCell>{formatCurrency(item.revenue)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/70">
                  <CardHeader><CardTitle>Cohort Analysis</CardTitle><CardDescription>Retention by signup cohort</CardDescription></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={cohortRetention}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="cohort" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                          <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #155e75', color: '#e2e8f0' }} />
                          <Legend />
                          <Line type="monotone" dataKey="month1" stroke="#06b6d4" name="Month 1 Retention" />
                          <Line type="monotone" dataKey="month2" stroke="#67e8f9" name="Month 2 Retention" />
                          <Line type="monotone" dataKey="month3" stroke="#0e7490" name="Month 3 Retention" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <Table>
                      <TableHeader><TableRow><TableHead>Cohort</TableHead><TableHead>Month 1</TableHead><TableHead>Month 2</TableHead><TableHead>Month 3</TableHead><TableHead>Performance</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {cohortRetention.map((cohort) => (
                          <TableRow key={cohort.cohort}>
                            <TableCell>{cohort.cohort}</TableCell>
                            <TableCell>{cohort.month1}%</TableCell>
                            <TableCell>{cohort.month2}%</TableCell>
                            <TableCell>{cohort.month3}%</TableCell>
                            <TableCell>{cohort.performance}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-slate-800 bg-slate-900/70">
                <CardHeader><CardTitle>Performance Targets (Stretch Goals)</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <div className="space-y-1"><Label>Completion Rate Target (%)</Label><Input type="number" value={performanceTargets.completionRate} onChange={(e) => setPerformanceTargets((prev) => ({ ...prev, completionRate: Number(e.target.value || 0) }))} className="border-slate-700 bg-slate-800" /></div>
                  <div className="space-y-1"><Label>Engagement Score Target</Label><Input type="number" value={performanceTargets.engagementScore} onChange={(e) => setPerformanceTargets((prev) => ({ ...prev, engagementScore: Number(e.target.value || 0) }))} className="border-slate-700 bg-slate-800" /></div>
                  <div className="space-y-1"><Label>Monthly Revenue Target</Label><Input type="number" value={performanceTargets.monthlyRevenue} onChange={(e) => setPerformanceTargets((prev) => ({ ...prev, monthlyRevenue: Number(e.target.value || 0) }))} className="border-slate-700 bg-slate-800" /></div>
                  <div className="flex items-end"><Button onClick={() => { addActivity('Updated course analytics stretch goals'); toast({ variant: 'success', title: 'Performance targets saved' }); }}>Save Targets</Button></div>
                </CardContent>
              </Card>
            </section>
          )}

          {activeSection === 'instructorAnalytics' && (
            <section className="space-y-4">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <Card className="border-slate-800 bg-slate-900/70">
                  <CardHeader><CardTitle>Top Instructors by Revenue</CardTitle><CardDescription>Top 10 instructors with status coloring</CardDescription></CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topInstructorRevenue} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" width={110} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #155e75', color: '#e2e8f0' }} />
                        <Bar dataKey="totalRevenue" onClick={(payload) => {
                          const row = payload as unknown as InstructorAnalyticsRow;
                          if (row?.name) toast({ variant: 'info', title: row.name, description: `Revenue ${formatCurrency(row.totalRevenue)} | Rating ${row.avgRating}` });
                        }}>
                          {topInstructorRevenue.map((item) => (
                            <Cell key={item.id} fill={item.status === 'Active' ? '#06b6d4' : item.status === 'Pending' ? '#67e8f9' : '#0e7490'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/70">
                  <CardHeader><CardTitle>Instructor Performance Matrix</CardTitle><CardDescription>Course count vs average rating, bubble sized by students</CardDescription></CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={instructorAnalyticsRows}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="courseCount" stroke="#94a3b8" label={{ value: 'Course Count', position: 'insideBottom', fill: '#94a3b8' }} />
                        <YAxis dataKey="avgRating" stroke="#94a3b8" label={{ value: 'Avg Rating', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #155e75', color: '#e2e8f0' }} formatter={(value, key, item) => {
                          const data = item?.payload as InstructorAnalyticsRow;
                          if (key === 'avgRating') return [`${value}`, 'Avg Rating'];
                          return [String(value), String(key)];
                        }} />
                        <Bar dataKey="avgRating" fill="#22d3ee" onClick={(payload) => {
                          const row = payload as unknown as InstructorAnalyticsRow;
                          if (row?.name) toast({ variant: 'info', title: row.name, description: `Courses ${row.courseCount} | Students ${row.students} | Revenue ${formatCurrency(row.totalRevenue)}` });
                        }}>
                          {instructorAnalyticsRows.map((item) => (
                            <Cell key={item.id} fill={`rgba(${Math.min(255, 80 + Math.round(item.totalRevenue / 2200))}, 182, 212, ${Math.min(0.95, 0.25 + item.students / 2200)})`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <Card className="border-slate-800 bg-slate-900/70">
                  <CardHeader><CardTitle>Growth Trends</CardTitle><CardDescription>New instructors per month</CardDescription></CardHeader>
                  <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={newInstructorTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #155e75', color: '#e2e8f0' }} />
                        <Legend />
                        <Line type="monotone" dataKey="newInstructors" stroke="#06b6d4" strokeWidth={2.5} dot />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/70">
                  <CardHeader><CardTitle>Recent Instructor Signups</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {recentInstructorSignups.map((item) => (
                      <div key={item.id} className="rounded-md border border-slate-800 bg-slate-800/60 px-3 py-2 text-sm">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.signupDate} | {item.status} | {item.courseCount} courses</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card className="border-slate-800 bg-slate-900/70">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div><CardTitle>Detailed Instructor Table</CardTitle><CardDescription>Sortable and filterable instructor performance view</CardDescription></div>
                    <div className="flex flex-wrap gap-2">
                      <Input value={instructorAnalyticsQuery} onChange={(e) => setInstructorAnalyticsQuery(e.target.value)} placeholder="Search instructor..." className="h-8 w-52 border-slate-700 bg-slate-800 text-slate-100" />
                      <Select value={instructorStatusFilter} onValueChange={(v: 'all' | 'Active' | 'Pending' | 'Inactive') => setInstructorStatusFilter(v)}>
                        <SelectTrigger className="h-8 border-slate-700 bg-slate-800"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={instructorSortBy} onValueChange={(v: 'revenue' | 'rating' | 'students' | 'courses') => setInstructorSortBy(v)}>
                        <SelectTrigger className="h-8 border-slate-700 bg-slate-800"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="revenue">Sort: Revenue</SelectItem>
                          <SelectItem value="rating">Sort: Rating</SelectItem>
                          <SelectItem value="students">Sort: Students</SelectItem>
                          <SelectItem value="courses">Sort: Course Count</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Courses</TableHead><TableHead>Students</TableHead><TableHead>Avg Rating</TableHead><TableHead>Total Revenue</TableHead><TableHead>Status</TableHead><TableHead>Earnings (Month)</TableHead><TableHead>Earnings (YTD)</TableHead><TableHead>Completion</TableHead><TableHead>Refund</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {filteredInstructorRows.map((row) => (
                        <TableRow key={row.id} className="cursor-pointer" onClick={() => setSelectedInstructorDetail(row)}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.courseCount}</TableCell>
                          <TableCell>{row.students}</TableCell>
                          <TableCell>{row.avgRating}</TableCell>
                          <TableCell>{formatCurrency(row.totalRevenue)}</TableCell>
                          <TableCell><Badge variant="outline">{row.status}</Badge></TableCell>
                          <TableCell>{formatCurrency(row.earningsMonth)}</TableCell>
                          <TableCell>{formatCurrency(row.earningsYtd)}</TableCell>
                          <TableCell>{row.completionRate}%</TableCell>
                          <TableCell>{row.refundRate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>
          )}

          {activeSection === 'emailTemplates' && (
            <section className="space-y-4">
              {emailTemplateView === 'list' && (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={templateCategoryFilter} onValueChange={setTemplateCategoryFilter}>
                      <SelectTrigger className="h-8 border-slate-700 bg-slate-800"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {EMAIL_TEMPLATE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={createNewTemplate}><Plus className="size-4" />Create New Template</Button>
                  </div>

                  <Card className="border-slate-800 bg-slate-900/70">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader><TableRow><TableHead>Template Name</TableHead><TableHead>Category</TableHead><TableHead>Last Modified</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {filteredTemplates.map((template) => (
                            <TableRow key={template.id}>
                              <TableCell className="font-medium">{template.name}</TableCell>
                              <TableCell>{template.category}</TableCell>
                              <TableCell>{template.updatedAt}</TableCell>
                              <TableCell>
                                <Select value={template.status} onValueChange={(v: EmailTemplateStatus) => setTemplateStatus(template.id, v)}>
                                  <SelectTrigger className="h-8 border-slate-700 bg-slate-800"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="space-x-1">
                                <Button size="sm" variant="outline" onClick={() => openTemplateEditor(template)}>Edit</Button>
                                <Button size="sm" variant="outline" onClick={() => duplicateTemplate(template)}><Copy className="size-4" /></Button>
                                <Button size="sm" variant="outline" onClick={() => { setEditingTemplate(template); sendTemplateTest(template); }}><Send className="size-4" /></Button>
                                <Button size="sm" variant="outline" onClick={() => toast({ variant: 'info', title: 'Version history', description: template.history.join(' | ') })}><History className="size-4" /></Button>
                                <Button size="sm" variant="outline" onClick={() => openDelete({ type: 'template', id: template.id, title: template.name })}><Trash2 className="size-4" /></Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              )}

              {emailTemplateView === 'editor' && editingTemplate && (
                <Card className="border-slate-800 bg-slate-900/70">
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <CardTitle>Email Template Editor</CardTitle>
                        <CardDescription>{editingTemplate.name}</CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => setEmailTemplateView('list')}>Back to List</Button>
                        <Button onClick={saveTemplate}>Save Template</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_1fr_320px]">
                      <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-800/50 p-3">
                        <h3 className="text-sm font-semibold">Template Variables</h3>
                        <div className="space-y-1">
                          {EMAIL_MERGE_TAGS.map((tag) => (
                            <button key={tag} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', tag)} onClick={() => insertTagInTemplate(tag)} className="block w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-left text-xs hover:border-cyan-400/50">
                              {tag}
                            </button>
                          ))}
                        </div>
                        <h3 className="text-sm font-semibold">Snippets</h3>
                        <div className="space-y-1">
                          {EMAIL_SNIPPETS.map((snippet) => (
                            <button key={snippet.label} onClick={() => addSnippetBlock(snippet)} className="flex w-full items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-left text-xs hover:border-cyan-400/50">
                              <Grip className="size-3" /> {snippet.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-3">
                        <div className="space-y-2">
                          <Label>Template Name</Label>
                          <Input value={editingTemplate.name} onChange={(e) => setEditingTemplate((prev) => (prev ? { ...prev, name: e.target.value } : prev))} className="border-slate-700 bg-slate-800" />
                        </div>
                        <div className="space-y-2">
                          <Label>Subject</Label>
                          <Input value={editingTemplate.subject} onChange={(e) => setEditingTemplate((prev) => (prev ? { ...prev, subject: e.target.value } : prev))} className="border-slate-700 bg-slate-800" onDrop={(e) => { const dropped = e.dataTransfer.getData('text/plain'); if (dropped) { e.preventDefault(); setEditingTemplate((prev) => (prev ? { ...prev, subject: `${prev.subject}${dropped}` } : prev)); } }} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant={templatePreviewMode === 'desktop' ? 'default' : 'outline'} onClick={() => setTemplatePreviewMode('desktop')}>Desktop</Button>
                          <Button size="sm" variant={templatePreviewMode === 'mobile' ? 'default' : 'outline'} onClick={() => setTemplatePreviewMode('mobile')}>Mobile</Button>
                          <Button size="sm" variant={templatePreviewMode === 'html' ? 'default' : 'outline'} onClick={() => setTemplatePreviewMode('html')}>HTML</Button>
                          <Button size="sm" variant={templateEditorMode === 'visual' ? 'default' : 'outline'} onClick={() => setTemplateEditorMode('visual')}>Visual Builder</Button>
                          <Button size="sm" variant={templateEditorMode === 'html' ? 'default' : 'outline'} onClick={() => setTemplateEditorMode('html')}>Code Editor</Button>
                        </div>

                        {templateEditorMode === 'visual' && (
                          <div className="space-y-2 rounded-md border border-slate-800 bg-slate-100 p-3 text-slate-900">
                            {editingTemplate.blocks.map((block) => (
                              <div key={block.id} className="rounded-md border border-slate-300 bg-white p-2">
                                <p className="mb-1 text-xs font-semibold uppercase text-slate-500">{block.type}</p>
                                {block.type !== 'divider' && (
                                  <Textarea value={block.content} onChange={(e) => updateBlock(block.id, e.target.value)} className="border-slate-300 bg-white text-slate-900" onDrop={(e) => { const dropped = e.dataTransfer.getData('text/plain'); if (dropped) { e.preventDefault(); updateBlock(block.id, `${block.content}${dropped}`); } }} />
                                )}
                                {block.type === 'button' && (
                                  <Input value={block.meta || ''} onChange={(e) => updateBlockMeta(block.id, e.target.value)} className="mt-2 border-slate-300 bg-white text-slate-900" placeholder="Button URL" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {templateEditorMode === 'html' && (
                          <Textarea rows={14} value={editingTemplate.html} onChange={(e) => setEditingTemplate((prev) => (prev ? { ...prev, html: e.target.value } : prev))} className="border-slate-700 bg-slate-950 font-mono text-xs" onDrop={(e) => { const dropped = e.dataTransfer.getData('text/plain'); if (dropped) { e.preventDefault(); setEditingTemplate((prev) => (prev ? { ...prev, html: `${prev.html}${dropped}` } : prev)); } }} />
                        )}
                      </div>

                      <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-800/50 p-3">
                        <h3 className="text-sm font-semibold">Send Test Email</h3>
                        <Input placeholder="test@example.com" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} className="border-slate-700 bg-slate-900" />
                        <Button className="w-full" onClick={() => sendTemplateTest(editingTemplate)}>Send Test Email</Button>
                        <h3 className="text-sm font-semibold">Preview</h3>
                        <div className={cn('overflow-auto rounded-md border border-slate-700 bg-white p-3 text-slate-900', templatePreviewMode === 'mobile' ? 'mx-auto max-w-[320px]' : 'max-w-full')}>
                          {templatePreviewMode === 'html' ? (
                            <pre className="whitespace-pre-wrap text-xs">{editingTemplate.html}</pre>
                          ) : (
                            <div dangerouslySetInnerHTML={{ __html: editingTemplate.html || `<h2>${editingTemplate.subject}</h2><p>${editingTemplate.blocks.map((b) => b.content).join('</p><p>')}</p>` }} />
                          )}
                        </div>
                        <h3 className="text-sm font-semibold">Template Info</h3>
                        <Select value={editingTemplate.category} onValueChange={(v) => setEditingTemplate((prev) => (prev ? { ...prev, category: v } : prev))}>
                          <SelectTrigger className="h-8 border-slate-700 bg-slate-900"><SelectValue /></SelectTrigger>
                          <SelectContent>{EMAIL_TEMPLATE_CATEGORIES.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={editingTemplate.status} onValueChange={(v: EmailTemplateStatus) => setEditingTemplate((prev) => (prev ? { ...prev, status: v } : prev))}>
                          <SelectTrigger className="h-8 border-slate-700 bg-slate-900"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem><SelectItem value="Draft">Draft</SelectItem></SelectContent>
                        </Select>
                        <div className="rounded-md border border-slate-700 bg-slate-900 p-2 text-xs">
                          <p>Created: {editingTemplate.createdAt}</p>
                          <p>Last Modified: {editingTemplate.updatedAt}</p>
                          <p>Version: v{editingTemplate.version}</p>
                        </div>
                        <div className="space-y-1 rounded-md border border-slate-700 bg-slate-900 p-2 text-xs">
                          <p className="font-semibold">Version History</p>
                          {editingTemplate.history.slice(0, 6).map((entry) => <p key={entry}>{entry}</p>)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
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
                    <TableHeader><TableRow><TableHead className="w-10"><Checkbox checked={allCurrentPageSelected} disabled={!currentCourseRows.length} onCheckedChange={(checked) => toggleSelectAllCurrentPage(Boolean(checked))} /></TableHead><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Instructor</TableHead><TableHead>Stats</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {(currentRows as Course[]).map((course) => (
                        <TableRow key={course.id} className={cn(bulkSelectedCourseIds.includes(course.id) && 'bg-cyan-500/10')}>
                          <TableCell><Checkbox checked={bulkSelectedCourseIds.includes(course.id)} onCheckedChange={(checked) => toggleCourseSelection(course.id, Boolean(checked))} /></TableCell>
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

              <div className={cn('sticky bottom-4 z-20 transition-all duration-300', bulkSelectedCourseIds.length ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0')}>
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-600/30 to-cyan-500/10 px-3 py-3 shadow-lg backdrop-blur">
                  <span className="mr-1 text-sm font-medium text-cyan-200">{bulkSelectedCourseIds.length} items selected</span>
                  <Button size="sm" onClick={() => runBulkCourseAction('publish')}><CheckCircle2 className="size-4" />Publish Selected</Button>
                  <Button size="sm" variant="outline" onClick={() => runBulkCourseAction('archive')}><Activity className="size-4" />Archive Selected</Button>
                  <Button size="sm" variant="outline" onClick={() => runBulkCourseAction('delete')}><Trash2 className="size-4" />Delete Selected</Button>
                  <Button size="sm" variant="outline" onClick={() => runBulkCourseAction('export')}><Download className="size-4" />Export Selected</Button>
                  <Button size="sm" variant="ghost" onClick={clearCourseSelection}>Clear Selection</Button>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'users' && (
            <section className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Select value={userFilter.status} onValueChange={(v) => setUserFilter((f) => ({ ...f, status: v }))}><SelectTrigger className="border-slate-700 bg-slate-800"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="Active">Active</SelectItem><SelectItem value="Banned">Banned</SelectItem></SelectContent></Select>
                <Select value={userFilter.role} onValueChange={(v) => setUserFilter((f) => ({ ...f, role: v }))}><SelectTrigger className="border-slate-700 bg-slate-800"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Roles</SelectItem><SelectItem value="Student">Student</SelectItem><SelectItem value="Instructor">Instructor</SelectItem><SelectItem value="Admin">Admin</SelectItem><SelectItem value="Moderator">Moderator</SelectItem><SelectItem value="Super Admin">Super Admin</SelectItem></SelectContent></Select>
              </div>
              <Card className="border-slate-800 bg-slate-900/70"><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead className="w-10"><Checkbox checked={allCurrentUserPageSelected} disabled={!currentUserRows.length} onCheckedChange={(checked) => toggleSelectAllCurrentUserPage(Boolean(checked))} /></TableHead><TableHead>User</TableHead><TableHead>Status</TableHead><TableHead>Role</TableHead><TableHead>Registration</TableHead><TableHead>History</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{(currentRows as ManagedUser[]).map((u) => <TableRow key={u.id} className={cn(bulkSelectedUserIds.includes(u.id) && 'bg-cyan-500/10')}><TableCell><Checkbox checked={bulkSelectedUserIds.includes(u.id)} onCheckedChange={(checked) => toggleUserSelection(u.id, Boolean(checked))} /></TableCell><TableCell><p className="font-medium">{u.name}</p><p className="text-xs text-slate-400">{u.email} | {u.phone}</p></TableCell><TableCell><Badge variant="outline">{u.status}</Badge></TableCell><TableCell><Select value={u.role} onValueChange={(r: ManagedUser['role']) => updateUserRole(u.id, r)}><SelectTrigger className="h-8 border-slate-700 bg-slate-800"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Student">Student</SelectItem><SelectItem value="Instructor">Instructor</SelectItem><SelectItem value="Moderator">Moderator</SelectItem><SelectItem value="Admin">Admin</SelectItem><SelectItem value="Super Admin">Super Admin</SelectItem></SelectContent></Select></TableCell><TableCell>{u.registeredAt}</TableCell><TableCell className="text-xs text-slate-400">Purchases: {u.purchases} | Enrolled: {u.enrolled}</TableCell><TableCell className="space-x-1"><Button size="sm" variant="outline" onClick={() => toggleUserStatus(u.id)}>{u.status === 'Active' ? 'Ban' : 'Activate'}</Button><Button size="sm" variant="outline" onClick={() => openDelete({ type: 'user', id: u.id, title: u.name })}>Delete</Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
              <div className="flex items-center justify-end gap-2"><Button variant="outline" disabled={userPage <= 1 || bulkSelectedUserIds.length > 0} onClick={() => setUserPage((p) => p - 1)}>Prev</Button><span className="text-sm text-slate-400">Page {userPage}</span><Button variant="outline" disabled={userPage * 5 >= filteredUsers.length || bulkSelectedUserIds.length > 0} onClick={() => setUserPage((p) => p + 1)}>Next</Button></div>
              <div className={cn('sticky bottom-4 z-20 transition-all duration-300', bulkSelectedUserIds.length ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0')}>
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-600/30 to-cyan-500/10 px-3 py-3 shadow-lg backdrop-blur">
                  <span className="mr-1 text-sm font-medium text-cyan-200">{bulkSelectedUserIds.length} users selected</span>
                  <Button size="sm" variant="outline" onClick={() => runBulkUserAction('ban')}><UserX className="size-4" />Ban Selected Users</Button>
                  <Button size="sm" onClick={() => runBulkUserAction('activate')}><CheckCircle2 className="size-4" />Activate Selected Users</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowUserRolePicker((v) => !v)}><UserCheck className="size-4" />Change Role</Button>
                  {showUserRolePicker && (
                    <>
                      <Select value={bulkRoleTarget} onValueChange={(v: 'Student' | 'Instructor') => setBulkRoleTarget(v)}>
                        <SelectTrigger className="h-8 border-slate-700 bg-slate-800"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Student">Student</SelectItem>
                          <SelectItem value="Instructor">Instructor</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" onClick={() => runBulkUserAction('changeRole')}>
                        Apply Role
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline" onClick={() => runBulkUserAction('notify')}><Bell className="size-4" />Send Notification to Selected</Button>
                  <Button size="sm" variant="outline" onClick={() => runBulkUserAction('export')}><Download className="size-4" />Export Selected Users</Button>
                  <Button size="sm" variant="ghost" onClick={clearUserSelection}>Clear Selection</Button>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'blog' && (
            <section className="space-y-4">
              <div className="flex flex-wrap gap-2"><Button onClick={() => { setPostDraft({ id: '', title: '', category: 'General', status: 'Draft', author: 'Admin', createdAt: new Date().toISOString().slice(0, 10), seoTitle: '', seoDescription: '', body: '', featuredImage: '' }); setBlogDialogOpen(true); }}>Create Blog Post</Button></div>
              <Card className="border-slate-800 bg-slate-900/70"><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead className="w-10"><Checkbox checked={allCurrentBlogPageSelected} disabled={!currentBlogRows.length} onCheckedChange={(checked) => toggleSelectAllCurrentBlogPage(Boolean(checked))} /></TableHead><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Author</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{(currentRows as BlogPost[]).map((post) => <TableRow key={post.id} className={cn(bulkSelectedPostIds.includes(post.id) && 'bg-cyan-500/10')}><TableCell><Checkbox checked={bulkSelectedPostIds.includes(post.id)} onCheckedChange={(checked) => toggleBlogSelection(post.id, Boolean(checked))} /></TableCell><TableCell><p className="font-medium">{post.title}</p><p className="text-xs text-slate-400">SEO: {post.seoTitle || 'Not set'}</p></TableCell><TableCell>{post.category}</TableCell><TableCell><Badge variant="outline">{post.status}</Badge></TableCell><TableCell>{post.author}</TableCell><TableCell>{post.createdAt}</TableCell><TableCell className="space-x-1"><Button size="sm" variant="outline" onClick={() => { setPostDraft(post); setBlogDialogOpen(true); }}>Edit</Button><Button size="sm" variant="outline" onClick={() => openDelete({ type: 'post', id: post.id, title: post.title })}><Trash2 className="size-4" /></Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
              <div className="flex items-center justify-end gap-2"><Button variant="outline" disabled={blogPage <= 1} onClick={() => setBlogPage((p) => p - 1)}>Prev</Button><span className="text-sm text-slate-400">Page {blogPage}</span><Button variant="outline" disabled={blogPage * 5 >= filteredPosts.length} onClick={() => setBlogPage((p) => p + 1)}>Next</Button></div>
              <div className={cn('sticky bottom-4 z-20 transition-all duration-300', bulkSelectedPostIds.length ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0')}>
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-600/30 to-cyan-500/10 px-3 py-3 shadow-lg backdrop-blur">
                  <span className="mr-1 text-sm font-medium text-cyan-200">{bulkSelectedPostIds.length} posts selected</span>
                  <Button size="sm" onClick={() => runBulkBlogAction('publish')}><CheckCircle2 className="size-4" />Publish Selected Posts</Button>
                  <Button size="sm" variant="outline" onClick={() => runBulkBlogAction('draft')}><FileText className="size-4" />Make Draft Selected Posts</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowBlogCategoryPicker((v) => !v)}><Filter className="size-4" />Add Category Tag</Button>
                  {showBlogCategoryPicker && (
                    <>
                      <Select value={bulkBlogCategoryTag} onValueChange={setBulkBlogCategoryTag}>
                        <SelectTrigger className="h-8 border-slate-700 bg-slate-800"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General">General</SelectItem>
                          <SelectItem value="React">React</SelectItem>
                          <SelectItem value="Web Development">Web Development</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Career">Career</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" onClick={() => runBulkBlogAction('tag')}>Apply Tag</Button>
                    </>
                  )}
                  <Button size="sm" variant="outline" onClick={() => runBulkBlogAction('delete')}><Trash2 className="size-4" />Delete Selected Posts</Button>
                  <Button size="sm" variant="outline" onClick={() => runBulkBlogAction('pdf')}><Download className="size-4" />Export PDF</Button>
                  <Button size="sm" variant="outline" onClick={() => runBulkBlogAction('csv')}><Download className="size-4" />Export CSV</Button>
                  <Button size="sm" variant="ghost" onClick={clearBlogSelection}>Clear Selection</Button>
                </div>
              </div>
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
      <Dialog open={!!selectedInstructorDetail} onOpenChange={(open) => !open && setSelectedInstructorDetail(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Instructor Detail</DialogTitle>
            <DialogDescription>Performance deep-dive snapshot</DialogDescription>
          </DialogHeader>
          {selectedInstructorDetail && (
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div className="rounded-md bg-slate-800/70 p-3"><p className="text-xs text-slate-400">Name</p><p>{selectedInstructorDetail.name}</p></div>
              <div className="rounded-md bg-slate-800/70 p-3"><p className="text-xs text-slate-400">Status</p><p>{selectedInstructorDetail.status}</p></div>
              <div className="rounded-md bg-slate-800/70 p-3"><p className="text-xs text-slate-400">Course Count</p><p>{selectedInstructorDetail.courseCount}</p></div>
              <div className="rounded-md bg-slate-800/70 p-3"><p className="text-xs text-slate-400">Students</p><p>{selectedInstructorDetail.students}</p></div>
              <div className="rounded-md bg-slate-800/70 p-3"><p className="text-xs text-slate-400">Avg Rating</p><p>{selectedInstructorDetail.avgRating}</p></div>
              <div className="rounded-md bg-slate-800/70 p-3"><p className="text-xs text-slate-400">Total Revenue</p><p>{formatCurrency(selectedInstructorDetail.totalRevenue)}</p></div>
              <div className="rounded-md bg-slate-800/70 p-3"><p className="text-xs text-slate-400">Completion Rate</p><p>{selectedInstructorDetail.completionRate}%</p></div>
              <div className="rounded-md bg-slate-800/70 p-3"><p className="text-xs text-slate-400">Refund Rate</p><p>{selectedInstructorDetail.refundRate}%</p></div>
              <div className="rounded-md bg-slate-800/70 p-3"><p className="text-xs text-slate-400">Earnings This Month</p><p>{formatCurrency(selectedInstructorDetail.earningsMonth)}</p></div>
              <div className="rounded-md bg-slate-800/70 p-3"><p className="text-xs text-slate-400">YTD Earnings</p><p>{formatCurrency(selectedInstructorDetail.earningsYtd)}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete confirmation</AlertDialogTitle><AlertDialogDescription>Delete {deleteTarget?.type}: {deleteTarget?.title}? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete selected courses</AlertDialogTitle><AlertDialogDescription>Delete {bulkSelectedCourseIds.length} selected courses? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmBulkDelete}>Delete Selected</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={bulkUserBanDialogOpen} onOpenChange={setBulkUserBanDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Ban selected users</AlertDialogTitle><AlertDialogDescription>Ban {bulkSelectedUserIds.length} selected users? They will lose access until reactivated.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmBulkBanUsers}>Ban Selected</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={bulkBlogDeleteDialogOpen} onOpenChange={setBulkBlogDeleteDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete selected blog posts</AlertDialogTitle><AlertDialogDescription>Delete {bulkSelectedPostIds.length} selected blog posts? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmBulkDeletePosts}>Delete Selected</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}
