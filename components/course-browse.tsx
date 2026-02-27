'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getAllCourses } from '@/lib/firestore-helpers';
import { Course } from '@/lib/firestore-schemas';
import { sampleCourses } from '@/lib/sample-courses';
import { CourseCard } from './course-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CourseBrowse() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch courses on mount ──
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getAllCourses();
        const coursesToUse = data.length > 0 ? data : sampleCourses;
        setCourses(coursesToUse);
        setFilteredCourses(coursesToUse);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses(sampleCourses);
        setFilteredCourses(sampleCourses);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // ── Debounce search input (300ms) ──
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(value);
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
            onClick={() => { setSearchInput(''); setDebouncedQuery(''); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Filter dropdowns ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="bg-input border-border text-foreground">
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

        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="bg-input border-border text-foreground">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-lg border border-border bg-card/50 animate-pulse" />
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-primary/50" />
          </div>
          <p className="text-lg font-semibold mb-2">No courses found</p>
          <p className="text-sm text-muted-foreground mb-6">
            Try adjusting your search or filters to find what you&apos;re looking for.
          </p>
          <Button variant="outline" onClick={clearAll} className="border-border text-foreground hover:bg-secondary">
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
