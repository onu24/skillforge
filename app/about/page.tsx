import { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'About Us - SkillForge',
    description: 'Learn about SkillForge, our mission, and the team behind the platform.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            {/* Hero */}
            <section className="relative py-20 md:py-28 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-background to-background" />
                <div className="absolute inset-0">
                    <div className="absolute -top-40 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
                </div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        About{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                            SkillForge
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        We&apos;re on a mission to make premium education accessible to everyone, everywhere.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="py-16 border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                            <p className="text-muted-foreground mb-4 leading-relaxed">
                                SkillForge was founded with a simple belief: quality education should not be limited by geography, background, or budget. We partner with industry-leading professionals to create courses that are practical, up-to-date, and career-focused.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                Whether you&apos;re starting your career or leveling up your skills, SkillForge provides the tools, community, and guidance to help you achieve your goals.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { value: '500+', label: 'Expert-Led Courses' },
                                { value: '50K+', label: 'Active Students' },
                                { value: '100+', label: 'Certified Instructors' },
                                { value: '30+', label: 'Countries Reached' },
                            ].map((stat) => (
                                <div key={stat.label} className="p-6 rounded-lg border border-border bg-card/50 text-center">
                                    <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-16 border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold mb-12 text-center">What We Stand For</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Quality First',
                                description: 'Every course is vetted by our team and taught by verified professionals with real-world experience.',
                                icon: (
                                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ),
                            },
                            {
                                title: 'Accessible Learning',
                                description: 'Affordable pricing, lifetime access, and mobile-friendly content so you can learn on your terms.',
                                icon: (
                                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                ),
                            },
                            {
                                title: 'Community Driven',
                                description: 'Join a global community of learners and instructors who support each other\'s growth.',
                                icon: (
                                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                ),
                            },
                        ].map((value) => (
                            <div key={value.title} className="p-6 rounded-lg border border-border bg-card/50 hover:border-primary transition-all">
                                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 border border-primary/30">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                                <p className="text-muted-foreground">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 border-t border-border bg-gradient-to-r from-primary/10 to-background">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Join the SkillForge Community</h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Start learning today and unlock your potential.
                    </p>
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Link href="/signup">Get Started Free</Link>
                    </Button>
                </div>
            </section>

            <Footer />
        </div>
    );
}
