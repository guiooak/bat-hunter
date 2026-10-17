"""Bat Hunter logo: draws every SVG in brand/logo from code. Run: python3 brand/tools/gen.py"""
import os
BAT = open(os.path.join(os.path.dirname(__file__) or '.', 'bat-path.txt')).read()
C = dict(night='#160C1C', plum='#3A1236', ember='#E8762B', moon='#F7C873', red='#E63946', bone='#F3EDE2', ink='#120B16')

def symbol(variant='color'):
    """Symbol in a -50..50 box."""
    if variant == 'color':
        return f'''
  <defs>
    <radialGradient id="sky" cx="0.5" cy="0.6" r="0.62">
      <stop offset="0" stop-color="{C['ember']}"/>
      <stop offset="0.55" stop-color="#9C3B2E"/>
      <stop offset="1" stop-color="{C['plum']}"/>
    </radialGradient>
    <mask id="crescent"><rect x="-50" y="-50" width="100" height="100" fill="#fff"/><circle cx="19.5" cy="-26" r="11.5" fill="#000"/></mask>
    <clipPath id="disc"><circle r="40"/></clipPath>
  </defs>
  <circle r="40" fill="url(#sky)"/>
  <g clip-path="url(#disc)">
    <circle cx="13" cy="-20" r="13" fill="{C['moon']}" mask="url(#crescent)"/>
  </g>
  <path d="{BAT}" fill="{C['ink']}" transform="translate(0 9) scale(0.78)"/>
  {reticle(C['red'])}'''
    color = C['bone'] if variant == 'mono-light' else C['ink']
    return f'''
  <defs>
    <mask id="crescent-{variant}"><rect x="-50" y="-50" width="100" height="100" fill="#fff"/><circle cx="19.5" cy="-26" r="11.5" fill="#000"/></mask>
  </defs>
  <circle cx="13" cy="-20" r="13" fill="{color}" mask="url(#crescent-{variant})"/>
  <path d="{BAT}" fill="{color}" transform="translate(0 9) scale(0.78)"/>
  {reticle(color)}'''

def reticle(color):
    t = 4
    ticks = ''.join(
        f'<rect x="{-t/2}" y="-50" width="{t}" height="15" transform="rotate({a})"/>'
        for a in (0, 90, 180, 270))
    return f'<g fill="{color}"><circle r="40" fill="none" stroke="{color}" stroke-width="{t}"/>{ticks}</g>'

# Custom geometric caps: cap height 20, stroke S, chamfer K.
S, K = 4.6, 3.2
def letters():
    L = {}
    w = 15
    L['B'] = (w, [[(0,0),(w-K,0),(w,K),(w,8.4),(w-1.6,10),(w,11.6),(w,20-K),(w-K,20),(0,20)],
                   [(S,S),(w-S,S),(w-S,10-S/2),(S,10-S/2)],
                   [(S,10+S/2),(w-S,10+S/2),(w-S,20-S),(S,20-S)]])
    w = 15.5
    L['A'] = (w, [[(0,20),(0,K+1),(K+1,0),(w-K-1,0),(w,K+1),(w,20),(w-S,20),(w-S,13.2),(S,13.2),(S,20)],
                   [(S,S),(w-S,S),(w-S,13.2-S),(S,13.2-S)]])
    w = 14.5
    L['T'] = (w, [[(0,0),(w,0),(w,S),(w/2+S/2,S),(w/2+S/2,20),(w/2-S/2,20),(w/2-S/2,S),(0,S)]])
    w = 15
    L['H'] = (w, [[(0,0),(S,0),(S,7.7),(w-S,7.7),(w-S,0),(w,0),(w,20),(w-S,20),(w-S,12.3),(S,12.3),(S,20),(0,20)]])
    L['U'] = (w, [[(0,0),(S,0),(S,20-S),(w-S,20-S),(w-S,0),(w,0),(w,20-K),(w-K,20),(K,20),(0,20-K)]])
    L['N'] = (w, [[(0,0),(S+0.6,0),(w-S,11.2),(w-S,0),(w,0),(w,20),(w-S-0.6,20),(S,8.8),(S,20),(0,20)]])
    w = 13
    L['E'] = (w, [[(0,0),(w,0),(w,S),(S,S),(S,7.7),(w-1.4,7.7),(w-1.4,12.3),(S,12.3),(S,20-S),(w,20-S),(w,20),(0,20)]])
    w = 15
    L['R'] = (w, [[(0,0),(w-K,0),(w,K),(w,9.6),(w-2.4,12.1),(w,20),(w-S-0.4,20),(w-S-2.6,12.6),(S,12.6),(S,20),(0,20)],
                   [(S,S),(w-S,S),(w-S,12.6-S),(S,12.6-S)]])
    return L

def wordmark(text='BAT HUNTER', color=C['bone'], accent=None, tracking=2.6, space=7):
    L = letters(); x = 0; paths = []
    for i, ch in enumerate(text):
        if ch == ' ':
            x += space; continue
        w, polys = L[ch]
        d = ' '.join('M' + ' L'.join(f'{px+x:.2f},{py:.2f}' for px, py in poly) + ' Z' for poly in polys)
        fill = accent if (accent and i < 3) else color
        paths.append(f'<path fill="{fill}" fill-rule="evenodd" d="{d}"/>')
        x += w + tracking
    return x - tracking, '\n  '.join(paths)

def svg(viewbox, body, w, h):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}" width="{w}" height="{h}">{body}\n</svg>\n'

# ---- Full asset set -------------------------------------------------------
SC = 1.45          # wordmark scale inside lockups (cap height = 29 = 0.29 of the symbol box)
GAP = 16           # symbol (ring) to wordmark gap

def palette(theme):
    if theme == 'dark':   return dict(word=C['bone'], accent=C['moon'], sym='color')
    if theme == 'light':  return dict(word=C['ink'], accent='#C2410C', sym='color')
    if theme == 'mono-light': return dict(word=C['bone'], accent=None, sym='mono-light')
    return dict(word=C['ink'], accent=None, sym='mono-dark')

def horizontal(theme):
    p = palette(theme)
    ww, wm = wordmark(color=p['word'], accent=p['accent'])
    x0 = 100 + GAP
    width = x0 + ww * SC
    body = (f'<g transform="translate(50 50)">{symbol(p["sym"])}</g>'
            f'<g transform="translate({x0} {50 - 10*SC:.2f}) scale({SC})">{wm}</g>')
    return svg(f'0 0 {width:.2f} 100', body, round(width*4), 400)

def stacked(theme):
    p = palette(theme)
    ww, wm = wordmark(color=p['word'], accent=p['accent'])
    sc = 1.0
    width = max(100, ww*sc)
    body = (f'<g transform="translate({width/2:.2f} 50)">{symbol(p["sym"])}</g>'
            f'<g transform="translate({(width-ww*sc)/2:.2f} 112) scale({sc})">{wm}</g>')
    return svg(f'0 0 {width:.2f} 132', body, round(width*4), 528)

def favicon():
    # Simplified for 16–48px: no moon, thicker reticle, bigger bat.
    t = 7
    ticks = ''.join(f'<rect x="{-t/2}" y="-50" width="{t}" height="17" transform="rotate({a})"/>' for a in (0,90,180,270))
    body = f'''
  <defs><radialGradient id="g" cx="0.5" cy="0.55" r="0.6"><stop offset="0" stop-color="{C['ember']}"/><stop offset="1" stop-color="{C['plum']}"/></radialGradient></defs>
  <circle r="40" fill="url(#g)"/>
  <path d="{BAT}" fill="{C['ink']}" transform="translate(0 3) scale(0.86)"/>
  <g fill="{C['red']}"><circle r="40" fill="none" stroke="{C['red']}" stroke-width="{t}"/>{ticks}</g>'''
    return svg('-50 -50 100 100', body, 512, 512)

def build(out):
    os.makedirs(out, exist_ok=True)
    def write(name, s): open(os.path.join(out, name), 'w').write(s)
    write('symbol.svg', svg('-50 -50 100 100', symbol('color'), 512, 512))
    write('symbol-mono-light.svg', svg('-50 -50 100 100', symbol('mono-light'), 512, 512))
    write('symbol-mono-dark.svg', svg('-50 -50 100 100', symbol('mono-dark'), 512, 512))
    for theme in ('dark', 'light', 'mono-light', 'mono-dark'):
        write(f'logo-horizontal-{theme}.svg', horizontal(theme))
        write(f'logo-stacked-{theme}.svg', stacked(theme))
    write('favicon.svg', favicon())
    # PNG app icon for iOS home screens (needs rsvg-convert; skipped without it)
    import shutil, subprocess
    if shutil.which('rsvg-convert'):
        icon = favicon().replace('<circle r="40" fill="url(#g)"/>', '<rect x="-50" y="-50" width="100" height="100" fill="#160C1C"/><circle r="40" fill="url(#g)"/>')
        subprocess.run(['rsvg-convert', '-w', '180', '-h', '180', '-o', os.path.join(out, 'apple-touch-icon.png')],
                       input=icon.encode(), check=True)


if __name__ == '__main__':
    build(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'logo'))
