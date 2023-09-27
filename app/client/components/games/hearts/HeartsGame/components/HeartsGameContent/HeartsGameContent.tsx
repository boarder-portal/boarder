import classNames from 'classnames';
import { FC, memo, useCallback, useEffect, useMemo } from 'react';

import { GameType } from 'common/types/game';
import { GameClientEventType, HandStage, PassDirection } from 'common/types/games/hearts';

import getPlayerPosition from 'client/components/games/hearts/HeartsGame/components/HeartsGameContent/utilities/getPlayerPosition';
import getPlayedSuit from 'common/utilities/games/hearts/getPlayedSuit';
import getIsFirstTurn from 'common/utilities/games/hearts/isFirstTurn';

import usePlayer from 'client/hooks/usePlayer';

import ArrowLeftIcon from 'client/components/common/icons/ArrowLeftIcon/ArrowLeftIcon';
import ArrowRightIcon from 'client/components/common/icons/ArrowRightIcon/ArrowRightIcon';
import { GameContentProps } from 'client/components/game/Game/Game';
import GameContent from 'client/components/game/GameContent/GameContent';
import Player from 'client/components/games/hearts/HeartsGame/components/HeartsGameContent/components/Player/Player';

import styles from './HeartsGameContent.module.scss';

const HeartsGameContent: FC<GameContentProps<GameType.HEARTS>> = (props) => {
  const {
    io,
    gameInfo,
    gameInfo: { players, hand, passDirection },
  } = props;

  const player = usePlayer(players);

  const activePlayerIndex = hand?.turn?.activePlayerIndex ?? -1;
  const stage = hand?.stage ?? HandStage.PASS;
  const heartsEnteredPlay = hand?.heartsEnteredPlay ?? false;
  const playedSuit = getPlayedSuit(gameInfo);
  const isFirstTurn = getIsFirstTurn(gameInfo);

  const sortedPlayers = useMemo(() => {
    if (!player) {
      return [];
    }

    const playerIndex = players.indexOf(player);

    return [player, ...players.slice(playerIndex + 1), ...players.slice(0, playerIndex)];
  }, [player, players]);

  const selectCard = useCallback(
    (cardIndex: number) => {
      io.emit(GameClientEventType.CHOOSE_CARD, cardIndex);
    },
    [io],
  );

  const directionBlock = useMemo(() => {
    return passDirection === PassDirection.LEFT ? (
      <ArrowLeftIcon className={styles.direction} />
    ) : (
      <ArrowRightIcon className={styles.direction} />
    );
  }, [passDirection]);

  useEffect(() => {
    console.log(gameInfo);
  }, [gameInfo]);

  return (
    <GameContent>
      <div className={styles.root}>
        {sortedPlayers.map((localPlayer, index) => {
          const position = getPlayerPosition(index, players.length);

          return (
            <Player
              key={localPlayer.login}
              className={classNames(styles.player, styles[position])}
              player={localPlayer}
              position={position}
              isActive={localPlayer.index === activePlayerIndex}
              stage={stage}
              playedSuit={playedSuit}
              heartsEnteredPlay={heartsEnteredPlay}
              isOwnHand={localPlayer.login === player?.login}
              isFirstTurn={isFirstTurn}
              onSelectCard={selectCard}
            />
          );
        })}

        {stage === HandStage.PASS && directionBlock}
      </div>
    </GameContent>
  );
};

export default memo(HeartsGameContent);
