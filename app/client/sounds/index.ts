function createAudio(src: string): HTMLAudioElement | null {
  return typeof Audio === 'undefined' ? null : new Audio(src);
}

export const POP_SOUND = createAudio('/sounds/pop.wav');
export const HOVER_SOUND = createAudio('/sounds/hover.wav');
export const SELECT_SOUND = createAudio('/sounds/select.wav');
export const NEW_TURN = createAudio('/sounds/newTurn.wav');

export function playSound(sound: HTMLAudioElement | null): void {
  if (!sound) {
    return;
  }

  sound.pause();
  sound.currentTime = 0;
  sound.play().catch(() => {});
}
