# Manager

Manager is a dark-first personal life-management web app. This repository is
currently at Phase 1 of the build plan: the typed Next.js foundation,
responsive application shell, and Supabase email/password authentication are in
place. It is configured as a static GitHub Pages app backed by Supabase.

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
and `https://tawf567.github.io/Manager/auth/callback/` to the allowed redirect
URLs. This is required for email-confirmation links to return to the application.

## GitHub Pages deployment

GitHub Actions validates every pull request and push to `main` by checking
formatting, types, linting, and the production build. Each successful push to
`main` then deploys the static build to GitHub Pages.

Add these GitHub Actions secrets before the first deployment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

They are public browser configuration values; database access is restricted by
the Supabase row-level-security policies in the Phase 1 migration. In repository
settings, set Pages → Source to **GitHub Actions**.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
```
