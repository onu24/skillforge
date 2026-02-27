'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useAuth } from '@/lib/auth-context';
import { Course, Lesson } from '@/lib/firestore-schemas';
import {
  createEnrollment,
  getCourseById,
  getUserEnrollmentForCourse,
  saveEnrollmentProgress,
  saveLessonNote,
  unenrollFromCourse,
} from '@/lib/firestore-helpers';
import { sampleCourses } from '@/lib/sample-courses';
import { CheckCircle2, ChevronDown, ChevronUp, Download, FileText, MessageSquare, PlayCircle } from 'lucide-react';

type LessonItem = {
  id: string;
  title: string;
  description: string;
  duration: number;
  videoUrl: string;
  outcomes: string[];
  resources: { id: string; title: string; url: string }[];
};

type LessonModule = {
  id: string;
  title: string;
  lessons: LessonItem[];
};

type QaComment = {
  id: string;
  author: string;
  message: string;
  postedAt: string;
};

const moduleBlueprint = [
  { id: 'module-1', title: 'Module 1: Introduction', count: 3 },
  { id: 'module-2', title: 'Module 2: Fundamentals', count: 5 },
  { id: 'module-3', title: 'Module 3: Advanced', count: 4 },
];

const fallbackOutcomes = [
  'Understand the key lesson concepts and vocabulary.',
  'Apply the concept in a practical, real-world scenario.',
  'Prepare for the next lesson with confidence.',
];

const seededQa: QaComment[] = [
  {
    id: 'qa-1',
    author: 'Mentor',
    message: 'Focus on understanding the concept before rushing through the code.',
    postedAt: '2h ago',
  },
  {
    id: 'qa-2',
    author: 'Student',
    message: 'Can I use a different framework for the practice task?',
    postedAt: '1h ago',
  },
];

function normalizeLessons(course: Course): { modules: LessonModule[]; flatLessons: LessonItem[] } {
  const sourceLessons = [...(course.lessons || [])].sort((a, b) => a.order - b.order);
  let cursor = 0;

  const modules = moduleBlueprint.map((module, moduleIndex) => {
    const lessons = Array.from({ length: module.count }).map((_, lessonIndex) => {
      const source = sourceLessons[cursor++] as Lesson | undefined;
      const id = source?.id || `${module.id}-lesson-${lessonIndex + 1}`;
      const title = source?.title || `${module.title.replace(/^Module \d+:\s*/, '')} Lesson ${lessonIndex + 1}`;
      const description =
        source?.description ||
        `This lesson covers essential concepts for ${title.toLowerCase()} and prepares you for the next step.`;
      const videoUrl = source?.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      const duration = source?.duration || 12 + lessonIndex * 3;
      const resources =
        source?.resources?.map((resource) => ({
          id: resource.id,
          title: resource.title,
          url: resource.url,
        })) || [
          {
            id: `${id}-slides`,
            title: `${title} Slides`,
            url: '#',
          },
          {
            id: `${id}-worksheet`,
            title: `${title} Practice Worksheet`,
            url: '#',
          },
        ];

      return {
        id,
        title,
        description,
        videoUrl,
        duration,
        outcomes: [...fallbackOutcomes],
        resources,
      };
    });

    return {
      id: module.id,
      title: module.title,
      lessons,
    };
  });

  return {
    modules,
    flatLessons: modules.flatMap((module) => module.lessons),
  };
}

export default function CourseLearningPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const courseId = params.id as string;
  const lessonParam = searchParams.get('lesson');

  const [course, setCourse] = useState<Course | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [loadingEnrollment, setLoadingEnrollment] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [lessonNotes, setLessonNotes] = useState<Record<string, string>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'module-1': true,
    'module-2': true,
    'module-3': true,
  });
  const [qaByLesson, setQaByLesson] = useState<Record<string, QaComment[]>>({});
  const [qaInput, setQaInput] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [savingProgress, setSavingProgress] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [enrollmentBusy, setEnrollmentBusy] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [invalidLesson, setInvalidLesson] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?redirect=%2Fcourses%2F${courseId}%2Flearn`);
    }
  }, [courseId, loading, router, user]);

  useEffect(() => {
    const loadLearningData = async () => {
      if (!user) {
        return;
      }

      setLoadingCourse(true);
      setLoadingEnrollment(true);
      setInvalidLesson(false);

      let resolvedCourse = await getCourseById(courseId);
      if (!resolvedCourse) {
        resolvedCourse = sampleCourses.find((item) => item.id === courseId) || null;
      }
      setCourse(resolvedCourse);
      setLoadingCourse(false);

      if (!resolvedCourse) {
        setLoadingEnrollment(false);
        return;
      }

      const { flatLessons } = normalizeLessons(resolvedCourse);
      const lessonIds = new Set(flatLessons.map((lesson) => lesson.id));

      const enrollment = await getUserEnrollmentForCourse(user.uid, courseId);
      const completed = enrollment?.completedLessons || [];
      const notes = enrollment?.lessonNotes || {};

      setCompletedLessons(completed);
      setLessonNotes(notes);
      setIsEnrolled(Boolean(enrollment));

      const requestedLessonId = lessonParam;
      if (requestedLessonId && !lessonIds.has(requestedLessonId)) {
        setInvalidLesson(true);
        setLoadingEnrollment(false);
        return;
      }

      const nextLessonId =
        requestedLessonId ||
        (enrollment?.lastLessonId && lessonIds.has(enrollment.lastLessonId) ? enrollment.lastLessonId : null) ||
        flatLessons.find((lesson) => !completed.includes(lesson.id))?.id ||
        flatLessons[0]?.id ||
        null;

      setCurrentLessonId(nextLessonId);
      setLoadingEnrollment(false);
    };

    loadLearningData();
  }, [courseId, lessonParam, user]);

  const normalizedData = useMemo(() => {
    if (!course) {
      return { modules: [], flatLessons: [] as LessonItem[] };
    }
    return normalizeLessons(course);
  }, [course]);

  const { modules, flatLessons } = normalizedData;

  const currentLessonIndex = useMemo(() => {
    if (!currentLessonId) {
      return 0;
    }
    const index = flatLessons.findIndex((lesson) => lesson.id === currentLessonId);
    return index >= 0 ? index : 0;
  }, [currentLessonId, flatLessons]);

  const currentLesson = flatLessons[currentLessonIndex];
  const completedCount = completedLessons.filter((lessonId) =>
    flatLessons.some((lesson) => lesson.id === lessonId)
  ).length;
  const progressPercent = flatLessons.length
    ? Math.round((completedCount / flatLessons.length) * 100)
    : 0;

  useEffect(() => {
    if (!currentLesson) {
      return;
    }
    setNoteDraft(lessonNotes[currentLesson.id] || '');
  }, [currentLesson, lessonNotes]);

  useEffect(() => {
    if (!currentLesson) {
      return;
    }
    if (!qaByLesson[currentLesson.id]) {
      setQaByLesson((prev) => ({
        ...prev,
        [currentLesson.id]: [...seededQa],
      }));
    }
  }, [currentLesson, qaByLesson]);

  const setLessonByIndex = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(index, flatLessons.length - 1));
      const lesson = flatLessons[clampedIndex];
      if (!lesson) {
        return;
      }
      setCurrentLessonId(lesson.id);
      router.replace(`/courses/${courseId}/learn?lesson=${lesson.id}`, { scroll: false });
    },
    [courseId, flatLessons, router]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        setLessonByIndex(currentLessonIndex - 1);
      }
      if (event.key === 'ArrowRight') {
        setLessonByIndex(currentLessonIndex + 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentLessonIndex, setLessonByIndex]);

  const persistProgress = useCallback(
    async (nextCompletedLessons: string[], nextLessonId?: string) => {
      if (!user || !course) {
        return;
      }
      setSavingProgress(true);
      try {
        const completed = nextCompletedLessons.filter((lessonId) =>
          flatLessons.some((lesson) => lesson.id === lessonId)
        ).length;
        const progress = flatLessons.length ? Math.round((completed / flatLessons.length) * 100) : 0;
        await saveEnrollmentProgress(
          user.uid,
          course.id,
          course.title,
          progress,
          nextCompletedLessons,
          nextLessonId || currentLesson?.id
        );
        setIsEnrolled(true);
      } finally {
        setSavingProgress(false);
      }
    },
    [course, currentLesson?.id, flatLessons, user]
  );

  const handleMarkComplete = async () => {
    if (!currentLesson) {
      return;
    }
    const isCompleted = completedLessons.includes(currentLesson.id);
    if (isCompleted) {
      return;
    }
    const updated = [...completedLessons, currentLesson.id];
    setCompletedLessons(updated);
    await persistProgress(updated, currentLesson.id);
  };

  const handleNext = async () => {
    if (!currentLesson) {
      return;
    }
    if (!completedLessons.includes(currentLesson.id)) {
      const updated = [...completedLessons, currentLesson.id];
      setCompletedLessons(updated);
      await persistProgress(updated, currentLesson.id);
    }
    setLessonByIndex(currentLessonIndex + 1);
  };

  const handlePrevious = () => {
    setLessonByIndex(currentLessonIndex - 1);
  };

  const handleSaveNote = async () => {
    if (!user || !course || !currentLesson) {
      return;
    }
    setSavingNote(true);
    try {
      await saveLessonNote(user.uid, course.id, course.title, currentLesson.id, noteDraft);
      setLessonNotes((prev) => ({ ...prev, [currentLesson.id]: noteDraft }));
      setIsEnrolled(true);
    } finally {
      setSavingNote(false);
    }
  };

  const handleToggleEnrollment = async () => {
    if (!user || !course) {
      return;
    }
    setEnrollmentBusy(true);
    try {
      if (isEnrolled) {
        await unenrollFromCourse(user.uid, course.id);
        setIsEnrolled(false);
        setCompletedLessons([]);
        setLessonNotes({});
      } else {
        await createEnrollment(user.uid, course.id, course.title);
        setIsEnrolled(true);
      }
    } finally {
      setEnrollmentBusy(false);
    }
  };

  const handlePostComment = () => {
    if (!currentLesson || !qaInput.trim()) {
      return;
    }
    const newComment: QaComment = {
      id: `qa-${Date.now()}`,
      author: user?.displayName || user?.email?.split('@')[0] || 'You',
      message: qaInput.trim(),
      postedAt: 'Just now',
    };
    setQaByLesson((prev) => ({
      ...prev,
      [currentLesson.id]: [newComment, ...(prev[currentLesson.id] || [])],
    }));
    setQaInput('');
  };

  if (loading || loadingCourse || loadingEnrollment) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-56 rounded bg-card" />
            <div className="h-72 rounded bg-card" />
            <div className="h-52 rounded bg-card" />
          </div>
        </div>
      </div>
    );
  }

  if (!course || invalidLesson || !currentLesson) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="mt-3 text-muted-foreground">
            The course or lesson you requested could not be found.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/courses">Back to Courses</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const lessonCompleted = completedLessons.includes(currentLesson.id);
  const lessonComments = qaByLesson[currentLesson.id] || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/courses">Courses</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/courses/${course.id}`}>{course.title}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Learning</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-6 flex items-center justify-between rounded-lg border border-border bg-card/30 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Now learning</p>
            <p className="font-semibold">{currentLesson.title}</p>
          </div>
          <Badge>{progressPercent}% Complete</Badge>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <aside className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-20 border-border bg-card/60 py-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {completedCount} of {flatLessons.length} completed
                </p>
                <Progress value={progressPercent} className="h-2" />
              </CardHeader>
              <CardContent className="space-y-3">
                {modules.map((module) => (
                  <div key={module.id} className="rounded-lg border border-border/80 bg-background/30">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedModules((prev) => ({
                          ...prev,
                          [module.id]: !prev[module.id],
                        }))
                      }
                      className="flex w-full items-center justify-between px-3 py-3 text-left"
                    >
                      <span className="text-sm font-medium">{module.title}</span>
                      {expandedModules[module.id] ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    {expandedModules[module.id] && (
                      <div className="space-y-1 border-t border-border/80 p-2">
                        {module.lessons.map((lesson) => {
                          const isCurrent = lesson.id === currentLesson.id;
                          const isDone = completedLessons.includes(lesson.id);
                          return (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() => setLessonByIndex(flatLessons.findIndex((item) => item.id === lesson.id))}
                              className={`flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-xs transition-colors ${
                                isCurrent
                                  ? 'bg-primary/20 text-foreground'
                                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                              }`}
                            >
                              {isDone ? (
                                <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                              ) : (
                                <PlayCircle className="mt-0.5 h-4 w-4 text-primary" />
                              )}
                              <span>{lesson.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          <section className="space-y-6 lg:col-span-2">
            <Card className="border-border bg-card/60 py-0">
              <div className="aspect-video w-full rounded-t-xl bg-black">
                <iframe
                  className="h-full w-full rounded-t-xl"
                  src={currentLesson.videoUrl}
                  title={currentLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
                  <p className="mt-2 text-sm text-muted-foreground">{currentLesson.description}</p>
                </div>

                <div>
                  <h2 className="mb-3 text-lg font-semibold">Learning Outcomes</h2>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {currentLesson.outcomes.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="mb-3 text-lg font-semibold">Resources</h2>
                  <div className="space-y-2">
                    {currentLesson.resources.map((resource) => (
                      <a
                        key={resource.id}
                        href={resource.url}
                        className="flex items-center justify-between rounded-md border border-border bg-background/30 px-3 py-2 text-sm text-muted-foreground hover:border-primary/70 hover:text-foreground"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          {resource.title}
                        </span>
                        <Download className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={handlePrevious} disabled={currentLessonIndex === 0}>
                    Previous
                  </Button>
                  <Button onClick={handleMarkComplete} disabled={lessonCompleted || savingProgress}>
                    {lessonCompleted ? 'Completed' : 'Mark as Complete'}
                  </Button>
                  <Button
                    className="ml-auto"
                    onClick={handleNext}
                    disabled={currentLessonIndex === flatLessons.length - 1 || savingProgress}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/60">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                  placeholder="Write your notes for this lesson..."
                  rows={6}
                />
                <Button onClick={handleSaveNote} disabled={savingNote}>
                  {savingNote ? 'Saving...' : 'Save Notes'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/60">
              <CardHeader>
                <CardTitle>Q&A</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {lessonComments.map((comment) => (
                    <div key={comment.id} className="rounded-md border border-border bg-background/30 p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <p className="text-sm font-medium">{comment.author}</p>
                        <span className="text-xs text-muted-foreground">{comment.postedAt}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.message}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={qaInput}
                    onChange={(event) => setQaInput(event.target.value)}
                    placeholder="Ask a question about this lesson..."
                  />
                  <Button onClick={handlePostComment}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <aside className="space-y-4 lg:col-span-1">
            <Card className="hidden border-border bg-card/60 lg:block">
              <CardHeader>
                <CardTitle>Course Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-semibold">{course.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Instructor</p>
                  <p className="font-semibold">{course.instructorName}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-semibold">{Math.round(course.duration / 60)}h</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Level</p>
                    <p className="font-semibold capitalize">{course.level}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-semibold">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
                <Button className="w-full" onClick={handleToggleEnrollment} disabled={enrollmentBusy}>
                  {isEnrolled ? 'Unenroll' : 'Enroll'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/60 lg:hidden">
              <CardContent className="space-y-3 pt-6">
                <p className="text-sm text-muted-foreground">
                  {completedCount} / {flatLessons.length} lessons completed
                </p>
                <Progress value={progressPercent} className="h-2" />
                <Button className="w-full" onClick={handleToggleEnrollment} disabled={enrollmentBusy}>
                  {isEnrolled ? 'Unenroll' : 'Enroll'}
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
