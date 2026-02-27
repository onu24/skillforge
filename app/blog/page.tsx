import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export const metadata: Metadata = {
  title: 'Blog - SkillForge',
  description: 'Learn from industry experts and stay updated with SkillForge blog posts.',
}

const posts = [
  {
    title: 'Build Better APIs with Next.js Route Handlers',
    author: 'Ava Kim',
    date: 'January 14, 2026',
    category: 'Web Dev',
    excerpt: 'A practical walkthrough for building fast, secure API endpoints with modern patterns.',
  },
  {
    title: 'Design Systems That Scale Across Teams',
    author: 'Noah Patel',
    date: 'January 10, 2026',
    category: 'Design',
    excerpt: 'How to standardize components, tokens, and workflows without slowing product velocity.',
  },
  {
    title: 'From Side Project to Sustainable Product',
    author: 'Liam Chen',
    date: 'January 4, 2026',
    category: 'Business',
    excerpt: 'Early-stage strategies to validate demand, price effectively, and retain initial customers.',
  },
  {
    title: 'Modern CSS Layout Patterns You Should Know',
    author: 'Maya Rivers',
    date: 'December 28, 2025',
    category: 'Web Dev',
    excerpt: 'A collection of reliable CSS techniques for responsive dashboards, cards, and content flows.',
  },
  {
    title: 'Designing Onboarding Flows that Convert',
    author: 'Ethan Brooks',
    date: 'December 17, 2025',
    category: 'Design',
    excerpt: 'Use friction audits, progress cues, and concise copy to improve activation in your product.',
  },
  {
    title: 'Metrics Every Course Business Should Track',
    author: 'Sofia James',
    date: 'December 9, 2025',
    category: 'Business',
    excerpt: 'The key metrics behind course growth, including CAC, completion rates, and churn signals.',
  },
]

const categories = ['All', 'Web Dev', 'Design', 'Business']

export default function BlogPage() {
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
                  <BreadcrumbPage>Blog</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">SkillForge Blog</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Learn from industry experts and stay updated.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:px-8">
          <aside className="lg:col-span-3">
            <div className="rounded-xl border border-border bg-card/40 p-5">
              <h2 className="mb-4 text-base font-semibold">Category Filter</h2>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category}>
                    <button
                      type="button"
                      className="w-full rounded-md border border-border px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="lg:col-span-9">
            <div className="mb-6">
              <label htmlFor="blog-search" className="mb-2 block text-sm font-medium text-muted-foreground">
                Search posts
              </label>
              <Input id="blog-search" type="search" placeholder="Search by title, author, or keyword..." />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <Card key={post.title} className="overflow-hidden border-border/80 bg-card/60 py-0">
                  <div className="h-40 w-full bg-gradient-to-br from-primary/30 via-primary/10 to-background" />
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <Badge>{post.category}</Badge>
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                    </div>
                    <CardTitle className="text-lg leading-snug">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">By {post.author}</p>
                    <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                  </CardContent>
                  <CardFooter>
                    <Link href="#" className="text-sm font-medium text-primary hover:underline">
                      Read More
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-2">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <Button size="sm">1</Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
