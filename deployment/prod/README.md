# Production deployment

The production deployment is implemented by `.github/workflows/deploy.yml`. Create
a GitHub Environment named `production` and define these environment variables:

- `AWS_DEPLOY_ROLE_ARN`: IAM role assumed by GitHub Actions through OIDC
- `AWS_S3_BUCKET`: destination bucket name
- `CLOUDFRONT_DISTRIBUTION_ID`: distribution to invalidate after upload
- `NEXT_PUBLIC_API_BASE_URL`: public WealthHub Spring Boot API base URL embedded at
  build time

These values are deployment identifiers or browser-visible configuration, so they
are expected as GitHub Environment variables rather than secrets. The AWS region is
fixed in the workflow as `ap-southeast-1`. The bucket, distribution, IAM role, OIDC
trust, DNS, and other AWS resources are managed separately and are not created here.
