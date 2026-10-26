import { getAimCursorRegular, ShotEventType } from './shot-service';
import { pauseAllBackgroundMusic, playBackgroundMusic } from './audio-service';
import { MatchType } from 'src/models/match-model';
import { buildArray } from './array-service';
import { BAT_TYPES, BatType } from './bat-types';

let isGameModeOn = false;

export const getIsGameModeOn = () => isGameModeOn;

export function enableBatGame() {
  isGameModeOn = true;
  playBackgroundMusic();

  document.body.style.cursor = getAimCursorRegular();
}

// The crosshair without a game: no music, no score (e.g. the 404 page)
export function enableAimOnly() {
  isGameModeOn = false;
  pauseAllBackgroundMusic();

  document.body.style.cursor = getAimCursorRegular();
}

// Right away, so the next page (maybe a game) can set its own cursor
export function disableAimOnly() {
  document.body.style.cursor = '';
}

export function disableBatGame() {
  isGameModeOn = false;
  pauseAllBackgroundMusic();

  setTimeout(() => {
    document.body.style.cursor = '';
  }, 200);
}

export function setBodyOnClick(cb: ((e: ShotEventType) => void) | null) {
  document.body.onpointerdown = cb;
}

export function calcAccuracy(shotCounter: number, killCounter: number) {
  if (!shotCounter) {
    return 100;
  }

  const raw = killCounter / shotCounter;
  return Math.round(raw * 100);
}

// Points times accuracy. Games saved before the hard mode have no points, and
// in the easy mode every kill is worth one point, so points fall back to kills.
export function calcFinalScore(
  shotCounter?: number,
  killCounter?: number,
  points?: number
) {
  const accuracy = calcAccuracy(shotCounter || 0, killCounter || 0);
  return accuracy * (points ?? killCounter ?? 0);
}

export function counterReducer(state: number, action: 'add' | 'reset') {
  return action === 'add' ? state + 1 : 0;
}

export function pointsReducer(state: number, action: number | 'reset') {
  return action === 'reset' ? 0 : state + action;
}

// A hit on an innocent costs points and is no kill, so its shot is a miss.
export function scoreHit(
  type: BatType,
  {
    addKill,
    addPoints,
  }: { addKill: () => void; addPoints: (points: number) => void }
) {
  const { points, innocent } = BAT_TYPES[type];

  if (!innocent) addKill();
  addPoints(points);
}

export function killAllBats() {
  document.querySelectorAll('.flying-bat').forEach((bat) => bat.remove());
}

export function findCurrentGame(match?: MatchType) {
  const games = match?.games;
  return (
    games && Object.values(games).find((game) => game.state !== 'GAME_CLOSED')
  );
}

export function findLastGame(match?: MatchType) {
  return buildArray(match?.games, 'DESC')[0];
}
