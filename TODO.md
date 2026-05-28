# TODO

- [x] Diagnose why `/api/auth/register` returned 404 on deployed frontend.
- [x] Verify backend mounts auth routes at `/api/auth` (`backend/src/index.ts`, `backend/src/routes/auth.ts`).
- [x] Check deployment config (`render.yaml`) for correct `NEXT_PUBLIC_API_URL` pointing to backend.
- [x] Fix README pricing/pickup text to match website content.
- [x] Update GitHub with code changes (create branch + commit + push + PR).
- [x] Re-check `shop/page.tsx` logic (shop loads from `/api/shop-products`, falls back to `/api/services`, and filters by `isActive`).


