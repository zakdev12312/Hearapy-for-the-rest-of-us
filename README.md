# hearapy For The Rest Of Us

A simple, no-nonsense web app for restorative audio therapy.

>[!IMPORTANT]
> iOS currently has no working audio. Android is currently unknown. Please drop anything in a discussion or issue. I'll be working on it.

## What it does

- **Restorative Tone**: Deep, pure sine wave tones (20-100Hz) with a timer (30s, 1min, or 5min). Think grounding, low-frequency sound.
- **Brown Noise**: A deep, airplane-cabin-style rumble that plays indefinitely. No timer, just continuous soothing noise.

Features:
- Switch between tone and brown noise modes
- Adjustable timer presets for the tone
- Reset button to restart the timer
- Light/dark mode toggle (your preference is saved)
- Works entirely in your browser - no downloads, no accounts

## Run it locally

Option 1: Download ZIP
1. Download this repo as a ZIP and extract it
2. Open a terminal and `cd` into the folder
3. Run `npm install` then `npm run dev`

Option 2: Git Clone
```bash
git clone https://github.com/zakdev12312/hearapy-for-the-rest-of-us.git
cd hearapy-for-the-rest-of-us
npm install
npm run dev
```

Then open `http://localhost:5173/hearapy-for-the-rest-of-us` in your browser.

---

© 2025 zakdev12312. MIT Licensed.
