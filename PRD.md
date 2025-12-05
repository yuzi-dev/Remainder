# Product Requirements Document (PRD) - Reminder Web Application

## 1. Executive Summary
Build a fully functional, production-ready Reminder Web Application using Next.js (App Router), TypeScript, TailwindCSS, Supabase, and Vercel. The application will feature a clean, modern, Apple-like minimal UI/UX, real-time synchronization across devices, and PWA support.

## 2. Detailed Feature Requirements

### 2.1 Authentication & User Management
- **Login/Signup**: Email + Password authentication.
- **Social Auth**: Google OAuth integration.
- **Route Protection**: Middleware to secure `/dashboard`, `/settings`, and reminder routes.
- **Profile Management**: Update user details (name, avatar, password).
- **Session Management**: Persist user sessions securely using Supabase Auth.

### 2.2 Core Reminder Features
- **CRUD Operations**: Create, Read, Update, Delete reminders.
- **Reminder Attributes**:
    - Title (required)
    - Description (optional)
    - Category (Work, Personal, Health, Custom)
    - Date & Time (optional/required based on context)
    - Repeat Options (Daily, Weekly, Monthly, Custom Interval)
    - Priority/Flag (Favorite/Star)
    - Status (Active, Completed, Snoozed)
- **Audio Attachments**:
    - Select from pre-defined system tones.
    - Upload custom audio files (stored in Supabase Storage).
- **Organization**:
    - Color-coded categories.
    - Search and Filter functionality.

### 2.3 Realtime & Notifications
- **Realtime Sync**: Instant updates across all open tabs/devices using Supabase Realtime.
- **In-App Notifications**: Pop-up toasts/alerts when a reminder is triggered.
- **Push Notifications**: PWA push notifications for mobile and desktop.
- **Background Jobs**: Cron jobs (Supabase Edge Functions / Vercel Cron) to process scheduled reminders.
- **Email Notifications**: Optional summary or alert emails.

### 2.4 UI/UX
- **Design Language**: Apple-like minimal aesthetic, clean typography, whitespace.
- **Theme**: System-aware Dark/Light mode toggle.
- **Components**: Built with ShadCN UI and Radix Primitives.
- **Animations**: Smooth transitions using Framer Motion (e.g., list reordering, modal entry, completion checkmarks).
- **Responsiveness**: Mobile-first design, fully responsive dashboard.
- **Dashboard Views**:
    - "Today": Focus on immediate tasks.
    - "Upcoming": Future timeline.
    - "Categories": Grid view with counts.
    - "History": Log of completed tasks.

## 3. User Stories & Acceptance Criteria

### 3.1 Authentication
**Story**: As a user, I want to sign up with Google so that I can access the app quickly.
- **AC1**: Clicking "Continue with Google" redirects to Google Auth.
- **AC2**: Successful auth redirects to `/dashboard`.
- **AC3**: New user record is created in `public.users` table (if using custom user table sync).

### 3.2 Create Reminder
**Story**: As a user, I want to create a reminder with a custom sound so I don't miss it.
- **AC1**: "New Reminder" button opens a modal/form.
- **AC2**: User can enter Title, Date, Time, and upload an MP3 file.
- **AC3**: Uploaded file is saved to Supabase Storage; URL is stored in DB.
- **AC4**: Clicking "Save" adds the reminder to the list instantly without refresh.

### 3.3 Realtime Sync
**Story**: As a user, I want my mobile view to update when I complete a task on desktop.
- **AC1**: User marks task as "Done" on Desktop.
- **AC2**: Mobile PWA view reflects the change (moves to completed/hidden) within < 1 second.
- **AC3**: No manual refresh required.

### 3.4 Notifications
**Story**: As a user, I want to receive a push notification even if the app is closed.
- **AC1**: User grants notification permission.
- **AC2**: Service worker receives push payload from server at scheduled time.
- **AC3**: Clicking notification opens the specific reminder details.

## 4. Technical Specifications & Architecture

### 4.1 Tech Stack
- **Frontend**: Next.js 14+ (App Router), React, TypeScript.
- **Styling**: TailwindCSS, ShadCN UI, Framer Motion.
- **State Management**: React Query (TanStack Query) / SWR for server state; Zustand/Context for local UI state.
- **Backend/BaaS**: Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions).
- **Deployment**: Vercel (Frontend + Edge Functions).

### 4.2 Database Schema (High-Level)
- **`profiles`**: Extends auth.users (id, display_name, avatar_url).
- **`reminders`**:
    - `id` (UUID, PK)
    - `user_id` (FK -> profiles.id)
    - `title` (Text)
    - `description` (Text)
    - `due_date` (Timestamptz)
    - `is_completed` (Boolean)
    - `category_id` (FK)
    - `audio_url` (Text)
    - `repeat_rule` (JSON/Text)
    - `created_at`, `updated_at`
- **`categories`**:
    - `id` (UUID)
    - `user_id` (FK)
    - `name` (Text)
    - `color` (Hex)

### 4.3 Security
- **RLS (Row Level Security)**: Strict policies ensuring users can strictly only CRUD their own data.
- **Validation**: Zod schemas for all form inputs and API route payloads.
- **Storage Policies**: Buckets private/authenticated access only.

## 5. Success Metrics & KPIs
- **Core Utility**: % of users creating at least 1 reminder/day.
- **Retention**: Day-7 and Day-30 retention rates.
- **Performance**:
    - LCP (Largest Contentful Paint) < 2.5s.
    - Realtime latency < 500ms.
- **Reliability**: 99.9% uptime for notification delivery.

## 6. Risk Assessment & Mitigation
| Risk | Impact | Mitigation Strategy |
|------|--------|---------------------|
| Notification Delivery Failure | High (Missed reminders) | Implement retry logic; Fallback to email; Use reliable push provider. |
| Realtime Sync Conflicts | Medium | Last-write-wins strategy; Optimistic UI updates. |
| Storage Limits (Audio) | Low | Enforce file size limits (e.g., 5MB); Compress audio on upload. |
| Auth Token Expiry | Medium | Auto-refresh tokens via Supabase client SDK. |

## 7. Timeline & Milestones
1.  **Phase 1: Foundation (Days 1-2)**
    - Project setup, Supabase config, Auth integration.
2.  **Phase 2: Core Logic (Days 3-5)**
    - DB Schema, CRUD API, Basic UI Lists.
3.  **Phase 3: Advanced Features (Days 6-8)**
    - Audio upload, Categories, Realtime Sync.
4.  **Phase 4: Notifications & PWA (Days 9-10)**
    - Service workers, Push API, Edge Functions.
5.  **Phase 5: Polish & Deploy (Days 11-12)**
    - Animations, Dark mode refinement, Vercel deployment.
