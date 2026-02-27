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
  title: 'Privacy Policy - SkillForge',
  description: 'SkillForge privacy policy with clear data collection and usage practices.',
}

export default function PrivacyPage() {
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
                  <BreadcrumbPage>Privacy Policy</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Privacy Policy</h1>
            <p className="mt-3 text-sm text-muted-foreground">Last updated: February 26, 2026</p>
            <p className="mt-4 max-w-3xl text-base text-muted-foreground">
              This Privacy Policy describes how SkillForge collects, uses, discloses, and safeguards your
              information when you use our platform and related services.
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
            <h2 className="mb-3 text-2xl font-semibold">1. Introduction</h2>
            <p className="leading-7 text-muted-foreground">
              SkillForge is committed to respecting and protecting your privacy. By accessing or using the platform,
              you acknowledge the practices described in this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">2. What Information We Collect</h2>
            <p className="leading-7 text-muted-foreground">
              We may collect personal information that you provide directly, including your name, email address,
              billing information, and account credentials. We also collect technical and usage data such as device
              identifiers, browser type, IP address, pages visited, and activity logs.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">3. How We Use Your Information</h2>
            <p className="leading-7 text-muted-foreground">
              We use your information to deliver and improve services, process transactions, support course access,
              provide customer service, personalize learning experiences, and send service-related communications.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">4. Data Protection</h2>
            <p className="leading-7 text-muted-foreground">
              We maintain administrative, technical, and physical safeguards designed to protect your information
              against unauthorized access, disclosure, alteration, or destruction. No transmission method or storage
              system can be guaranteed absolutely secure.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">5. Cookies</h2>
            <p className="leading-7 text-muted-foreground">
              SkillForge uses cookies and similar technologies to maintain sessions, remember preferences, analyze
              traffic, and improve user experience. You may control cookies through your browser settings, though some
              features may be limited if cookies are disabled.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">6. Your Rights</h2>
            <p className="leading-7 text-muted-foreground">
              Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict processing
              of your personal information. You may also request a copy of your data or withdraw consent where
              applicable by contacting us.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-semibold">7. Contact Us</h2>
            <p className="leading-7 text-muted-foreground">
              For privacy-related questions or requests, contact us at{' '}
              <a className="text-primary hover:underline" href="mailto:privacy@skillforge.com">
                privacy@skillforge.com
              </a>
              .
            </p>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  )
}
