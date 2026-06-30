# MSS Keygen — Website

A simple, static site for MSS Keygen: a key generator for the executors and
externals our community uses.

## Stack
Plain HTML, CSS, and vanilla JavaScript. No build step.

## Run locally
Open `index.html` directly, or serve it (recommended, so the live Discord
member count can load):

```
python -m http.server 8000
```

Then visit http://localhost:8000

## Editing
- **Supported tools** — edit the `EXECUTORS` and `EXTERNALS` lists at the top of `script.js`.
- **Logos** — drop PNGs into `assets/logos/` matching the paths in `script.js` (a letter badge shows if a file is missing).
- **Discord** — set `DISCORD_URL` and `DISCORD_INVITE_CODE` in `script.js`.
- **Download link** — update the download button's `href` in `index.html`.

## Structure
```
index.html      markup
styles.css      styles
script.js       tools list, Discord links, live member count
assets/logos/   tool + main logos
```
