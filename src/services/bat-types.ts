export type Difficulty = 'easy' | 'hard';

export type BatType = 'normal' | 'small' | 'golden' | 'owl';

type BatTypeConfig = {
  label: string;
  points: number;
  // Relative to the regular bat
  scale: number;
  speed: number;
  // Odds in the hard mode, out of the sum of every weight
  weight: number;
  // Leaves the screen after this many ms
  lifetime?: number;
  // Must not be hit: costs points and counts as a missed shot
  innocent?: boolean;
};

// Starting values, tune freely.
export const BAT_TYPES: Record<BatType, BatTypeConfig> = {
  normal: { label: 'Bat', points: 1, scale: 1, speed: 1, weight: 60 },
  small: { label: 'Small', points: 3, scale: 0.6, speed: 1.8, weight: 25 },
  golden: {
    label: 'Golden',
    points: 10,
    scale: 1,
    speed: 1.4,
    weight: 5,
    lifetime: 6000,
  },
  owl: {
    label: 'Owl',
    points: -5,
    scale: 1.1,
    speed: 0.8,
    weight: 10,
    innocent: true,
  },
};

export const BAT_TYPE_NAMES = Object.keys(BAT_TYPES) as BatType[];

export function isDifficulty(value: unknown): value is Difficulty {
  return value === 'easy' || value === 'hard';
}

// The easy mode is the classic game: regular bats only.
export function pickBatType(
  difficulty: Difficulty,
  random = Math.random
): BatType {
  if (difficulty === 'easy') return 'normal';

  const total = BAT_TYPE_NAMES.reduce((sum, t) => sum + BAT_TYPES[t].weight, 0);
  let roll = random() * total;

  for (const type of BAT_TYPE_NAMES) {
    roll -= BAT_TYPES[type].weight;
    if (roll < 0) return type;
  }

  return 'normal';
}
