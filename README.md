# Lead Management Portal &mdash; Frontend (LeadHub CRM)

A production-quality, responsive, and robust **Lead Management Portal frontend** built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **React Router**.

This frontend is designed as a modern SaaS CRM dashboard to interface with the companion Express/TypeScript/SQLite/Prisma backend. It provides full lifecycle management of prospective leads, sales pipeline visibility, real-time KPI metrics, responsive desktop/mobile navigation, and contextual communication notes.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Architecture & Directory Structure](#project-architecture--directory-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Development & Available Scripts](#development--available-scripts)
- [Backend Startup & Integration](#backend-startup--integration)
- [API Contract & Endpoints Reference](#api-contract--endpoints-reference)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Design System & Aesthetics](#design-system--aesthetics)
- [Troubleshooting & FAQs](#troubleshooting--faqs)
- [Git & Remote Setup](#git--remote-setup)

---

## Overview

The Lead Management Portal delivers a streamlined, intuitive interface for managing inbound and outbound leads through four standardized pipeline stages: **New**, **Contacted**, **Qualified**, and **Lost**.

Key architectural goals include:

1. **Strict Type Safety**: Comprehensive TypeScript models mirroring backend API schemas.
2. **Resilient Data Fetching**: Debounced searches, abortable in-flight requests, and standardized error normalization.
3. **Enterprise UI/UX**: Professional Indigo/Slate color palette, accessible modal dialogs, non-blocking toast notifications, skeleton loaders, and zero artificial browser alerts.
4. **Backend Harmony**: Direct compliance with the Express/Prisma backend without fabricated endpoints or unverified mutations.

---

## Key Features

### 1. Interactive Pipeline Dashboard (`/`)

- **Real-Time KPIs**: Total leads, new leads, contacted leads, qualified leads, and lost leads computed from real backend counts.
- **Conversion Efficiency Metric**: Dynamically calculates lead-to-qualification rate (`(qualified / total) * 100%`).
- **Pipeline Stage Visualizer**: Horizontal distribution bar showing proportion of active contacts across stages.
- **Recent Leads Feed**: Quick table of latest registered contacts with direct view links and timestamps.
- **Quick Action Triggers**: Instant navigation to add a lead or view the full filtered pipeline.

### 2. Comprehensive Leads Listing (`/leads`)

- **Server-Side Pagination**: Clean pagination controls with page limit selector (5, 10, 25, 50) and current range indicator (`Showing 1 to 10 of 45 results`).
- **Debounced Search**: 350ms debounced search bar filtering across name, email, and phone without overloading the backend API.
- **Status Filter Tabs**: One-click filtering between `All`, `New`, `Contacted`, `Qualified`, and `Lost`.
- **Responsive Dual-Layout**: High-density table on desktop and card-based layout on tablet/mobile screens.
- **Lead Metrics**: Displays attached note counts (`_count.notes`) and formatted registration dates.
- **Action Suite**: Direct buttons to view details, edit record, or trigger cascade deletion.

### 3. Lead Creation Form (`/leads/new`)

- **Validation via React Hook Form & Zod**:
  - Name: Required, 1 to 100 characters.
  - Email: Required, valid email format, converted to lowercase.
  - Phone: Optional, maximum 30 characters.
  - Status: Enum choice (`new`, `contacted`, `qualified`, `lost`).
- **Duplicate Prevention**: Form disables submission controls while saving to prevent duplicate database entries.
- **API Conflict Handling**: Maps backend HTTP 409 `DUPLICATE_RESOURCE` email conflicts into clear inline warnings.
- **Immediate Routing**: Automatically redirects to the new lead's detail page upon creation.

### 4. Lead Details & Timeline Hub (`/leads/:id`)

- **Profile Overview**: Contact card featuring initials avatar, email (with one-click clipboard copy), phone (click-to-call), and timestamp.
- **Quick Status Changer**: In-place dropdown selector to advance a lead's pipeline status immediately via `PATCH /api/leads/:id`.
- **404 Handling**: Dedicated "Lead Not Found" empty state when navigating to non-existent or deleted IDs.
- **Action Triggers**: Quick links to edit or permanently delete the lead.

### 5. Nested Communication Notes (`/api/leads/:id/notes`)

- **Timeline Feed**: Chronological list of past notes with relative timestamps (e.g., `2 mins ago`).
- **Add Note Form**: Expandable textarea with character counter (up to 2000 characters) and instant optimistic timeline updates.
- **Backend Adherence**: Per backend design, notes are strictly appended and viewed; editing and deleting notes are omitted to prevent schema desynchronization.

### 6. Cascade Delete Confirmation Dialog

- **Modal Dialogue**: Clean accessible dialog requiring affirmative confirmation before executing a `DELETE` request.
- **Cascade Warning**: Explicitly notifies operators that deleting a lead removes all associated historical notes.

---

## Technology Stack

| Layer             | Technology                     | Version        | Purpose                                              |
| :---------------- | :----------------------------- | :------------- | :--------------------------------------------------- |
| **Framework**     | React                          | 18.3.1         | Core UI component hierarchy                          |
| **Build Tool**    | Vite                           | 6.0.1          | Fast local HMR and optimized production bundling     |
| **Language**      | TypeScript                     | 5.6.3          | Strict static typing and interface contracts         |
| **Routing**       | React Router                   | 6.28.0         | Declarative client-side routing                      |
| **Styling**       | Tailwind CSS                   | 3.4.16         | Utility-first responsive design system               |
| **HTTP Client**   | Axios                          | 1.7.9          | Centralized client with interceptors & error mapping |
| **Form Handling** | React Hook Form                | 7.54.2         | High-performance uncontrolled form state             |
| **Validation**    | Zod                            | 3.24.1         | Schema validation matching backend constraints       |
| **Icons**         | Lucide React                   | 0.468.0        | Consistent iconography                               |
| **Testing**       | Vitest & React Testing Library | 2.1.8          | Unit and component integration tests                 |
| **Linting**       | ESLint & Prettier              | 9.16.0 / 3.4.2 | Code style enforcement and formatting                |

---

## Project Architecture & Directory Structure

```
lead-management-frontend/
├── .env.example                  # Environment configuration template
├── .gitignore                    # Excludes node_modules, .env, dist, and coverage
├── .prettierrc                   # Prettier formatting rules
├── .prettierignore               # Files ignored by Prettier
├── eslint.config.js              # ESLint 9 flat configuration
├── index.html                    # Root HTML with Google Fonts & SEO meta tags
├── package.json                  # Dependencies, scripts, and engine metadata
├── postcss.config.js             # PostCSS with Tailwind and Autoprefixer
├── tailwind.config.js            # Design tokens, palette, and shadow definitions
├── tsconfig.json                 # TypeScript compiler configuration (DOM, ES2020)
├── tsconfig.node.json            # Node TypeScript configuration
├── vite.config.ts                # Vite config with alias and Vitest runner setup
└── src/
    ├── App.tsx                   # React Router routing tree and ToastProvider
    ├── App.test.tsx              # Shell and navigation test
    ├── main.tsx                  # React DOM entry point
    ├── vite-env.d.ts             # Vite client & import.meta.env definitions
    │
    ├── components/
    │   ├── navigation/
    │   │   ├── Navbar.tsx        # Top navbar with breadcrumbs & backend health badge
    │   │   └── Sidebar.tsx       # Desktop fixed sidebar & mobile drawer
    │   └── ui/
    │       ├── Badge.tsx         # Semantic pill badge
    │       ├── Button.tsx        # Variant-based button with loading spinner
    │       ├── Card.tsx          # Card container with title, subtitle, and action slot
    │       ├── EmptyState.tsx    # Empty illustration, description, and action button
    │       ├── ErrorState.tsx    # Error display with retry callback
    │       ├── Input.tsx         # Accessible input with error & icon support
    │       ├── Modal.tsx         # Accessible modal with keyboard Escape support
    │       ├── Pagination.tsx    # Server pagination with page numbers & limit dropdown
    │       ├── Select.tsx        # Styled accessible select input
    │       ├── Skeleton.tsx      # Shimmer placeholder loaders
    │       └── ToastContainer.tsx# Floating stack for dismissible notifications
    │
    ├── context/
    │   └── ToastContext.tsx      # Global notification state provider
    │
    ├── features/
    │   ├── dashboard/
    │   │   ├── components/
    │   │   │   ├── PipelineChart.tsx  # Pipeline distribution progress bar
    │   │   │   └── StatCard.tsx       # KPI stat tile
    │   │   └── pages/
    │   │       ├── DashboardPage.tsx       # Dashboard page
    │   │       └── DashboardPage.test.tsx  # Dashboard tests
    │   ├── leads/
    │   │   ├── components/
    │   │   │   ├── DeleteLeadModal.tsx     # Delete confirmation modal
    │   │   │   ├── DeleteLeadModal.test.tsx
    │   │   │   ├── LeadForm.tsx            # Reusable lead form (Create/Edit)
    │   │   │   └── LeadStatusBadge.tsx     # Lead status badge component
    │   │   ├── pages/
    │   │   │   ├── CreateLeadPage.tsx      # Create lead page
    │   │   │   ├── CreateLeadPage.test.tsx
    │   │   │   ├── EditLeadPage.tsx        # Edit lead page
    │   │   │   ├── EditLeadPage.test.tsx
    │   │   │   ├── LeadDetailPage.tsx      # Lead profile & notes page
    │   │   │   ├── LeadDetailPage.test.tsx
    │   │   │   ├── LeadsListPage.tsx       # Leads listing table & cards
    │   │   │   └── LeadsListPage.test.tsx
    │   │   └── schemas/
    │   │       └── lead.schema.ts          # Zod validation schema
    │   ├── notes/
    │   │   └── components/
    │   │       ├── AddNoteForm.tsx         # Note creation form with counter
    │   │       ├── AddNoteForm.test.tsx
    │   │       ├── NoteItem.tsx            # Individual note card
    │   │       └── NotesSection.tsx        # Notes timeline wrapper
    │   └── notfound/
    │       └── pages/
    │           └── NotFoundPage.tsx        # 404 handler page
    │
    ├── hooks/
    │   ├── useDebounce.ts        # Search input debouncer
    │   └── useToast.ts           # Toast notification hook
    │
    ├── layouts/
    │   └── AppLayout.tsx         # Main application shell layout
    │
    ├── services/
    │   ├── api-client.ts         # Axios instance with centralized error handler
    │   ├── leads-api.ts          # Lead CRUD and search service calls
    │   └── notes-api.ts          # Note service calls
    │
    ├── styles/
    │   └── index.css             # Tailwind base directives & scrollbars
    │
    ├── test/
    │   ├── setup.ts              # Jest DOM matchers & window mocks
    │   └── test-utils.tsx        # Custom render wrapper with Router & ToastProvider
    │
    ├── types/
    │   └── lead.types.ts         # TypeScript interfaces for leads, notes, and pagination
    │
    └── utils/
        ├── date.ts               # Date & relative time formatters
        ├── errors.ts             # ApiError normalization class
        └── formatters.ts         # Initials & status badge theme formatters
```

---

## Prerequisites

- **Node.js**: `v18.0.0` or later (tested on `v22.18.0`)
- **npm**: `v9.0.0` or later (tested on `10.9.3`)
- **Git**: `v2.30.0` or later

---

## Installation & Setup

1. **Clone or open the repository**:

   ```bash
   cd lead-management-frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure the environment**:
   Copy the example environment configuration into `.env`:

   ```bash
   cp .env.example .env
   ```

4. **Verify `.env` settings**:
   Ensure `VITE_API_BASE_URL` points to your active backend (default is `http://localhost:3000`):
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

---

## Environment Variables

| Variable            | Default Value           | Description                       |
| :------------------ | :---------------------- | :-------------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:3000` | Base URL for the Express REST API |

_Note: Vite requires variables accessed in frontend client code to start with the `VITE_` prefix._

---

## Development & Available Scripts

In the project root, you can run:

```bash
# Start local Vite development server with Hot Module Replacement
npm run dev

# Compile TypeScript and build production bundle into dist/
npm run build

# Preview production build locally
npm run preview

# Execute all Vitest unit and integration test suites
npm test

# Run tests in watch mode during development
npm run test:watch

# Run ESLint to verify code quality rules
npm run lint

# Verify code formatting with Prettier
npm run format

# Automatically format all files with Prettier
npm run format:fix
```

---

## Backend Startup & Integration

To connect this frontend to the real backend project:

1. **Navigate to the sibling backend directory**:

   ```bash
   cd ../lead-management-backend
   ```

2. **Ensure backend dependencies and database are initialized**:

   ```bash
   npm install
   npm run db:generate
   npm run db:migrate
   # Optional: Seed development leads
   npm run db:seed
   ```

3. **Start the backend development server**:

   ```bash
   npm run dev
   ```

   The backend will start on **`http://localhost:3000`**. You can verify it by opening `http://localhost:3000/health` or `http://localhost:3000/api-docs` (Swagger UI).

4. **Start the frontend**:
   In another terminal:
   ```bash
   cd ../lead-management-frontend
   npm run dev
   ```
   Open **`http://localhost:5173`** in your browser. The top navigation bar will show a green **API Online** status indicator confirming successful communication.

---

## API Contract & Endpoints Reference

The frontend interfaces with the following backend API endpoints:

| Method   | Endpoint               | Description                      | Request Body / Query                 |
| :------- | :--------------------- | :------------------------------- | :----------------------------------- |
| `GET`    | `/health`              | Backend status check             | None                                 |
| `GET`    | `/api/leads`           | List, filter, and paginate leads | `?search=&status=&page=1&limit=10`   |
| `POST`   | `/api/leads`           | Create a new lead                | `{ name, email, phone?, status? }`   |
| `GET`    | `/api/leads/:id`       | Get lead details with notes      | None                                 |
| `PATCH`  | `/api/leads/:id`       | Update lead fields               | `{ name?, email?, phone?, status? }` |
| `DELETE` | `/api/leads/:id`       | Delete lead & cascade notes      | None                                 |
| `GET`    | `/api/leads/:id/notes` | List notes for a lead            | None                                 |
| `POST`   | `/api/leads/:id/notes` | Add a note to a lead             | `{ content }`                        |

### Backend Error Contract

The frontend handles standard error responses:

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_RESOURCE",
    "message": "A record with this unique field already exists",
    "details": []
  }
}
```

---

## Testing & Quality Assurance

The application includes automated test suites powered by **Vitest** and **React Testing Library**:

- **`src/App.test.tsx`**: Shell structure, logo branding, and navigation.
- **`src/features/dashboard/pages/DashboardPage.test.tsx`**: KPI calculation, recent leads, empty database state, and error recovery.
- **`src/features/leads/pages/LeadsListPage.test.tsx`**: Table rendering, status filtering, debounced search, and delete modal initiation.
- **`src/features/leads/pages/CreateLeadPage.test.tsx`**: Field validation, valid submission, and 409 email conflict handling.
- **`src/features/leads/pages/LeadDetailPage.test.tsx`**: Profile rendering, note addition, and 404 not found handling.
- **`src/features/leads/pages/EditLeadPage.test.tsx`**: Form pre-population and PATCH updates.
- **`src/features/notes/components/AddNoteForm.test.tsx`**: Whitespace validation and textarea reset.
- **`src/features/leads/components/DeleteLeadModal.test.tsx`**: Cascade warning text and confirmation action.

To run the full suite:

```bash
npm test
```

---

## Design System & Aesthetics

- **Color Palette**:
  - Primary: Brand Indigo (`#4f46e5` / `#6366f1`)
  - Background: Crisp White & Slate Light (`#f8fafc` / `#f1f5f9`)
  - Semantic Statuses:
    - New: Blue (`bg-blue-50 text-blue-700 border-blue-200`)
    - Contacted: Amber (`bg-amber-50 text-amber-700 border-amber-200`)
    - Qualified: Emerald (`bg-emerald-50 text-emerald-700 border-emerald-200`)
    - Lost: Rose (`bg-rose-50 text-rose-700 border-rose-200`)
- **Typography**: Inter (Google Fonts) with clear hierarchy and font weights (400, 500, 600, 700).
- **Elevations**: Subtle multi-level box shadows (`shadow-soft`, `shadow-card`, `shadow-elevated`).
- **Interactive Feedback**: Hover transitions, focus rings (`focus:ring-brand-500`), and loading spinners.

---

## Troubleshooting & FAQs

### 1. `Network Error / Unable to connect to backend server`

- **Cause**: The backend Express server is not running on `http://localhost:3000`.
- **Solution**: Start the backend with `npm run dev` in `../lead-management-backend`. Verify that `http://localhost:3000/health` returns `{ "status": "ok" }`.

### 2. `A record with this unique field already exists`

- **Cause**: Attempting to create or update a lead with an email that is already registered.
- **Solution**: Use a unique email address or search for the existing lead on the `/leads` page.

### 3. Port Conflicts

- **Frontend**: By default, Vite runs on port `5173`. If occupied, pass `--port <new_port>`.
- **Backend**: Runs on port `3000`. Set `PORT=3001` in `lead-management-backend/.env` and update `VITE_API_BASE_URL=http://localhost:3001` in `lead-management-frontend/.env`.

---

## Git & Remote Setup

This frontend project is initialized as an independent Git repository:

```bash
# Verify local status
git status

# Inspect commit history
git log --oneline

# Link to your new GitHub repository:
git remote add origin https://github.com/PrernaSharma25/Lead-Management-Frontend.git

# Push to main
git branch -M main
git push -u origin main
```
