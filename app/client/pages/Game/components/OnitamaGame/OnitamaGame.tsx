import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';
import { useRecoilValue } from 'recoil';

import { ALL_CARDS } from 'common/constants/games/onitama';

import {
  ECardType,
  EGameEvent,
  EPlayerColor,
  IGameInfoEvent,
  IMovePieceEvent,
  IPlayer,
  TBoard,
} from 'common/types/onitama';
import { ICoords } from 'common/types';

import { equalsCoords, equalsCoordsCb } from 'common/utilities/coords';

import Box from 'client/components/common/Box/Box';
import GameEnd from 'client/pages/Game/components/GameEnd/GameEnd';
import OnitamaPlayer from 'client/pages/Game/components/OnitamaGame/OnitamaPlayer';

import userAtom from 'client/atoms/userAtom';

interface IOnitamaGameProps {
  io: SocketIOClient.Socket;
  isGameEnd: boolean;
}

const b = block('OnitamaGame');

const Root = styled(Box)`
  display: flex;

  .OnitamaGame {
    &__board {
      transform: scaleY(-1);

      &_isFlipped {
        transform: scaleX(-1);
      }
    }

    &__cell {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 70px;
      height: 70px;
      border: 1px solid black;

      &_isSelected {
        background-color: #7f7;
      }

      &_isLegalMove {
        background-color: #aaa;
      }
    }

    &__piece {
      position: relative;
      width: 50px;
      height: 50px;
      border-radius: 50%;

      &_isMaster::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background-color: #fe0;
      }
    }
  }
`;

const getLegalMoves = (
  from: ICoords,
  card: ECardType,
  board: TBoard,
  player: IPlayer,
): ICoords[] => {
  const cells: ICoords[] = [];
  const isFlipped = player.color === EPlayerColor.RED;

  ALL_CARDS[card].forEach(([y, x]) => {
    const toCell: ICoords = {
      x: from.x + x * (isFlipped ? -1 : +1),
      y: from.y + y * (isFlipped ? -1 : +1),
    };

    if (
      toCell.x > -1
      && toCell.x < 5
      && toCell.y > -1
      && toCell.y < 5
      && board[toCell.y][toCell.x]?.color !== player.color
    ) {
      cells.push(toCell);
    }
  });

  return cells;
};

const OnitamaGame: React.FC<IOnitamaGameProps> = (props) => {
  const { io, isGameEnd } = props;

  const [board, setBoard] = useState<TBoard>([]);
  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [fifthCard, setFifthCard] = useState<ECardType>(ECardType.TIGER);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(-1);
  const [selectedFrom, setSelectedFrom] = useState<ICoords | null>(null);
  const [legalMoves, setLegalMoves] = useState<ICoords[]>([]);
  const [player, setPlayer] = useState<IPlayer | null>(null);

  const user = useRecoilValue(userAtom);
  const isFlipped = player?.color === EPlayerColor.RED;

  const handleCellClick = (cell: ICoords) => {
    if (!player || !player.isActive) {
      return;
    }

    const piece = board[cell.y][cell.x];

    if (piece?.color === player.color) {
      setSelectedFrom(cell);

      if (selectedCardIndex !== -1) {
        setLegalMoves(getLegalMoves(
          cell,
          player.cards[selectedCardIndex],
          board,
          player,
        ));
      }
    } else if (selectedFrom && legalMoves.some(equalsCoordsCb(cell))) {
      const movePieceEvent: IMovePieceEvent = {
        from: selectedFrom,
        to: cell,
        cardIndex: selectedCardIndex,
      };

      io.emit(EGameEvent.MOVE_PIECE, movePieceEvent);
    }
  };

  const handleCardClick = useCallback((card: ECardType) => {
    if (player?.isActive) {
      const selectedCardIndex = player.cards.indexOf(card);

      setSelectedCardIndex(selectedCardIndex);

      if (selectedFrom) {
        setLegalMoves(getLegalMoves(
          selectedFrom,
          player.cards[selectedCardIndex],
          board,
          player,
        ));
      }
    }
  }, [board, player, selectedFrom]);

  useEffect(() => {
    io.emit(EGameEvent.GET_GAME_INFO);

    io.on(EGameEvent.GAME_INFO, (gameInfo: IGameInfoEvent) => {
      if (!user) {
        return;
      }

      const player = gameInfo.players.find(({ login }) => login === user.login) || null;

      setBoard(gameInfo.board);
      setPlayers(gameInfo.players);
      setFifthCard(gameInfo.fifthCard);
      setPlayer(player);
      setSelectedCardIndex(-1);
      setSelectedFrom(null);
      setLegalMoves([]);
    });

    return () => {
      io.off(EGameEvent.GAME_INFO);
    };
  }, [io, user]);

  if (isGameEnd) {
    return (
      <GameEnd>

      </GameEnd>
    );
  }

  if (!board.length || !players.length) {
    return null;
  }

  return (
    <Root className={b()} flex column between={10} alignItems="flex-start">
      <OnitamaPlayer
        player={players[isFlipped ? 0 : 1]}
        fifthCard={fifthCard}
        isFlipped
        selectedCardIndex={-1}
      />

      <Box
        className={b('board', { isFlipped })}
        between={2}
      >
        {board.map((row, y) => (
          <Box key={y} flex between={2}>
            {row.map((piece, x) => (
              <Box
                key={x}
                className={b('cell', {
                  isSelected: selectedFrom && equalsCoords({ x, y }, selectedFrom),
                  isLegalMove: legalMoves.some(equalsCoordsCb({ x, y })),
                })}
                data-cell={JSON.stringify({ x, y })}
                onClick={() => handleCellClick({ x, y })}
              >
                {piece && (
                  <div
                    className={b('piece', { isMaster: piece.isMaster })}
                    style={{
                      backgroundColor: piece.color,
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>
        ))}
      </Box>

      <OnitamaPlayer
        player={players[isFlipped ? 1 : 0]}
        fifthCard={fifthCard}
        isFlipped={false}
        selectedCardIndex={selectedCardIndex}
        onCardClick={handleCardClick}
      />
    </Root>
  );
};

export default React.memo(OnitamaGame);
