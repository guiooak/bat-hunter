import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as audio from './audio-service';
import { createBat, FLYING_BAT_IMG } from './fly-engine-service';

// Math.random calls: the start (x, y), the delay before the first flight, and
// then x and y of each step. The steps oscillate (-80px, +80px) so the bat
// never sticks to a screen edge.
function mockRandom(startX: number, startY = 0.5) {
  const steps = [0.3, 0.3, 0.7, 0.7];
  let call = 0;

  vi.spyOn(Math, 'random').mockImplementation(() => {
    const i = call++;
    if (i === 0) return startX;
    if (i === 1) return startY;
    if (i === 2) return 0;
    return steps[(i - 3) % steps.length];
  });
}

const bat = () => document.querySelector<HTMLDivElement>('.flying-bat');

function hit(target: Element, x = 10, y = 20) {
  const event = new MouseEvent('pointerdown', { clientX: x, clientY: y });
  target.dispatchEvent(event);
}

describe('createBat', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('adds a regular bat by default, hidden until it starts flying', () => {
    mockRandom(0.5);

    createBat();

    const div = bat()!;
    expect(div).toHaveClass('flying-bat', 'flying-bat--normal');
    expect(div.style.opacity).toBe('0');
    expect(div.style.cursor).toContain('aim-target.png');
    expect(div.querySelector('img')!.src).toBe(FLYING_BAT_IMG);
    expect(div.querySelector('img')!.style.width).toBe('48px');
  });

  it('flies in steps, facing where it goes, and appears after the first one', () => {
    mockRandom(0.5);
    createBat();
    const div = bat()!;
    const image = div.querySelector('img')!;

    vi.advanceTimersByTime(0);
    expect(div.style.opacity).toBe('0');
    expect(div.style.transform).toMatch(/^translate\(/);
    expect(image.style.transform).toBe('');

    vi.advanceTimersByTime(600);
    expect(div.style.opacity).toBe('1');
    expect(image.style.transform).toBe('scaleX(-1)');
  });

  it('stops flying once removed', () => {
    mockRandom(0.5);
    createBat();
    bat()!.remove();

    vi.advanceTimersByTime(5000);

    expect(bat()).toBeNull();
  });

  it('stays inside the screen margins', () => {
    mockRandom(0.01, 0.01);
    createBat();

    vi.advanceTimersByTime(0);

    expect(bat()!.style.transform).toBe('translate(50px,50px)');
  });

  it('is shot: removed, scored and with a bat sound', () => {
    const playBatSound = vi.spyOn(audio, 'playBatSound');
    const onHit = vi.fn();
    mockRandom(0.5);
    createBat({ type: 'small', onHit });

    hit(bat()!);

    expect(bat()).toBeNull();
    expect(onHit).toHaveBeenCalledWith('small');
    expect(playBatSound).toHaveBeenCalled();
    expect(document.querySelector('.bat-points')).toBeNull();
  });

  it('floats the points where it was hit when asked', () => {
    mockRandom(0.5);
    createBat({ type: 'golden', withPoints: true });

    hit(bat()!, 30, 40);

    const label = document.querySelector<HTMLDivElement>('.bat-points')!;
    expect(label.textContent).toBe('+10');
    expect(label).not.toHaveClass('bat-points--negative');
    expect(label.style.left).toBe('30px');
    expect(label.style.top).toBe('40px');

    vi.advanceTimersByTime(800);
    expect(document.querySelector('.bat-points')).toBeNull();
  });

  it('the owl looks different, sounds sad and costs points', () => {
    const playOwlSound = vi.spyOn(audio, 'playOwlSound');
    mockRandom(0.5);
    createBat({ type: 'owl', withPoints: true });
    const div = bat()!;

    expect(div.querySelector('img')!.src).toContain('/images/owl.svg');
    expect(div.querySelector('img')!.style.width).toBe(`${48 * 1.1}px`);

    hit(div);

    expect(playOwlSound).toHaveBeenCalled();
    const label = document.querySelector('.bat-points')!;
    expect(label.textContent).toBe('−5');
    expect(label).toHaveClass('bat-points--negative');
  });

  it('the golden bat flies off to the right after its lifetime', () => {
    mockRandom(0.9);
    createBat({ type: 'golden' });
    const div = bat()!;

    vi.advanceTimersByTime(6500);

    expect(div.style.transform).toContain(`translate(${1024 + 150}px,`);
    vi.advanceTimersByTime(5000);
    expect(bat()).toBeNull();
  });

  it('the golden bat flies off to the left from the left side', () => {
    mockRandom(0.1);
    createBat({ type: 'golden' });
    const div = bat()!;

    vi.advanceTimersByTime(6500);

    expect(div.style.transform).toContain('translate(-150px,');
  });
});
