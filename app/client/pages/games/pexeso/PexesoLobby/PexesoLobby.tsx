import React, { useCallback } from 'react';

import { EGame } from 'common/types/game';

import PexesoGameOptions from 'client/pages/games/pexeso/PexesoLobby/components/PexesoGameOptions/PexesoGameOptions';
import Lobby, { TRenderGameOptions, TRenderOptions } from 'client/components/Lobby/Lobby';
import DotSeparator from 'client/components/common/DotSeparator/DotSeparator';
import Flex from 'client/components/common/Flex/Flex';

const PexesoLobby: React.FC = () => {
  const renderOptions: TRenderOptions<EGame.PEXESO> = useCallback((options, changeOptions) => {
    return <PexesoGameOptions options={options} onOptionsChange={changeOptions} />;
  }, []);

  const renderGameOptions: TRenderGameOptions<EGame.PEXESO> = useCallback((options) => {
    return (
      <Flex>
        {options.set}
        <>
          <DotSeparator />

          {`по ${options.matchingCardsCount} совпадающих`}
        </>

        {options.differentCardsCount && (
          <>
            <DotSeparator />

            {`${options.differentCardsCount} разных`}
          </>
        )}

        {options.pickRandomImages && (
          <>
            <DotSeparator />
            случайные
          </>
        )}

        {options.useImageVariants && (
          <>
            <DotSeparator />
            вариативные
          </>
        )}
      </Flex>
    );
  }, []);

  return <Lobby game={EGame.PEXESO} renderOptions={renderOptions} renderGameOptions={renderGameOptions} />;
};

export default React.memo(PexesoLobby);
