# Anand Sagar — Portfolio Website 🚀

A high-tech, futuristic developer portfolio inspired by the dark sci-fi HUD aesthetics of [SpideyTracker](https://spideytracker.com/). Built with React 19, Vite, and a custom CSS design system featuring multi-color neon card glow widgets, terminal boot animation, interactive filterable certificate gallery, and responsive layout.

---

## 🌟 Features & Aesthetics

- **Retro-Sci-Fi Boot Loader**: Monospace terminal boot sequence simulation with skip button.
- **Glassmorphism & Neon HUD Cards**: Multi-color border and glow effects (Cyan `#2fc9ff`, Orange `#f89d51`, Green `#00ff88`, Purple `#a855f7`, Red `#ff4444`).
- **Scanline & Subtle Grid Background**: CRT monitor styling with animated floating particles.
- **Typing Hero & Live Counters**: Typewriter effect with animated numeric stat counters that trigger on viewport entry.
- **Interactive Certificate Showcase**:
  - Filter by category (`All`, `AI/ML`, `Robotics`, `Programming`, `Cloud`).
  - Click any certificate to open an expanded HUD Lightbox modal.
- **Achievements Timeline**: Glowing vertical timeline with milestone badges.
- **Projects Showcase**: Interactive cards with tags, GitHub links, and live demo buttons.
- **Sticky Glass Navbar & Mobile Drawer**: Section tracking with smooth scrolling and responsive hamburger menu.
- **Terminal Contact Form**: Cyberpunk command-prompt contact form with real-time feedback.

---

## 📁 Project Structure

```text
profolio/
├── index.html                  # Metadata, Orbitron & Space Mono fonts
├── src/
│   ├── main.jsx                # Application root
│   ├── App.jsx                 # Main layout & section orchestration
│   ├── index.css               # Core design system tokens & animations
│   ├── hooks/
│   │   └── useScrollReveal.js  # IntersectionObserver scroll reveal hook
│   ├── data/
│   │   └── portfolioData.js    # Single source of truth for all content!
│   └── components/
│       ├── BootLoader.jsx / .css     # Initial boot sequence
│       ├── Navbar.jsx / .css         # Fixed header with active state
│       ├── Hero.jsx / .css           # Hero banner & animated counters
│       ├── About.jsx / .css          # Bio & tech interests
│       ├── Skills.jsx / .css         # Neon categorized skill cards
│       ├── Projects.jsx / .css       # Project cards with links
│       ├── Achievements.jsx / .css   # Milestones timeline
│       ├── Certificates.jsx / .css   # Filterable gallery + modal dialog
│       ├── Education.jsx / .css      # Degree & coursework
│       ├── Experience.jsx / .css     # Work & open-source history
│       ├── Resume.jsx / .css         # Download button & skill highlights
│       ├── Contact.jsx / .css        # Futuristic message terminal
│       └── Footer.jsx / .css         # Social links & copyright
└── public/
    └── favicon.svg             # Glowing neon spider favicon
```

---

## 🛠️ How to Customize Your Content

All data is centralized in **`src/data/portfolioData.js`**. You can update your information without touching JSX or CSS:

1. **Personal Information**: Update `personalInfo` (name, tagline, email, GitHub, LinkedIn, resume link).
2. **Key Metrics**: Modify `stats` numbers and labels.
3. **Projects**: Add, remove, or modify items in `projects`.
4. **Certifications**: Add certificate titles, issuers, dates, categories, and credential links in `certificates`.
5. **Achievements**: Add awards, hackathon wins, and publications in `achievements`.
6. **Education & Experience**: Update degrees, companies, and roles.

---

## 🚀 Running Locally

Ensure you are using **Node.js v18+** (Node v20 or v22 recommended):

```bash
# If using nvm
nvm use 22

# Start development server
npm run dev

# Run Oxlint
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server will be accessible at `http://localhost:5173/`.
