import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import { renderWithContext } from 'src/test/render';
import * as audio from 'src/services/audio-service';
import type { BatType } from 'src/services/bat-types';

type BatOptions = { type: BatType; onHit: (t: BatType) => void };
const bats = vi.hoisted(() => ({ created: [] as BatOptions[] }));
vi.mock('src/services/fly-engine-service', () => ({
  FLYING_BAT_IMG: 'bat.gif',
  createBat: (options: BatOptions) => {
    bats.created.push(options);
    const div = document.createElement('div');
    div.className = 'flying-bat';
    document.body.appendChild(div);
  },
}));

import { SinglePlayerDashboard } from '.';

const click = (name: string) =>
  act(() => fireEvent.click(screen.getByRole('button', { name })));
const summary = () =>
  document.querySelector('.bh-game-panel__summary')!.textContent;

beforeEach(() => {
  bats.created.length = 0;
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe('SinglePlayerDashboard', () => {
  it('free play: send bats, hit them and see the score', () => {
    renderWithContext(<SinglePlayerDashboard />);
    expect(screen.getByText('Free Play!')).toBeInTheDocument();

    click('Send Bats');
    expect(bats.created).toHaveLength(10);
    expect(bats.created[0].type).toBe('normal');

    act(() => bats.created[0].onHit('normal'));
    expect(summary()).toBe('1Kills100Score100%Accuracy');
    expect(screen.getByText('Final Score').nextSibling).toHaveTextContent(
      '100'
    );
  });

  it('resets the score and cleans the bats', () => {
    renderWithContext(<SinglePlayerDashboard />);
    click('Send Bats');
    act(() => bats.created[0].onHit('normal'));

    click('Reset');
    click('Clean Bats');

    expect(summary()).toBe('0Kills0Score100%Accuracy');
    expect(document.querySelectorAll('.flying-bat')).toHaveLength(0);
  });

  it('remembers the difficulty and uses the hard mode bats', () => {
    renderWithContext(<SinglePlayerDashboard />);

    act(() => fireEvent.click(screen.getByRole('radio', { name: 'Hard' })));
    expect(localStorage.getItem('bh-difficulty')).toBe('"hard"');

    vi.spyOn(Math, 'random').mockReturnValue(0.95);
    click('Send Bats');
    expect(bats.created[0].type).toBe('owl');

    act(() => bats.created[0].onHit('owl'));
    expect(summary()).toBe('0Kills-500Score100%Accuracy');
  });

  it('starts with the saved difficulty, ignoring invalid values', () => {
    localStorage.setItem('bh-difficulty', '"hard"');
    const { unmount } = renderWithContext(<SinglePlayerDashboard />);
    expect(screen.getByRole('radio', { name: 'Hard' })).toBeChecked();
    unmount();

    localStorage.setItem('bh-difficulty', '"insane"');
    renderWithContext(<SinglePlayerDashboard />);
    expect(screen.getByRole('radio', { name: 'Easy' })).toBeChecked();
  });

  it('challenge: get ready, play 60 seconds with bats on their own, time is up', () => {
    const challengeMusic = vi.spyOn(audio, 'playChallengeBackgroundMusic');
    const music = vi.spyOn(audio, 'playBackgroundMusic');
    renderWithContext(<SinglePlayerDashboard />);
    click('Send Bats');

    click('Challenge');
    expect(screen.getByText('Get Ready!')).toBeInTheDocument();
    expect(document.querySelectorAll('.flying-bat')).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Send Bats' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled();

    bats.created.length = 0;
    click('Start');
    expect(challengeMusic).toHaveBeenCalled();
    expect(bats.created).toHaveLength(30);
    expect(screen.queryByRole('button', { name: 'Send Bats' })).toBeNull();
    expect(screen.queryByRole('radiogroup')).toBeNull();
    expect(screen.getByRole('button', { name: 'Close' })).toBeDisabled();
    expect(screen.getByText('60s')).toBeInTheDocument();

    act(() => bats.created[0].onHit('normal'));
    expect(summary()).toContain('1Kills');

    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByText("Time's Up!")).toBeInTheDocument();
    expect(music).toHaveBeenCalled();
    expect(document.querySelectorAll('.flying-bat')).toHaveLength(0);
    expect(summary()).toContain('1Kills');

    click('Challenge');
    expect(screen.getByText('Get Ready!')).toBeInTheDocument();
    click('Free Play');
    expect(screen.getByText('Free Play!')).toBeInTheDocument();
  });

  it('a challenge can be cancelled, and Free Play follows the end', () => {
    renderWithContext(<SinglePlayerDashboard />);
    click('Challenge');
    click('Start');

    click('Cancel');
    expect(screen.getByText("Time's Up!")).toBeInTheDocument();

    click('Free Play');
    expect(screen.getByText('Free Play!')).toBeInTheDocument();
  });

  it('hits during Get Ready do not count', () => {
    renderWithContext(<SinglePlayerDashboard />);
    click('Send Bats');
    const bat = bats.created[0];

    click('Challenge');
    act(() => bat.onHit('normal'));

    expect(summary()).toBe('0Kills0Score100%Accuracy');
  });
});

describe('single-player parts on their own', () => {
  it('counts a shot on target in game mode', async () => {
    const gameService = await import('src/services/game-service');
    const shotService = await import('src/services/shot-service');
    vi.spyOn(gameService, 'getIsGameModeOn').mockReturnValue(true);
    vi.spyOn(shotService, 'isShotEnabled').mockReturnValue(true);
    renderWithContext(<SinglePlayerDashboard />);

    act(() =>
      document.body.onpointerdown!(new MouseEvent('pointerdown') as never)
    );

    expect(summary()).toBe('0Kills0Score0%Accuracy');
  });

  it('the parts work without their callbacks', async () => {
    const { SinglePlayerDashboardActions } = await import(
      './_single-player-dashboard-actions'
    );
    const { SinglePlayerDashboardScore } = await import(
      './_single-player-dashboard-score'
    );
    const { SinglePlayerDashboardChallenge } = await import(
      './_single-player-dashboard-challenge'
    );

    const actions = renderWithContext(<SinglePlayerDashboardActions />);
    click('Clean Bats');
    actions.unmount();

    const score = renderWithContext(
      <SinglePlayerDashboardScore
        killCounter={1}
        finalScore={100}
        accuracy={100}
        resetDisabled={false}
        sendBatDisabled={false}
        sendBatHidden={false}
        onCreateBat={undefined!}
        onResetScore={undefined!}
      />
    );
    click('Reset');
    click('Send Bats');
    score.unmount();

    renderWithContext(
      <SinglePlayerDashboardChallenge
        difficulty="easy"
        onDifficultyChange={vi.fn()}
        currentGameStateFull={undefined!}
        onCreateBat={undefined!}
        setIsScoreEnabled={undefined!}
        onResetScore={undefined!}
      />
    );
    click('Challenge');
    expect(screen.getByText('Free Play!')).toBeInTheDocument();
  });

  it('a running challenge spawns bats even without onCreateBat', async () => {
    const { SinglePlayerDashboardChallenge } = await import(
      './_single-player-dashboard-challenge'
    );

    renderWithContext(
      <SinglePlayerDashboardChallenge
        difficulty="easy"
        onDifficultyChange={vi.fn()}
        currentGameStateFull={['CHALLENGE_IN_PROGRESS', vi.fn()]}
        onCreateBat={undefined!}
        setIsScoreEnabled={vi.fn()}
        onResetScore={vi.fn()}
      />
    );

    expect(screen.getByText('60s')).toBeInTheDocument();
  });
});
