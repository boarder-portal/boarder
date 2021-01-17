import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGame } from 'common/types/game';

const {
  games: {
    [EGame.SURVIVAL_ONLINE]: {
      viewSize,
    },
  },
} = GAMES_CONFIG;

export default function getCellScreenSize(containerEl: HTMLDivElement) {
  const cellWidth = containerEl.offsetWidth / viewSize.width;
  const cellHeight = containerEl.offsetHeight / viewSize.height;

  return Math.floor(Math.min(cellWidth, cellHeight));
}
