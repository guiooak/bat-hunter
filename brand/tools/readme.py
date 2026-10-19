"""Draws the README banner and play button into docs/readme (needs rsvg-convert and magick).
Run: python3 brand/tools/readme.py

The banner is the game itself: the pumpkin night, the logo, the bats of the
hard mode (regular, small, golden), the owl you must not shoot and a crosshair.
"""
import base64, os, subprocess, tempfile

TOOLS = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(TOOLS, '..', '..')
OUT = os.path.join(ROOT, 'docs', 'readme')

INK, BONE, RED, MOON, EMBER = '#120B16', '#F3EDE2', '#E63946', '#F7C873', '#E8762B'
FONT = "'Avenir Next Condensed', 'Arial Narrow', sans-serif"  # the display fallback in src/styles/tokens.scss

BAT = open(os.path.join(TOOLS, 'bat-path.txt')).read().strip()

W, H = 1280, 560
RADIUS = 24


def data_uri(path, mime):
    with open(path, 'rb') as f:
        return f'data:{mime};base64,{base64.b64encode(f.read()).decode()}'


def bat(x, y, scale, fill=INK, rotate=0, extra=''):
    return (f'<path d="{BAT}" fill="{fill}" {extra} '
            f'transform="translate({x} {y}) rotate({rotate}) scale({scale})"/>')


def reticle(x, y, r=38):
    """The red crosshair from the in-game cursor, around a target."""
    t, g = r * 1.36, r * 0.73
    shapes = (f'<circle r="{r}" fill="none"/>'
              f'<path d="M0,-{t} V-{g} M0,{g} V{t} M-{t},0 H-{g} M{g},0 H{t}"/>')
    return (f'<g transform="translate({x} {y})" stroke-linecap="butt">'
            f'<g stroke="{INK}" stroke-opacity="0.8" stroke-width="7">{shapes}</g>'
            f'<g stroke="{RED}" stroke-width="4">{shapes}</g>'
            f'<circle r="4" fill="{RED}" stroke="{INK}" stroke-width="1.5"/></g>')


def banner():
    background = data_uri(os.path.join(ROOT, 'public', 'images', 'pumpkins-bg.jpg'), 'image/jpeg')
    logo = data_uri(os.path.join(ROOT, 'brand', 'logo', 'logo-horizontal-dark.svg'), 'image/svg+xml')
    owl = data_uri(os.path.join(ROOT, 'public', 'images', 'owl.svg'), 'image/svg+xml')

    flock = ''.join([
        bat(150, 110, 1.3, rotate=-8), bat(300, 70, 0.7, rotate=6), bat(1040, 95, 1.1, rotate=10),
        bat(1180, 180, 0.6, rotate=-12), bat(90, 300, 0.8, rotate=14), bat(230, 470, 0.9, rotate=12), bat(1200, 330, 0.9, rotate=-6),
        bat(420, 150, 0.45, rotate=-14), bat(880, 60, 0.5, rotate=8),
    ])
    golden = bat(980, 400, 1.0, fill=MOON, rotate=-10, extra='filter="url(#glow)"')
    target = bat(560, 78, 0.95, rotate=12) + reticle(560, 78, 50)

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
  <defs>
    <!-- GitHub strips CSS from READMEs, so the rounded corners live in the image -->
    <clipPath id="card"><rect width="{W}" height="{H}" rx="{RADIUS}"/></clipPath>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="{INK}" stop-opacity="0.35"/>
      <stop offset="0.55" stop-color="{INK}" stop-opacity="0.15"/>
      <stop offset="1" stop-color="{INK}" stop-opacity="0.85"/>
    </linearGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.45" r="0.75">
      <stop offset="0.55" stop-color="{INK}" stop-opacity="0"/>
      <stop offset="1" stop-color="{INK}" stop-opacity="0.7"/>
    </radialGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="lift" x="-10%" y="-10%" width="120%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="{INK}" flood-opacity="0.8"/>
    </filter>
  </defs>
  <g clip-path="url(#card)">
  <image href="{background}" xlink:href="{background}" width="{W}" height="{H}" preserveAspectRatio="xMidYMid slice"/>
  <rect width="{W}" height="{H}" fill="url(#shade)"/>
  <rect width="{W}" height="{H}" fill="url(#vignette)"/>
  {flock}
  {golden}
  {target}
  <image href="{owl}" xlink:href="{owl}" x="1040" y="240" width="96" height="96"/>
  <image href="{logo}" xlink:href="{logo}" x="{(W - 700) / 2}" y="150" width="700" height="201" filter="url(#lift)"/>
  <text x="{W / 2}" y="420" text-anchor="middle" font-family="{FONT}" font-weight="600" font-size="38"
        fill="{BONE}" letter-spacing="1" filter="url(#lift)">Too many bats, time to drop some.</text>
  </g>
</svg>'''
    return svg


def button():
    w, h, c = 360, 96, 16  # chamfered like the in-game buttons
    shape = f'M{c},0 H{w - c} L{w},{c} V{h - c} L{w - c},{h} H{c} L0,{h - c} V{c} Z'
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
  <path d="{shape}" fill="{MOON}"/>
  <path d="{shape}" fill="none" stroke="{EMBER}" stroke-width="4"/>
  <path d="M44,30 L72,48 L44,66 Z" fill="{INK}"/>
  <text x="{w / 2 + 22}" y="62" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="40"
        letter-spacing="3" fill="{INK}">PLAY NOW</text>
</svg>'''


def render(svg, name, scale=1, jpg=False):
    with tempfile.TemporaryDirectory() as tmp:
        src = os.path.join(tmp, 'in.svg')
        png = os.path.join(tmp, 'out.png')
        open(src, 'w').write(svg)
        subprocess.run(['rsvg-convert', '-z', str(scale), '-o', png, src], check=True)
        out = os.path.join(OUT, name)
        if jpg:
            subprocess.run(['magick', png, '-strip', '-quality', '84', out], check=True)
        else:
            # 256 colors keep the photo light; the corners stay transparent
            subprocess.run(['magick', png, '-strip', '-colors', '256', out], check=True)
    print('wrote', os.path.relpath(out, ROOT))


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    render(banner(), 'banner.png')
    render(button(), 'play-button.png', scale=2)
