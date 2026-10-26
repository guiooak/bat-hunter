import { beforeEach, describe, expect, it, vi } from 'vitest';

async function loadAudio() {
  vi.resetModules();
  return import('./audio-service');
}

describe('audio service', () => {
  beforeEach(() => {
    vi.mocked(HTMLMediaElement.prototype.play).mockClear();
    vi.mocked(HTMLMediaElement.prototype.pause).mockClear();
  });

  it('starts unmuted unless the player muted it before', async () => {
    const audio = await loadAudio();

    expect(audio.isMutedStateLocalStorage()).toBe(false);
  });

  it('remembers the muted state from local storage', async () => {
    localStorage.setItem('bh-background-music-muted', 'true');
    const audio = await loadAudio();

    expect(audio.isMutedStateLocalStorage()).toBe(true);
  });

  it('plays, switches and pauses the background music', async () => {
    const audio = await loadAudio();

    audio.playBackgroundMusic();
    audio.playChallengeBackgroundMusic();
    audio.setBackgroundMusicMute(true);
    audio.pauseAllBackgroundMusic();

    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);
  });

  it('plays the shot, bat and owl effects', async () => {
    const audio = await loadAudio();
    vi.spyOn(Math, 'random').mockReturnValue(0);

    audio.playShotSound();
    audio.playBatSound();
    audio.playOwlSound();

    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(3);
  });
});
