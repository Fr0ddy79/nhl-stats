# NHL Stats

Live NHL schedule, standings, and team data — powered by the NHL official API.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **API:** NHL Official API (`api-web.nhle.com`)
- **Styling:** Plain CSS (inline, no dependencies)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data Sources

| Source | URL | Use |
|--------|-----|-----|
| NHL Official API | `api-web.nhle.com` | Primary — schedule, standings, team data |
| Natural Stat Trick | naturalstatrick.com | Advanced stats (future) |
| CapFriendly | capfriendly.com | Contract data (future) |

## Project Status

**MVP:** Live game schedule + league standings.

**Next (pending Fred direction):**
- Real-time game scores / period tracking
- Advanced analytics (Corsi, Fenwick, xG)
- Fantasy stats dashboard
- Player pages

**Blocked:** Fred needs to push to GitHub and pick data source focus.
