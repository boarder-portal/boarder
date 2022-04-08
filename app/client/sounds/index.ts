export const HOVER_SOUND = new Audio('/sounds/hover.wav');
export const SELECT_SOUND = new Audio('/sounds/select.wav');
export const NEW_TURN = new Audio('/sounds/newTurn.wav');

export function playSound(sound: HTMLAudioElement): void {
  sound.pause();
  sound.currentTime = 0;
  sound.play();
}
