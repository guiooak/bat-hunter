import { useState } from 'react';
import { Button } from 'src/components';
import {
  isMutedStateLocalStorage,
  setBackgroundMusicMute,
} from 'src/services/audio-service';
import './music-toggle.scss';
import { setLocalStorageValue } from 'src/services/local-storage-service';

export function MusicToggle() {
  const isMutedLocalStorage = isMutedStateLocalStorage();

  const [isMuted, setIsMuted] = useState(isMutedLocalStorage);

  function onClick() {
    setBackgroundMusicMute(!isMuted);

    setIsMuted(!isMuted);
    setLocalStorageValue('bh-background-music-muted', !isMuted);
  }

  return (
    <div className="music-toggle">
      <Button kind="tertiary" onClick={onClick}>
        {isMuted ? '🔇' : '🔊'}
      </Button>
    </div>
  );
}
