'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';

export function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navLinks = [
    { href: '/courses', label: 'Courses' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">SkillForge</div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/courses" className="text-foreground hover:text-primary transition-colors">
              Courses
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          {/* Auth buttons & Mobile Menu Trigger */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <Button asChild variant="ghost" className="text-foreground hover:bg-secondary">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button onClick={handleSignOut} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium hover:text-primary">Log in</Link>
                  <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    <Link href="/signup">Sign up</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Nav */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-11 w-11" aria-label="Toggle Menu">
                  <Menu className="size-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-background border-l-border/70 p-0">
                <SheetHeader className="p-6 border-b border-border/70">
                  <SheetTitle className="text-left text-2xl font-bold text-primary">SkillForge</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 p-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium hover:text-primary transition-colors py-2 border-b border-border/10"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="mt-4 flex flex-col gap-3">
                    {user ? (
                      <>
                        <Button asChild variant="outline" className="w-full h-12 justify-center" onClick={() => setIsOpen(false)}>
                          <Link href="/dashboard">Go to Dashboard</Link>
                        </Button>
                        <Button onClick={handleSignOut} className="w-full h-12 bg-primary text-primary-foreground font-bold">
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button asChild variant="outline" className="w-full h-12 justify-center" onClick={() => setIsOpen(false)}>
                          <Link href="/login">Log in</Link>
                        </Button>
                        <Button asChild className="w-full h-12 bg-primary text-primary-foreground font-bold" onClick={() => setIsOpen(false)}>
                          <Link href="/signup">Sign up Free</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
