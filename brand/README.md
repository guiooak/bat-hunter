# Bat Hunter brand

Logo and logo manual for Bat Hunter, published at https://guiooak.github.io/bat-hunter/.

- `index.html` — the logo manual (generated).
- `logo/` — every logo version as SVG (generated).
- `tools/` — the code that draws the logo and builds the manual.

Everything is drawn from code, so change the source and regenerate instead of editing the SVGs:

```bash
python3 brand/tools/gen.py           # brand/logo/*.svg
python3 brand/tools/build_manual.py  # brand/index.html
python3 brand/tools/cursors.py       # public/images/cursor/*.png (in-game crosshairs)
python3 brand/tools/owl.py           # public/images/owl.svg (hard mode's innocent owl)
```

Pushing changes under `brand/` to `main` publishes the manual to GitHub Pages (`.github/workflows/pages.yml`).
