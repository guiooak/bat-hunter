import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let stopListening = () => {};

async function loadShots() {
  vi.resetModules();
  const audio = await import('./audio-service');
  const playShotSound = vi.spyOn(audio, 'playShotSound');
  const shots = await import('./shot-service');
  stopListening = shots.listenToShots();
  return { ...shots, playShotSound };
}

function pointerDown(target: EventTarget, pointerType = 'mouse') {
  const event = new MouseEvent('pointerdown', {
    bubbles: true,
    clientX: 40,
    clientY: 50,
  });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  target.dispatchEvent(event);
}

describe('shot service', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    stopListening();
    vi.useRealTimers();
  });

  it('builds the crosshair cursors', async () => {
    const { getAimCursorRegular, getAimCursorOverTarget } = await loadShots();

    expect(getAimCursorRegular()).toBe(
      "url('/images/cursor/aim.png') 32 32, auto"
    );
    expect(getAimCursorOverTarget()).toContain('aim-target.png');
  });

  it('a shot counts only where the cursor is a crosshair', async () => {
    const { isShotEnabled, getAimCursorRegular } = await loadShots();
    const target = document.createElement('div');
    document.body.appendChild(target);

    expect(isShotEnabled({ target })).toBe(false);

    target.style.cursor = getAimCursorRegular();
    expect(isShotEnabled({ target })).toBe(true);
  });

  it('falls back to the body cursor when the target has none', async () => {
    const { isShotEnabled, getAimCursorRegular } = await loadShots();
    const target = document.createElement('span');
    // A removed element (a bat just shot) has no computed cursor in browsers
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (el) =>
        ({
          cursor: el === target ? '' : getAimCursorRegular(),
        }) as CSSStyleDeclaration
    );

    expect(isShotEnabled({ target })).toBe(true);
  });

  it('stops listening when asked', async () => {
    const { playShotSound, getAimCursorRegular } = await loadShots();
    document.body.style.cursor = getAimCursorRegular();

    stopListening();
    pointerDown(document.body);

    expect(playShotSound).not.toHaveBeenCalled();
  });

  it('ignores pointers while no game cursor is set', async () => {
    const { playShotSound } = await loadShots();

    pointerDown(document.body);

    expect(playShotSound).not.toHaveBeenCalled();
    expect(document.body.style.cursor).toBe('');
  });

  it('flashes the shot cursor and plays the sound on a mouse shot', async () => {
    const { playShotSound, getAimCursorRegular } = await loadShots();
    document.body.style.cursor = getAimCursorRegular();

    pointerDown(document.body);

    expect(playShotSound).toHaveBeenCalledTimes(1);
    expect(document.body.style.cursor).toContain('aim-shot.png');
    expect(document.querySelector('.touch-shot')).toBeNull();

    vi.advanceTimersByTime(75);
    expect(document.body.style.cursor).toContain('aim.png');
  });

  it('draws the ring of fire where a finger shoots', async () => {
    const { getAimCursorRegular } = await loadShots();
    document.body.style.cursor = getAimCursorRegular();

    pointerDown(document.body, 'touch');

    const shot = document.querySelector<HTMLImageElement>('.touch-shot')!;
    expect(shot.style.left).toBe('40px');
    expect(shot.style.top).toBe('50px');

    vi.advanceTimersByTime(150);
    expect(document.querySelector('.touch-shot')).toBeNull();
  });

  it('flashes the cursor without a sound off target', async () => {
    const { playShotSound } = await loadShots();
    document.body.style.cursor = 'pointer';

    pointerDown(document.body);

    expect(playShotSound).not.toHaveBeenCalled();
    expect(document.body.style.cursor).toContain('aim-shot.png');
  });
});
