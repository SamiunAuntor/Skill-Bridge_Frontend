# SkillBridge Frontend

> **Connect with Expert Tutors, Learn Anything** 🎓

A modern, responsive Next.js application that connects learners with expert tutors. Students can browse tutor profiles, view availability, and book sessions instantly. Built with TypeScript, Tailwind CSS, and Next.js App Router for a seamless user experience.

**[Live Demo](https://skillbridge.vercel.app)** | **[Backend API](https://github.com/SamiunAuntor/Skill-Bridge_Backend)** | **[Backend Repo](#backend-repository)**

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Related Repositories](#related-repositories)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### 🌐 Public Features
- Browse and search tutors by subject, rating, and price
- Advanced filtering by category
- View detailed tutor profiles with reviews and ratings
- Landing page with featured tutors and statistics
- Responsive design optimized for all devices

### 👨‍🎓 Student Features
- User registration and login with email verification
- Book tutoring sessions with available time slots
- View upcoming and past bookings
- Leave reviews and ratings for tutors
- Manage profile and preferences
- Real-time booking status updates

### 👨‍🏫 Tutor Features
- Create and customize tutor profile
- Set and manage availability slots
- View teaching sessions and student details
- Track ratings and student reviews
- Dashboard with session statistics
- Manage subjects and expertise areas

### 🛡️ Admin Features
- Comprehensive user management (ban/unban)
- Manage all bookings and sessions
- Category, subject, and degree management
- Platform analytics and statistics
- User activity monitoring
- System oversight and moderation

### 🎨 UI/UX Features
- Light/dark mode toggle
- Clean, modern design system
- Fully responsive layout
- Consistent spacing and typography
- Smooth animations and transitions
- Accessible components

---

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 16.2.3** - React framework with App Router, SSR/SSG
- **TypeScript** - Static type checking for safer code
- **React 19** - UI library with latest hooks

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **CSS Variables** - Design system with custom properties
- **Material Symbols** - Icon library

### State Management & HTTP
- **React Hooks** - Built-in state management
- **Fetch API** - HTTP client for API calls
- **SWR** - Data fetching with caching and revalidation

### Authentication
- **Better Auth** - Authentication library
- **JWT Tokens** - Secure token-based auth
- **Cookies** - Persistent sessions

### Form & Validation
- **React Hook Form** - Efficient form handling
- **Zod** - Schema validation
- **SweetAlert2** - User feedback and confirmations

### Additional Libraries
- **Swiper** - Touch slider carousel
- **Lucide React** - Modern icon library
- **Date-fns** - Date manipulation and formatting

### Development Tools
- **TypeScript** - Type safety
- **ESLint** - Code quality
- **PostCSS** - CSS transformations

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn installed
- Backend API running (see [Backend Repository](#backend-repository))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SamiunAuntor/skill-bridge-frontend.git
   cd skill-bridge-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Authentication pages (login, register)
│   ├── (dashboard)/              # Protected student/tutor dashboard
│   ├── (main)/                   # Public pages (home, tutors, subjects)
│   ├── layout.tsx                # Root layout with theme support
│   └── globals.css               # Global styles
│
├── Components/                   # Reusable React components
│   ├── Admin/                    # Admin panel components
│   ├── Auth/                     # Authentication components
│   ├── Dashboard/                # Dashboard components
│   ├── LandingPage/              # Homepage sections
│   ├── Layout/                   # Layout components (Navbar, Footer)
│   ├── Tutors/                   # Tutor-related components
│   └── Theme/                    # Theme toggle and providers
│
├── lib/                          # Utility functions and API clients
│   ├── *-api.ts                  # API integration functions
│   ├── auth/                     # Authentication utilities
│   ├── format/                   # Formatting utilities
│   └── dashboard-routes.ts       # Route configuration
│
├── types/                        # TypeScript type definitions
│   ├── admin.ts                  # Admin-related types
│   ├── auth.ts                   # Authentication types
│   └── tutor.ts                  # Tutor-related types
│
├── assets/                       # Static assets (images, icons)
│
├── public/                       # Public static files
│
├── package.json                  # Project dependencies
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── next.config.ts                # Next.js configuration
```

---

## 🔐 Authentication

### How It Works
The frontend implements a secure authentication system using:

1. **JWT Tokens** - Access tokens for API requests
2. **Refresh Tokens** - Automatic token renewal
3. **HTTP-Only Cookies** - Secure token storage
4. **Session Management** - User session persistence

### Login Flow
```
User Input → Validation → API Call → Token Storage → Dashboard
```

### Protected Routes
- Student Dashboard: `/dashboard/*`
- Tutor Dashboard: `/tutor/*`
- Admin Panel: `/admin/*`

Unauthenticated users are automatically redirected to login.

---

## 🎨 Design System

### Color Palette
- **Primary:** `#003358` - Main brand color
- **Secondary:** `#006b5c` - Accent color
- **Error:** `#ba1a1a` - Error states
- **Success:** Green shades for confirmations

### Typography
- **Headlines:** Manrope font family
- **Body:** Inter font family
- **Sizes:** 12px - 28px scale

### Spacing
- Based on 4px grid system
- Consistent padding and margins
- Responsive breakpoints

---

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start development server

# Production
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Import the repository

3. **Configure Environment Variables:**
   - Add `NEXT_PUBLIC_API_URL` in Vercel dashboard
   - Point to your backend API URL

4. **Deploy:**
   - Vercel automatically deploys on push to main

### Deploy to Other Platforms

**Render.com:**
- Push to GitHub
- Connect Render to GitHub
- Set build command: `npm run build`
- Set start command: `npm start`

**Railway.app:**
- Similar process to Render
- Auto-deploys on GitHub push

---

## 🔗 Related Repositories

### Backend Repository
- **Repository:** [Skill-Bridge_Backend](https://github.com/SamiunAuntor/Skill-Bridge_Backend)
- **API Documentation:** See backend README for endpoint details
- **Tech Stack:** Node.js, Express, Prisma, PostgreSQL

**Backend Setup:** Follow the backend repository's README for database and API configuration.

---

## 📊 API Integration

The frontend communicates with the backend API through typed API clients in `/lib`:

### Available API Modules
- `public-api.ts` - Public endpoints (tutors, categories, subjects)
- `auth-api.ts` - Authentication endpoints
- `booking-api.ts` - Booking management
- `student-profile-api.ts` - Student profile management
- `tutor-profile-api.ts` - Tutor profile management
- `admin-api.ts` - Admin operations

### Example Usage
```typescript
import { createBooking } from "@/lib/booking-api";

const booking = await createBooking({
  tutorId: "123",
  slotId: "456"
});
```

---

## 🧪 Testing

### Manual Testing
1. Register as a student
2. Browse tutors and book a session
3. Register as a tutor and set availability
4. Login as admin and manage platform data
5. Test dark mode toggle
6. Test responsive design on mobile

### Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🚨 Error Handling

The frontend implements comprehensive error handling:

- **Validation Errors** - Real-time field validation with messages
- **API Errors** - User-friendly error notifications
- **Loading States** - Clear loading indicators during requests
- **Toast Notifications** - SweetAlert2 for user feedback
- **Fallback UI** - Graceful degradation for network issues

---

## 🔒 Security Best Practices

- **HTTPS Only** - Enforced on production
- **CORS** - Properly configured for API calls
- **XSS Protection** - Input sanitization and React's built-in protections
- **CSRF Protection** - Token-based validation
- **Secure Cookies** - HTTP-only, SameSite flags
- **Role-Based Access** - Frontend route protection

---

## 📱 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Full Support |
| Firefox | 88+ | ✅ Full Support |
| Safari | 14+ | ✅ Full Support |
| Edge | 90+ | ✅ Full Support |
| Mobile Safari | 14+ | ✅ Full Support |
| Chrome Mobile | 90+ | ✅ Full Support |

---

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit changes:** `git commit -m 'Add amazing feature'`
4. **Push to branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Coding Standards
- Follow TypeScript best practices
- Use ESLint configuration
- Write meaningful commit messages
- Update documentation as needed

---

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Samiul Islam Auntor**
- GitHub: [@SamiunAuntor](https://github.com/SamiunAuntor)
- Email: samiul@skillbridge.com

---

## 📞 Support

For issues, questions, or suggestions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include steps to reproduce bugs

---

## 🙏 Acknowledgments

- **Next.js** - React framework and documentation
- **Tailwind CSS** - CSS framework
- **Better Auth** - Authentication library
- **Prisma** - Database ORM
- **All Contributors** - Who helped make this project better

---

**Built with ❤️ for learners and tutors worldwide** 🌍
