# ApexCRM - Premium CRM Landing Page & Admin Portal

ApexCRM is a modern, high-converting CRM SaaS landing page built with **React 19**, **TypeScript**, and **Vite**. It features an immersive, fully-responsive layout decorated with smooth animations, complete light/dark theming, and an active inquiry portal that stores and manages submissions directly within **Supabase**.

---

## 🛠️ Technology Stack

- **Frontend Core**: [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [CSS Modules](https://github.com/css-modules/css-modules)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL-based client client-side state)

---

## 📁 Folder Structure

The project has a robust, modular layout promoting separation of concerns and clear code boundaries:

```text
crm-landing-page/
├── .env.example              # Template for environment variables
├── index.html                # Entry HTML template
├── package.json              # Dependencies and build scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite bundler options
├── metadata.json             # Sandbox platform metadata
├── src/
│   ├── main.tsx              # Application entry point
│   ├── App.tsx               # Root component & Client hash-router
│   ├── index.css             # Tailwind imports & Custom variable themes
│   ├── vite-env.d.ts         # TypeScript environment types
│   ├── context/
│   │   ├── ThemeContext.tsx  # Light/Dark mode state management
│   │   ├── ToastContext.tsx  # Global dynamic action toasts
│   │   └── ToastContext.module.css
│   ├── services/
│   │   └── supabase.ts       # Supabase client instantiation
│   └── components/
│       ├── ui/               # Core atomic reusable primitives
│       │   ├── Button/       # Animated state buttons
│       │   ├── Card/         # Hover-reactive surface card panels
│       │   ├── Input/        # Dynamic label text inputs
│       │   ├── ScrollToTop/  # Floating progressive viewport elevator
│       │   └── Toast/        # Floating modal popup notifications
│       ├── Navbar/           # Main fluid header menu with dynamic layout toggling
│       ├── Hero/             # Immersive header with dynamic dashboard mockup & statistics
│       ├── Features/         # Interactive tabbed interface demonstrating CRM dashboards
│       ├── Pricing/          # Dynamic card panels that feed back to the inquiry form
│       ├── Testimonials/     # Fluid customer review slider with auto-scroll controls
│       ├── FAQ/              # Responsive category-filtered accordion panel
│       ├── InquiryForm/      # Advanced lead submission validator connected to Supabase
│       └── Admin/            # AdminPortal dashboard to manage client submissions
```

---

## 🚀 Project Setup Instructions

Follow these instructions to run and build ApexCRM locally on your machine.

### Prerequisites

Ensure you have **Node.js** (v18.x or later) and **npm** installed on your system.

### 1. Clone & Install Dependencies

Clone the repository and run the installation script:

```bash
# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create your local `.env` file from the example configuration:

```bash
cp .env.example .env
```

Open `.env` and configure your credentials. By default, a fully operational backup sandbox URL is populated for immediate convenience:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anonymous-public-key
```

### 3. Run Development Server

Launch the hot-reloading development server:

```bash
npm run dev
```

The application will bind and serve on [http://localhost:3000](http://localhost:3000).

### 4. Code Quality & Formatting

To run the static TypeScript linter and catch potential compilation issues:

```bash
npm run lint
```

### 5. Compile and Build for Production

Compile TypeScript and bundle optimized, minified static assets inside the `/dist` folder:

```bash
npm run build
```

You can preview the production bundle locally with:

```bash
npm run preview
```

---

## 🗄️ Database & API Documentation

ApexCRM integrates directly with **Supabase Database (Postgres)** via its client SDK to persist and process incoming marketing leads.

### 1. Database Table Schema

To support form submissions, create a table named `inquiries` in your Supabase SQL editor. The schema is designed to tolerate both standard camelCase and snake_case properties automatically:

```sql
-- Create inquiries database table
create table if not exists inquiries (
  id bigint generated always as identity primary key,
  full_name text not null,
  company_name text,
  email text not null,
  phone text,
  country text,
  industry text,
  company_size text,
  message text not null,
  status text default 'new', -- options: 'new', 'in_progress', 'resolved', 'archived'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Optional: Enable row-level security (RLS) policies
alter table inquiries enable row level security;

-- Policy allowing public submissions (Insert only)
create policy "Enable insert for anonymous web visitors" 
on inquiries for insert 
to anon 
with check (true);

-- Policy allowing admins to query/update submissions
create policy "Enable all access for authenticated admins" 
on inquiries for all 
to authenticated 
using (true) 
with check (true);
```

### 2. Client API Actions (`supabase.ts`)

Submissions are managed cleanly through standard, secure asynchronous promises:

#### A. Creating/Inserting a Submission
Triggers when a visitor validates and submits the inquiry form on the landing page:
```typescript
import { supabase } from './services/supabase';

const { error } = await supabase
  .from('inquiries')
  .insert([{
    full_name: 'John Doe',
    company_name: 'Acme Corp',
    email: 'john@acme.com',
    phone: '+15551234567',
    country: 'us',
    industry: 'tech',
    company_size: '51-200',
    message: 'We want to schedule a live demo.'
  }]);
```

#### B. Querying Submissions (Admin Portal)
Authenticates and retrieves submission entries, allowing users to apply custom search queries, industry tags, and creation dates:
```typescript
const { data, error } = await supabase
  .from('inquiries')
  .select('*')
  .order('created_at', { ascending: false });
```

#### C. Deleting a Submission (Admin Portal)
Permanently purges specified records on user confirmation:
```typescript
const { error } = await supabase
  .from('inquiries')
  .delete()
  .eq('id', inquiryId);
```

### 3. Portal Authentication

The Admin Portal utilizes a robust, zero-database-overhead credential model:
- Access to `#admin` views requires setting up a master administrator password directly upon first load.
- Passwords are securely hashed with a native **SHA-256** standard (via Web Crypto APIs) and saved in Supabase metadata or browser storage context.
- Admin sessions are held inside safe `sessionStorage` buffers to protect data visibility against CSRF vectors.
