import { GameType } from 'common/types/game';

export function createAudio(src: string, internal: boolean = true): HTMLAudioElement | null {
  return typeof Audio === 'undefined' ? null : new Audio(internal ? `/public${src}` : src);
}

export function createGameAudio(src: string, game?: GameType): HTMLAudioElement | null {
  return createAudio(`${game ? `/games/${game}` : '/game'}/sounds${src}`);
}

export const POP_SOUND = createGameAudio('/pop.wav');
export const HOVER_SOUND = createGameAudio('/hover.wav');
export const SELECT_SOUND = createGameAudio('/select.wav');
export const NEW_TURN = createGameAudio('/newTurn.wav');

export function playSound(sound: HTMLAudioElement | null): void {
  if (!sound) {
    return;
  }

  sound.pause();
  sound.currentTime = 0;
  sound.play().catch(() => {});
}
