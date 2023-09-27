import classNames from 'classnames';
import { FC, memo, useCallback, useEffect, useState } from 'react';

import { ALL_CARDS } from 'common/constants/games/onitama';

import { Coords } from 'common/types';
import { GameType } from 'common/types/game';
import {
  Board,
  CardType,
  GameClientEventType,
  MovePieceEvent,
  PlayerColor,
  Player as PlayerModel,
} from 'common/types/games/onitama';

import { equalsCoords, equalsCoordsCb } from 'common/utilities/coords';

import usePlayer from 'client/hooks/usePlayer';

import Flex from 'client/components/common/Flex/Flex';
import { GameContentProps } from 'client/components/game/Game/Game';
import GameEnd from 'client/components/game/Game/components/GameEnd/GameEnd';
import GameContent from 'client/components/game/GameContent/GameContent';
import Player from 'client/components/games/onitama/OnitamaGame/components/OnitamaGameContent/components/Player/Player';

import styles from './OnitamaGameContent.module.scss';

const getLegalMoves = (from: Coords, card: CardType, board: Board, player: PlayerModel): Coords[] => {
  const cells: Coords[] = [];
  const isFlipped = player.data.color === PlayerColor.RED;

  ALL_CARDS[card].forEach(([y, x]) => {
    const toCell: Coords = {
      x: from.x + x * (isFlipped ? -1 : +1),
      y: from.y + y * (isFlipped ? -1 : +1),
    };

    if (
      toCell.x > -1 &&
      toCell.x < 5 &&
      toCell.y > -1 &&
      toCell.y < 5 &&
      board[toCell.y][toCell.x]?.color !== player.data.color
    ) {
      cells.push(toCell);
    }
  });

  return cells;
};

const OnitamaGameContent: FC<GameContentProps<GameType.ONITAMA>> = (props) => {
  const { io, gameInfo, gameResult } = props;

  const [board, setBoard] = useState<Board>([]);
  const [players, setPlayers] = useState<PlayerModel[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(-1);
  const [fifthCard, setFifthCard] = useState<CardType>(CardType.TIGER);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(-1);
  const [selectedFrom, setSelectedFrom] = useState<Coords | null>(null);
  const [legalMoves, setLegalMoves] = useState<Coords[]>([]);

  const player = usePlayer(players);

  const isFlipped = player?.data.color === PlayerColor.RED;

  const handleCellClick = (cell: Coords) => {
    if (!player || player.index !== activePlayerIndex) {
      return;
    }

    const piece = board[cell.y][cell.x];

    if (piece?.color === player.data.color) {
      setSelectedFrom(cell);

      if (selectedCardIndex !== -1) {
        setLegalMoves(getLegalMoves(cell, player.data.cards[selectedCardIndex], board, player));
      }
    } else if (selectedFrom && legalMoves.some(equalsCoordsCb(cell))) {
      const movePieceEvent: MovePieceEvent = {
        from: selectedFrom,
        to: cell,
        cardIndex: selectedCardIndex,
      };

      io.emit(GameClientEventType.MOVE_PIECE, movePieceEvent);
    }
  };

  const handleCardClick = useCallback(
    (card: CardType) => {
      if (player?.index === activePlayerIndex) {
        const selectedCardIndex = player.data.cards.indexOf(card);

        setSelectedCardIndex(selectedCardIndex);

        if (selectedFrom) {
          setLegalMoves(getLegalMoves(selectedFrom, player.data.cards[selectedCardIndex], board, player));
        }
      }
    },
    [activePlayerIndex, board, player, selectedFrom],
  );

  useEffect(() => {
    console.log(gameInfo);

    setBoard(gameInfo.board);
    setPlayers(gameInfo.players);
    setActivePlayerIndex(gameInfo.activePlayerIndex);
    setFifthCard(gameInfo.fifthCard);
    setSelectedCardIndex(-1);
    setSelectedFrom(null);
    setLegalMoves([]);
  }, [gameInfo]);

  if (gameResult !== null) {
    return <GameEnd />;
  }

  if (!board.length || !players.length) {
    return null;
  }

  const topPlayer = players[isFlipped ? 0 : 1];
  const bottomPlayer = players[isFlipped ? 1 : 0];

  return (
    <GameContent>
      <Flex className={styles.root} direction="column" between={2} alignItems="flexStart">
        <Player
          player={topPlayer}
          fifthCard={fifthCard}
          isActive={topPlayer.index === activePlayerIndex}
          isFlipped
          selectedCardIndex={-1}
        />

        <Flex
          className={classNames(styles.board, {
            [styles.isFlipped]: isFlipped,
          })}
          direction="column"
          between={1}
        >
          {board.map((row, y) => (
            <Flex key={y} between={1}>
              {row.map((piece, x) => (
                <div
                  key={x}
                  className={classNames(styles.cell, {
                    [styles.isSelected]: selectedFrom && equalsCoords({ x, y }, selectedFrom),
                    [styles.isLegalMove]: legalMoves.some(equalsCoordsCb({ x, y })),
                  })}
                  data-cell={JSON.stringify({ x, y })}
                  onClick={() => handleCellClick({ x, y })}
                >
                  {piece && (
                    <div
                      className={classNames(styles.piece, {
                        [styles.isMaster]: piece.isMaster,
                      })}
                      style={{
                        backgroundColor: piece.color,
                      }}
                    />
                  )}
                </div>
              ))}
            </Flex>
          ))}
        </Flex>

        <Player
          player={bottomPlayer}
          fifthCard={fifthCard}
          isActive={bottomPlayer.index === activePlayerIndex}
          isFlipped={false}
          selectedCardIndex={selectedCardIndex}
          onCardClick={handleCardClick}
        />
      </Flex>
    </GameContent>
  );
};

export default memo(OnitamaGameContent);
