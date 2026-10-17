import { getLocalStorageValue } from './local-storage-service';

const shotSoundPath = '/sound/shot-sound.mp3';

const batSounds = [
  '/sound/bat-sound-1.mp3',
  '/sound/bat-sound-2.mp3',
  '/sound/bat-sound-3.mp3',
  '/sound/bat-sound-4.mp3',
];
const backgroundMusicPath = '/sound/background-music.mp3';
const challengeBackgroundMusicPath = '/sound/challenge-background-music.mp3';

const backgroundAudioSingleton = new Audio(backgroundMusicPath);
const backgroundMusicVolume = 0.05;

setInitialAudioDetails(backgroundAudioSingleton);

function setInitialAudioDetails(audioInstance: HTMLAudioElement) {
  const isMuted = isMutedStateLocalStorage();

  audioInstance.loop = true;
  audioInstance.currentTime = 0;
  audioInstance.volume = backgroundMusicVolume;
  audioInstance.muted = isMuted;
}

export function isMutedStateLocalStorage() {
  return !!getLocalStorageValue('bh-background-music-muted');
}

export function setBackgroundMusicMute(value: boolean) {
  backgroundAudioSingleton.muted = value;
}

export function playBackgroundMusic() {
  backgroundAudioSingleton.src = backgroundMusicPath;
  backgroundAudioSingleton.play();
}

export function playChallengeBackgroundMusic() {
  backgroundAudioSingleton.src = challengeBackgroundMusicPath;
  backgroundAudioSingleton.play();
}

export function pauseAllBackgroundMusic() {
  backgroundAudioSingleton.pause();
}

function playSound(volume: number, audioPath: string) {
  const audio = new Audio(audioPath);
  audio.volume = volume;
  audio.play();
}

export function playShotSound() {
  playSound(0.3, shotSoundPath);
}

export function playBatSound() {
  const randomBatSound =
    batSounds[Math.floor(Math.random() * batSounds.length)];

  playSound(1, randomBatSound);
}
