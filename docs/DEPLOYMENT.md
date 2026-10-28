# Deployment and hosting costs

Planning notes for Personame, checked October 28, 2026. Prices are in USD, exclude taxes, and can change. Usage estimates are not spending caps.

## Recommended setup

- **Vercel** hosts the Next.js application, server-side APIs, and authentication routes.
- **Neon** hosts PostgreSQL, accessed through Prisma.
- **GitHub** holds the code and runs the existing verification workflow.
- **Porkbun** can remain the domain registrar and DNS provider.

Personame needs a server runtime and a database. Its current implementation cannot be deployed as a static GitHub Pages site.

Start with **Vercel Pro + Neon Free** for a small commercial launch. A personal, non-commercial prototype can start with Vercel Hobby + Neon Free instead. Vercel Hobby is restricted to personal, non-commercial use; public access alone does not determine which plan applies.

## Monthly budget

| Setup | Estimated monthly cost | When to use it |
| --- | --- | --- |
| Vercel Hobby + Neon Free | $0 within free limits | Personal, non-commercial prototype |
| Vercel Pro + Neon Free | $20 plus any Vercel overages | Small commercial launch within database limits |
| Vercel Pro + Neon Launch | About $35 initially, usage-dependent | Paid database capacity as usage grows |

**Allow roughly $20–$40/month for a small commercial launch.** This is a planning estimate, not a quote or a guaranteed ceiling. Larger traffic, database activity, storage, or additional developer seats can raise the bill.

Current published pricing:

- **Vercel Hobby:** $0/month, with usage limits and the non-commercial restriction.
- **Vercel Pro:** starts at $20/month for one developer seat, with $20 of included usage credit. Usage beyond included allowances is additional.
- **Neon Free:** 1 GB database storage and 100 compute-unit hours per project each month. Compute-unit hours are a capacity measure, not a count of quiz completions.
- **Neon Launch:** usage-based, with no monthly minimum. Current rates include $0.106 per compute-unit hour and $0.35 per GB-month of database storage. Neon illustrates intermittent small-database usage at about $15/month; this is an example workload, not a fixed plan fee. Paid plans do not retain the Free plan's usage allowances.

A subdomain such as `personame.metamodernmonkey.com` does not require buying another domain. Continue paying the existing Porkbun domain renewal. The subdomain above is a proposed address, not a configured deployment.

Monitor actual usage after launch and configure the hosting providers' available spending controls and alerts. A reliable per-user cost estimate needs real traffic and database measurements.

## Deployment steps

1. **Create a production PostgreSQL database in Neon.** Choose an application region close to the database region. Keep production data separate from local development, CI, and preview databases.
2. **Configure Prisma connections.** Use a pooled connection for runtime traffic and a direct connection for migrations. The repository currently only configures `DATABASE_URL`; adding a `DIRECT_URL` variable also requires wiring `directUrl` into the Prisma 6 datasource.
3. **Import `aaronbeall/personame` into Vercel.** Select the Next.js framework preset and Node.js 22, matching CI. Use `main` as the production branch.
4. **Set production environment variables** using the table below. Generate a fresh production authentication secret; do not copy the CI secret or commit credentials.
5. **Apply the checked-in database migrations** with `npx prisma migrate deploy` against the production database before releasing the application. Configure this as a controlled release step; preview builds must not migrate the production database.
6. **Generate Prisma Client before building.** Configure the Vercel build command as `npx prisma generate && npm run build`.
7. **Configure OAuth callbacks** for the final HTTPS hostname. For Google, use `https://<your-domain>/api/auth/callback/google`; for GitHub, use `/api/auth/callback/github` on the same hostname.
8. **Add the custom domain in Vercel**, then enter the DNS record Vercel specifies in Porkbun. Once HTTPS is ready, verify sign-in, quiz creation, publishing, anonymous participation, and result links.
9. **Import starter quizzes once**, if wanted, following [the seed catalog guide](SEED_QUIZZES.md). Seeding should remain an explicit operation rather than running on every deployment.

| Variable | Production value |
| --- | --- |
| `DATABASE_URL` | Pooled production PostgreSQL URL |
| `DIRECT_URL` | Direct PostgreSQL URL, after adding Prisma datasource support |
| `NEXTAUTH_URL` | Canonical HTTPS site URL |
| `NEXTAUTH_SECRET` | Newly generated production secret |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Production Google OAuth credentials |
| `GITHUB_ID`, `GITHUB_SECRET` | Optional GitHub OAuth credentials |

Vercel's Git integration can deploy production updates from `main` and create pull-request previews. The existing GitHub Actions workflow runs verification; it does not currently deploy Personame or apply production migrations. Git-based automatic deployment and successful CI are separate concerns unless explicitly connected in the release process.

## Repository readiness

At the time of writing, Personame runs locally and its code is pushed to GitHub. No production deployment was found. Before deploying, finish the pooled/direct connection configuration, Prisma generation build setup, and production migration release step. Creating this document does not configure hosting, DNS, or production secrets.

## Sources

- [Vercel pricing](https://vercel.com/pricing)
- [Vercel Hobby restrictions](https://vercel.com/docs/plans/hobby)
- [Neon pricing and workload estimates](https://neon.com/pricing)
- [Prisma connections to Neon](https://neon.com/docs/guides/prisma)
- [Vercel Git deployments](https://vercel.com/docs/git)
- [NextAuth configuration](https://next-auth.js.org/configuration/options)
- [NextAuth Google provider](https://next-auth.js.org/providers/google)
- [Vercel custom domains](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
