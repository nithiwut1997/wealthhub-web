# Deployment

WealthHub Web is a Next.js application that is statically exported. A production
build writes the deployable site to `out/`; it does not require a Next.js server.

Production is hosted in Amazon S3 and delivered through CloudFront. The production
deployment is triggered by the GitHub Actions workflow on changes to `main` or by a
manual workflow dispatch. GitHub Actions authenticates to AWS with GitHub OIDC and
AssumeRole, without long-lived AWS access keys.

`NEXT_PUBLIC_API_BASE_URL` is read from the `production` GitHub Environment and
injected during `npm run build`. Because `NEXT_PUBLIC_*` values are embedded in the
browser bundle, changing it requires a new build and deployment.

Environment-specific deployment documentation lives in a corresponding directory.
Additional environments can be added under `deployment/` when they are needed.
See [`prod/README.md`](prod/README.md) for current production requirements.
