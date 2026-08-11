# Manager

Manager is a dark-first personal life-management web app. This repository is
currently at Phase 1 of the build plan: the typed Next.js foundation,
responsive application shell, and Supabase email/password authentication are in
place.

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Supabase setup

Apply [the Phase 1 migration](supabase/migrations/202608110001_create_user_profiles.sql)
in the Supabase SQL Editor before creating users. The migration creates the
profile/settings tables, first-login trigger, and row-level-security policies.

In Supabase Authentication → URL Configuration, add `http://localhost:3000`
and the deployed application URL to the allowed redirect URLs. This is required
for email-confirmation links to return to the application.

## Continuous deployment

GitHub Actions validates every pull request and push to `main`. A successful
push to `main` triggers the production deployment workflow.

This application uses server-side auth and cannot be deployed to GitHub Pages.
Link this repository to a Vercel project, then add these repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in
the Vercel project's Production environment. Copy the final Vercel URL into
Supabase Authentication → URL Configuration.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
```
