<div align="center">

# Invoice Tracker

React + Next.js application that lets import shipment invoices from JSON, store them in Supabase, and review the latest invoice values per shipment.

</div>

## Features

- Drag-and-drop JSON upload modal with preview before persisting data
- Zod-validated `/api/invoices/upload` endpoint that upserts companies/shipments and stores invoices in Supabase
- Automatic handling of corrected invoices: when a new invoice is uploaded with the same tracking number, the shipment is updated with the latest invoice values (price and weight)
- Main dashboard listing every shipment with the latest invoice price, invoice count, and filters by company
- Dark/light/system themes plus English/Czech locale toggle with persisted preferences

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Supabase Postgres for storage and serverless functions via Route Handlers
- Tailwind CSS + shadcn/ui + lucide-react
- Zustand for persisted UI preferences

## Prerequisites

- Node.js ≥ 20
- npm (or pnpm/yarn) – commands below assume npm
- A Supabase project (can be a free-tier hosted instance)

## Local Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create Supabase tables**

   - Open the Supabase SQL editor for your project.
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`.
   - Run the script once to create the `companies`, `shipments`, and `invoices` tables plus Row Level Security policies.

   You can also run the file through the Supabase CLI:

   ```bash
   supabase db push --file supabase/migrations/001_initial_schema.sql
   ```

3. **Configure environment variables**

   Create `.env.local` in the repo root with your project credentials (Settings → API in the Supabase dashboard):

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   The publishable (anon) key is sufficient because the backend only performs public inserts/selects allowed by the SQL policies.

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit http://localhost:3000 to open the dashboard.

5. **Import invoice data**

   - Click **Upload Invoices** or the empty state CTA.
   - Drag one of the sample files from `data/` (e.g., `invoices_1.json`) into the modal, review the preview table, then confirm.
   - Re-upload with `invoices_2.json` to test the "latest invoice wins" flow—shipments are matched by tracking number, and when a corrected invoice is uploaded for an existing shipment, the system updates the shipment with the latest invoice values (price and weight). See `data/README.md` for details on the data structure.

## Testing the API Directly (optional)

Use any HTTP client to post JSON arrays to `/api/invoices/upload`; the payload schema matches the samples in `data/`. Example with `curl`:

```bash
curl -X POST http://localhost:3000/api/invoices/upload \
  -H "Content-Type: application/json" \
  --data "@data/invoices_1.json"
```

## Project Structure Highlights

- `app/page.tsx` – Home dashboard that fetches shipments and orchestrates the upload modal
- `app/api/**` – Route handlers for invoices, shipments, and companies
- `lib/db/queries.ts` – Supabase helpers for upserting and querying invoice data
- `components/` – UI building blocks (filters, cards, modal, empty state, toggles)

## Deployment Notes

- Deploy on Vercel (or any Next.js host) and supply the same Supabase environment variables.
- The database must be reachable from the hosting environment; Supabase Row Level Security policies already allow public read/write for this exercise.

## License

MIT
