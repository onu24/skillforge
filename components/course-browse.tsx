'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getAllCourses } from '@/lib/firestore-helpers';
import { Course } from '@/lib/firestore-schemas';
import { sampleCourses } from '@/lib/sample-courses';
import { CourseCard } from './course-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X, Loader2 } from 'lucide-react';
import { CourseGridSkeleton, FilterSpinner } from './skeletons';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CourseBrowse() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch courses on mount ──
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCourses();
      const coursesToUse = data.length > 0 ? data : sampleCourses;
      setCourses(coursesToUse);
      setFilteredCourses(coursesToUse);
    } catch (err) {
      console.error('Error fetching courses:', err);
      const msg = 'Failed to load courses. Please try again.';
      setError(msg);
      toast({
        variant: 'destructive',
        title: 'Network Error',
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // ── Debounce search input (300ms) ──
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setIsFiltering(true);
    toast({
      variant: 'info',
      title: 'Searching...',
      description: `Looking for "${value}"`,
    });
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(value);
      setIsFiltering(false);
    }, 300);
  }, []);

  // ── Apply all filters whenever any filter changes ──
  useEffect(() => {
    let result = courses;

    // Search filter: title, description, instructor name (case-insensitive)
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.trim().toLowerCase();
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(q) ||
          course.description.toLowerCase().includes(q) ||
          course.instructorName.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((course) => course.category === selectedCategory);
    }

    // Level filter
    if (selectedLevel !== 'all') {
      result = result.filter((course) => course.level === selectedLevel);
    }

    setFilteredCourses(result);
  }, [debouncedQuery, selectedCategory, selectedLevel, courses]);

  // ── Derived state ──
  const categories = Array.from(new Set(courses.map((c) => c.category)));
  const levels = ['beginner', 'intermediate', 'advanced'] as const;
  const hasActiveFilters = searchInput.trim() !== '' || selectedCategory !== 'all' || selectedLevel !== 'all';

  const clearAll = () => {
    setSearchInput('');
    setDebouncedQuery('');
    setSelectedCategory('all');
    setSelectedLevel('all');
  };

  return (
    <div className="space-y-6">
      {/* ── Search bar ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by title, description, or instructor..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-10 bg-input border-border text-foreground placeholder:text-muted-foreground h-11"
        />
        {searchInput && (
          <button
            onClick={() => { setSearchInput(''); setDebouncedQuery(''); setIsFiltering(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            {isFiltering ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* ── Filter dropdowns ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={selectedCategory} onValueChange={(val) => {
          setSelectedCategory(val);
          toast({ variant: 'info', title: 'Applying filters...', description: `Category set to ${val === 'all' ? 'All Categories' : val}` });
        }}>
          <SelectTrigger className="bg-input border-border text-foreground h-11">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedLevel} onValueChange={(val) => {
          setSelectedLevel(val);
          toast({ variant: 'info', title: 'Applying filters...', description: `Level set to ${val === 'all' ? 'All Levels' : val.charAt(0).toUpperCase() + val.slice(1)}` });
        }}>
          <SelectTrigger className="bg-input border-border text-foreground h-11">
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Levels</SelectItem>
            {levels.map((level) => (
              <SelectItem key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Active filters + result count ── */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {loading
            ? 'Loading courses...'
            : `Showing ${filteredCourses.length} of ${courses.length} course${courses.length !== 1 ? 's' : ''}`}
        </span>

        {hasActiveFilters && (
          <>
            <span className="text-muted-foreground/40">|</span>
            {debouncedQuery.trim() && (
              <Badge variant="secondary" className="gap-1 text-xs">
                Search: &quot;{debouncedQuery.trim()}&quot;
                <button onClick={() => { setSearchInput(''); setDebouncedQuery(''); }} className="ml-1 hover:text-foreground"><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="gap-1 text-xs">
                {selectedCategory}
                <button onClick={() => setSelectedCategory('all')} className="ml-1 hover:text-foreground"><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {selectedLevel !== 'all' && (
              <Badge variant="secondary" className="gap-1 text-xs capitalize">
                {selectedLevel}
                <button onClick={() => setSelectedLevel('all')} className="ml-1 hover:text-foreground"><X className="w-3 h-3" /></button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground h-7 px-2">
              Clear all
            </Button>
          </>
        )}
      </div>

      {/* ── Course grid ── */}
      {loading ? (
        <CourseGridSkeleton count={6} />
      ) : error ? (
        <div className="bg-[#F44336] border border-[#d32f2f] rounded-lg p-8 text-center text-white">
          <p className="text-lg font-semibold mb-4">{error}</p>
          <Button
            onClick={fetchCourses}
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-white/50"
          >
            Retry Connection
          </Button>
        </div>
      ) : isFiltering ? (
        <FilterSpinner />
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 opacity-50" />
          </div>
          <p className="text-lg font-semibold mb-2">No courses found</p>
          <p className="text-sm mb-6">
            No courses found. Try different keywords or adjust your filters.
          </p>
          <Button variant="outline" onClick={clearAll} className="border-border text-foreground hover:bg-secondary">
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
