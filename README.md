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

## Continuous validation

GitHub Actions validates every pull request and push to `main` by checking
formatting, types, linting, and the production build.

GitHub Pages can only host static files. The current app requires a Node.js
server for its secure Supabase SSR authentication and API routes, so it cannot
be deployed to Pages without changing that security architecture.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
```
