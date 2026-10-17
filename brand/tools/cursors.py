"""Draws the in-game crosshair cursors into public/images/cursor (needs rsvg-convert).
Run: python3 brand/tools/cursors.py

The game tells a shot apart by the cursor URL containing "aim", so keep "aim" in the file names.
"""
import os, re, subprocess

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
OUT = os.path.join(ROOT, 'public', 'images', 'cursor')
SIZE = 64  # px; the hotspot is the center (32 32)

INK, BONE, RED, MOON, EMBER = '#120B16', '#F3EDE2', '#E63946', '#F7C873', '#E8762B'

def reticle(color, ring=2.4, tick=3, halo=INK):
    """Ring + 4 ticks + crosshair with a center gap, in a -32..32 box, with a dark halo for contrast."""
    shapes = f'''
    <circle r="22" fill="none" stroke-width="{ring}"/>
    <path d="M0,-30 V-16 M0,16 V30 M-30,0 H-16 M16,0 H30" stroke-width="{tick}" stroke-linecap="butt"/>
    <path d="M0,-12 V-5 M0,5 V12 M-12,0 H-5 M5,0 H12" stroke-width="1.4"/>'''
    return (f'<g fill="none" stroke="{halo}" stroke-opacity="0.8">{bump(shapes, 2.2)}</g>'
            f'<g fill="none" stroke="{color}">{shapes}</g>')

def bump(shapes, extra):
    """Same shapes with thicker strokes, drawn underneath as the dark halo."""
    return re.sub(r'stroke-width="([\d.]+)"', lambda m: f'stroke-width="{float(m.group(1)) + extra:g}"', shapes)

def svg(body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-32 -32 64 64" width="{SIZE}" height="{SIZE}">{body}</svg>'

CURSORS = {
    # Default crosshair
    'aim': svg(reticle(BONE)),
    # Over a bat: target locked
    'aim-target': svg(reticle(RED, ring=3) + f'<circle r="3.2" fill="{RED}" stroke="{INK}" stroke-width="1"/>'),
    # Shot: a short muzzle flash
    'aim-shot': svg(
        f'<defs><radialGradient id="f"><stop offset="0" stop-color="{MOON}"/>'
        f'<stop offset="0.45" stop-color="{EMBER}" stop-opacity="0.85"/>'
        f'<stop offset="1" stop-color="{EMBER}" stop-opacity="0"/></radialGradient></defs>'
        f'<circle r="20" fill="url(#f)"/>'
        + ''.join(f'<path d="M0,-25 V-31" stroke="{MOON}" stroke-width="2.4" stroke-linecap="round" transform="rotate({a})"/>'
                  for a in range(22, 360, 45))
        + reticle(MOON) + f'<circle r="4" fill="{MOON}" stroke="{INK}" stroke-width="1"/>'),
}

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for name, body in CURSORS.items():
        subprocess.run(['rsvg-convert', '-w', str(SIZE), '-h', str(SIZE), '-o', os.path.join(OUT, f'{name}.png')],
                       input=body.encode(), check=True)
        print('wrote', name)
