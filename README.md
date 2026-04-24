# 🌌 Stardust — String Theory

<p align="center">
  <video src="assets/demo.mp4" autoplay loop muted playsinline width="800"></video>
</p>

<p align="center">
  <strong>A high-performance cosmic screensaver that doubles as an interactive developer card.</strong>
</p>

<p align="center">
  <a href="https://criselias-dev.github.io/stardust/">
    <img src="https://img.shields.io/badge/View%20Live-GitHub%20Pages-blue?style=for-the-badge">
  </a>
  <img src="https://img.shields.io/badge/PWA-Ready-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/Built%20with-Vite-646CFF?style=for-the-badge">
  <img src="https://img.shields.io/badge/Performance-6.8KB%20gzipped-black?style=for-the-badge">
</p>

<p align="center">
  ▶️ If the video doesn't play, <a href="assets/demo.mp4">watch it here</a>
</p> 

It brings galaxies, filaments, and dark matter to life in your browser. Relax while watching a beautiful visualization of the universe—and discover my GitHub profile along the way.


## ✨ Features

- **Breathtaking Canvas Animation** — Real-time visualization of galaxy dynamics, dark matter fields, and cosmic dust
- **Smooth 60 FPS Performance** — Optimized collision detection and math calculations
- **Progressive Web App** — Install as a native app on any device, works offline
- **Responsive Design** — Works seamlessly on desktop, tablet, and mobile
- **Portfolio Integration** — Direct link to your GitHub profile with a sleek Octocat button

## 🚀 Quick Start

### Run Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:5173/` to see the animation in real-time.

### Deploy to GitHub Pages

```bash
npm run deploy
```

That's it! Your app will be live at `https://<username>.github.io/stardust/` within 1–2 minutes.

See [DEPLOY.md](./DEPLOY.md) for detailed step-by-step instructions.

## 📦 What's Included

- **Modular ES6 Architecture** — Each cosmic component (galaxies, filaments, dark matter) is a separate module
- **Service Worker** — Full offline support with smart caching
- **PWA Manifest** — Install on any device as a standalone app
- **Optimized Build** — Minified production build is only **6.8 KB** gzipped
- **Accessibility** — ARIA labels, semantic HTML, responsive viewport

## 🎯 Performance Optimizations

- Distance collision checks use squared values to avoid expensive `Math.sqrt()` calls
- Visible-only rendering reduces draw calls on large viewport
- Adaptive filament linking for smooth connection rendering
- Efficient service worker caching strategy

## 📱 Responsive & Installable

Works on:
- ✅ Chrome/Edge (Windows, macOS, Linux)
- ✅ Firefox
- ✅ Safari (macOS, iOS)
- ✅ Mobile browsers (Android Chrome, iOS Safari)

**Install as an app:** Most browsers will show an "Install" prompt when you visit. Click it to add Stardust to your home screen!

## 🛠 Development

### Project Structure

```
src/
├── main.js           # App entry point, animation loop
├── Galaxy.js         # Galaxy rendering and physics
├── DarkMatter.js     # Dark matter nodes
├── StarDust.js       # Cosmic dust particles
├── Filaments.js      # Galaxy network connections
├── Explosion.js      # Merger effect animation
├── math.js           # Optimized mathematical helpers
├── config.js         # Configuration constants
└── style.css         # Responsive styling
public/
├── manifest.webmanifest  # PWA configuration
├── service-worker.js     # Offline support
└── icons/                # PWA assets
```

### Available Scripts

- `npm run dev` — Start dev server with HMR
- `npm run build` — Build for production (outputs to `dist/`)
- `npm run preview` — Preview production build locally
- `npm run deploy` — Build and deploy to GitHub Pages

## 📄 License

ISC © 2026 Cris Elias

## 🌟 Why This Project?

This isn't just eye candy—it's a **portfolio piece that works for you**:

1. **Showcases Coding Skills** — Modular architecture, performance optimization, canvas expertise
2. **Demonstrates UX Thinking** — Responsive design, PWA capabilities, accessibility
3. **Leads to Your GitHub** — Every visitor sees your profile link in the interface
4. **Easy to Share** — One URL does everything—entertainment + recruitment

Perfect for sharing with friends, colleagues, or as a talking point in interviews.

## 🚀 Get Started Now

1. Clone or fork this repo
2. Run `npm install && npm run dev`
3. See it live locally at `http://localhost:5173/`
4. Deploy with `npm run deploy`
5. Share the GitHub Pages URL and watch the stars come in

---

**Questions?** Read [DEPLOY.md](./DEPLOY.md) for deployment help or [CHECKLIST.md](./CHECKLIST.md) for what's been optimized.

Vibe-coded ✨ for your cosmic inspiration!