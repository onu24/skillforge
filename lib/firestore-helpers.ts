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
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Course, Enrollment, Payment } from './firestore-schemas';

// User helpers
export async function getUserData(uid: string): Promise<User | null> {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
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
    await setDoc(doc(db, 'users', uid), {
      uid,
      email,
      displayName,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      enrolledCourses: [],
    } as User);
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
    await updateDoc(doc(db, 'users', uid), {
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
    const querySnapshot = await getDocs(collection(db, 'courses'));
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
    const docSnap = await getDoc(doc(db, 'courses', courseId));
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
      collection(db, 'courses'),
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
      collection(db, 'enrollments'),
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
    await addDoc(collection(db, 'enrollments'), {
      userId,
      courseId,
      courseName,
      progress: 0,
      completedLessons: [],
      enrollmentDate: Timestamp.now(),
      lastAccessDate: Timestamp.now(),
    } as Omit<Enrollment, 'id'>);

    // Add course to user's enrolledCourses
    const userRef = doc(db, 'users', userId);
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

// Payment helpers
export async function createPayment(paymentData: Omit<Payment, 'id'>): Promise<void> {
  try {
    await addDoc(collection(db, 'payments'), paymentData);
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
    await updateDoc(doc(db, 'payments', paymentId), { status });
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
}
