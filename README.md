# College Complaint Management System

A production-grade, secure, multi-role digital platform for college complaint submission, department assignment, state-driven workflow tracking, and resolution feedback.

> 📖 **Roman Hinglish Complete Documentation & Deployment Guide:**  
> Poore project ka workflow aur live deployment guide detail me padhne ke liye [PROJECT_EXPLANATION_AND_DEPLOYMENT_GUIDE_HINGLISH.md](file:///c:/PROJECTS/complaint-management-project/PROJECT_EXPLANATION_AND_DEPLOYMENT_GUIDE_HINGLISH.md) dekhein.

---

## Key Features & Capabilities

### 🎓 Student Portal
- **Registration & Authentication**: Student account registration with roll number validation and secure HTTP-only cookies.
- **Complaint Submission**: Select category, title, description, priority request, and optional secure file attachment (JPG, PNG, PDF, DOCX).
- **Human-Readable Unique ID**: Auto-generates server-side IDs formatted as `CMP-2026-000001`.
- **Real-Time Tracking & Timeline**: Step-by-step public event history tracking. Internal notes are strictly hidden.
- **Resolution & Feedback**: Provide 1–5 star ratings and written feedback once complaints are resolved.

### 🛠️ Department / Staff Portal
- **Assigned Queue**: View complaints belonging strictly to the assigned department.
- **Controlled State Transitions**: Transition status across `PENDING` → `UNDER_REVIEW` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` / `REJECTED`.
- **Public Updates & Internal Notes**: Add public updates for students or private internal notes for staff collaboration.
- **Info Requests**: Request additional information directly from students.

### 👑 Administrator Command Center
- **System Metrics & Analytics**: Total complaints, pending queue, active in-progress count, resolution rates, and average student ratings.
- **User Governance**: Create staff accounts, activate/deactivate users, reset passwords, assign departments.
- **Department & Category CRUD**: Add/edit departments and complaint categories.
- **Security Audit Logging**: Immutable audit log viewer tracking logins, status changes, user creation, and file access.
- **CSV Report Export**: Download system reports for record-keeping.

---

## Security Architecture

1. **Authentication & Password Hashing**: Passwords hashed using `bcrypt` (12 rounds). Session tokens issued via `jose` JWTs in HTTP-only, `SameSite=Lax` cookies.
2. **Role-Based Access Control (RBAC)**: Server-side middleware & RBAC helpers (`lib/rbac.ts`) enforce permissions.
3. **IDOR / BOLA Prevention**: Ownership validation prevents Student A from accessing Student B's complaint data.
4. **Data Leak Prevention**: Internal notes (`isPublic: false`) are filtered out at DB query level for student sessions.
5. **Private File Storage**: Uploaded files stored outside web root in `storage/uploads/`, accessible only via `/api/complaints/[id]/attachment` after authorization.
6. **Input Validation & Rate Limiting**: Zod schemas validate all inputs. In-memory rate limiting blocks brute-force authentication and submission spam.
7. **Security Headers**: Configured with `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and CSP.

---

## Technical Stack

- **Frontend & Backend**: Next.js 14 (App Router), TypeScript, React Server Components & API Routes
- **Styling & UI**: Tailwind CSS, Lucide React icons
- **Database & ORM**: Prisma ORM with SQLite (zero-config local) / PostgreSQL (production ready)
- **Testing**: Vitest test suite

---

## Seed Accounts (Development)

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@college.local` | `Password123!` | Full System Governance |
| **Maintenance Staff** | `maintenance@college.local` | `Password123!` | Maintenance & Facilities |
| **Academic Staff** | `academic@college.local` | `Password123!` | Academic Affairs |
| **Hostel Staff** | `hostel@college.local` | `Password123!` | Hostel Management |
| **Student 1** | `student1@college.local` | `Password123!` | Roll #: CS-2024-042 |
| **Student 2** | `student2@college.local` | `Password123!` | Roll #: EE-2024-118 |

---

## Development Setup & Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Migration & Seed
```bash
npm run db:push
npm run db:seed
```

### 3. Run Automated Tests
```bash
npm test
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
