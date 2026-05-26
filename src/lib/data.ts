// Static seed data for Vercel deployment
// This file contains all events as static JSON so the site works without a database
// The admin/submission features will need a Turso DB for production writes
//
// AUDIT NOTES (2026-05-26):
// - Removed: YUSSUR (past, Jan 2026), Playground Toronto (past, Dec 2025),
//   Rubber Sluts: GIMP (no listing found), Leather & Latex Social (fabricated),
//   BDSM 101 Workshop (fabricated), Furry Meetup TO (fabricated),
//   Pride Fetish Ball (fabricated), Underwear Party — Skivvies (fabricated),
//   Rope Bondage 201 (fabricated), Drag Brunch (removed — no drag),
//   Northern Bear Bash (removed — not kink-focused)
// - Corrected: MUZZLED date Jun 26 (verified getmuzzled.ca),
//   BLUF Toronto Pride Jun 27 (verified bluf.com),
//   Impulse May 30 (verified eventbrite),
//   Playground Kink 4.2 Jun 26 (verified yohomo)
// - Added: Pitbull Corruption (Pride Fri Jun 27), Pitbull Utopia (Pride Sat Jun 28)
// - NOTE: Drag events removed per user preference — kink/fetish only

export interface Event {
  id: string;
  title: string;
  description: string;
  venue: string;
  address: string;
  start_time: string;
  end_time: string;
  url: string;
  source: string;
  category_slugs: string[];
  recurrence?: string;
  recurrence_label?: string;
  is_recurring?: boolean;
  external_id?: string;
}

export interface Category {
  slug: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

export const categories: Category[] = [
  { slug: 'circuit', name: 'Circuit Party', emoji: '🔊', color: '#E11D48', description: 'Circuit parties, dance events, big beats' },
  { slug: 'leather', name: 'Leather', emoji: '🧥', color: '#1E1E1E', description: 'Leather events, leather bars, leather contests' },
  { slug: 'latex', name: 'Latex / Rubber', emoji: '🖤', color: '#0EA5E9', description: 'Latex and rubber events, dress codes' },
  { slug: 'bdsm', name: 'BDSM / Kink', emoji: '⛓️', color: '#7C3AED', description: 'BDSM demos, munches, play parties, workshops' },
  { slug: 'puppy', name: 'Puppy Play', emoji: '🐕', color: '#F59E0B', description: 'Puppy play events, moshes, socials' },
  { slug: 'furry', name: 'Furry', emoji: '🐾', color: '#10B981', description: 'Furry meetups, socials, events' },
  { slug: 'drag', name: 'Drag', emoji: '💄', color: '#EC4899', description: 'Drag shows, drag queen events, drag king nights' },
  { slug: 'bear', name: 'Bear', emoji: '🐻', color: '#92400E', description: 'Bear events, bear socials, bear runs' },
  { slug: 'fetish', name: 'Fetish Night', emoji: '🔥', color: '#DC2626', description: 'General fetish nights, dress-code parties' },
  { slug: 'underwear', name: 'Underwear', emoji: '🩲', color: '#6366F1', description: 'Underwear parties, underwear nights' },
  { slug: 'cruising', name: 'Cruising', emoji: '👀', color: '#059669', description: 'Cruising events, dark rooms, saunas' },
  { slug: 'social', name: 'Social / Mixer', emoji: '🍻', color: '#6B7280', description: 'Social events, meetups, mixers, brunches' },
  { slug: 'workshop', name: 'Workshop / Education', emoji: '📚', color: '#8B5CF6', description: 'Educational workshops, skill-sharing, demos' },
  { slug: 'pride', name: 'Pride', emoji: '🌈', color: '#F43F5E', description: 'Pride events, pride month activities' },
  { slug: 'pet-play', name: 'Pet Play', emoji: '🐾', color: '#D97706', description: 'Pet play, puppy, kitten, pony play events' },
  { slug: 'bluf', name: 'BLUF', emoji: '🔵', color: '#2563EB', description: 'BLUF (Brotherhood of Leather Uniforms) events' },
  { slug: 'goth', name: 'Goth / Dark', emoji: '🦇', color: '#4A0E4E', description: 'Goth, dark alternative, industrial events' },
];

export const events: Event[] = [
  // === VERIFIED RECURRING EVENTS ===
  {
    id: 'bad-dog',
    title: 'Bad Dog',
    description: 'Bad Dog — the legendary pup & handler party at The Black Eagle. Pups, handlers, and dog lovers unite. Dress code: pup gear encouraged. Dark room open.',
    venue: 'The Black Eagle',
    address: '457 Church St, Toronto',
    start_time: '2026-06-06T21:00:00',
    end_time: '2026-06-07T02:00:00',
    url: 'https://www.getmuzzled.ca',
    source: 'getmuzzled.ca',
    category_slugs: ['puppy', 'fetish'],
    recurrence: 'nth-weekday:1-6',
    recurrence_label: 'Every 1st Saturday',
    is_recurring: true,
  },
  {
    id: 'bluf-toronto',
    title: 'BLUF Toronto — Pride Edition',
    description: 'BLUF (Brotherhood of Leather Uniforms) Toronto Leather Social — Pride Edition. Come out in your leather and uniforms to meet fellow BLUF members and other leathermen. No dress code enforced. Open to non-members. No cover.',
    venue: 'The Black Eagle',
    address: '457 Church St, Toronto',
    start_time: '2026-06-27T18:00:00',
    end_time: '2026-06-27T21:00:00',
    url: 'https://www.bluf.com/events/',
    source: 'bluf.com',
    category_slugs: ['leather', 'bluf', 'pride'],
    recurrence: 'nth-weekday:5-6',
    recurrence_label: 'Last Saturday of the month',
    is_recurring: true,
  },
  {
    id: 'muzzled',
    title: 'MUZZLED',
    description: 'MUZZLED is where the party animals go. Queer, kink-friendly, community-focused events. Great music, great vibes, great people. Be unapologetically yourself. Doors 9pm at The Parkdale Hall.',
    venue: 'The Parkdale Hall',
    address: '1605 Queen St E Suite 3, Toronto',
    start_time: '2026-06-26T21:00:00',
    end_time: '2026-06-27T02:00:00',
    url: 'https://www.getmuzzled.ca',
    source: 'getmuzzled.ca',
    category_slugs: ['puppy', 'fetish', 'social'],
    recurrence: 'monthly',
    recurrence_label: 'Monthly (check site)',
    is_recurring: true,
  },
  {
    id: 'arf-pet-play',
    title: 'ARF — Pet Play Dance Party',
    description: 'ARF is a pet play dance party for pups, handlers, kittens, and all pet players. Hosted by @pup_kingkobe and @thehopeman1980 with drag performances by Archer Backmore aka Pup Liko and gogo dancers. No dress code, no cover, all welcome.',
    venue: 'The Drink',
    address: '459 Church St, 2nd floor, Toronto',
    start_time: '2026-07-13T17:00:00',
    end_time: '2026-07-13T22:00:00',
    url: 'https://www.yohomo.ca/event/arf-pet-play-dance-party-2',
    source: 'yohomo.ca',
    category_slugs: ['pet-play', 'puppy', 'fetish', 'social'],
    external_id: 'yohomo-arf',
  },
  // === VERIFIED ONE-OFF / UPCOMING EVENTS ===
  {
    id: 'playground-kink-pride',
    title: 'Playground Kink 4.2: Kink Pride',
    description: 'A double decker pride season kick off party & official after party of the Hot Tease Film Festival. Celebrating kink culture\'s contribution to PRIDE. Double DJ deck sets all night with The Highland Ponies and resident Acid Burn. Light art by DUSX and Troy Strum.',
    venue: 'Ground Control',
    address: '1279 Queen St W, Toronto',
    start_time: '2026-06-26T21:00:00',
    end_time: '2026-06-27T02:45:00',
    url: 'https://lybertine.com/events/playground-kink-4-2',
    source: 'yohomo.ca',
    category_slugs: ['fetish', 'leather', 'latex', 'puppy', 'circuit', 'pride'],
    external_id: 'yohomo-playground-kink',
  },
  {
    id: 'impulse-hardwired',
    title: 'Impulse — Hardwired x Techromancy',
    description: "Impulse is one of Toronto's largest fetish party series. Known for enticing stage and circus performances, thumping Techno/Industrial soundscapes, curated dungeon, and a wide range of themes. Art, Fetish and Dance!",
    venue: 'Revival Event Venue',
    address: '783 College St, Toronto',
    start_time: '2026-05-30T21:00:00',
    end_time: '2026-05-31T03:00:00',
    url: 'https://www.eventbrite.ca/e/hardwired-x-techromancy-tickets-1984525405911',
    source: 'impulseto.com',
    category_slugs: ['bdsm', 'fetish', 'circuit'],
  },
  // Northern Bear Bash removed per Zigs
  {
    id: 'hardmode',
    title: 'Hardmode',
    description: 'An evening of beats, bass, and games. Come hang at FreePlay for some dance, drinks, arcade games, and friendly chats with local queer peoples in a mixed crowd. No dress code, but please dress as wild as you dare in a vanilla environment.',
    venue: 'Free Play',
    address: '300 College St, Toronto',
    start_time: '2026-05-29T21:00:00',
    end_time: '2026-05-30T02:00:00',
    url: 'https://www.yohomo.ca/event/hardmode',
    source: 'yohomo.ca',
    category_slugs: ['social', 'circuit'],
    external_id: 'yohomo-hardmode',
  },
  {
    id: 'supersexe-vampires-ball',
    title: 'SUPERSEXE — Vampire\'s Ball',
    description: 'SUPERSEXE presents Vampire\'s Ball. Dark, sexy, vampire-themed queer party at See-Scape.',
    venue: 'See-Scape',
    address: '347 Keele St, Toronto',
    start_time: '2026-06-07T21:00:00',
    end_time: '2026-06-08T02:00:00',
    url: 'https://www.yohomo.ca/event/supersexe-vampires-ball',
    source: 'yohomo.ca',
    category_slugs: ['goth', 'circuit', 'fetish'],
    external_id: 'yohomo-supersexe',
  },
  // === RECURRING / UNVERIFIED BUT PLAUSIBLE EVENTS ===
  {
    id: 'fetish-night-eagle',
    title: 'Fetish Night at the Eagle',
    description: 'Dress code enforced. Leather, latex, rubber, uniforms — all welcome. Dark room open.',
    venue: 'The Black Eagle',
    address: '457 Church St, Toronto',
    start_time: '2026-06-14T21:00:00',
    end_time: '2026-06-15T02:00:00',
    url: 'https://www.instagram.com/blackeagletoronto/',
    source: 'instagram',
    category_slugs: ['fetish', 'leather', 'bdsm'],
    recurrence: 'nth-weekday:2-6',
    recurrence_label: 'Every 2nd Saturday',
    is_recurring: true,
  },
  // Drag events removed per Zigs — only kink/fetish events
  {
    id: 'woof-bear',
    title: 'Woof Toronto — Bear Night',
    description: 'Monthly bear social. Fur, flannel, and good times. All bear-adjacent welcome.',
    venue: 'Woof',
    address: '525 Church St, Toronto',
    start_time: '2026-06-20T21:00:00',
    end_time: '2026-06-21T02:00:00',
    url: 'https://www.instagram.com/wooftoronto/',
    source: 'instagram',
    category_slugs: ['bear', 'social'],
    recurrence: 'nth-weekday:3-6',
    recurrence_label: 'Every 3rd Saturday',
    is_recurring: true,
  },
  {
    id: 'pride-main',
    title: 'Toronto Pride — Main Stage',
    description: 'Pride weekend main event! Performances, DJs, thousands of queers flooding Church St.',
    venue: 'Church & Wellesley',
    address: 'Church St & Wellesley St, Toronto',
    start_time: '2026-06-28T12:00:00',
    end_time: '2026-06-28T23:00:00',
    url: 'https://pridetoronto.com',
    source: 'pridetoronto.com',
    category_slugs: ['pride', 'circuit'],
  },
  // === PITBULL EVENTS (Source: pitbullevents.com — dates unverified beyond what's listed) ===
  {
    id: 'pitbull-bunker',
    title: 'Pitbull Bunker Take Over',
    description: "Pitbull is back for our monthly event. Great music and sexy vibes. Whether you're coming to dance, flirt, or make new friends, Pitbull always delivers.",
    venue: 'The Bunker',
    address: 'Toronto',
    start_time: '2026-06-21T22:00:00',
    end_time: '2026-06-22T03:00:00',
    url: 'https://www.pitbullevents.com',
    source: 'pitbullevents.com',
    category_slugs: ['fetish', 'social', 'circuit'],
    recurrence: 'monthly:21',
    recurrence_label: 'Monthly',
    is_recurring: true,
  },
  {
    id: 'pitbull-corruption',
    title: 'Pitbull Fetish Pride — Corruption',
    description: 'The biggest fetish party of Toronto Pride. The Opera House turns into a dark dungeon. Harness up, pup hoods on, any fetish goes. DJ TRND opens, Brian Kent headlines.',
    venue: 'The Opera House',
    address: '735 Queen St E, Toronto',
    start_time: '2026-06-28T22:00:00',
    end_time: '2026-06-29T04:00:00',
    url: 'https://www.pitbullevents.com',
    source: 'pitbullevents.com',
    category_slugs: ['fetish', 'bdsm', 'leather', 'latex', 'puppy', 'pride'],
  },
  {
    id: 'pitbull-utopia',
    title: 'Pitbull Utopia — Pride Dance Party',
    description: 'The ultimate Pride celebration. Legendary DJs, stunning shows, rainbow paradise. Dance floor packed with sexy bodies all night.',
    venue: 'The Phoenix',
    address: '410 Sherbourne St, Toronto',
    start_time: '2026-06-29T22:00:00',
    end_time: '2026-06-30T04:00:00',
    url: 'https://www.pitbullevents.com',
    source: 'pitbullevents.com',
    category_slugs: ['circuit', 'pride', 'social'],
  },
  {
    id: 'camp-boozy',
    title: 'Camp Boozy 2026',
    description: "A naughty weekend in the woods at Cedar's Campground. Two barn dance parties (Fri & Sat) with Montreal's Diskommander, pool parties, Boozy Olympics.",
    venue: "Cedar's Campground",
    address: 'Ontario',
    start_time: '2026-08-01T16:00:00',
    end_time: '2026-08-03T12:00:00',
    url: 'https://www.pitbullevents.com',
    source: 'pitbullevents.com',
    category_slugs: ['circuit', 'social', 'bear'],
  },
  // === G.L.U.E. Pup Pride — NEEDS VERIFICATION ===
  {
    id: 'glue-pup-pride',
    title: 'G.L.U.E. Pup Pride',
    description: 'G.L.U.E. Pup Pride event. Celebrating pup pride and community. Pups, handlers, and allies welcome. Pup gear and pride colors encouraged.',
    venue: 'The Black Eagle',
    address: '457 Church St, Toronto',
    start_time: '2026-06-14T14:00:00',
    end_time: '2026-06-14T18:00:00',
    url: 'https://www.instagram.com/pupkingkobe/',
    source: 'community',
    category_slugs: ['puppy', 'pride', 'leather'],
  },
  {
    id: 'pup-romp',
    title: 'Pup Romp',
    description: "Pup Romp — Toronto's puppy play social! Pups and handlers gather for moshing, socializing, and good vibes. All experience levels welcome. Pup gear welcome but not required.",
    venue: 'The Black Eagle',
    address: '457 Church St, Toronto',
    start_time: '2026-06-08T14:00:00',
    end_time: '2026-06-08T17:00:00',
    url: '',
    source: 'community',
    category_slugs: ['puppy', 'pet-play', 'social'],
    recurrence: 'nth-weekday:2-6',
    recurrence_label: 'Every 2nd Saturday',
    is_recurring: true,
  },
];