import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import classNames from 'classnames';

import { ALL_CARDS } from 'common/constants/games/onitama';

import { ECardType, EGameClientEvent, EPlayerColor, IMovePieceEvent, IPlayer, TBoard } from 'common/types/onitama';
import { ICoords } from 'common/types';
import { EGame } from 'common/types/game';

import { equalsCoords, equalsCoordsCb } from 'common/utilities/coords';

import GameEnd from 'client/pages/Game/components/GameEnd/GameEnd';
import OnitamaPlayer from 'client/pages/Game/components/OnitamaGame/OnitamaPlayer';
import Flex from 'client/components/common/Flex/Flex';

import userAtom from 'client/atoms/userAtom';
import { IGameProps } from 'client/pages/Game/Game';

import styles from './OnitamaGame.pcss';

const getLegalMoves = (from: ICoords, card: ECardType, board: TBoard, player: IPlayer): ICoords[] => {
  const cells: ICoords[] = [];
  const isFlipped = player.data.color === EPlayerColor.RED;

  ALL_CARDS[card].forEach(([y, x]) => {
    const toCell: ICoords = {
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

const OnitamaGame: React.FC<IGameProps<EGame.ONITAMA>> = (props) => {
  const { io, gameInfo, isGameEnd } = props;

  const [board, setBoard] = useState<TBoard>([]);
  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(-1);
  const [fifthCard, setFifthCard] = useState<ECardType>(ECardType.TIGER);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(-1);
  const [selectedFrom, setSelectedFrom] = useState<ICoords | null>(null);
  const [legalMoves, setLegalMoves] = useState<ICoords[]>([]);
  const [player, setPlayer] = useState<IPlayer | null>(null);

  const user = useRecoilValue(userAtom);
  const isFlipped = player?.data.color === EPlayerColor.RED;

  const handleCellClick = (cell: ICoords) => {
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
      const movePieceEvent: IMovePieceEvent = {
        from: selectedFrom,
        to: cell,
        cardIndex: selectedCardIndex,
      };

      io.emit(EGameClientEvent.MOVE_PIECE, movePieceEvent);
    }
  };

  const handleCardClick = useCallback(
    (card: ECardType) => {
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
    if (!user) {
      return;
    }

    console.log(gameInfo);

    const player = gameInfo.players.find(({ login }) => login === user.login) || null;

    setBoard(gameInfo.board);
    setPlayers(gameInfo.players);
    setActivePlayerIndex(gameInfo.activePlayerIndex);
    setFifthCard(gameInfo.fifthCard);
    setPlayer(player);
    setSelectedCardIndex(-1);
    setSelectedFrom(null);
    setLegalMoves([]);
  }, [gameInfo, user]);

  if (isGameEnd) {
    return <GameEnd></GameEnd>;
  }

  if (!board.length || !players.length) {
    return null;
  }

  const topPlayer = players[isFlipped ? 0 : 1];
  const bottomPlayer = players[isFlipped ? 1 : 0];

  return (
    <Flex className={styles.root} direction="column" between={2} alignItems="flexStart">
      <OnitamaPlayer
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

      <OnitamaPlayer
        player={bottomPlayer}
        fifthCard={fifthCard}
        isActive={bottomPlayer.index === activePlayerIndex}
        isFlipped={false}
        selectedCardIndex={selectedCardIndex}
        onCardClick={handleCardClick}
      />
    </Flex>
  );
};

export default React.memo(OnitamaGame);
