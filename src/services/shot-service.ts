import { playShotSound } from './audio-service';

// Drawn by brand/tools/cursors.py. The originals are still in /images
// (aim.png, aim-shot.png, aim-target.png, hotspot "30 30") to switch back.
// isShotEnabled() relies on these paths containing "aim".
const aimImagePath = '/images/cursor/aim.png';
const aimImageShotPath = '/images/cursor/aim-shot.png';
const aimTargetImagePath = '/images/cursor/aim-target.png';
const bodyEl = document.querySelector('body')!;

export function getAimCursorOverTarget() {
  return buildAimCursor(aimTargetImagePath);
}

export function getAimCursorRegular() {
  return buildAimCursor(aimImagePath);
}

function getAimCursorShot() {
  return buildAimCursor(aimImageShotPath);
}

function buildAimCursor(imgPath: string, position = '32 32') {
  return `url('${imgPath}') ${position}, auto`;
}

export type ShotEventType = { target: EventTarget | null };

const TOUCH_SHOT_DURATION = 150;

// Touch screens have no cursor, so the ring of fire is drawn where the finger
// landed instead.
function showTouchShot(x: number, y: number) {
  const shot = document.createElement('img');

  shot.src = aimImageShotPath;
  shot.alt = '';
  shot.className = 'touch-shot';
  shot.style.left = `${x}px`;
  shot.style.top = `${y}px`;
  document.body.appendChild(shot);

  setTimeout(() => shot.remove(), TOUCH_SHOT_DURATION);
}

export function isShotEnabled(e: ShotEventType) {
  const computedCursor =
    window.getComputedStyle(e.target as Element).cursor ||
    window.getComputedStyle(bodyEl).cursor;

  return computedCursor.includes('aim');
}

// shot handler. Pointer events cover mouse, touch and pen.
document.onpointerdown = (e) => {
  if (!bodyEl.style.cursor) return;

  if (isShotEnabled(e)) {
    playShotSound();

    if (e.pointerType !== 'mouse') {
      showTouchShot(e.clientX, e.clientY);
    }
  }

  bodyEl.style.cursor = getAimCursorShot();

  setTimeout(() => {
    bodyEl.style.cursor = getAimCursorRegular();
  }, 75);
};
