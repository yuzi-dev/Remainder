# Development Roadmap - Reminder App

## Status Legend
- [ ] Pending
- [~] In Progress
- [x] Completed

---

## Phase 1: Project Setup & Authentication
- [x] **1.1 Initialization**
    - [x] Initialize Next.js project (TypeScript, Tailwind, App Router).
    - [x] Install ShadCN UI & dependencies (Lucide React, Framer Motion, clsx).
    - [x] Configure ESLint, Prettier, and absolute imports.
- [x] **1.2 Supabase Configuration**
    - [x] Create Supabase project.
    - [x] Set up environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
    - [x] Initialize Supabase Client (Browser & Server clients).
- [x] **1.3 Authentication**
    - [x] Enable Email/Password & Google OAuth in Supabase.
    - [x] Create `/login` and `/signup` pages with forms (React Hook Form + Zod).
    - [x] Implement Auth Middleware (protect `/dashboard`).
    - [x] Create `profiles` table trigger (auto-create profile on signup).

## Phase 2: Database & Core Backend
- [x] **2.1 Database Schema**
    - [x] Define SQL Schema for `reminders` and `categories`.
    - [x] Apply RLS Policies (SELECT, INSERT, UPDATE, DELETE for `auth.uid()`).
    - [x] Run initial migrations.
- [x] **2.2 API / Server Actions**
    - [x] Create Server Actions for Reminder CRUD (`createReminder`, `updateReminder`, etc.).
    - [x] Create Server Actions for Category management.
    - [x] Implement Zod validation pipelines for all actions.

## Phase 3: Core UI & Feature Implementation
- [x] **3.1 Layout & Navigation**
    - [x] Build responsive Sidebar / Navbar.
    - [x] Implement Dark/Light mode toggler.
- [x] **3.2 Dashboard**
    - [x] Create "Today", "Scheduled", "All" summary cards.
    - [x] Implement Reminder List component.
    - [x] Add "Mark as Complete" checkbox interaction.
- [x] **3.3 Create/Edit Flow**
    - [x] Build `ReminderDialog` component (Modal).
    - [x] Implement Date & Time picker.
    - [x] Implement Category selector.

## Phase 4: Advanced Features
- [x] **4.1 File Storage (Audio)**
    - [x] Create Supabase Storage Bucket (`audio-attachments`).
    - [x] Implement Audio Upload component with progress bar.
    - [x] Audio Player component for playback in reminder details.
- [x] **4.2 Realtime Sync**
    - [x] Implement `Supabase.channel` subscription for `reminders` table.
    - [x] Update UI state optimistically or via re-fetch on realtime events.
- [x] **4.3 Search & Filters**
    - [x] Implement client-side or server-side search.
    - [x] Filter by Category, Date, Status.

## Phase 5: Notifications & Background Jobs
- [x] **5.1 In-App Notifications**
    - [x] Setup Toaster (Sonner/Hot-Toast).
    - [x] Trigger alerts on success/error actions.
- [x] **5.2 PWA & Push**
    - [x] Configure `manifest.json`.
    - [x] Register Service Worker.
    - [x] Implement VAPID keys & Push Subscription logic.
- [x] **5.3 Cron Jobs**
    - [x] Write Edge Function to query upcoming reminders.
    - [x] Trigger push notifications via Edge Function.

## Phase 6: Testing, Polish & Deployment
- [x] **6.1 UI Polish**
    - [x] Add Framer Motion animations (list items, page transitions).
    - [x] Verify Mobile responsiveness.
- [x] **6.2 Testing**
    - [x] Manual QA of all user flows.
    - [x] Verify RLS security (attempt access as wrong user).
- [x] **6.3 Deployment**
    - [x] Deploy to Vercel.
    - [x] Configure Environment Variables on Vercel.
    - [x] Verify Production build.

---
**Last Updated:** 2025-12-05
