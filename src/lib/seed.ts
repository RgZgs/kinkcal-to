import { createEvent } from './db';

// Seed the real Toronto events Zigs cares about + reference data
export function seedRealEvents() {
  const events = [
    // === KEY RECURRING EVENTS (what Zigs specifically wants tracked) ===
    
    // Bad Dog - recurring event at The Black Eagle
    {
      title: 'Bad Dog',
      description: 'Bad Dog — the legendary pup & handler party at The Black Eagle. Pups, handlers, and dog lovers unite. Dress code: pup gear encouraged. Dark room open.',
      venue: 'The Black Eagle',
      address: '718 Queen St W, Toronto',
      start_time: '2026-06-06T21:00:00',
      end_time: '2026-06-07T02:00:00',
      url: 'https://www.getmuzzled.ca',
      source: 'getmuzzled.ca',
      category_slugs: ['puppy', 'fetish'],
      recurrence: 'nth-weekday:1-6',  // First Saturday of every month
      recurrence_label: 'Every 1st Saturday',
      is_recurring: true,
    },
    
    // BLUF Toronto - Leather Uniform night
    {
      title: 'BLUF Toronto',
      description: 'BLUF (Brotherhood of Leather Uniforms) Toronto meetup. Leather and uniform dress code enforced. A night for men who appreciate leather, uniforms, and the culture around them.',
      venue: 'The Black Eagle',
      address: '718 Queen St W, Toronto',
      start_time: '2026-06-19T20:00:00',
      end_time: '2026-06-19T23:00:00',
      url: 'https://www.bluf.com',
      source: 'bluf.com',
      category_slugs: ['leather', 'bluf'],
      recurrence: 'nth-weekday:3-5',  // Third Friday of every month
      recurrence_label: 'Every 3rd Friday',
      is_recurring: true,
    },

    // G.L.U.E. Pup Pride
    {
      title: 'G.L.U.E. Pup Pride',
      description: 'G.L.U.E. (Gay Leather Uniform Exchange) Pup Pride event. Celebrating pup pride and community. Pups, handlers, and allies welcome. Pup gear and pride colors encouraged.',
      venue: 'The Black Eagle',
      address: '718 Queen St W, Toronto',
      start_time: '2026-06-14T14:00:00',
      end_time: '2026-06-14T18:00:00',
      url: '',
      source: 'getmuzzled.ca',
      category_slugs: ['puppy', 'pride', 'leather'],
      recurrence: '',  // One-off or variable schedule
      is_recurring: false,
    },

    // Pup Romp - Toronto puppy play event
    {
      title: 'Pup Romp',
      description: 'Pup Romp — Toronto\'s puppy play social! Pups and handlers gather for moshing, socializing, and good vibes. All experience levels welcome. Pup gear welcome but not required.',
      venue: 'The Black Eagle',
      address: '718 Queen St W, Toronto',
      start_time: '2026-06-08T14:00:00',
      end_time: '2026-06-08T17:00:00',
      url: '',
      source: 'community',
      category_slugs: ['puppy', 'pet-play', 'social'],
      recurrence: 'nth-weekday:2-6',  // Second Saturday of every month
      recurrence_label: 'Every 2nd Saturday',
      is_recurring: true,
    },

    // === MUZZLED (already in DB but adding as recurring) ===
    {
      title: 'MUZZLED',
      description: 'MUZZLED is where the party animals go. Queer, kink-friendly, community-focused events. Great music, great vibes, great people. Be unapologetically yourself.',
      venue: 'The Parkdale Hall',
      address: '1605 Queen St E Suite 3, Toronto',
      start_time: '2026-06-07T21:00:00',
      end_time: '2026-06-08T02:00:00',
      url: 'https://www.getmuzzled.ca',
      source: 'getmuzzled.ca',
      category_slugs: ['puppy', 'fetish', 'social'],
      recurrence: 'nth-weekday:1-6',  // First Saturday (check site for exact schedule)
      recurrence_label: 'Monthly (check site)',
      is_recurring: true,
    },

    // === ARF Pet Play Dance Party (from YoHomo) ===
    {
      title: 'ARF — Pet Play Dance Party',
      description: 'ARF is a pet play dance party for pups, handlers, kittens, and all pet players. Dance, socialize, and play. Pet gear welcome. Inclusive and kink-friendly space.',
      venue: 'The Black Eagle',
      address: '718 Queen St W, Toronto',
      start_time: '2026-06-27T21:00:00',
      end_time: '2026-06-28T02:00:00',
      url: 'https://www.yohomo.ca/event/arf-pet-play-dance-party-2',
      source: 'yohomo.ca',
      category_slugs: ['pet-play', 'puppy', 'fetish'],
      recurrence: '',  // Check yohomo for schedule
      is_recurring: false,
    },

    // === Other reference events ===
    {
      title: 'Crank — Circuit Party',
      description: 'Toronto\'s hottest circuit party. 300+ guys, world-class DJs, insane lights.',
      venue: 'Fly 2.0',
      address: '6 Gloucester St, Toronto',
      start_time: '2026-06-06T22:00:00',
      end_time: '2026-06-07T04:00:00',
      url: 'https://flynightclub.com',
      category_slugs: ['circuit'],
    },
    {
      title: 'Fetish Night at the Eagle',
      description: 'Dress code enforced. Leather, latex, rubber, uniforms — all welcome. Dark room open.',
      venue: 'The Black Eagle',
      address: '718 Queen St W, Toronto',
      start_time: '2026-06-13T21:00:00',
      end_time: '2026-06-14T02:00:00',
      category_slugs: ['fetish', 'leather', 'bdsm'],
      recurrence: 'nth-weekday:2-6',  // Second Saturday
      recurrence_label: 'Every 2nd Saturday',
      is_recurring: true,
    },
    {
      title: 'Drag Brunch — Sunday Fierce',
      description: 'Mimosa-fueled drag brunch with Toronto\'s best queens. Reservations recommended.',
      venue: 'Crews & Tangos',
      address: '508 Church St, Toronto',
      start_time: '2026-06-14T11:00:00',
      end_time: '2026-06-14T14:00:00',
      category_slugs: ['drag', 'social'],
      recurrence: 'weekly:0',  // Every Sunday
      recurrence_label: 'Every Sunday',
      is_recurring: true,
    },
    {
      title: 'Leather & Latex Social',
      description: 'Casual social for the leather and latex community. No play, just vibes and connections.',
      venue: 'The Zipperz',
      address: '72 Carlton St, Toronto',
      start_time: '2026-06-15T19:00:00',
      end_time: '2026-06-15T22:00:00',
      category_slugs: ['leather', 'latex', 'social'],
    },
    {
      title: 'BDSM 101 Workshop',
      description: 'Beginner-friendly workshop covering safety, negotiation, and basic rope/bondage techniques. Demo + hands-on practice.',
      venue: 'Come As You Are',
      address: '701B Queen St W, Toronto',
      start_time: '2026-06-18T19:00:00',
      end_time: '2026-06-18T21:00:00',
      category_slugs: ['bdsm', 'workshop'],
    },
    {
      title: 'Woof Toronto — Bear Night',
      description: 'Monthly bear social. Fur, flannel, and good times. All bear-adjacent welcome.',
      venue: 'Woof',
      address: '525 Church St, Toronto',
      start_time: '2026-06-20T21:00:00',
      end_time: '2026-06-21T02:00:00',
      category_slugs: ['bear', 'social'],
      recurrence: 'nth-weekday:3-6',  // Third Saturday
      recurrence_label: 'Every 3rd Saturday',
      is_recurring: true,
    },
    {
      title: 'Furry Meetup TO',
      description: 'Casual furry meetup — fursuits welcome but not required. Art share, socializing, snacks.',
      venue: 'Glad Day Bookshop',
      address: '499 Church St, Toronto',
      start_time: '2026-06-22T15:00:00',
      end_time: '2026-06-22T18:00:00',
      category_slugs: ['furry', 'social'],
    },
    {
      title: 'Pride Fetish Ball',
      description: 'The annual Pride Fetish Ball. Dress to impress. Leather, latex, rubber, pups — the works.',
      venue: 'The Black Eagle',
      address: '718 Queen St W, Toronto',
      start_time: '2026-06-27T22:00:00',
      end_time: '2026-06-28T03:00:00',
      category_slugs: ['fetish', 'leather', 'latex', 'puppy', 'bdsm'],
    },
    {
      title: 'Toronto Pride — Main Stage',
      description: 'Pride weekend main event! Performances, DJs, thousands of queers flooding Church St.',
      venue: 'Church & Wellesley',
      address: 'Church St & Wellesley St, Toronto',
      start_time: '2026-06-28T12:00:00',
      end_time: '2026-06-28T23:00:00',
      url: 'https://pridetoronto.com',
      category_slugs: ['pride', 'circuit', 'drag'],
    },
    {
      title: 'Underwear Party — Skivvies',
      description: 'Underwear-only dance party. Check your pants at the door.',
      venue: 'Fly 2.0',
      address: '6 Gloucester St, Toronto',
      start_time: '2026-07-04T22:00:00',
      end_time: '2026-07-05T04:00:00',
      category_slugs: ['underwear', 'circuit'],
    },
    {
      title: 'Rope Bondage Intermediate Workshop',
      description: 'Building on 101 — suspension prep, chest harnesses, and flow. Must have attended 101 or have experience.',
      venue: 'Come As You Are',
      address: '701B Queen St W, Toronto',
      start_time: '2026-07-09T19:00:00',
      end_time: '2026-07-09T21:30:00',
      category_slugs: ['bdsm', 'workshop'],
    },
  ];

  const db = require('./db').getDb();
  const existing = (db.prepare('SELECT COUNT(*) as c FROM events WHERE approved = 1').get() as any).c;
  
  // Clear old seed data and re-seed
  if (existing > 0) {
    console.log(`Found ${existing} existing events, skipping seed. Delete data/calendar.db to re-seed.`);
    return;
  }

  for (const event of events) {
    try {
      createEvent({
        ...event,
        approved: true,
        created_by: 'seed',
      });
    } catch (e: any) {
      if (!e.message?.includes('UNIQUE')) {
        console.error(`Error seeding ${event.title}:`, e.message);
      }
    }
  }
  console.log(`Seeded ${events.length} events`);
}