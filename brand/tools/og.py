"""Draws the link preview card (Open Graph) into public/og-image.jpg (needs rsvg-convert and magick).
Run: python3 brand/tools/og.py

This is what WhatsApp, Telegram, Slack, X and friends show when someone shares
https://bat-hunter-game.web.app. 1200x630 is the size they all expect; the
logo and the call to play stay in the middle, which survives square crops.
"""
import os, subprocess, tempfile

from readme import BONE, FONT, INK, MOON, ROOT, bat, data_uri, reticle

W, H = 1200, 630
OUT = os.path.join(ROOT, 'public', 'og-image.jpg')


def card():
    background = data_uri(os.path.join(ROOT, 'public', 'images', 'pumpkins-bg.jpg'), 'image/jpeg')
    logo = data_uri(os.path.join(ROOT, 'brand', 'logo', 'logo-stacked-dark.svg'), 'image/svg+xml')
    owl = data_uri(os.path.join(ROOT, 'public', 'images', 'owl.svg'), 'image/svg+xml')

    flock = ''.join([
        bat(120, 110, 1.2, rotate=-8), bat(280, 60, 0.6, rotate=6), bat(1060, 120, 1.1, rotate=10),
        bat(1130, 260, 0.6, rotate=-12), bat(90, 330, 0.8, rotate=14), bat(170, 520, 0.9, rotate=12),
        bat(1150, 470, 0.7, rotate=-6), bat(880, 70, 0.5, rotate=8),
    ])
    golden = bat(990, 400, 1.1, fill=MOON, rotate=-10, extra='filter="url(#glow)"')
    target = bat(810, 150, 0.8, rotate=12) + reticle(810, 150, 46)
    # Logo 160.3 x 132 (stacked)
    logo_w = 430
    logo_h = logo_w * 132 / 160.3

    return f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="{INK}" stop-opacity="0.4"/>
      <stop offset="0.5" stop-color="{INK}" stop-opacity="0.2"/>
      <stop offset="1" stop-color="{INK}" stop-opacity="0.9"/>
    </linearGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.45" r="0.75">
      <stop offset="0.5" stop-color="{INK}" stop-opacity="0"/>
      <stop offset="1" stop-color="{INK}" stop-opacity="0.75"/>
    </radialGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="lift" x="-10%" y="-10%" width="120%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="{INK}" flood-opacity="0.85"/>
    </filter>
  </defs>
  <image href="{background}" xlink:href="{background}" width="{W}" height="{H}" preserveAspectRatio="xMidYMid slice"/>
  <rect width="{W}" height="{H}" fill="url(#shade)"/>
  <rect width="{W}" height="{H}" fill="url(#vignette)"/>
  {flock}
  {golden}
  {target}
  <image href="{owl}" xlink:href="{owl}" x="950" y="220" width="100" height="100"/>
  <image href="{logo}" xlink:href="{logo}" x="{(W - logo_w) / 2}" y="40" width="{logo_w}" height="{logo_h}" filter="url(#lift)"/>
  <text x="{W / 2}" y="470" text-anchor="middle" font-family="{FONT}" font-weight="600" font-size="44"
        fill="{BONE}" letter-spacing="1" filter="url(#lift)">Too many bats, time to drop some.</text>
  <text x="{W / 2}" y="540" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="30"
        fill="{MOON}" letter-spacing="4" filter="url(#lift)">▶ PLAY FREE · SOLO OR 1v1</text>
</svg>'''


with tempfile.TemporaryDirectory() as tmp:
    src, png = os.path.join(tmp, 'card.svg'), os.path.join(tmp, 'card.png')
    open(src, 'w').write(card())
    subprocess.run(['rsvg-convert', '-o', png, src], check=True)
    # WhatsApp skips preview images much over 300 KB
    subprocess.run(['magick', png, '-strip', '-interlace', 'JPEG', '-quality', '82', OUT], check=True)
print('wrote', os.path.relpath(OUT, ROOT), os.path.getsize(OUT) // 1024, 'KB')
