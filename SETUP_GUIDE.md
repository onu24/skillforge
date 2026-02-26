# SkillForge Setup Guide

## Overview

SkillForge is a premium online learning platform built with Next.js 16, React 19, Firebase, and dual payment integration (Stripe & Razorpay). This guide walks you through the setup and deployment process.

## Prerequisites

- Node.js 18+ and npm/pnpm installed
- Firebase project (free tier eligible)
- Stripe account (for payments)
- Razorpay account (for Indian market support)

## Phase 1 Setup: Environment Variables

### 1. Firebase Setup

Create a Firebase project at [firebase.google.com](https://firebase.google.com):

1. Create a new project
2. Enable Authentication (Email/Password and Google OAuth)
3. Enable Firestore Database
4. Create a web app and copy the configuration

Add these environment variables to your `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
```

### 2. Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Dashboard

Add to `.env.local`:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 3. Razorpay Setup

1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Get your Key ID and Key Secret from Settings

Add to `.env.local`:

```
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

## Firebase Firestore Collections

The application uses the following Firestore collections:

### Collections Schema

```
/users/{userId}
├── email: string
├── displayName: string
├── createdAt: timestamp
└── role: "student" | "instructor"

/courses/{courseId}
├── title: string
├── description: string
├── category: string
├── level: "beginner" | "intermediate" | "advanced"
├── price: number
├── instructorId: string
├── instructorName: string
├── duration: number (minutes)
├── rating: number
├── reviewCount: number
├── enrollmentCount: number
└── lessons: Lesson[]

/lessons/{lessonId}
├── courseId: string
├── title: string
├── description: string
├── duration: number
└── videoUrl: string

/enrollments/{enrollmentId}
├── userId: string
├── courseId: string
├── enrolledAt: timestamp
├── completedAt: timestamp | null
├── progress: number (0-100)
└── lastAccessed: timestamp

/payments/{paymentId}
├── userId: string
├── courseId: string
├── amount: number
├── currency: string
├── status: "pending" | "completed" | "failed"
├── gateway: "stripe" | "razorpay"
├── transactionId: string
└── createdAt: timestamp
```

## Development

### Install Dependencies

```bash
npm install
# or
pnpm install
```

### Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
skillforge/
├── app/
│   ├── page.tsx              # Home page
│   ├── courses/              # Courses listing & details
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   │   ├── page.tsx      # Course details
│   │   │   └── learn/        # Course player
│   │   │       └── page.tsx
│   ├── auth/                 # Authentication
│   │   ├── signup/page.tsx
│   │   └── login/page.tsx
│   ├── dashboard/            # User dashboard
│   │   └── page.tsx
│   ├── api/payments/         # Payment API routes
│   │   ├── stripe/route.ts
│   │   └── razorpay/route.ts
│   └── layout.tsx            # Root layout
├── components/
│   ├── header.tsx            # Navigation header
│   ├── footer.tsx            # Footer
│   ├── course-card.tsx       # Course card component
│   ├── course-browse.tsx     # Course browsing UI
│   ├── checkout-modal.tsx    # Payment checkout
│   ├── firebase-warning.tsx  # Config warning
│   └── auth/                 # Auth components
│       ├── login-form.tsx
│       └── signup-form.tsx
├── lib/
│   ├── firebase.ts           # Firebase initialization
│   ├── auth-context.tsx      # Auth context provider
│   ├── firestore-schemas.ts  # TypeScript interfaces
│   ├── firestore-helpers.ts  # CRUD operations
│   └── payment-utils.ts      # Payment utilities
├── public/                   # Static assets
└── package.json
```

## Key Features

### Authentication
- Email/Password signup and login
- Google OAuth integration
- Protected routes and user session management
- User profile data in Firestore

### Courses
- Browse and search courses by category and level
- Detailed course pages with curriculum
- Course ratings and reviews
- Instructor information

### Enrollment & Payments
- Dual payment gateway (Stripe + Razorpay)
- Secure checkout modal
- Payment verification and order tracking
- Enrollment record keeping

### Learning
- Course player with lesson navigation
- Progress tracking per lesson
- Curriculum sidebar
- Completion badges

### Dashboard
- User profile overview
- Enrolled courses with progress bars
- Learning analytics (placeholder)
- Account settings

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in Settings → Environment Variables
5. Deploy

### Environment Variables on Vercel

Add all the variables from your `.env.local` to Vercel:
- All NEXT_PUBLIC_* variables (public)
- STRIPE_SECRET_KEY (private)
- RAZORPAY_KEY_SECRET (private)

## Production Checklist

- [ ] All Firebase credentials configured
- [ ] Stripe credentials set (use live keys)
- [ ] Razorpay credentials set (use live keys)
- [ ] Email verification enabled
- [ ] Firestore security rules configured
- [ ] Payment success/failure pages created
- [ ] Email notifications set up
- [ ] Analytics integrated
- [ ] SSL certificate enabled
- [ ] Custom domain configured

## Common Issues

### Firebase Configuration Error
**Issue:** "Firebase: Error (auth/invalid-api-key)"
**Solution:** Ensure all NEXT_PUBLIC_FIREBASE_* variables are set in environment variables. The app will show a warning if config is incomplete.

### Payment Gateway Not Working
**Issue:** "Stripe is not configured" / "Razorpay is not configured"
**Solution:** Verify your API keys are correct and properly formatted in environment variables.

### Authentication Not Working
**Issue:** Users can't sign up or login
**Solution:** 
1. Check Firebase Authentication is enabled
2. Verify email/password auth method is enabled
3. Check Firestore rules allow user creation

## Support & Documentation

- Firebase Docs: [firebase.google.com/docs](https://firebase.google.com/docs)
- Next.js Docs: [nextjs.org](https://nextjs.org)
- Stripe Docs: [stripe.com/docs](https://stripe.com/docs)
- Razorpay Docs: [razorpay.com/docs](https://razorpay.com/docs)

## Phase 2 Features (Future)

- Instructor dashboard
- Course creation/editing
- Student reviews and ratings
- Email notifications
- Analytics dashboard
- Admin management panel
- Certificate generation
- Community forums
- Live chat support
