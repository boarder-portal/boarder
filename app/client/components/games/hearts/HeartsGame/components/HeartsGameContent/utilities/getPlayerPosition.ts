export enum PlayerPosition {
  BOTTOM = 'bottom',
  LEFT = 'left',
  TOP = 'top',
  RIGHT = 'right',
}

export default function getPlayerPosition(index: number, playersCount: number): PlayerPosition {
  if (index === 0) {
    return PlayerPosition.BOTTOM;
  }

  if (index === 1) {
    if (playersCount === 2) {
      return PlayerPosition.TOP;
    }

    return PlayerPosition.LEFT;
  }

  if (index === 2) {
    if (playersCount === 3) {
      return PlayerPosition.RIGHT;
    }

    return PlayerPosition.TOP;
  }

  return PlayerPosition.RIGHT;
}
