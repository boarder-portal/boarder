import React, { FC, memo } from 'react';

import { EGame } from 'common/types/game';

import Flex from 'client/components/common/Flex/Flex';
import DotSeparator from 'client/components/common/DotSeparator/DotSeparator';

import { IGameOptionsProps } from 'client/pages/Lobby/Lobby';

const PexesoGameOptions: FC<IGameOptionsProps<EGame.PEXESO>> = (props) => {
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
