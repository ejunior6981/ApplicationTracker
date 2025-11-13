# ApplicationTracker

ApplicationTracker is a full-stack job hunt companion that helps you organize every application from first outreach through negotiations. Track statuses, attach documents, log interviews, store recruiter details, and visualize what needs attention in a single dashboard.

## Features

- Kanban-style overview groups applications by stage with filters and quick search
- Detailed status timelines with per-round dates, completion flags, and notes
- Rich application modals for editing metadata, managing contacts, and reviewing history
- Secure document uploads for resumes, cover letters, and supplementary files per application
- REST API built on Next.js App Router backed by Prisma + SQLite for easy local development
- Optional Socket.IO server illustrating how to add real-time features alongside the Next.js app

## Technology Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS and shadcn/ui for component styling
- Prisma ORM with SQLite storage (`prisma/db/custom.db` by default)
- Nodemon + TSX-driven custom dev server with Socket.IO integration
- Lucide icons, React Hook Form, Zod, TanStack Query/Table, Zustand, and Sonner to round out the UX

## Getting Started

### Prerequisites

- Node.js 20+ and npm 10+
- SQLite (bundled with most Node installs; no separate service required)

### Installation

```bash
git clone https://github.com/ejunior6981/ApplicationTracker.git
cd ApplicationTracker
npm install
```

### Environment variables

Create a `.env` file in the project root:

```bash
cp .env.example .env # if the file exists
```

Set at minimum:

```
DATABASE_URL="file:./prisma/db/custom.db"
```

You can point `DATABASE_URL` at another SQLite file or a supported Prisma database engine if desired.

### Database setup

Generate the Prisma client and push the schema to your database:

```bash
npm run db:generate
npm run db:push
```

### Running the app in development

```bash
npm run dev
```

The custom server boots Next.js and Socket.IO on `http://localhost:3500`. The Next.js app is served from that port, and the Socket.IO endpoint lives at `/api/socketio`.

### Production build

```bash
npm run build
npm start
```

`npm start` runs the same custom server in production mode (expects a prebuilt `.next` directory). Logs are tee’d to `server.log`.

## Project Structure

```
src/
	app/
		api/                 # Application, contact, timeline REST endpoints
		components/          # Client-side UI components
		layout.tsx
		page.tsx             # Main dashboard experience
	components/            # Reusable modals, form controls, and shadcn/ui wrappers
	hooks/                 # Custom React hooks
	lib/                   # Prisma client, Socket.IO helpers, utilities
prisma/
	schema.prisma          # Data model
	db/                    # SQLite database file(s)
public/
	uploads/               # Stored applicant documents (gitignored except marker)
server.ts                # Custom Next.js + Socket.IO bootstrap
```

## Key Workflows

- **Add an application**: Use the “Add Application” button to open the multi-step form. Upload documents, set dates, and save. The client posts multipart form data to `POST /api/applications`.
- **Update progress**: Drag an application between statuses or edit it in place. PUT requests update status, dates, and completion flags while maintaining required fields.
- **Manage documents**: Upload, replace, and delete files. Files are stored under `public/uploads/<applicationId>/` and tracked in the `ApplicationDocument` model.
- **Contacts & timeline**: Separate API endpoints maintain recruiter contacts and timeline events so your notes stay organized per application.

## API Overview

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET /api/applications` | List all job applications with related documents |
| `POST /api/applications` | Create a new application (multipart for documents) |
| `PUT /api/applications/:id` | Update fields, status, and uploads for an application |
| `DELETE /api/applications/:id` | Remove an application and cascade related records |
| `GET/POST /api/contacts` | Manage recruiter contacts (application scoped) |
| `GET/POST /api/timeline-events` | Track interview milestones and custom events |
| `GET /api/health` | Simple readiness check |

All routes are implemented with Next.js App Router handlers in `src/app/api/**` and use Prisma for data access.

## Scripts

- `npm run dev` – Start custom dev server with auto-reload and logging
- `npm run build` – Build the Next.js app for production
- `npm start` – Run the production server (serves Next.js + Socket.IO)
- `npm run lint` – Run Next.js linting rules
- `npm run db:generate` – Generate Prisma client
- `npm run db:push` – Apply schema to the database
- `npm run db:migrate` / `npm run db:reset` – Manage migrations when using a migration workflow

## WebSocket example

The repository includes a lightweight Socket.IO echo server and example client under `examples/websocket/page.tsx`. Visit `/examples/websocket` while the dev server is running to test real-time messaging and validate the custom server wiring.

## Troubleshooting

- Delete `prisma/db/custom.db` if you need a clean slate, then re-run `npm run db:push`
- Ensure the uploads directory exists and is writable; it is auto-created on demand but ignored by git via `public/uploads/.gitignore`
- When running in production, build the app first (`npm run build`) so `server.ts` can serve the generated `.next` output

---

Happy tracking, and best of luck with your applications!
