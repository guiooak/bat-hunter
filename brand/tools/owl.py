"""Draws the innocent owl of the hard mode into public/images/owl.svg.
Run: python3 brand/tools/owl.py

Brand colors on purpose: the bats are black, so a warm owl with big eyes reads
as "do not shoot" at a glance. The wings flap with CSS inside the SVG.
"""
import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
OUT = os.path.join(ROOT, 'public', 'images', 'owl.svg')

INK, BONE, MOON, EMBER = '#120B16', '#F3EDE2', '#F7C873', '#E8762B'
SCORCH = '#C2410C'  # wings, a shade under the body

STYLE = '''
.wing{transform-box:fill-box;animation:flap .3s ease-in-out infinite alternate}
.left{transform-origin:100% 10%}
.right{transform-origin:0% 10%;animation-name:flap-right}
@keyframes flap{to{transform:rotate(-40deg)}}
@keyframes flap-right{to{transform:rotate(40deg)}}
'''

BODY = f'''
<path class="wing left" d="M19 27 C9 29 3 37 5 48 C11 43 16 41 21 41 Z" fill="{SCORCH}"/>
<path class="wing right" d="M45 27 C55 29 61 37 59 48 C53 43 48 41 43 41 Z" fill="{SCORCH}"/>
<path d="M20 19 L17 7 L27 14 Z M44 19 L47 7 L37 14 Z" fill="{EMBER}"/>
<path d="M32 12 C22 12 18 20 18 30 C18 45 24 55 32 55 C40 55 46 45 46 30 C46 20 42 12 32 12 Z" fill="{EMBER}"/>
<ellipse cx="32" cy="41" rx="9" ry="11" fill="{MOON}"/>
<circle cx="26" cy="25" r="6.5" fill="{BONE}"/>
<circle cx="38" cy="25" r="6.5" fill="{BONE}"/>
<circle cx="26" cy="25" r="3.2" fill="{INK}"/>
<circle cx="38" cy="25" r="3.2" fill="{INK}"/>
<path d="M30 30 H34 L32 34 Z" fill="{INK}"/>
'''

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">'
       f'<style>{" ".join(STYLE.split())}</style>{"".join(BODY.split(chr(10)))}</svg>\n')

with open(OUT, 'w') as f:
    f.write(svg)
print('wrote', os.path.relpath(OUT, ROOT))
