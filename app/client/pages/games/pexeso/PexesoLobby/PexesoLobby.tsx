import React, { useCallback, useMemo, useState } from 'react';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EGame } from 'common/types';
import { IPexesoGameOptions } from 'common/types/pexeso';

import PexesoGameOptions from 'client/pages/games/pexeso/PexesoLobby/components/PexesoGameOptions/PexesoGameOptions';
import Box from 'client/components/common/Box/Box';
import Lobby from 'client/components/Lobby/Lobby';
import DotSeparator from 'client/components/common/DotSeparator/DotSeparator';

import useLobby from 'client/hooks/useLobby';

const {
  games: {
    [EGame.PEXESO]: {
      defaultGameOptions,
    },
  },
} = GAMES_CONFIG;

const PexesoLobby: React.FC = () => {
  const [options, setOptions] = useState<IPexesoGameOptions>(defaultGameOptions);

  const {
    lobby,
    createRoom,
    enterRoom,
  } = useLobby<EGame.PEXESO>(EGame.PEXESO, options);

  const optionsBlock = useMemo(() => {
    return (
      <PexesoGameOptions
        options={options}
        onOptionsChange={setOptions}
      />
    );
  }, [options]);

  const renderRoomOptions = useCallback((roomOptions: IPexesoGameOptions) => {
    return (
      <Box>
        {roomOptions.set}
        <>
          <DotSeparator />

          {`по ${roomOptions.matchingCardsCount} совпадающих`}
        </>

        {roomOptions.differentCardsCount && (
          <>
            <DotSeparator />

            {`${roomOptions.differentCardsCount} разных`}
          </>
        )}

        {roomOptions.pickRandomImages && (
          <>
            <DotSeparator />

            случайные
          </>
        )}

        {roomOptions.useImageVariants && (
          <>
            <DotSeparator />

            вариативные
          </>
        )}
      </Box>
    );
  }, []);

  if (!lobby) {
    return null;
  }

  return (
    <Lobby
      game={EGame.PEXESO}
      rooms={lobby.rooms}
      options={optionsBlock}
      renderRoomOptions={renderRoomOptions}
      onEnterRoom={enterRoom}
      onCreateRoom={createRoom}
    />
  );
};

export default React.memo(PexesoLobby);
