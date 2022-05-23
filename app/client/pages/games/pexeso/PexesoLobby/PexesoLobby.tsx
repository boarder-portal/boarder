import React, { useCallback, useMemo, useState } from 'react';

import { DEFAULT_GAME_OPTIONS } from 'common/constants/games/pexeso';

import { IGameOptions } from 'common/types/pexeso';
import { EGame } from 'common/types/game';

import PexesoGameOptions from 'client/pages/games/pexeso/PexesoLobby/components/PexesoGameOptions/PexesoGameOptions';
import Lobby from 'client/components/Lobby/Lobby';
import DotSeparator from 'client/components/common/DotSeparator/DotSeparator';
import Flex from 'client/components/common/Flex/Flex';

import useLobby from 'client/hooks/useLobby';

const PexesoLobby: React.FC = () => {
  const [options, setOptions] = useState<IGameOptions>(DEFAULT_GAME_OPTIONS);

  const { lobby, createGame, enterGame } = useLobby(EGame.PEXESO, options);

  const optionsBlock = useMemo(() => {
    return <PexesoGameOptions options={options} onOptionsChange={setOptions} />;
  }, [options]);

  const renderGameOptions = useCallback((gameOptions: IGameOptions) => {
    return (
      <Flex>
        {gameOptions.set}
        <>
          <DotSeparator />

          {`по ${gameOptions.matchingCardsCount} совпадающих`}
        </>

        {gameOptions.differentCardsCount && (
          <>
            <DotSeparator />

            {`${gameOptions.differentCardsCount} разных`}
          </>
        )}

        {gameOptions.pickRandomImages && (
          <>
            <DotSeparator />
            случайные
          </>
        )}

        {gameOptions.useImageVariants && (
          <>
            <DotSeparator />
            вариативные
          </>
        )}
      </Flex>
    );
  }, []);

  if (!lobby) {
    return null;
  }

  return (
    <Lobby
      game={EGame.PEXESO}
      games={lobby.games}
      options={optionsBlock}
      renderGameOptions={renderGameOptions}
      onEnterGame={enterGame}
      onCreateGame={createGame}
    />
  );
};

export default React.memo(PexesoLobby);
