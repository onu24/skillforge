import { Metadata } from 'next';
import Link from 'next/link';
import { SignupForm } from '@/components/auth/signup-form';

export const metadata: Metadata = {
  title: 'Sign Up - SkillForge',
  description: 'Create your SkillForge account to access premium courses',
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <Link href="/" className="inline-block mb-4">
                <div className="text-2xl font-bold text-primary">SkillForge</div>
              </Link>
              <h1 className="text-3xl font-bold mb-2">Create account</h1>
              <p className="text-muted-foreground">
                Join thousands of learners on SkillForge
              </p>
            </div>

            <SignupForm />
          </div>
        </div>

        {/* Right side - Feature highlights */}
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-primary/20 via-background to-background flex-col justify-between p-12">
          <div className="space-y-12">
            <div>
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 border border-primary/30">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Learn at your pace</h3>
              <p className="text-muted-foreground text-sm">
                Access courses anytime, anywhere with lifetime access to course materials
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 border border-primary/30">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Expert instructors</h3>
              <p className="text-muted-foreground text-sm">
                Learn from industry professionals with years of real-world experience
              </p>
            </div>

            <div>
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 border border-primary/30">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Certificates</h3>
              <p className="text-muted-foreground text-sm">
                Earn certificates of completion and showcase your achievements
              </p>
            </div>
          </div>

          <div className="text-muted-foreground text-sm">
            &quot;SkillForge helped me advance my career by providing quality education at an affordable price.&quot; - Sarah
          </div>
        </div>
      </div>
    </div>
  );
}
