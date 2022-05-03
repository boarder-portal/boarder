export enum EPlayerPosition {
  BOTTOM = 'bottom',
  LEFT = 'left',
  TOP = 'top',
  RIGHT = 'right',
}

export default function getPlayerPosition(index: number, playersCount: number): EPlayerPosition {
  if (index === 0) {
    return EPlayerPosition.BOTTOM;
  }

  if (index === 1) {
    if (playersCount === 2) {
      return EPlayerPosition.TOP;
    }

    return EPlayerPosition.LEFT;
  }

  if (index === 2) {
    if (playersCount === 3) {
      return EPlayerPosition.RIGHT;
    }

    return EPlayerPosition.RIGHT;
  }

  return EPlayerPosition.RIGHT;
}
