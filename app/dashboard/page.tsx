'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { BarChart3, Settings, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, userData, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-card rounded-lg" />
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-card rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const enrolledCourses = [
    {
      id: '1',
      title: 'Web Development Fundamentals',
      category: 'Web Development',
      progress: 65,
      lessons: 24,
      completedLessons: 16,
      instructor: 'John Smith',
      thumbnail: 'WD',
    },
    {
      id: '2',
      title: 'Advanced React Patterns',
      category: 'Web Development',
      progress: 30,
      lessons: 18,
      completedLessons: 5,
      instructor: 'Sarah Johnson',
      thumbnail: 'AR',
    },
    {
      id: '3',
      title: 'UI/UX Design Masterclass',
      category: 'Design',
      progress: 85,
      lessons: 16,
      completedLessons: 13,
      instructor: 'Emma Wilson',
      thumbnail: 'UI',
    },
  ];

  const stats = [
    { label: 'Courses Enrolled', value: enrolledCourses.length },
    { label: 'Learning Hours', value: '24.5' },
    { label: 'Certificates Earned', value: '1' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile header */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* User info */}
            <div className="md:col-span-3">
              <div className="bg-gradient-to-r from-primary/20 to-primary/5 border border-border rounded-lg p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      Welcome back, {user.displayName || user.email?.split('@')[0]}
                    </h1>
                    <p className="text-muted-foreground mb-4">
                      {user.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Member since {new Date(user.metadata?.creationTime || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full">
                <Link href="/courses">Browse Courses</Link>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <Card key={i} className="bg-card/50 border-border">
              <CardHeader>
                <CardDescription>{stat.label}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="learning">Learning Path</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* My Courses Tab */}
          <TabsContent value="courses" className="space-y-6 mt-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Enrolled Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrolledCourses.map((course) => (
                  <Card key={course.id} className="bg-card/50 border-border hover:border-primary/50 transition-colors overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                          <div className="text-lg font-bold text-primary">
                            {course.thumbnail}
                          </div>
                        </div>
                        <Badge variant="secondary">{course.category}</Badge>
                      </div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription>{course.instructor}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {course.completedLessons} of {course.lessons} lessons completed
                      </div>
                      <Button asChild className="w-full mt-4">
                        <Link href={`/courses/${course.id}/learn`}>
                          Continue Learning
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Learning Path Tab */}
          <TabsContent value="learning" className="space-y-6 mt-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Learning Path</h2>
              <Card className="bg-card/50 border-border p-8">
                <div className="text-center space-y-4">
                  <BarChart3 className="w-12 h-12 text-primary mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Track Your Progress</h3>
                    <p className="text-muted-foreground mb-4">
                      Your learning analytics and insights will appear here as you progress through courses.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Account Settings</h2>
              <Card className="bg-card/50 border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Profile Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-semibold">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Account Created</label>
                    <p className="font-semibold">
                      {new Date(user.metadata?.creationTime || Date.now()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <Button
                      variant="destructive"
                      onClick={handleSignOut}
                      className="w-full"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
