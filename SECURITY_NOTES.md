# Security Notes

## JWT signing key rotation (H-1 / H-7) — ACTION REQUIRED ON REDEPLOY

The JWT signing key that was previously committed to git history
(`S3Cr3t0P4r4L4sT4rt4sD3Ch0c0l4t3!!`, in `Backend/FitTrack/appsettings.Development.json`)
must be treated as compromised, since it is permanently visible in git history
(history rewrite was explicitly declined for this project, so it cannot be scrubbed).

A new strong random key has been generated locally for development use in
`Backend/FitTrack/appsettings.Development.json` (this file is now gitignored and
untracked — see `appsettings.Development.json.example` for the template).

**When the backend is redeployed on Render**, the `Jwt:Key` environment variable
(or however it's wired into Render's config, e.g. `Jwt__Key`) must be manually
rotated in the Render dashboard to a new strong random value — do not reuse the
old compromised key or the new local-dev key committed nowhere. Generate one with:

```bash
openssl rand -base64 64
```

This step could not be performed as part of this pass since Render access was
explicitly out of scope / unavailable.
