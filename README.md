# CraftDesk

CraftDesk is a small-business client and job tracker for independent contractors and growing crews. It keeps client contact information and job progress in one place, including the amount charged, whether the job was billed, and whether it has been paid.

This project is being built by a team of entry-level developers as a learning project using Next.js, Supabase, and Tailwind CSS.

## Current Status

The repository currently includes:

- Next.js App Router setup
- Supabase authentication with email and password
- Protected routes and session handling
- Tailwind CSS and shadcn/ui components
- Supabase database schema for profiles, clients, and jobs
- Row Level Security policies for user-owned data
- Validation and money-formatting helpers

The client and job management screens are still under development.

## Planned Features

- Create, view, edit, and delete clients
- Store client name, email, phone number, address, and notes
- Create and manage jobs for each client
- Track pending and completed jobs
- Record job amounts
- Track billed and paid status
- Keep each user's data private with Supabase Row Level Security

## Technology

- [Next.js](https://nextjs.org/) with the App Router
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.com/) for authentication and PostgreSQL
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) and Radix UI components

## Prerequisites

Install the following before working on the project:

- Node.js and npm
- A Supabase account and project
- Git

Check that Node.js and npm are available:

```bash
node --version
npm --version
```

On macOS, Node.js can be installed with Homebrew:

```bash
brew install node
```

## Local Setup

Clone the repository and enter the project directory:

```bash
git clone git@github.com:miguelmaler/small-business-clientbook.git
cd small-business-clientbook
```

Install the dependencies:

```bash
npm install
```

Create a file named `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Both values are available in the Supabase dashboard under **Project Settings > API**. A legacy Supabase `anon` key can also be used as the value for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Do not commit `.env.local` or any service-role key. The service-role key bypasses Row Level Security and must never be exposed in browser code.

## Database Setup

The database definition is in [`schema.sql`](schema.sql). It creates:

- `profiles` for application-specific user information
- `clients` for client contact information
- `jobs` for work and billing records
- Ownership constraints and indexes
- A profile trigger for new signups
- `updated_at` timestamp triggers
- Row Level Security policies
- Data API privileges for authenticated users

To apply it to a new Supabase project:

1. Open the project in the Supabase dashboard.
2. Select **SQL Editor**.
3. Create a new query.
4. Paste the contents of `schema.sql`.
5. Click **Run**.

The script is intended to run once on a fresh project. Do not run it again unchanged after the tables, policies, or triggers already exist.

After applying the schema, create a test account through the application and confirm that a matching profile is created.

## Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

The existing authentication flow supports signing up, confirming an email, signing in, signing out, and resetting a password. Supabase Auth URL configuration should include the local callback URL:

```text
http://localhost:3000/auth/confirm
```

## Verification Commands

Run the linter:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Before opening a pull request, verify that authentication still works and that users cannot access another user's clients or jobs.

## Git Workflow

Update your local view of the remote repository:

```bash
git fetch origin
```

Create a feature branch before making changes:

```bash
git switch -c feature/short-description
```

After testing your changes:

```bash
git add .
git commit -m "Describe the change"
git push -u origin feature/short-description
```

Use consistent lowercase branch names. Branch names that differ only by capitalization, such as `Backend` and `backend`, can cause problems on case-insensitive macOS filesystems.

## Project Conventions

- Keep database ownership enforced by `user_id` and Row Level Security.
- Let the database set IDs and timestamps.
- Validate user input before sending it to Supabase.
- Keep service-role credentials out of the browser and repository.
- Keep pull requests small enough for another team member to review.
