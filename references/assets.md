# Assets

## Order of preference

1. **Real photos** of the real thing. Wikimedia Commons is a good free source: use the API to get the original file, the licence and the author, and save those three into `credits.json`.
2. **Generated stills** (ChatGPT or another image model) for what no photo shows: top views of a vehicle, an illustrated city inside big letters, a cabin interior. Label them as illustrations in the `alt` text and footer.
3. **Generated film** (Veo in Google Flow, or similar) for hero loops and scrubbed scenes. Generate a start frame first, then animate it.

Never fake a photo of a real person or event. Never present a generated image as a real photograph.

## Rules

- Hero and full-bleed images at least 2560 px wide. Upscale smaller ones or replace them.
- Convert to WebP and serve a smaller variant to phones.
- Vehicles and products keep their real livery. Pass a real reference photo when the tool accepts one, and describe it precisely when it doesn't.
- Lazy-load below the fold, but preload anything a scroll scene needs before the scene starts.
- Licences that require attribution need it on the page. Print `credits.json` in the footer with links.

## Generated film prompts

One subject, one camera move, 8 seconds at most. State what stays still. Good structure:

> Aerial drone shot, slow forward glide. A [livery] high-speed train crosses a coastal viaduct at golden hour. The train stays centred. Realistic, no text, no logos added.

Check the first frame of each clip against the last frame of the previous one before you build a sequence.
