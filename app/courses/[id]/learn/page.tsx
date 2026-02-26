'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CheckCircle2, Play } from 'lucide-react';
import Link from 'next/link';

export default function CourseLearningPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([0]);

  // Mock course data
  const course = {
    id: courseId,
    title: 'Web Development Fundamentals',
    progress: 65,
    lessons: [
      {
        id: '1',
        title: 'Welcome to the Course',
        duration: 5,
        description: 'Get started with an overview of what you will learn',
        videoUrl: '#',
      },
      {
        id: '2',
        title: 'Setting Up Your Development Environment',
        duration: 12,
        description: 'Install and configure all necessary tools',
        videoUrl: '#',
      },
      {
        id: '3',
        title: 'HTML Basics',
        duration: 18,
        description: 'Learn HTML fundamentals and structure',
        videoUrl: '#',
      },
      {
        id: '4',
        title: 'CSS Styling and Layouts',
        duration: 22,
        description: 'Master CSS for beautiful designs',
        videoUrl: '#',
      },
      {
        id: '5',
        title: 'JavaScript Fundamentals',
        duration: 25,
        description: 'Get started with JavaScript programming',
        videoUrl: '#',
      },
    ],
  };

  const currentLesson = course.lessons[currentLessonIndex];
  const isLessonCompleted = completedLessons.includes(currentLessonIndex);
  const progress = Math.round((completedLessons.length / course.lessons.length) * 100);

  const handleCompleteLesson = () => {
    if (!completedLessons.includes(currentLessonIndex)) {
      setCompletedLessons([...completedLessons, currentLessonIndex]);
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < course.lessons.length - 1) {
      handleCompleteLesson();
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="p-0 hover:bg-transparent"
              >
                <Link href={`/courses/${courseId}`}>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">{course.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Lesson {currentLessonIndex + 1} of {course.lessons.length}
                </p>
              </div>
            </div>
            <Badge>{progress}% Complete</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video placeholder */}
            <div className="w-full aspect-video rounded-lg border border-border bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-primary/40 mx-auto mb-4" />
                <p className="text-muted-foreground">Video player would load here</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {currentLesson.title}
                </p>
              </div>
            </div>

            {/* Lesson info */}
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle>{currentLesson.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{currentLesson.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Duration: {currentLesson.duration} minutes
                  </span>
                  {isLessonCompleted && (
                    <div className="flex items-center gap-2 text-green-500">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">Completed</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lesson navigation */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handlePreviousLesson}
                disabled={currentLessonIndex === 0}
              >
                Previous Lesson
              </Button>
              <Button
                onClick={handleCompleteLesson}
                disabled={isLessonCompleted}
                className="flex-1"
              >
                {isLessonCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Lesson Completed
                  </>
                ) : (
                  'Mark as Complete'
                )}
              </Button>
              <Button
                onClick={handleNextLesson}
                disabled={currentLessonIndex === course.lessons.length - 1}
              >
                Next Lesson
              </Button>
            </div>
          </div>

          {/* Curriculum Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-card/50 border-border sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg">Course Curriculum</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {course.lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLessonIndex(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors text-sm ${
                      index === currentLessonIndex
                        ? 'bg-primary/20 border border-primary/50'
                        : 'hover:bg-muted border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {completedLessons.includes(index) ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-muted-foreground flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {lesson.duration} min
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Course progress */}
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="text-2xl font-bold mb-4">Course Progress</h2>
          <Card className="bg-card/50 border-border">
            <CardContent className="pt-6">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-semibold">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
              <p className="text-sm text-muted-foreground">
                {completedLessons.length} of {course.lessons.length} lessons completed
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
