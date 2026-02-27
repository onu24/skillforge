import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export const metadata: Metadata = {
  title: 'Terms of Service - SkillForge',
  description: 'SkillForge terms of service with platform usage and legal conditions.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main>
        <section className="border-b border-border bg-card/20">
          <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Terms of Service</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Terms of Service</h1>
            <p className="mt-3 text-sm text-muted-foreground">Last updated: February 26, 2026</p>
            <p className="mt-4 max-w-3xl text-base text-muted-foreground">
              These Terms of Service govern your use of SkillForge websites, products, and educational services.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
          <section>
            <h2 className="mb-3 text-2xl font-semibold">1. User Agreement</h2>
            <p className="leading-7 text-muted-foreground">
              By creating an account, accessing, or using SkillForge, you agree to these Terms of Service. If you do
              not agree, you must not use the services.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">2. Course Access and Usage</h2>
            <p className="leading-7 text-muted-foreground">
              Course purchases grant a limited, non-exclusive, non-transferable license for personal educational use.
              You may not reproduce, redistribute, publicly display, or commercially exploit course content without
              prior written permission.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">3. User Responsibilities</h2>
            <p className="leading-7 text-muted-foreground">
              You are responsible for maintaining account security and for all activities under your credentials. You
              agree not to misuse the platform, violate applicable law, or interfere with platform integrity.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">4. Intellectual Property</h2>
            <p className="leading-7 text-muted-foreground">
              All platform content, including but not limited to text, media, software, graphics, and trademarks, is
              owned by SkillForge or its licensors and is protected by intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">5. Limitations of Liability</h2>
            <p className="leading-7 text-muted-foreground">
              To the maximum extent permitted by law, SkillForge shall not be liable for indirect, incidental,
              consequential, special, or punitive damages arising out of or related to your use of the services.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">6. Dispute Resolution</h2>
            <p className="leading-7 text-muted-foreground">
              Any dispute arising under these terms will be addressed through good-faith negotiations first. If
              unresolved, disputes may be subject to binding arbitration or adjudication under applicable law.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">7. Termination</h2>
            <p className="leading-7 text-muted-foreground">
              We may suspend or terminate access if you violate these terms or engage in conduct that harms SkillForge,
              our users, or our partners.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">8. Changes to Terms</h2>
            <p className="leading-7 text-muted-foreground">
              We may update these terms periodically. Continued use of the platform after changes become effective
              constitutes acceptance of the revised terms.
            </p>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  )
}
