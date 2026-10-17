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

def flame(angle, base_r, length, half_width, lean):
    """One flame tongue rooted at base_r, pointing outward and leaning sideways by lean degrees."""
    import math
    def pt(r, a):
        t = math.radians(a - 90)
        return f'{r * math.cos(t):.2f},{r * math.sin(t):.2f}'
    tip = base_r + length
    return (f'M{pt(base_r, angle - half_width)} '
            f'C{pt(base_r + length * 0.45, angle - half_width * 0.8 + lean * 0.4)} '
            f'{pt(base_r + length * 0.8, angle + lean * 0.7)} {pt(tip, angle + lean)} '
            f'C{pt(base_r + length * 0.6, angle + half_width * 0.5 + lean * 0.6)} '
            f'{pt(base_r + length * 0.3, angle + half_width)} {pt(base_r, angle + half_width)} Z')

def fire_ring():
    """A ring of fire in place of the crosshair ring: red tips, ember body, moon core."""
    seed = 11
    def rnd():
        nonlocal seed
        seed = (seed * 1103515245 + 12345) % 2**31
        return seed / 2**31
    def layer(count, base_r, min_len, var_len, half_width, offset):
        step = 360 / count
        return ' '.join(flame(i * step + offset + (rnd() - 0.5) * step * 0.5, base_r,
                              min_len + rnd() * var_len, half_width, 9 + rnd() * 8)
                        for i in range(count))
    return (f'<defs><radialGradient id="halo" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="32">'
            f'<stop offset="0.45" stop-color="{EMBER}" stop-opacity="0"/>'
            f'<stop offset="0.68" stop-color="{EMBER}" stop-opacity="0.55"/>'
            f'<stop offset="1" stop-color="{EMBER}" stop-opacity="0"/></radialGradient></defs>'
            f'<circle r="32" fill="url(#halo)"/>'
            f'<path d="{layer(14, 18.5, 9, 4, 15, 0)}" fill="{RED}"/>'
            f'<path d="{layer(14, 19.5, 6, 3, 12, 12)}" fill="{EMBER}"/>'
            f'<path d="{layer(12, 20.5, 3, 2, 10, 6)}" fill="{MOON}"/>'
            f'<circle r="22" fill="none" stroke="{MOON}" stroke-width="2.6"/>')

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
    # Shot: the crosshair catches fire for a moment
    'aim-shot': svg(fire_ring() + crosshair(MOON) + f'<circle r="4" fill="{MOON}" stroke="{INK}" stroke-width="1"/>'),
}

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for name, body in CURSORS.items():
        subprocess.run(['rsvg-convert', '-w', str(SIZE), '-h', str(SIZE), '-o', os.path.join(OUT, f'{name}.png')],
                       input=body.encode(), check=True)
        print('wrote', name)
