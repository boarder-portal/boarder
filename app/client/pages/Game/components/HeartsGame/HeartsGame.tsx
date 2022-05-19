import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';
import ArrowLeft from '@material-ui/icons/ArrowLeft';
import ArrowRight from '@material-ui/icons/ArrowRight';
import classNames from 'classnames';

import { EGameEvent, EHandStage, EPassDirection, IGame, IPlayer } from 'common/types/hearts';
import { ESuit } from 'common/types/cards';
import { EGame } from 'common/types/game';

import { isDeuceOfClubs } from 'common/utilities/hearts';
import getPlayerPosition from 'client/pages/Game/components/HeartsGame/utilities/getPlayerPosition';

import Box from 'client/components/common/Box/Box';
import Player from 'client/pages/Game/components/HeartsGame/components/Player/Player';

import userAtom from 'client/atoms/userAtom';
import { IGameProps } from 'client/pages/Game/Game';

import styles from './HeartsGame.pcss';

interface IHeartsGameProps extends IGameProps<EGame.HEARTS> {}

const HeartsGame: React.FC<IHeartsGameProps> = (props) => {
  const { io } = props;

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
      io.emit(EGameEvent.CHOOSE_CARD, cardIndex);
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
    io.emit(EGameEvent.GET_GAME_INFO);

    io.on(EGameEvent.GAME_INFO, (game: IGame) => {
      if (!user) {
        return;
      }

      console.log(EGameEvent.GAME_INFO, game);

      batchedUpdates(() => {
        setPlayers(game.players);
        setActivePlayerIndex(game.hand?.turn?.activePlayerIndex ?? -1);
        setStage(game.hand?.stage ?? EHandStage.PASS);
        setHeartsEnteredPlay(game.hand?.heartsEnteredPlay ?? false);
        setPlayedSuit(
          game.hand?.turn ? game.players[game.hand.turn.startPlayerIndex].data.turn?.playedCard?.suit ?? null : null,
        );
        setIsFirstTurn(game.players.some(({ data }) => isDeuceOfClubs(data.turn?.playedCard)) ?? false);
        setPassDirection(game.passDirection);
      });
    });

    return () => {
      io.off(EGameEvent.GET_GAME_INFO);
    };
  }, [io, user]);

  if (!player) {
    return null;
  }

  return (
    <Box className={styles.root}>
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
    </Box>
  );
};

export default React.memo(HeartsGame);
