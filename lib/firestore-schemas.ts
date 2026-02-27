// Firestore Collection Schemas for SkillForge

export interface User {
  uid: string;
  email: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  enrolledCourses: string[]; // Array of course IDs
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  instructor: string; // User ID
  instructorName: string;
  thumbnail: string; // Image URL
  rating: number;
  reviewCount: number;
  enrollmentCount: number;
  duration: number; // in minutes
  lessons: Lesson[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number; // in minutes
  order: number;
  resources?: Resource[];
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'pdf' | 'link' | 'file';
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  progress: number; // 0-100
  completedLessons: string[]; // Array of lesson IDs
  lessonNotes?: Record<string, string>; // Notes keyed by lesson ID
  lastLessonId?: string;
  enrollmentDate: Date;
  lastAccessDate: Date;
}

export interface Payment {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  amount: number;
  currency: string;
  paymentMethod: 'stripe' | 'razorpay';
  status: 'pending' | 'completed' | 'failed';
  transactionId: string;
  paymentDate: Date;
}

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}

export interface WishlistItem {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  addedAt: Date;
}

export interface ActivityLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  type: 'lesson_completed' | 'login' | 'enrollment';
  timestamp: Date;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  grade: string;
  issuedAt: Date;
}
