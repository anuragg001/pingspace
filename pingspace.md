---
title: PingSpace – Private Self-Destructing Chat Rooms
description: A full stack realtime chat application where temporary rooms auto-expire, messages are ephemeral, and users can instantly destroy rooms.
category: project
date: 2026-03-05
tags:
  - nextjs
  - full-stack
  - realtime
  - upstash-redis
  - upstash-realtime
  - react-query
  - elysia
  - tailwind
---

## The Problem

Most chats are either:
- Too heavy for quick private conversations
- Not truly temporary
- Missing a clean “burn after reading” style flow

Sometimes you just want a fast room, a short exchange, and guaranteed cleanup.

No accounts.  
No long-term chat history.  
No clutter.

That’s what PingSpace solves.

---

## What This Does

PingSpace lets you:

- Create a secure temporary room in one click
- Join via room link (with room capacity control)
- Chat in realtime with instant message sync
- Track remaining room lifetime with self-destruct countdown
- Destroy the room manually at any time
- Auto-delete room metadata and messages when TTL expires

It is built for short-lived, private communication.

---

## 🖼️ Visual Preview Slots

<!-- IMAGE PLACEHOLDER 1: Add Lobby / Create Room screen image here -->
<!-- Example usage:
![PingSpace Lobby](./public/pingspace-lobby.png)
-->

---

## How It Works (User Journey)

1. You open the lobby (`/`).
2. A local anonymous username is generated and stored in browser localStorage.
3. Clicking **Create Secure Room** calls backend `POST /api/room/create`.
4. You are redirected to `/room/{roomId}`.
5. Room access is validated in proxy/middleware logic:
   - Room must exist
   - Room must not be full (max 2 users)
   - A room token is assigned in secure HTTP-only cookie
6. Inside the room:
   - Existing messages are fetched
   - TTL is fetched and shown as countdown
   - Realtime subscription listens for new messages and room destruction
7. Sending a message stores it in Redis and broadcasts to the room channel.
8. If room is destroyed manually (or expires), users are redirected to lobby with status flag.

---

## 🖼️ Visual Preview Slot 2

<!-- IMAGE PLACEHOLDER 2: Add Room Chat / Countdown / Destroy UI image here -->
<!-- Example usage:
![PingSpace Room](./public/pingspace-room.png)
-->

---

## Full Architecture

### Frontend (Next.js App Router)

- **Framework:** Next.js 16 + React 19
- **Routing:** App Router (`src/app/...`)
- **Data fetching:** TanStack React Query
- **UI styling:** Tailwind CSS v4
- **Client-side realtime hook:** Upstash Realtime client

Key pages:
- `src/app/page.tsx` → Lobby + room creation + error banners
- `src/app/room/[roomId]/page.tsx` → Chat room UI, timer, messaging, destroy action
- `src/app/layout.tsx` → Global layout + providers

### Backend API (Inside Next.js via Elysia)

The API is mounted under `/api` through:
- `src/app/api/[[...slugs]]/route.ts`

Core groups:
- `/api/room/create` → create room with metadata + TTL
- `/api/room/ttl?roomId=...` → fetch room TTL
- `/api/room?roomId=...` (DELETE) → destroy room and broadcast event
- `/api/messages?roomId=...` (POST/GET) → send/fetch messages

### Data + Realtime

- **Redis (Upstash):** room metadata + message lists + expiry control
- **Realtime (Upstash Realtime):** `chat.message` and `chat.destroy` events
- **Realtime endpoint:** `src/app/api/realtime/route.ts`

---

## Data Model and Keys (Redis)

PingSpace uses key-based ephemeral storage:

- `meta:{roomId}`
  - `connected: string[]`
  - `createdAt: number`
  - TTL applied (room lifetime)

- `messages:{roomId}`
  - List of message objects
  - Expiry aligned to room TTL

Message shape:
- `id`
- `sender`
- `text`
- `timestamp`
- `roomId`
- optional `token`

---

## Auth and Room Access Control

There is no traditional login system.

Instead, access uses room-scoped token logic:
- On first valid room entry, server issues cookie `x-auth-token`
- Token is stored in room’s `connected` list
- API auth middleware checks:
  - `roomId` query present
  - Cookie token present
  - token exists in room `connected` list

If validation fails, request is unauthorized.

Room guard also enforces **max 2 participants**.

---

## Realtime Event Flow

### Event: `chat.message`
- Triggered when a new message is posted
- Room clients receive event
- UI refetches message list for fresh state

### Event: `chat.destroy`
- Triggered when room is deleted
- Clients redirect to lobby with `?destroyed=true`

This keeps all participants synchronized without manual refresh.

---

## Self-Destruct Lifecycle

Room TTL is set at creation:
- `ROOM_TTL_SECONDS = 10 minutes`

Two destruction paths:
1. **Automatic**: TTL expires in Redis
2. **Manual**: user presses **DESTROY NOW** button

On destruction:
- Destroy event emitted
- Room metadata/messages deleted
- Users moved back to lobby

---

## Project Structure Snapshot

- `src/app/page.tsx` → lobby experience
- `src/app/room/[roomId]/page.tsx` → room chat UI
- `src/app/api/[[...slugs]]/route.ts` → Elysia API routes
- `src/app/api/[[...slugs]]/auth.ts` → auth middleware
- `src/app/api/realtime/route.ts` → websocket/realtime handler
- `src/lib/redis.ts` → Upstash Redis client
- `src/lib/realtime.ts` → realtime schema and event typing
- `src/lib/realtime-client.ts` → client realtime hooks
- `src/lib/client.ts` → typed API client
- `src/components/providers.tsx` → Query + Realtime providers
- `src/hooks/use-username.ts` → anonymous username generation
- `src/proxy.ts` → room-level gateway/auth bootstrap

---

## Environment and Runtime Requirements

You need valid Upstash environment variables (typically in `.env.local`) for:
- Redis connectivity
- Realtime service access (if required by your setup)

Then run:
- `npm install`
- `npm run dev`

Open `http://localhost:3000`.

---

## Why This Project Is Strong

PingSpace demonstrates:
- Realtime event-driven architecture
- Ephemeral data design with TTL-based lifecycle
- Lightweight room-scoped auth strategy
- Full stack integration in a single Next.js codebase
- Practical UX for temporary private communication

It is a focused product idea executed with clean full stack foundations.

---

## Current Status

Working core features:
- Room creation
- Room join control (capacity + token)
- Realtime messaging
- Room timer
- Manual destroy
- Auto-expire behavior

Potential future upgrades:
- Better delivery/read indicators
- Message encryption at rest/in transit extensions
- Multi-room dashboard
- Share analytics and room activity insights
- Optional account-based identity layer
