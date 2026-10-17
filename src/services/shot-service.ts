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

export function isShotEnabled(e: ShotEventType) {
  const computedCursor =
    window.getComputedStyle(e.target as Element).cursor ||
    window.getComputedStyle(bodyEl).cursor;

  return computedCursor.includes('aim');
}

// shot handler
document.onmousedown = (e) => {
  if (!bodyEl.style.cursor) return;

  if (isShotEnabled(e)) {
    playShotSound();
  }

  bodyEl.style.cursor = getAimCursorShot();

  setTimeout(() => {
    bodyEl.style.cursor = getAimCursorRegular();
  }, 75);
};
