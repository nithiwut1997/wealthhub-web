# Production deployment

The production deployment is implemented by `.github/workflows/deploy.yml` and uses
the GitHub Environment named `production`.

Configure these GitHub Environment secrets:

- `AWS_DEPLOY_ROLE_ARN`: IAM role assumed by GitHub Actions through OIDC
- `AWS_S3_BUCKET`: destination bucket name
- `CLOUDFRONT_DISTRIBUTION_ID`: distribution to invalidate after upload

Configure this GitHub Environment variable:

- `NEXT_PUBLIC_API_BASE_URL`: public WealthHub Spring Boot API base URL

`NEXT_PUBLIC_API_BASE_URL` is intentionally a variable rather than a secret because
Next.js embeds it into the browser bundle at build time. The AWS region is fixed in
the workflow as `ap-southeast-1`. The bucket, distribution, IAM role, OIDC trust,
DNS, and other AWS resources are managed separately and are not created here.
