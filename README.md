# Gate of Catalogue (gofca)

Gate of Catalogue (gofca) is a circle/booth directory website for convention events like Comifuro or Comipara. It features a catalog of items and a personal wishlist/PO tracker for visitors.

## Features

- **Event Directory:** View lists of circles (name, booth code, days available, fandom tags) by event.
- **Circle Details:** View basic info, social media links (Twitter/IG), and a catalog of items sold by the circle.
- **Personal PO Tracker ("My List"):** A private list for each user to track their pre-orders. Users can add items from the official catalog or manually input items (even from random tweets). Features include tracking final price, deadline, decision status, and progress notes.
- **Export/Import Excel:** Users can easily export their tracker to `.xlsx` or import their existing manual tracking sheets.

## Tech Stack

- **Frontend:** Next.js (App Router)
- **Hosting:** Cloudflare Pages
- **Database:** Neon (Serverless Postgres)
- **Object Storage:** Backblaze B2 (for catalog images)
- **CDN:** Cloudflare (Bandwidth Alliance)
- **Auth:** Neon Auth (based on Better Auth)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Data Concepts

This project has two distinct concepts of data:
1. **Official Catalog Data:** Managed via an admin panel. This is the single source of truth for all visitors, detailing events, circles, and catalog items.
2. **Personal User Lists:** Private to each account. Users have full CRUD access to their own items, which are strictly isolated from other users' lists.
