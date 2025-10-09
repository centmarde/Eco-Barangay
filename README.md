# 🚀 Vue 3 + Vuetify + Supabase Thesis Template

<div align="center">

![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Vuetify](https://img.shields.io/badge/Vuetify-1867C0?style=for-the-badge&logo=vuetify&logoColor=AEDDFF)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

### 🎯 **Zero-Config Auto-Layout Wrapper for Cross-Platform Development**

*Automate your layout phase by simply configuring JSON - No manual component wiring needed!*

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/centmarde/thesis-template-web-reusable?quickstart=1)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/centmarde/thesis-template-web-reusable)

</div>

## 🌱 Eco-Barangay — Community E-Waste Collection System

<div align="center">

![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Vuetify](https://img.shields.io/badge/Vuetify-1867C0?style=for-the-badge&logo=vuetify&logoColor=AEDDFF)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

</div>

Eco-Barangay is a community-focused web application template for coordinating electronic-waste (e-waste) collection at the purok and barangay level. It helps residents schedule pickups, track collected materials, provide safe handling instructions, and generate reports for local officials to manage disposal and recycling.

This repository is a Vue 3 + Vuetify starter that uses a JSON-driven configuration (`public/data/external-page.json`) to power landing pages, theming, navigation, and content without manual component wiring.

---

## ✨ What this template includes

- File-based routing and auto-layouts
- JSON-driven landing page configuration (`public/data/external-page.json`)
- Vuetify 3 for styling and components
- TypeScript + Pinia for typed state management
- Optional Supabase integration for auth and backend storage

## 🚀 Quick start

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/centmarde/thesis-template-web-reusable.git
cd thesis-template-web-reusable

# Install dependencies
npm install

# Start development server
npm run dev
```

### Customize for Eco-Barangay

1. Edit `public/data/external-page.json` to set project title, features, theme, and content. Do not change the JSON keys if your app code expects them.
2. Add or modify pages in `src/pages/` (auto-routed).
3. Update components in `src/components/` or theme colors in `src/themes/`.

---

## Project structure (relevant)

```
src/
├── components/       # UI components (auth, common, feature-specific)
├── controller/       # Data fetching and page controllers
├── pages/            # Auto-routed pages
├── stores/           # Pinia stores
├── layouts/          # Layout wrapper components
└── lib/              # Utilities and helpers

public/
└── data/
    └── external-page.json  # Landing page & app configuration
```

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

If you want the README to include more project-specific instructions (deployment, Supabase setup, or contributor guidelines), tell me what to add and I'll update it.