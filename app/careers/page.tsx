import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export const metadata: Metadata = {
  title: 'Careers - SkillForge',
  description: 'Help us make education accessible to everyone.',
}

const reasons = [
  'Mission-first team focused on measurable learner outcomes.',
  'Fast feedback loops and high ownership across product and engineering.',
  'Transparent leadership and clear growth paths for every role.',
  'Opportunity to shape the future of online education at scale.',
]

const jobs = [
  {
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-time, Remote',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'New York, NY',
    type: 'Full-time, Remote',
  },
  {
    title: 'Content Marketing Manager',
    department: 'Marketing',
    location: 'Austin, TX',
    type: 'Full-time, Hybrid',
  },
  {
    title: 'Learner Success Specialist',
    department: 'Operations',
    location: 'Remote - US',
    type: 'Full-time, Remote',
  },
]

const values = [
  { title: 'Learner Obsession', text: 'Every decision starts with learner outcomes.' },
  { title: 'Craft Excellence', text: 'We build with quality, rigor, and pride.' },
  { title: 'Ownership', text: 'We take initiative and deliver meaningful results.' },
]

const benefits = [
  'Competitive salary',
  'Health insurance',
  'Flexible schedule',
  'Learning budget',
  'Remote work option',
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main>
        <section className="border-b border-border bg-card/20">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Careers</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Join SkillForge</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Help us make education accessible to everyone.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Why Work Here</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {reasons.map((reason) => (
                <Card key={reason} className="bg-card/50">
                  <CardContent className="pt-6 text-sm text-muted-foreground">{reason}</CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-semibold">Open Positions</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {jobs.map((job) => (
                <Card key={job.title} className="bg-card/60">
                  <CardHeader>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">Department: {job.department}</p>
                    <p className="text-sm text-muted-foreground">Location: {job.location}</p>
                    <p className="text-sm text-muted-foreground">Type: {job.type}</p>
                    <Button className="mt-2 w-full sm:w-auto">Apply Now</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-semibold">Company Culture</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {values.map((value) => (
                <Card key={value.title} className="bg-card/50">
                  <CardHeader>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">{value.text}</CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-semibold">Benefits</h2>
            <div className="flex flex-wrap gap-3">
              {benefits.map((benefit) => (
                <Badge key={benefit} className="px-3 py-1 text-sm">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
