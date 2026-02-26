import Link from 'next/link';
import { Course } from '@/lib/firestore-schemas';
import { Badge } from '@/components/ui/badge';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`}>
      <div className="group h-full rounded-lg border border-border bg-card hover:border-primary transition-all duration-300 overflow-hidden cursor-pointer">
        {/* Course thumbnail */}
        <div className="relative w-full h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
          <div className="text-4xl font-bold text-primary/20 group-hover:scale-110 transition-transform duration-300">
            {course.title.charAt(0)}
          </div>
        </div>

        {/* Course info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              by {course.instructorName}
            </p>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{course.enrollmentCount} students</span>
            <span>•</span>
            <span>{Math.floor(course.duration / 60)}h content</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(course.rating)
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
            <span className="text-xs text-muted-foreground">
              ({course.reviewCount})
            </span>
          </div>

          {/* Level badge and price */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Badge
              variant="secondary"
              className="capitalize text-xs bg-secondary text-foreground"
            >
              {course.level}
            </Badge>
            <div className="text-lg font-bold text-primary">
              ${course.price}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
