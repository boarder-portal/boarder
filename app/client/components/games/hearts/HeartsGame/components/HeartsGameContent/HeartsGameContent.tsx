import classNames from 'classnames';
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';

import { GameType } from 'common/types/game';
import { Suit } from 'common/types/game/cards';
import { GameClientEventType, HandStage, PassDirection, Player as PlayerModel } from 'common/types/games/hearts';

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
  const { io, gameInfo } = props;

  const [players, setPlayers] = useState<PlayerModel[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(-1);
  const [stage, setStage] = useState<HandStage>(HandStage.PASS);
  const [heartsEnteredPlay, setHeartsEnteredPlay] = useState(false);
  const [playedSuit, setPlayedSuit] = useState<Suit | null>(null);
  const [isFirstTurn, setIsFirstTurn] = useState(true);
  const [passDirection, setPassDirection] = useState<PassDirection>(PassDirection.NONE);

  const player = usePlayer(players);

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

    setPlayers(gameInfo.players);
    setActivePlayerIndex(gameInfo.hand?.turn?.activePlayerIndex ?? -1);
    setStage(gameInfo.hand?.stage ?? HandStage.PASS);
    setHeartsEnteredPlay(gameInfo.hand?.heartsEnteredPlay ?? false);
    setPlayedSuit(getPlayedSuit(gameInfo));
    setIsFirstTurn(getIsFirstTurn(gameInfo));
    setPassDirection(gameInfo.passDirection);
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
