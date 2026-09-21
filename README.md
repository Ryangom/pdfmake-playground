# PDFMake Code Runner & Instant PDF View

[![Angular](https://img.shields.io/badge/Angular-19-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=for-the-badge&logo=githubpages&logoColor=white)](https://ryangom.github.io/pdfmake-playground/)

An interactive, high-performance web application to write, edit, and instantly preview and export [PDFMake](https://pdfmake.github.io/docs/) document definitions in real time.

🔗 **Live Demo:** [https://ryangom.github.io/pdfmake-playground/](https://ryangom.github.io/pdfmake-playground/)

---

## ✨ Features

- **⚡ Real-Time PDF Rendering**: Instant live client-side PDF compilation powered by pdfmake and embedded VFS standard fonts.
- **🔄 Live Auto-Sync & Debounce Control**: Toggle auto-compilation on or off, with configurable debounce speed (Fast: 300ms, Normal: 600ms, Relaxed: 1200ms) or manual run mode.
- **💻 CodeMirror 6 Editor**: Full-featured code editor with syntax highlighting, One Dark theme, line numbering, bracket matching, and auto-indentation. Supports JavaScript functions for dynamic headers, footers, and table layouts.
- **📐 Flexible Split-Pane Layout**: Toggle between Split View (50/50), Full Editor View, or Full Preview View with one click.
- **📋 Curated Template Library**: Ready-to-use professional templates:
  - Invoice & Billing Statement
  - Clean Resume / CV
  - Restaurant / Retail Receipt
  - Formal Executive Report
  - Complex Table & Grid Layouts
- **📖 Quick Snippets & Cheatsheet**: Drawer with instant 1-click insertion for tables, columns, styles, QR codes, lists, margins, and page breaks.
- **🖨️ Complete PDF Controls**: Zoom in/out, fit to screen, download `.pdf`, print directly, or open generated document in a new browser tab.
- **🛡️ Error Handling & Diagnostics**: Inline syntax error alerts and line-number error reporting for broken document definitions.

---

## 🛠️ Tech Stack

- **Framework**: [Angular 19](https://angular.dev/) (Standalone Components, Signals, Reactive state)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/) with [@analogjs/vite-plugin-angular](https://analogjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Code Editor**: [CodeMirror 6](https://codemirror.net/) (`@codemirror/lang-json`, `@codemirror/theme-one-dark`)
- **PDF Engine**: [pdfmake](https://pdfmake.github.io/docs/) with Roboto virtual file system fonts

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18 or higher recommended) and **npm** installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ryangom/pdfmake-playground.git
   cd pdfmake-playground
   ```

2. Install dependencies:
   ```bash
   npm install --force
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3001/
   ```

---

## 📦 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server on `http://localhost:3001` |
| `npm run build` | Compiles the production bundle into the `dist/` directory |
| `npm run preview` | Locally preview the production build |
| `npm run lint` | Runs TypeScript type checking without emitting files |
| `npm run deploy` | Builds the project and publishes the `dist/` folder to the `gh-pages` branch |

---

## 🌐 Deployment to GitHub Pages

### Option 1: Automatic via GitHub Actions (Recommended)
This repository includes a preconfigured GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
1. Go to your repository on GitHub: **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. Any push to the `master` branch will automatically build and deploy the app.

### Option 2: Manual Deployment (`gh-pages`)
To deploy manually from your machine without using GitHub Actions minutes:
```bash
npm run deploy
```
Then in GitHub **Settings** > **Pages**, ensure **Source** is set to **Deploy from a branch** with branch **`gh-pages`** and folder **`/ (root)`**.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
