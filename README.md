# Smart Queue Management System (SQMS)

A modern, high-performance, single-page **Smart Queue Management System** built with vanilla HTML5, CSS3, and ES6+ JavaScript. Designed for clinics, service centers, retail banks, and public offices.

---

## ✨ Features

- **Self-Service Customer Kiosk View**:
  - Fast check-in with customer name, contact, and categorized services (*General Inquiry*, *Billing & Accounts*, *Technical Support*, *Priority / Express*).
  - Generates instant digital queue tickets with ticket codes (e.g. `G-101`, `B-102`), position indicators, estimated wait times, and simulated barcodes.
  - One-click **Print Ticket** action styled specifically for thermal receipt printing via CSS print media.
  - Ability to cancel / leave the queue.

- **Admin & Staff Dashboard View**:
  - Multi-counter management (Counter 1 to 4) with dedicated service category affinities.
  - Live active ticket card with ticking elapsed service timer (`00:00`).
  - Full queue workflow controls: **Call Next**, **Recall / Re-announce**, **Complete Service**, and **No-Show / Skip**.
  - Dynamic queue filtering (All, General, Billing, Tech Support, Priority).
  - Real-time statistics widgets:
    - *Currently Waiting*
    - *Total Served Today*
    - *Average Wait Time* (calculated dynamically from completed tickets)
    - *Active Counters*
  - Audit trail history log of completed and skipped tickets.

- **Public TV / Monitor Display Board**:
  - Split-screen airport/clinic overhead display view.
  - Large **NOW SERVING** counter spotlights with visual pulsing highlights.
  - **UP NEXT** real-time queue preview.
  - Animated announcement ticker along the bottom.

- **Zero-Dependency Audio & Voice Alerts**:
  - **Synthesized Melodic Chime**: Built using the native Web Audio API (sine oscillators playing harmonic D5 → A5 chime). No external `.mp3` or `.wav` files needed!
  - **Speech Synthesis Voice Announcement**: Built using native browser `window.speechSynthesis` to announce tickets (e.g., *"Ticket G 101, please proceed to Counter 1"*).
  - Master audio toggle (Mute / Unmute) in header.

- **Local Persistence & Multi-Tab Real-Time Sync**:
  - All state persists across reloads via `localStorage`.
  - Storage event listeners synchronize changes live across multiple open browser tabs/windows (e.g., Staff on Tab 1, Customer Kiosk on Tab 2, TV Screen on Tab 3).

---

## 🚀 Getting Started

No server or npm installation required!

1. Clone or download this repository.
2. Open `index.html` directly in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).
3. Click **"Seed Demo"** in the top navigation bar to populate realistic sample queue data for immediate testing.

---

## 📁 Project Structure

```
SQMS/
├── index.html       # Single-page UI with Kiosk, Staff Dashboard, and TV Display views
├── styles.css       # Tailwind-inspired SaaS styling, animations, and thermal receipt print styles
├── script.js        # ES6+ state management, Web Audio chime synthesis, Speech API, and UI bindings
└── README.md        # Documentation and feature guide
```

---

## 🛠️ Tech Stack

- **HTML5** (Semantic structure, SVG icons)
- **CSS3** (Custom properties, CSS Grid, Flexbox, Keyframe animations, Print stylesheet)
- **JavaScript ES6+** (Classes, Web Audio API, Web Speech API, LocalStorage, Storage events)
