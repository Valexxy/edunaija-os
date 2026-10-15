# Deployment notes

## GitHub
```bash
git init
git add .
git commit -m "chore: initial learning platform foundation"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Do not commit `.env.local`, service-role keys, Gemini keys, learner exports, or database dumps.

## Supabase
- Create separate development, staging, and production projects when the product has real users.
- Apply migrations through reviewed pull requests.
- Enable backups appropriate to the selected plan and test restoring them.
- Configure Auth redirect URLs to exact deployment URLs.
- Keep the service-role key server-side and use the anon key for user-session clients.

## Hosting
This app can run on a compatible Node.js host. For Cloudflare Workers, use the current OpenNext for Cloudflare adapter and follow its version-specific deployment guide; do not assume a plain Next.js deploy command is enough.
- Add environment variables through the hosting provider's secret manager.
- Run typecheck, lint, unit tests and end-to-end tests in CI before deployment.
- Use separate preview/staging and production environments.

## Release gate
Do not enable `ENABLE_UNAUTHENTICATED_TUTOR`. The tutor route deliberately returns 503 unless explicitly enabled, and enabling it is not safe for public launch. First implement authentication, server-side authorization, quotas, rate limiting, content-safety handling, cost monitoring, and privacy review.
