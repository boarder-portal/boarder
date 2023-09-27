import classNames from 'classnames';
import { FC, memo, useCallback, useEffect, useState } from 'react';

import { Coords } from 'common/types';
import { GameType } from 'common/types/game';
import { CardType, GameClientEventType, MovePieceEvent, PlayerColor } from 'common/types/games/onitama';

import { equalsCoords, equalsCoordsCb } from 'common/utilities/coords';
import { getLegalMoves } from 'common/utilities/games/onitama/moves';

import usePlayer from 'client/hooks/usePlayer';

import Flex from 'client/components/common/Flex/Flex';
import { GameContentProps } from 'client/components/game/Game/Game';
import GameContent from 'client/components/game/GameContent/GameContent';
import Player from 'client/components/games/onitama/OnitamaGame/components/OnitamaGameContent/components/Player/Player';

import styles from './OnitamaGameContent.module.scss';

const OnitamaGameContent: FC<GameContentProps<GameType.ONITAMA>> = (props) => {
  const {
    io,
    gameInfo,
    gameInfo: { board, players, activePlayerIndex },
  } = props;

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
        setLegalMoves(
          getLegalMoves({
            from: cell,
            card: player.data.cards[selectedCardIndex],
            board,
            player,
          }),
        );
      }
    } else if (selectedFrom && legalMoves.some(equalsCoordsCb(cell))) {
      const movePieceEvent: MovePieceEvent = {
        from: selectedFrom,
        to: cell,
        cardIndex: selectedCardIndex,
      };

      io.emit(GameClientEventType.MOVE_PIECE, movePieceEvent);

      setSelectedCardIndex(-1);
      setSelectedFrom(null);
      setLegalMoves([]);
    }
  };

  const handleCardClick = useCallback(
    (card: CardType) => {
      if (player?.index === activePlayerIndex) {
        const selectedCardIndex = player.data.cards.indexOf(card);

        setSelectedCardIndex(selectedCardIndex);

        if (selectedFrom) {
          setLegalMoves(
            getLegalMoves({
              from: selectedFrom,
              card: player.data.cards[selectedCardIndex],
              board,
              player,
            }),
          );
        }
      }
    },
    [activePlayerIndex, board, player, selectedFrom],
  );

  useEffect(() => {
    console.log(gameInfo);
  }, [gameInfo]);

  const topPlayer = players[isFlipped ? 0 : 1];
  const bottomPlayer = players[isFlipped ? 1 : 0];

  return (
    <GameContent>
      <Flex className={styles.root} direction="column" between={2} alignItems="flexStart">
        <Player player={topPlayer} isActive={topPlayer.index === activePlayerIndex} isFlipped selectedCardIndex={-1} />

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
