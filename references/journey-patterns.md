# Journey patterns

Moments that worked. Pick one per section and restyle it for the brand. All are scroll-driven unless noted.

## Logo as a window

The brand's name fills the screen. One letter's counter (the hole in an O) is a mask with film playing inside. Scrolling flies the camera through the letter until the film is the whole screen, then the live layer fades in.

Convert the logo to paths, use an SVG `<mask>` with the counter in black, and scale around the counter's centre. Keep the film at least as large as the window so the background never shows through.

## Doors between sections

The next place's name is cut out of two leaves that meet on the centre line, with a photo showing through the letters. Scroll and the leaves slide apart; the photo fills the screen.

```jsx
const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })
const left = useTransform(p, [0.1, 0.55], ['0%', '-101%'], { ease: easeInOut })
const right = useTransform(p, [0.1, 0.55], ['0%', '101%'], { ease: easeInOut })
```

Fit the type with canvas `measureText`. If a fixed element runs down the middle, split the word at the letter boundary closest to balanced and anchor each half against that element.

## Object that follows the scroll

A small top-view of the object rides a fixed line down the page. Its speed readout comes from scroll velocity. Each stop along the line opens a section when the object arrives, or as soon as the section is visible, whichever comes first.

## Filmed scene scrubbed by the scroll

Generate a sequence of shots, then let the scroll own the playhead. Seeking needs a keyframe every few frames or it stutters:

```bash
ffmpeg -i shot.mp4 -an -vf scale=1920:-2 -c:v libx264 -preset slow -crf 17 \
  -g 4 -keyint_min 4 -bf 0 -pix_fmt yuv420p -movflags +faststart scrub.mp4
```

Budget about 15 to 20 MB per 8-second shot.

## Interactive object

Make the conversion the fun part. A departures board you click, a seat map, a ticket that prints and has a stub you tear off. Keep it honest: label the data as a demo and link to the real service.

## Race

Two things cover the same distance while the scroll runs a clock. One arrives first and its number lands big. Use this when the brand's real advantage is a single comparable number, and mark any estimate as an estimate.

## Map tour

A real outline of the country or region, camera flying from point to point, one photo card per stop. Draw the lines in on arrival.

## Deck of the object

Replace a list of offers with a fanned deck of the brand's object, each one opening to show its content: containers with swinging doors, boarding passes, jerseys on a rail. Auto-advance, and pause on hover.
