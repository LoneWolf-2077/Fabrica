# Project Goal
Create a clean, minimal, non-intimidating developer and designer portal named "Fabrica" hosted on GitHub Pages. The focus is high readability, responsive layout across desktop and mobile, and seamless site updates using vanilla HTML5, CSS3, and modular JavaScript.

# Key Feature Upgrades
1. **Font Integration:** Primary typeface must be **Roboto Flex** (loaded from Google Fonts) across all UI elements, headings, body text, and UI cards.
2. **Theme System (Dark / Light Mode Toggle):** 
   - Default to a comfortable, non-intimidating dark mode (`#12151e` background, soft glassmorphism cards).
   - Light mode must switch smoothly to a crisp off-white background (`#f8fafc`) with light glass cards and dark readable typography.
   - Include a simple toggle button in the header that saves the user's preference in `localStorage`.
3. **Intro Splash Screen:** 
   - Display an elegant, minimal splash screen overlay on initial page load with the text: **"LONEWOLF PRESENTS FABRICA"**.
   - Includes a subtle fade-in and auto-fade-out transition (lasting ~1.5 to 2 seconds total) before revealing the main dashboard UI smoothly.
4. **Maintenance & Scale (Easy Updates):**
   - Separate site content from structural code. Store all cards for Tools, Downloads, and Guides in a central JavaScript data file (`data.js`) as clean JSON objects.
   - Adding a new tool, script download, or guide must only require adding a single object entry to `data.js` without touching the main HTML.
5. **Full Mobile & PC Responsiveness:**
   - Fluid grid layouts (`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`).
   - Clean mobile touch targets, flexible navigation tabs, and scalable text units (`rem`/`vw`).

# Aesthetic & Visual Design
- **Style:** Semi-minimal glassmorphism, spacious padding, and high readability.
- **Accents:** Restrained cyan (`#00f0ff` in dark mode / `#0284c7` in light mode) reserved strictly for active tab highlights, hover states, badges, and primary launch buttons.
- **Typography:** **Roboto Flex** used throughout, with clean font-weight scaling for titles, descriptions, and tag badges.

# Page Architecture
1. **Splash Screen Overlay:** Minimal centered splash screen ("LONEWOLF PRESENTS FABRICA") that auto-dismisses on page load.
2. **Header Zone:**
   - Brand title ("FABRICA") with tagline: "Open-source scripts, design assets, and web utilities."
   - Right-side controls: Dark/Light Mode toggle switch.
   - Centered Tab Bar: `[ Tools ]`, `[ Downloads ]`, `[ Guides ]`.
3. **Dynamic Content Hub (Tab SPA):**
   - **Tools Tab:** Spacious card grid. Each card renders title, summary, lightweight category tags, and an `"Open Tool ↗"` link button that opens the tool in a new tab.
   - **Downloads Tab:** Clean list view of scripts, templates, and asset files with version badges, file sizes, and direct download buttons.
   - **Guides Tab:** Simple documentation cards linking to external guide pages or markdown views.