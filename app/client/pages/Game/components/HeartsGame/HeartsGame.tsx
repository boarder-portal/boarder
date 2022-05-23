import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';
import ArrowLeft from '@material-ui/icons/ArrowLeft';
import ArrowRight from '@material-ui/icons/ArrowRight';
import classNames from 'classnames';

import { EGameClientEvent, EHandStage, EPassDirection, IPlayer } from 'common/types/hearts';
import { ESuit } from 'common/types/cards';
import { EGame } from 'common/types/game';

import { isDeuceOfClubs } from 'common/utilities/hearts';
import getPlayerPosition from 'client/pages/Game/components/HeartsGame/utilities/getPlayerPosition';

import Player from 'client/pages/Game/components/HeartsGame/components/Player/Player';

import userAtom from 'client/atoms/userAtom';
import { IGameProps } from 'client/pages/Game/Game';

import styles from './HeartsGame.pcss';

const HeartsGame: React.FC<IGameProps<EGame.HEARTS>> = (props) => {
  const { io, gameInfo } = props;

  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(-1);
  const [stage, setStage] = useState<EHandStage>(EHandStage.PASS);
  const [heartsEnteredPlay, setHeartsEnteredPlay] = useState(false);
  const [playedSuit, setPlayedSuit] = useState<ESuit | null>(null);
  const [isFirstTurn, setIsFirstTurn] = useState(true);
  const [passDirection, setPassDirection] = useState<EPassDirection>(EPassDirection.NONE);
  const user = useRecoilValue(userAtom);

  const player = useMemo(() => players.find(({ login }) => login === user?.login), [players, user]);

  const sortedPlayers = useMemo(() => {
    if (!player) {
      return [];
    }

    const playerIndex = players.indexOf(player);

    return [player, ...players.slice(playerIndex + 1), ...players.slice(0, playerIndex)];
  }, [player, players]);

  const selectCard = useCallback(
    (cardIndex: number) => {
      io.emit(EGameClientEvent.CHOOSE_CARD, cardIndex);
    },
    [io],
  );

  const directionBlock = useMemo(() => {
    return passDirection === EPassDirection.LEFT ? (
      <ArrowLeft className={styles.direction} />
    ) : (
      <ArrowRight className={styles.direction} />
    );
  }, [passDirection]);

  useEffect(() => {
    console.log(gameInfo);

    batchedUpdates(() => {
      setPlayers(gameInfo.players);
      setActivePlayerIndex(gameInfo.hand?.turn?.activePlayerIndex ?? -1);
      setStage(gameInfo.hand?.stage ?? EHandStage.PASS);
      setHeartsEnteredPlay(gameInfo.hand?.heartsEnteredPlay ?? false);
      setPlayedSuit(
        gameInfo.hand?.turn
          ? gameInfo.players[gameInfo.hand.turn.startPlayerIndex].data.turn?.playedCard?.suit ?? null
          : null,
      );
      setIsFirstTurn(gameInfo.players.some(({ data }) => isDeuceOfClubs(data.turn?.playedCard)) ?? false);
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

      {stage === EHandStage.PASS && directionBlock}
    </div>
  );
};

export default React.memo(HeartsGame);
