# 🎓 SkillBridge Frontend

**A modern tutoring marketplace frontend for discovering tutors, booking live sessions, paying securely, and managing role-based dashboards.**

SkillBridge Frontend is the user-facing application of the SkillBridge platform. It is built with **Next.js App Router**, **React 19**, and **TypeScript**, and it delivers the complete product experience for:

- visitors exploring the platform
- students booking tutors
- tutors managing profiles, availability, reviews, and finances
- admins managing users, academic data, bookings, and platform reviews

This repository focuses on the **presentation layer, client-side UX, route protection, payment UI, theme system, dashboard experience, and API integration** with the SkillBridge backend.

## 🌐 Live Links

- **Live App:** https://skill-bridge-frontend-sooty.vercel.app/
- **Backend API:** https://skill-bridge-backend-vn0x.onrender.com/
- **Frontend Repository:** https://github.com/SamiunAuntor/Skill-Bridge_Frontend
- **Backend Repository:** https://github.com/SamiunAuntor/Skill-Bridge_Backend

## ✨ Frontend at a Glance

| Area | Highlights |
|---|---|
| Public Experience | Landing page, tutor discovery, subject discovery, about page |
| Auth | Login, registration, verify-pending, forgot password, reset password |
| Student Tools | Sessions, notifications, profile, payment results |
| Tutor Tools | Profile management, availability, reviews, finances, sessions |
| Admin Tools | Users, bookings, categories, subjects, degrees, platform reviews |
| Payments | Stripe Elements checkout, hold expiry handling, success/failure pages |
| UX | Dark/light mode, responsive layout, notification panel, error fallbacks |

## 🧰 Main Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** | App Router, SSR, ISR, rewrites, layouts |
| **React 19** | Interactive UI and client components |
| **TypeScript** | Type-safe application code |
| **Tailwind CSS 4** | Styling and layout system |
| **React Hook Form** | Form state handling |
| **Zod** | Frontend validation and parsing |
| **Better Auth** | Session-aware auth integration with backend |
| **Stripe Elements** | Secure payment form rendering |
| **Lucide React** | Icon system |
| **SweetAlert2** | Dialogs and confirmations |
| **Recharts** | Dashboard charts |
| **Swiper** | Carousel-based UI sections |

## 📚 Table of Contents

- [1. Product Overview](#1-product-overview)
- [2. Core Features](#2-core-features)
- [3. Detailed Feature Breakdown](#3-detailed-feature-breakdown)
- [4. User Roles and Access Model](#4-user-roles-and-access-model)
- [5. Frontend Architecture](#5-frontend-architecture)
- [6. Rendering Strategy](#6-rendering-strategy)
- [7. Authentication and Session Flow](#7-authentication-and-session-flow)
- [8. Booking and Payment Flow](#8-booking-and-payment-flow)
- [9. Stripe Integration](#9-stripe-integration)
- [10. Upload and Media Flow](#10-upload-and-media-flow)
- [11. Notification Experience](#11-notification-experience)
- [12. Theme System and UI Notes](#12-theme-system-and-ui-notes)
- [13. Validation Strategy](#13-validation-strategy)
- [14. Tech Stack Table](#14-tech-stack-table)
- [15. External Services](#15-external-services)
- [16. Project Structure](#16-project-structure)
- [17. Route Map](#17-route-map)
- [18. Frontend Environment Variables](#18-frontend-environment-variables)
- [19. Local Installation Guide](#19-local-installation-guide)
- [20. Scripts](#20-scripts)
- [21. API Integration Overview](#21-api-integration-overview)
- [22. Current Demo Limitations](#22-current-demo-limitations)
- [23. Deployment Notes](#23-deployment-notes)

## 1. Product Overview

SkillBridge is a tutoring marketplace that connects students with tutors across academic and technical subjects. The frontend is responsible for:

- presenting the marketing and discovery experience
- collecting form input from visitors, students, tutors, and admins
- protecting role-based dashboard routes
- guiding users through booking and payment flows
- visualizing sessions, reviews, notifications, and platform content
- coordinating all user-facing interactions with the backend API

The application is structured around three major route groups:

- **Public routes** for landing, tutors, subjects, and about pages
- **Auth routes** for login, registration, verification, and password recovery
- **Dashboard routes** for student, tutor, and admin experiences

## 2. Core Features

### Public Platform Features

- Responsive landing page with hero, stats, featured tutors, subjects, trust, and CTA sections
- Tutor search and discovery
- Tutor detail pages with bookable availability
- Subject discovery and subject detail pages
- Public platform reviews and trust content

### Authentication Features

- Email/password login
- Registration with role selection
- Verify-pending experience
- Forgot-password form
- Reset-password form
- Session-aware navbar and dashboard shell

### Student Features

- Student dashboard home
- Student profile editing
- Session list
- Notification center
- Tutor booking and payment
- Review submission and review editing after sessions

### Tutor Features

- Tutor dashboard home
- Tutor profile display and edit flow
- Availability management
- Sessions page
- Reviews page
- Finances page
- Tutor notifications

### Admin Features

- Dashboard overview
- Users moderation
- Bookings visibility
- Categories CRUD
- Subjects CRUD
- Degrees CRUD
- Platform review moderation

### Platform UX Features

- Responsive layouts
- Light and dark theme support
- Notification bell with mobile-safe dropdown
- Protected dashboards with server-side redirects
- Payment success/failure/result states
- Public-page fallback rendering when live backend data is unavailable

## 3. Detailed Feature Breakdown

### 3.1 Landing Page

The landing page is built from reusable sections:

- `Hero`
- `StatsSection`
- `FeaturedTutorsSection`
- `SubjectsSection`
- `TrustSection`
- `CtaSection`

The page fetches public backend data through `getLandingPageData()` and uses safe fallback data when the backend request fails. This keeps the home page renderable even when public API data is temporarily unavailable.

### 3.2 Tutor Discovery

Tutor discovery supports:

- search text
- query-based filtering
- category-related filtering
- sorting options
- navigation to detailed tutor pages

These pages are designed to help students explore tutors before committing to a booking.

### 3.3 Tutor Detail and Booking Entry

Tutor detail pages combine:

- tutor summary
- public education information
- subject expertise
- availability slots
- student booking sidebar
- reviews and trust content

This page is the main booking conversion point in the product.

### 3.4 Subject Discovery

Subjects appear in:

- landing page feature sections
- the dedicated `/subjects` page
- individual subject detail pages

The subject card system is reusable and theme-aware, and the subject pages help users explore tutoring domains before entering the tutor discovery flow.

### 3.5 Student Dashboard

Student dashboard pages provide:

- dashboard overview
- personal profile settings
- sessions list
- notifications

Students also interact with review creation/editing after valid sessions.

### 3.6 Tutor Dashboard

Tutor dashboard pages provide:

- dashboard summary
- profile management
- availability scheduling
- sessions list
- reviews visibility
- finances overview
- notifications

The tutor profile UX currently uses a read-only presentation with a dedicated edit entry point instead of always-on live editing.

### 3.7 Admin Dashboard

Admin tools expose:

- platform overview
- users management
- bookings listing
- categories CRUD
- subjects CRUD
- degrees CRUD
- platform review moderation

These pages are implemented in the frontend as role-scoped dashboard pages backed by admin API clients.

### 3.8 Notifications

Notification experience includes:

- unread notification badge
- dashboard bell dropdown
- full notifications page
- mark single notification as read
- mark all notifications as read

### 3.9 Payments

The payment flow supports:

- loading checkout status from backend
- rendering Stripe Elements securely
- resuming valid checkout state
- handling expired hold sessions
- redirecting users through success and failure pages
- re-verifying payment state after checkout

## 4. User Roles and Access Model

The platform uses three application roles:

| Role | Purpose |
|---|---|
| `student` | books sessions, manages profile, reviews tutors |
| `tutor` | manages profile, availability, sessions, reviews, finances |
| `admin` | moderates users and platform academic/content data |

### Frontend Access Behavior

- Public routes are open to everyone.
- Dashboard routes are protected on the server.
- Each dashboard role has its own layout boundary.
- Wrong-role access is redirected to the correct dashboard root.
- Missing session redirects users to `/login?next=/dashboard`.

## 5. Frontend Architecture

The frontend is built around **Next.js App Router** with a mix of server and client components.

### Main architectural ideas

- **Server-side route protection** for dashboard access
- **Client components for interaction-heavy views**
- **Reusable API clients** inside `src/lib`
- **Component groups** organized by domain
- **Feature-specific route trees** under the App Router

### Main source areas

| Folder | Responsibility |
|---|---|
| `src/app` | route tree, layouts, page entry points |
| `src/Components` | UI components grouped by domain |
| `src/lib` | API clients, auth helpers, utility logic, validation |
| `src/types` | shared TypeScript types |
| `src/assets` | local visual assets |

## 6. Rendering Strategy

The app uses a hybrid rendering model.

### Server-rendered areas

- dashboard route protection
- public page data fetch entry points
- route-level composition for App Router pages

### Client-rendered areas

- forms
- modals
- payment form
- theme toggle
- notification interactions
- dashboard widgets with user interaction

### ISR / Revalidation

The public landing page currently uses:

- `revalidate = 60`

This allows the public page to refresh cached data periodically without requiring a fully dynamic render for every request.

## 7. Authentication and Session Flow

### Current Auth UX

- register
- login
- logout
- verify-pending
- forgot password
- reset password

### Session Model

- the backend owns the session
- browser requests include cookies
- dashboard route protection happens on the server
- client state updates through auth change events

### Important Current Behavior

Because the current deployment does not reliably deliver outbound email on the free tier:

- **verify-pending** shows a red demo notice
- **forgot-password** shows a red demo notice
- **registration still routes through the normal verify-pending UX**
- **signup is currently demo-friendly because backend runtime temporarily marks new accounts as verified**

This keeps the product self-serve for demos while preserving the email-related screens and feature structure for later production hardening.

## 8. Booking and Payment Flow

### High-level Booking Flow

1. Student opens a tutor detail page.
2. Student chooses a subject.
3. Student chooses an availability slot.
4. Frontend triggers backend payment intent creation.
5. Backend creates a temporary booking hold.
6. User is taken to `/payment/checkout/[bookingId]`.
7. Stripe Elements renders the payment UI.
8. Success or failure pages confirm the final state.

### Frontend Payment Pages

| Route | Purpose |
|---|---|
| `/payment/checkout/[bookingId]` | secure payment entry |
| `/payment/success` | payment verification and confirmation |
| `/payment/failed` | cancelled/failed state |

### Important UX Behaviors

- checkout status is reloaded from backend
- expired holds show a clear fallback state
- cancelled sessions redirect safely
- already-paid sessions continue to confirmation
- processing states are retried before final result rendering

## 9. Stripe Integration

Stripe integration on the frontend is centered around:

- `@stripe/react-stripe-js`
- `@stripe/stripe-js`
- a Stripe publishable key from environment variables
- a checkout session payload returned by backend

### Main payment components

| File | Purpose |
|---|---|
| `src/Components/Payment/PaymentCheckoutClient.tsx` | loads checkout state and renders Stripe Elements |
| `src/Components/Payment/PaymentElementForm.tsx` | card/payment form interaction |
| `src/Components/Payment/PaymentResultClient.tsx` | re-checks final payment status |
| `src/lib/payment-api.ts` | payment API communication |
| `src/lib/payment-checkout.ts` | stored checkout session helpers |
| `src/lib/stripe.ts` | Stripe client bootstrap |

### Why this matters in docs

The frontend does not confirm money movement by itself. It displays states based on backend-confirmed payment data and Stripe Elements interaction.

## 10. Upload and Media Flow

The frontend integrates with Cloudinary-backed backend uploads.

### Media-related frontend responsibilities

- gather selected files
- send files to upload endpoints
- receive URLs/public IDs back from backend
- update profile-related forms and stored values

### Frontend env usage

The frontend exposes only the public-facing Cloudinary and Stripe values needed for client-side behavior.

## 11. Notification Experience

The notification system is visible in two main places:

- dashboard header bell dropdown
- dedicated notifications pages in student/tutor dashboards

### Notification features

- unread count
- recent list
- read-one action
- read-all action
- responsive dropdown behavior

### Current UX note

The mobile notification dropdown was recently adjusted to avoid viewport cutoff in smaller screens.

## 12. Theme System and UI Notes

The app supports both light and dark themes.

### Theme-related building blocks

- CSS variables in `globals.css`
- a dedicated theme toggle component
- theme-aware reusable classes
- client-side theme switching

### UI direction

The platform uses a soft, rounded, dashboard-oriented visual system with:

- large cards
- rounded buttons
- accent capsules
- role-specific dashboards
- high-contrast headings

## 13. Validation Strategy

Frontend validation is handled in two layers:

### 13.1 Form Validation

Forms use:

- `react-hook-form`
- `zod`
- `@hookform/resolvers`

### 13.2 Utility/Data Parsing

Shared validation utilities live in:

- `src/lib/validation/app-schemas.ts`

Current schema coverage includes:

- tutor search params
- subjects search params
- platform review input
- student profile update shape
- availability slot input
- stored payment checkout session parsing

### Auth forms with validation

- login
- register
- forgot password
- reset password
- verify-pending actions

## 14. Tech Stack Table

### Frontend technologies

| Category | Technology | Role in Project |
|---|---|---|
| Framework | Next.js 16.2.3 | App Router, layouts, pages, rewrites |
| UI Library | React 19.2.4 | interactive interface |
| Language | TypeScript | typed application code |
| Styling | Tailwind CSS 4 | layout, spacing, design system |
| Form State | React Hook Form | form control |
| Validation | Zod | client validation and parsing |
| Icons | Lucide React | iconography |
| Alerts | SweetAlert2 | dialogs and warnings |
| Charts | Recharts | analytics and dashboard charts |
| Carousel | Swiper | sliders and showcase sections |
| Auth Integration | Better Auth client usage | auth-related actions |
| Payment UI | Stripe Elements | secure payment form rendering |

## 15. External Services

| Service | Used For | Frontend Role |
|---|---|---|
| SkillBridge Backend API | all business logic and persistence | route consumption via `/api/*` |
| Stripe | payment form and card handling | checkout UI |
| Cloudinary | media flow | image-related client config |
| Better Auth | auth workflows | forgot/reset/verify interactions |

## 16. Project Structure

```text
skill-bridge_frontend/
|- public/
|- scripts/
|  |- smoke-tests.mjs
|- src/
|  |- app/
|  |  |- globals.css
|  |  |- layout.tsx
|  |  |- not-found.tsx
|  |  |- icon.png
|  |  |- (main)/
|  |  |  |- layout.tsx
|  |  |  |- loading.tsx
|  |  |  |- error.tsx
|  |  |  |- page.tsx
|  |  |  |- about/page.tsx
|  |  |  |- tutors/page.tsx
|  |  |  |- tutors/[id]/page.tsx
|  |  |  |- subjects/page.tsx
|  |  |  |- subjects/[slug]/page.tsx
|  |  |  |- payment/checkout/[bookingId]/page.tsx
|  |  |  |- payment/success/page.tsx
|  |  |  |- payment/failed/page.tsx
|  |  |- (auth)/
|  |  |  |- layout.tsx
|  |  |  |- login/page.tsx
|  |  |  |- login/login-form.tsx
|  |  |  |- register/page.tsx
|  |  |  |- register/register-form.tsx
|  |  |  |- forgot-password/page.tsx
|  |  |  |- forgot-password/forgot-password-form.tsx
|  |  |  |- reset-password/page.tsx
|  |  |  |- reset-password/reset-password-form.tsx
|  |  |  |- verify-pending/page.tsx
|  |  |  |- verify-pending/verify-pending-actions.tsx
|  |  |- (dashboard)/
|  |  |  |- dashboard/layout.tsx
|  |  |  |- dashboard/loading.tsx
|  |  |  |- dashboard/page.tsx
|  |  |  |- dashboard/student/
|  |  |  |  |- layout.tsx
|  |  |  |  |- page.tsx
|  |  |  |  |- notifications/page.tsx
|  |  |  |  |- profile/page.tsx
|  |  |  |  |- sessions/page.tsx
|  |  |  |- dashboard/tutor/
|  |  |  |  |- layout.tsx
|  |  |  |  |- page.tsx
|  |  |  |  |- availability/page.tsx
|  |  |  |  |- finances/page.tsx
|  |  |  |  |- notifications/page.tsx
|  |  |  |  |- profile/page.tsx
|  |  |  |  |- reviews/page.tsx
|  |  |  |  |- sessions/page.tsx
|  |  |  |- dashboard/admin/
|  |  |  |  |- layout.tsx
|  |  |  |  |- page.tsx
|  |  |  |  |- bookings/page.tsx
|  |  |  |  |- categories/page.tsx
|  |  |  |  |- degrees/page.tsx
|  |  |  |  |- platform-reviews/page.tsx
|  |  |  |  |- subjects/page.tsx
|  |  |  |  |- users/page.tsx
|  |- Components/
|  |  |- Admin/
|  |  |- Auth/
|  |  |- Dashboard/
|  |  |- LandingPage/
|  |  |- Layout/
|  |  |- Notifications/
|  |  |- Payment/
|  |  |- Reviews/
|  |  |- Shared/
|  |  |- Subjects/
|  |  |- Theme/
|  |  |- Tutors/
|  |- lib/
|  |  |- auth/
|  |  |- validation/
|  |  |- admin-api.ts
|  |  |- api-client.ts
|  |  |- api-url.ts
|  |  |- booking-api.ts
|  |  |- booking-server.ts
|  |  |- notification-api.ts
|  |  |- payment-api.ts
|  |  |- payment-checkout.ts
|  |  |- public-api.ts
|  |  |- public-page-fallbacks.ts
|  |  |- student-profile-api.ts
|  |  |- stripe.ts
|  |  |- tutor-api.ts
|  |  |- tutor-profile-api.ts
|  |  |- upload-image.ts
|  |- types/
|  |- assets/
|- .env.example
|- next.config.ts
|- package.json
|- README.md
```

## 17. Route Map

### Public Routes

| Route | Description |
|---|---|
| `/` | landing page |
| `/about` | about platform |
| `/tutors` | tutor discovery |
| `/tutors/[id]` | tutor detail and booking entry |
| `/subjects` | subjects listing |
| `/subjects/[slug]` | subject detail |

### Auth Routes

| Route | Description |
|---|---|
| `/login` | sign-in page |
| `/register` | registration page |
| `/verify-pending` | verification guidance and resend actions |
| `/forgot-password` | password reset request |
| `/reset-password` | set a new password |

### Payment Routes

| Route | Description |
|---|---|
| `/payment/checkout/[bookingId]` | Stripe Elements checkout |
| `/payment/success` | final payment result |
| `/payment/failed` | failed/cancelled payment page |

### Dashboard Routes

| Route Group | Description |
|---|---|
| `/dashboard` | shared dashboard shell |
| `/dashboard/student/*` | student pages |
| `/dashboard/tutor/*` | tutor pages |
| `/dashboard/admin/*` | admin pages |

## 18. Frontend Environment Variables

The frontend currently uses the following public environment variables.

### `.env.example`

```env
NEXT_PUBLIC_CLOUDINARY_URL=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_API_KEY=

# Payment Gateway
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:5000
```

### Variable Guide

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_CLOUDINARY_URL` | client-facing Cloudinary configuration |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | Cloudinary public API key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for Elements |
| `NEXT_PUBLIC_API_BASE_URL` | backend origin used by Next rewrites |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | alternate backend origin used by rewrites |

### Important Production Note

`next.config.ts` throws in production if neither `NEXT_PUBLIC_API_BASE_URL` nor `NEXT_PUBLIC_BETTER_AUTH_URL` is defined, because the frontend relies on rewrites for `/api/*` requests.

## 19. Local Installation Guide

### Prerequisites

- Node.js 18+
- npm
- backend project running locally

### Install dependencies

```bash
npm install
```

### Create local env file

Create `.env.local` in the frontend project and copy values from `.env.example`.

### Run development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Production build locally

```bash
npm run build
npm run start
```

## 20. Scripts

| Script | What It Does |
|---|---|
| `npm run dev` | starts Next.js development server |
| `npm run build` | creates a production build |
| `npm run start` | serves the production build |
| `npm run lint` | runs ESLint |
| `npm run test` | runs the small smoke-test script |

## 21. API Integration Overview

The frontend talks to the backend through domain-specific API clients in `src/lib`.

### Main API client files

| File | Responsibility |
|---|---|
| `api-client.ts` | shared request/error handling |
| `api-url.ts` | runtime API origin helpers |
| `public-api.ts` | landing, subject, and public listing data |
| `booking-api.ts` | sessions and booking-related requests |
| `payment-api.ts` | payment status and checkout helpers |
| `tutor-api.ts` | public tutor listing and detail data |
| `tutor-profile-api.ts` | tutor profile editing |
| `student-profile-api.ts` | student profile editing |
| `notification-api.ts` | notifications |
| `admin-api.ts` | admin pages |
| `upload-image.ts` | upload/delete media |

### Backend route groups consumed by the frontend

| Endpoint Group | Frontend Usage |
|---|---|
| `/api/auth/*` | login, register, session, logout, password reset |
| `/api/public/*` | landing and subject pages |
| `/api/tutors/*` | tutor discovery and tutor profile |
| `/api/students/*` | student profile updates |
| `/api/availability/*` | tutor availability and public slot display |
| `/api/bookings/*` | sessions and session actions |
| `/api/payments/*` | create/verify Stripe checkout state |
| `/api/notifications/*` | notification feed and unread count |
| `/api/reviews/*` | tutor reviews |
| `/api/platform-reviews/*` | public platform reviews |
| `/api/admin/*` | admin dashboards and CRUD sections |
| `/api/uploads/*` | media uploads |

## 22. Current Demo Limitations

The deployed frontend is suitable for showcasing the system, but it is not pretending to be a fully paid production environment yet.

### Current known demo-specific conditions

- outbound email delivery is not reliably available on the free deployment
- verify-pending and forgot-password pages show a red demo notice
- registration flow still routes through the normal verification screen
- newly created users are made demo-usable by backend runtime verification bypass
- payment and notification workflows still depend on backend runtime stability

### Why this matters

These demo notes keep the UI honest while allowing self-serve review by users, instructors, or investors.

## 23. Deployment Notes

### Current deployment targets

| Service | Link |
|---|---|
| Frontend App | https://skill-bridge-frontend-sooty.vercel.app/ |
| Backend API | https://skill-bridge-backend-vn0x.onrender.com/ |
| Frontend Repository | https://github.com/SamiunAuntor/Skill-Bridge_Frontend |
| Backend Repository | https://github.com/SamiunAuntor/Skill-Bridge_Backend |

### Frontend hosting summary

- hosted on **Vercel**
- uses **Next.js production build**
- relies on **Next rewrites** to forward `/api/*` to backend
- expects valid public env values at build/deploy time

---

If you are reviewing SkillBridge from the frontend side, this repository is the best place to understand the user journey, UX architecture, route structure, and integration surface with Stripe, Cloudinary, Better Auth, and the SkillBridge backend.
