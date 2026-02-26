'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCourseById } from '@/lib/firestore-helpers';
import { Course } from '@/lib/firestore-schemas';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/header';
import { CheckoutModal } from '@/components/checkout-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const courseId = params.id as string;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getCourseById(courseId);
        setCourse(data);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-card rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-card rounded w-3/4" />
              <div className="h-4 bg-card rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Course not found</h1>
            <Button asChild>
              <Link href="/courses">Back to Courses</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleEnroll = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setCheckoutOpen(true);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    // In production, save enrollment to Firestore
    router.push(`/dashboard?enrolled=${courseId}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      {course && (
        <CheckoutModal
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
          courseId={course.id}
          courseName={course.title}
          price={course.price}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course thumbnail */}
            <div className="w-full h-96 rounded-lg border border-border bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <div className="text-8xl font-bold text-primary/20">
                {course.title.charAt(0)}
              </div>
            </div>

            {/* Course header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                  <p className="text-lg text-muted-foreground mb-4">
                    {course.description}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(course.rating)
                            ? 'text-primary fill-primary'
                            : 'text-muted-foreground'
                          }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span>
                    {course.rating.toFixed(1)} ({course.reviewCount} reviews)
                  </span>
                </div>
                <span>•</span>
                <span>{course.enrollmentCount} students</span>
                <span>•</span>
                <span>{Math.floor(course.duration / 60)}h of content</span>
              </div>

              {/* Instructor info */}
              <div className="p-4 rounded-lg border border-border bg-card/50">
                <p className="text-sm text-muted-foreground mb-2">Instructor</p>
                <p className="font-semibold">{course.instructorName}</p>
              </div>
            </div>

            {/* What you'll learn */}
            <div className="space-y-4 border-t border-border pt-8">
              <h2 className="text-2xl font-bold">What you&apos;ll learn</h2>
              <ul className="space-y-3">
                {[
                  'Master the fundamentals and advanced concepts',
                  'Build real-world projects from scratch',
                  'Understand industry best practices',
                  'Get lifetime access to course materials',
                  'Earn a certificate upon completion',
                  'Access to community forum for support',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Curriculum */}
            <div className="space-y-4 border-t border-border pt-8">
              <h2 className="text-2xl font-bold">Course curriculum</h2>
              <div className="space-y-2">
                {course.lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">
                          {index + 1}. {lesson.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {lesson.description}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-4 whitespace-nowrap">
                        {lesson.duration} min
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 rounded-lg border border-border bg-card/50">
              {/* Price */}
              <div className="text-4xl font-bold text-primary mb-6">
                ${course.price}
              </div>

              {/* Enrollment CTA */}
              <Button
                onClick={handleEnroll}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-4 h-12 text-base"
              >
                {user ? 'Enroll Now' : 'Sign In to Enroll'}
              </Button>

              {/* Course highlights */}
              <div className="space-y-4 pt-6 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Level</p>
                  <Badge className="capitalize">
                    {course.level}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Duration</p>
                  <p className="font-semibold">
                    {Math.floor(course.duration / 60)}h {course.duration % 60}m
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Category</p>
                  <p className="font-semibold capitalize">{course.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Students</p>
                  <p className="font-semibold">{course.enrollmentCount.toLocaleString()}</p>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-3 pt-6 border-t border-border text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Lifetime access</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Certificate included</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
