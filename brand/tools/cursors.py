"""Draws the in-game crosshair cursors into public/images/cursor (needs rsvg-convert).
Run: python3 brand/tools/cursors.py

The game tells a shot apart by the cursor URL containing "aim", so keep "aim" in the file names.
"""
import os, re, subprocess

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
OUT = os.path.join(ROOT, 'public', 'images', 'cursor')
SIZE = 64  # px; the hotspot is the center (32 32)

INK, BONE, RED, MOON, EMBER = '#120B16', '#F3EDE2', '#E63946', '#F7C873', '#E8762B'
SCORCH = '#C2410C'  # deep orange for the outer flames

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

def flame(angle, base_r, length, half_width, lean):
    """One flame tongue rooted at base_r; a negative length points it inward."""
    import math
    def pt(r, a):
        t = math.radians(a - 90)
        return f'{r * math.cos(t):.2f},{r * math.sin(t):.2f}'
    tip = base_r + length
    return (f'M{pt(base_r, angle - half_width)} '
            f'C{pt(base_r + length * 0.5, angle - half_width * 0.6 + lean * 0.3)} '
            f'{pt(base_r + length * 0.85, angle + lean * 0.8)} {pt(tip, angle + lean)} '
            f'C{pt(base_r + length * 0.55, angle + half_width * 0.4 + lean * 0.5)} '
            f'{pt(base_r + length * 0.25, angle + half_width)} {pt(base_r, angle + half_width)} Z')

def fire_ring():
    """A flickering ring of fire on the crosshair ring (r=22): thin flames on both
    sides, deep orange outside, ember in the middle and a bright moon core, with the edges
    wobbled by a turbulence filter so they read as fire, not as a gear."""
    seed = 5
    def rnd():
        nonlocal seed
        seed = (seed * 1103515245 + 12345) % 2**31
        return seed / 2**31
    def tongues(count, base_r, min_len, var_len, half_width, inward=False):
        step = 360 / count
        sign = -1 if inward else 1
        return ' '.join(flame(i * step + (rnd() - 0.5) * step, base_r, sign * (min_len + rnd() * var_len),
                              half_width + rnd() * 2, (rnd() - 0.3) * 10)
                        for i in range(count))
    ring = lambda r, w: f'<circle r="{r}" fill="none" stroke-width="{w}"/>'
    return (
        '<defs>'
        '<filter id="flicker" x="-20%" y="-20%" width="140%" height="140%">'
        '<feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="2" seed="3" result="noise"/>'
        '<feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G"/>'
        '</filter>'
        '<filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter>'
        '</defs>'
        f'<g fill="none" stroke="{EMBER}" opacity="0.75" filter="url(#glow)">{ring(23, 9)}</g>'
        f'<g filter="url(#flicker)">'
        f'<path d="{tongues(26, 22, 6, 4, 8)} {tongues(22, 24, -3, 2.5, 7, inward=True)}" fill="{SCORCH}"/>'
        f'<g stroke="{SCORCH}">{ring(23, 7)}</g>'
        f'<path d="{tongues(24, 22.5, 4, 3.5, 6.5)}" fill="{EMBER}"/>'
        f'<g stroke="{EMBER}">{ring(23, 5)}</g>'
        f'<path d="{tongues(20, 23, 2, 2.5, 5)}" fill="{MOON}"/>'
        f'<g stroke="{MOON}">{ring(23, 3)}</g>'
        f'<g stroke="#FFF4D6">{ring(23, 1)}</g>'
        '</g>')

def crosshair(color):
    """Thin cross with a center gap, with the dark halo for contrast."""
    lines = '<path d="M0,-15 V-5 M0,5 V15 M-15,0 H-5 M5,0 H15" stroke-width="1.6"/>'
    return (f'<g fill="none" stroke="{INK}" stroke-opacity="0.8">{bump(lines, 2.2)}</g>'
            f'<g fill="none" stroke="{color}">{lines}</g>')

CURSORS = {
    # Default crosshair
    'aim': svg(reticle(BONE)),
    # Over a bat: target locked
    'aim-target': svg(reticle(RED, ring=3) + f'<circle r="3.2" fill="{RED}" stroke="{INK}" stroke-width="1"/>'),
    # Shot: the crosshair ring catches fire for a moment
    'aim-shot': svg(fire_ring() + crosshair(MOON) + f'<circle r="4" fill="{MOON}" stroke="{INK}" stroke-width="1"/>'),
}

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for name, body in CURSORS.items():
        subprocess.run(['rsvg-convert', '-w', str(SIZE), '-h', str(SIZE), '-o', os.path.join(OUT, f'{name}.png')],
                       input=body.encode(), check=True)
        print('wrote', name)
