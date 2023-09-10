import React, { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import DotSeparator from 'client/components/common/DotSeparator/DotSeparator';
import Flex from 'client/components/common/Flex/Flex';

import { GameOptionsProps } from 'client/pages/Lobby/Lobby';

const PexesoGameOptions: FC<GameOptionsProps<GameType.PEXESO>> = (props) => {
  const { options } = props;

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
};

export default memo(PexesoGameOptions);
