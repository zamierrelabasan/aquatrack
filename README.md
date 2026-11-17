AquaTrack 💧
Your Personal Water Intake Tracker
AquaTrack is a mobile-friendly web app that helps users build healthy hydration habits. Users can create an account, set a daily water goal, log every drink, review their history, view statistics, and receive reminders. It can be installed on an Android phone as a Progressive Web App (PWA).
Features
Accounts: sign up and log in with email and password. Each user has their own records, goal, and settings.
Home dashboard: personalized greeting, rotating motivational messages, a water-filling droplet that shows progress, remaining water, and a message when the daily goal is reached.
Quick add: +100, +200, +250, +500 ml buttons and a custom amount.
History: records grouped by day with time and amount, daily totals, day-by-day navigation, and delete for wrong entries.
Stats: weekly chart, monthly overview, daily average, goal completion percentage, days the goal was reached, best hydration day, and comparison between two days.
Reminders: turn on or off, choose the interval, start and end time, custom reminder and missed-routine messages, and notification permission request.
Settings: edit username, change daily goal, change password, dark mode, about information, and log out.
Light and dark themes with a cute droplet logo.
Installable PWA for Android with offline caching.
Built with

HTML, CSS, JavaScript (no frameworks). Data is saved in the browser's local storage. Hosted on Netlify.

How to install and run
Option 1: Use it online
Open https://hydrationaqua.netlify.app in Chrome on your Android phone.
Tap the ⋮ menu, then Install app.
Option 2: Run it locally
Download or clone this repository:
git clone https://github.com/zamierrelabasan/aquatrack.git
Open the folder in VS Code.
Install the Live Server extension.
Right-click index.html and choose Open with Live Server.
Project structure
aquatrack/
├── index.html
├── style.css
├── script.js
├── manifest.json
├── service-worker.js
└── assets/
    ├── icon.svg
    ├── icon-192.png
    └── icon-512.png
Notes
Accounts and water records are stored on the device only, so they do not sync between devices.
Reminders work while the app is open or running in the background.
Author:
Zamierre T. Labasan Section: 2C BS Information Technology major in Web and Mobile Development, Nueva Vizcaya State University-Bambang campus
