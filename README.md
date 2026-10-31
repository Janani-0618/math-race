# 🚀 Math Race — Class 12 Edition

A real-time multiplayer maths quiz where students race rockets by answering aptitude questions. Up to **30 players** join one room with a 6-character code and answer the **same 10 questions** at the same time. Correct answers push your rocket forward; faster correct answers earn a small bonus. Built for a college expo: colourful, animated, readable from a distance and playable on phones.

## Features
- **Create / join a race** with a room code (checks: empty name, invalid code, room full, duplicate name, race already started/finished). Players join from their phones on the same Wi-Fi.
- **Lobby:** big animated room code with a copy button, player avatars, live `Players Ready: n / 30`, capacity bar, host-only START RACE.
- **3 · 2 · 1 · GO** countdown, then **10 questions × 15 seconds**.
- **Animated timer ring** – cyan/mint with plenty of time → yellow/orange when low → red with a gentle pulse in the last 3 seconds.
- **Instant feedback + short explanation** after every answer or timeout (the answer and explanation are only sent *after* you answer or the timer ends).
- **Race track** with a colourful rocket per player, live leaderboard with smooth rank-change animation, race-completion bar, your rank and accuracy.
- **Results:** winner banner, animated trophy, confetti, animated podium, full table (Rank, Player, Score, Correct, Accuracy, Avg Time) and a personal summary. **Play Again** draws a brand-new question set.
- Reconnect on refresh, host hand-over if the host disconnects, graceful errors for invalid rooms.
- **Accessibility:** readable contrast, visible focus rings, labelled buttons, `prefers-reduced-motion` support (floating symbols, stars and confetti are switched off), no strobing effects.
- **Sound effects are optional and OFF by default** (speaker button, bottom-right; the choice is remembered on that device).
- Works offline on a local network: the font is bundled and there are no external images or CDNs.

## Scoring (calculated only on the server)
| Result | Points |
|---|---|
| Correct answer | **100 base + speed bonus** |
| Speed bonus | (whole seconds left ÷ 15) × 50, rounded → 15 s left = +50, 8 s = +27, 1 s = +3 |
| Wrong answer / timeout | 0 (no negative marking) |

So a correct answer is worth 100–150 points and a perfect race is 10 × 150 = 1500. Accuracy matters more than raw speed. Rocket position = score ÷ 1500.

## Questions
- **120 verified questions** in 12 topics (10 each): Percentages · Profit & Loss · Ratio & Proportion · Averages · Number Series · Simple Algebra · Squares & Roots · Probability · Speed & Distance · Logical Reasoning · Fractions & Decimals · Geometry & Mensuration.
- Difficulty mix: **30% Warm-up (36) · 50% Normal (60) · 20% Challenge (24)**. School-level (Class 10–12), no calculator needed, short wording.
- Every correct answer is **computed from an expression** and re-checked each time the server starts (and by `npm run validate`), so a wrong answer key cannot slip in. Each question has exactly 4 distinct options and one correct answer, and an explanation.
- **Random selection (server side only):** when the host starts a race the server picks 10 unique questions — about 3 warm-up / 5 normal / 2 challenge, every topic used once before any repeats, shuffled, no two neighbours from the same topic — and stores them on the room. All players receive the same questions, options and order. Play Again excludes the previous race's questions.
- **Timer:** the server owns the 15-second clock (`QUESTION_SECONDS` in `server/gameManager.js`, the only place it is defined; clients receive it from the server). Unanswered questions score 0 and everyone moves on; answers after the deadline (plus a 0.3 s network allowance) are rejected, and a second answer to the same question is rejected.

## Tech stack
React + Vite · Tailwind CSS · Lucide icons · Node.js + Express · Socket.IO · in-memory state (no database) · `@fontsource/chakra-petch` (bundled font).

## Folder structure
```
math-race/
├── package.json              # root scripts (dev / build / start / validate / test:sim)
├── client/                   # React + Vite + Tailwind
│   └── src/
│       ├── App.jsx, main.jsx, index.css
│       ├── hooks/useGame.js          # Socket.IO connection + game state
│       ├── components/               # Rocket, SpaceBackground, RaceTrack, Leaderboard, Confetti, MathLoader
│       ├── pages/                    # Landing, Entry, Waiting, Countdown, Game, Results
│       └── utils/                    # format.js, sound.js (optional sound effects)
└── server/
    ├── server.js                     # Express + Socket.IO bootstrap (also serves client/dist)
    ├── gameManager.js                # rooms, game loop, timer, scoring, reconnect logic
    ├── questions.js                  # 120-question bank + server-side random selector + validator
    ├── validate-questions.js         # `npm run validate`
    └── test-simulation.js            # `npm run test:sim` (in-process multiplayer test)
```

## Installation (Node.js 18+)
```bash
cd math-race
npm install
npm run install:all
```

## Run
```bash
npm start        # builds the client, then serves everything on http://localhost:3001   ← best for the expo
npm run dev      # development mode: server :3001 + Vite client on http://localhost:5173
```

## Join from phones on the same Wi-Fi
1. Put the laptop and all phones on the **same Wi-Fi** (a phone hotspot works well if the venue Wi-Fi blocks device-to-device traffic).
2. Run `npm start`. The terminal prints something like  
   `Network: http://192.168.1.20:3001` — that is the URL for the phones. (With `npm run dev`, use the same IP with port **5173**.)  
   If you need to look it up: Windows `ipconfig` (IPv4 Address) · macOS `ipconfig getifaddr en0` · Linux `hostname -I`.
3. On the laptop open `http://localhost:3001` → **CREATE RACE**. The lobby shows the room code and the address friends should open.
4. On each phone open the Network URL → **JOIN RACE** → enter a name and the code.
5. If a phone cannot connect: allow Node.js through the laptop firewall (ports 3001 / 5173), and make sure the laptop and phone are on the same network (not a guest network with client isolation).
6. Tip: show the laptop on a projector — the layout scales up for large screens.

## Testing
```bash
npm run validate   # question bank: answers, options, explanations, 30/50/20 mix, 3000 simulated races
npm run test:sim   # starts the game server in-process and plays real multiplayer games
npm run build      # production build of the client
```
`test:sim` checks: 10 identical questions for every player, no answer/explanation leaks, scoring and speed bonus, 15-second timeout, late and duplicate answers rejected, 30-player room (31st rejected), Play Again gives a new set, different rooms get different sets.

## Adding or editing questions
Open `server/questions.js` and add a row to a topic: `[difficulty, 'question', 'verification expression', ['wrong 1', 'wrong 2', 'wrong 3'], 'optional display text of the correct answer', 'optional explanation']`. The answer is calculated from the expression. Keep the 3 / 5 / 2 balance per topic, then run `npm run validate`.

## Troubleshooting
| Problem | Fix |
|---|---|
| "Cannot reach the game server" | The server is not running – run `npm start` (or `npm run dev`) from the project root |
| Phone cannot open the page | Same Wi-Fi? Use the laptop's LAN IP (not `localhost`); allow Node.js in the firewall |
| `EADDRINUSE: port 3001` | Another process uses the port: stop it, or run with `PORT=4000 npm start` |
| `'concurrently' is not recognized` | Run `npm install` in the project root |
| Blank page after `npm start` | Run `npm install --prefix client` then `npm run build` |
