# Interactive Periodic Table

An interactive chemistry learning app built with React, Vite, Tailwind CSS, and Three.js. The project presents all 118 elements through a responsive periodic table, periodic trend heatmaps, atom shell diagrams, molecule visualization, element comparison, quizzes, favorites, and a broad chemistry lab workspace.

The app is frontend-only. Element data, molecule data, quiz content, and chemistry helper logic live inside the repository, while user preferences and progress are stored locally in the browser.

## Features

- Interactive periodic table with all 118 elements
- Search, category, phase, and block filters
- Element detail drawer with properties, summaries, uses, and actions
- Favorites stored in `localStorage`
- Periodic trend heatmaps for atomic mass, atomic radius, electronegativity, ionization energy, melting point, boiling point, and density
- Side-by-side element comparison with automatic chemistry insights
- Bohr-style atom shell visualizer
- Three.js molecule viewer with guided categories, search, labels, atom selection, orbit controls, view modes, and PNG export
- Quiz and games section with levels, timed questions, daily challenge, flashcards, guess-the-element mode, score history, and streak tracking
- Chemistry Lab page with formula tools, molar mass, bond prediction, equation balancing, titration, electrolysis, isotope/decay, VSEPR, orbital, redox, pH, gas law, dilution, and other study panels
- Guided Mode and Learning Mode in Chemistry Lab with experiment icons, difficulty/type/topic labels, search, filters, beginner path, step-by-step instructions, completion progress, safety notes, and focused experiment navigation
- Syllabus Map page connecting every Chemistry Lab tool to Class 8-12, NEET, JEE Main, and JEE Advanced chemistry tags
- Theme settings including dark/light mode, compact tiles, reduced motion, high contrast, color themes, and supported English/Hindi study panels
- PWA manifest and service worker for installable/offline-friendly behavior

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS
- Three.js
- Lucide React icons
- Browser `localStorage`
- Service Worker and Web App Manifest

## Getting Started

### Prerequisites

Install Node.js 18 or newer.

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Vite will print a local development URL, usually:

```text
http://localhost:5173
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Available Scripts

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Creates an optimized production build in `dist/`.

```bash
npm run preview
```

Serves the production build locally for verification.

## Project Structure

```text
Interactive-PeriodicTable/
+-- public/
|   +-- manifest.webmanifest
|   +-- periodic-icon.svg
|   `-- sw.js
+-- src/
|   +-- components/
|   |   +-- common/
|   |   +-- compare/
|   |   +-- elements/
|   |   +-- layout/
|   |   +-- periodic-table/
|   |   +-- quiz/
|   |   `-- visualizers/
|   +-- data/
|   |   +-- categories.js
|   |   +-- elements.js
|   |   +-- molecules.js
|   |   +-- generatedMolecules.js
|   |   +-- quizQuestions.js
|   |   `-- trends.js
|   +-- hooks/
|   +-- pages/
|   +-- utils/
|   +-- App.jsx
|   +-- index.css
|   `-- main.jsx
+-- index.html
+-- package.json
+-- postcss.config.js
+-- tailwind.config.js
`-- vite.config.js
```

## Application Flow

`src/main.jsx` mounts the React app and registers the service worker. `src/App.jsx` owns the current page state, shared favorites, settings, and cross-page element actions such as opening an element in the atom visualizer or compare page.

The layout is handled by `AppShell`, `Sidebar`, `Topbar`, and `MobileNav`. Routing is implemented through internal React state rather than React Router, so page changes happen by updating `currentPage`.

Major pages include:

- `DashboardPage.jsx` - landing dashboard, quick actions, stats, and element of the day
- `PeriodicTablePage.jsx` - primary interactive periodic table experience
- `TrendsPage.jsx` - full-table periodic trend visualization
- `ComparePage.jsx` - two-element property comparison
- `AtomVisualizerPage.jsx` - electron shell diagrams
- `MoleculeScenePage.jsx` - Three.js molecule viewer
- `QuizPage.jsx` - quizzes, flashcards, daily challenge, and guessing game
- `ChemistryLabPage.jsx` - broad collection of chemistry calculators and study simulations
- `ChemistryLabPage.jsx` also includes a guided experiment catalog and learning layer that simplifies the full lab into one focused experiment at a time
- `SyllabusPage.jsx` - syllabus coverage map that links lab tools to school and entrance-exam chemistry tracks
- `FavoritesPage.jsx` - saved elements
- `SettingsPage.jsx` - appearance, accessibility, language, and data reset controls

## Data and Utilities

The project uses local JavaScript data modules:

- `src/data/elements.js` contains the periodic table dataset.
- `src/data/categories.js` defines element category metadata and colors.
- `src/data/trends.js` defines trend heatmap options.
- `src/data/molecules.js` and `src/data/generatedMolecules.js` contain molecule models used by the 3D viewer.
- `src/data/quizQuestions.js` defines quiz type metadata.

Utility modules provide reusable chemistry and UI logic:

- `elementHelpers.js` for filtering, daily element selection, and trend normalization
- `chemistryTools.js` for formula parsing, molar mass, equation balancing, bond classification, titration, isotope helpers, and lab calculations
- `quizHelpers.js` for quiz question generation
- `formatters.js` for display formatting
- `colorScales.js` for heatmap color interpolation

## Local Storage

The app stores user-specific state in browser `localStorage`. Common keys include:

- `cu-favorites`
- `cu-compact`
- `cu-reduced-motion`
- `cu-high-contrast`
- `cu-color-theme`
- `cu-language`
- `cu-quiz-best`
- `cu-quiz-history`
- `cu-quiz-streak`
- `cu-teacher-mode`
- `cu-saved-filters`
- `cu-achievements`
- `cu-lab-guided-mode`
- `cu-lab-learning-mode`
- `cu-lab-completed`

No backend API is required, and no user data is sent to a server by the app itself.

## PWA and Offline Behavior

The app includes:

- `public/manifest.webmanifest` for installable app metadata
- `public/sw.js` for basic caching of core assets and fetched GET requests
- Service worker registration in `src/main.jsx`

This makes the app offline-friendly after assets have been cached by the browser.

## Notes

- Atom shell diagrams are simplified educational Bohr-style models, not exact quantum-mechanical models.
- Some chemistry lab panels are study tools and visual simulations intended for learning support.
- Missing scientific values are displayed as unavailable/null where the local dataset does not include a value.
- The project currently does not include an automated test suite.

## Deployment

Any static hosting provider that supports Vite builds can host this project.

Typical deployment flow:

```bash
npm install
npm run build
```

Then deploy the generated `dist/` folder to a static host such as Netlify, Vercel, GitHub Pages, Firebase Hosting, or similar.
