import classNames from 'classnames';
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';

import { GameType } from 'common/types/game';
import { Suit } from 'common/types/game/cards';
import { GameClientEventType, HandStage, PassDirection, Player as PlayerModel } from 'common/types/games/hearts';

import getPlayerPosition from 'client/pages/Game/components/HeartsGame/utilities/getPlayerPosition';
import getPlayedSuit from 'common/utilities/games/hearts/getPlayedSuit';
import getIsFirstTurn from 'common/utilities/games/hearts/isFirstTurn';

import usePlayer from 'client/hooks/usePlayer';

import ArrowLeftIcon from 'client/components/icons/ArrowLeftIcon/ArrowLeftIcon';
import ArrowRightIcon from 'client/components/icons/ArrowRightIcon/ArrowRightIcon';
import Player from 'client/pages/Game/components/HeartsGame/components/Player/Player';

import { GameProps } from 'client/pages/Game/Game';

import styles from './HeartsGame.module.scss';

const HeartsGame: FC<GameProps<GameType.HEARTS>> = (props) => {
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

    batchedUpdates(() => {
      setPlayers(gameInfo.players);
      setActivePlayerIndex(gameInfo.hand?.turn?.activePlayerIndex ?? -1);
      setStage(gameInfo.hand?.stage ?? HandStage.PASS);
      setHeartsEnteredPlay(gameInfo.hand?.heartsEnteredPlay ?? false);
      setPlayedSuit(getPlayedSuit(gameInfo));
      setIsFirstTurn(getIsFirstTurn(gameInfo));
      setPassDirection(gameInfo.passDirection);
    });
  }, [gameInfo]);

  if (!player) {
    return null;
  }

  return (
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
            isOwnHand={localPlayer === player}
            isFirstTurn={isFirstTurn}
            onSelectCard={selectCard}
          />
        );
      })}

      {stage === HandStage.PASS && directionBlock}
    </div>
  );
};

export default memo(HeartsGame);
