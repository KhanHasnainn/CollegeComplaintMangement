# 📘 College Complaint Management System - Complete Guide & Deployment Manual (Roman Hinglish)

> **Yeh document iss project ki complete A to Z guide hai.** Isme project ka working mechanism, architecture, roles, state machine, database models, security features, local development setup, aur **production deployment guide** (Vercel, Supabase, Neon, Railway, VPS) sab kuch detail me Roman Hinglish me explain kiya gaya hai.

---

## 📑 Index (Table of Contents)
1. [Project Overview (Yeh Project Kya Hai?)](#1-project-overview-yeh-project-kya-hai)
2. [Key User Roles & Permissions (Student, Staff, Admin)](#2-key-user-roles--permissions)
3. [Complaint Ki Complete Lifecycle (End-to-End Workflow)](#3-complaint-ki-complete-lifecycle)
4. [State Machine Rules (Status Transitions Kaise Kaam Karti Hain?)](#4-state-machine-rules)
5. [Tech Stack & Architecture](#5-tech-stack--architecture)
6. [Folder Structure Ka Detail Breakdown](#6-folder-structure-ka-detail-breakdown)
7. [Database Schema & Models (Prisma ORM)](#7-database-schema--models)
8. [Security & Protection Mechanisms (Project Secure Kaise Hai?)](#8-security--protection-mechanisms)
9. [Pre-configured Test Accounts (Seed Logins)](#9-pre-configured-test-accounts)
10. [Local Development Setup (Apne Laptop Pe Kaise Chalayein?)](#10-local-development-setup)
11. [Full Production Deployment Guide](#11-full-production-deployment-guide)
    - [Option A: Vercel + Supabase / Neon (Serverless PostgreSQL) - Recommended](#option-a-vercel--supabase--neon-recommended)
    - [Option B: Railway / Render (Containerized with Persistent Disk)](#option-b-railway--render)
    - [Option C: Self-Hosted Linux VPS (Ubuntu + Nginx + PM2 + SSL)](#option-c-self-hosted-linux-vps)
12. [Production Environment Variables Reference](#12-production-environment-variables-reference)
13. [Troubleshooting & Common Production Issues (FAQs)](#13-troubleshooting--common-production-issues)

---

## 1. Project Overview (Yeh Project Kya Hai?)

Colleges aur universities me traditional complaint process bohot slow aur unorganized hota hai - students application likhte hain, warden ya HOD ke office ke chakkar kaat te hain, WhatsApp groups me messages gum ho jaate hain, aur kisi ko pata nahi hota ki problem kab solve hogi.

**College Complaint Management System** ek modern, production-grade web application hai jo iss poore process ko digital aur transparent bana deta hai:
- **Zero Paperwork:** Students online complaint file karte hain photo/document proofs ke sath.
- **Department-Wise Auto-Routing:** Category select karte hi complaint automatic sahi department (Maintenance, IT, Hostel, Academics) ko assign ho jaati hai.
- **Real-Time Tracking & Transparency:** Student ko timeline pe step-by-step progress dikhti hai.
- **Accountability:** Staff aur admin ka har action audit log me record hota hai.
- **Student Satisfaction:** Complaint resolve hone ke baad student 1-5 star rating aur review de sakta hai.

---

## 2. Key User Roles & Permissions

Iss system me **3 primary roles** hain. Har role ki permissions aur boundaries strictly define ki gayi hain:

```
+-------------------------------------------------------------------+
|                        ROLE-BASED ACCESS (RBAC)                   |
+-------------------+-----------------------+-----------------------+
|    🎓 STUDENT     |   🛠️ STAFF/DEPARTMENT |       👑 ADMIN        |
+-------------------+-----------------------+-----------------------+
| • Register/Login  | • View Dept Queue     | • Full System Access  |
| • Raise Complaint | • Update Status       | • Reassign Complaints |
| • Track Own Status| • Add Public Updates  | • Manage Users/Staff  |
| • Upload Proofs   | • Add Internal Notes  | • Manage Depts & Cats |
| • Give Feedback   | • Request More Info   | • View Audit Logs     |
| • Reopen Issues   | • Resolve/Reject      | • Export CSV Reports  |
+-------------------+-----------------------+-----------------------+
```

### 1. 🎓 Student (Vidyarthi)
- **Koun hai:** College ka enrolled student jo apni problems report karna chahta hai.
- **Kya kar sakta hai:**
  - Email aur Roll Number ke sath account create (Register) kar sakta hai.
  - New complaint submit kar sakta hai (Title, Description, Category, Priority, Attachment jaise JPG, PNG, PDF, DOCX).
  - Har complaint ka human-readable tracking ID milta hai (e.g. `CMP-2026-000001`).
  - Apni submitted complaints ki list aur real-time public timeline dekh sakta hai.
  - Complaint solve hone ke baad **1 to 5 Star Rating** aur feedback review likh sakta hai.
  - Agar problem thik se solve nahi hui toh complaint ko **Reopen** kar sakta hai.
- **Kya NAHI kar sakta:**
  - Dusre students ki complaints nahi dekh sakta (Protected against IDOR).
  - Staff ke internal confidential notes nahi dekh sakta.
  - Admin settings ya doosre departments ka data access nahi kar sakta.

### 2. 🛠️ Staff / Department Member (Karmachari / Officer)
- **Koun hai:** Kisi specific department ka staff member (e.g., Electrician, IT admin, Hostel warden, Academic coordinator).
- **Kya kar sakta hai:**
  - Login karke apne assigned department ki complaints ka queue dekh sakta hai.
  - Status ko step-by-step update kar sakta hai (`UNDER_REVIEW` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` / `REJECTED`).
  - **Public Updates:** Aise updates post karna jo student ko timeline me dikhe (e.g., *"Technician dispatched with replacement fan"*).
  - **Internal Notes:** Private notes post karna jo sirf staff aur admin dekh sakte hain (student ko nahi dikhenge).
  - **Info Request:** Agar student se room number ya extra detail chahiye, toh status `WAITING_FOR_STUDENT` set karke message bhej sakta hai.
  - Resolution message likhkar complaint ko `RESOLVED` mark kar sakta hai.
- **Kya NAHI kar sakta:**
  - Doosre department ki complaints me dakhal nahi de sakta (e.g., IT staff hostel ki complaint access nahi kar sakta).
  - Admin level tasks (jaise naye staff create karna ya categories delete karna) nahi kar sakta.

### 3. 👑 Administrator (College Authority / Dean / IT Head)
- **Koun hai:** College management ka head jiske paas supreme privileges hain.
- **Kya kar sakta hai:**
  - System-wide Dashboard: Total complaints, Pending, In-Progress, Resolved, Average Rating, aur Department-wise workload metrics.
  - Sabhi departments ki complaints dekh sakta hai, kisi bhi staff ko complaint manually assign/reassign kar sakta hai.
  - **User Governance:** Naye staff accounts create karna, users ko activate/deactivate karna, password reset karna.
  - **Department & Category CRUD:** Naye departments banana (e.g., Library, Sports) aur unke under categories add/edit karna.
  - **Security Audit Logs:** System ke har ek action (Logins, Status changes, User creation, Attachment access) ka timestamped log dekhna with IP Address.
  - **Reports Export:** Puri complaints ka data Excel/CSV format me download karna offline analysis aur meetings ke liye.

---

## 3. Complaint Ki Complete Lifecycle

Ek complaint shuru se lekar khatam hone tak inn steps se gujarti hai:

```mermaid
flowchart TD
    A[Student Submits Complaint] --> B[Status: PENDING]
    B --> C{Staff/Admin Reviews}
    C -->|Valid Issue| D[Status: ASSIGNED / IN_PROGRESS]
    C -->|Invalid/Spam| X[Status: REJECTED]
    D --> E{Need More Info?}
    E -->|Yes| F[Status: WAITING_FOR_STUDENT]
    F -->|Student Replies| D
    D --> G[Work Completed]
    G --> H[Status: RESOLVED]
    H --> I{Student Satisfied?}
    I -->|Yes| J[Student Submits 1-5 Star Rating & Review]
    I -->|No| K[Status: REOPENED]
    K --> D
```

1. **Submission:** Student portal me jaakar category choose karta hai, title & description likhta hai, aur proof upload karta hai. System usse `CMP-2026-XXXXXX` ID assign karta hai aur status `PENDING` hota hai.
2. **Review & Assignment:** Department staff ya Admin complaint review karta hai aur status ko `UNDER_REVIEW` ya `ASSIGNED` karta hai.
3. **Action & Work in Progress:** Technician kaam shuru karta hai aur status `IN_PROGRESS` ho jata hai. Staff update daalta rehta hai.
4. **Clarification (Optional):** Agar details kam hain, status `WAITING_FOR_STUDENT` hota hai. Student notification dekh kar additional reply de sakta hai.
5. **Resolution:** Problem fix hone par staff resolution message likhta hai aur status `RESOLVED` ban jaata hai. Student ko notification chala jata hai.
6. **Student Feedback:** Student system me aakar resolution check karta hai, 1 se 5 star rating aur apna review submit karta hai.
7. **Reopen (If Unresolved):** Agar problem wapas aa gayi ya solve nahi hui, toh student "Reopen" button daba sakta hai aur status `REOPENED` ho jaata hai.

---

## 4. State Machine Rules

Complaint ka status koi bhi arbitrarily change nahi kar sakta. System me `lib/state-machine.ts` strict rules enforce karta hai:

| Current Status | Allowed Next Statuses | Explanation |
| :--- | :--- | :--- |
| `PENDING` | `UNDER_REVIEW`, `ASSIGNED`, `REJECTED` | Initial state; review me ja sakti hai ya directly reject ho sakti hai. |
| `UNDER_REVIEW` | `ASSIGNED`, `IN_PROGRESS`, `REJECTED` | Verification ke baad staff ko di ja sakti hai ya kaam shuru ho sakta hai. |
| `ASSIGNED` | `IN_PROGRESS`, `WAITING_FOR_STUDENT`, `UNDER_REVIEW`, `REJECTED` | Staff kaam shuru karta hai ya student se question poochta hai. |
| `IN_PROGRESS` | `WAITING_FOR_STUDENT`, `RESOLVED`, `UNDER_REVIEW`, `ASSIGNED`, `REJECTED` | Kaam complete hone par RESOLVED hota hai. |
| `WAITING_FOR_STUDENT` | `IN_PROGRESS`, `RESOLVED`, `REJECTED` | Student se jawab aane par wapas IN_PROGRESS hota hai. |
| `RESOLVED` | `REOPENED` | Resolved complaint sirf reopen ki ja sakti hai agar student unsatisfied ho. |
| `REOPENED` | `IN_PROGRESS`, `UNDER_REVIEW`, `ASSIGNED`, `RESOLVED` | Reopen hone par dobara investigation hoti hai. |
| `REJECTED` | `REOPENED`, `UNDER_REVIEW` | Wrongly rejected complaint ko re-evaluate kiya ja sakta hai. |

> **Note:** Agar koi API se direct `PENDING` se `RESOLVED` bhejne ki koshish karega bina proper workflow ke, toh system validation error fek dega.

---

## 5. Tech Stack & Architecture

Yeh application modern fullstack web standards pe bani hai:

- **Framework:** [Next.js 14 (App Router)](https://nextjs.org/) - React 18, Server Components, API Route Handlers.
- **Language:** [TypeScript](https://www.typescriptlang.org/) - 100% strictly typed code.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) - Clean, responsive, mobile-first design system.
- **Icons:** [Lucide React](https://lucide.dev/) - Crisp vector icons.
- **Charts:** [Recharts](https://recharts.org/) - Admin metrics aur analytics visual graphs.
- **Database & ORM:** [Prisma ORM](https://www.prisma.io/) - Type-safe queries. Development me SQLite (`dev.db`), Production me PostgreSQL.
- **Authentication:**
  - Password Hashing: `bcryptjs` with 12 salt rounds.
  - Session Tokens: `jose` library se signed JWT tokens.
  - Cookies: `httpOnly`, `sameSite: 'lax'`, secure cookies (JavaScript cookie hijack nahi kar sakti).
- **Validation:** [Zod](https://zod.dev/) schemas har API input aur request body ko validate karte hain.
- **Automated Testing:** [Vitest](https://vitest.dev/) test runner unit aur security tests ke liye.

---

## 6. Folder Structure Ka Detail Breakdown

```
complaint-management-project/
├── app/                              # Next.js 14 App Router (Pages & APIs)
│   ├── admin/login/                  # Admin direct portal login
│   ├── api/                          # Backend REST API Endpoints
│   │   ├── admin/                    # Admin only APIs (users, departments, categories, audit logs, reports)
│   │   ├── auth/                     # Authentication APIs (login, register, logout, me)
│   │   ├── complaints/               # Complaint APIs (GET list, POST create)
│   │   │   └── [id]/                 # Single complaint details, updates, feedback, attachment download
│   │   ├── notifications/            # User in-app notifications
│   │   └── public/                   # Public stats for landing page
│   ├── complaints/                   # Student & Staff complaint UI pages
│   │   └── [id]/                     # Detailed complaint view & timeline
│   ├── dashboard/                    # Role-specific Dashboards
│   │   ├── admin/                    # Administrator command center UI
│   │   ├── staff/                    # Department staff operational queue UI
│   │   └── student/                  # Student personal complaint dashboard UI
│   ├── login/                        # Universal login page (Student/Admin switchable)
│   ├── register/                     # Student signup page
│   ├── globals.css                   # Global Tailwind CSS styles
│   ├── layout.tsx                    # Root HTML layout with fonts and metadata
│   └── page.tsx                      # Modern Landing Homepage
│
├── components/                       # Reusable React UI Components
│   ├── common/                       # Logo, buttons, loaders
│   ├── complaints/                   # StatusBadge, Timeline components
│   ├── landing/                      # Landing page sections (Hero, HowItWorks, Stats, etc.)
│   └── layout/                       # Navbar, Sidebar, DashboardLayout
│
├── lib/                              # Core Business Logic & Security Utilities
│   ├── audit.ts                      # AuditLog creation helper
│   ├── auth.ts                       # Password hashing, JWT creation & verification, cookie management
│   ├── db.ts                         # Singleton PrismaClient instance
│   ├── id-generator.ts               # Unique CMP-2026-XXXXXX ticket ID generator
│   ├── rate-limit.ts                 # In-memory rate limiting against brute-force & spam
│   ├── rbac.ts                       # Role-Based Access Control & IDOR ownership verification
│   ├── state-machine.ts              # Complaint status transition validator
│   ├── storage.ts                    # Private file storage, size & magic-bytes validation
│   └── validators.ts                 # Zod validation schemas for forms & API requests
│
├── prisma/                           # Database Schema & Seeds
│   ├── schema.prisma                 # Database models, relations, indices
│   └── seed.ts                       # Sample data (Admin, Staff, Students, Categories, Complaints)
│
├── storage/uploads/                  # Private file upload directory (stored safely outside web root)
├── tests/                            # Vitest automated test suite
│   ├── auth.test.ts                  # Password hashing & JWT tests
│   ├── complaint-workflow.test.ts    # State machine transition tests
│   └── security-rbac.test.ts         # IDOR, RBAC, and file security tests
│
├── .env.example                      # Environment variables template
├── package.json                      # Dependencies and npm scripts
├── tailwind.config.ts                # Tailwind design configuration
└── tsconfig.json                     # TypeScript compilation options
```

---

## 7. Database Schema & Models

Prisma schema me 7 core tables (models) hain jo complaint management workflow ko power karti hain:

1. **`User`**:
   - Fields: `id`, `email`, `passwordHash`, `name`, `role` (`STUDENT` | `STAFF` | `ADMIN`), `departmentId`, `studentRollNumber`, `phone`, `isActive`, `createdAt`, `lastLoginAt`.
   - Relations: Department ke sath link, submitted complaints, assigned complaints, notifications, audit logs.
2. **`Department`**:
   - Fields: `id`, `code` (e.g. `MAINT`, `ACAD`, `HOSTEL`, `IT`), `name`, `description`, `isActive`.
   - Relations: Ek department me multiple users (staff) aur multiple categories hoti hain.
3. **`Category`**:
   - Fields: `id`, `name`, `description`, `departmentId`, `isActive`.
   - Example: "Electrical Issues" belong karta hai "Maintenance & Facilities" department ko.
4. **`Complaint`**:
   - Fields: `id`, `complaintNumber` (Unique e.g. `CMP-2026-000001`), `studentId`, `categoryId`, `departmentId`, `assignedStaffId`, `title`, `description`, `priority` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), `status`, `attachmentPath`, `resolutionMessage`, `rejectionReason`, `resolvedAt`.
5. **`ComplaintUpdate` (Timeline Events)**:
   - Fields: `id`, `complaintId`, `actorId`, `updateType` (`STATUS_CHANGE`, `PUBLIC_UPDATE`, `INTERNAL_NOTE`, `INFO_REQUEST`), `message`, `previousStatus`, `newStatus`, `isPublic`.
   - *Key Security Rule:* Agar `isPublic: false` hai, toh student ki query me yeh row filter out ho jaati hai!
6. **`Notification`**:
   - Fields: `id`, `userId`, `title`, `message`, `link`, `isRead`, `createdAt`.
7. **`Feedback`**:
   - Fields: `id`, `complaintId` (Unique), `studentId`, `rating` (1 to 5), `comment`.
8. **`AuditLog`**:
   - Fields: `id`, `actorId`, `action`, `resourceType`, `resourceId`, `ipAddress`, `userAgent`, `metadata`, `createdAt`.

---

## 8. Security & Protection Mechanisms

Yeh project high-security best practices ke sath banaya gaya hai taaki kisi bhi tarah ka vulnerability exploit na ho sake:

1. **HTTP-Only JWT Cookies (XSS Defense):**
   - Authentication token (`auth_token`) browser ke `localStorage` me nahi rakha jaata, balki `httpOnly: true`, `SameSite: Lax`, aur production me `secure: true` cookie me store hota hai. Koi bhi malicious JavaScript script token chura nahi sakti.
2. **IDOR / BOLA Prevention (Insecure Direct Object Reference):**
   - `lib/rbac.ts` me `authorizeComplaintAccess()` har API request pe check karta hai:
     - Agar `role === 'STUDENT'` hai, toh complaint ka `studentId === session.userId` hona mandatory hai.
     - Student A agar URL me Student B ki complaint ka ID daalega, toh server usse `403 Forbidden` fek dega.
3. **Data Leakage Prevention (Internal Notes Protection):**
   - Staff members internal notes likh sakte hain jo complaints par backend me save hote hain (`isPublic: false`).
   - Jab bhi Student ke session se timeline fetch hoti hai, SQL query level pe `isPublic: true` filter lagta hai, jisse confidential discussion kabhi student browser tak pahunchti hi nahi.
4. **Private Storage & Anti-Path Traversal File Uploads:**
   - Uploaded files direct `public/` folder me nahi jaati (jahan koi bhi URL guess karke access kar sake).
   - Files `storage/uploads/` me random UUID filenames ke sath save hoti hain.
   - File download sirf `/api/complaints/[id]/attachment` endpoint ke through possible hai, jo pehle user session aur permission verify karta hai.
5. **File Magic-Byte & MIME Type Validation:**
   - Sirf file extension (`.png`, `.pdf`) dekhna kafi nahi hota kyunki hacker `.exe` file ko `.jpg` rename kar sakta hai.
   - `lib/storage.ts` file ke first few bytes (Magic Bytes / Header) check karta hai:
     - PDF: `%PDF`
     - JPEG: `0xFF 0xD8`
     - PNG: `89 50 4E 47`
   - File size strict 5MB limit par capped hai.
6. **In-Memory Rate Limiting (Anti-Spam & Anti-Brute Force):**
   - Login attempts: Limit per IP taaki koi password brute-force na kar sake.
   - Complaint submission: Ek student 5 minute me maximum 5 complaints hi create kar sakta hai (`lib/rate-limit.ts`).
7. **Immutable Audit Logging:**
   - Har critical action (Login, Status Change, User Creation, File Access) `AuditLog` table me automatically write hota hai with IP Address aur User-Agent.

---

## 9. Pre-configured Test Accounts

Development aur testing ke liye database seed script me ready-to-use accounts diye gaye hain:

| Role | Email | Password | Department / Details |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@college.local` | `Password123!` | System Administrator (Full Access) |
| **🛠️ Maintenance Staff** | `maintenance@college.local` | `Password123!` | Maintenance & Facilities (Plumbing, Electrical) |
| **🛠️ Academic Staff** | `academic@college.local` | `Password123!` | Academic Affairs (Syllabus, Exams) |
| **🛠️ Hostel Staff** | `hostel@college.local` | `Password123!` | Hostel Management (Rooms, Mess) |
| **🎓 Student 1** | `student1@college.local` | `Password123!` | Roll Number: `CS-2024-042` |
| **🎓 Student 2** | `student2@college.local` | `Password123!` | Roll Number: `EE-2024-118` |

---

## 10. Local Development Setup

Apne local laptop ya computer par project ko run karne ke liye inn steps ko follow karein:

### Step 1: Prerequisites Check
Make sure aapke paas yeh installed hain:
- **Node.js:** version 18.18+ ya version 20+
- **npm:** version 9+ ya 10+
- **Git**

### Step 2: Dependencies Install Karein
Terminal open karein project folder me aur run karein:
```bash
npm install
```

### Step 3: Environment Variables File Banayein
Root directory me `.env` file banayein (agar nahi hai) aur yeh values daalein:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-jwt-key-change-this-in-production-min-32-chars-long"
STORAGE_DIR="./storage/uploads"
NODE_ENV="development"
```

### Step 4: Database Push Aur Seed Data Load Karein
Prisma ke zariye SQLite database file create karein aur test data populate karein:
```bash
npm run db:push
npm run db:seed
```

### Step 5: Automated Tests Run Karein
Sare security, RBAC aur workflow unit tests verify karein:
```bash
npm test
```
*(Saare 11 tests PASS hone chahiye).*

### Step 6: Development Server Start Karein
```bash
npm run dev
```
Ab browser me open karein: **`http://localhost:3000`** 🎉

---

## 11. Full Production Deployment Guide

> ⚠️ **IMPORTANT ARCHITECTURAL NOTE (DHYAN DEIN):**
> Local development me hum **SQLite** (`dev.db`) aur **Local Disk** (`./storage/uploads`) use karte hain. 
> - Lekin **Vercel** jaise Serverless platforms pe local SQLite aur local disk read-only / ephemeral (temporary) hoti hain - har deployment ya function cold-start par local data erase ho jaata hai.
> - Isliye production me **PostgreSQL Database** (jaise Supabase ya Neon) use karna zaroori hai!

Yahan hum **3 sabse popular deployment options** explain kar rahe hain:

---

### Option A: Vercel + Supabase / Neon (Recommended)

Yeh sabse popular, modern aur 100% **Free Tier Friendly** method hai. Frontend Next.js Vercel par host hoga aur database Supabase ya Neon par PostgreSQL chalega.

#### Step 1: Free Cloud PostgreSQL Database Banayein
1. [Supabase](https://supabase.com) ya [Neon.tech](https://neon.tech) par free account banayein.
2. Ek naya project create karein (e.g. `college-complaints-db`).
3. Project settings me jaakar **Connection String (URI)** copy karein.
   - Example format: `postgresql://postgres:YourPassword@db.xxxx.supabase.co:5432/postgres?pgbouncer=true` ya direct connection URL.

#### Step 2: Prisma Schema Ko PostgreSQL Me Switch Karein
`prisma/schema.prisma` file me jaakar datasource provider change karein:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### Step 3: Database Tables Push Karein
Apne computer ke `.env` me temporarily Supabase/Neon ka connection URL daalein aur run karein:
```bash
npx prisma db push
npx prisma db seed
```
*(Iss se Supabase/Neon database me saari tables aur initial Admin/Staff accounts create ho jayenge).*

#### Step 4: Production File Storage Ke Liye Consideration
Vercel serverless functions me file upload save karne ke liye:
- Either **Supabase Storage bucket** ya **AWS S3** / **UploadThing** use karein.
- Ya fir attachments ko direct cloud storage URL me store karein.

#### Step 5: GitHub Par Code Push Karein
```bash
git add .
git commit -m "Ready for Vercel deployment with PostgreSQL"
git push origin main
```

#### Step 6: Vercel Par Deploy Karein
1. [Vercel Dashboard](https://vercel.com) par login karein.
2. **"Add New"** → **"Project"** select karein aur apni GitHub repository import karein.
3. Framework Preset: **Next.js** select hoga.
4. Build Command: `prisma generate && next build` (jo ki `package.json` me already set hai).
5. **Environment Variables** section me yeh keys add karein:
   - `DATABASE_URL` = *(Aapka Supabase/Neon PostgreSQL URI)*
   - `JWT_SECRET` = *(Ek random 64-character secret key)*
   - `NODE_ENV` = `production`
   - `STORAGE_DIR` = `/tmp/uploads` *(Agar temporary storage test kar rahe hain)*
6. Click **"Deploy"**.
7. 2 minute me aapki website live ho jayegi (e.g. `https://your-college-complaint.vercel.app`)!

---

### Option B: Railway / Render

Agar aapko database, persistent file storage aur Node.js server **sab kuch ek hi jagah** chahiye bina serverless limitations ke, toh **Railway.app** ya **Render.com** best option hai.

#### Railway Par Setup:
1. [Railway.app](https://railway.app) par login karein aur **"New Project"** select karein.
2. **"Provision PostgreSQL"** select karein (Railway turant ek dedicated Postgres DB bana dega).
3. Uske baad **"GitHub Repo"** add karein.
4. Variables tab me jaakar environment variables set karein:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (Railway automatically link kar deta hai)
   - `JWT_SECRET` = `very_long_secure_random_production_secret_key_12345`
   - `NODE_ENV` = `production`
   - `STORAGE_DIR` = `/app/storage/uploads`
5. **Persistent Volume (Optional for Files):**
   - Service settings me jaakar **Volume** attach karein mount path `/app/storage/uploads` par. Iss se uploaded complaint attachments server restart hone par bhi hamesha safe rahenge.
6. Deploy settings me:
   - Build Command: `npm install && npx prisma generate && npx prisma db push && npm run build`
   - Start Command: `npm run start`
7. Railway aapko custom public domain provide karega (e.g. `https://complaints.up.railway.app`).

---

### Option C: Self-Hosted Linux VPS (Ubuntu + Nginx + PM2 + SSL)

Agar college ke paas apna dedicated server ya cloud VPS (DigitalOcean, AWS EC2, Linode, Hostinger) hai aur aap poora control chahte hain:

#### 1. Server Update & Node.js 20 Install
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git certbot python3-certbot-nginx
sudo npm install -g pm2
```

#### 2. PostgreSQL Install & Database Create
```bash
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql
```
Postgres shell ke andar:
```sql
CREATE DATABASE college_complaints;
CREATE USER complaint_user WITH ENCRYPTED PASSWORD 'StrongPasswordHere123!';
GRANT ALL PRIVILEGES ON DATABASE college_complaints TO complaint_user;
\q
```

#### 3. Repository Clone & Setup
```bash
cd /var/www
sudo git clone https://github.com/your-username/complaint-management-project.git
cd complaint-management-project
sudo chown -R $USER:$USER /var/www/complaint-management-project
npm install
```

#### 4. `.env` File Configure Karein
```bash
nano .env
```
Paste karein:
```env
DATABASE_URL="postgresql://complaint_user:StrongPasswordHere123!@localhost:5432/college_complaints?schema=public"
JWT_SECRET="a_very_secure_random_production_jwt_key_at_least_32_chars_long"
STORAGE_DIR="/var/www/complaint-management-project/storage/uploads"
NODE_ENV="production"
PORT=3000
```

#### 5. Build, DB Migration & Seed
`prisma/schema.prisma` me `provider = "postgresql"` karein, fir run karein:
```bash
npx prisma generate
npx prisma db push
npm run db:seed
npm run build
```

#### 6. PM2 Se Background Process Start Karein
```bash
pm2 start npm --name "college-complaints" -- start
pm2 save
pm2 startup
```

#### 7. Nginx Reverse Proxy Setup
```bash
sudo nano /etc/nginx/sites-available/complaints.yourcollege.edu
```
Paste config:
```nginx
server {
    server_name complaints.yourcollege.edu;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable karein aur Nginx reload karein:
```bash
sudo ln -s /etc/nginx/sites-available/complaints.yourcollege.edu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 8. Free Let's Encrypt SSL Certificate Lagayein
```bash
sudo certbot --nginx -d complaints.yourcollege.edu
```
Aapka system HTTPS secured production URL ke sath fully live ho gaya!

---

## 12. Production Environment Variables Reference

Production deployment karte waqt inn variables ko zaroor verify karein:

| Variable Name | Required? | Example Value | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@host:5432/db` | Database connection string. (SQLite dev ke liye, Postgres prod ke liye). |
| `JWT_SECRET` | **Yes** | `8f94d1b2c4e... (min 32 chars)` | User session sign karne ke liye cryptographically random secret string. |
| `NODE_ENV` | **Yes** | `production` | Production optimizations enable karne ke liye (Secure cookies activate hoti hain). |
| `STORAGE_DIR` | **Yes** | `./storage/uploads` ya `/var/uploads` | Path jahan student ke attachment files private save honge. |
| `PORT` | Optional | `3000` | Server port number (VPS ya custom server ke liye). |

---

## 13. Troubleshooting & Common Production Issues (FAQs)

### Q1: "Authentication cookies kaam nahi kar rahi hain deployment ke baad!"
- **Reason:** `lib/auth.ts` me `secure: process.env.NODE_ENV === 'production'` set hota hai. Agar aapka website `http://` (insecure) par chal raha hai toh browser secure cookie reject kar dega.
- **Solution:** Make sure aapke domain par SSL (HTTPS) enabled ho. Vercel aur Railway par automatically HTTPS hota hai. Local VPS par Certbot SSL run karein.

### Q2: "Vercel par build fail ho raha hai: `PrismaClientInitializationError` ya `Prisma not generated`"
- **Reason:** Vercel build step ke waqt Prisma client generate nahi hua.
- **Solution:** `package.json` me build script ensure karein:
  ```json
  "build": "prisma generate && next build"
  ```
  Aur Vercel settings me `DATABASE_URL` environment variable properly configured hona chahiye.

### Q3: "File upload karte waqt 413 Payload Too Large error aa raha hai"
- **Reason:** Nginx ya Next.js default file size limit 1MB ya 2MB hoti hai, jabki system 5MB allow karta hai.
- **Solution:** 
  - Nginx configuration me `client_max_body_size 10M;` add karein.
  - Vercel serverless request body size by default 4.5MB tak support karta hai.

### Q4: "Complaint submit karne par 429 Too Many Requests aa raha hai"
- **Reason:** Rate limiting feature trigger hua hai (`lib/rate-limit.ts`). Ek user 5 minutes me max 5 complaints daal sakta hai.
- **Solution:** 5 minute wait karein ya development ke waqt `lib/rate-limit.ts` me window size adjust karein.

### Q5: "SQLite se PostgreSQL switch karne par migration kaise karein?"
- **Solution:**
  1. `prisma/schema.prisma` me `provider = "sqlite"` ko `provider = "postgresql"` karein.
  2. `.env` me PostgreSQL connection string daalein.
  3. Run karein:
     ```bash
     npx prisma generate
     npx prisma db push
     npm run db:seed
     ```

---

## 🎯 Final Summary

Yeh project modern web standards, strong data privacy (No IDOR), secure JWT session management, aur multi-level college workflows ko dhyan me rakh kar banaya gaya hai. Iss file me diye gaye instructions ko follow karke koi bhi developer iss project ko samajh sakta hai, feature extend kar sakta hai, aur bina kisi pareshani ke live production server par deploy kar sakta hai.

**Happy Coding & Smooth Deployments! 🚀**
