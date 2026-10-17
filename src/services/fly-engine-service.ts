import { playBatSound } from './audio-service';
import { getAimCursorOverTarget } from './shot-service';

const FLYING_BAT_IMG =
  'data:image/gif;base64,R0lGODlhMAAwAJECAAAAAEJCQv///////yH/C05FVFNDQVBFMi4wAwEAAAAh+QQJAQACACwAAAAAMAAwAAACdpSPqcvtD6NcYNpbr4Z5ewV0UvhRohOe5UE+6cq0carCgpzQuM3ut16zvRBAH+/XKQ6PvaQyCFs+mbnWlEq0FrGi15XZJSmxP8OTRj4DyWY1lKdmV8fyLL3eXOPn6D3f6BcoOEhYaHiImKi4yNjo+AgZKTl5WAAAIfkECQEAAgAsAAAAADAAMAAAAnyUj6nL7Q+jdCDWicF9G1vdeWICao05ciUVpkrZIqjLwCdI16s+5wfck+F8JOBiR/zZZAJk0mAsDp/KIHRKvVqb2KxTu/Vdvt/nGFs2V5Bpta3tBcKp8m5WWL/z5PpbtH/0B/iyNGh4iJiouMjY6PgIGSk5SVlpeYmZqVkAACH5BAkBAAIALAAAAAAwADAAAAJhlI+py+0Po5y02ouz3rz7D4biSJbmiabq6gCs4B5AvM7GTKv4buby7vsAbT9gZ4h0JYmZpXO4YEKeVCk0QkVUlw+uYovE8ibgaVBSLm1Pa3W194rL5/S6/Y7P6/f8vp9SAAAh+QQJAQACACwAAAAAMAAwAAACZZSPqcvtD6OctNqLs968+w+G4kiW5omm6ooALeCusAHHclyzQs3rOz9jAXuqIRFlPJ6SQWRSaIQOpUBqtfjEZpfMJqmrHIFtpbGze2ZywWu0aUwWEbfiZvQdD4sXuWUj7gPos1EAACH5BAkBAAIALAAAAAAwADAAAAJrlI+py+0Po5y02ouz3rz7D4ZiCIxUaU4Amjrr+rDg+7ojXTdyh+e7kPP0egjabGg0EIVImHLJa6KaUam1aqVynNNsUvPTQjO/J84cFA3RzlaJO2495TF63Y7P6/f8vv8PGCg4SFhoeIg4UQAAIfkEBQEAAgAsAAAAADAAMAAAAnaUj6nL7Q+jXGDaW6+GeXsFdFL4UaITnuVBPunKtHGqwoKc0LjN7rdes70QQB/v1ykOj72kMghbPpm51pRKtBaxoteV2SUpsT/Dk0Y+A8lmNZSnZlfH8iy93lzj5+g93+gXKDhIWGh4iJiouMjY6PgIGSk5eVgAADs=';

/*! JS Bat 2013 - v1.2 - Eric Grange - wwwindow.delphitools.info */
export function createBat(killCallback = () => {}) {
  const { random, pow, sqrt } = Math;
  const image = document.createElement('img');
  const div = document.createElement('div');
  const divStyle = div.style;

  let opacity = '0';
  let windowWidth = window.innerWidth * random();
  let windowHeight = window.innerHeight * random();

  div.classList.add('flying-bat');

  // Kill bat on click
  div.onmousedown = () => {
    div.remove();
    killCallback();
    playBatSound();
  };

  div.style.cursor = getAimCursorOverTarget();

  div.style.userSelect = 'none';

  divStyle.position = 'fixed';
  divStyle.left = '0';
  divStyle.top = '0';
  divStyle.opacity = '0';
  div.appendChild(image);
  image.src = FLYING_BAT_IMG;
  document.body.appendChild(div);

  function R(length: number, innerLength: number) {
    const min = Math.min(length + (random() - 0.5) * 400, innerLength - 50);

    return Math.max(min, 50);
  }

  function A() {
    // Stop flying once the bat was killed or removed (e.g. killAllBats)
    if (!div.isConnected) return;

    const x = R(windowWidth, window.innerWidth);
    const y = R(windowHeight, window.innerHeight);

    const timeout =
      5 * sqrt(pow(windowWidth - x, 2) + pow(windowHeight - y, 2));

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

    setTimeout(A, timeout);
  }

  setTimeout(A, random() * 3000);
}
