"""Builds brand/index.html (the logo manual). Run: python3 brand/tools/build_manual.py"""
import os
import re, itertools
import gen
from gen import C, symbol, wordmark, horizontal, stacked, favicon

_n = itertools.count()
def inline(svg_text, cls='', label=''):
    """Inline an SVG with unique ids, responsive sizing and an accessible label."""
    k = next(_n)
    ids = re.findall(r'id="([^"]+)"', svg_text)
    for i in ids:
        svg_text = svg_text.replace(f'id="{i}"', f'id="{i}-{k}"').replace(f'url(#{i})', f'url(#{i}-{k})')
    svg_text = re.sub(r' width="\d+" height="\d+"', '', svg_text, count=1)
    attrs = f' class="{cls}"' if cls else ''
    attrs += f' role="img" aria-label="{label}"' if label else ' aria-hidden="true"'
    return svg_text.replace('<svg ', f'<svg{attrs} ', 1)

def sym(variant='color'): return gen.svg('-50 -50 100 100', symbol(variant), 512, 512)

H = {t: horizontal(t) for t in ('dark','light','mono-light','mono-dark')}
V = {t: stacked(t) for t in ('dark','light')}

# Anatomy: symbol with callouts
anatomy = gen.svg('-120 -62 240 124', f'''
  <g transform="translate(0 0)">{symbol('color')}</g>
  <g fill="none" stroke="var(--muted)" stroke-width="0.5">
    <path d="M13,-28 L52,-46 L70,-46"/>
    <path d="M30,8 L58,20 L70,20"/>
    <path d="M-40,0 L-70,0"/>
    <path d="M0,24 L-52,46 L-70,46"/>
  </g>
  <g fill="var(--fg)" font-family="'Chakra Petch', sans-serif" font-size="6.2" font-weight="600" letter-spacing="0.6">
    <text x="72" y="-44">LUA CRESCENTE</text>
    <text x="72" y="22">ALVO</text>
    <text x="-72" y="2" text-anchor="end">MIRA</text>
    <text x="-72" y="48" text-anchor="end">BRILHO DA NOITE</text>
  </g>
  <g fill="var(--muted)" font-family="'Barlow', sans-serif" font-size="4.6">
    <text x="72" y="-37">o tempo do jogo</text>
    <text x="72" y="29">morcego travado no centro</text>
    <text x="-72" y="9" text-anchor="end">anel + 4 marcas</text>
    <text x="-72" y="55" text-anchor="end">laranja sob o morcego</text>
  </g>''', 0, 0)

# Clear space diagram: x = cap height of the wordmark in the lockup (29 units)
hz = H['dark']
m = re.search(r'viewBox="0 0 ([\d.]+) 100"', hz); hw = float(m.group(1))
inner = re.sub(r'^<svg[^>]*>', '', hz).rsplit('</svg>', 1)[0]
x = 29
clear = gen.svg(f'{-x-6} {-x-6} {hw+2*x+12} {100+2*x+12}', f'''
  <rect x="{-x}" y="{-x}" width="{hw+2*x}" height="{100+2*x}" fill="none" stroke="var(--ember)" stroke-dasharray="3 2" stroke-width="0.8"/>
  <rect x="0" y="0" width="{hw}" height="100" fill="none" stroke="var(--muted)" stroke-width="0.5"/>
  {inner}
  <g fill="var(--ember)" font-family="'Chakra Petch', sans-serif" font-size="11" font-weight="700" text-anchor="middle">
    <text x="{hw/2}" y="{-x/2+4}">x</text><text x="{hw/2}" y="{100+x/2+4}">x</text>
    <text x="{-x/2}" y="54">x</text><text x="{hw+x/2}" y="54">x</text>
  </g>''', 0, 0)

# Incorrect uses
def dont(body_svg, caption, transform='', bg='var(--night)', extra=''):
    return f'''<figure class="dont">
      <div class="dont-art" style="background:{bg}">
        <div class="dont-inner" style="transform:{transform}">{inline(body_svg)}</div>{extra}
      </div>
      <figcaption><span class="x" aria-hidden="true">✕</span>{caption}</figcaption>
    </figure>'''

recolor = H['dark'].replace(C['red'], '#3B82F6').replace(C['moon'], '#22C55E')
outline = H['dark'].replace('<path fill=', '<path stroke="#F3EDE2" stroke-width="0.6" fill="none" data-f=')
noreticle = re.sub(r'<g fill="#E63946">.*?</g>', '', H['dark'], flags=re.S)
dark_on_dark = H['mono-dark']
donts = ''.join([
    dont(H['dark'], 'Distorcer ou achatar a proporção.', 'scaleX(1.45) scaleY(0.75)'),
    dont(H['dark'], 'Girar ou inclinar a assinatura.', 'rotate(-12deg)'),
    dont(recolor, 'Trocar as cores da mira ou da lua.'),
    dont(noreticle, 'Remover ou separar a mira do morcego.'),
    dont(H['dark'], 'Usar sobre fotos ou fundos com muito detalhe.', '', bg="repeating-linear-gradient(45deg,#E8762B 0 10px,#F7C873 10px 20px,#3A1236 20px 30px)"),
    dont(dark_on_dark, 'Aplicar a versão escura sobre fundo escuro.'),
])

palette = [
  ('Noite', C['night'], 'Fundo principal, telas do jogo', 'night'),
  ('Ameixa', C['plum'], 'Borda do céu no símbolo, superfícies', 'plum'),
  ('Brasa', C['ember'], 'Brilho do céu, destaques quentes', 'ember'),
  ('Lua', C['moon'], 'Lua e “BAT” no fundo escuro', 'moon'),
  ('Mira', C['red'], 'Anel e marcas da mira, alertas do jogo', 'red'),
  ('Osso', C['bone'], 'Texto sobre fundo escuro, fundo claro', 'bone'),
  ('Tinta', C['ink'], 'Morcego, texto sobre fundo claro', 'ink'),
]
def rgb(h): h=h.lstrip('#'); return ', '.join(str(int(h[i:i+2],16)) for i in (0,2,4))
swatches = ''.join(f'''<li class="swatch">
  <span class="chip" style="background:{hx}"></span>
  <span class="sw-name">{n}</span>
  <code class="sw-hex">{hx}</code>
  <span class="sw-rgb">RGB {rgb(hx)}</span>
  <span class="sw-use">{use}</span></li>''' for n,hx,use,_ in palette)

L = gen.letters()
alphabet = ''
for ch in 'BATHUNER':
    w, polys = L[ch]
    d = ' '.join('M' + ' L'.join(f'{px:.2f},{py:.2f}' for px,py in poly) + ' Z' for poly in polys)
    alphabet += f'<li><svg viewBox="-2 -2 {w+4} 24" aria-label="{ch}" role="img"><path fill="currentColor" fill-rule="evenodd" d="{d}"/></svg></li>'

files = [
 ('logo-horizontal-dark.svg','Assinatura principal, para fundos escuros'),
 ('logo-horizontal-light.svg','Assinatura para fundos claros'),
 ('logo-horizontal-mono-light.svg','Uma cor, clara, para fundos escuros ou coloridos'),
 ('logo-horizontal-mono-dark.svg','Uma cor, escura, para fundos claros ou coloridos'),
 ('logo-stacked-dark.svg','Vertical, para fundos escuros'),
 ('logo-stacked-light.svg','Vertical, para fundos claros'),
 ('logo-stacked-mono-light.svg','Vertical em uma cor, clara'),
 ('logo-stacked-mono-dark.svg','Vertical em uma cor, escura'),
 ('symbol.svg','Símbolo colorido, para avatar e ícone do app'),
 ('symbol-mono-light.svg','Símbolo em uma cor, clara'),
 ('symbol-mono-dark.svg','Símbolo em uma cor, escura'),
 ('favicon.svg','Símbolo simplificado para 16 a 48 px'),
]
file_rows = ''.join(f'<tr><td><a href="logo/{f}" download><code>{f}</code></a></td><td>{d}</td><td><a class="dl" href="logo/{f}" download>Baixar SVG</a></td></tr>' for f,d in files)

html = f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Bat Hunter Logo Manual</title>
<meta name="description" content="Manual da logo do Bat Hunter: conceito, versões, cores, letreiro, área de proteção e usos incorretos.">
<link rel="icon" href="logo/favicon.svg" type="image/svg+xml">
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Chakra+Petch:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
/* Layout: a night-sky field guide; one dark world, with "daylight" plates where the light versions are shown. */
:root {{
  --night: {C['night']}; --plum: {C['plum']}; --ember: {C['ember']}; --moon: {C['moon']};
  --red: {C['red']}; --bone: {C['bone']}; --ink: {C['ink']};
  --bg: #120A17; --surface: #1E1226; --line: #3A2A40; --fg: #F3EDE2; --muted: #B6A7B4;
  --display: 'Chakra Petch', 'Avenir Next Condensed', 'Arial Narrow', sans-serif;
  --body: 'Barlow', 'Helvetica Neue', Arial, sans-serif;
  --mono: 'JetBrains Mono', ui-monospace, Menlo, monospace;
  color-scheme: dark;
}}
* {{ box-sizing: border-box; }}
body {{ background: var(--bg); color: var(--fg); font: 400 17px/1.6 var(--body); }}
.wrap {{ max-width: 1080px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 0; }}
h1, h2, h3 {{ font-family: var(--display); text-wrap: balance; margin: 0; line-height: 1.1; }}
h2 {{ font-size: clamp(28px, 4vw, 40px); font-weight: 700; letter-spacing: 0.01em; }}
h3 {{ font-size: 15px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }}
p {{ margin: 0; max-width: 62ch; }}
code {{ font-family: var(--mono); font-size: 0.86em; }}
.eyebrow {{ font: 600 13px/1 var(--display); letter-spacing: 0.18em; text-transform: uppercase; color: var(--ember); }}

header.hero {{ position: relative; overflow: hidden; border-bottom: 1px solid var(--line);
  background: radial-gradient(60% 90% at 70% 110%, rgba(232,118,43,.35), transparent 70%), var(--night); }}
.hero .wrap {{ padding-block: 56px 48px; display: grid; gap: 28px; }}
.hero-logo {{ width: min(680px, 100%); height: auto; }}
.hero p {{ color: var(--muted); font-size: 19px; }}
.meta a {{ color: inherit; text-underline-offset: 3px; }}
.dl, td a {{ color: var(--moon); text-underline-offset: 3px; }}
footer a {{ color: var(--fg); }}
.meta {{ display: flex; flex-wrap: wrap; gap: 8px 24px; font: 500 13px/1.4 var(--mono); color: var(--muted); }}

section {{ border-bottom: 1px solid var(--line); }}
section .wrap {{ padding-block: 64px; display: grid; gap: 28px; }}
.sec-head {{ display: grid; gap: 12px; }}
.sec-head p {{ color: var(--muted); }}

.anatomy {{ background: var(--surface); border-radius: 6px; padding: 16px; }}
.anatomy svg {{ width: 100%; height: auto; display: block; max-height: 460px; }}
.anatomy-note {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }}
.anatomy-note div {{ display: grid; gap: 6px; }}
.anatomy-note strong {{ font-family: var(--display); font-weight: 600; }}
.anatomy-note span {{ color: var(--muted); font-size: 15px; }}

.versions {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }}
.plate {{ margin: 0; display: grid; gap: 10px; }}
.plate .art {{ border-radius: 6px; padding: 32px 24px; display: grid; place-items: center; min-height: 200px; }}
.plate .art svg {{ width: 100%; height: auto; max-height: 150px; }}
.plate .art.square svg {{ max-height: 140px; width: auto; }}
.plate figcaption {{ font-size: 15px; color: var(--muted); }}
.plate figcaption b {{ color: var(--fg); font-weight: 600; display: block; }}
.on-night {{ background: var(--night); outline: 1px solid var(--line); outline-offset: -1px; }}
.on-bone {{ background: var(--bone); }}
.on-ember {{ background: var(--ember); }}
.on-moon {{ background: var(--moon); }}
.wide {{ grid-column: 1 / -1; }}

.swatches {{ list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 16px; }}
.swatch {{ display: grid; gap: 4px; }}
.chip {{ aspect-ratio: 4 / 3; border-radius: 6px; outline: 1px solid rgba(243,237,226,.12); outline-offset: -1px; margin-bottom: 6px; }}
.sw-name {{ font: 600 16px/1.2 var(--display); }}
.sw-hex {{ color: var(--fg); }}
.sw-rgb, .sw-use {{ font-size: 14px; color: var(--muted); }}
.sw-rgb {{ font-family: var(--mono); font-size: 12px; }}
.ratio {{ display: flex; height: 18px; border-radius: 4px; overflow: hidden; max-width: 640px; }}
.ratio span {{ display: block; }}

.type-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; align-items: start; }}
.alphabet {{ list-style: none; margin: 0; padding: 20px; display: flex; flex-wrap: wrap; gap: 14px; background: var(--surface); border-radius: 6px; color: var(--fg); }}
.alphabet .lettering {{ width: 100%; height: auto; display: block; }}
.specs {{ margin: 0; display: grid; grid-template-columns: max-content 1fr; gap: 8px 20px; font-size: 15px; }}
.specs dt {{ font: 500 12px/1.9 var(--mono); color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }}
.specs dd {{ margin: 0; }}
.ui-sample {{ display: grid; gap: 6px; padding: 20px; border: 1px solid var(--line); border-radius: 6px; }}
.ui-sample .d {{ font: 700 30px/1.1 var(--display); }}
.ui-sample .b {{ color: var(--muted); }}

.rules {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; align-items: center; }}
.rules svg {{ width: 100%; height: auto; }}
.minsizes {{ display: flex; flex-wrap: wrap; gap: 28px; align-items: end; }}
.minsizes figure {{ margin: 0; display: grid; gap: 8px; justify-items: start; }}
.minsizes figcaption {{ font: 500 12px/1.4 var(--mono); color: var(--muted); }}

.donts {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }}
.dont {{ margin: 0; display: grid; gap: 10px; }}
.dont-art {{ position: relative; border-radius: 6px; height: 150px; display: grid; place-items: center; overflow: hidden; outline: 1px solid var(--line); outline-offset: -1px; }}
.dont-inner {{ width: 78%; }}
.dont-inner svg {{ width: 100%; height: auto; display: block; }}
.dont-art::after {{ content: ''; position: absolute; inset: 0; background: linear-gradient(to top right, transparent calc(50% - 1.5px), rgba(230,57,70,.9) calc(50% - 1.5px), rgba(230,57,70,.9) calc(50% + 1.5px), transparent calc(50% + 1.5px)); pointer-events: none; }}
.dont figcaption {{ font-size: 15px; display: flex; gap: 8px; align-items: baseline; }}
.dont .x {{ color: var(--red); font-weight: 700; }}

.table-wrap {{ overflow-x: auto; }}
table {{ border-collapse: collapse; width: 100%; font-size: 15px; }}
td {{ padding: 12px 16px 12px 0; border-top: 1px solid var(--line); vertical-align: top; }}
td:first-child {{ white-space: nowrap; color: var(--moon); }}
footer .wrap {{ padding-block: 32px 48px; color: var(--muted); font-size: 14px; }}
@media (max-width: 520px) {{ body {{ font-size: 16px; }} section .wrap {{ padding-block: 48px; }} }}
</style>
</head>
<body>
<header class="hero">
  <div class="wrap">
    <span class="eyebrow">Manual da marca · v1.0</span>
    {inline(H['dark'], 'hero-logo', 'Logo Bat Hunter')}
    <p>A marca de um jogo de mira numa noite de Halloween: a lua crescente vista pela luneta, com o morcego travado no centro do alvo. Este manual mostra como usar a logo do Bat Hunter sem perder esse recorte.</p>
    <div class="meta"><a href="https://bat-hunter-game.web.app">bat-hunter-game.web.app</a><a href="#arquivos">Baixar arquivos</a><span>Outubro de 2026</span></div>
  </div>
</header>

<section id="conceito">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">01 · Conceito</span>
      <h2>Um alvo, uma lua, uma noite</h2>
      <p>O símbolo reúne o que o jogador vê na tela: o céu, o morcego em voo e a mira do cursor. As pontas das asas tocam o anel de propósito. É o instante do tiro, com o alvo travado.</p>
    </div>
    <div class="anatomy">{inline(anatomy, '', 'Anatomia do símbolo')}</div>
    <div class="anatomy-note">
      <div><strong>Mira</strong><span>Anel e quatro marcas em vermelho Mira. É o mesmo desenho do cursor do jogo.</span></div>
      <div><strong>Morcego</strong><span>Silhueta desenhada sob medida, com punho e dedos da asa à mostra, para não lembrar emblemas de super-herói.</span></div>
      <div><strong>Lua crescente</strong><span>Sempre no quadrante superior direito, sem tocar o morcego.</span></div>
      <div><strong>Brilho da noite</strong><span>Degradê radial de Brasa para Ameixa, mais forte atrás do morcego para recortar a silhueta.</span></div>
    </div>
  </div>
</section>

<section id="versoes">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">02 · Versões</span>
      <h2>Assinaturas</h2>
      <p>A assinatura horizontal é a principal. Use a vertical quando o espaço for mais alto do que largo, e o símbolo sozinho quando o nome já estiver por perto, como no ícone do app ou num avatar.</p>
    </div>
    <div class="versions">
      <figure class="plate wide"><div class="art on-night">{inline(H['dark'], '', 'Assinatura horizontal para fundo escuro')}</div>
        <figcaption><b>Horizontal · fundo escuro</b>Versão principal. Navbar, telas do jogo, redes sociais.</figcaption></figure>
      <figure class="plate wide"><div class="art on-bone">{inline(H['light'], '', 'Assinatura horizontal para fundo claro')}</div>
        <figcaption><b>Horizontal · fundo claro</b>“BAT” muda para um laranja mais escuro e o texto para Tinta, mantendo o contraste.</figcaption></figure>
      <figure class="plate"><div class="art on-night square">{inline(V['dark'], '', 'Assinatura vertical')}</div>
        <figcaption><b>Vertical</b>Tela inicial, cartazes, splash screen.</figcaption></figure>
      <figure class="plate"><div class="art on-night square">{inline(sym(), '', 'Símbolo')}</div>
        <figcaption><b>Símbolo</b>Ícone do app, avatar, marca d’água.</figcaption></figure>
      <figure class="plate"><div class="art on-bone square">{inline(favicon(), '', 'Favicon')}</div>
        <figcaption><b>Favicon</b>Sem a lua e com a mira mais grossa, para continuar legível entre 16 e 48 px.</figcaption></figure>
      <figure class="plate"><div class="art on-ember">{inline(H['mono-light'], '', 'Versão em uma cor clara')}</div>
        <figcaption><b>Uma cor · clara</b>Sobre Brasa, fotos escurecidas ou impressão em uma cor.</figcaption></figure>
      <figure class="plate"><div class="art on-moon">{inline(H['mono-dark'], '', 'Versão em uma cor escura')}</div>
        <figcaption><b>Uma cor · escura</b>Sobre Lua, Osso ou fundos claros coloridos.</figcaption></figure>
    </div>
  </div>
</section>

<section id="cores">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">03 · Cores</span>
      <h2>A paleta da noite</h2>
      <p>Sete cores tiradas do cenário do jogo. Noite domina a composição. Brasa e Lua aquecem. Mira aparece pouco e só onde há ação.</p>
    </div>
    <ul class="swatches">{swatches}</ul>
    <h3>Proporção de uso</h3>
    <div class="ratio" role="img" aria-label="Noite 60%, Ameixa 15%, Osso 12%, Brasa 6%, Lua 4%, Mira 3%">
      <span style="flex:60;background:var(--night);outline:1px solid var(--line)"></span><span style="flex:15;background:var(--plum)"></span><span style="flex:12;background:var(--bone)"></span><span style="flex:6;background:var(--ember)"></span><span style="flex:4;background:var(--moon)"></span><span style="flex:3;background:var(--red)"></span>
    </div>
    <p style="color:var(--muted);font-size:15px">Noite 60% · Ameixa 15% · Osso 12% · Brasa 6% · Lua 4% · Mira 3%</p>
  </div>
</section>

<section id="tipografia">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">04 · Tipografia</span>
      <h2>Letreiro desenhado, não digitado</h2>
      <p>“BAT HUNTER” é um desenho geométrico próprio, com cantos chanfrados que lembram placas de metal e miras. Não existe como fonte: use sempre os arquivos da assinatura e nunca redigite o nome.</p>
    </div>
    <div class="type-grid">
      <div style="display:grid;gap:16px">
        <h3>Letreiro</h3>
        <div class="alphabet">{inline(gen.svg(f'-3 -3 {wordmark()[0]+6:.2f} 26', wordmark(accent=C['moon'])[1], 0, 0), 'lettering', 'Letreiro BAT HUNTER')}</div>
        <dl class="specs">
          <dt>Altura</dt><dd>20 unidades, com haste de 4,6</dd>
          <dt>Chanfro</dt><dd>3,2 unidades a 45°, só nos cantos externos</dd>
          <dt>Espaço</dt><dd>2,6 entre letras e 7 entre palavras</dd>
        </dl>
      </div>
      <div style="display:grid;gap:16px">
        <h3>Fontes de apoio</h3>
        <div class="ui-sample"><span class="d">Chakra Petch</span><span class="b">Títulos, placares e botões. Os mesmos chanfros do letreiro. Google Fonts, licença OFL.</span></div>
        <div class="ui-sample"><span class="d" style="font-family:var(--body);font-weight:600">Barlow</span><span class="b">Textos corridos, chat e instruções. Google Fonts, licença OFL.</span></div>
      </div>
    </div>
  </div>
</section>

<section id="regras">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">05 · Área de proteção e tamanho mínimo</span>
      <h2>Espaço para respirar</h2>
      <p>A medida <b>x</b> é a altura das letras do letreiro na assinatura. Mantenha pelo menos x livre em volta de toda a logo, sem texto, bordas ou outros elementos.</p>
    </div>
    <div class="rules">
      <div class="anatomy">{inline(clear, '', 'Área de proteção da assinatura horizontal')}</div>
      <div style="display:grid;gap:20px">
        <h3>Tamanho mínimo</h3>
        <div class="minsizes">
          <figure>{inline(H['dark'], '', 'Assinatura a 120 px').replace('<svg', '<svg style="width:120px;height:auto"', 1)}<figcaption>Horizontal · 120 px / 30 mm</figcaption></figure>
          <figure>{inline(V['dark'], '', 'Vertical a 64 px').replace('<svg', '<svg style="width:64px;height:auto"', 1)}<figcaption>Vertical · 64 px</figcaption></figure>
          <figure>{inline(sym(), '', 'Símbolo a 32 px').replace('<svg', '<svg style="width:32px;height:32px"', 1)}<figcaption>Símbolo · 32 px</figcaption></figure>
          <figure>{inline(favicon(), '', 'Favicon a 16 px').replace('<svg', '<svg style="width:16px;height:16px"', 1)}<figcaption>Favicon · 16 px</figcaption></figure>
        </div>
        <p style="color:var(--muted);font-size:15px">Abaixo de 32 px, troque o símbolo pelo favicon: a lua e os dedos da asa somem em tamanhos pequenos.</p>
      </div>
    </div>
  </div>
</section>

<section id="nao-faca">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">06 · Usos incorretos</span>
      <h2>O que não fazer</h2>
      <p>A logo só funciona com a proporção, as cores e as peças originais. Qualquer ajuste começa pelos arquivos de <code>brand/</code>.</p>
    </div>
    <div class="donts">{donts}</div>
  </div>
</section>

<section id="arquivos">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">07 · Arquivos</span>
      <h2>Baixar a logo</h2>
      <p>Todos os arquivos são SVG, sem fontes externas, e também ficam na pasta <code>brand/logo</code> do repositório <code>guiooak/bat-hunter</code>. Para mudar algo, edite <code>brand/tools/gen.py</code> e gere tudo de novo.</p>
    </div>
    <div class="table-wrap"><table><tbody>{file_rows}</tbody></table></div>
  </div>
</section>

<footer><div class="wrap">Bat Hunter · Manual da marca v1.0 · O símbolo, o morcego e o letreiro foram desenhados para este projeto. <a href="https://bat-hunter-game.web.app">Jogar</a> · <a href="https://github.com/guiooak/bat-hunter/tree/main/brand">Código-fonte da marca</a></div></footer>
</body>
</html>
'''
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'index.html'), 'w').write(html)
print(len(html))
