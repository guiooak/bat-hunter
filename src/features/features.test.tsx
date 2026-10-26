import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from 'src/test/render';
import * as audio from 'src/services/audio-service';
import { DifficultyPicker } from 'src/features/difficulty-picker';
import { MusicToggle } from 'src/features/music-toggle';
import { SignInModal } from 'src/features/sign-in-modal';

describe('DifficultyPicker', () => {
  it('changes the difficulty, with no legend in the easy mode', async () => {
    const onChange = vi.fn();
    renderWithContext(<DifficultyPicker value="easy" onChange={onChange} />);

    expect(
      screen.queryByRole('list', { name: 'Hard mode targets' })
    ).toBeNull();
    await userEvent.click(screen.getByRole('radio', { name: 'Hard' }));
    expect(onChange).toHaveBeenCalledWith('hard');
  });

  it('lists the hard mode targets with their points', () => {
    renderWithContext(
      <DifficultyPicker value="hard" readOnly note="Host picks" />
    );

    const legend = screen.getByRole('list', { name: 'Hard mode targets' });
    expect(legend).toHaveTextContent('+1+3+10−5');
    expect(screen.getByAltText('Owl')).toHaveAttribute(
      'src',
      '/images/owl.svg'
    );
    expect(screen.getByText('−5')).toHaveClass('difficulty-picker__negative');
    expect(screen.getByText('+3')).not.toHaveClass(
      'difficulty-picker__negative'
    );
    expect(screen.getByText('Host picks')).toBeInTheDocument();
  });
});

describe('MusicToggle', () => {
  it('mutes and unmutes the music, remembering the choice', async () => {
    const setMute = vi.spyOn(audio, 'setBackgroundMusicMute');
    renderWithContext(<MusicToggle />);

    await userEvent.click(screen.getByRole('button', { name: '🔊' }));
    expect(setMute).toHaveBeenLastCalledWith(true);
    expect(localStorage.getItem('bh-background-music-muted')).toBe('true');

    await userEvent.click(screen.getByRole('button', { name: '🔇' }));
    expect(setMute).toHaveBeenLastCalledWith(false);
    expect(localStorage.getItem('bh-background-music-muted')).toBe('false');
  });

  it('starts muted if the player muted it before', () => {
    localStorage.setItem('bh-background-music-muted', 'true');
    renderWithContext(<MusicToggle />);

    expect(screen.getByRole('button', { name: '🔇' })).toBeInTheDocument();
  });
});

describe('SignInModal', () => {
  it('invites to play and closes after signing in', async () => {
    const onClose = vi.fn();
    renderWithContext(<SignInModal open onClose={onClose} />);

    expect(screen.getByText('Come and play!')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Continue with Google' })
    );
    expect(onClose).toHaveBeenCalled();
  });
});
