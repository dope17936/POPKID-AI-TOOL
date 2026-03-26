# 🤖 POPKID AI - Copilot Edition

POPKID AI is a high-performance, installable Progressive Web App (PWA) that provides a seamless chat interface powered by the Copilot API. Designed with a sleek, futuristic dark-mode UI and built for speed.

## ✨ Features

* **PWA Ready:** Installable on Android, iOS, and Desktop as a standalone app.
* **Real-time Chat:** Powered by the `yupra.my.id` Copilot API.
* **Smart History:** Automatically saves your conversations locally.
* **Markdown Support:** Beautifully renders code snippets (with syntax highlighting), tables, and lists.
* **Adaptive UI:** Fully responsive design that works perfectly on mobile and tablets.
* **Theme Toggle:** Switch between a deep space dark mode and a clean light mode.

## 📂 File Structure

To keep the code clean and maintainable, the project is split into:

- `index.html` - The core structure and PWA registration.
- `style.css` - Custom Syne & DM Sans typography and layout.
- `script.js` - Logic for API calls, local storage, and UI interactions.
- `manifest.json` - PWA configuration for the "Install App" feature.
- `sw.js` - Service Worker for offline caching and app stability.

## 🚀 How to Deploy (For Free)

### Option 1: GitHub Pages (Recommended)
1.  **Create a Repository:** Create a new repo on GitHub named `POPKID-AI`.
2.  **Upload Files:** Upload all 5 files (`index.html`, `style.css`, `script.js`, `manifest.json`, `sw.js`) to the main branch.
3.  **Enable Pages:** * Go to **Settings** > **Pages**.
    * Under "Build and deployment", set the source to **Deploy from a branch**.
    * Select the **main** branch and click **Save**.
4.  **Done!** Your site will be live at `https://your-username.github.io/POPKID-AI/` in about 1 minute.

### Option 2: Local Hosting
Simply open the folder in your terminal and run a local server (PWA features require a server to work):
```bash
# If you have Python installed
python -m http.server 8000
