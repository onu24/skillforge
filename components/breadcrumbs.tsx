'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbsProps {
    courseName?: string;
}

export function Breadcrumbs({ courseName }: BreadcrumbsProps) {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    // Home is always first
    if (pathname === '/') return null;

    return (
        <div className="bg-background/50 border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/">Home</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>

                        {segments.map((segment, index) => {
                            const href = `/${segments.slice(0, index + 1).join('/')}`;
                            const isLast = index === segments.length - 1;

                            // Custom label mapping
                            let label = segment.charAt(0).toUpperCase() + segment.slice(1);
                            if (segment === 'dashboard') label = 'Dashboard';
                            if (segment === 'courses') label = 'Courses';
                            if (segment === 'about') label = 'About';
                            if (segment === 'contact') label = 'Contact';

                            // Handle course detail page ID -> Course Name
                            if (segments[index - 1] === 'courses' && isLast && courseName) {
                                label = courseName;
                            }

                            return (
                                <div key={href} className="flex items-center gap-1.5 sm:gap-2.5">
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage>{label}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild>
                                                <Link href={href}>{label}</Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                </div>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </div>
    );
}
