import { useContext } from 'react';
import { MultiPlayerContext } from './_multi-player-context-definition';

export const useMultiPlayerContext = () => useContext(MultiPlayerContext);
