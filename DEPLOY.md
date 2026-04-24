# Deployment Guide — Stardust

This guide will walk you through publishing **Stardust** to GitHub and GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your machine
- Node.js and npm installed

## Step 1: Initialize Git in Your Local Project

Open a terminal in the project folder and run:

```bash
git init
git add .
git commit -m "Initial commit: Stardust cosmic screensaver"
git branch -M main
```

## Step 2: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com/new)
2. Create a new repository named **`stardust`**
3. Keep it public (so people can discover it)
4. Do NOT add a README, .gitignore, or license (you already have them locally)
5. Click **Create repository**

## Step 3: Connect Your Local Repo to GitHub

Copy the HTTPS URL from the GitHub repo page. Then run:

```bash
git remote add origin https://github.com/<YOUR_USERNAME>/stardust.git
git push -u origin main
```

Replace `<YOUR_USERNAME>` with your actual GitHub username.

## Step 4: Install the `gh-pages` Dependency

This is already in `package.json`, so just run:

```bash
npm install
```

This installs both `vite` and `gh-pages`.

## Step 5: Deploy to GitHub Pages

Run the deploy script:

```bash
npm run deploy
```

This will:
1. Build the project (`npm run build`)
2. Push the `dist/` folder to the `gh-pages` branch
3. GitHub Pages will automatically publish it

## Step 6: Enable GitHub Pages

1. Go to your repository on GitHub
2. Open **Settings** > **Pages**
3. Under **Build and deployment**, select:
   - **Source**: Deploy from a branch
   - **Branch**: `gh-pages`
   - **Folder**: `/(root)`
4. Click **Save**

GitHub will show you the live URL in about 1–2 minutes. It will be:

```
https://<YOUR_USERNAME>.github.io/stardust/
```

## Done! 🚀

Your app is now live. Share the link and watch people enjoy the cosmic screensaver while discovering your GitHub profile!

## Optional: Local Development

To test locally before deploying:

```bash
npm run dev
```

The dev server will run at `http://localhost:5173/`.

## Updating Your App

After making changes:

1. Commit your changes:

```bash
git add .
git commit -m "Update: Your change description"
git push
```

2. Deploy the new build:

```bash
npm run deploy
```

The GitHub Pages site will update automatically within a few minutes.

## Troubleshooting

**The app looks broken on GitHub Pages**
- Make sure the base path in `vite.config.js` is `/stardust/`
- Run `npm run build` locally to test

**Service Worker not updating**
- Clear your browser cache for the GitHub Pages URL
- Unregister old service workers in DevTools > Application > Service Workers

**Can't push to GitHub**
- Make sure your git remote is correct: `git remote -v`
- Check your GitHub personal access token or SSH key is set up

---

For more help, check the [GitHub Pages documentation](https://docs.github.com/en/pages).
