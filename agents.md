# Aura by HANI
Stack: Next.js (App Router, TypeScript, Tailwind, Framer Motion), Go (Chi), PostgreSQL.
Follow @design.md for all UI work.

## Rules
- Mobile-first. Test every page at 375px before desktop.
- Use next/image for all photos. Never store images in the database, only URLs.
- Go: handlers -> services -> repository layers. Parameterized SQL only. Return JSON errors.
- Secrets only in .env (never commit, never print). Keep .env.example updated.
- Admin routes require auth. Validate upload type and size.
-  i want Small commits,which is one feature per branch. Add tests for every new API endpoint.
-Don’t let it auto-run commands like rm -rf, DROP TABLE or git push --force. Keep a denylist, or approve commands manually.
- Ask before deleting files, dropping tables, or adding new dependencies.