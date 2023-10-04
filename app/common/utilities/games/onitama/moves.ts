import { ALL_CARDS } from 'common/constants/games/onitama';

import { Coords } from 'common/types';
import { Board, CardType, PlayerColor } from 'common/types/games/onitama';

export interface GetLegalMovesOptions {
  from: Coords;
  card: CardType;
  board: Board;
  playerColor: PlayerColor;
}

export function getLegalMoves(options: GetLegalMovesOptions): Coords[] {
  const { from, card, board, playerColor } = options;

  const cells: Coords[] = [];
  const isFlipped = playerColor === PlayerColor.RED;

  ALL_CARDS[card].forEach(([y, x]) => {
    const toCell: Coords = {
      x: from.x + x * (isFlipped ? -1 : 1),
      y: from.y + y * (isFlipped ? -1 : 1),
    };

    if (
      toCell.x > -1 &&
      toCell.x < 5 &&
      toCell.y > -1 &&
      toCell.y < 5 &&
      board[toCell.y][toCell.x]?.color !== playerColor
    ) {
      cells.push(toCell);
    }
  });

  return cells;
}
