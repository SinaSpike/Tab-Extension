Tab – Your Modern, Interactive New Tab

🚀 Transform your new tab into a beautiful, animated dashboard with quotes, shortcuts, search, streaks, and fun interactive Easter eggs!

✨ Features
- Dynamic Particle Background – animated particles, snow, rain, confetti, and seasonal effects.
- Clock & Date – real-time, sleek design.
- Quotes from JSON – local, editable collection of motivational quotes.
- Editable Shortcuts – add/remove websites with favicons, fully persistent.
- Search Bar with Suggestions – Google, DuckDuckGo, Bing + local search history.
- Streak Tracker – tracks consecutive days you open your new tab, with optional animations.
- Easter Eggs / Fun Animations
- Fully Offline Capable – works without an internet connection (except search suggestions).

🎨 Preview

<img width="1920" height="928" alt="image" src="https://github.com/user-attachments/assets/02231dce-2b45-484d-a723-906625f92c73" />

📦 Installation
Load Unpacked (Development / GitHub):
- Clone the repository:
"git clone https://github.com/SinaSpike/Tab.git"

- Open Chrome and go to: chrome://extensions
- Enable Developer Mode (top right).
- Click Load unpacked and select the project folder.
- Open a new tab.

⚙️ Customization
- Shortcuts
- Edit the default shortcuts in tab.js or add new ones via the + Add tile.
- Remove shortcuts with the ✕ button on each tile.
- Shortcuts are fully persistent using localStorage.

🖊️ Quotes
- Quotes are stored in quotes.json.
- Add, remove, or modify quotes without touching JS.
- Quotes cycle automatically and can be advanced manually with the next quote button.

🔎 Search
- Choose between Google, DuckDuckGo, or Bing (add dropdown for selection in future).
- Local search history suggestions appear as you type.
- Easter egg keywords trigger animations instead of navigating.

🥚 Easter Eggs
- Particles, screen shake, flashing backgrounds, stars, emojis, and quotes appear.
- Fully extendable—add more keywords in tab.js.

🔥 Streak Tracker
- Shows consecutive days opened in the bottom corner.
- Fully persistent via localStorage.

📝 Appearance
- Modify tab.css for fonts, colors, particle styles, and layout.
- Add background images, gradients, or other visual enhancements.

🛠 Development
- Clone the repository.
- Load as unpacked extension.

- tab.js → logic, quotes, Easter eggs, search, streaks
- tab.css → styles and animations
- tab.html → layout and structure
- Refresh the new tab to see changes.

💡 Future Enhancements
- Light/dark theme switch.
- Seasonal or daily wallpaper backgrounds.
- To-do list or productivity widgets.
- More interactive Easter eggs and particle effects.
- Voice search support.
