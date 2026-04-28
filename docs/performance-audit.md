# Performance & Memory Audit (April 19, 2026)

## Scope

Reviewed these areas:

- Next.js app routes (`src/app/*`)
- Supabase client setup (`src/lib/supabaseClient.ts`)
- Seller auth pages (`src/app/seller/*`)

## Findings

### 1) Root landing page is fully client-rendered

`src/app/page.tsx` is marked with `'use client'`, but the majority of its content is static markup.

**Impact**

- Larger client JavaScript bundle than necessary.
- Slower initial load and hydration on low-end devices.
- More memory pressure in the browser from extra hydrated nodes.

**Recommendation**

- Convert the landing page to a Server Component.
- Isolate only interactive sections (e.g., mobile menu toggle) into small Client Components.

---

### 2) Potential timeout leak on seller signup success flow

Seller signup used an unmanaged `setTimeout` to redirect after success.

**Impact**

- If a user navigates away before timeout completes, callback may run after unmount.
- Can trigger warnings and unnecessary retained closures in long sessions.

**Status**

✅ Fixed in this branch by storing timeout ID in a ref and clearing it on unmount.

---

### 3) Supabase client lacked fail-fast env validation and dev singleton

Supabase env variables were asserted using non-null (`!`) and client creation had no explicit development singleton strategy.

**Impact**

- Misconfigured environments fail later and less clearly.
- In dev/HMR scenarios, avoidable duplicate client instances can occur, increasing memory churn.

**Status**

✅ Improved in this branch with:

- explicit env checks and clear errors,
- a global dev singleton,
- explicit auth behavior configuration.

---

### 4) Type safety gaps (`any`) in reusable form components

Seller signup helper components used `any` props.

**Impact**

- Reduced compile-time guarantees.
- Higher chance of runtime bugs and avoidable re-renders from accidental prop misuse.

**Status**

✅ Replaced `any` with explicit TypeScript prop types.

## Frontend Optimization Roadmap

1. **Component boundary optimization**
   - Make route pages Server Components by default.
   - Move only event-driven UI into client islands.

2. **Bundle & rendering optimization**
   - Use `next/dynamic` for heavy optional UI blocks.
   - Replace large icon imports with selective imports (already partially done).
   - Add `next/image` for hero/media assets once real images are available.

3. **Data-fetching strategy**
   - For public marketplace listings, use server-side fetch with cache controls (`revalidate`, `tags`) instead of client-side fetch loops.
   - For seller dashboard real-time updates, scope subscriptions narrowly and unsubscribe on route transitions.

4. **Observability**
   - Add Web Vitals tracking (`reportWebVitals`) and an error tracker.
   - Track p75 LCP/INP/CLS and JS bundle size per deploy.

## Backend Optimization Roadmap

1. **Database access patterns (Supabase/Postgres)**
   - Add indexes for high-cardinality query paths (e.g., `sellers.status`, `orders.seller_id`, `orders.created_at`).
   - Use pagination with deterministic ordering for queue/order lists.

2. **RLS and policy performance**
   - Keep RLS policies simple and index columns used in policy predicates.
   - Audit policies for unnecessary subqueries.

3. **Queue state correctness + throughput**
   - Use transaction-safe updates for order status transitions.
   - Add idempotency keys for payment callbacks/webhooks.

4. **Caching and fan-out control**
   - Cache read-heavy marketplace endpoints at edge/CDN where possible.
   - Debounce or batch real-time updates to clients during spikes.

## Suggested Next Implementation Steps

- Refactor landing page into server + client islands.
- Add a minimal `/seller/dashboard` skeleton with SSR and pagination-ready data contract.
- Introduce database migration scripts for indexing and order status constraints.
- Add lightweight performance budgets in CI (build size + Lighthouse smoke).
