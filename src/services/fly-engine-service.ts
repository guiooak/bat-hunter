import { playBatSound, playOwlSound } from './audio-service';
import { getAimCursorOverTarget } from './shot-service';
import { BAT_TYPES, BatType } from './bat-types';

const BAT_SIZE = 48;
const OWL_IMG = '/images/owl.svg';

export const FLYING_BAT_IMG =
  'data:image/gif;base64,R0lGODlhMAAwAJECAAAAAEJCQv///////yH/C05FVFNDQVBFMi4wAwEAAAAh+QQJAQACACwAAAAAMAAwAAACdpSPqcvtD6NcYNpbr4Z5ewV0UvhRohOe5UE+6cq0carCgpzQuM3ut16zvRBAH+/XKQ6PvaQyCFs+mbnWlEq0FrGi15XZJSmxP8OTRj4DyWY1lKdmV8fyLL3eXOPn6D3f6BcoOEhYaHiImKi4yNjo+AgZKTl5WAAAIfkECQEAAgAsAAAAADAAMAAAAnyUj6nL7Q+jdCDWicF9G1vdeWICao05ciUVpkrZIqjLwCdI16s+5wfck+F8JOBiR/zZZAJk0mAsDp/KIHRKvVqb2KxTu/Vdvt/nGFs2V5Bpta3tBcKp8m5WWL/z5PpbtH/0B/iyNGh4iJiouMjY6PgIGSk5SVlpeYmZqVkAACH5BAkBAAIALAAAAAAwADAAAAJhlI+py+0Po5y02ouz3rz7D4biSJbmiabq6gCs4B5AvM7GTKv4buby7vsAbT9gZ4h0JYmZpXO4YEKeVCk0QkVUlw+uYovE8ibgaVBSLm1Pa3W194rL5/S6/Y7P6/f8vp9SAAAh+QQJAQACACwAAAAAMAAwAAACZZSPqcvtD6OctNqLs968+w+G4kiW5omm6ooALeCusAHHclyzQs3rOz9jAXuqIRFlPJ6SQWRSaIQOpUBqtfjEZpfMJqmrHIFtpbGze2ZywWu0aUwWEbfiZvQdD4sXuWUj7gPos1EAACH5BAkBAAIALAAAAAAwADAAAAJrlI+py+0Po5y02ouz3rz7D4ZiCIxUaU4Amjrr+rDg+7ojXTdyh+e7kPP0egjabGg0EIVImHLJa6KaUam1aqVynNNsUvPTQjO/J84cFA3RzlaJO2495TF63Y7P6/f8vv8PGCg4SFhoeIg4UQAAIfkEBQEAAgAsAAAAADAAMAAAAnaUj6nL7Q+jXGDaW6+GeXsFdFL4UaITnuVBPunKtHGqwoKc0LjN7rdes70QQB/v1ykOj72kMghbPpm51pRKtBaxoteV2SUpsT/Dk0Y+A8lmNZSnZlfH8iy93lzj5+g93+gXKDhIWGh4iJiouMjY6PgIGSk5eVgAADs=';

/*! JS Bat 2013 - v1.2 - Eric Grange - wwwindow.delphitools.info */
export function createBat({
  type = 'normal',
  withPoints = false,
  onHit = () => {},
}: {
  type?: BatType;
  // Floats the points earned where the bat was hit
  withPoints?: boolean;
  onHit?: (type: BatType) => void;
} = {}) {
  const { random, pow, sqrt } = Math;
  const config = BAT_TYPES[type];
  const image = document.createElement('img');
  const div = document.createElement('div');
  const divStyle = div.style;

  let opacity = '0';
  let windowWidth = window.innerWidth * random();
  let windowHeight = window.innerHeight * random();
  let bornAt = 0;

  div.classList.add('flying-bat', `flying-bat--${type}`);

  // Kill bat on click or tap
  div.onpointerdown = (e) => {
    div.remove();
    onHit(type);
    if (withPoints) showPoints(config.points, e.clientX, e.clientY);

    if (config.innocent) {
      playOwlSound();
    } else {
      playBatSound();
    }
  };

  div.style.cursor = getAimCursorOverTarget();

  div.style.userSelect = 'none';

  divStyle.position = 'fixed';
  divStyle.left = '0';
  divStyle.top = '0';
  divStyle.opacity = '0';
  div.appendChild(image);
  image.src = type === 'owl' ? OWL_IMG : FLYING_BAT_IMG;
  image.alt = '';
  image.draggable = false;
  image.style.width = `${BAT_SIZE * config.scale}px`;
  document.body.appendChild(div);

  function R(length: number, innerLength: number) {
    const min = Math.min(length + (random() - 0.5) * 400, innerLength - 50);

    return Math.max(min, 50);
  }

  function A() {
    // Stop flying once the bat was killed or removed (e.g. killAllBats)
    if (!div.isConnected) return;

    bornAt ||= Date.now();

    // Rare bats do not wait: past their lifetime they fly off the screen
    const isLeaving =
      config.lifetime !== undefined && Date.now() - bornAt > config.lifetime;

    const x = isLeaving
      ? windowWidth > window.innerWidth / 2
        ? window.innerWidth + 150
        : -150
      : R(windowWidth, window.innerWidth);
    const y = isLeaving ? windowHeight : R(windowHeight, window.innerHeight);

    const timeout =
      (5 * sqrt(pow(windowWidth - x, 2) + pow(windowHeight - y, 2))) /
      config.speed;

    divStyle.opacity = opacity;
    opacity = '1';

    interface WebkitCSSStyleDeclaration extends CSSStyleDeclaration {
      webkitTransition: string;
      webkitTransform: string;
    }

    (divStyle as WebkitCSSStyleDeclaration).transition = (
      divStyle as WebkitCSSStyleDeclaration
    ).webkitTransition = `${timeout / 1000}s linear`;

    (divStyle as WebkitCSSStyleDeclaration).transform = (
      divStyle as WebkitCSSStyleDeclaration
    ).webkitTransform = `translate(${x}px,${y}px)`;

    (image.style as WebkitCSSStyleDeclaration).transform = (
      image.style as WebkitCSSStyleDeclaration
    ).webkitTransform = windowWidth > x ? '' : 'scaleX(-1)';

    windowWidth = x;
    windowHeight = y;

    if (isLeaving) {
      setTimeout(() => div.remove(), timeout);
      return;
    }

    setTimeout(A, timeout);
  }

  setTimeout(A, random() * 3000);
}

// Floating "+3" / "-5" where the bat was hit
function showPoints(points: number, x: number, y: number) {
  const label = document.createElement('div');

  label.className = `bat-points ${points < 0 ? 'bat-points--negative' : ''}`;
  label.textContent = points > 0 ? `+${points}` : `\u2212${Math.abs(points)}`;
  label.style.left = `${x}px`;
  label.style.top = `${y}px`;
  document.body.appendChild(label);

  setTimeout(() => label.remove(), 800);
}
