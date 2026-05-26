# KinkCal TO — Toronto Queer Event Calendar 🔥

Your guide to every gay circuit, fetish, leather, latex, BDSM, puppy, furry & drag event in Toronto.

## Features
- 📅 Browse events by category (Circuit, Leather, Latex, BDSM, Puppy, Furry, Drag, Bear, etc.)
- 🔄 Recurring event support (1st Saturday, 3rd Friday, etc.)
- 📲 Subscribe to `.ics` calendar feed (auto-updates on your phone)
- ➕ Community event submission form
- 🤖 Auto-scrapers for getmuzzled.ca, yohomo.ca, pitbullevents.com, impulseto.com, torontogothevents.com
- ✅ Admin panel to approve/reject submissions
- 🏷️ 16 categories with emoji tags

## Subscribe to Calendar
```
https://[your-domain]/api/calendar.ics
```

## Quick Start
```bash
npm install
npm run dev
# Open http://localhost:3333
```

## Deploy to Vercel
1. Fork this repo
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repo
4. Deploy — it just works

**Note:** SQLite DB won't persist on Vercel's serverless. For production, swap to Turso/PlanetScale or run on a VPS.

## Event Sources
- [Muzzled (getmuzzled.ca)](https://www.getmuzzled.ca)
- [YoHomo](https://www.yohomo.ca)
- [Pitbull Events](https://www.pitbullevents.com)
- [Impulse TO](https://www.impulseto.com)
- [Toronto Goth Events](https://www.torontogothevents.com)
- [Eventbrite](https://www.eventbrite.ca)