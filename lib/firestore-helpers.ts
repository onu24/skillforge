import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  limit,
  arrayRemove,
  Timestamp,
  Firestore,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Course, Enrollment, Payment, WishlistItem, ActivityLog, Certificate } from './firestore-schemas';

const getDb = (): Firestore => {
  if (!db) throw new Error('Firestore not initialized');
  return db;
};

// User helpers
export async function getUserData(uid: string): Promise<User | null> {
  try {
    const docSnap = await getDoc(doc(getDb(), 'users', uid));
    if (docSnap.exists()) {
      return docSnap.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function createUser(
  uid: string,
  email: string,
  displayName: string
): Promise<void> {
  try {
    await setDoc(doc(getDb(), 'users', uid), {
      uid,
      email,
      displayName,
      createdAt: new Date(),
      updatedAt: new Date(),
      enrolledCourses: [],
    } as any);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<User>
): Promise<void> {
  try {
    await updateDoc(doc(getDb(), 'users', uid), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Course helpers
export async function getAllCourses(): Promise<Course[]> {
  try {
    const querySnapshot = await getDocs(collection(getDb(), 'courses'));
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Course[];
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

export async function getCourseById(courseId: string): Promise<Course | null> {
  try {
    const docSnap = await getDoc(doc(getDb(), 'courses', courseId));
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as Course;
    }
    return null;
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

export async function getCoursesByCategory(
  category: string
): Promise<Course[]> {
  try {
    const q = query(
      collection(getDb(), 'courses'),
      where('category', '==', category)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Course[];
  } catch (error) {
    console.error('Error fetching courses by category:', error);
    return [];
  }
}

// Enrollment helpers
export async function getUserEnrollments(
  userId: string
): Promise<Enrollment[]> {
  try {
    const q = query(
      collection(getDb(), 'enrollments'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Enrollment[];
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return [];
  }
}

export async function createEnrollment(
  userId: string,
  courseId: string,
  courseName: string
): Promise<void> {
  try {
    await addDoc(collection(getDb(), 'enrollments'), {
      userId,
      courseId,
      courseName,
      progress: 0,
      completedLessons: [],
      enrollmentDate: new Date(),
      lastAccessDate: new Date(),
    } as any);

    // Add course to user's enrolledCourses
    const userRef = doc(getDb(), 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data() as User;
      await updateDoc(userRef, {
        enrolledCourses: [...(userData.enrolledCourses || []), courseId],
      });
    }
  } catch (error) {
    console.error('Error creating enrollment:', error);
    throw error;
  }
}

export async function getUserEnrollmentForCourse(
  userId: string,
  courseId: string
): Promise<Enrollment | null> {
  try {
    const q = query(
      collection(getDb(), 'enrollments'),
      where('userId', '==', userId),
      where('courseId', '==', courseId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const enrollmentDoc = querySnapshot.docs[0];
    return {
      ...(enrollmentDoc.data() as Omit<Enrollment, 'id'>),
      id: enrollmentDoc.id,
    } as Enrollment;
  } catch (error) {
    console.error('Error fetching enrollment for course:', error);
    return null;
  }
}

export async function saveEnrollmentProgress(
  userId: string,
  courseId: string,
  courseName: string,
  progress: number,
  completedLessons: string[],
  lastLessonId?: string
): Promise<void> {
  try {
    const existingEnrollment = await getUserEnrollmentForCourse(userId, courseId);
    const payload = {
      progress,
      completedLessons,
      lastLessonId: lastLessonId || null,
      lastAccessDate: new Date(),
    };

    if (existingEnrollment) {
      await updateDoc(doc(getDb(), 'enrollments', existingEnrollment.id), payload);
      return;
    }

    await addDoc(collection(getDb(), 'enrollments'), {
      userId,
      courseId,
      courseName,
      ...payload,
      lessonNotes: {},
      enrollmentDate: new Date(),
    } as any);
  } catch (error) {
    console.error('Error saving enrollment progress:', error);
    throw error;
  }
}

export async function saveLessonNote(
  userId: string,
  courseId: string,
  courseName: string,
  lessonId: string,
  note: string
): Promise<void> {
  try {
    const existingEnrollment = await getUserEnrollmentForCourse(userId, courseId);
    if (existingEnrollment) {
      await updateDoc(doc(getDb(), 'enrollments', existingEnrollment.id), {
        [`lessonNotes.${lessonId}`]: note,
        lastAccessDate: new Date(),
      });
      return;
    }

    await addDoc(collection(getDb(), 'enrollments'), {
      userId,
      courseId,
      courseName,
      progress: 0,
      completedLessons: [],
      lessonNotes: { [lessonId]: note },
      enrollmentDate: new Date(),
      lastAccessDate: new Date(),
    } as any);
  } catch (error) {
    console.error('Error saving lesson note:', error);
    throw error;
  }
}

export async function unenrollFromCourse(
  userId: string,
  courseId: string
): Promise<void> {
  try {
    const existingEnrollment = await getUserEnrollmentForCourse(userId, courseId);
    if (existingEnrollment) {
      await deleteDoc(doc(getDb(), 'enrollments', existingEnrollment.id));
    }

    const userRef = doc(getDb(), 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      await updateDoc(userRef, {
        enrolledCourses: arrayRemove(courseId),
      });
    }
  } catch (error) {
    console.error('Error unenrolling user from course:', error);
    throw error;
  }
}

// Payment helpers
export async function createPayment(paymentData: Omit<Payment, 'id'>): Promise<void> {
  try {
    await addDoc(collection(getDb(), 'payments'), paymentData as any);
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
}

export async function updatePaymentStatus(
  paymentId: string,
  status: 'completed' | 'failed'
): Promise<void> {
  try {
    await updateDoc(doc(getDb(), 'payments', paymentId), { status });
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
}

// Wishlist helpers
export async function getWishlist(userId: string): Promise<WishlistItem[]> {
  try {
    const q = query(collection(getDb(), 'wishlist'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as WishlistItem[];
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
}

export async function addToWishlist(userId: string, courseId: string, courseName: string): Promise<void> {
  try {
    const q = query(collection(getDb(), 'wishlist'), where('userId', '==', userId), where('courseId', '==', courseId));
    const existing = await getDocs(q);
    if (!existing.empty) return;

    await addDoc(collection(getDb(), 'wishlist'), {
      userId,
      courseId,
      courseName,
      addedAt: new Date(),
    } as any);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
}

export async function removeFromWishlist(userId: string, courseId: string): Promise<void> {
  try {
    const q = query(collection(getDb(), 'wishlist'), where('userId', '==', userId), where('courseId', '==', courseId));
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
}

export async function toggleWishlist(userId: string, courseId: string, courseName: string): Promise<boolean> {
  try {
    const q = query(collection(getDb(), 'wishlist'), where('userId', '==', userId), where('courseId', '==', courseId));
    const existing = await getDocs(q);
    if (!existing.empty) {
      await removeFromWishlist(userId, courseId);
      return false;
    } else {
      await addToWishlist(userId, courseId, courseName);
      return true;
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    throw error;
  }
}

// Activity helpers
export async function getActivityLogs(userId: string): Promise<ActivityLog[]> {
  try {
    const q = query(collection(getDb(), 'activity_logs'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as ActivityLog[];
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }
}

export async function logActivity(userId: string, type: ActivityLog['type']): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const q = query(collection(getDb(), 'activity_logs'), where('userId', '==', userId), where('date', '==', today), where('type', '==', type));
    const existing = await getDocs(q);
    if (!existing.empty) return; // Only log once per day per type

    await addDoc(collection(getDb(), 'activity_logs'), {
      userId,
      date: today,
      type,
      timestamp: new Date(),
    } as any);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// Certificate helpers
export async function getCertificates(userId: string): Promise<Certificate[]> {
  try {
    const q = query(collection(getDb(), 'certificates'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Certificate[];
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return [];
  }
}

// Unified Dashboard Stats helper
export async function getDashboardStats(userId: string) {
  try {
    const [enrollments, certificates, wishlist, activities] = await Promise.all([
      getUserEnrollments(userId),
      getCertificates(userId),
      getWishlist(userId),
      getActivityLogs(userId)
    ]);

    // 1. Calculate Total Hours
    let totalMinutes = 0;
    for (const enrollment of enrollments) {
      if (enrollment.completedLessons.length > 0) {
        const course = await getCourseById(enrollment.courseId);
        if (course) {
          const completedLessonDetails = course.lessons.filter(l => enrollment.completedLessons.includes(l.id));
          totalMinutes += completedLessonDetails.reduce((sum, l) => sum + l.duration, 0);
        }
      }
    }
    const totalHours = totalMinutes / 60;

    // 2. Calculate Streak
    const activityDates = Array.from(new Set(activities.map(a => a.date))).sort().reverse();
    let streak = 0;
    if (activityDates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      let lastDate = activityDates[0];
      if (lastDate === today || lastDate === yesterday) {
        streak = 1;
        for (let i = 1; i < activityDates.length; i++) {
          const curr = new Date(lastDate);
          const prev = new Date(activityDates[i]);
          const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 3600 * 24);
          if (diffDays === 1) {
            streak++;
            lastDate = activityDates[i];
          } else {
            break;
          }
        }
      }
    }

    return {
      hours: totalHours,
      streak,
      certificates: certificates.length,
      saved: wishlist.length,
      // We'll calculate percentages based on mock comparison for now as we don't have historical snapshots
      // In a real app, you'd store monthly snapshots or query by date range.
      growth: {
        hours: 12,
        streak: 5,
        certificates: 18,
        saved: -3
      }
    };
  } catch (error) {
    console.error('Error calculating dashboard stats:', error);
    return {
      hours: 0,
      streak: 0,
      certificates: 0,
      saved: 0,
      growth: { hours: 0, streak: 0, certificates: 0, saved: 0 }
    };
  }
}
