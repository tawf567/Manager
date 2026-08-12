# Manager

Manager is a dark-first personal life-management web app. It is a static
Next.js application backed by Supabase and hosted on GitHub Pages.

## Features

- Email/password authentication with per-user row-level security.
- Objectives to anchor the areas of life that matter most.
- Fixed daily habits and flexible, date-specific tasks with completion history.
- Daily trackers for booleans, numbers, durations, time ranges, ratings,
  counters, currencies, and streaks.
- A performance dashboard based on real task completion and tracker data.
- An achievements timeline for recording meaningful milestones.

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

Then apply [the Phase 2 objectives migration](supabase/migrations/202608110002_create_objectives.sql).
It seeds Healthy, Wealthy, and Happiness for every existing user without
objectives, and automatically seeds them for new users.

Apply [the Phase 3 tasks migration](supabase/migrations/202608110003_create_tasks.sql)
to enable fixed daily tasks, flexible scheduled tasks, and dated completions.

Apply [the Phase 4 trackers migration](supabase/migrations/202608110004_create_trackers.sql)
to enable daily tracker creation and entries.

Apply [the Phase 5 achievements migration](supabase/migrations/202608110005_create_achievements.sql)
to enable the achievements timeline.

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
