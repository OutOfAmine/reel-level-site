---
name: reel-level-site
description: Rebuilds any brand's website as a scroll experience good enough to film for a reel. Picks one object from the brand's own world as the spine of the page (a train and its stations, a shirt and a stadium), uses real content and real photos, generated stills and film for what photos can't show, applies a craft floor that removes AI-slop patterns, audits every scroll position with screenshots, then records the finished site with a built-in demo mode. Use it whenever the user asks to redesign, rebuild or remake a website, wants a site that looks "creative", "next level", "awwwards" or "reel level", says "/reel-level-site", "n3awdo site", "redesign this URL", or wants a website concept to post on Instagram or TikTok, even if they don't name this skill.
---

# reel-level-site

Rebuild a site so that a stranger watching 3 seconds of it on a phone stops scrolling. The page stays a real website: real content, real links, working UI.

`SKILL_DIR` is this skill's folder. First run in a new copy: `cd SKILL_DIR && npm install`.

Read the three references when you reach their step: `references/craft-floor.md`, `references/journey-patterns.md`, `references/assets.md`.

## 1. Read the real site

Open the URL in a browser. Write down, in a `data.js` you will build from:

- every section, label and link that must survive
- real numbers, each with where it came from
- the official logo file (never redraw a logo) and the exact brand colours

Anything you cannot source gets removed or labelled as a demo. Do not invent figures, timetables, quotes or prices.

## 2. Find the spine

Ask: what physical object does this brand live around? The whole page becomes one trip with that object.

| Brand | Object | The page is |
|---|---|---|
| Railway | a train on a track | a journey: the train follows the scroll, each station opens a section |
| Football federation | shirt, stadium, trophy | walking from the tunnel to the pitch |
| Airline | boarding pass, window | a flight from gate to landing |
| Bank | a coin, a vault door | the path of one dirham |
| Clothing brand | a garment on a hanger | a fitting room, rail by rail |

Propose two or three spines, one sentence each. Let the user pick before building. Then borrow the object's real vocabulary for the UI: departures board, station nameboard, ticket with a tear-off stub, shipping-container doors. That vocabulary replaces generic cards.

## 3. Show a first frame early

Build only the landing, show it, and get a yes. A weak first screen is the most common reason a whole build gets thrown away. It needs one idea you can say in five words, for example: "the O of the logo is a window".

## 4. Use the real tools

If the user named skills or component libraries (21st.dev, ui-ux-pro-max, others), build from their actual output. If one is blocked by a quota or login, stop and say so; do not hand-roll a lookalike.

Default stack: React, Motion, Lenis for smooth scroll, GSAP ScrollTrigger for scrubbed scenes.

## 5. Build one section at a time

Each section gets exactly one deliberate motion moment, chosen from `references/journey-patterns.md` or invented for this brand. Run the list in `references/craft-floor.md` before showing a section.

Assets follow `references/assets.md`. Keep a `credits.json` and print the credits in the footer.

If this is a redesign of a brand you do not work for, the footer must say it is an unofficial concept, and any fake data (timetables, tickets, prices) must be labelled on the page.

## 6. Audit every scroll position

```bash
node SKILL_DIR/scripts/audit.mjs http://localhost:5173 ./audit 720
```

It scrolls the whole page at 1920x1080, saves a screenshot per step, builds contact sheets and reports page errors and failed requests. Open the sheets, then open any suspicious frame at full size. Look for:

- text or a letter hidden behind a fixed element
- buttons whose icon is off-centre or whose label wraps
- blank areas where something should have animated in
- a label on top of an image it can't be read against
- empty zones a viewer would scroll past

Fix, then run it again. Do not show the site before a clean pass.

## 7. Add demo mode and record

Copy `templates/Demo.jsx` into the app and fill in `STEPS` so the page drives itself: scroll, stop, click the real controls with a drawn cursor. Scroll-scrubbed scenes get mode `'through'` so they play at an even pace.

Check every step lands with its target on screen. A step that clicks something below the fold fails silently and leaves dead footage. Test the interactive parts headless before the long take.

```bash
node SKILL_DIR/scripts/record.mjs "http://localhost:5173/?demo" ./footage/site.mp4
```

It films the real screen, because headless capture leaves embedded video black and drifts in timing. Nothing else may touch the machine during the take.

## 8. Cut it for a reel

- The site is wide, so turn it 90 degrees and let it fill the vertical frame. Show a one-second "turn your phone" card, then stay in landscape until the end.
- Show the first instance of anything repetitive in detail, then speed through the repeats. Never speed through real content a viewer came to see.
- Voice over the hook and the outro only. Music under the site, not under the voice.
