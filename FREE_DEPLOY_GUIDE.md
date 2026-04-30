# Free Deployment Guide for MyAfiyah

This app is ready to deploy for **free** on either **Vercel** or **Netlify**.

## Recommended option: Vercel (free)

1. Push this project to a GitHub repository.
2. Go to https://vercel.com/new
3. Import the GitHub repository.
4. Keep the defaults:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add these environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ENABLE_GOOGLE_AUTH=true`
6. Deploy.

Your free production URL will look like:

```text
https://your-project-name.vercel.app
```

## Free Netlify option

1. Push this project to GitHub.
2. Go to https://app.netlify.com/start
3. Import the repository.
4. Use:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add the same environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ENABLE_GOOGLE_AUTH=true`
6. Deploy.

Your free production URL will look like:

```text
https://your-project-name.netlify.app
```

## Supabase settings after deployment

In **Supabase Dashboard -> Authentication -> URL Configuration**:

- **Site URL**:
  - `https://your-project-name.vercel.app`
  - or `https://your-project-name.netlify.app`
- **Redirect URLs**:
  - `http://localhost:5173/login`
  - `http://127.0.0.1:4173/login`
  - `https://your-project-name.vercel.app/login`
  - or `https://your-project-name.netlify.app/login`

## Google Cloud OAuth settings

In your **Google Cloud Console** OAuth client:

### Authorized JavaScript origins
- `http://localhost:5173`
- `http://127.0.0.1:4173`
- `https://your-project-name.vercel.app`
- or `https://your-project-name.netlify.app`

### Authorized redirect URIs
- `https://emthnfxzvilegttpcihd.supabase.co/auth/v1/callback`

## Important note

- **Guest accounts** stay on the local device only.
- **Email / Google accounts** can sign in on other devices and keep synced data.
- If the app is uninstalled or local browser/app data is cleared, **guest data is lost**.
